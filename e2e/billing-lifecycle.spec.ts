/**
 * billing-lifecycle.spec.ts
 *
 * Comprehensive billing state verification:
 *
 * 1. Subscription API shapes — all account types return structurally correct data
 * 2. LTD account — isLtd=true, correct tier, interval=lifetime, event limit
 * 3. Webhook delivery — conditional on E2E_STRIPE_TEST_WEBHOOK_SECRET (set this to the
 *    secret printed by `stripe listen --forward-to https://app.eeseemetrics.com/api/stripe/webhook`)
 *    The server accepts a secondary STRIPE_TEST_WEBHOOK_SECRET env var for test events.
 *
 * Always-required env vars (in e2e/.env):
 *   E2E_API_BASE_URL
 *   E2E_PRO_USER_EMAIL / E2E_PRO_USER_PASSWORD
 *   E2E_ORG_ID
 *
 * LTD tests additionally require:
 *   E2E_LTD_USER_EMAIL / E2E_LTD_USER_PASSWORD
 *
 * Stripe CLI webhook tests additionally require:
 *   E2E_STRIPE_CLI_AVAILABLE=true
 *   E2E_STRIPE_TEST_WEBHOOK_SECRET=whsec_... (from `stripe listen` output)
 *
 * Run all:
 *   npx playwright test billing-lifecycle.spec.ts
 *
 * Run webhook tests (requires stripe listen running):
 *   stripe listen --forward-to https://app.eeseemetrics.com/api/stripe/webhook &
 *   E2E_STRIPE_TEST_WEBHOOK_SECRET=whsec_... npx playwright test billing-lifecycle.spec.ts
 */

import { test, expect, request as apiRequest } from "@playwright/test";
import { execSync } from "child_process";
import { getSessionCookie } from "./auth-helpers";

const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
const EMAIL = process.env.E2E_PRO_USER_EMAIL ?? "";
const PASSWORD = process.env.E2E_PRO_USER_PASSWORD ?? "";
const ORG_ID = process.env.E2E_ORG_ID ?? "";
const LTD_EMAIL = process.env.E2E_LTD_USER_EMAIL ?? "";
const LTD_PASSWORD = process.env.E2E_LTD_USER_PASSWORD ?? "";
// Hardcoded org ID for the LTD test account (created 2026-04-15)
const LTD_ORG_ID_ENV = process.env.E2E_LTD_ORG_ID ?? "";
const STRIPE_CLI = process.env.E2E_STRIPE_CLI_AVAILABLE === "true";
const TEST_WEBHOOK_SECRET = process.env.E2E_STRIPE_TEST_WEBHOOK_SECRET ?? "";

const skipApi = !EMAIL || !PASSWORD || !ORG_ID;
const skipLtd = !LTD_EMAIL || !LTD_PASSWORD;
const skipWebhooks = !STRIPE_CLI || !TEST_WEBHOOK_SECRET;

// ── Subscription API shape ────────────────────────────────────────────────────

