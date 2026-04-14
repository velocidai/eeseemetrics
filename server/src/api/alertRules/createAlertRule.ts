import { FastifyReply, FastifyRequest } from "fastify";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { DateTime } from "luxon";
import { db } from "../../db/postgres/postgres.js";
import { alertRules, sites } from "../../db/postgres/schema.js";
import { getUserHasAccessToSite, getUserIdFromRequest } from "../../lib/auth-utils.js";
import { getSitePlanTier, tierAtLeast } from "../../lib/tierUtils.js";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  metric: z.enum(["sessions", "pageviews", "bounce_rate"]),
  operator: z.enum(["drops_below", "exceeds", "drops_by_more_than", "spikes_by_more_than"]),
  threshold: z.number().positive(),
});

export async function createAlertRule(
  request: FastifyRequest<{ Params: { siteId: string }; Body: z.infer<typeof bodySchema> }>,
  reply: FastifyReply
) {
  const siteId = parseInt(request.params.siteId, 10);
  if (isNaN(siteId)) return reply.status(400).send({ error: "Invalid site ID" });

  const hasAccess = await getUserHasAccessToSite(request, siteId);
  if (!hasAccess) return reply.status(403).send({ error: "Forbidden" });

  const tier = await getSitePlanTier(siteId);
  if (!tierAtLeast(tier, "pro")) {
    return reply.status(403).send({ error: "Custom alert rules require a Pro or Scale plan" });
  }

  // Validate request body early, before any business-logic DB queries
  const parsed = bodySchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Validation error", details: parsed.error.errors });
  }
  const body = parsed.data;

  // Look up the organizationId for this site
  // Note: getSitePlanTier() internally queries sites for organizationId; this is a second query.
  // For now, kept separate to maintain code clarity and reduce refactoring scope.
  const [site] = await db
    .select({ organizationId: sites.organizationId })
    .from(sites)
    .where(eq(sites.siteId, siteId))
    .limit(1);
  if (!site?.organizationId) return reply.status(404).send({ error: "Site not found" });

  // Get current user ID
  const createdBy = await getUserIdFromRequest(request);

  // Auto-generate name if not provided
  const operatorLabel: Record<string, string> = {
    drops_below: "drops below",
    exceeds: "exceeds",
    drops_by_more_than: "drops by more than",
    spikes_by_more_than: "spikes by more than",
  };
  const metricLabel: Record<string, string> = {
    sessions: "Sessions",
    pageviews: "Pageviews",
    bounce_rate: "Bounce rate",
  };
  const unit = body.operator === "drops_by_more_than" || body.operator === "spikes_by_more_than" ? "%" : "";
  const autoName = `${metricLabel[body.metric]} ${operatorLabel[body.operator]} ${body.threshold}${unit}`;

  try {
    const now = DateTime.utc().toISO();
    const [inserted] = await db
      .insert(alertRules)
      .values({
        siteId,
        organizationId: site.organizationId,
        createdBy,
        name: body.name ?? autoName,
        metric: body.metric,
        operator: body.operator,
        threshold: body.threshold,
        enabled: true,
        cooldownHours: 24,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return reply.status(201).send({ data: inserted });
  } catch (error) {
    console.error("Error creating alert rule:", error);
    return reply.status(500).send({ error: "Failed to create alert rule" });
  }
}
