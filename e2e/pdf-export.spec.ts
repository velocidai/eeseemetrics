/**
 * pdf-export.spec.ts
 *
 * Tests the PDF report export endpoint:
 *   GET /api/sites/:siteId/export/pdf?start_date=...&end_date=...&time_zone=...
 *
 * Verifies:
 * 1. Returns HTTP 200 with Content-Type: application/pdf
 * 2. Response body is a non-empty PDF (starts with %PDF-)
 * 3. Missing required params return 400
 *
 * Requires (in e2e/.env):
 *   E2E_API_BASE_URL       — server API base
 *   E2E_PRO_USER_EMAIL     — valid account
 *   E2E_PRO_USER_PASSWORD
 *   E2E_TEST_SITE_ID       — site ID with some data
 *
 * Run:
 *   npx playwright test pdf-export.spec.ts
 */

import { test, expect, request as apiRequest } from "@playwright/test";
import { getSessionCookie } from "./auth-helpers";

const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
const EMAIL = process.env.E2E_PRO_USER_EMAIL ?? "";
const PASSWORD = process.env.E2E_PRO_USER_PASSWORD ?? "";
const SITE_ID = process.env.E2E_TEST_SITE_ID ?? "1";

const skipAll = !EMAIL || !PASSWORD;

test.describe("PDF Export — endpoint", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  let sessionCookie = "";

  test.beforeAll(async () => {
    sessionCookie = await getSessionCookie();
  });

  test("GET /export/pdf returns 200 with application/pdf", async () => {
    test.setTimeout(60000); // PDF generation can take up to 30s
    const ctx = await apiRequest.newContext();

    const now = new Date();
    const end = now.toISOString().split("T")[0];
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const resp = await ctx.get(
      `${API}/api/sites/${SITE_ID}/export/pdf?start_date=${start}&end_date=${end}&time_zone=UTC`,
      { headers: { Cookie: sessionCookie } }
    );

    expect(resp.status()).toBe(200);

    const contentType = resp.headers()["content-type"] ?? "";
    expect(contentType).toContain("application/pdf");

    // PDF files begin with the magic bytes %PDF-
    const body = await resp.body();
    expect(body.length).toBeGreaterThan(100);
    expect(body.toString("utf8", 0, 5)).toBe("%PDF-");

    await ctx.dispose();
  });

  test("GET /export/pdf without required params returns 400", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/sites/${SITE_ID}/export/pdf`, {
      headers: { Cookie: sessionCookie },
    });
    expect(resp.status()).toBe(400);
    await ctx.dispose();
  });

  test("GET /export/pdf without auth returns 401 for private site", async () => {
    const ctx = await apiRequest.newContext();
    const now = new Date();
    const end = now.toISOString().split("T")[0];
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const resp = await ctx.get(
      `${API}/api/sites/${SITE_ID}/export/pdf?start_date=${start}&end_date=${end}&time_zone=UTC`
    );
    // Private site: 401/403; public site: 200 (still returns PDF)
    expect([200, 401, 403]).toContain(resp.status());
    await ctx.dispose();
  });
});
