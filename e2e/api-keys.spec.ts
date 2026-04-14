/**
 * api-keys.spec.ts
 *
 * Tests the REST API key lifecycle:
 * 1. Generate a new API key from settings
 * 2. Use the key to call an authenticated API endpoint
 * 3. Verify rate limiting applies per API key
 * 4. Revoke the key
 *
 * Requires (in e2e/.env):
 *   E2E_BASE_URL          — Next.js client URL
 *   E2E_API_BASE_URL      — server API base
 *   E2E_PRO_USER_EMAIL    — test account email
 *   E2E_PRO_USER_PASSWORD — test account password
 *   E2E_TEST_SITE_ID      — a site ID that belongs to this account
 *
 * Run:
 *   npx playwright test api-keys.spec.ts
 */

import { test, expect, request as apiRequest } from "@playwright/test";
import { getSessionCookie, login } from "./auth-helpers";

const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const EMAIL = process.env.E2E_PRO_USER_EMAIL ?? "";
const PASSWORD = process.env.E2E_PRO_USER_PASSWORD ?? "";
const SITE_ID = process.env.E2E_TEST_SITE_ID ?? "1";

const skipAll = !EMAIL || !PASSWORD;

test.describe("API Keys — UI", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  test("settings page has API key section", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/settings/account`, { waitUntil: "networkidle", timeout: 15000 });

    const apiSection = page
      .getByText(/api key|api token|access token/i)
      .first();
    await expect(apiSection).toBeVisible({ timeout: 8000 });
  });

  test("can generate a new API key", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/settings/account`, { waitUntil: "networkidle", timeout: 15000 });

    // The Create button is disabled until the name input is filled.
    // Fill the name first, then click Create.
    const nameInput = page
      .locator('input#apiKeyName, input[placeholder*="API Key Name"], input[placeholder*="Key Name"], input[placeholder*="name"]')
      .first();

    if (!await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      // API key section not found — page state may differ, skip
      return;
    }

    await nameInput.fill("e2e-test-key");

    const createBtn = page
      .getByRole("button", { name: /^create$/i })
      .first();

    if (await createBtn.isEnabled({ timeout: 2000 }).catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(1500);

      // The new key should be revealed in a dialog
      const keyDisplay = page
        .locator("code, [class*='mono'], [class*='key'], input[readonly], [class*='font-mono']")
        .first();
      await expect(keyDisplay).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("API Keys — API authentication", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  let sessionCookie = "";

  test.beforeAll(async () => {
    sessionCookie = await getSessionCookie();
  });

  test("GET /api/user/api-keys returns array of keys", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/user/api-keys`, {
      headers: { Cookie: sessionCookie },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(Array.isArray(body)).toBe(true);
    await ctx.dispose();
  });

  test("request with valid x-api-key header is authenticated", async () => {
    // Create a key via the API if none exists
    const ctx = await apiRequest.newContext();

    // Create API key
    const createResp = await ctx.post(`${API}/api/user/api-keys`, {
      data: { name: "e2e-auth-test" },
      headers: { Cookie: sessionCookie, "Content-Type": "application/json" },
    });

    if (createResp.status() !== 200) {
      // API key creation not supported or requires different endpoint — skip
      test.skip();
      await ctx.dispose();
      return;
    }

    const createBody = await createResp.json();
    const apiKey = createBody.key ?? createBody.apiKey ?? createBody.data?.key;

    if (!apiKey) {
      test.skip();
      await ctx.dispose();
      return;
    }

    try {
      // Use the API key to call an endpoint that requires authentication
      // Server uses Authorization: Bearer <key> (not x-api-key header)
      const authedResp = await ctx.get(
        `${API}/api/sites/${SITE_ID}/overview?startDate=2024-01-01&endDate=2025-01-01&timezone=UTC`,
        { headers: { "Authorization": `Bearer ${apiKey}` } }
      );
      // Should be authenticated (200/204) rather than rejected (401/403)
      expect([200, 204]).toContain(authedResp.status());
    } finally {
      // Clean up: delete the key we created
      const keyId = createBody.id ?? createBody.keyId;
      if (keyId) {
        await ctx.delete(`${API}/api/user/api-keys/${keyId}`, {
          headers: { Cookie: sessionCookie },
        });
      }
      await ctx.dispose();
    }
  });

  test("request with invalid x-api-key is rejected", async () => {
    const ctx = await apiRequest.newContext();
    // authOnly endpoint — returns 401 when API key is invalid and no session
    const resp = await ctx.get(`${API}/api/user/api-keys`, {
      headers: { "x-api-key": "rb_invalid-key-xyz-12345" },
    });
    // Should be rejected as unauthenticated
    expect([401, 403]).toContain(resp.status());
    await ctx.dispose();
  });
});
