import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../../db/postgres/postgres.js";
import { aiReports } from "../../../db/postgres/schema.js";
import type { McpTokenContext } from "../auth.js";

const inputSchema = {
  limit: z.number().int().min(1).max(20).optional().describe("Number of reports to return (default 10)."),
};

export function registerAllReportsTool(server: McpServer, ctx: McpTokenContext) {
  server.tool(
    "get_all_reports",
    "List all available AI-generated insights reports for the site. Scale plan only.",
    inputSchema,
    async ({ limit = 10 }) => {
      const rows = await db
        .select({
          id: aiReports.id,
          cadence: aiReports.cadence,
          periodStart: aiReports.periodStart,
          periodEnd: aiReports.periodEnd,
          createdAt: aiReports.createdAt,
        })
        .from(aiReports)
        .where(and(eq(aiReports.siteId, ctx.siteId), eq(aiReports.status, "complete")))
        .orderBy(desc(aiReports.periodStart))
        .limit(limit);

      if (!rows.length) return { content: [{ type: "text" as const, text: `No completed reports found for ${ctx.siteDomain}.` }] };

      const lines = [`AI reports for ${ctx.siteDomain} (${rows.length} found):\n`];
      rows.forEach((r, i) => {
        lines.push(`${i + 1}. [${r.cadence}] ${r.periodStart.slice(0, 10)} to ${r.periodEnd.slice(0, 10)} — generated ${r.createdAt.slice(0, 10)} — id: ${r.id}`);
      });
      lines.push(`\nUse get_latest_report to fetch the full content of the most recent report.`);

      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    }
  );
}
