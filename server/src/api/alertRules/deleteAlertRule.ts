import { FastifyReply, FastifyRequest } from "fastify";
import { and, eq } from "drizzle-orm";
import { db } from "../../db/postgres/postgres.js";
import { alertRules } from "../../db/postgres/schema.js";
import { getUserHasAccessToSite } from "../../lib/auth-utils.js";
import { getSitePlanTier, tierAtLeast } from "../../lib/tierUtils.js";

export async function deleteAlertRule(
  request: FastifyRequest<{ Params: { siteId: string; ruleId: string } }>,
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

  try {
    const [deleted] = await db
      .delete(alertRules)
      .where(and(eq(alertRules.id, ruleId), eq(alertRules.siteId, siteId)))
      .returning({ id: alertRules.id });

    if (!deleted) return reply.status(404).send({ error: "Rule not found" });

    return reply.status(204).send();
  } catch (error) {
    console.error("Error deleting alert rule:", error);
    return reply.status(500).send({ error: "Failed to delete alert rule" });
  }
}
