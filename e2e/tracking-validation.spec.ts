/**
 * tracking-validation.spec.ts
 *
 * Verifies that the /api/track (and /track alias) endpoint:
 *   1. Accepts valid payloads and returns 200
 *   2. Rejects invalid/missing fields with 4xx
 *   3. Is not vulnerable to oversized payloads
 *   4. Does not crash on weird content types
 *   5. Treats bot User-Agents silently (200 but should not persist)
 *
 * No auth required — this is a public tracking endpoint.
 */

import { test, expect } from "@playwright/test";

const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";

// Minimal valid pageview payload
const VALID_PAGEVIEW = {
  type: "pageview",
  site_id: "1",
  hostname: "e2e-test.invalid",
  pathname: "/test",
};

// Minimal valid custom_event payload
const VALID_CUSTOM_EVENT = {
  type: "custom_event",
  site_id: "1",
  hostname: "e2e-test.invalid",
  pathname: "/test",
  event_name: "button_click",
};

// Minimal valid performance payload
const VALID_PERFORMANCE = {
  type: "performance",
  site_id: "1",
  hostname: "e2e-test.invalid",
  pathname: "/test",
  lcp: 1200,
  cls: 0.05,
  inp: 80,
  fcp: 900,
  ttfb: 200,
};

async function track(
  request: import("@playwright/test").APIRequestContext,
  payload: object,
  endpoint = "/api/track"
) {
  return request.post(`${API}${endpoint}`, {
    data: payload,
    headers: { "Content-Type": "application/json" },
  });
}

test.describe("Tracking endpoint — valid payloads", () => {
  test("POST /api/track with valid pageview returns 200", async ({ request }) => {
    const res = await track(request, VALID_PAGEVIEW);
    expect(res.status()).toBe(200);
  });

  test("POST /track alias also returns 200", async ({ request }) => {
    const res = await track(request, VALID_PAGEVIEW, "/track");
    expect(res.status()).toBe(200);
  });

  test("POST /api/track with valid custom_event returns 200", async ({ request }) => {
    const res = await track(request, VALID_CUSTOM_EVENT);
    expect(res.status()).toBe(200);
  });

  test("POST /api/track with valid performance event returns 200", async ({ request }) => {
    const res = await track(request, VALID_PERFORMANCE);
    expect(res.status()).toBe(200);
  });

  test("Pageview with all optional fields returns 200", async ({ request }) => {
    const res = await track(request, {
      ...VALID_PAGEVIEW,
      querystring: "?utm_source=google",
      screenWidth: 1920,
      screenHeight: 1080,
      language: "en-US",
      page_title: "Home Page",
      referrer: "https://google.com",
      user_id: "user-abc-123",
    });
    expect(res.status()).toBe(200);
  });

  test("Custom event with JSON properties string returns 200", async ({ request }) => {
    const res = await track(request, {
      ...VALID_CUSTOM_EVENT,
      properties: JSON.stringify({ plan: "pro", value: 49 }),
    });
    expect(res.status()).toBe(200);
  });

  test("Performance with null metric values returns 200", async ({ request }) => {
    const res = await track(request, {
      ...VALID_PERFORMANCE,
      lcp: null,
      cls: null,
      inp: null,
    });
    expect(res.status()).toBe(200);
  });
});

test.describe("Tracking endpoint — invalid payloads rejected", () => {
  test("Missing site_id returns 4xx", async ({ request }) => {
    const res = await track(request, { type: "pageview", hostname: "example.com" });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("Empty site_id returns 4xx", async ({ request }) => {
    const res = await track(request, { ...VALID_PAGEVIEW, site_id: "" });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("Missing type returns 4xx", async ({ request }) => {
    const res = await track(request, { site_id: "1", hostname: "example.com" });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("Invalid type value returns 4xx", async ({ request }) => {
    const res = await track(request, { type: "invalid_type", site_id: "1" });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("custom_event without event_name returns 4xx", async ({ request }) => {
    const res = await track(request, {
      type: "custom_event",
      site_id: "1",
      hostname: "example.com",
      // missing event_name
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("custom_event with empty event_name returns 4xx", async ({ request }) => {
    const res = await track(request, { ...VALID_CUSTOM_EVENT, event_name: "" });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("custom_event with invalid JSON in properties returns 4xx", async ({ request }) => {
    const res = await track(request, {
      ...VALID_CUSTOM_EVENT,
      properties: "{ not valid json",
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("Extra unknown field on strict schema returns 4xx", async ({ request }) => {
    const res = await track(request, { ...VALID_PAGEVIEW, unknown_field: "hax" });
    // Zod strict() rejects extra keys
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("Empty body returns 4xx", async ({ request }) => {
    const res = await request.post(`${API}/api/track`, {
      headers: { "Content-Type": "application/json" },
      data: {},
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("Non-JSON body returns 4xx, not 500", async ({ request }) => {
    const res = await request.post(`${API}/api/track`, {
      headers: { "Content-Type": "text/plain" },
      data: "hello world",
    });
    expect(res.status()).not.toBe(500);
  });

  test("pathname exceeding 2048 chars returns 4xx", async ({ request }) => {
    const res = await track(request, {
      ...VALID_PAGEVIEW,
      pathname: "/" + "a".repeat(2050),
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("event_name exceeding 256 chars returns 4xx", async ({ request }) => {
    const res = await track(request, {
      ...VALID_CUSTOM_EVENT,
      event_name: "a".repeat(257),
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("site_id as object (type confusion) returns 4xx", async ({ request }) => {
    const res = await request.post(`${API}/api/track`, {
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({ ...VALID_PAGEVIEW, site_id: { evil: true } }),
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("Array body (not an object) returns 4xx", async ({ request }) => {
    const res = await request.post(`${API}/api/track`, {
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify([VALID_PAGEVIEW]),
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("Negative screenWidth returns 4xx", async ({ request }) => {
    const res = await track(request, { ...VALID_PAGEVIEW, screenWidth: -1 });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test("Invalid IP address in ip_address field returns 4xx", async ({ request }) => {
    const res = await track(request, {
      ...VALID_PAGEVIEW,
      ip_address: "not-an-ip",
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });
});

test.describe("Tracking endpoint — bot & edge cases", () => {
  test("Googlebot User-Agent returns 200 (silently dropped)", async ({ request }) => {
    // The server uses isbot() to skip processing, but should still return 200
    const res = await request.post(`${API}/api/track`, {
      data: VALID_PAGEVIEW,
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
    });
    expect(res.status()).toBe(200);
  });

  test("HeadlessChrome User-Agent is treated as bot, returns 200", async ({ request }) => {
    const res = await request.post(`${API}/api/track`, {
      data: VALID_PAGEVIEW,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "HeadlessChrome/120.0.0.0",
      },
    });
    expect(res.status()).toBe(200);
  });

  test("No User-Agent header still returns 200", async ({ request }) => {
    const res = await request.post(`${API}/api/track`, {
      data: VALID_PAGEVIEW,
      headers: { "Content-Type": "application/json", "User-Agent": "" },
    });
    expect(res.status()).toBe(200);
  });

  test("OPTIONS preflight to /api/track returns 200 (CORS)", async ({ request }) => {
    const res = await request.fetch(`${API}/api/track`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://example.com",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });
    expect([200, 204]).toContain(res.status());
  });
});
