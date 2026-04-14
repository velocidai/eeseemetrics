// server/scripts/testMcpTools.ts
// Usage: cd server && SITE_ID=42 SITE_DOMAIN=example.com TIER=scale npx tsx scripts/testMcpTools.ts
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { registerTools } from "../src/api/mcp/tools/index.js";
import type { McpTokenContext } from "../src/api/mcp/auth.js";

const SITE_ID = Number(process.env.SITE_ID ?? "0");
const SITE_DOMAIN = process.env.SITE_DOMAIN ?? "example.com";
const TIER = (process.env.TIER ?? "scale") as "pro" | "scale";

if (!SITE_ID) {
  console.error("ERROR: Set SITE_ID env var");
  console.error("Usage: SITE_ID=42 SITE_DOMAIN=example.com TIER=scale npx tsx scripts/testMcpTools.ts");
  process.exit(1);
}

const ctx: McpTokenContext = {
  userId: "test-user",
  siteId: SITE_ID,
  siteDomain: SITE_DOMAIN,
  tier: TIER,
};

// All tool calls — params chosen to work with no required args
const toolCalls: Array<{ name: string; params: Record<string, unknown> }> = [
  // Pro + Scale
  { name: "get_overview", params: {} },
  { name: "get_overview", params: { country: "US", device: "desktop" } },  // filter test
  { name: "get_top_pages", params: { limit: 5 } },
  { name: "get_top_pages", params: { limit: 5, country: "DE" } },           // filter test
  { name: "get_top_referrers", params: { limit: 5 } },
  { name: "get_top_referrers", params: { limit: 5, page: "/" } },            // filter test
  { name: "get_top_countries", params: { limit: 5 } },
  { name: "get_top_countries", params: { limit: 5, device: "mobile" } },    // filter test
  { name: "get_top_devices", params: {} },
  { name: "get_active_alerts", params: {} },
  { name: "get_latest_report", params: {} },
  { name: "get_goals", params: {} },
  { name: "get_campaigns", params: {} },
  { name: "get_performance", params: {} },
  { name: "get_page_stats", params: { page: "/" } },
  { name: "get_events", params: { limit: 5 } },
  { name: "get_events", params: { limit: 5, country: "US" } },               // filter test
  { name: "get_users", params: { limit: 5 } },
  { name: "get_user", params: { user_id: "test@example.com" } },
  // Scale only
  ...(TIER === "scale"
    ? ([
        { name: "get_retention", params: {} },
        { name: "get_funnels", params: {} },
        { name: "get_errors", params: {} },
        { name: "get_sessions", params: { limit: 5 } },
        { name: "compare_periods", params: {
            current_start: new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10),
            current_end: new Date().toISOString().slice(0, 10),
            previous_start: new Date(Date.now() - 14 * 86400_000).toISOString().slice(0, 10),
            previous_end: new Date(Date.now() - 7 * 86400_000).toISOString().slice(0, 10),
          } },
        { name: "get_all_reports", params: {} },
        { name: "get_gsc_data", params: {} },
      ] as Array<{ name: string; params: Record<string, unknown> }>)
    : []),
];

async function main() {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`MCP Tool Test — site ${SITE_ID} (${SITE_DOMAIN}) tier=${TIER}`);
  console.log(`${"=".repeat(60)}\n`);

  const server = new McpServer({ name: "analytics-test", version: "1.0.0" });
  registerTools(server, ctx);

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);

  const client = new Client({ name: "test-client", version: "1.0.0" });
  await client.connect(clientTransport);

  const { tools } = await client.listTools();
  console.log(`Registered tools (${tools.length}): ${tools.map((t) => t.name).join(", ")}\n`);

  let passed = 0;
  let failed = 0;

  for (const call of toolCalls) {
    console.log(`─── ${call.name} ${"─".repeat(Math.max(0, 40 - call.name.length))}`);
    try {
      const result = await client.callTool({ name: call.name, arguments: call.params });
      if (result.content && Array.isArray(result.content)) {
        for (const c of result.content) {
          if ((c as { type: string; text?: string }).type === "text") {
            console.log((c as { type: string; text?: string }).text ?? "");
          }
        }
      }
      passed++;
    } catch (err) {
      console.error(`  ✗ ERROR: ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    }
    console.log();
  }

  await client.close();

  console.log("=".repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("=".repeat(60) + "\n");

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("MCP test script failed:", err);
  process.exit(1);
});
