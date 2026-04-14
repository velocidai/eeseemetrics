import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { eq } from "drizzle-orm";
import SqlString from "sqlstring";
import { clickhouse } from "../../../db/clickhouse/clickhouse.js";
import { db } from "../../../db/postgres/postgres.js";
import { funnels } from "../../../db/postgres/schema.js";
import { patternToRegex } from "../../analytics/utils/utils.js";
import type { McpTokenContext } from "../auth.js";

const inputSchema = {
  start_date: z.string().optional().describe("Start date YYYY-MM-DD. Defaults to 30 days ago."),
  end_date: z.string().optional().describe("End date YYYY-MM-DD. Defaults to today."),
};

type FunnelStep = {
  value: string;
  name?: string;
  type: "page" | "event";
};

export function registerFunnelsTool(server: McpServer, ctx: McpTokenContext) {
  server.tool("get_funnels", "Get conversion funnel data for all funnels configured on the site. Scale plan only.", inputSchema, async ({ start_date, end_date }) => {
    const end = end_date ?? new Date().toISOString().slice(0, 10);
    const start = start_date ?? new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);

    const records = await db.select().from(funnels).where(eq(funnels.siteId, ctx.siteId));
    if (!records.length) return { content: [{ type: "text" as const, text: `No funnels configured for ${ctx.siteDomain}.` }] };

    const lines = [`Funnel data for ${ctx.siteDomain} (${start} to ${end}):\n`];

    for (const record of records) {
      const data = record.data as { name?: string; steps?: FunnelStep[] } | null;
      const steps: FunnelStep[] = data?.steps ?? [];
      const name = data?.name ?? "Unnamed Funnel";

      if (steps.length < 2) {
        lines.push(`Funnel: ${name} — (not enough steps configured)\n`);
        continue;
      }

      lines.push(`Funnel: ${name}`);

      const stepConditions = steps.map(step => {
        if (step.type === "page") {
          const safeRegex = patternToRegex(step.value).replace(/'/g, "\\'");
          return `type='pageview' AND match(pathname, '${safeRegex}')`;
        } else {
          return `type='custom_event' AND event_name=${SqlString.escape(step.value)}`;
        }
      });

      const whenClauses = stepConditions
        .map((cond, i) => `SUM(IF(${cond}, 1, 0)) OVER (PARTITION BY session_id ORDER BY timestamp) > 0 AS step_${i}`)
        .join(", ");

      const selectParts = stepConditions.map((_, i) => `COUNTIf(step_${i}) AS s${i}`).join(", ");

      const query = `
        SELECT ${selectParts}
        FROM (
          SELECT session_id, timestamp, type, pathname, event_name,
            ${whenClauses}
          FROM events
          WHERE site_id = ${SqlString.escape(ctx.siteId)}
            AND toDate(timestamp) BETWEEN ${SqlString.escape(start)} AND ${SqlString.escape(end)}
        )
        GROUP BY () -- aggregate all rows
      `;

      try {
        const result = await clickhouse.query({ query, format: "JSONEachRow" });
        const rows = await result.json<Record<string, number>>();
        const r = rows[0] ?? {};
        let prevCount: number | null = null;

        for (let i = 0; i < steps.length; i++) {
          const cnt = Number(r[`s${i}`] ?? 0);
          const label = steps[i].name ?? steps[i].value;
          const dropStr = prevCount != null && prevCount > 0
            ? ` (${Math.round((1 - cnt / prevCount) * 100)}% drop-off)`
            : "";
          lines.push(`  Step ${i + 1}: ${label} — ${cnt.toLocaleString()} sessions${dropStr}`);
          prevCount = cnt;
        }
      } catch {
        lines.push(`  (error computing funnel)`);
      }

      lines.push("");
    }

    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  });
}
