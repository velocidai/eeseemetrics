import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { clickhouse } from "../../../db/clickhouse/clickhouse.js";
import type { McpTokenContext } from "../auth.js";

const inputSchema = {
  start_date: z.string().describe("Start date in YYYY-MM-DD format. Defaults to 30 days ago.").optional(),
  end_date: z.string().describe("End date in YYYY-MM-DD format. Defaults to today.").optional(),
  country: z.string().optional().describe("Filter by 2-letter country code (e.g. 'DE', 'US')."),
  device: z.string().optional().describe("Filter by device type: 'desktop', 'mobile', or 'tablet'."),
  browser: z.string().optional().describe("Filter by browser name (e.g. 'Chrome', 'Safari')."),
};

export function registerOverviewTool(server: McpServer, ctx: McpTokenContext) {
  // @ts-ignore — MCP SDK Zod schema inference exceeds TS depth limit; works at runtime
  server.tool(
    "get_overview",
    "Get key analytics metrics for the site: pageviews, sessions, unique visitors, bounce rate, and average session duration for a date range. Supports filtering by country, device, and browser.",
    inputSchema,
    async ({ start_date, end_date, country, device, browser }) => {
      const end = end_date ?? new Date().toISOString().slice(0, 10);
      const start = start_date ?? new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);

      const filterClauses = [
        country ? `AND country = {country:String}` : "",
        device  ? `AND device_type = {device:String}` : "",
        browser ? `AND browser = {browser:String}` : "",
      ].filter(Boolean).join("\n            ");

      const query = `
        WITH
        AllSessionPageviews AS (
          SELECT session_id, COUNT(CASE WHEN type = 'pageview' THEN 1 END) AS pv_count
          FROM events
          WHERE site_id = {siteId:Int32}
            AND toDate(timestamp) BETWEEN {start:String} AND {end:String}
            ${filterClauses}
          GROUP BY session_id
        ),
        Sessions AS (
          SELECT
            session_id,
            MIN(timestamp) AS start_time,
            MAX(timestamp) AS end_time
          FROM events
          WHERE site_id = {siteId:Int32}
            AND toDate(timestamp) BETWEEN {start:String} AND {end:String}
            ${filterClauses}
          GROUP BY session_id
        )
        SELECT
          COUNT(DISTINCT s.session_id)                                AS sessions,
          SUM(a.pv_count)                                             AS pageviews,
          (SELECT COUNT(DISTINCT user_id) FROM events WHERE site_id = {siteId:Int32} AND toDate(timestamp) BETWEEN {start:String} AND {end:String} ${filterClauses}) AS users,
          ROUND(AVG(dateDiff('second', s.start_time, s.end_time)), 1) AS avg_duration,
          ROUND(
            100.0 * COUNTIf(a.pv_count = 1) / COUNT(s.session_id), 1
          )                                                           AS bounce_rate
        FROM Sessions s
        JOIN AllSessionPageviews a ON s.session_id = a.session_id
      `;

      const result = await clickhouse.query({
        query,
        query_params: {
          siteId: ctx.siteId, start, end,
          ...(country && { country }),
          ...(device && { device }),
          ...(browser && { browser }),
        },
        format: "JSONEachRow",
      });
      const rows = await result.json<{
        sessions: number;
        pageviews: number;
        users: number;
        avg_duration: number;
        bounce_rate: number;
      }>();
      const r = rows[0];
      if (!r) return { content: [{ type: "text" as const, text: "No data found for the requested period." }] };

      const text = [
        `Site: ${ctx.siteDomain}`,
        `Period: ${start} to ${end}`,
        ``,
        `Pageviews:          ${Number(r.pageviews).toLocaleString()}`,
        `Sessions:           ${Number(r.sessions).toLocaleString()}`,
        `Unique visitors:    ${Number(r.users).toLocaleString()}`,
        `Bounce rate:        ${r.bounce_rate}%`,
        `Avg session:        ${r.avg_duration}s`,
      ].join("\n");

      return { content: [{ type: "text" as const, text }] };
    }
  );
}
