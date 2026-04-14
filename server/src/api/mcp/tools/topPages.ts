import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { clickhouse } from "../../../db/clickhouse/clickhouse.js";
import type { McpTokenContext } from "../auth.js";

const inputSchema = {
  start_date: z.string().optional().describe("Start date YYYY-MM-DD. Defaults to 30 days ago."),
  end_date: z.string().optional().describe("End date YYYY-MM-DD. Defaults to today."),
  limit: z.number().int().min(1).max(50).optional().describe("Number of pages to return (default 10)."),
  country: z.string().optional().describe("Filter by 2-letter country code (e.g. 'DE', 'US')."),
  device: z.string().optional().describe("Filter by device type: 'desktop', 'mobile', or 'tablet'."),
  browser: z.string().optional().describe("Filter by browser name (e.g. 'Chrome', 'Safari')."),
};

export function registerTopPagesTool(server: McpServer, ctx: McpTokenContext) {
  server.tool("get_top_pages", "Get the top pages by session count for a date range. Supports filtering by country, device, and browser.", inputSchema, async ({ start_date, end_date, limit = 10, country, device, browser }) => {
    const end = end_date ?? new Date().toISOString().slice(0, 10);
    const start = start_date ?? new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);

    const filterClauses = [
      country ? `AND country = {country:String}` : "",
      device  ? `AND device_type = {device:String}` : "",
      browser ? `AND browser = {browser:String}` : "",
    ].filter(Boolean).join("\n        ");

    const query = `
      SELECT
        pathname,
        COUNT(DISTINCT session_id) AS sessions,
        ROUND(100.0 * COUNT(DISTINCT session_id) / (
          SELECT COUNT(DISTINCT session_id) FROM events
          WHERE site_id = {siteId:Int32} AND toDate(timestamp) BETWEEN {start:String} AND {end:String}
          ${filterClauses}
        ), 1) AS percentage
      FROM events
      WHERE site_id = {siteId:Int32}
        AND type = 'pageview'
        AND toDate(timestamp) BETWEEN {start:String} AND {end:String}
        AND pathname != ''
        ${filterClauses}
      GROUP BY pathname
      ORDER BY sessions DESC
      LIMIT {limit:Int32}
    `;

    const result = await clickhouse.query({
      query,
      query_params: {
        siteId: ctx.siteId, start, end, limit,
        ...(country && { country }),
        ...(device && { device }),
        ...(browser && { browser }),
      },
      format: "JSONEachRow",
    });
    const rows = await result.json<{ pathname: string; sessions: number; percentage: number }>();

    if (!rows.length) return { content: [{ type: "text" as const, text: "No pageview data for this period." }] };

    const lines = [`Top pages for ${ctx.siteDomain} (${start} to ${end}):\n`];
    rows.forEach((r, i) => {
      lines.push(`${i + 1}. ${r.pathname} — ${Number(r.sessions).toLocaleString()} sessions (${r.percentage}%)`);
    });

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  });
}
