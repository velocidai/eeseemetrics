import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { eq } from "drizzle-orm";
import SqlString from "sqlstring";
import { clickhouse } from "../../../db/clickhouse/clickhouse.js";
import { db } from "../../../db/postgres/postgres.js";
import { goals } from "../../../db/postgres/schema.js";
import { patternToRegex } from "../../analytics/utils/utils.js";
import type { McpTokenContext } from "../auth.js";

const inputSchema = {
  start_date: z.string().optional().describe("Start date YYYY-MM-DD. Defaults to 30 days ago."),
  end_date: z.string().optional().describe("End date YYYY-MM-DD. Defaults to today."),
};

export function registerGoalsTool(server: McpServer, ctx: McpTokenContext) {
  server.tool("get_goals", "Get goal conversion counts and rates for the site.", inputSchema, async ({ start_date, end_date }) => {
    const end = end_date ?? new Date().toISOString().slice(0, 10);
    const start = start_date ?? new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);

    const siteGoals = await db.select().from(goals).where(eq(goals.siteId, ctx.siteId));
    if (!siteGoals.length) return { content: [{ type: "text" as const, text: `No goals configured for ${ctx.siteDomain}.` }] };

    const clauses: string[] = [];
    for (const goal of siteGoals) {
      if (goal.goalType === "path") {
        const pattern = goal.config.pathPattern;
        if (!pattern) continue;
        const regex = patternToRegex(pattern);
        clauses.push(
          `COUNT(DISTINCT IF(type='pageview' AND match(pathname, ${SqlString.escape(regex)}), session_id, NULL)) AS g${goal.goalId}`
        );
      } else if (goal.goalType === "event") {
        const evName = goal.config.eventName;
        if (!evName) continue;
        clauses.push(
          `COUNT(DISTINCT IF(type='custom_event' AND event_name=${SqlString.escape(evName)}, session_id, NULL)) AS g${goal.goalId}`
        );
      }
    }

    if (!clauses.length) return { content: [{ type: "text" as const, text: "No valid goal configurations found." }] };

    const totalQ = `
      SELECT COUNT(DISTINCT session_id) AS total
      FROM events
      WHERE site_id = ${SqlString.escape(ctx.siteId)}
        AND toDate(timestamp) BETWEEN ${SqlString.escape(start)} AND ${SqlString.escape(end)}
    `;
    const convQ = `
      SELECT ${clauses.join(", ")}
      FROM events
      WHERE site_id = ${SqlString.escape(ctx.siteId)}
        AND toDate(timestamp) BETWEEN ${SqlString.escape(start)} AND ${SqlString.escape(end)}
    `;

    const [totalRes, convRes] = await Promise.all([
      clickhouse.query({ query: totalQ, format: "JSONEachRow" }),
      clickhouse.query({ query: convQ, format: "JSONEachRow" }),
    ]);
    const [totalRows, convRows] = await Promise.all([
      totalRes.json<{ total: number }>(),
      convRes.json<Record<string, number>>(),
    ]);

    const total = Number(totalRows[0]?.total ?? 0);
    const convData = convRows[0] ?? {};

    const lines = [`Goals for ${ctx.siteDomain} (${start} to ${end}) — ${total.toLocaleString()} total sessions:\n`];
    for (const goal of siteGoals) {
      const cnt = Number(convData[`g${goal.goalId}`] ?? 0);
      const rate = total > 0 ? ((cnt / total) * 100).toFixed(1) : "0.0";
      const label = goal.name ?? goal.config.pathPattern ?? goal.config.eventName ?? `Goal ${goal.goalId}`;
      lines.push(`• ${label}: ${cnt.toLocaleString()} conversions (${rate}%)`);
    }

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  });
}
