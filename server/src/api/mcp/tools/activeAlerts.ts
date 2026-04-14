import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { eq, and } from "drizzle-orm";
import { db } from "../../../db/postgres/postgres.js";
import { anomalyAlerts } from "../../../db/postgres/schema.js";
import type { McpTokenContext } from "../auth.js";

export function registerActiveAlertsTool(server: McpServer, ctx: McpTokenContext) {
  server.tool(
    "get_active_alerts",
    "Get current unresolved anomaly alerts for the site. Returns alerts with status 'new' or 'seen'.",
    {},
    async () => {
      const rows = await db
        .select()
        .from(anomalyAlerts)
        .where(
          and(
            eq(anomalyAlerts.siteId, ctx.siteId),
            eq(anomalyAlerts.status, "new")
          )
        )
        .orderBy(anomalyAlerts.detectedAt)
        .limit(20);

      if (!rows.length) {
        return { content: [{ type: "text" as const, text: `No active anomaly alerts for ${ctx.siteDomain}.` }] };
      }

      const lines = [`Active anomaly alerts for ${ctx.siteDomain}:\n`];
      rows.forEach((a, i) => {
        const dir = a.percentChange > 0 ? "spike" : "drop";
        const sign = a.percentChange > 0 ? "+" : "";
        lines.push(
          `${i + 1}. [${a.severity.toUpperCase()}] ${a.metric} ${dir} — ${sign}${a.percentChange.toFixed(1)}% ` +
          `(current: ${a.currentValue.toFixed(1)}, baseline: ${a.baselineValue.toFixed(1)}) — detected ${a.detectedAt}`
        );
      });

      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    }
  );
}
