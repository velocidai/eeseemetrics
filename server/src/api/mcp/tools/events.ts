import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { clickhouse } from "../../../db/clickhouse/clickhouse.js";
import type { McpTokenContext } from "../auth.js";

const inputSchema = {
  start_date: z.string().optional().describe("Start date YYYY-MM-DD. Defaults to 30 days ago."),
  end_date: z.string().optional().describe("End date YYYY-MM-DD. Defaults to today."),
  event_name: z.string().optional().describe("Filter to a specific event name (e.g. 'signup', 'purchase'). If omitted, returns all custom events."),
  limit: z.number().int().min(1).max(20).optional().describe("Number of events to return (default 10)."),
  country: z.string().optional().describe("Filter by 2-letter country code (e.g. 'DE', 'US')."),
  device: z.string().optional().describe("Filter by device type: 'desktop', 'mobile', or 'tablet'."),
  page: z.string().optional().describe("Filter by page path (e.g. '/pricing')."),
};

export function registerEventsTool(server: McpServer, ctx: McpTokenContext) {
  server.tool(
    "get_events",
    "Get custom event counts grouped by event name, with top property values for each. Supports filtering by country, device, and page. Pro + Scale.",
    inputSchema,
    async ({ start_date, end_date, event_name, limit = 10, country, device, page }) => {
      const end = end_date ?? new Date().toISOString().slice(0, 10);
      const start = start_date ?? new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);

      const filterClauses = [
        country ? `AND country = {country:String}` : "",
        device  ? `AND device_type = {device:String}` : "",
        page    ? `AND pathname = {page:String}` : "",
      ].filter(Boolean).join("\n        ");

      const eventFilter = event_name ? `AND type = {event_name:String}` : "";

      const query = `
        SELECT
          type AS event_name,
          COUNT(*) AS occurrences,
          COUNT(DISTINCT session_id) AS sessions
        FROM events
        WHERE site_id = {siteId:Int32}
          AND type != 'pageview'
          AND type != 'error'
          AND type != 'identify'
          AND toDate(timestamp) BETWEEN {start:String} AND {end:String}
          ${filterClauses}
          ${eventFilter}
        GROUP BY type
        ORDER BY occurrences DESC
        LIMIT {limit:Int32}
      `;

      const result = await clickhouse.query({
        query,
        query_params: {
          siteId: ctx.siteId,
          start,
          end,
          limit,
          ...(country && { country }),
          ...(device && { device }),
          ...(page && { page }),
          ...(event_name && { event_name }),
        },
        format: "JSONEachRow",
      });

      const rows = await result.json<{ event_name: string; occurrences: number; sessions: number }>();

      if (!rows.length) {
        return {
          content: [{
            type: "text" as const,
            text: `No custom events tracked for ${ctx.siteDomain} in this period. Make sure you are sending custom events via the tracking script.`,
          }],
        };
      }

      const lines = [`Custom events for ${ctx.siteDomain} (${start} to ${end}):\n`];
      rows.forEach((r, i) => {
        lines.push(`${i + 1}. ${r.event_name} — ${Number(r.occurrences).toLocaleString()} occurrences, ${Number(r.sessions).toLocaleString()} sessions`);
      });

      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    }
  );
}
