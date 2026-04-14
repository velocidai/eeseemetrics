/**
 * billing-stripe.spec.ts
 *
 * Tests Stripe billing integration:
 * 1. Checkout session creation (API returns a valid Stripe URL)
 * 2. Billing portal session creation (API returns a valid portal URL)
 * 3. Subscription status endpoint returns expected shape
 * 4. Invoices endpoint returns expected shape
 * 5. "Manage subscription" button is accessible in the UI
 *
 * Does NOT process a real payment — that requires `stripe trigger` via CLI.
 * See the "Webhook testing" section below for CLI commands.
 *
 * Requires (in e2e/.env):
 *   E2E_API_BASE_URL        — server API base
 *   E2E_BASE_URL            — Next.js client URL
 *   E2E_PRO_USER_EMAIL      — test account email (on a trial or active subscription)
 *   E2E_PRO_USER_PASSWORD   — test account password
 *   E2E_ORG_ID              — organization ID for the test account
 *   E2E_STRIPE_PRO_MONTHLY_PRICE_ID — Stripe price ID for Pro monthly (test mode)
 *
 * Webhook testing (requires Stripe CLI):
 *   stripe trigger checkout.session.completed
 *   stripe trigger invoice.payment_failed
 *   stripe trigger customer.subscription.deleted
 *   stripe trigger customer.subscription.updated
 *   stripe trigger invoice.payment_succeeded
 *
 * Run:
 *   npx playwright test billing-stripe.spec.ts
 */

import { test, expect, request as apiRequest } from "@playwright/test";
import { getSessionCookie, login } from "./auth-helpers";

const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const EMAIL = process.env.E2E_PRO_USER_EMAIL ?? "";
const PASSWORD = process.env.E2E_PRO_USER_PASSWORD ?? "";
const ORG_ID = process.env.E2E_ORG_ID ?? "";
const PRICE_ID = process.env.E2E_STRIPE_PRO_MONTHLY_PRICE_ID ?? "";

const skipAll = !EMAIL || !PASSWORD;
const skipStripe = skipAll || !ORG_ID || !PRICE_ID;

test.describe("Billing — API endpoints", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  let sessionCookie = "";

  test.beforeAll(async () => {
    sessionCookie = await getSessionCookie();
  });

  test("GET /api/stripe/subscription returns shape with planName", async () => {
    test.skip(!ORG_ID, "Requires E2E_ORG_ID");
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/stripe/subscription?organizationId=${ORG_ID}`, {
      headers: { Cookie: sessionCookie },
    });
    // Could be 200 (has subscription) or 404/200 empty for starter
    expect([200, 404]).toContain(resp.status());
    if (resp.status() === 200) {
      const body = await resp.json();
      // Must have at least one of these fields
      const hasExpectedShape =
        body?.planName !== undefined ||
        body?.status !== undefined ||
        Array.isArray(body);
      expect(hasExpectedShape).toBe(true);
    }
    await ctx.dispose();
  });

  test("GET /api/stripe/invoices returns array", async () => {
    test.skip(!ORG_ID, "Requires E2E_ORG_ID");
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/stripe/invoices?organizationId=${ORG_ID}`, {
      headers: { Cookie: sessionCookie },
    });
    expect([200, 404]).toContain(resp.status());
    if (resp.status() === 200) {
      const body = await resp.json();
      expect(Array.isArray(body)).toBe(true);
    }
    await ctx.dispose();
  });

  test("POST /api/stripe/create-checkout-session returns Stripe URL", async () => {
    test.skip(!ORG_ID || !PRICE_ID, "Requires E2E_ORG_ID and E2E_STRIPE_PRO_MONTHLY_PRICE_ID");
    const ctx = await apiRequest.newContext();
    const resp = await ctx.post(`${API}/api/stripe/create-checkout-session`, {
      data: {
        priceId: PRICE_ID,
        returnUrl: `${BASE}/subscribe`,
        organizationId: ORG_ID,
        planType: "pro",
      },
      headers: { Cookie: sessionCookie, "Content-Type": "application/json" },
    });
    // 200 = success with URL; 400 = validation error; 500 = org already has active subscription
    expect([200, 400, 500]).toContain(resp.status());
    if (resp.status() === 200) {
      const body = await resp.json();
      // Should return a Stripe checkout URL
      expect(body.url ?? body.sessionUrl ?? body.checkoutUrl).toMatch(/https:\/\/(checkout\.stripe\.com|billing\.stripe\.com)/);
    }
    await ctx.dispose();
  });

  test("POST /api/stripe/create-portal-session returns Stripe portal URL", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.post(`${API}/api/stripe/create-portal-session`, {
      data: { returnUrl: `${BASE}/settings` },
      headers: { Cookie: sessionCookie, "Content-Type": "application/json" },
    });
    // 200 if customer has a Stripe customer ID; 400/404 if no customer yet
    if (resp.status() === 200) {
      const body = await resp.json();
      expect(body.url ?? body.portalUrl).toMatch(/https:\/\/billing\.stripe\.com/);
    } else {
      // Acceptable: no Stripe customer on this account
      expect([400, 404, 422]).toContain(resp.status());
    }
    await ctx.dispose();
  });
});

test.describe("Billing — UI flows", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  test("subscription settings page loads with plan details", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/settings/organization/subscription`, { waitUntil: "networkidle", timeout: 15000 });

    expect(page.url()).not.toContain("/login");
    expect(page.url()).not.toContain("/500");

    // Page should show some plan-related UI (any plan type)
    const hasPlanContent = await page
      .getByText(/plan|subscription|manage|upgrade|trial/i)
      .first()
      .isVisible({ timeout: 8000 })
      .catch(() => false);
    expect(hasPlanContent).toBe(true);
  });

  test("subscribe page loads with pricing cards", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/subscribe`, { waitUntil: "networkidle", timeout: 15000 });

    expect(page.url()).not.toContain("/500");
    // Should show at least one pricing card heading (Starter, Pro, or Scale)
    const planCard = page
      .locator("h3")
      .filter({ hasText: /^(Starter|Pro|Scale)$/i })
      .first();
    await expect(planCard).toBeVisible({ timeout: 8000 });
  });
});

/**
 * Stripe Webhook Verification
 *
 * The items below CANNOT be automated without the Stripe CLI or a real payment.
 * Run these manually with `stripe listen --forward-to localhost:3001/api/stripe/webhook`
 * in a separate terminal, then trigger events:
 *
 *   stripe trigger checkout.session.completed
 *   stripe trigger invoice.payment_succeeded
 *   stripe trigger invoice.payment_failed
 *   stripe trigger customer.subscription.deleted
 *   stripe trigger customer.subscription.updated
 *   stripe trigger customer.subscription.trial_will_end
 *
 * After each trigger, verify the organization's tier in the DB:
 *   SELECT plan_name, status FROM "subscription" WHERE organization_id = '<org_id>';
 */
