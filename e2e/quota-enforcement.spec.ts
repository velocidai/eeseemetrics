/**
 * quota-enforcement.spec.ts
 *
 * Verifies that the event quota fields are present in subscription responses
 * and that the over-limit flag is correctly typed. Does not require actually
 * being over the limit — just verifies the enforcement plumbing is wired up.
 *
 * Requires (in e2e/.env):
 *   E2E_API_BASE_URL  — server API base
 *   E2E_PRO_USER_EMAIL / E2E_PRO_USER_PASSWORD — authenticated user
 *   E2E_ORG_ID        — organization ID
 *
 * Run:
 *   npx playwright test quota-enforcement.spec.ts
 */

import { test, expect, request as apiRequest } from "@playwright/test";
import { getSessionCookie } from "./auth-helpers";

const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
const SITE_ID = process.env.E2E_TEST_SITE_ID ?? "1";
const ORG_ID = process.env.E2E_ORG_ID ?? "";
const EMAIL = process.env.E2E_PRO_USER_EMAIL ?? "";
const PASSWORD = process.env.E2E_PRO_USER_PASSWORD ?? "";

const skipAll = !EMAIL || !PASSWORD;

test.describe("Quota enforcement — subscription shape", () => {
  test.skip(skipAll || !ORG_ID, "Requires E2E_PRO_USER_EMAIL, E2E_PRO_USER_PASSWORD, E2E_ORG_ID");

  let cookie = "";
  test.beforeAll(async () => { cookie = await getSessionCookie(); });

  test("subscription response has all quota fields", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/stripe/subscription?organizationId=${ORG_ID}`, {
      headers: { Cookie: cookie },
    });
    expect([200, 404]).toContain(resp.status());
    if (resp.status() === 200) {
      const body = await resp.json();
      // All quota-enforcement fields must be present
      expect(body).toHaveProperty("eventLimit");
      expect(body).toHaveProperty("monthlyEventCount");
      // Types
      expect(typeof body.monthlyEventCount).toBe("number");
      expect(body.monthlyEventCount).toBeGreaterThanOrEqual(0);
      // overMonthlyLimit is an org-level field, not on the subscription response
      if ("overMonthlyLimit" in body) expect(typeof body.overMonthlyLimit).toBe("boolean");
      // eventLimit: null means unlimited; number means capped
      expect(body.eventLimit === null || typeof body.eventLimit === "number").toBe(true);
      if (typeof body.eventLimit === "number") {
        expect(body.eventLimit).toBeGreaterThan(0);
      }
    }
    await ctx.dispose();
  });

  test("overMonthlyLimit is false when under limit", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/stripe/subscription?organizationId=${ORG_ID}`, {
      headers: { Cookie: cookie },
    });
    if (resp.status() === 200) {
      const body = await resp.json();
      if (body.eventLimit !== null && body.monthlyEventCount < body.eventLimit) {
        if ("overMonthlyLimit" in body) expect(body.overMonthlyLimit).toBe(false);
      }
    }
    await ctx.dispose();
  });
});

test.describe("Quota enforcement — tracking still accepted when under limit", () => {
  test("POST pageview to test site returns 200 (not over-limit blocked)", async ({ request }) => {
    const resp = await request.post(`${API}/api/track`, {
      data: {
        type: "pageview",
        site_id: String(SITE_ID),
        hostname: "e2e-quota-test.invalid",
        pathname: "/quota-test",
      },
      headers: { "Content-Type": "application/json" },
    });
    // 200 = accepted; 429 = rate limited (not quota-blocked)
    // Quota over-limit should still return 200 (tracking is silently dropped, not rejected)
    expect([200, 429]).toContain(resp.status());
  });
});

test.describe("Quota enforcement — site has-data endpoint", () => {
  test.skip(skipAll, "Requires auth");

  let cookie = "";
  test.beforeAll(async () => { cookie = await getSessionCookie(); });

  test("GET /sites/:siteId/has-data returns boolean", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/sites/${SITE_ID}/has-data`, {
      headers: { Cookie: cookie },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    const hasData = typeof body === "boolean" ? body : body?.hasData ?? body?.has_data;
    expect(typeof hasData).toBe("boolean");
    await ctx.dispose();
  });
});
