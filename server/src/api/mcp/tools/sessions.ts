import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { clickhouse } from "../../../db/clickhouse/clickhouse.js";
import type { McpTokenContext } from "../auth.js";

const inputSchema = {
  start_date: z.string().optional().describe("Start date YYYY-MM-DD. Defaults to 7 days ago."),
  end_date: z.string().optional().describe("End date YYYY-MM-DD. Defaults to today."),
  limit: z.number().int().min(1).max(50).optional().describe("Number of sessions to return (default 10)."),
  country: z.string().optional().describe("Filter by 2-letter country code (e.g. 'DE', 'US')."),
  device: z.string().optional().describe("Filter by device type: 'desktop', 'mobile', or 'tablet'."),
  browser: z.string().optional().describe("Filter by browser name (e.g. 'Chrome', 'Safari')."),
  page: z.string().optional().describe("Filter by page pathname — only sessions that visited this page (e.g. '/pricing')."),
};

export function registerSessionsTool(server: McpServer, ctx: McpTokenContext) {
  server.tool("get_sessions", "Get a list of recent sessions with entry page, country, device, and duration. Scale plan only. Supports filtering by country, device, browser, and page.", inputSchema, async ({ start_date, end_date, limit = 10, country, device, browser, page }) => {
    const end = end_date ?? new Date().toISOString().slice(0, 10);
    const start = start_date ?? new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10);

    const filterClauses = [
      country ? `AND country = {country:String}` : "",
      device  ? `AND device_type = {device:String}` : "",
      browser ? `AND browser = {browser:String}` : "",
      page    ? `AND pathname = {page:String}` : "",
    ].filter(Boolean).join("\n        ");

    const query = `
      SELECT
        session_id,
        any(country) AS country,
        any(device_type) AS device,
        any(browser) AS browser,
        argMin(pathname, timestamp) AS entry_page,
        COUNT(CASE WHEN type = 'pageview' THEN 1 END) AS pageviews,
        dateDiff('second', MIN(timestamp), MAX(timestamp)) AS duration_s,
        MIN(timestamp) AS started_at
      FROM events
      WHERE site_id = {siteId:Int32}
        AND toDate(timestamp) BETWEEN {start:String} AND {end:String}
        ${filterClauses}
      GROUP BY session_id
      ORDER BY started_at DESC
      LIMIT {limit:Int32}
    `;

    const result = await clickhouse.query({
      query,
      query_params: {
        siteId: ctx.siteId, start, end, limit,
        ...(country && { country }),
        ...(device && { device }),
        ...(browser && { browser }),
        ...(page && { page }),
      },
      format: "JSONEachRow",
    });
    const rows = await result.json<{
      session_id: string; country: string; device: string; browser: string;
      entry_page: string; pageviews: number; duration_s: number; started_at: string;
    }>();

    if (!rows.length) return { content: [{ type: "text" as const, text: "No sessions found for this period." }] };

    const lines = [`Recent sessions for ${ctx.siteDomain} (${start} to ${end}):\n`];
    rows.forEach((r, i) => {
      lines.push(`${i + 1}. ${r.started_at.slice(0, 16)} — ${r.entry_page} | ${r.country || "?"} | ${r.device || "?"} | ${r.pageviews} pv | ${r.duration_s}s`);
    });

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  });
}
