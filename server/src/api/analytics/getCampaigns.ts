// server/src/api/analytics/getCampaigns.ts
import { FastifyReply, FastifyRequest } from "fastify";
import { clickhouse } from "../../db/clickhouse/clickhouse.js";
import { getTimeStatement, processResults } from "./utils/utils.js";
import { getFilterStatement } from "./utils/getFilterStatement.js";
import { FilterParams } from "@eesee/shared";

type UtmDimension = "utm_campaign" | "utm_source" | "utm_medium";

interface GetCampaignsRequest {
  Params: { siteId: string };
  Querystring: FilterParams<{
    dimension?: UtmDimension;
    limit?: string;
    page?: string;
  }>;
}

export interface CampaignRow {
  dimension_value: string;
  sessions: number;
  unique_visitors: number;
  pageviews: number;
  bounce_rate: number;
  avg_session_duration: number;
  percentage: number;
}

export interface CampaignsResponse {
  data: CampaignRow[];
  totalCount: number;
}

const VALID_DIMENSIONS: UtmDimension[] = ["utm_campaign", "utm_source", "utm_medium"];

function buildQuery(
  siteId: number,
  dimension: UtmDimension,
  timeStatement: string,
  filterStatement: string,
  limit: number,
  offset: number,
  countOnly: boolean
): string {
  const dimKey = `url_parameters['${dimension}']`;

  const cte = `
    sessions_with_utm AS (
      SELECT
        session_id,
        anyIf(user_id, user_id != '') AS user_id,
        ${dimKey}                            AS utm_value,
        countIf(type = 'pageview')          AS pageviews_count,
        countIf(type = 'pageview') = 1      AS is_bounce,
        min(timestamp)                       AS session_start,
        max(timestamp)                       AS session_end
      FROM events
      WHERE
        site_id = {siteId:Int32}
        AND ${dimKey} != ''
        ${timeStatement}
        ${filterStatement}
      GROUP BY session_id, utm_value
    ),
    totals AS (
      SELECT COUNT(DISTINCT session_id) AS total_sessions
      FROM events
      WHERE
        site_id = {siteId:Int32}
        ${timeStatement}
        ${filterStatement}
    )
  `;

  if (countOnly) {
    return `
      WITH ${cte}
      SELECT COUNT(DISTINCT utm_value) AS totalCount
      FROM sessions_with_utm
    `;
  }

  return `
    WITH ${cte}
    SELECT
      utm_value                                                             AS dimension_value,
      COUNT(DISTINCT session_id)                                            AS sessions,
      COUNT(DISTINCT user_id)                                               AS unique_visitors,
      SUM(pageviews_count)                                                  AS pageviews,
      ROUND(SUM(is_bounce) * 100.0 / COUNT(session_id), 1)                 AS bounce_rate,
      ROUND(AVG(dateDiff('second', session_start, session_end)), 0)         AS avg_session_duration,
      ROUND(COUNT(DISTINCT session_id) * 100.0 / (SELECT total_sessions FROM totals), 2) AS percentage
    FROM sessions_with_utm
    GROUP BY utm_value
    ORDER BY sessions DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
}

export async function getCampaigns(
  request: FastifyRequest<GetCampaignsRequest>,
  reply: FastifyReply
) {
  const siteId = parseInt(request.params.siteId, 10);
  if (isNaN(siteId)) return reply.status(400).send({ error: "Invalid site ID" });

  const { dimension = "utm_campaign", limit: limitStr = "50", page: pageStr = "1" } = request.query;

  if (!VALID_DIMENSIONS.includes(dimension)) {
    return reply.status(400).send({ error: `dimension must be one of: ${VALID_DIMENSIONS.join(", ")}` });
  }

  const limit = Math.min(parseInt(limitStr, 10) || 50, 200);
  const page = Math.max(parseInt(pageStr, 10) || 1, 1);
  const offset = (page - 1) * limit;

  const timeStatement = getTimeStatement(request.query);
  const filterStatement = getFilterStatement(request.query.filters, siteId, timeStatement);

  try {
    const [dataResult, countResult] = await Promise.all([
      clickhouse.query({
        query: buildQuery(siteId, dimension, timeStatement, filterStatement, limit, offset, false),
        format: "JSONEachRow",
        query_params: { siteId },
      }),
      clickhouse.query({
        query: buildQuery(siteId, dimension, timeStatement, filterStatement, limit, offset, true),
        format: "JSONEachRow",
        query_params: { siteId },
      }),
    ]);

    const [data, countRows] = await Promise.all([
      processResults<CampaignRow>(dataResult),
      processResults<{ totalCount: number }>(countResult),
    ]);

    return reply.send({
      data,
      totalCount: countRows[0]?.totalCount ?? 0,
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return reply.status(500).send({ error: "Failed to fetch campaign data" });
  }
}
