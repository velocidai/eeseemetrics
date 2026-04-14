import { FastifyReply, FastifyRequest } from "fastify";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../../db/postgres/postgres.js";
import { aiReports } from "../../db/postgres/schema.js";
import { getUserHasAccessToSite } from "../../lib/auth-utils.js";
import { getSitePlanTier, tierAtLeast } from "../../lib/tierUtils.js";

type ReportCadence = "weekly" | "monthly" | "quarterly" | "yearly";

export async function getAiReports(
  request: FastifyRequest<{
    Params: { siteId: string };
    Querystring: {
      cadence?: ReportCadence;
      page?: string;
      page_size?: string;
    };
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

  const tier = await getSitePlanTier(siteId);
  if (!tierAtLeast(tier, "pro")) {
    return reply.status(403).send({ error: "AI reports require a Pro or Scale plan" });
  }

  const { cadence, page = "1", page_size: pageSize = "20" } = request.query;

  const pageNum = parseInt(page, 10);
  const pageSizeNum = parseInt(pageSize, 10);

  if (isNaN(pageNum) || pageNum < 1) {
    return reply.status(400).send({ error: "Invalid page number" });
  }
  if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) {
    return reply.status(400).send({ error: "Invalid page_size (1–100)" });
  }

  try {
    const where = and(
      eq(aiReports.siteId, siteId),
      eq(aiReports.status, "complete"),
      cadence ? eq(aiReports.cadence, cadence) : undefined
    );

    const [totalRow] = await db.select({ total: count() }).from(aiReports).where(where);
    const total = totalRow?.total ?? 0;

    const rows = await db
      .select({
        id: aiReports.id,
        cadence: aiReports.cadence,
        periodStart: aiReports.periodStart,
        periodEnd: aiReports.periodEnd,
        status: aiReports.status,
        createdAt: aiReports.createdAt,
        // Omit structuredSummaryJson for list view — fetch via getAiReport for full content
      })
      .from(aiReports)
      .where(where)
      .orderBy(desc(aiReports.periodStart))
      .limit(pageSizeNum)
      .offset((pageNum - 1) * pageSizeNum);

    return reply.send({
      data: rows,
      meta: {
        total,
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(total / pageSizeNum),
      },
    });
  } catch (error) {
    console.error("Error fetching AI reports:", error);
    return reply.status(500).send({ error: "Failed to fetch AI reports" });
  }
}
