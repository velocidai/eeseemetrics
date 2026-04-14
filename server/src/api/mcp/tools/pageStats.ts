import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { clickhouse } from "../../../db/clickhouse/clickhouse.js";
import type { McpTokenContext } from "../auth.js";

const inputSchema = {
  page: z.string().describe("The page path to analyse (e.g. '/pricing', '/')."),
  start_date: z.string().optional().describe("Start date YYYY-MM-DD. Defaults to 30 days ago."),
  end_date: z.string().optional().describe("End date YYYY-MM-DD. Defaults to today."),
};

export function registerPageStatsTool(server: McpServer, ctx: McpTokenContext) {
  // @ts-ignore
  server.tool("get_page_stats", "Get detailed stats for a specific page: sessions, pageviews, bounce rate, avg duration, top referrers, top countries, and top devices. Pro + Scale.", inputSchema, async ({ page, start_date, end_date }) => {
    const end = end_date ?? new Date().toISOString().slice(0, 10);
    const start = start_date ?? new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);

    // Query 1 — overview metrics for the page
    const overviewQuery = `
      WITH
      AllSP AS (
        SELECT session_id, COUNT(CASE WHEN type = 'pageview' AND pathname = {page:String} THEN 1 END) AS pv_count
        FROM events
        WHERE site_id = {siteId:Int32}
          AND toDate(timestamp) BETWEEN {start:String} AND {end:String}
        GROUP BY session_id
        HAVING pv_count > 0
      ),
      Sessions AS (
        SELECT session_id, MIN(timestamp) AS start_time, MAX(timestamp) AS end_time
        FROM events
        WHERE site_id = {siteId:Int32}
          AND toDate(timestamp) BETWEEN {start:String} AND {end:String}
        GROUP BY session_id
      )
      SELECT
        COUNT(DISTINCT AllSP.session_id) AS sessions,
        SUM(AllSP.pv_count) AS pageviews,
        ROUND(100.0 * COUNTIf(AllSP.pv_count > 0 AND Sessions.start_time = Sessions.end_time) / COUNT(AllSP.session_id), 1) AS bounce_rate,
        ROUND(AVG(dateDiff('second', Sessions.start_time, Sessions.end_time)), 1) AS avg_duration
      FROM AllSP
      JOIN Sessions ON AllSP.session_id = Sessions.session_id
    `;

    // Query 2 — top 5 referrers for this page
    const referrersQuery = `
      SELECT
        domain(referrer) AS referrer_domain,
        COUNT(DISTINCT session_id) AS sessions
      FROM events
      WHERE site_id = {siteId:Int32}
        AND type = 'pageview'
        AND pathname = {page:String}
        AND toDate(timestamp) BETWEEN {start:String} AND {end:String}
      GROUP BY referrer_domain
      ORDER BY sessions DESC
      LIMIT 5
    `;

    // Query 3a — top 5 countries
    const countriesQuery = `
      SELECT country, COUNT(DISTINCT session_id) AS sessions
      FROM events
      WHERE site_id = {siteId:Int32}
        AND pathname = {page:String}
        AND toDate(timestamp) BETWEEN {start:String} AND {end:String}
      GROUP BY country ORDER BY sessions DESC LIMIT 5
    `;

    // Query 3b — device breakdown
    const devicesQuery = `
      SELECT device_type, COUNT(DISTINCT session_id) AS sessions
      FROM events
      WHERE site_id = {siteId:Int32}
        AND pathname = {page:String}
        AND toDate(timestamp) BETWEEN {start:String} AND {end:String}
      GROUP BY device_type ORDER BY sessions DESC
    `;

    const queryParams = { siteId: ctx.siteId, start, end, page };

    const [overviewResult, referrersResult, countriesResult, devicesResult] = await Promise.all([
      clickhouse.query({ query: overviewQuery, query_params: queryParams, format: "JSONEachRow" }),
      clickhouse.query({ query: referrersQuery, query_params: queryParams, format: "JSONEachRow" }),
      clickhouse.query({ query: countriesQuery, query_params: queryParams, format: "JSONEachRow" }),
      clickhouse.query({ query: devicesQuery, query_params: queryParams, format: "JSONEachRow" }),
    ]);

    const [overviewRows, referrerRows, countryRows, deviceRows] = await Promise.all([
      overviewResult.json<{ sessions: number; pageviews: number; bounce_rate: number; avg_duration: number }>(),
      referrersResult.json<{ referrer_domain: string; sessions: number }>(),
      countriesResult.json<{ country: string; sessions: number }>(),
      devicesResult.json<{ device_type: string; sessions: number }>(),
    ]);

    const overview = overviewRows[0];
    if (!overview || Number(overview.sessions) === 0) {
      return { content: [{ type: "text" as const, text: `No data found for ${page} in this period.` }] };
    }

    const totalDeviceSessions = deviceRows.reduce((sum, r) => sum + Number(r.sessions), 0);

    const lines: string[] = [
      `Page stats for ${page} on ${ctx.siteDomain} (${start} to ${end}):\n`,
      `Sessions:     ${Number(overview.sessions).toLocaleString()}`,
      `Pageviews:    ${Number(overview.pageviews).toLocaleString()}`,
      `Bounce rate:  ${overview.bounce_rate}%`,
      `Avg duration: ${overview.avg_duration}s`,
    ];

    if (referrerRows.length) {
      lines.push("\nTop referrers:");
      referrerRows.forEach((r, i) => {
        const label = r.referrer_domain && r.referrer_domain !== "" ? r.referrer_domain : "(direct / none)";
        lines.push(`${i + 1}. ${label} — ${Number(r.sessions).toLocaleString()} sessions`);
      });
    }

    if (countryRows.length) {
      lines.push("\nTop countries:");
      countryRows.forEach((r, i) => {
        lines.push(`${i + 1}. ${r.country} — ${Number(r.sessions).toLocaleString()} sessions`);
      });
    }

    if (deviceRows.length) {
      lines.push("\nDevices:");
      deviceRows.forEach((r) => {
        const pct = totalDeviceSessions > 0
          ? ((Number(r.sessions) / totalDeviceSessions) * 100).toFixed(1)
          : "0.0";
        lines.push(`• ${r.device_type} — ${Number(r.sessions).toLocaleString()} sessions (${pct}%)`);
      });
    }

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  });
}
