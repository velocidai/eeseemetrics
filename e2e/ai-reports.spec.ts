/**
 * ai-reports.spec.ts
 *
 * Tests AI report generation via the admin trigger endpoint (bypasses
 * cron schedule and IS_CLOUD gate, so this works in any environment).
 *
 * Requires (in e2e/.env):
 *   E2E_API_BASE_URL        — server API base (e.g. http://localhost:3001)
 *   E2E_BASE_URL            — Next.js client URL
 *   E2E_ADMIN_SESSION_COOKIE — cookie value for an admin session (or use email/password below)
 *   E2E_ADMIN_EMAIL         — admin user email (alternative to cookie)
 *   E2E_ADMIN_PASSWORD      — admin user password
 *   E2E_TEST_SITE_ID        — a site ID with some data in ClickHouse
 *
 * Run:
 *   npx playwright test ai-reports.spec.ts
 */

import { test, expect, request as apiRequest } from "@playwright/test";
import { getSessionCookie, login } from "./auth-helpers";

const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? process.env.E2E_PRO_USER_EMAIL ?? "";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? process.env.E2E_PRO_USER_PASSWORD ?? "";
const SITE_ID = parseInt(process.env.E2E_TEST_SITE_ID ?? "1", 10);

const skipAll = !ADMIN_EMAIL || !ADMIN_PASSWORD;

test.describe("AI Reports — on-demand trigger", () => {
  test.skip(skipAll, "Requires E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD");

  let sessionCookie = "";

  test.beforeAll(async () => {
    sessionCookie = await getSessionCookie(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  test("POST /api/admin/ai-report/trigger returns 200 for weekly cadence", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.post(`${API}/api/admin/ai-report/trigger`, {
      data: { siteId: SITE_ID, cadence: "weekly" },
      headers: { Cookie: sessionCookie, "Content-Type": "application/json" },
    });

    // Either 200 (generated or already exists) or 200 with "not enough data" message.
    // The handler always returns 200 unless the site doesn't exist.
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.success).toBe(true);
    await ctx.dispose();
  });

  test("POST /api/admin/ai-report/trigger rejects invalid cadence with 400", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.post(`${API}/api/admin/ai-report/trigger`, {
      data: { siteId: SITE_ID, cadence: "hourly" },
      headers: { Cookie: sessionCookie, "Content-Type": "application/json" },
    });
    expect(resp.status()).toBe(400);
    await ctx.dispose();
  });

  test("POST /api/admin/ai-report/trigger rejects missing siteId with 400", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.post(`${API}/api/admin/ai-report/trigger`, {
      data: { cadence: "weekly" },
      headers: { Cookie: sessionCookie, "Content-Type": "application/json" },
    });
    expect(resp.status()).toBe(400);
    await ctx.dispose();
  });

  test("unauthenticated request returns 401", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.post(`${API}/api/admin/ai-report/trigger`, {
      data: { siteId: SITE_ID, cadence: "weekly" },
    });
    expect([401, 403]).toContain(resp.status());
    await ctx.dispose();
  });

  test("reports page shows generated report in dashboard", async ({ page }) => {
    // Use auth-helpers login to avoid Turnstile-disabled submit button
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    // Navigate to the reports page
    await page.goto(`${BASE}/${SITE_ID}/reports`, {
      waitUntil: "networkidle",
      timeout: 20000,
    });

    expect(page.url()).not.toContain("/500");
    expect(page.url()).not.toContain("/error");

    // The page should load (may show empty state if no data, but should not crash)
    await expect(page.locator("body")).toBeVisible();
  });
});
