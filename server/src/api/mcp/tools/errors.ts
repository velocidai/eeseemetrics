import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { clickhouse } from "../../../db/clickhouse/clickhouse.js";
import type { McpTokenContext } from "../auth.js";

const inputSchema = {
  start_date: z.string().optional().describe("Start date YYYY-MM-DD. Defaults to 7 days ago."),
  end_date: z.string().optional().describe("End date YYYY-MM-DD. Defaults to today."),
  limit: z.number().int().min(1).max(20).optional().describe("Number of errors to return (default 10)."),
  country: z.string().optional().describe("Filter by 2-letter country code (e.g. 'DE', 'US')."),
  device: z.string().optional().describe("Filter by device type: 'desktop', 'mobile', or 'tablet'."),
  page: z.string().optional().describe("Filter by page pathname where the error occurred (e.g. '/pricing')."),
};

export function registerErrorsTool(server: McpServer, ctx: McpTokenContext) {
  server.tool("get_errors", "Get the most common JavaScript errors on the site. Scale plan only. Supports filtering by country, device, and page.", inputSchema, async ({ start_date, end_date, limit = 10, country, device, page }) => {
    const end = end_date ?? new Date().toISOString().slice(0, 10);
    const start = start_date ?? new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10);

    const filterClauses = [
      country ? `AND country = {country:String}` : "",
      device  ? `AND device_type = {device:String}` : "",
      page    ? `AND pathname = {page:String}` : "",
    ].filter(Boolean).join("\n        ");

    const query = `
      SELECT
        JSONExtractString(toString(props), 'message') AS message,
        JSONExtractString(toString(props), 'errorName') AS error_name,
        COUNT(*) AS occurrences,
        COUNT(DISTINCT session_id) AS affected_sessions
      FROM events
      WHERE site_id = {siteId:Int32}
        AND type = 'error'
        AND toDate(timestamp) BETWEEN {start:String} AND {end:String}
        ${filterClauses}
      GROUP BY message, error_name
      ORDER BY occurrences DESC
      LIMIT {limit:Int32}
    `;

    const result = await clickhouse.query({
      query,
      query_params: {
        siteId: ctx.siteId, start, end, limit,
        ...(country && { country }),
        ...(device && { device }),
        ...(page && { page }),
      },
      format: "JSONEachRow",
    });
    const rows = await result.json<{ message: string; error_name: string; occurrences: number; affected_sessions: number }>();

    if (!rows.length) return { content: [{ type: "text" as const, text: `No errors tracked for ${ctx.siteDomain} in this period.` }] };

    const lines = [`Top errors for ${ctx.siteDomain} (${start} to ${end}):\n`];
    rows.forEach((r, i) => {
      lines.push(`${i + 1}. [${r.error_name || "Error"}] ${r.message || "(no message)"}`);
      lines.push(`   ${r.occurrences} occurrences, ${r.affected_sessions} sessions affected`);
    });

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  });
}
