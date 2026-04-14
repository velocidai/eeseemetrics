import { FastifyReply, FastifyRequest } from "fastify";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../../db/postgres/postgres.js";
import { anomalyAlerts } from "../../db/postgres/schema.js";
import { getUserHasAccessToSite } from "../../lib/auth-utils.js";
import { clickhouse } from "../../db/clickhouse/clickhouse.js";
import { processResults } from "../../api/analytics/utils/utils.js";
import { MIN_DAYS_FOR_ANOMALY } from "../../services/anomalyDetection/anomalyDetectionTypes.js";

type AlertStatus = "new" | "seen" | "dismissed";
type AlertSeverity = "low" | "medium" | "high";

async function countDaysWithData(siteId: number): Promise<number> {
  try {
    const result = await clickhouse.query({
      query: `SELECT COUNT(DISTINCT toDate(timestamp)) AS days FROM events WHERE site_id = {siteId:Int32} AND type = 'pageview'`,
      format: "JSONEachRow",
      query_params: { siteId },
    });
    const rows = await processResults<{ days: number }>(result);
    return rows[0]?.days ?? 0;
  } catch {
    return 0;
  }
}

export async function getAnomalyAlerts(
  request: FastifyRequest<{
    Params: { siteId: string };
    Querystring: {
      status?: AlertStatus;
      severity?: AlertSeverity;
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

  const { status, severity, page = "1", page_size: pageSize = "20" } = request.query;

  const pageNum = parseInt(page, 10);
  const pageSizeNum = parseInt(pageSize, 10);

  if (isNaN(pageNum) || pageNum < 1) {
    return reply.status(400).send({ error: "Invalid page number" });
  }
  if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) {
    return reply.status(400).send({ error: "Invalid page_size (1–100)" });
  }

  const validStatuses: AlertStatus[] = ["new", "seen", "dismissed"];
  if (status && !validStatuses.includes(status)) {
    return reply.status(400).send({ error: `status must be one of: ${validStatuses.join(", ")}` });
  }

  const validSeverities: AlertSeverity[] = ["low", "medium", "high"];
  if (severity && !validSeverities.includes(severity)) {
    return reply.status(400).send({ error: `severity must be one of: ${validSeverities.join(", ")}` });
  }

  try {
    const hasEnoughData = (await countDaysWithData(siteId)) >= MIN_DAYS_FOR_ANOMALY;

    const where = and(
      eq(anomalyAlerts.siteId, siteId),
      status ? eq(anomalyAlerts.status, status) : undefined,
      severity ? eq(anomalyAlerts.severity, severity) : undefined
    );

    const [totalRow] = await db.select({ total: count() }).from(anomalyAlerts).where(where);
    const total = totalRow?.total ?? 0;

    const rows = await db
      .select()
      .from(anomalyAlerts)
      .where(where)
      .orderBy(desc(anomalyAlerts.detectedAt))
      .limit(pageSizeNum)
      .offset((pageNum - 1) * pageSizeNum);

    return reply.send({
      data: rows,
      meta: {
        total,
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(total / pageSizeNum),
        hasEnoughData,
      },
    });
  } catch (error) {
    console.error("Error fetching anomaly alerts:", error);
    return reply.status(500).send({ error: "Failed to fetch anomaly alerts" });
  }
}
