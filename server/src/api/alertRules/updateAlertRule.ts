import { FastifyReply, FastifyRequest } from "fastify";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { DateTime } from "luxon";
import { db } from "../../db/postgres/postgres.js";
import { alertRules } from "../../db/postgres/schema.js";
import { getUserHasAccessToSite } from "../../lib/auth-utils.js";
import { getSitePlanTier, tierAtLeast } from "../../lib/tierUtils.js";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  metric: z.enum(["sessions", "pageviews", "bounce_rate"]).optional(),
  operator: z.enum(["drops_below", "exceeds", "drops_by_more_than", "spikes_by_more_than"]).optional(),
  threshold: z.number().positive().optional(),
  enabled: z.boolean().optional(),
});

export async function updateAlertRule(
  request: FastifyRequest<{
    Params: { siteId: string; ruleId: string };
    Body: z.infer<typeof bodySchema>;
  }>,
  reply: FastifyReply
) {
  const siteId = parseInt(request.params.siteId, 10);
  const ruleId = parseInt(request.params.ruleId, 10);
  if (isNaN(siteId) || isNaN(ruleId)) return reply.status(400).send({ error: "Invalid ID" });

  const hasAccess = await getUserHasAccessToSite(request, siteId);
  if (!hasAccess) return reply.status(403).send({ error: "Forbidden" });

  const tier = await getSitePlanTier(siteId);
  if (!tierAtLeast(tier, "pro")) {
    return reply.status(403).send({ error: "Custom alert rules require a Pro or Scale plan" });
  }

  const parsed = bodySchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: "Validation error", details: parsed.error.errors });
  }

  const updates = parsed.data;
  if (Object.keys(updates).length === 0) {
    return reply.status(400).send({ error: "No fields to update" });
  }

  try {
    const [updated] = await db
      .update(alertRules)
      .set({ ...updates, updatedAt: DateTime.utc().toISO() })
      .where(and(eq(alertRules.id, ruleId), eq(alertRules.siteId, siteId)))
      .returning();

    if (!updated) return reply.status(404).send({ error: "Rule not found" });

    return reply.send({ data: updated });
  } catch (error) {
    console.error("Error updating alert rule:", error);
    return reply.status(500).send({ error: "Failed to update alert rule" });
  }
}
