/**
 * ltd.spec.ts
 *
 * Tests the Lifetime Deal (LTD) flow:
 * 1. GET /api/ltd/slots — public endpoint returns slot counts
 * 2. POST /api/ltd/checkout — creates a Stripe checkout URL (requires auth + org owner)
 * 3. POST /api/ltd/checkout — returns 409 if org already has an LTD
 * 4. Subscription settings page shows LtdPlan component for LTD users
 * 5. ?ltd=success query param shows success toast
 *
 * Optional (requires a pre-existing LTD account):
 *   E2E_LTD_USER_EMAIL    — email of an account with an active LTD
 *   E2E_LTD_USER_PASSWORD
 *
 * Always-available tests just need:
 *   E2E_API_BASE_URL, E2E_BASE_URL, E2E_PRO_USER_EMAIL, E2E_PRO_USER_PASSWORD, E2E_ORG_ID
 *
 * Run:
 *   npx playwright test ltd.spec.ts
 */

import { test, expect, request as apiRequest } from "@playwright/test";
import { getSessionCookie, login, signIn } from "./auth-helpers";

const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const ORG_ID = process.env.E2E_ORG_ID ?? "";
const EMAIL = process.env.E2E_PRO_USER_EMAIL ?? "";
const PASSWORD = process.env.E2E_PRO_USER_PASSWORD ?? "";
const LTD_EMAIL = process.env.E2E_LTD_USER_EMAIL ?? "";
const LTD_PASSWORD = process.env.E2E_LTD_USER_PASSWORD ?? "";

const skipApi = !EMAIL || !PASSWORD;
const skipLtdUser = !LTD_EMAIL || !LTD_PASSWORD;

const SUB_PAGE = `${BASE}/settings/organization/subscription`;

test.describe("LTD — public slots endpoint", () => {
  test("GET /api/ltd/slots returns slot counts for all 3 tiers", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/ltd/slots`);
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    await ctx.dispose();

    // Must have tier1, tier2, tier3 with total/sold/remaining
    for (const tier of ["tier1", "tier2", "tier3"]) {
      expect(body[tier]).toBeDefined();
      expect(typeof body[tier].total).toBe("number");
      expect(typeof body[tier].sold).toBe("number");
      expect(typeof body[tier].remaining).toBe("number");
      expect(body[tier].remaining).toBeGreaterThanOrEqual(0);
      expect(body[tier].sold).toBeLessThanOrEqual(body[tier].total);
    }
  });
});

test.describe("LTD — checkout API", () => {
  test.skip(skipApi || !ORG_ID, "Requires E2E_PRO_USER_EMAIL + E2E_ORG_ID");

  let sessionCookie = "";

  test.beforeAll(async () => {
    sessionCookie = await getSessionCookie();
  });

  test("POST /api/ltd/checkout with valid tier returns Stripe URL or conflict", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.post(`${API}/api/ltd/checkout`, {
      data: { tier: 1, organizationId: ORG_ID },
      headers: { Cookie: sessionCookie, "Content-Type": "application/json" },
    });
    await ctx.dispose();

    // 200 = checkout URL; 409 = org already has LTD; 403 = not owner
    expect([200, 403, 409]).toContain(resp.status());
    if (resp.status() === 200) {
      const body = await resp.json();
      expect(body.url).toMatch(/https:\/\/(checkout\.stripe\.com|billing\.stripe\.com)/);
    }
  });

  test("POST /api/ltd/checkout with invalid tier returns 400", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.post(`${API}/api/ltd/checkout`, {
      data: { tier: 99, organizationId: ORG_ID },
      headers: { Cookie: sessionCookie, "Content-Type": "application/json" },
    });
    await ctx.dispose();
    expect(resp.status()).toBe(400);
  });

  test("POST /api/ltd/checkout without auth returns 401", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.post(`${API}/api/ltd/checkout`, {
      data: { tier: 1, organizationId: ORG_ID },
      headers: { "Content-Type": "application/json" },
    });
    await ctx.dispose();
    expect(resp.status()).toBe(401);
  });
});

test.describe("LTD — subscription settings page (LTD account)", () => {
  test.skip(skipLtdUser, "Requires E2E_LTD_USER_EMAIL and E2E_LTD_USER_PASSWORD");

  test("shows LtdPlan component: Lifetime Deal badge + tier label", async ({ page }) => {
    await login(page, LTD_EMAIL, LTD_PASSWORD);
    await page.goto(SUB_PAGE, { waitUntil: "networkidle", timeout: 15000 });

    expect(page.url()).not.toContain("/login");

    // "Lifetime Deal" badge must be visible
    await expect(page.getByText("Lifetime Deal")).toBeVisible({ timeout: 8000 });

    // "Paid once" / "Never expires" text
    await expect(page.getByText(/never expires/i)).toBeVisible({ timeout: 3000 });

    // Usage progress bar
    const hasBar = await page
      .locator('[role="progressbar"], [class*="Progress"]')
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    expect(hasBar).toBe(true);

    // "Upgrade to Pro" button
    await expect(page.getByRole("button", { name: /upgrade to pro/i })).toBeVisible({ timeout: 3000 });

    // Safety net info box
    await expect(page.getByText(/permanent safety net/i)).toBeVisible({ timeout: 3000 });
  });

  test("GET /api/stripe/subscription returns isLtd=true for LTD account", async () => {
    const cookie = await signIn(LTD_EMAIL, LTD_PASSWORD);
    const ctx = await apiRequest.newContext();

    // Fetch org ID
    const orgResp = await ctx.get(`${API}/api/user/organizations`, {
      headers: { Cookie: cookie },
    });
    const orgs = await orgResp.json();
    const orgId = Array.isArray(orgs) ? orgs[0]?.id : null;

    if (!orgId) {
      await ctx.dispose();
      test.skip();
      return;
    }

    const resp = await ctx.get(`${API}/api/stripe/subscription?organizationId=${orgId}`, {
      headers: { Cookie: cookie },
    });
    await ctx.dispose();

    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.isLtd).toBe(true);
    expect([1, 2, 3]).toContain(body.ltdTier);
    expect(body.interval).toBe("lifetime");
    expect(body.cancelAtPeriodEnd).toBe(false);
    expect(body.eventLimit).toBeGreaterThan(0);
  });
});

test.describe("LTD — success toast after purchase", () => {
  test.skip(skipApi, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  test("?ltd=success&tier=1 shows success toast", async ({ page }) => {
    await login(page);
    await page.goto(`${SUB_PAGE}?ltd=success&tier=1`, { waitUntil: "networkidle", timeout: 15000 });

    expect(page.url()).not.toContain("/login");

    // Toast should appear with success message
    const toast = page.getByText(/lifetime deal activated/i);
    await expect(toast).toBeVisible({ timeout: 5000 });

    // After toast appears, query params should be cleaned up
    await page.waitForTimeout(500);
    expect(page.url()).not.toContain("ltd=success");
  });
});
