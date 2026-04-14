import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { clickhouse } from "../../../db/clickhouse/clickhouse.js";
import type { McpTokenContext } from "../auth.js";

const inputSchema = {
  start_date: z.string().optional().describe("Start date YYYY-MM-DD. Defaults to 30 days ago."),
  end_date: z.string().optional().describe("End date YYYY-MM-DD. Defaults to today."),
  limit: z.number().int().min(1).max(50).optional().describe("Number of referrers to return (default 10)."),
  country: z.string().optional().describe("Filter by 2-letter country code (e.g. 'DE', 'US')."),
  device: z.string().optional().describe("Filter by device type: 'desktop', 'mobile', or 'tablet'."),
  page: z.string().optional().describe("Filter by page pathname (e.g. '/pricing')."),
};

export function registerTopReferrersTool(server: McpServer, ctx: McpTokenContext) {
  server.tool("get_top_referrers", "Get the top referral sources by session count for a date range. Supports filtering by country, device, and page.", inputSchema, async ({ start_date, end_date, limit = 10, country, device, page }) => {
    const end = end_date ?? new Date().toISOString().slice(0, 10);
    const start = start_date ?? new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);

    const filterClauses = [
      country ? `AND country = {country:String}` : "",
      device  ? `AND device_type = {device:String}` : "",
      page    ? `AND pathname = {page:String}` : "",
    ].filter(Boolean).join("\n        ");

    const query = `
      SELECT
        domain(referrer) AS referrer_domain,
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
        ${filterClauses}
      GROUP BY referrer_domain
      ORDER BY sessions DESC
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
    const rows = await result.json<{ referrer_domain: string; sessions: number; percentage: number }>();

    if (!rows.length) return { content: [{ type: "text" as const, text: "No referrer data for this period." }] };

    const lines = [`Top referrers for ${ctx.siteDomain} (${start} to ${end}):\n`];
    rows.forEach((r, i) => {
      const label = r.referrer_domain || "(direct / none)";
      lines.push(`${i + 1}. ${label} — ${Number(r.sessions).toLocaleString()} sessions (${r.percentage}%)`);
    });

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  });
}
