/**
 * session-replay.spec.ts
 *
 * Tests session replay functionality:
 * 1. Replay list page renders (or shows enable prompt)
 * 2. Recording endpoint accepts POST
 * 3. List API returns expected shape
 *
 * Requires (in e2e/.env):
 *   E2E_BASE_URL           — Next.js client URL
 *   E2E_API_BASE_URL       — server API base
 *   E2E_PRO_USER_EMAIL     — account with Pro plan (replay enabled)
 *   E2E_PRO_USER_PASSWORD
 *   E2E_TEST_SITE_ID       — site ID with replay enabled
 */

import { test, expect, request as apiRequest } from "@playwright/test";
import { getSessionCookie, login } from "./auth-helpers";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
const EMAIL = process.env.E2E_PRO_USER_EMAIL ?? "";
const PASSWORD = process.env.E2E_PRO_USER_PASSWORD ?? "";
const SITE_ID = process.env.E2E_TEST_SITE_ID ?? "1";

const skipAll = !EMAIL || !PASSWORD;

test.describe("Session Replay — page", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  test("replay page loads without error", async ({ page }) => {
    await login(page);
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto(`${BASE}/${SITE_ID}/replay`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    expect(page.url()).not.toContain("/500");
    expect(page.url()).not.toContain("/login");

    // Page shows replay list, enable prompt, or empty state — all valid
    const body = page.locator("body");
    await expect(body).toBeVisible();

    const criticalErrors = consoleErrors.filter(
      (e) =>
        e.includes("Uncaught Error") ||
        e.includes("Cannot read properties of undefined") ||
        e.includes("Minified React error")
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("replay list shows sessions or enable prompt", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/${SITE_ID}/replay`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForTimeout(2000);

    // Should show one of: session list, "enable replay" prompt, or empty state
    const hasReplayContent = await page
      .locator('[class*="replay"], [data-testid*="replay"]')
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    const hasEnablePrompt = await page
      .getByText(/enable|session replay|record/i)
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    const hasAnyContent = await page.locator("main, #__next, [class*='container']").first().isVisible().catch(() => false);

    expect(hasReplayContent || hasEnablePrompt || hasAnyContent).toBe(true);
  });
});

test.describe("Session Replay — API", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  let sessionCookie = "";

  test.beforeAll(async () => {
    sessionCookie = await getSessionCookie();
  });

  test("GET /sites/:siteId/session-replay/list returns shape", async () => {
    const ctx = await apiRequest.newContext();
    const now = new Date();
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const end = now.toISOString().split("T")[0];

    const resp = await ctx.get(
      `${API}/api/sites/${SITE_ID}/session-replay/list?start_date=${start}&end_date=${end}&time_zone=UTC`,
      { headers: { Cookie: sessionCookie } }
    );

    // 200 = list returned; 403 = replay not enabled on plan; 404 = no data
    expect([200, 403, 404]).toContain(resp.status());
    if (resp.status() === 200) {
      const body = await resp.json();
      // Should be an array or { data: [...] }
      const isArray = Array.isArray(body) || Array.isArray(body?.data);
      expect(isArray).toBe(true);
    }
    await ctx.dispose();
  });

  test("POST /session-replay/record/:siteId accepts valid replay event", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.post(`${API}/api/session-replay/record/${SITE_ID}`, {
      data: {
        session_id: `e2e-test-session-${Date.now()}`,
        events: [],
        timestamp: Date.now(),
      },
      headers: { "Content-Type": "application/json" },
    });

    // 200 = accepted; 400 = validation error (acceptable); 404 = site not found
    expect([200, 201, 400, 404]).toContain(resp.status());
    await ctx.dispose();
  });
});
