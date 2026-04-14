import { FastifyReply, FastifyRequest } from "fastify";
import { and, eq } from "drizzle-orm";
import { db } from "../../db/postgres/postgres.js";
import { aiReports } from "../../db/postgres/schema.js";
import { getUserHasAccessToSite } from "../../lib/auth-utils.js";
import { getSitePlanTier, tierAtLeast } from "../../lib/tierUtils.js";

export async function getAiReport(
  request: FastifyRequest<{
    Params: { siteId: string; reportId: string };
  }>,
  reply: FastifyReply
) {
  const siteId = parseInt(request.params.siteId, 10);
  const { reportId } = request.params;

  if (isNaN(siteId)) {
    return reply.status(400).send({ error: "Invalid site ID" });
  }

  const hasAccess = await getUserHasAccessToSite(request, siteId);
  if (!hasAccess) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  const tier = await getSitePlanTier(siteId);
  if (!tierAtLeast(tier, "pro")) {
    return reply.status(403).send({ error: "AI reports require a Pro or Scale plan" });
  }

  try {
    const [row] = await db
      .select()
      .from(aiReports)
      .where(and(eq(aiReports.id, reportId), eq(aiReports.siteId, siteId)))
      .limit(1);

    if (!row) {
      return reply.status(404).send({ error: "Report not found" });
    }

    return reply.send({ data: row });
  } catch (error) {
    console.error("Error fetching AI report:", error);
    return reply.status(500).send({ error: "Failed to fetch AI report" });
  }
}
