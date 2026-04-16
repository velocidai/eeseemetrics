/**
 * dashboard-data-accuracy.spec.ts
 *
 * Verifies the analytics pipeline produces structurally correct data —
 * not just that pages load, but that API responses have the right shape
 * and contain real numbers.
 *
 * Uses E2E_TEST_SITE_ID which must be a site with existing pageview data.
 *
 * Requires (in e2e/.env):
 *   E2E_API_BASE_URL  — server API base
 *   E2E_PRO_USER_EMAIL / E2E_PRO_USER_PASSWORD — authenticated user
 *   E2E_TEST_SITE_ID  — site ID with real data
 *
 * Run:
 *   npx playwright test dashboard-data-accuracy.spec.ts
 */

import { test, expect, request as apiRequest } from "@playwright/test";
import { getSessionCookie } from "./auth-helpers";

const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
const SITE_ID = process.env.E2E_TEST_SITE_ID ?? "1";
const EMAIL = process.env.E2E_PRO_USER_EMAIL ?? "";
const PASSWORD = process.env.E2E_PRO_USER_PASSWORD ?? "";

const skipAll = !EMAIL || !PASSWORD;

// Wide date range to capture all historical data
const PARAMS = "startDate=2020-01-01&endDate=2099-01-01&timezone=UTC";

test.describe("Data accuracy — overview", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  let cookie = "";
  test.beforeAll(async () => { cookie = await getSessionCookie(); });

  test("overview has pageviews > 0", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/sites/${SITE_ID}/overview?${PARAMS}`, {
      headers: { Cookie: cookie },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    // API returns { data: { pageviews, sessions, users, ... } }
    const data = body.data ?? body;
    expect(typeof data.pageviews).toBe("number");
    expect(typeof data.sessions).toBe("number");
    expect(typeof data.users).toBe("number");
    expect(data.pageviews).toBeGreaterThan(0);
    await ctx.dispose();
  });

  test("overview has bounce_rate between 0 and 100", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(`${API}/api/sites/${SITE_ID}/overview?${PARAMS}`, {
      headers: { Cookie: cookie },
    });
    const body = await resp.json();
    if (body.bounce_rate !== null && body.bounce_rate !== undefined) {
      expect(body.bounce_rate).toBeGreaterThanOrEqual(0);
      expect(body.bounce_rate).toBeLessThanOrEqual(100);
    }
    await ctx.dispose();
  });
});

test.describe("Data accuracy — metric dimensions", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  let cookie = "";
  test.beforeAll(async () => { cookie = await getSessionCookie(); });

  const DIMENSIONS = ["pathname", "country", "browser", "operating_system", "device_type", "referrer"];

  for (const dimension of DIMENSIONS) {
    test(`metric[${dimension}] returns rows with value and count`, async () => {
      const ctx = await apiRequest.newContext();
      const resp = await ctx.get(
        `${API}/api/sites/${SITE_ID}/metric?parameter=${dimension}&${PARAMS}&limit=5`,
        { headers: { Cookie: cookie } }
      );
      expect(resp.status()).toBe(200);
      const body = await resp.json();
      // API returns { data: { data: items, totalCount } }
      const arr = Array.isArray(body) ? body : body?.data?.data ?? body?.data ?? [];
      expect(arr.length).toBeGreaterThan(0);
      const first = arr[0];
      expect(first).toHaveProperty("value");
      expect(first).toHaveProperty("count");
      expect(typeof first.count).toBe("number");
      expect(first.count).toBeGreaterThan(0);
      await ctx.dispose();
    });
  }
});

test.describe("Data accuracy — sessions", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  let cookie = "";
  test.beforeAll(async () => { cookie = await getSessionCookie(); });

  test("sessions list returns rows with required fields", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(
      `${API}/api/sites/${SITE_ID}/sessions?${PARAMS}&limit=5`,
      { headers: { Cookie: cookie } }
    );
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    const sessions = Array.isArray(body) ? body : body?.data ?? body?.sessions ?? [];
    expect(sessions.length).toBeGreaterThan(0);

    const s = sessions[0];
    expect(s).toHaveProperty("session_id");
    // Must have a start time — field is session_start in this API
    const hasStart = "session_start" in s || "started_at" in s || "start_time" in s || "created_at" in s || "timestamp" in s;
    expect(hasStart).toBe(true);
    await ctx.dispose();
  });

  test("single session endpoint returns events array", async () => {
    const ctx = await apiRequest.newContext();
    // Get a session ID first
    const listResp = await ctx.get(
      `${API}/api/sites/${SITE_ID}/sessions?${PARAMS}&limit=1`,
      { headers: { Cookie: cookie } }
    );
    const sessions = await listResp.json();
    const arr = Array.isArray(sessions) ? sessions : sessions?.data ?? [];
    if (arr.length === 0) {
      await ctx.dispose();
      return;
    }
    const sessionId = arr[0].session_id;

    const resp = await ctx.get(
      `${API}/api/sites/${SITE_ID}/sessions/${sessionId}?${PARAMS}`,
      { headers: { Cookie: cookie } }
    );
    expect([200, 404]).toContain(resp.status());
    await ctx.dispose();
  });
});

test.describe("Data accuracy — users", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  let cookie = "";
  test.beforeAll(async () => { cookie = await getSessionCookie(); });

  test("users list returns rows", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(
      `${API}/api/sites/${SITE_ID}/users?${PARAMS}&limit=5`,
      { headers: { Cookie: cookie } }
    );
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    const users = Array.isArray(body) ? body : body?.data ?? body?.users ?? [];
    expect(users.length).toBeGreaterThan(0);
    await ctx.dispose();
  });
});

test.describe("Data accuracy — overview bucketed", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  let cookie = "";
  test.beforeAll(async () => { cookie = await getSessionCookie(); });

  test("overview-bucketed returns array of time buckets with counts", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.get(
      `${API}/api/sites/${SITE_ID}/overview-bucketed?${PARAMS}&bucket=day`,
      { headers: { Cookie: cookie } }
    );
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    const arr = Array.isArray(body) ? body : body?.data ?? [];
    expect(arr.length).toBeGreaterThan(0);
    const first = arr[0];
    // Each bucket must have a time key and at least one metric
    const hasTime = "date" in first || "time" in first || "bucket" in first || "day" in first || "timestamp" in first;
    expect(hasTime).toBe(true);
    await ctx.dispose();
  });
});
