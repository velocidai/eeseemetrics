/**
 * public-assets.spec.ts
 *
 * Verifies that all static/public endpoints the tracking script depends on
 * are reachable, have correct Content-Type headers, and return non-empty bodies.
 *
 * Does NOT require a running client or an authenticated session —
 * hits the backend (API_BASE_URL) directly via request fixtures.
 */

import { test, expect } from "@playwright/test";

const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";

test.describe("Public assets & health", () => {
  test("GET /health returns 200 OK", async ({ request }) => {
    const res = await request.get(`${API}/health`);
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("OK");
  });

  test("GET /api/script.js returns JavaScript", async ({ request }) => {
    const res = await request.get(`${API}/api/script.js`);
    expect(res.status()).toBe(200);
    const ct = res.headers()["content-type"] ?? "";
    expect(ct).toMatch(/javascript/i);
    const body = await res.text();
    expect(body.length).toBeGreaterThan(100);
    // The script must define or reference "eesee"
    expect(body).toContain("eesee");
  });

  test("GET /api/replay.js returns JavaScript (rrweb)", async ({ request }) => {
    const res = await request.get(`${API}/api/replay.js`);
    expect(res.status()).toBe(200);
    const ct = res.headers()["content-type"] ?? "";
    expect(ct).toMatch(/javascript/i);
    const body = await res.text();
    expect(body.length).toBeGreaterThan(500);
  });

  test("GET /api/metrics.js returns JavaScript (web-vitals)", async ({ request }) => {
    const res = await request.get(`${API}/api/metrics.js`);
    expect(res.status()).toBe(200);
    const ct = res.headers()["content-type"] ?? "";
    expect(ct).toMatch(/javascript/i);
    const body = await res.text();
    expect(body.length).toBeGreaterThan(100);
  });

  test("GET /api/script.js is cacheable (has ETag or Last-Modified)", async ({ request }) => {
    const res = await request.get(`${API}/api/script.js`);
    expect(res.status()).toBe(200);
    const hasEtag = !!res.headers()["etag"];
    const hasLastModified = !!res.headers()["last-modified"];
    // At least one caching header should be present for static assets
    expect(hasEtag || hasLastModified).toBe(true);
  });

  test("GET /api/script.js with If-None-Match returns 304 or 200", async ({ request }) => {
    // First request to grab ETag
    const first = await request.get(`${API}/api/script.js`);
    const etag = first.headers()["etag"];
    if (!etag) {
      test.skip(); // skip if server doesn't send ETags
      return;
    }
    const second = await request.get(`${API}/api/script.js`, {
      headers: { "If-None-Match": etag },
    });
    expect([200, 304]).toContain(second.status());
  });

  test("GET /site/tracking-config/:siteId returns JSON for a numeric siteId", async ({ request }) => {
    // siteId 1 should almost always exist on a running instance
    const res = await request.get(`${API}/site/tracking-config/1`);
    // 200 = exists, 404 = site not found — both are valid; 500 is not
    expect([200, 404]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty("siteId");
    }
  });

  test("GET /site/tracking-config/99999999 returns 404 for unknown site", async ({ request }) => {
    const res = await request.get(`${API}/site/tracking-config/99999999`);
    expect(res.status()).toBe(404);
  });

  test("Unknown route does not return 500 (SPA fallback or 404)", async ({ request }) => {
    const res = await request.get(`${API}/this-does-not-exist-xyz-abc`);
    // fastify-static falls back to serving index.html (200) for unknown paths in SPA mode,
    // or returns 404 if no static fallback is configured — both are acceptable; 500 is not.
    expect(res.status()).not.toBe(500);
  });

  test("POST to read-only static asset returns 404 or 405", async ({ request }) => {
    const res = await request.post(`${API}/api/script.js`, { data: {} });
    expect([404, 405]).toContain(res.status());
  });
});
