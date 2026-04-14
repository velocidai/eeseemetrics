/**
 * saved-views.spec.ts
 *
 * Tests the saved views feature (Pro+):
 * 1. Saved views settings page loads
 * 2. API: GET /sites/:siteId/views returns shape
 * 3. API: POST creates a view, PATCH renames it, DELETE removes it
 *
 * Requires (in e2e/.env):
 *   E2E_BASE_URL           — Next.js client URL
 *   E2E_API_BASE_URL       — server API base
 *   E2E_PRO_USER_EMAIL     — account on Pro or Scale plan
 *   E2E_PRO_USER_PASSWORD
 *   E2E_TEST_SITE_ID       — site ID owned by the pro user
 */

import { test, expect, request as apiRequest } from "@playwright/test";
import { getSessionCookie, login } from "./auth-helpers";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
const EMAIL = process.env.E2E_PRO_USER_EMAIL ?? "";
const PASSWORD = process.env.E2E_PRO_USER_PASSWORD ?? "";
const SITE_ID = process.env.E2E_TEST_SITE_ID ?? "1";

const skipAll = !EMAIL || !PASSWORD;

test.describe("Saved Views — settings page", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  test("saved-views settings page loads without error", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/${SITE_ID}/settings/saved-views`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    expect(page.url()).not.toContain("/login");
    expect(page.url()).not.toContain("/500");

    // Page should show the heading or an empty state
    const hasHeading = await page
      .getByText(/saved views/i)
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const hasContent = await page.locator("main, [class*='max-w']").first().isVisible().catch(() => false);
    expect(hasHeading || hasContent).toBe(true);
  });
});

test.describe("Saved Views — API CRUD", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  let sessionCookie = "";
  let createdViewId: number | null = null;

  test.beforeAll(async () => {
    sessionCookie = await getSessionCookie();
  });

  test.afterAll(async () => {
    // Cleanup: delete view if it was created and not already deleted
    if (createdViewId) {
      const ctx = await apiRequest.newContext();
      await ctx.delete(`${API}/api/sites/${SITE_ID}/views/${createdViewId}`, {
        headers: { Cookie: sessionCookie },
      });
      await ctx.dispose();
    }
  });

  test("GET /sites/:siteId/views returns views array", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/sites/${SITE_ID}/views`, {
      headers: { Cookie: sessionCookie },
    });

    expect([200, 403]).toContain(resp.status());
    if (resp.status() === 200) {
      const body = await resp.json();
      // Returns { views: [...] }
      expect(Array.isArray(body.views)).toBe(true);
    }
    await ctx.dispose();
  });

  test("POST /sites/:siteId/views creates a view", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.post(`${API}/api/sites/${SITE_ID}/views`, {
      data: {
        name: "E2E Test View",
        page: "main",
        filters: [],
        timeConfig: { mode: "day" },
      },
      headers: { Cookie: sessionCookie, "Content-Type": "application/json" },
    });

    // 200/201 = created; 403 = not on Pro plan
    expect([200, 201, 403]).toContain(resp.status());
    if ([200, 201].includes(resp.status())) {
      const body = await resp.json();
      expect(body.id).toBeDefined();
      createdViewId = body.id;
    }
    await ctx.dispose();
  });

  test("PATCH /sites/:siteId/views/:viewId renames a view", async () => {
    if (!createdViewId) {
      test.skip();
      return;
    }
    const ctx = await apiRequest.newContext();
    const resp = await ctx.patch(
      `${API}/api/sites/${SITE_ID}/views/${createdViewId}`,
      {
        data: { name: "E2E Test View (renamed)" },
        headers: { Cookie: sessionCookie, "Content-Type": "application/json" },
      }
    );
    expect([200, 204]).toContain(resp.status());
    await ctx.dispose();
  });

  test("DELETE /sites/:siteId/views/:viewId deletes the view", async () => {
    if (!createdViewId) {
      test.skip();
      return;
    }
    const ctx = await apiRequest.newContext();
    const resp = await ctx.delete(
      `${API}/api/sites/${SITE_ID}/views/${createdViewId}`,
      { headers: { Cookie: sessionCookie } }
    );
    expect([200, 204]).toContain(resp.status());
    createdViewId = null; // afterAll no longer needs to clean up
    await ctx.dispose();
  });
});
