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
  country: z.string().optional().describe("Filter by 2-letter country code (e.g. 'DE', 'US')."),
  browser: z.string().optional().describe("Filter by browser name (e.g. 'Chrome', 'Safari')."),
  page: z.string().optional().describe("Filter by page pathname (e.g. '/pricing')."),
};

export function registerTopDevicesTool(server: McpServer, ctx: McpTokenContext) {
  server.tool(
    "get_top_devices",
    "Get traffic breakdown by device type (desktop, mobile, tablet) for a date range. Supports filtering by country, browser, and page.",
    inputSchema,
    async ({ start_date, end_date, country, browser, page }) => {
      const end = end_date ?? new Date().toISOString().slice(0, 10);
      const start =
        start_date ?? new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);

      const filterClauses = [
        country ? `AND country = {country:String}` : "",
        browser ? `AND browser = {browser:String}` : "",
        page    ? `AND pathname = {page:String}` : "",
      ].filter(Boolean).join("\n          ");

      const query = `
        SELECT
          device_type,
          COUNT(DISTINCT session_id) AS sessions,
          ROUND(100.0 * COUNT(DISTINCT session_id) / (
            SELECT COUNT(DISTINCT session_id) FROM events
            WHERE site_id = {siteId:Int32} AND toDate(timestamp) BETWEEN {start:String} AND {end:String}
            ${filterClauses}
          ), 1) AS percentage
        FROM events
        WHERE site_id = {siteId:Int32}
          AND type = 'pageview'
          AND device_type != ''
          AND toDate(timestamp) BETWEEN {start:String} AND {end:String}
          ${filterClauses}
        GROUP BY device_type
        ORDER BY sessions DESC
      `;

      const result = await clickhouse.query({
        query,
        query_params: {
          siteId: ctx.siteId, start, end,
          ...(country && { country }),
          ...(browser && { browser }),
          ...(page && { page }),
        },
        format: "JSONEachRow",
      });
      const rows = await result.json<{
        device_type: string;
        sessions: number;
        percentage: number;
      }>();

      if (!rows.length) {
        return {
          content: [{ type: "text" as const, text: "No device data for this period." }],
        };
      }

      const lines = [`Device breakdown for ${ctx.siteDomain} (${start} to ${end}):\n`];
      rows.forEach((r) => {
        lines.push(
          `• ${r.device_type} — ${Number(r.sessions).toLocaleString()} sessions (${r.percentage}%)`
        );
      });

      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    }
  );
}
