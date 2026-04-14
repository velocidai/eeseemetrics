/**
 * admin-org-management.spec.ts
 *
 * Tests the admin PATCH /admin/organizations/:id endpoint for:
 * - Setting stripeCustomerId
 * - Setting planOverride
 * - Clearing customPlan
 * - Auth guard (non-admin gets 401/403)
 *
 * Requires (in e2e/.env):
 *   E2E_API_BASE_URL          — server API base (default: http://localhost:3001)
 *   E2E_ADMIN_EMAIL           — admin account email
 *   E2E_ADMIN_PASSWORD        — admin account password
 *   E2E_TEST_ORG_ID           — organization ID to patch (use a scratch/test org)
 *   E2E_PRO_USER_EMAIL        — non-admin user email (for auth guard test)
 *   E2E_PRO_USER_PASSWORD     — non-admin user password
 *
 * Run:
 *   npx playwright test admin-org-management.spec.ts
 */

import { test, expect, request as apiRequest } from "@playwright/test";

const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? process.env.E2E_PRO_USER_EMAIL ?? "";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? process.env.E2E_PRO_USER_PASSWORD ?? "";
const ORG_ID = process.env.E2E_TEST_ORG_ID ?? "";

const skipAll = !ADMIN_EMAIL || !ADMIN_PASSWORD || !ORG_ID;

async function getSessionCookie(email: string, password: string) {
  const ctx = await apiRequest.newContext();
  const resp = await ctx.post(`${API}/api/auth/sign-in/email`, {
    data: { email, password },
    headers: { "Content-Type": "application/json", Origin: BASE },
  });
  const setCookie = resp.headers()["set-cookie"] ?? "";
  const match = setCookie.match(/((?:__Secure-)?better-auth\.session_token)=([^;,\s]+)/);
  const cookie = match ? `${match[1]}=${decodeURIComponent(match[2])}` : "";
  await ctx.dispose();
  return cookie;
}

test.describe("Admin org management — PATCH /admin/organizations/:id", () => {
  test.skip(skipAll, "Requires E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, E2E_TEST_ORG_ID");

  let adminCookie = "";

  test.beforeAll(async () => {
    adminCookie = await getSessionCookie(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

  test("admin can clear customPlan", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.patch(`${API}/admin/organizations/${ORG_ID}`, {
      headers: { Cookie: adminCookie, "Content-Type": "application/json" },
      data: { customPlan: null },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.success).toBe(true);
    await ctx.dispose();
  });

  test("admin can set stripeCustomerId", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.patch(`${API}/admin/organizations/${ORG_ID}`, {
      headers: { Cookie: adminCookie, "Content-Type": "application/json" },
      data: { stripeCustomerId: "cus_test_placeholder" },
    });
    expect(resp.status()).toBe(200);
    await ctx.dispose();
  });

  test("admin can set and clear planOverride", async () => {
    const ctx = await apiRequest.newContext();

    // Set override
    let resp = await ctx.patch(`${API}/admin/organizations/${ORG_ID}`, {
      headers: { Cookie: adminCookie, "Content-Type": "application/json" },
      data: { planOverride: "pro100k" },
    });
    expect(resp.status()).toBe(200);

    // Clear override
    resp = await ctx.patch(`${API}/admin/organizations/${ORG_ID}`, {
      headers: { Cookie: adminCookie, "Content-Type": "application/json" },
      data: { planOverride: null },
    });
    expect(resp.status()).toBe(200);
    await ctx.dispose();
  });

  test("returns 400 when body has no recognized fields", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.patch(`${API}/admin/organizations/${ORG_ID}`, {
      headers: { Cookie: adminCookie, "Content-Type": "application/json" },
      data: {},
    });
    expect(resp.status()).toBe(400);
    await ctx.dispose();
  });

  test("non-admin user gets 401 or 403", async () => {
    const proEmail = process.env.E2E_PRO_USER_EMAIL ?? "";
    const proPassword = process.env.E2E_PRO_USER_PASSWORD ?? "";
    if (!proEmail || !proPassword || proEmail === ADMIN_EMAIL) {
      test.skip();
      return;
    }

    const proCookie = await getSessionCookie(proEmail, proPassword);
    const ctx = await apiRequest.newContext();
    const resp = await ctx.patch(`${API}/admin/organizations/${ORG_ID}`, {
      headers: { Cookie: proCookie, "Content-Type": "application/json" },
      data: { planOverride: "scale10m" },
    });
    expect([401, 403]).toContain(resp.status());
    await ctx.dispose();
  });
});
