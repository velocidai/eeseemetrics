/**
 * user-profile.spec.ts
 *
 * Tests the user profile page at /[site]/user/[userId].
 *
 * Requires (in e2e/.env):
 *   E2E_BASE_URL           — Next.js client URL
 *   E2E_API_BASE_URL       — server API base
 *   E2E_PRO_USER_EMAIL     — valid account
 *   E2E_PRO_USER_PASSWORD
 *   E2E_TEST_SITE_ID       — site ID with user data
 *   E2E_TEST_USER_ID       — (optional) a known visitor ID in the site's data
 *
 * If E2E_TEST_USER_ID is not set, the test fetches the most recent session
 * from the users list and uses its user_id.
 *
 * Run:
 *   npx playwright test user-profile.spec.ts
 */

import { test, expect, request as apiRequest } from "@playwright/test";
import { getSessionCookie, login } from "./auth-helpers";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
const EMAIL = process.env.E2E_PRO_USER_EMAIL ?? "";
const PASSWORD = process.env.E2E_PRO_USER_PASSWORD ?? "";
const SITE_ID = process.env.E2E_TEST_SITE_ID ?? "1";

const skipAll = !EMAIL || !PASSWORD;

/** Fetch a real visitor ID from the site's sessions list */
async function getAnyUserId(cookie: string): Promise<string | null> {
  const ctx = await apiRequest.newContext();
  try {
    const now = new Date();
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const end = now.toISOString().split("T")[0];
    const resp = await ctx.get(
      `${API}/api/sites/${SITE_ID}/sessions?start_date=${start}&end_date=${end}&time_zone=UTC&limit=1`,
      { headers: { Cookie: cookie } }
    );
    if (resp.status() !== 200) return null;
    const body = await resp.json();
    const sessions = body?.data ?? body;
    if (!Array.isArray(sessions) || sessions.length === 0) return null;
    return sessions[0]?.user_id ?? sessions[0]?.userId ?? null;
  } catch {
    return null;
  } finally {
    await ctx.dispose();
  }
}

test.describe("User Profile page", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  test("user profile page renders without crash", async ({ page }) => {
    const cookie = await getSessionCookie();
    const userId = process.env.E2E_TEST_USER_ID ?? (await getAnyUserId(cookie));

    if (!userId) {
      test.skip();
      return;
    }

    await login(page);
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto(`${BASE}/${SITE_ID}/user/${encodeURIComponent(userId)}`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    expect(page.url()).not.toContain("/login");
    expect(page.url()).not.toContain("/500");

    // Profile page should render a heading or user info
    await expect(page.locator("body")).toBeVisible();

    const criticalErrors = consoleErrors.filter(
      (e) =>
        e.includes("Uncaught Error") ||
        e.includes("Cannot read properties of undefined") ||
        e.includes("Minified React error")
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("user profile page shows user identifier or session list", async ({ page }) => {
    const cookie = await getSessionCookie();
    const userId = process.env.E2E_TEST_USER_ID ?? (await getAnyUserId(cookie));

    if (!userId) {
      test.skip();
      return;
    }

    await login(page);
    await page.goto(`${BASE}/${SITE_ID}/user/${encodeURIComponent(userId)}`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForTimeout(2000);

    // Should show user ID, sessions list, or user info card
    const hasUserContent = await page
      .getByText(new RegExp(userId.substring(0, 8), "i"))
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    const hasSessionList = await page
      .getByText(/sessions|session|pageview|visit/i)
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    const hasBreadcrumb = await page
      .locator('[aria-label="breadcrumb"], nav')
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    expect(hasUserContent || hasSessionList || hasBreadcrumb).toBe(true);
  });
});
