import { eq } from "drizzle-orm";
import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../../db/postgres/postgres.js";
import { funnels as funnelsTable } from "../../../db/postgres/schema.js";
import { getUserHasAccessToSite } from "../../../lib/auth-utils.js";
import { getSitePlanTier, tierAtLeast } from "../../../lib/tierUtils.js";

export async function getFunnels(
  request: FastifyRequest<{
    Params: {
      siteId: string;
    };
  }>,
  reply: FastifyReply
) {
  const { siteId } = request.params;

  const hasAccess = await getUserHasAccessToSite(request, Number(siteId));
  if (!hasAccess) return reply.status(403).send({ error: "Forbidden" });

  const tier = await getSitePlanTier(Number(siteId));
  if (!tierAtLeast(tier, "pro")) {
    return reply.status(403).send({ error: "Funnels require a Pro or Scale plan" });
  }

  try {
    // Fetch all funnels for the site
    const funnelRecords = await db
      .select()
      .from(funnelsTable)
      .where(eq(funnelsTable.siteId, Number(siteId)))
      .orderBy(funnelsTable.createdAt);

    // Transform the records to a more frontend-friendly structure
    const funnels = funnelRecords.map(record => {
      const data = record.data as any;
      return {
        id: record.reportId,
        name: data.name || "Unnamed Funnel",
        steps: data.steps || [],
        configuration: data.configuration || {},
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        // Include any additional analytics data that might be stored
        conversionRate: data.lastResult?.conversionRate || null,
        totalVisitors: data.lastResult?.totalVisitors || null,
      };
    });

    return reply.send({ data: funnels });
  } catch (error) {
    console.error("Error fetching funnels:", error);
    return reply.status(500).send({ error: "Failed to fetch funnels" });
  }
}
