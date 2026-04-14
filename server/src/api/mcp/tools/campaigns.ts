import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { clickhouse } from "../../../db/clickhouse/clickhouse.js";
import type { McpTokenContext } from "../auth.js";

const inputSchema = {
  dimension: z
    .enum(["utm_campaign", "utm_source", "utm_medium"])
    .optional()
    .describe("Which UTM dimension to group by. Defaults to utm_campaign."),
  start_date: z
    .string()
    .optional()
    .describe("Start date YYYY-MM-DD. Defaults to 30 days ago."),
  end_date: z
    .string()
    .optional()
    .describe("End date YYYY-MM-DD. Defaults to today."),
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe("Max rows to return. Defaults to 10."),
};

export function registerCampaignsTool(server: McpServer, ctx: McpTokenContext) {
  // @ts-ignore — type instantiation too deep due to MCP SDK inference
  server.tool(
    "get_campaigns",
    "Get traffic broken down by UTM parameters (campaign, source, or medium). Returns sessions, unique visitors, bounce rate, and avg session duration per value.",
    inputSchema,
    async ({ dimension = "utm_campaign", start_date, end_date, limit = 10 }) => {
      const end = end_date ?? new Date().toISOString().slice(0, 10);
      const start =
        start_date ?? new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);

      // The dimension key is validated against the enum above and substituted
      // as a string literal — ClickHouse Map key lookups don't support parameterised keys.
      const query = `
        WITH sessions_with_utm AS (
          SELECT
            session_id,
            anyIf(user_id, user_id != '')       AS user_id,
            url_parameters['${dimension}']       AS utm_value,
            countIf(type = 'pageview')           AS pageviews_count,
            countIf(type = 'pageview') = 1       AS is_bounce,
            min(timestamp)                       AS session_start,
            max(timestamp)                       AS session_end
          FROM events
          WHERE site_id = {siteId:Int32}
            AND url_parameters['${dimension}'] != ''
            AND toDate(timestamp) BETWEEN {start:String} AND {end:String}
          GROUP BY session_id, utm_value
        )
        SELECT
          utm_value                                                              AS name,
          COUNT(DISTINCT session_id)                                             AS sessions,
          COUNT(DISTINCT user_id)                                                AS unique_visitors,
          ROUND(SUM(is_bounce) * 100.0 / COUNT(session_id), 1)                  AS bounce_rate,
          ROUND(AVG(dateDiff('second', session_start, session_end)), 0)          AS avg_session_duration
        FROM sessions_with_utm
        GROUP BY utm_value
        ORDER BY sessions DESC
        LIMIT {limit:Int32}
      `;

      const result = await clickhouse.query({
        query,
        query_params: { siteId: ctx.siteId, start, end, limit },
        format: "JSONEachRow",
      });
      const rows = await result.json<{
        name: string;
        sessions: number;
        unique_visitors: number;
        bounce_rate: number;
        avg_session_duration: number;
      }>();

      if (!rows.length) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No ${dimension} data found for this period. Make sure UTM parameters are present in your URLs.`,
            },
          ],
        };
      }

      const lines = [`Top ${dimension} values for ${ctx.siteDomain} (${start} to ${end}):\n`];
      rows.forEach((r, i) => {
        lines.push(
          `${i + 1}. ${r.name} — ${Number(r.sessions).toLocaleString()} sessions | ${Number(r.unique_visitors).toLocaleString()} unique visitors | ${r.bounce_rate}% bounce | ${r.avg_session_duration}s avg`
        );
      });

      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    }
  );
}
