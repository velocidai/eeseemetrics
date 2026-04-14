import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { clickhouse } from "../../../db/clickhouse/clickhouse.js";
import type { McpTokenContext } from "../auth.js";

const inputSchema = {
  start_date: z
    .string()
    .optional()
    .describe("Start date YYYY-MM-DD. Defaults to 30 days ago."),
  end_date: z
    .string()
    .optional()
    .describe("End date YYYY-MM-DD. Defaults to today."),
};

function lcpRating(ms: number): string {
  if (ms < 2500) return "Good";
  if (ms < 4000) return "Needs Improvement";
  return "Poor";
}

function clsRating(value: number): string {
  if (value < 0.1) return "Good";
  if (value < 0.25) return "Needs Improvement";
  return "Poor";
}

function inpRating(ms: number): string {
  if (ms < 200) return "Good";
  if (ms < 500) return "Needs Improvement";
  return "Poor";
}

export function registerPerformanceTool(server: McpServer, ctx: McpTokenContext) {
  server.tool(
    "get_performance",
    "Get Core Web Vitals performance metrics (LCP, CLS, INP) for the site. Returns p50 and p75 percentiles with Good/Needs Improvement/Poor ratings.",
    inputSchema,
    async ({ start_date, end_date }) => {
      const end = end_date ?? new Date().toISOString().slice(0, 10);
      const start =
        start_date ?? new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);

      const query = `
        SELECT
          ROUND(quantile(0.5)(lcp), 0)  AS lcp_p50,
          ROUND(quantile(0.75)(lcp), 0) AS lcp_p75,
          ROUND(quantile(0.5)(cls), 3)  AS cls_p50,
          ROUND(quantile(0.75)(cls), 3) AS cls_p75,
          ROUND(quantile(0.5)(inp), 0)  AS inp_p50,
          ROUND(quantile(0.75)(inp), 0) AS inp_p75,
          COUNT(*) AS sample_count
        FROM events
        WHERE site_id = {siteId:Int32}
          AND type = 'performance'
          AND toDate(timestamp) BETWEEN {start:String} AND {end:String}
          AND lcp > 0
      `;

      const result = await clickhouse.query({
        query,
        query_params: { siteId: ctx.siteId, start, end },
        format: "JSONEachRow",
      });
      const rows = await result.json<{
        lcp_p50: number;
        lcp_p75: number;
        cls_p50: number;
        cls_p75: number;
        inp_p50: number;
        inp_p75: number;
        sample_count: number;
      }>();

      const row = rows[0];
      if (!row || Number(row.sample_count) === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: "No performance data found. Make sure the performance tracking script is installed.",
            },
          ],
        };
      }

      const lcp_p50 = Number(row.lcp_p50);
      const lcp_p75 = Number(row.lcp_p75);
      const cls_p50 = Number(row.cls_p50);
      const cls_p75 = Number(row.cls_p75);
      const inp_p50 = Number(row.inp_p50);
      const inp_p75 = Number(row.inp_p75);
      const sampleCount = Number(row.sample_count);

      const lines = [
        `Core Web Vitals for ${ctx.siteDomain} (${start} to ${end})`,
        `Based on ${sampleCount.toLocaleString()} measurements`,
        ``,
        `LCP (Largest Contentful Paint):  p50=${lcp_p50.toLocaleString()}ms [${lcpRating(lcp_p50)}]  p75=${lcp_p75.toLocaleString()}ms [${lcpRating(lcp_p75)}]`,
        `CLS (Cumulative Layout Shift):   p50=${cls_p50.toFixed(3)} [${clsRating(cls_p50)}]    p75=${cls_p75.toFixed(3)} [${clsRating(cls_p75)}]`,
        `INP (Interaction to Next Paint): p50=${inp_p50.toLocaleString()}ms [${inpRating(inp_p50)}]     p75=${inp_p75.toLocaleString()}ms [${inpRating(inp_p75)}]`,
      ];

      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    }
  );
}
