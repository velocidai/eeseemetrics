/**
 * AI Reports API — Integration Tests
 *
 * These tests run against the server at http://localhost:3001.
 * Start the server before running: cd server && npm run dev
 *
 * Route registrations (from src/index.ts — registered under /api prefix):
 *   GET /api/sites/:siteId/ai-reports
 *   GET /api/sites/:siteId/ai-reports/:reportId
 *
 * Auth notes:
 *   - The `requireSiteAccess` preHandler returns 403 for any request that lacks
 *     a valid session cookie OR API key — there is no separate 401 path at the
 *     middleware level for these routes.
 *   - The route handlers themselves call `getUserHasAccessToSite()` which also
 *     returns false (→ 403) when no session exists.
 *
 * Authenticated tests require a valid session cookie.
 * To enable them, either:
 *   1. Set INTEGRATION_TEST_COOKIE env var to a valid session cookie string
 *      (e.g. "better-auth.session_token=<token>")
 *   2. Implement a test auth bypass (e.g. x-test-user-id header behind
 *      TEST_MODE=true env var in the server)
 */

import { describe, it, expect, beforeAll } from "vitest";

const BASE_URL = process.env.INTEGRATION_BASE_URL ?? "http://localhost:3001";

// SESSION_COOKIE is read here so authenticated todo tests can reference it
// when they are eventually implemented. Unused until those tests are filled in.
// const SESSION_COOKIE = process.env.INTEGRATION_TEST_COOKIE;

// Check once whether the server is reachable before running tests
let serverReachable = false;
beforeAll(async () => {
  try {
    // /api/config is a lightweight public endpoint used as a health probe
    const res = await fetch(`${BASE_URL}/api/config`, {
      signal: AbortSignal.timeout(2000),
    });
    serverReachable = res.ok || res.status === 401 || res.status === 403;
  } catch {
    serverReachable = false;
  }
});

// ---------------------------------------------------------------------------
// GET /api/sites/:siteId/ai-reports
// ---------------------------------------------------------------------------
describe("GET /api/sites/:siteId/ai-reports", () => {
  it("returns 403 when unauthenticated (no session cookie, no API key)", async () => {
    // requireSiteAccess returns 403 when getUserHasAccessToSite returns false,
    // which happens for any request without a valid session or API key.
    if (!serverReachable) {
      console.warn("Server not reachable — skipping unauthenticated test");
      return;
    }
    const res = await fetch(`${BASE_URL}/api/sites/1/ai-reports`);
    expect([401, 403]).toContain(res.status);
  });

  it.todo(
    "returns 200 with paginated report list for Pro org — " +
      "requires INTEGRATION_TEST_COOKIE set to a valid session for a Pro-tier site"
  );

  it.todo(
    "list response items do NOT include structuredSummaryJson field — " +
      "requires INTEGRATION_TEST_COOKIE + at least one complete ai_report row; " +
      "structuredSummaryJson is intentionally omitted from the list projection"
  );

  it.todo(
    "returns 403 for Starter org (tier gate) — " +
      "requires INTEGRATION_TEST_COOKIE for a Starter-tier site"
  );

  it.todo(
    "respects ?cadence=weekly|monthly|quarterly|yearly filter — " +
      "requires INTEGRATION_TEST_COOKIE + seeded ai_reports rows with mixed cadences"
  );

  it.todo(
    "returns empty data array when no reports have been generated yet — " +
      "requires INTEGRATION_TEST_COOKIE for a Pro site with no ai_reports rows"
  );

  it.todo(
    "returns 400 for invalid page / page_size query params — " +
      "requires INTEGRATION_TEST_COOKIE"
  );

  it.todo(
    "meta.total and meta.totalPages are consistent with data.length — " +
      "requires INTEGRATION_TEST_COOKIE + seeded ai_reports rows"
  );

  it.todo(
    "only returns reports with status=complete (pending/failed reports are excluded) — " +
      "requires INTEGRATION_TEST_COOKIE + seeded rows in multiple statuses"
  );
});

// ---------------------------------------------------------------------------
// GET /api/sites/:siteId/ai-reports/:reportId
// ---------------------------------------------------------------------------
describe("GET /api/sites/:siteId/ai-reports/:reportId", () => {
  it("returns 403 when unauthenticated (no session cookie, no API key)", async () => {
    if (!serverReachable) {
      console.warn("Server not reachable — skipping unauthenticated test");
      return;
    }
    const res = await fetch(`${BASE_URL}/api/sites/1/ai-reports/nonexistent-report-id`);
    expect([401, 403]).toContain(res.status);
  });

  it.todo(
    "returns 200 with full report including structuredSummaryJson — " +
      "requires INTEGRATION_TEST_COOKIE + a seeded complete ai_report row"
  );

  it.todo(
    "returned report includes all fields: id, cadence, periodStart, periodEnd, status, createdAt, structuredSummaryJson — " +
      "requires INTEGRATION_TEST_COOKIE + a seeded complete ai_report row"
  );

  it.todo(
    "returns 404 for a reportId that does not exist — " +
      "requires INTEGRATION_TEST_COOKIE (any valid Pro-tier session)"
  );

  it.todo(
    "returns 403 for a report belonging to a different org's site — " +
      "requires INTEGRATION_TEST_COOKIE scoped to org A + a report seeded for org B"
  );

  it.todo(
    "returns 403 for Starter org (tier gate) — " +
      "requires INTEGRATION_TEST_COOKIE for a Starter-tier site"
  );
});
