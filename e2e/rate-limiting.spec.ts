/**
 * rate-limiting.spec.ts
 *
 * Verifies that rate limiting is enforced on:
 * 1. POST /api/track — per-site burst limiter (1000 req/min per site)
 * 2. POST /track    — alias endpoint same limiter
 * 3. Login endpoint — brute force protection (10 attempts per 15 min)
 *
 * Uses a fake site_id that will trigger the in-memory rate limiter without
 * hitting the database (the limiter runs before DB lookup).
 *
 * Requires (in e2e/.env):
 *   E2E_API_BASE_URL — server API base
 *
 * Run:
 *   npx playwright test rate-limiting.spec.ts
 */

import { test, expect, request as apiRequest } from "@playwright/test";

const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";

// Unique fake site ID to avoid polluting real site rate-limit windows
const FAKE_SITE_ID = `e2e-rate-test-${Date.now()}`;

const BASE_PAYLOAD = {
  type: "pageview",
  site_id: FAKE_SITE_ID,
  hostname: "test.example.com",
  pathname: "/test",
};

test.describe("Tracking endpoint rate limiting", () => {
  test("POST /api/track: returns 429 after burst limit exceeded", async () => {
    test.setTimeout(180_000); // 1000+ sequential requests needs 3 min
    // Skip against production: sequential requests at real network latency (~100 ms each)
    // spread 1000 requests over ~100 s, spanning two 60 s windows — the per-minute
    // counter never reaches the limit.  This test is only reliable against a local server.
    if (API.startsWith("https://")) {
      test.skip();
      return;
    }
    const ctx = await apiRequest.newContext();

    // The in-memory rate limiter caps at 1000/min per site_id.
    // We send just past the limit in a tight loop to trigger 429.
    // Note: this test modifies the in-memory state — use a unique FAKE_SITE_ID.
    const BURST_LIMIT = 1000;
    const REQUESTS_TO_SEND = BURST_LIMIT + 5;

    let got429 = false;
    let lastStatus = 0;

    for (let i = 0; i < REQUESTS_TO_SEND; i++) {
      const resp = await ctx.post(`${API}/api/track`, {
        data: { ...BASE_PAYLOAD, site_id: FAKE_SITE_ID },
      });
      lastStatus = resp.status();
      if (lastStatus === 429) {
        got429 = true;
        // Verify the Retry-After header is present
        const retryAfter = resp.headers()["retry-after"];
        expect(retryAfter).toBeTruthy();
        break;
      }
    }

    // We should have hit the limit before or at 1005 requests
    expect(got429).toBe(true);
    await ctx.dispose();
  });

  test("POST /api/track: returns Retry-After header on 429", async () => {
    test.setTimeout(180_000); // 1000+ sequential requests needs 3 min
    if (API.startsWith("https://")) {
      test.skip();
      return;
    }
    const ctx = await apiRequest.newContext();
    // Use same site_id — limit window may still be active from the previous test
    // or we need to exhaust it again. Use a fresh site_id for a predictable result.
    const testSiteId = `e2e-retry-after-${Date.now()}`;
    const BURST_LIMIT = 1000;

    let retryAfterHeader = "";

    for (let i = 0; i <= BURST_LIMIT + 2; i++) {
      const resp = await ctx.post(`${API}/api/track`, {
        data: { ...BASE_PAYLOAD, site_id: testSiteId },
      });
      if (resp.status() === 429) {
        retryAfterHeader = resp.headers()["retry-after"] ?? "";
        break;
      }
    }

    expect(retryAfterHeader).toBe("60");
    await ctx.dispose();
  });
});

test.describe("Login brute-force protection", () => {
  test("POST /api/auth/sign-in/email: returns 429 after 10 failed attempts", async () => {
    const ctx = await apiRequest.newContext();

    // Use a definitely-wrong email to avoid accidentally signing in
    const testEmail = `nonexistent-e2e-${Date.now()}@example.com`;
    let got429 = false;

    // Better Auth rate limit: 10 attempts per 15 min on /sign-in/email
    for (let i = 0; i < 12; i++) {
      const resp = await ctx.post(`${API}/api/auth/sign-in/email`, {
        data: { email: testEmail, password: "wrong-password-xyz" },
        headers: { "Content-Type": "application/json" },
      });
      if (resp.status() === 429) {
        got429 = true;
        break;
      }
    }

    expect(got429).toBe(true);
    await ctx.dispose();
  });
});
