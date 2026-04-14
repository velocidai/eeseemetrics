import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { clickhouse } from "../../../db/clickhouse/clickhouse.js";
import type { McpTokenContext } from "../auth.js";

const inputSchema = {
  current_start: z.string().describe("Start of the current period (YYYY-MM-DD)."),
  current_end: z.string().describe("End of the current period (YYYY-MM-DD)."),
  previous_start: z.string().describe("Start of the comparison period (YYYY-MM-DD)."),
  previous_end: z.string().describe("End of the comparison period (YYYY-MM-DD)."),
};

async function fetchMetrics(siteId: number, start: string, end: string) {
  const query = `
    WITH
    AllSP AS (
      SELECT session_id, COUNT(CASE WHEN type='pageview' THEN 1 END) AS pv
      FROM events WHERE site_id={siteId:Int32} AND toDate(timestamp) BETWEEN {start:String} AND {end:String}
      GROUP BY session_id
    )
    SELECT
      COUNT(DISTINCT session_id) AS sessions,
      SUM(pv) AS pageviews,
      COUNTIf(pv=1) * 100.0 / COUNT(session_id) AS bounce_rate
    FROM AllSP
  `;
  const result = await clickhouse.query({ query, query_params: { siteId, start, end }, format: "JSONEachRow" });
  const rows = await result.json<{ sessions: number; pageviews: number; bounce_rate: number }>();
  return rows[0] ?? { sessions: 0, pageviews: 0, bounce_rate: 0 };
}

function pct(curr: number, prev: number) {
  if (!prev) return "N/A";
  const v = ((curr - prev) / prev) * 100;
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}

export function registerComparePeriodsTool(server: McpServer, ctx: McpTokenContext) {
  // @ts-ignore — MCP SDK Zod schema inference exceeds TS depth limit; works at runtime
  server.tool("compare_periods", "Compare key metrics between two date ranges.", inputSchema, async ({ current_start, current_end, previous_start, previous_end }) => {
    const [curr, prev] = await Promise.all([
      fetchMetrics(ctx.siteId, current_start, current_end),
      fetchMetrics(ctx.siteId, previous_start, previous_end),
    ]);

    const lines = [
      `Period comparison for ${ctx.siteDomain}`,
      `Current:  ${current_start} to ${current_end}`,
      `Previous: ${previous_start} to ${previous_end}`,
      ``,
      `Metric         Current    Previous   Change`,
      `─────────────────────────────────────────────`,
      `Pageviews      ${String(Number(curr.pageviews)).padEnd(10)} ${String(Number(prev.pageviews)).padEnd(10)} ${pct(Number(curr.pageviews), Number(prev.pageviews))}`,
      `Sessions       ${String(Number(curr.sessions)).padEnd(10)} ${String(Number(prev.sessions)).padEnd(10)} ${pct(Number(curr.sessions), Number(prev.sessions))}`,
      `Bounce rate    ${(Number(curr.bounce_rate).toFixed(1) + "%").padEnd(10)} ${(Number(prev.bounce_rate).toFixed(1) + "%").padEnd(10)} ${pct(Number(curr.bounce_rate), Number(prev.bounce_rate))}`,
    ];

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  });
}
