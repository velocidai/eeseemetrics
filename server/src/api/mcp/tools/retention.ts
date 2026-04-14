import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { clickhouse } from "../../../db/clickhouse/clickhouse.js";
import type { McpTokenContext } from "../auth.js";

const inputSchema = {
  weeks: z.number().int().min(2).max(12).optional().describe("Number of weekly cohorts to analyse (default 6)."),
};

export function registerRetentionTool(server: McpServer, ctx: McpTokenContext) {
  server.tool("get_retention", "Get weekly cohort retention data showing what percentage of users return in subsequent weeks. Scale plan only.", inputSchema, async ({ weeks = 6 }) => {
    const query = `
      WITH
      FirstVisit AS (
        SELECT user_id, toMonday(MIN(toDate(timestamp))) AS cohort_week
        FROM events
        WHERE site_id = {siteId:Int32} AND user_id != ''
        GROUP BY user_id
      ),
      Activity AS (
        SELECT DISTINCT user_id, toMonday(toDate(timestamp)) AS active_week
        FROM events
        WHERE site_id = {siteId:Int32} AND user_id != ''
      )
      SELECT
        f.cohort_week,
        COUNT(DISTINCT f.user_id) AS cohort_size,
        dateDiff('week', f.cohort_week, a.active_week) AS week_num,
        COUNT(DISTINCT a.user_id) AS retained
      FROM FirstVisit f
      JOIN Activity a ON f.user_id = a.user_id AND a.active_week >= f.cohort_week
      WHERE f.cohort_week >= toMonday(today() - INTERVAL {weeks:Int32} WEEK)
        AND dateDiff('week', f.cohort_week, a.active_week) <= {weeks:Int32}
      GROUP BY f.cohort_week, week_num
      ORDER BY f.cohort_week, week_num
    `;

    const result = await clickhouse.query({ query, query_params: { siteId: ctx.siteId, weeks }, format: "JSONEachRow" });
    const rows = await result.json<{ cohort_week: string; cohort_size: number; week_num: number; retained: number }>();

    if (!rows.length) return { content: [{ type: "text" as const, text: "Not enough data for retention analysis." }] };

    const cohorts = new Map<string, { size: number; weeks: Map<number, number> }>();
    for (const r of rows) {
      if (!cohorts.has(r.cohort_week)) cohorts.set(r.cohort_week, { size: r.cohort_size, weeks: new Map() });
      cohorts.get(r.cohort_week)!.weeks.set(r.week_num, r.retained);
      if (r.week_num === 0) cohorts.get(r.cohort_week)!.size = r.retained;
    }

    const lines = [`Weekly retention for ${ctx.siteDomain} (last ${weeks} cohorts):\n`];
    for (const [week, data] of cohorts.entries()) {
      const weekStrs = Array.from({ length: weeks + 1 }, (_, i) => {
        const ret = data.weeks.get(i);
        if (ret == null) return " —  ";
        const pct = data.size > 0 ? Math.round((ret / data.size) * 100) : 0;
        return `${pct}%`.padStart(4);
      });
      lines.push(`Cohort ${week} (n=${data.size}): W0=${weekStrs[0]} ${weekStrs.slice(1).map((v, i) => `W${i + 1}=${v}`).join(" ")}`);
    }

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  });
}
