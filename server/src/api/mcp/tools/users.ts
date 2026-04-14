import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { eq, and, ilike, desc } from "drizzle-orm";
import { db } from "../../../db/postgres/postgres.js";
import { userProfiles } from "../../../db/postgres/schema.js";
import { clickhouse } from "../../../db/clickhouse/clickhouse.js";
import type { McpTokenContext } from "../auth.js";

const getUsersInputSchema = {
  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe("Number of identified users to return (default 20, max 50)."),
  search: z
    .string()
    .optional()
    .describe("Filter by user ID (partial match)."),
};

const getUserInputSchema = {
  user_id: z
    .string()
    .describe(
      "The identified user ID (from your identify() call, e.g. an email or your internal user ID)."
    ),
};

export function registerGetUsersTool(server: McpServer, ctx: McpTokenContext) {
  // @ts-ignore
  server.tool(
    "get_users",
    "List identified users for this site with their traits (email, name, plan, etc.). Returns users who have been identified via the identify() tracking call. Pro + Scale.",
    getUsersInputSchema,
    async ({ limit = 20, search }) => {
      const conditions = [eq(userProfiles.siteId, ctx.siteId)];
      if (search) {
        conditions.push(ilike(userProfiles.userId, `%${search}%`));
      }

      const rows = await db
        .select()
        .from(userProfiles)
        .where(and(...conditions))
        .orderBy(desc(userProfiles.updatedAt))
        .limit(limit);

      if (!rows.length) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No identified users found for ${ctx.siteDomain}. Users appear here after calling identify() from the tracking script.`,
            },
          ],
        };
      }

      const lines = [
        `Identified users for ${ctx.siteDomain} (${rows.length} shown):\n`,
      ];

      rows.forEach((row, i) => {
        const traits = row.traits as Record<string, unknown> | null;
        const traitsStr = traits
          ? Object.entries(traits)
              .map(([k, v]) => `${k}=${v}`)
              .join(", ")
          : "(none)";
        const firstSeen = row.createdAt
          ? new Date(row.createdAt).toISOString().slice(0, 10)
          : "unknown";
        const lastUpdated = row.updatedAt
          ? new Date(row.updatedAt).toISOString().slice(0, 10)
          : "unknown";

        lines.push(`${i + 1}. ${row.userId}`);
        lines.push(`   Traits: ${traitsStr}`);
        lines.push(
          `   First seen: ${firstSeen}  |  Last updated: ${lastUpdated}`
        );
        lines.push("");
      });

      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    }
  );
}

export function registerGetUserTool(server: McpServer, ctx: McpTokenContext) {
  // @ts-ignore
  server.tool(
    "get_user",
    "Look up a single identified user by their user ID. Returns their traits (email, name, plan, etc.) plus activity stats (sessions, pages visited). Pro + Scale.",
    getUserInputSchema,
    async ({ user_id }) => {
      const activityQuery = `
        SELECT
          COUNT(DISTINCT session_id) AS sessions,
          COUNT(*) AS total_events,
          MIN(timestamp) AS first_seen,
          MAX(timestamp) AS last_seen,
          COUNT(DISTINCT toDate(timestamp)) AS active_days
        FROM events
        WHERE site_id = {siteId:Int32}
          AND identified_user_id = {userId:String}
          AND identified_user_id != ''
      `;

      const topPagesQuery = `
        SELECT pathname, COUNT(*) AS views
        FROM events
        WHERE site_id = {siteId:Int32}
          AND identified_user_id = {userId:String}
          AND identified_user_id != ''
          AND type = 'pageview'
        GROUP BY pathname
        ORDER BY views DESC
        LIMIT 5
      `;

      const queryParams = { siteId: ctx.siteId, userId: user_id };

      const [profileRows, activityResult, topPagesResult] = await Promise.all([
        db
          .select()
          .from(userProfiles)
          .where(
            and(
              eq(userProfiles.siteId, ctx.siteId),
              eq(userProfiles.userId, user_id)
            )
          )
          .limit(1),
        clickhouse.query({
          query: activityQuery,
          query_params: queryParams,
          format: "JSONEachRow",
        }),
        clickhouse.query({
          query: topPagesQuery,
          query_params: queryParams,
          format: "JSONEachRow",
        }),
      ]);

      const [activityRows, topPageRows] = await Promise.all([
        activityResult.json<{
          sessions: number;
          total_events: number;
          first_seen: string;
          last_seen: string;
          active_days: number;
        }>(),
        topPagesResult.json<{ pathname: string; views: number }>(),
      ]);

      const profile = profileRows[0] ?? null;
      const activity = activityRows[0] ?? null;
      const sessions = activity ? Number(activity.sessions) : 0;

      if (!profile && sessions === 0) {
        return {
          content: [
            {
              type: "text" as const,
              text: `User '${user_id}' not found on ${ctx.siteDomain}.`,
            },
          ],
        };
      }

      const lines: string[] = [
        `User: ${user_id} on ${ctx.siteDomain}`,
        "",
      ];

      if (profile) {
        const traits = profile.traits as Record<string, unknown> | null;
        lines.push("Traits:");
        if (traits && Object.keys(traits).length > 0) {
          Object.entries(traits).forEach(([k, v]) => {
            lines.push(`  ${k}: ${v}`);
          });
        } else {
          lines.push("  (none)");
        }
        lines.push("");
      } else {
        lines.push("Note: No traits stored for this user.");
        lines.push("");
      }

      if (activity) {
        lines.push("Activity:");
        lines.push(`  Sessions:     ${Number(activity.sessions).toLocaleString()}`);
        lines.push(`  Total events: ${Number(activity.total_events).toLocaleString()}`);
        lines.push(`  Active days:  ${Number(activity.active_days).toLocaleString()}`);
        lines.push(`  First seen:   ${activity.first_seen}`);
        lines.push(`  Last seen:    ${activity.last_seen}`);
        lines.push("");
      }

      if (topPageRows.length) {
        lines.push("Top pages:");
        topPageRows.forEach((r, i) => {
          lines.push(`  ${i + 1}. ${r.pathname} — ${Number(r.views).toLocaleString()} views`);
        });
      }

      return { content: [{ type: "text" as const, text: lines.join("\n") }] };
    }
  );
}
