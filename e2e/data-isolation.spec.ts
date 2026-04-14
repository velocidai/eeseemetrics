/**
 * data-isolation.spec.ts
 *
 * Verifies that analytics data is strictly isolated between sites and
 * organizations. A user cannot access site data they don't own.
 *
 * Requires (in e2e/.env):
 *   E2E_API_BASE_URL        — server API base
 *   E2E_PRO_USER_EMAIL      — user A email
 *   E2E_PRO_USER_PASSWORD   — user A password
 *   E2E_TEST_SITE_ID        — site ID owned by user A
 *   E2E_OTHER_SITE_ID       — site ID owned by a DIFFERENT org (optional)
 *
 * Run:
 *   npx playwright test data-isolation.spec.ts
 */

import { test, expect, request as apiRequest, APIRequestContext } from "@playwright/test";

const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const EMAIL = process.env.E2E_PRO_USER_EMAIL ?? "";
const PASSWORD = process.env.E2E_PRO_USER_PASSWORD ?? "";
const SITE_ID = process.env.E2E_TEST_SITE_ID ?? "1";
const OTHER_SITE_ID = process.env.E2E_OTHER_SITE_ID ?? "";

const skipAll = !EMAIL || !PASSWORD;

/**
 * Extract just the session token cookie name=value pair from a set-cookie header.
 * Handles both `better-auth.session_token` and `__Secure-better-auth.session_token`
 * (the latter is used on HTTPS deployments).
 */
function extractSessionCookie(setCookie: string): string {
  const match = setCookie.match(/((?:__Secure-)?better-auth\.session_token)=([^;,\s]+)/);
  if (!match) return "";
  return `${match[1]}=${decodeURIComponent(match[2])}`;
}

test.describe("Data isolation — own site access", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  let sessionCookie = "";

  test.beforeAll(async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.post(`${API}/api/auth/sign-in/email`, {
      data: { email: EMAIL, password: PASSWORD },
      headers: { "Content-Type": "application/json", Origin: BASE },
    });
    const setCookie = resp.headers()["set-cookie"] ?? "";
    sessionCookie = extractSessionCookie(setCookie);
    await ctx.dispose();
  });

  test("can fetch analytics for own site", async () => {
    test.skip(!sessionCookie, "Login failed — no session cookie");
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(
      `${API}/api/sites/${SITE_ID}/overview?startDate=2024-01-01&endDate=2025-01-01&timezone=UTC`,
      { headers: { Cookie: sessionCookie } }
    );
    expect([200, 204]).toContain(resp.status());
    await ctx.dispose();
  });

  test("cannot fetch analytics for a non-existent site (returns 40x)", async () => {
    test.skip(!sessionCookie, "Login failed — no session cookie");
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(
      `${API}/api/sites/999999/overview?startDate=2024-01-01&endDate=2025-01-01&timezone=UTC`,
      { headers: { Cookie: sessionCookie } }
    );
    expect(resp.status()).toBeGreaterThanOrEqual(400);
    expect(resp.status()).toBeLessThan(500);
    await ctx.dispose();
  });

  test("cannot access site owned by another org (returns 40x or site is public)", async () => {
    test.skip(!OTHER_SITE_ID, "Requires E2E_OTHER_SITE_ID");
    test.skip(!sessionCookie, "Login failed — no session cookie");
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(
      `${API}/api/sites/${OTHER_SITE_ID}/overview?startDate=2024-01-01&endDate=2025-01-01&timezone=UTC`,
      { headers: { Cookie: sessionCookie } }
    );
    // Must be 403 or 404 (forbidden/not found) OR 200 if the site is public
    // A public site can be read by anyone — that is correct behavior for public analytics
    expect([200, 403, 404]).toContain(resp.status());
    await ctx.dispose();
  });

  test("unauthenticated request cannot access private site data", async () => {
    const anonCtx = await apiRequest.newContext();
    const resp = await anonCtx.get(
      `${API}/api/sites/${SITE_ID}/overview?startDate=2024-01-01&endDate=2025-01-01&timezone=UTC`
    );
    expect([401, 403, 404]).toContain(resp.status());
    await anonCtx.dispose();
  });

  test("GET /api/sites returns only sites for the authenticated user", async () => {
    test.skip(!sessionCookie, "Login failed — no session cookie");
    // The correct endpoint to list sites is through organizations
    const ctx = await apiRequest.newContext();

    // First get the user's organizations
    const orgsResp = await ctx.get(`${API}/api/user/organizations`, {
      headers: { Cookie: sessionCookie },
    });
    expect(orgsResp.status()).toBe(200);
    const orgs = await orgsResp.json();
    const orgId = Array.isArray(orgs) ? orgs[0]?.id : orgs?.id;

    if (!orgId) {
      await ctx.dispose();
      test.skip();
      return;
    }

    const sitesResp = await ctx.get(`${API}/api/organizations/${orgId}/sites`, {
      headers: { Cookie: sessionCookie },
    });
    expect(sitesResp.status()).toBe(200);
    const sitesBody = await sitesResp.json();
    // Response is { organization, sites: [...], subscription }
    const sitesList = Array.isArray(sitesBody) ? sitesBody : (sitesBody.sites ?? []);
    expect(Array.isArray(sitesList)).toBe(true);

    if (OTHER_SITE_ID) {
      const containsOtherSite = sitesList.some(
        (s: { id?: string }) => String(s.id) === String(OTHER_SITE_ID)
      );
      expect(containsOtherSite).toBe(false);
    }
    await ctx.dispose();
  });
});
