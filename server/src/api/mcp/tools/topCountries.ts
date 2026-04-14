import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { clickhouse } from "../../../db/clickhouse/clickhouse.js";
import type { McpTokenContext } from "../auth.js";

const inputSchema = {
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
  device: z.string().optional().describe("Filter by device type: 'desktop', 'mobile', or 'tablet'."),
  browser: z.string().optional().describe("Filter by browser name (e.g. 'Chrome', 'Safari')."),
  page: z.string().optional().describe("Filter by page pathname (e.g. '/pricing')."),
};

export function registerTopCountriesTool(server: McpServer, ctx: McpTokenContext) {
  server.tool(
    "get_top_countries",
    "Get the top countries by session count for a date range. Supports filtering by device, browser, and page.",
    inputSchema,
    async ({ start_date, end_date, limit = 10, device, browser, page }) => {
      const end = end_date ?? new Date().toISOString().slice(0, 10);
      const start =
        start_date ?? new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);

      const filterClauses = [
        device  ? `AND device_type = {device:String}` : "",
        browser ? `AND browser = {browser:String}` : "",
        page    ? `AND pathname = {page:String}` : "",
      ].filter(Boolean).join("\n          ");

      const query = `
        SELECT
          country,
          COUNT(DISTINCT session_id) AS sessions,
          ROUND(100.0 * COUNT(DISTINCT session_id) / (
            SELECT COUNT(DISTINCT session_id) FROM events
            WHERE site_id = {siteId:Int32} AND toDate(timestamp) BETWEEN {start:String} AND {end:String}
            ${filterClauses}
          ), 1) AS percentage
        FROM events
        WHERE site_id = {siteId:Int32}
          AND type = 'pageview'
          AND country != ''
          AND toDate(timestamp) BETWEEN {start:String} AND {end:String}
          ${filterClauses}
        GROUP BY country
        ORDER BY sessions DESC
        LIMIT {limit:Int32}
      `;

      const result = await clickhouse.query({
        query,
        query_params: {
          siteId: ctx.siteId, start, end, limit,
          ...(device && { device }),
          ...(browser && { browser }),
          ...(page && { page }),
        },
        format: "JSONEachRow",
      });
      const rows = await result.json<{
        country: string;
        sessions: number;
        percentage: number;
      }>();

      if (!rows.length) {
        return {
          content: [{ type: "text" as const, text: "No country data for this period." }],
        };
      }

      const lines = [`Top countries for ${ctx.siteDomain} (${start} to ${end}):\n`];
      rows.forEach((r, i) => {
        lines.push(
          `${i + 1}. ${r.country} — ${Number(r.sessions).toLocaleString()} sessions (${r.percentage}%)`
        );
      });

      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    }
  );
}
