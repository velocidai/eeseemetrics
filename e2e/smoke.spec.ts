/**
 * smoke.spec.ts
 *
 * Basic smoke tests — verifies the server is up and key infrastructure endpoints respond.
 *
 * Requires (in e2e/.env):
 *   E2E_API_BASE_URL — server API base (default: http://localhost:3001)
 *   E2E_BASE_URL     — Next.js client URL (default: http://localhost:3002)
 *
 * Run:
 *   npx playwright test smoke.spec.ts
 */

import { test, expect, request as apiRequest } from "@playwright/test";

const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";

test.describe("Server health", () => {
  test("GET /api/health returns 200", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/health`);
    expect(resp.status()).toBe(200);
    await ctx.dispose();
  });

  test("GET /api/version returns object with version field", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/version`);
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(typeof body.version === "string" || typeof body.tag === "string").toBe(true);
    await ctx.dispose();
  });

  test("GET /api/config returns public config object", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/config`);
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    // Config must be an object (not null, not array)
    expect(body !== null && typeof body === "object" && !Array.isArray(body)).toBe(true);
    await ctx.dispose();
  });
});

test.describe("Client availability", () => {
  test("login page returns 200", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${BASE}/login`);
    expect(resp.status()).toBe(200);
    await ctx.dispose();
  });

  test("signup page returns 200", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${BASE}/signup`);
    expect(resp.status()).toBe(200);
    await ctx.dispose();
  });
});
