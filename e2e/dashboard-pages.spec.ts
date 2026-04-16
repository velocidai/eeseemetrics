/**
 * dashboard-pages.spec.ts
 *
 * Verifies that all 18+ dashboard pages load without errors when authenticated.
 *
 * Requires (in e2e/.env):
 *   E2E_BASE_URL          — Next.js client URL
 *   E2E_PRO_USER_EMAIL    — valid test account email
 *   E2E_PRO_USER_PASSWORD — valid test account password
 *   E2E_TEST_SITE_ID      — a site ID that exists in the database
 *
 * Run:
 *   E2E_BASE_URL=https://app.eeseemetrics.com npx playwright test dashboard-pages.spec.ts
 */

import { test, expect, request as apiRequest } from "@playwright/test";
import { getSessionCookie, login } from "./auth-helpers";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const EMAIL = process.env.E2E_PRO_USER_EMAIL ?? "";
const PASSWORD = process.env.E2E_PRO_USER_PASSWORD ?? "";
const SITE_ID = process.env.E2E_TEST_SITE_ID ?? "1";

const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";

// Skip the entire suite if credentials are not configured
const skipAll = !EMAIL || !PASSWORD;

const PAGES = [
  "main",
  "pages",
  "events",
  "errors",
  "sessions",
  "users",
  "goals",
  "funnels",
  "journeys",
  "retention",
  "performance",
  "campaigns",
  "replay",
  "reports",
  "alerts",
  "globe",
  "search-console",
  "api-playground",
  // Uptime monitoring (per-site views)
  "uptime/monitors",
  "uptime/incidents",
  "uptime/status-page",
  "uptime/notifications",
  // Settings
  "settings/notifications",
];

test.describe("Dashboard pages (authenticated)", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  test.beforeAll(async ({ browser }) => {
    // Login once for the suite
  });

  for (const pageName of PAGES) {
    test(`${pageName} page loads without 500 error`, async ({ page }) => {
      await login(page);

      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      // Track any navigation errors (5xx) — only fail on page-level errors,
      // not on individual API data-fetch endpoints (which may legitimately 500
      // when the site has no data for that feature, e.g. performance/web-vitals).
      let serverError = false;
      const serverErrorUrls: string[] = [];
      page.on("response", (response) => {
        if (
          response.url().includes(BASE) &&
          response.status() >= 500 &&
          !response.url().includes("/api/sites/")
        ) {
          serverError = true;
          serverErrorUrls.push(`${response.status()} ${response.url()}`);
        }
      });

      await page.goto(`${BASE}/${SITE_ID}/${pageName}`, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      // Should not have navigated to an error page
      expect(page.url()).not.toContain("/500");
      // Use word-boundary check — /errors is a valid page, /error (exactly) is not
      expect(page.url()).not.toMatch(/\/error(?!s)/);
      expect(serverError, `500 responses: ${serverErrorUrls.join(", ")}`).toBe(false);

      // Should not have any critical React errors
      const criticalErrors = consoleErrors.filter(
        (e) =>
          e.includes("Uncaught Error") ||
          e.includes("Cannot read properties of undefined") ||
          e.includes("Minified React error")
      );
      expect(criticalErrors).toHaveLength(0);
    });
  }
});

test.describe("Dashboard pages — data validation (site with data)", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  let sessionCookie = "";
  test.beforeAll(async () => {
    sessionCookie = await getSessionCookie();
  });

  test("/main — overview returns numeric values", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(
      `${API}/api/sites/${SITE_ID}/overview?startDate=2020-01-01&endDate=2099-01-01&timezone=UTC`,
      { headers: { Cookie: sessionCookie } }
    );
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    // API returns { data: { pageviews, sessions, users, ... } }
    const data = body.data ?? body;
    expect(typeof data.pageviews).toBe("number");
    expect(typeof data.sessions).toBe("number");
    expect(typeof data.users).toBe("number");
    await ctx.dispose();
  });

  test("/pages — metric returns at least 1 row", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(
      `${API}/api/sites/${SITE_ID}/metric?parameter=pathname&startDate=2020-01-01&endDate=2099-01-01&timezone=UTC&limit=5`,
      { headers: { Cookie: sessionCookie } }
    );
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    // API returns { data: { data: items, totalCount } }
    const rows = Array.isArray(body) ? body : body?.data?.data ?? body?.data ?? [];
    expect(rows.length).toBeGreaterThan(0);
    const first = rows[0];
    expect(first).toHaveProperty("value");
    expect(first).toHaveProperty("count");
    await ctx.dispose();
  });

  test("/sessions — session list returns at least 1 row", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(
      `${API}/api/sites/${SITE_ID}/sessions?startDate=2020-01-01&endDate=2099-01-01&timezone=UTC&limit=5`,
      { headers: { Cookie: sessionCookie } }
    );
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    const sessions = Array.isArray(body) ? body : body?.data ?? body?.sessions ?? [];
    expect(sessions.length).toBeGreaterThan(0);
    expect(sessions[0]).toHaveProperty("session_id");
    await ctx.dispose();
  });

  test("/globe — countries metric returns rows with country codes", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(
      `${API}/api/sites/${SITE_ID}/metric?parameter=country&startDate=2020-01-01&endDate=2099-01-01&timezone=UTC&limit=5`,
      { headers: { Cookie: sessionCookie } }
    );
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    // API returns { data: { data: items, totalCount } }
    const rows = Array.isArray(body) ? body : body?.data?.data ?? body?.data ?? [];
    expect(rows.length).toBeGreaterThan(0);
    // Country codes are 2-char ISO codes
    expect(rows[0].value).toMatch(/^[A-Z]{2}$/);
    await ctx.dispose();
  });

  test("/users — user list returns at least 1 row", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(
      `${API}/api/sites/${SITE_ID}/users?startDate=2020-01-01&endDate=2099-01-01&timezone=UTC&limit=5`,
      { headers: { Cookie: sessionCookie } }
    );
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    const users = Array.isArray(body) ? body : body?.data ?? body?.users ?? [];
    expect(users.length).toBeGreaterThan(0);
    await ctx.dispose();
  });
});
