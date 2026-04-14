import { FastifyReply, FastifyRequest } from "fastify";
import { and, count, eq } from "drizzle-orm";
import { db } from "../../db/postgres/postgres.js";
import { anomalyAlerts } from "../../db/postgres/schema.js";
import { getUserHasAccessToSite } from "../../lib/auth-utils.js";

export async function getAnomalyAlertUnreadCount(
  request: FastifyRequest<{
    Params: { siteId: string };
  }>,
  reply: FastifyReply
) {
  const siteId = parseInt(request.params.siteId, 10);
  if (isNaN(siteId)) {
    return reply.status(400).send({ error: "Invalid site ID" });
  }

  const hasAccess = await getUserHasAccessToSite(request, siteId);
  if (!hasAccess) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  try {
    const [row] = await db
      .select({ total: count() })
      .from(anomalyAlerts)
      .where(and(eq(anomalyAlerts.siteId, siteId), eq(anomalyAlerts.status, "new")));

    return reply.send({ count: row?.total ?? 0 });
  } catch (error) {
    console.error("Error fetching anomaly alert unread count:", error);
    return reply.status(500).send({ error: "Failed to fetch unread count" });
  }
}
