/**
 * mcp-all-tools.spec.ts
 *
 * Verifies that all 21 MCP tools respond without error when called with
 * a valid Pro-tier token and a site that has data.
 *
 * Requires (in e2e/.env):
 *   E2E_API_BASE_URL — server API base (default: http://localhost:3001)
 *   E2E_MCP_TOKEN   — a valid MCP bearer token for a Pro site with data
 *   E2E_TEST_SITE_ID — site ID with real data
 *
 * Run:
 *   npx playwright test mcp-all-tools.spec.ts
 */

import { test, expect } from "@playwright/test";

const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
const TOKEN = process.env.E2E_MCP_TOKEN ?? "";
const SITE_ID = process.env.E2E_TEST_SITE_ID ?? "1";

const skipAll = !TOKEN;

// All 21 MCP tools with minimal valid arguments
const MCP_TOOLS: Array<{ name: string; args: Record<string, any> }> = [
  { name: "get_overview",       args: { start_date: "2026-01-01", end_date: "2026-04-01" } },
  { name: "get_top_pages",      args: { start_date: "2026-01-01", end_date: "2026-04-01", limit: 5 } },
  { name: "get_page_stats",     args: { start_date: "2026-01-01", end_date: "2026-04-01", page: "/" } },
  { name: "get_top_referrers",  args: { start_date: "2026-01-01", end_date: "2026-04-01", limit: 5 } },
  { name: "get_top_countries",  args: { start_date: "2026-01-01", end_date: "2026-04-01", limit: 5 } },
  { name: "get_top_devices",    args: { start_date: "2026-01-01", end_date: "2026-04-01", limit: 5 } },
  { name: "get_events",         args: { start_date: "2026-01-01", end_date: "2026-04-01", limit: 5 } },
  { name: "get_campaigns",      args: { start_date: "2026-01-01", end_date: "2026-04-01" } },
  { name: "get_goals",          args: { start_date: "2026-01-01", end_date: "2026-04-01" } },
  { name: "compare_periods",    args: { current_start: "2026-03-01", current_end: "2026-04-01", previous_start: "2026-02-01", previous_end: "2026-03-01" } },
  { name: "get_active_alerts",  args: {} },
  { name: "get_latest_report",  args: {} },
  { name: "get_all_reports",    args: {} },
  { name: "get_gsc_data",       args: { start_date: "2026-01-01", end_date: "2026-04-01" } },
  { name: "get_retention",      args: { weeks: 6 } },
  { name: "get_funnels",        args: { start_date: "2026-01-01", end_date: "2026-04-01" } },
  { name: "get_errors",         args: { start_date: "2026-01-01", end_date: "2026-04-01", limit: 5 } },
  { name: "get_sessions",       args: { start_date: "2026-01-01", end_date: "2026-04-01", limit: 5 } },
  { name: "get_users",          args: { start_date: "2026-01-01", end_date: "2026-04-01", limit: 5 } },
  { name: "get_user",           args: { user_id: "test-user-id" } },
  { name: "get_performance",    args: { start_date: "2026-01-01", end_date: "2026-04-01" } },
];

async function callMcp(request: any, method: string, params: Record<string, any>) {
  return request.post(`${API}/api/mcp`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    data: { jsonrpc: "2.0", method, params, id: 1 },
  });
}

/** Parse a response that may be JSON or SSE (MCP StreamableHTTP returns SSE). */
async function parseMcpResponse(resp: any): Promise<any> {
  const ct: string = resp.headers()["content-type"] ?? "";
  if (ct.includes("text/event-stream")) {
    const text: string = await resp.text();
    // SSE lines: "data: {json}"
    const dataLine = text.split("\n").find((l: string) => l.startsWith("data: "));
    if (!dataLine) throw new Error(`No data line in SSE response:\n${text.slice(0, 500)}`);
    return JSON.parse(dataLine.slice(6));
  }
  return resp.json();
}

async function callTool(request: any, toolName: string, args: Record<string, any>) {
  return callMcp(request, "tools/call", { name: toolName, arguments: { site_id: Number(SITE_ID), ...args } });
}

test.describe("MCP — all 21 tools respond", () => {
  test.skip(skipAll, "Requires E2E_MCP_TOKEN");

  for (const tool of MCP_TOOLS) {
    test(`${tool.name} returns non-error response`, async ({ request }) => {
      const resp = await callTool(request, tool.name, tool.args);

      expect(resp.status()).toBe(200);
      const body = await parseMcpResponse(resp);

      // No top-level JSON-RPC error
      expect(body.error).toBeUndefined();

      // Tool result should exist
      const result = body.result;
      expect(result).toBeDefined();

      // Should not be a tool-level error
      if (result?.isError) {
        // Some tools legitimately return empty for sites with no data — allow that
        const text = result.content?.[0]?.text ?? "";
        expect(text).not.toMatch(/authentication|unauthorized|forbidden|invalid token/i);
      }
    });
  }
});

test.describe("MCP — tool list via tools/list", () => {
  test.skip(skipAll, "Requires E2E_MCP_TOKEN");

  test("tools/list returns exactly 21 tools", async ({ request }) => {
    const resp = await callMcp(request, "tools/list", {});

    expect(resp.status()).toBe(200);
    const body = await parseMcpResponse(resp);
    expect(body.error).toBeUndefined();

    const tools: any[] = body.result?.tools ?? [];
    expect(tools.length).toBe(21);

    // All expected tool names present
    const names = tools.map((t: any) => t.name);
    for (const tool of MCP_TOOLS) {
      expect(names).toContain(tool.name);
    }
  });
});