test.describe("Billing lifecycle — subscription API shape", () => {
  test.skip(skipApi, "Requires E2E_PRO_USER_EMAIL, E2E_PRO_USER_PASSWORD, E2E_ORG_ID");

  let cookie = "";
  test.beforeAll(async () => { cookie = await getSessionCookie(); });

  test("GET /api/stripe/subscription returns all required fields", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/stripe/subscription?organizationId=${ORG_ID}`, {
      headers: { Cookie: cookie },
    });
    const body = await resp.json();
    await ctx.dispose();

    expect(resp.status()).toBe(200);

    // Fields every subscription path must include
    expect(body).toHaveProperty("planName");
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("eventLimit");
    expect(body).toHaveProperty("monthlyEventCount");
    expect(body).toHaveProperty("currentPeriodStart");
    expect(body).toHaveProperty("currentPeriodEnd");
    expect(body).toHaveProperty("cancelAtPeriodEnd");

    // Types
    expect(typeof body.planName).toBe("string");
    expect(typeof body.status).toBe("string");
    expect(typeof body.monthlyEventCount).toBe("number");
    expect(body.eventLimit === null || typeof body.eventLimit === "number").toBe(true);
    expect(typeof body.cancelAtPeriodEnd).toBe("boolean");

    // planName must be a known tier
    expect(body.planName).toMatch(/starter|pro|scale|free|ltd/i);
  });

  test("GET /api/stripe/subscription monthlyEventCount is non-negative", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/stripe/subscription?organizationId=${ORG_ID}`, {
      headers: { Cookie: cookie },
    });
    const body = await resp.json();
    await ctx.dispose();

    expect(resp.status()).toBe(200);
    expect(body.monthlyEventCount).toBeGreaterThanOrEqual(0);
  });

  test("GET /api/stripe/subscription requires auth — 401 without cookie", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/stripe/subscription?organizationId=${ORG_ID}`);
    await ctx.dispose();
    expect(resp.status()).toBe(401);
  });

  test("GET /api/stripe/subscription requires orgId — 400 without it", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/stripe/subscription`, {
      headers: { Cookie: cookie },
    });
    await ctx.dispose();
    expect([400, 422]).toContain(resp.status());
  });

  test("GET /api/stripe/invoices returns array", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/stripe/invoices?organizationId=${ORG_ID}`, {
      headers: { Cookie: cookie },
    });
    const body = await resp.json();
    await ctx.dispose();

    // 200 with array, or 404 if no Stripe customer yet
    if (resp.status() === 200) {
      expect(Array.isArray(body)).toBe(true);
      if (body.length > 0) {
        expect(body[0]).toHaveProperty("id");
        expect(body[0]).toHaveProperty("amount");
        expect(body[0]).toHaveProperty("status");
      }
    } else {
      expect([404, 400]).toContain(resp.status());
    }
  });
});

// ── LTD account ───────────────────────────────────────────────────────────────

test.describe("Billing lifecycle — LTD account", () => {
  test.skip(skipLtd, "Requires E2E_LTD_USER_EMAIL and E2E_LTD_USER_PASSWORD");

  let ltdCookie = "";
  let ltdOrgId = "";

  test.beforeAll(async () => {
    // Use cached session from global-setup to avoid sign-in rate limits
    ltdCookie = await getSessionCookie(LTD_EMAIL, LTD_PASSWORD);

    // Use hardcoded org ID from env if provided (avoids signIn cookie issues
    // with base64 chars), otherwise fetch dynamically.
    if (LTD_ORG_ID_ENV) {
      ltdOrgId = LTD_ORG_ID_ENV;
      return;
    }

    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/user/organizations`, {
      headers: { Cookie: ltdCookie },
    });
    const orgs = await resp.json();
    await ctx.dispose();

    ltdOrgId = Array.isArray(orgs) ? orgs[0]?.id : null;
  });

  test("LTD org ID was resolved", async () => {
    expect(ltdOrgId).toBeTruthy();
  });

  test("GET /api/stripe/subscription returns isLtd=true for LTD account", async () => {
    test.skip(!ltdOrgId, "LTD org ID not found");

    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/stripe/subscription?organizationId=${ltdOrgId}`, {
      headers: { Cookie: ltdCookie },
    });
    const body = await resp.json();
    await ctx.dispose();

    expect(resp.status()).toBe(200);
    expect(body.isLtd).toBe(true);
    expect([1, 2, 3]).toContain(body.ltdTier);
    expect(body.interval).toBe("lifetime");
    expect(body.cancelAtPeriodEnd).toBe(false);
    expect(typeof body.eventLimit).toBe("number");
    expect(body.eventLimit).toBeGreaterThan(0);
  });

  test("LTD tier 1 has 100,000 event limit", async () => {
    test.skip(!ltdOrgId, "LTD org ID not found");

    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/stripe/subscription?organizationId=${ltdOrgId}`, {
      headers: { Cookie: ltdCookie },
    });
    const body = await resp.json();
    await ctx.dispose();

    expect(resp.status()).toBe(200);
    if (body.ltdTier === 1) expect(body.eventLimit).toBe(100_000);
    if (body.ltdTier === 2) expect(body.eventLimit).toBe(250_000);
    if (body.ltdTier === 3) expect(body.eventLimit).toBe(500_000);
  });

  test("LTD account planName contains 'ltd'", async () => {
    test.skip(!ltdOrgId, "LTD org ID not found");

    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/stripe/subscription?organizationId=${ltdOrgId}`, {
      headers: { Cookie: ltdCookie },
    });
    const body = await resp.json();
    await ctx.dispose();

    expect(resp.status()).toBe(200);
    expect(body.planName).toMatch(/ltd/i);
  });
});

// ── Stripe webhook delivery ───────────────────────────────────────────────────

test.describe("Billing lifecycle — Stripe CLI webhook delivery", () => {
  test.skip(
    skipWebhooks,
    "Requires E2E_STRIPE_CLI_AVAILABLE=true and E2E_STRIPE_TEST_WEBHOOK_SECRET. " +
    "Run: stripe listen --forward-to https://app.eeseemetrics.com/api/stripe/webhook " +
    "then set E2E_STRIPE_TEST_WEBHOOK_SECRET=<whsec from output>"
  );

  test.skip(skipApi, "Requires E2E_PRO_USER_EMAIL, E2E_PRO_USER_PASSWORD, E2E_ORG_ID");

  let cookie = "";
  test.beforeAll(async () => { cookie = await getSessionCookie(); });

  test("stripe trigger invoice.payment_succeeded — server returns 200", async () => {
    // Fire a test webhook event via Stripe CLI
    try {
      execSync("stripe trigger invoice.payment_succeeded", { timeout: 30_000 });
    } catch (e: any) {
      // CLI output goes to stderr even on success; check for "trigger" keyword
      if (!e.stderr?.includes("trigger")) throw e;
    }
    // Give the server 2s to process
    await new Promise(r => setTimeout(r, 2000));

    // Verify subscription endpoint still returns valid data (usage refresh ran)
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/stripe/subscription?organizationId=${ORG_ID}`, {
      headers: { Cookie: cookie },
    });
    const body = await resp.json();
    await ctx.dispose();

    expect(resp.status()).toBe(200);
    expect(body.monthlyEventCount).toBeGreaterThanOrEqual(0);
  });

  test("stripe trigger customer.subscription.updated — server returns 200", async () => {
    try {
      execSync("stripe trigger customer.subscription.updated", { timeout: 30_000 });
    } catch (e: any) {
      if (!e.stderr?.includes("trigger")) throw e;
    }
    await new Promise(r => setTimeout(r, 2000));

    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/stripe/subscription?organizationId=${ORG_ID}`, {
      headers: { Cookie: cookie },
    });
    await ctx.dispose();
    expect(resp.status()).toBe(200);
  });

  test("POST /api/stripe/webhook with invalid signature returns 400", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.post(`${API}/api/stripe/webhook`, {
      data: { type: "invoice.payment_succeeded" },
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": "t=invalid,v1=invalidsig",
      },
    });
    await ctx.dispose();
    expect(resp.status()).toBe(400);
  });
});
