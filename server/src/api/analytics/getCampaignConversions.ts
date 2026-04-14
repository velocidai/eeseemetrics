import { FastifyReply, FastifyRequest } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "../../db/postgres/postgres.js";
import { goals } from "../../db/postgres/schema.js";
import { clickhouse } from "../../db/clickhouse/clickhouse.js";
import { getTimeStatement, processResults, patternToRegex } from "./utils/utils.js";
import { getFilterStatement } from "./utils/getFilterStatement.js";
import { FilterParams } from "@eesee/shared";
import SqlString from "sqlstring";

type UtmDimension = "utm_campaign" | "utm_source" | "utm_medium";

interface GetCampaignConversionsRequest {
  Params: { siteId: string };
  Querystring: FilterParams<{
    dimension?: UtmDimension;
  }>;
}

const VALID_DIMENSIONS: UtmDimension[] = ["utm_campaign", "utm_source", "utm_medium"];

export async function getCampaignConversions(
  request: FastifyRequest<GetCampaignConversionsRequest>,
  reply: FastifyReply
) {
  const siteId = parseInt(request.params.siteId, 10);
  if (isNaN(siteId)) return reply.status(400).send({ error: "Invalid site ID" });

  const { dimension = "utm_campaign" } = request.query;
  if (!VALID_DIMENSIONS.includes(dimension)) {
    return reply
      .status(400)
      .send({ error: `dimension must be one of: ${VALID_DIMENSIONS.join(", ")}` });
  }

  // Fetch goal definitions from Postgres
  const siteGoals = await db.select().from(goals).where(eq(goals.siteId, siteId));
  if (siteGoals.length === 0) {
    return reply.send({});
  }

  const dimKey = `url_parameters['${dimension}']`;
  const timeStatement = getTimeStatement(request.query);
  const filterStatement = getFilterStatement(request.query.filters, siteId, timeStatement);

  // Build conditional aggregation clauses — one per goal (mirrors getGoals.ts pattern)
  const goalClauses: string[] = [];
  const goalIds: number[] = [];

  for (const goal of siteGoals) {
    if (goal.goalType === "path") {
      const pathPattern = goal.config?.pathPattern;
      if (!pathPattern) continue;

      const regex = patternToRegex(pathPattern);
      let clause = `type = 'pageview' AND match(pathname, ${SqlString.escape(regex)})`;

      const propertyFilters: Array<{ key: string; value: string | number | boolean }> =
        goal.config?.propertyFilters ?? [];
      for (const f of propertyFilters) {
        clause += ` AND url_parameters[${SqlString.escape(f.key)}] = ${SqlString.escape(String(f.value))}`;
      }

      goalClauses.push(
        `COUNT(DISTINCT IF(${clause}, session_id, NULL)) AS goal_${goal.goalId}`
      );
      goalIds.push(goal.goalId);
    } else if (goal.goalType === "event") {
      const eventName = goal.config?.eventName;
      if (!eventName) continue;

      let clause = `type = 'custom_event' AND event_name = ${SqlString.escape(eventName)}`;

      const propertyFilters: Array<{ key: string; value: string | number | boolean }> =
        goal.config?.propertyFilters ?? [];
      for (const f of propertyFilters) {
        if (typeof f.value === "string") {
          clause += ` AND JSONExtractString(toString(props), ${SqlString.escape(f.key)}) = ${SqlString.escape(f.value)}`;
        } else if (typeof f.value === "number") {
          clause += ` AND toFloat64(JSONExtractString(toString(props), ${SqlString.escape(f.key)})) = ${SqlString.escape(f.value)}`;
        } else if (typeof f.value === "boolean") {
          clause += ` AND JSONExtractString(toString(props), ${SqlString.escape(f.key)}) = ${SqlString.escape(f.value ? "true" : "false")}`;
        }
      }

      goalClauses.push(
        `COUNT(DISTINCT IF(${clause}, session_id, NULL)) AS goal_${goal.goalId}`
      );
      goalIds.push(goal.goalId);
    }
  }

  if (goalClauses.length === 0) {
    return reply.send({});
  }

  const query = `
    SELECT
      ${dimKey} AS dimension_value,
      ${goalClauses.join(",\n      ")}
    FROM events
    WHERE site_id = {siteId:Int32}
      AND ${dimKey} != ''
      ${timeStatement}
      ${filterStatement}
    GROUP BY dimension_value
  `;

  try {
    const result = await clickhouse.query({
      query,
      format: "JSONEachRow",
      query_params: { siteId },
    });

    const rows = await processResults<Record<string, any>>(result);

    // Sum all goal conversion columns per UTM dimension value
    const conversionsMap: Record<string, number> = {};
    for (const row of rows) {
      const dimValue = String(row.dimension_value);
      let total = 0;
      for (const goalId of goalIds) {
        total += Number(row[`goal_${goalId}`] ?? 0);
      }
      conversionsMap[dimValue] = total;
    }

    return reply.send(conversionsMap);
  } catch (error) {
    console.error("Error fetching campaign conversions:", error);
    return reply.status(500).send({ error: "Failed to fetch campaign conversion data" });
  }
}
