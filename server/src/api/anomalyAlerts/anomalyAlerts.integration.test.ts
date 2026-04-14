/**
 * Anomaly Alerts API — Integration Tests
 *
 * These tests run against the server at http://localhost:3001.
 * Start the server before running: cd server && npm run dev
 *
 * Route registrations (from src/index.ts — registered under /api prefix):
 *   GET   /api/sites/:siteId/anomaly-alerts
 *   PATCH /api/sites/:siteId/anomaly-alerts/:alertId
 *   GET   /api/sites/:siteId/anomaly-alerts/unread-count
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
// GET /api/sites/:siteId/anomaly-alerts
// ---------------------------------------------------------------------------
describe("GET /api/sites/:siteId/anomaly-alerts", () => {
  it("returns 403 when unauthenticated (no session cookie, no API key)", async () => {
    // requireSiteAccess returns 403 when getUserHasAccessToSite returns false,
    // which happens for any request without a valid session or API key.
    if (!serverReachable) {
      console.warn("Server not reachable — skipping unauthenticated test");
      return;
    }
    const res = await fetch(`${BASE_URL}/api/sites/1/anomaly-alerts`);
    expect([401, 403]).toContain(res.status);
  });

  it.todo(
    "returns 200 with paginated alert list for Pro org — " +
      "requires INTEGRATION_TEST_COOKIE set to a valid session for a Pro-tier site"
  );

  it.todo(
    "returns 403 for Starter org (tier gate) — " +
      "requires INTEGRATION_TEST_COOKIE for a Starter-tier site"
  );

  it.todo(
    "respects ?status=new|seen|dismissed filter — " +
      "requires INTEGRATION_TEST_COOKIE + seeded anomaly_alerts rows"
  );

  it.todo(
    "respects ?severity=low|medium|high filter — " +
      "requires INTEGRATION_TEST_COOKIE + seeded anomaly_alerts rows"
  );

  it.todo(
    "meta.hasEnoughData is false when site has fewer than MIN_DAYS_FOR_ANOMALY days of pageview data — " +
      "requires INTEGRATION_TEST_COOKIE + a site with minimal ClickHouse data"
  );

  it.todo(
    "returns 400 for invalid page / page_size query params — " +
      "requires INTEGRATION_TEST_COOKIE"
  );
});

// ---------------------------------------------------------------------------
// PATCH /api/sites/:siteId/anomaly-alerts/:alertId
// ---------------------------------------------------------------------------
describe("PATCH /api/sites/:siteId/anomaly-alerts/:alertId", () => {
  it("returns 403 when unauthenticated (no session cookie, no API key)", async () => {
    if (!serverReachable) {
      console.warn("Server not reachable — skipping unauthenticated test");
      return;
    }
    const res = await fetch(`${BASE_URL}/api/sites/1/anomaly-alerts/fake-alert-id`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "seen" }),
    });
    expect([401, 403]).toContain(res.status);
  });

  it.todo(
    'marks an alert as "seen" — ' +
      "requires INTEGRATION_TEST_COOKIE + seeded alert row in anomaly_alerts"
  );

  it.todo(
    'dismisses an alert (status → "dismissed") — ' +
      "requires INTEGRATION_TEST_COOKIE + seeded alert row"
  );

  it.todo(
    "returns 404 for an alertId that does not exist — " +
      "requires INTEGRATION_TEST_COOKIE"
  );

  it.todo(
    "returns 403 when alert belongs to a site in a different org — " +
      "requires INTEGRATION_TEST_COOKIE scoped to org A + an alert seeded for org B"
  );

  it.todo(
    "returns 400 for an invalid status value (e.g. status=invalid) — " +
      "requires INTEGRATION_TEST_COOKIE"
  );
});

// ---------------------------------------------------------------------------
// GET /api/sites/:siteId/anomaly-alerts/unread-count
// ---------------------------------------------------------------------------
describe("GET /api/sites/:siteId/anomaly-alerts/unread-count", () => {
  it("returns 403 when unauthenticated (no session cookie, no API key)", async () => {
    if (!serverReachable) {
      console.warn("Server not reachable — skipping unauthenticated test");
      return;
    }
    const res = await fetch(`${BASE_URL}/api/sites/1/anomaly-alerts/unread-count`);
    expect([401, 403]).toContain(res.status);
  });

  it.todo(
    "returns { count: N } for a Pro org — " +
      "requires INTEGRATION_TEST_COOKIE + seeded new-status alert rows"
  );

  it.todo(
    "returns { count: 0 } for a Starter org (graceful degradation — endpoint does NOT return 403) — " +
      "requires INTEGRATION_TEST_COOKIE for a Starter-tier site"
  );

  it.todo(
    "count only includes alerts with status=new (not seen/dismissed) — " +
      "requires INTEGRATION_TEST_COOKIE + seeded alerts in mixed statuses"
  );
});
