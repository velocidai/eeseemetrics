/**
 * security-headers.spec.ts
 *
 * Verifies that all required security headers are present on both the
 * client app (Next.js) and the server API (Fastify).
 *
 * Requires (in e2e/.env):
 *   E2E_BASE_URL     — Next.js client URL
 *   E2E_API_BASE_URL — server API base
 *
 * Run:
 *   npx playwright test security-headers.spec.ts
 */

import { test, expect, request as apiRequest } from "@playwright/test";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";

const REQUIRED_HEADERS = [
  { name: "x-content-type-options", value: "nosniff" },
  { name: "x-frame-options", value: "DENY" },
  { name: "referrer-policy", value: "strict-origin-when-cross-origin" },
];

const REQUIRED_CSP_DIRECTIVE = "frame-ancestors";

test.describe("Security headers — Next.js client", () => {
  for (const { name, value } of REQUIRED_HEADERS) {
    test(`client has ${name}: ${value}`, async () => {
      const ctx = await apiRequest.newContext();
      const resp = await ctx.get(`${BASE}/login`);
      expect(resp.headers()[name]).toBe(value);
      await ctx.dispose();
    });
  }

  test("client has Content-Security-Policy with frame-ancestors", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${BASE}/login`);
    const csp = resp.headers()["content-security-policy"] ?? "";
    expect(csp).toContain(REQUIRED_CSP_DIRECTIVE);
    await ctx.dispose();
  });

  test("client has Permissions-Policy header", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${BASE}/login`);
    const pp = resp.headers()["permissions-policy"] ?? "";
    expect(pp).toBeTruthy();
    await ctx.dispose();
  });
});

test.describe("Security headers — Fastify API", () => {
  for (const { name, value } of REQUIRED_HEADERS) {
    test(`API has ${name}: ${value}`, async () => {
      const ctx = await apiRequest.newContext();
      const resp = await ctx.get(`${API}/api/health`);
      // Health endpoint always returns 200 without auth
      expect(resp.headers()[name]).toBe(value);
      await ctx.dispose();
    });
  }
});

test.describe("CORS headers — tracking endpoint", () => {
  test("POST /api/track has CORS headers allowing cross-origin requests", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.post(`${API}/api/track`, {
      data: { type: "pageview", site_id: "cors-test" },
      headers: { Origin: "https://external-customer-site.com" },
    });
    const acao = resp.headers()["access-control-allow-origin"];
    // Tracking endpoint must accept cross-origin POSTs from any domain
    expect(acao === "*" || acao === "https://external-customer-site.com").toBe(true);
    await ctx.dispose();
  });
});
