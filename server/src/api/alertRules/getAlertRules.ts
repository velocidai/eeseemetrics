import { FastifyReply, FastifyRequest } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "../../db/postgres/postgres.js";
import { alertRules } from "../../db/postgres/schema.js";
import { getUserHasAccessToSite } from "../../lib/auth-utils.js";
import { getSitePlanTier, tierAtLeast } from "../../lib/tierUtils.js";

export async function getAlertRules(
  request: FastifyRequest<{ Params: { siteId: string } }>,
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

  try {
    const rules = await db
      .select()
      .from(alertRules)
      .where(eq(alertRules.siteId, siteId))
      .orderBy(alertRules.createdAt);

    return reply.send({ data: rules });
  } catch (error) {
    console.error("Error fetching alert rules:", error);
    return reply.status(500).send({ error: "Failed to fetch alert rules" });
  }
}
