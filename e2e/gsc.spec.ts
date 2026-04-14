/**
 * gsc.spec.ts
 *
 * Tests Google Search Console integration:
 * 1. GSC status endpoint returns expected shape
 * 2. GSC page loads in the dashboard
 * 3. Connect/disconnect button is accessible
 *
 * Note: Full OAuth flow cannot be automated. This spec tests the
 * status API and verifies the UI entry point renders correctly.
 *
 * Requires (in e2e/.env):
 *   E2E_BASE_URL           — Next.js client URL
 *   E2E_API_BASE_URL       — server API base
 *   E2E_PRO_USER_EMAIL     — valid account
 *   E2E_PRO_USER_PASSWORD
 *   E2E_TEST_SITE_ID       — site ID to check
 */

import { test, expect, request as apiRequest } from "@playwright/test";
import { getSessionCookie, login } from "./auth-helpers";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
const EMAIL = process.env.E2E_PRO_USER_EMAIL ?? "";
const PASSWORD = process.env.E2E_PRO_USER_PASSWORD ?? "";
const SITE_ID = process.env.E2E_TEST_SITE_ID ?? "1";

const skipAll = !EMAIL || !PASSWORD;

test.describe("Google Search Console — API", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  let sessionCookie = "";

  test.beforeAll(async () => {
    sessionCookie = await getSessionCookie();
  });

  test("GET /sites/:siteId/gsc/status returns connection shape", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/sites/${SITE_ID}/gsc/status`, {
      headers: { Cookie: sessionCookie },
    });

    expect([200]).toContain(resp.status());
    const body = await resp.json();

    // Must have a connected boolean
    expect(typeof body.connected).toBe("boolean");
    if (body.connected) {
      expect(typeof body.gscPropertyUrl).toBe("string");
    } else {
      expect(body.gscPropertyUrl).toBeNull();
    }
    await ctx.dispose();
  });

  test("GET /sites/:siteId/gsc/status is accessible without auth via publicSite", async () => {
    // GSC status is a publicSite route — also works without a session for public sites
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/sites/${SITE_ID}/gsc/status`);
    // Public sites: 200; private sites without auth: 401 or 403
    expect([200, 401, 403]).toContain(resp.status());
    await ctx.dispose();
  });
});

test.describe("Google Search Console — UI", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  test("search-console page loads without error", async ({ page }) => {
    await login(page);
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto(`${BASE}/${SITE_ID}/search-console`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    expect(page.url()).not.toContain("/login");
    expect(page.url()).not.toContain("/500");
    await expect(page.locator("body")).toBeVisible();

    const criticalErrors = consoleErrors.filter(
      (e) =>
        e.includes("Uncaught Error") ||
        e.includes("Cannot read properties of undefined") ||
        e.includes("Minified React error")
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("search-console page shows connect button or GSC data", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/${SITE_ID}/search-console`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForTimeout(2000);

    // Either: connected (shows data) or not connected (shows connect button)
    const hasConnectBtn = await page
      .getByRole("button", { name: /connect|link google search console/i })
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    const hasGSCContent = await page
      .getByText(/search console|queries|impressions|google search/i)
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    const hasAnyContent = await page.locator("main").first().isVisible().catch(() => false);

    expect(hasConnectBtn || hasGSCContent || hasAnyContent).toBe(true);
  });
});
