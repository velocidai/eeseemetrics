import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../db/postgres/postgres.js";
import { aiReports } from "../../../db/postgres/schema.js";
import type { McpTokenContext } from "../auth.js";
import type { AiReportStructuredSummary } from "../../../services/aiReports/aiReportTypes.js";

const inputSchema = {
  cadence: z.enum(["weekly", "monthly", "quarterly", "yearly"]).optional().describe("Report cadence to fetch. Defaults to weekly."),
};

export function registerLatestReportTool(server: McpServer, ctx: McpTokenContext) {
  // @ts-ignore — MCP SDK Zod schema inference exceeds TS depth limit; works at runtime
  server.tool(
    "get_latest_report",
    "Get the most recent AI-generated insights report for the site.",
    inputSchema,
    async ({ cadence = "weekly" }) => {
      const rows = await db
        .select()
        .from(aiReports)
        .where(
          and(
            eq(aiReports.siteId, ctx.siteId),
            eq(aiReports.cadence, cadence),
            eq(aiReports.status, "complete")
          )
        )
        .orderBy(desc(aiReports.periodStart))
        .limit(1);

      const report = rows[0];
      if (!report) {
        return {
          content: [{
            type: "text" as const,
            text: `No completed ${cadence} report found for ${ctx.siteDomain}. Reports are generated automatically on schedule.`,
          }],
        };
      }

      const s = report.structuredSummaryJson as AiReportStructuredSummary | null;
      if (!s) return { content: [{ type: "text" as const, text: "Report data is not available." }] };

      const ov = s.overview;
      const lines = [
        `${cadence.charAt(0).toUpperCase() + cadence.slice(1)} report for ${ctx.siteDomain}`,
        `Period: ${s.period.start} to ${s.period.end}`,
        `Generated: ${report.createdAt}`,
        ``,
        `── Overview ──`,
        `Pageviews:       ${ov.pageviews.toLocaleString()}${ov.pageviewsChange != null ? ` (${ov.pageviewsChange > 0 ? "+" : ""}${ov.pageviewsChange}% vs prev)` : ""}`,
        `Sessions:        ${ov.sessions.toLocaleString()}${ov.sessionsChange != null ? ` (${ov.sessionsChange > 0 ? "+" : ""}${ov.sessionsChange}% vs prev)` : ""}`,
        `Unique visitors: ${ov.uniqueVisitors.toLocaleString()}${ov.usersChange != null ? ` (${ov.usersChange > 0 ? "+" : ""}${ov.usersChange}% vs prev)` : ""}`,
        `Bounce rate:     ${ov.bounceRate != null ? ov.bounceRate.toFixed(1) + "%" : "N/A"}`,
        `Avg session:     ${typeof ov.avgSessionDuration === "number" ? ov.avgSessionDuration.toFixed(1) : ov.avgSessionDuration}s`,
        ``,
        `── Summary ──`,
        s.summary,
        ``,
        `── Highlights ──`,
        ...s.highlights.map(h => `• [${h.type}] ${h.metric}: ${h.observation}`),
        ``,
        `── Recommendations ──`,
        ...s.recommendations.map((r, i) => `${i + 1}. ${r}`),
      ];

      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    }
  );
}
