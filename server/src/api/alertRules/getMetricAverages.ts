import { FastifyReply, FastifyRequest } from "fastify";
import { DateTime } from "luxon";
import { getUserHasAccessToSite } from "../../lib/auth-utils.js";
import { getSitePlanTier, tierAtLeast } from "../../lib/tierUtils.js";
import { clickhouse } from "../../db/clickhouse/clickhouse.js";
import { processResults } from "../../api/analytics/utils/utils.js";

const fmtDate = (d: DateTime) => d.toFormat("yyyy-MM-dd HH:mm:ss");

export async function getMetricAverages(
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
    const now = DateTime.utc();
    const windowEnd = fmtDate(now.startOf("day"));
    const windowStart = fmtDate(now.startOf("day").minus({ days: 30 }));

    const result = await clickhouse.query({
      query: `SELECT
        session_stats.avg_sessions AS sessions,
        session_stats.avg_bounce_rate * 100 AS bounce_rate,
        page_stats.avg_pageviews AS pageviews
      FROM (
        SELECT
          AVG(daily_sessions) AS avg_sessions,
          AVG(daily_bounce_rate) AS avg_bounce_rate
        FROM (
          SELECT
            toDate(timestamp) AS day,
            COUNT(DISTINCT session_id) AS daily_sessions,
            sumIf(1, pages_in_session = 1) / COUNT() AS daily_bounce_rate
          FROM (
            SELECT
              session_id,
              timestamp,
              COUNT(CASE WHEN type = 'pageview' THEN 1 END) OVER (PARTITION BY session_id) AS pages_in_session
            FROM events
            WHERE site_id = {siteId:Int32}
              AND timestamp >= toDateTime({windowStart:String})
              AND timestamp < toDateTime({windowEnd:String})
          )
          GROUP BY day
        )
      ) AS session_stats
      CROSS JOIN (
        SELECT AVG(daily_pageviews) AS avg_pageviews
        FROM (
          SELECT toDate(timestamp) AS day, COUNT(*) AS daily_pageviews
          FROM events
          WHERE site_id = {siteId:Int32}
            AND timestamp >= toDateTime({windowStart:String})
            AND timestamp < toDateTime({windowEnd:String})
            AND type = 'pageview'
          GROUP BY day
        )
      ) AS page_stats`,
      format: "JSONEachRow",
      query_params: { siteId, windowStart, windowEnd },
    });

    const rows = await processResults<{
      sessions: number;
      bounce_rate: number;
      pageviews: number;
    }>(result);

    const row = rows[0] ?? { sessions: 0, bounce_rate: 0, pageviews: 0 };

    return reply.send({
      sessions: Math.round(row.sessions),
      pageviews: Math.round(row.pageviews),
      bounce_rate: Math.round(row.bounce_rate),
    });
  } catch (error) {
    console.error("Error fetching metric averages:", error);
    return reply.status(500).send({ error: "Failed to fetch metric averages" });
  }
}
