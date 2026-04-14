import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { eq } from "drizzle-orm";
import { db } from "../../../db/postgres/postgres.js";
import { gscConnections } from "../../../db/postgres/schema.js";
import { refreshGSCToken } from "../../gsc/utils.js";
import type { McpTokenContext } from "../auth.js";

const inputSchema = {
  start_date: z
    .string()
    .optional()
    .describe("Start date YYYY-MM-DD. Defaults to 28 days ago."),
  end_date: z
    .string()
    .optional()
    .describe(
      "End date YYYY-MM-DD. Defaults to 3 days ago (GSC data has a 2-3 day delay)."
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe("Max queries to return. Defaults to 10."),
};

export function registerGscDataTool(server: McpServer, ctx: McpTokenContext) {
  server.tool(
    "get_gsc_data",
    "Get Google Search Console data for the site (top search queries, clicks, impressions, CTR, avg position). Only available if GSC is connected.",
    inputSchema,
    async ({ start_date, end_date, limit = 10 }) => {
      const end =
        end_date ??
        new Date(Date.now() - 3 * 86400_000).toISOString().slice(0, 10);
      const start =
        start_date ??
        new Date(Date.now() - (3 + 31) * 86400_000).toISOString().slice(0, 10);

      // Check if GSC is connected for this site
      const connections = await db
        .select()
        .from(gscConnections)
        .where(eq(gscConnections.siteId, ctx.siteId))
        .limit(1);

      if (!connections.length) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Google Search Console is not connected for this site. Connect it in Settings > Integrations.",
            },
          ],
        };
      }

      const connection = connections[0];

      // Refresh the access token
      const accessToken = await refreshGSCToken(ctx.siteId);
      if (!accessToken) {
        return {
          content: [
            {
              type: "text" as const,
              text: "GSC access token could not be refreshed. Please reconnect Google Search Console in Settings.",
            },
          ],
        };
      }

      // Call the GSC Search Analytics API
      const apiUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
        connection.gscPropertyUrl
      )}/searchAnalytics/query`;

      let apiResult: Response;
      try {
        apiResult = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate: start,
            endDate: end,
            dimensions: ["query"],
            rowLimit: limit,
          }),
        });
      } catch {
        return {
          content: [
            {
              type: "text" as const,
              text: "Failed to fetch GSC data. The connection may need to be refreshed.",
            },
          ],
        };
      }

      if (!apiResult.ok) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Failed to fetch GSC data. The connection may need to be refreshed.",
            },
          ],
        };
      }

      const data = await apiResult.json() as {
        rows?: Array<{
          keys: string[];
          clicks: number;
          impressions: number;
          ctr: number;
          position: number;
        }>;
      };

      const rows = data.rows ?? [];

      if (!rows.length) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No GSC search query data found for ${ctx.siteDomain} (${start} to ${end}).`,
            },
          ],
        };
      }

      const lines = [
        `Top search queries for ${ctx.siteDomain} (${start} to ${end}):\n`,
      ];
      rows.forEach((r, i) => {
        const query = r.keys[0] ?? "(unknown)";
        const ctrPct = (r.ctr * 100).toFixed(1);
        const position = r.position.toFixed(1);
        lines.push(
          `${i + 1}. "${query}" — ${Number(r.clicks).toLocaleString()} clicks | ${Number(r.impressions).toLocaleString()} impressions | ${ctrPct}% CTR | pos ${position}`
        );
      });

      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    }
  );
}
