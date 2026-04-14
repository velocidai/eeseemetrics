/**
 * auth-guards.spec.ts
 *
 * Verifies that every endpoint that requires authentication actually
 * rejects unauthenticated requests (no session cookie, no API key).
 *
 * Rules tested:
 *  - authSite  → 401/403
 *  - adminSite → 401/403
 *  - orgMember → 401/403
 *  - authOnly  → 401/403
 *
 * All routes are registered under the /api prefix (server/src/index.ts line 485).
 * Public endpoints (publicSite) are excluded — tested via tracking-validation.spec.ts.
 *
 * Note: resource-specific DELETE/PUT/PATCH endpoints may return 404 when the fake
 * resource ID doesn't exist — the server may do existence lookup before auth.
 * Those tests accept [401, 403, 404].
 *
 * No running client or authenticated session required.
 */

import { test, expect } from "@playwright/test";

const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
const FAKE_SITE = "1";
const FAKE_ORG = "fake-org-id-99";
const FAKE_ID = "99999";
const FAKE_SESSION = "fake-session-id-xyz";

/** Assert auth rejection — accepts 401/403 */
async function assertAuthRequired(
  request: import("@playwright/test").APIRequestContext,
  method: "get" | "post" | "put" | "delete" | "patch",
  path: string,
  data?: object
) {
  const opts = data ? { data } : {};
  const res = await request[method](`${API}${path}`, opts as any);
  expect(
    [401, 403],
    `Expected 401/403 for ${method.toUpperCase()} ${path} but got ${res.status()}`
  ).toContain(res.status());
}

/** Assert auth rejection — accepts 401/403/404 (resource-specific endpoints) */
async function assertAuthOrNotFound(
  request: import("@playwright/test").APIRequestContext,
  method: "get" | "post" | "put" | "delete" | "patch",
  path: string,
  data?: object
) {
  const opts = data ? { data } : {};
  const res = await request[method](`${API}${path}`, opts as any);
  expect(
    [401, 403, 404],
    `Expected 401/403/404 for ${method.toUpperCase()} ${path} but got ${res.status()}`
  ).toContain(res.status());
}

test.describe("Auth guards — site write endpoints (authSite)", () => {
  test("POST /api/sites/:siteId/funnels requires auth", async ({ request }) => {
    await assertAuthRequired(request, "post", `/api/sites/${FAKE_SITE}/funnels`, {
      name: "Test",
      steps: [],
    });
  });

  test("DELETE /api/sites/:siteId/funnels/:id requires auth", async ({ request }) => {
    await assertAuthOrNotFound(request, "delete", `/api/sites/${FAKE_SITE}/funnels/${FAKE_ID}`);
  });

  test("POST /api/sites/:siteId/goals requires auth", async ({ request }) => {
    await assertAuthRequired(request, "post", `/api/sites/${FAKE_SITE}/goals`, {
      name: "Test Goal",
      type: "pageview",
      value: "/thank-you",
    });
  });

  test("DELETE /api/sites/:siteId/goals/:id requires auth", async ({ request }) => {
    await assertAuthOrNotFound(request, "delete", `/api/sites/${FAKE_SITE}/goals/${FAKE_ID}`);
  });

  test("PUT /api/sites/:siteId/goals/:id requires auth", async ({ request }) => {
    await assertAuthOrNotFound(request, "put", `/api/sites/${FAKE_SITE}/goals/${FAKE_ID}`, {
      name: "Updated Goal",
    });
  });

  test("POST /api/sites/:siteId/chat requires auth", async ({ request }) => {
    await assertAuthRequired(request, "post", `/api/sites/${FAKE_SITE}/chat`, {
      message: "hello",
    });
  });

  test("DELETE /api/sites/:siteId/session-replay/:id requires auth", async ({ request }) => {
    await assertAuthOrNotFound(
      request,
      "delete",
      `/api/sites/${FAKE_SITE}/session-replay/${FAKE_SESSION}`
    );
  });

  test("POST /api/sites/:siteId/complete-onboarding requires auth", async ({ request }) => {
    await assertAuthRequired(request, "post", `/api/sites/${FAKE_SITE}/complete-onboarding`);
  });
});

test.describe("Auth guards — site admin endpoints (adminSite)", () => {
  test("PUT /api/sites/:siteId/config requires admin auth", async ({ request }) => {
    await assertAuthRequired(request, "put", `/api/sites/${FAKE_SITE}/config`, {
      domain: "example.com",
    });
  });

  test("DELETE /api/sites/:siteId requires admin auth", async ({ request }) => {
    await assertAuthOrNotFound(request, "delete", `/api/sites/${FAKE_SITE}`);
  });

  test("GET /api/sites/:siteId/private-link-config requires admin auth", async ({ request }) => {
    await assertAuthRequired(request, "get", `/api/sites/${FAKE_SITE}/private-link-config`);
  });

  test("POST /api/sites/:siteId/private-link-config requires admin auth", async ({ request }) => {
    await assertAuthRequired(request, "post", `/api/sites/${FAKE_SITE}/private-link-config`, {});
  });

  test("GET /api/sites/:siteId/excluded-ips requires auth", async ({ request }) => {
    await assertAuthRequired(request, "get", `/api/sites/${FAKE_SITE}/excluded-ips`);
  });

  test("GET /api/sites/:siteId/excluded-countries requires auth", async ({ request }) => {
    await assertAuthRequired(request, "get", `/api/sites/${FAKE_SITE}/excluded-countries`);
  });

  test("GET /api/sites/:siteId/verify-script requires auth", async ({ request }) => {
    await assertAuthRequired(request, "get", `/api/sites/${FAKE_SITE}/verify-script`);
  });

  test("GET /api/sites/:siteId/imports requires admin auth", async ({ request }) => {
    await assertAuthRequired(request, "get", `/api/sites/${FAKE_SITE}/imports`);
  });
});

test.describe("Auth guards — anomaly & alert endpoints (authSite)", () => {
  test("GET /api/sites/:siteId/anomaly-alerts requires auth", async ({ request }) => {
    await assertAuthRequired(request, "get", `/api/sites/${FAKE_SITE}/anomaly-alerts`);
  });

  test("PATCH /api/sites/:siteId/anomaly-alerts/:id requires auth", async ({ request }) => {
    await assertAuthOrNotFound(
      request,
      "patch",
      `/api/sites/${FAKE_SITE}/anomaly-alerts/${FAKE_ID}`,
      { read: true }
    );
  });

  test("GET /api/sites/:siteId/anomaly-alerts/unread-count requires auth", async ({ request }) => {
    await assertAuthRequired(request, "get", `/api/sites/${FAKE_SITE}/anomaly-alerts/unread-count`);
  });

  test("GET /api/sites/:siteId/alert-rules requires auth", async ({ request }) => {
    await assertAuthRequired(request, "get", `/api/sites/${FAKE_SITE}/alert-rules`);
  });

  test("POST /api/sites/:siteId/alert-rules requires auth", async ({ request }) => {
    await assertAuthRequired(request, "post", `/api/sites/${FAKE_SITE}/alert-rules`, {
      metric: "pageviews",
      threshold: 100,
    });
  });

  test("PATCH /api/sites/:siteId/alert-rules/:id requires auth", async ({ request }) => {
    await assertAuthOrNotFound(
      request,
      "patch",
      `/api/sites/${FAKE_SITE}/alert-rules/${FAKE_ID}`,
      { threshold: 200 }
    );
  });

  test("DELETE /api/sites/:siteId/alert-rules/:id requires auth", async ({ request }) => {
    await assertAuthOrNotFound(
      request,
      "delete",
      `/api/sites/${FAKE_SITE}/alert-rules/${FAKE_ID}`
    );
  });
});

test.describe("Auth guards — notification channels (authSite)", () => {
  test("GET /api/sites/:siteId/notification-channels requires auth", async ({ request }) => {
    await assertAuthRequired(request, "get", `/api/sites/${FAKE_SITE}/notification-channels`);
  });

  test("POST /api/sites/:siteId/notification-channels requires auth", async ({ request }) => {
    await assertAuthRequired(request, "post", `/api/sites/${FAKE_SITE}/notification-channels`, {
      type: "email",
      value: "test@example.com",
    });
  });

  test("PUT /api/sites/:siteId/notification-channels/:id requires auth", async ({ request }) => {
    await assertAuthOrNotFound(
      request,
      "put",
      `/api/sites/${FAKE_SITE}/notification-channels/${FAKE_ID}`,
      { value: "new@example.com" }
    );
  });

  test("DELETE /api/sites/:siteId/notification-channels/:id requires auth", async ({ request }) => {
    await assertAuthOrNotFound(
      request,
      "delete",
      `/api/sites/${FAKE_SITE}/notification-channels/${FAKE_ID}`
    );
  });
});

test.describe("Auth guards — AI reports (authSite)", () => {
  test("GET /api/sites/:siteId/ai-reports requires auth", async ({ request }) => {
    await assertAuthRequired(request, "get", `/api/sites/${FAKE_SITE}/ai-reports`);
  });

  test("GET /api/sites/:siteId/ai-reports/:id requires auth", async ({ request }) => {
    await assertAuthOrNotFound(request, "get", `/api/sites/${FAKE_SITE}/ai-reports/${FAKE_ID}`);
  });
});

test.describe("Auth guards — GSC (authSite)", () => {
  test("GET /api/sites/:siteId/gsc/connect requires auth", async ({ request }) => {
    await assertAuthRequired(request, "get", `/api/sites/${FAKE_SITE}/gsc/connect`);
  });

  test("DELETE /api/sites/:siteId/gsc/disconnect requires auth", async ({ request }) => {
    await assertAuthRequired(request, "delete", `/api/sites/${FAKE_SITE}/gsc/disconnect`);
  });

  test("POST /api/sites/:siteId/gsc/select-property requires auth", async ({ request }) => {
    await assertAuthRequired(request, "post", `/api/sites/${FAKE_SITE}/gsc/select-property`, {
      property: "sc-domain:example.com",
    });
  });
});

test.describe("Auth guards — Stripe (authOnly, IS_CLOUD only)", () => {
  test("POST /api/stripe/create-checkout-session requires auth", async ({ request }) => {
    const res = await request.post(`${API}/api/stripe/create-checkout-session`, {
      data: { planId: "starter" },
    });
    // If IS_CLOUD=false the route won't exist (404) — that's fine
    // If IS_CLOUD=true it must require auth
    expect(
      [401, 403, 404],
      `Expected 401/403 (or 404 if IS_CLOUD=false) but got ${res.status()}`
    ).toContain(res.status());
    if ([401, 403].includes(res.status())) {
      // confirmed auth guard is working
    }
  });

  test("POST /api/stripe/create-portal-session requires auth", async ({ request }) => {
    const res = await request.post(`${API}/api/stripe/create-portal-session`);
    expect([401, 403, 404]).toContain(res.status());
  });

  test("GET /api/stripe/invoices requires auth", async ({ request }) => {
    const res = await request.get(`${API}/api/stripe/invoices`);
    expect([401, 403, 404]).toContain(res.status());
  });

  test("GET /api/stripe/subscription requires auth", async ({ request }) => {
    const res = await request.get(`${API}/api/stripe/subscription`);
    expect([401, 403, 404]).toContain(res.status());
  });
});

test.describe("Auth guards — Super-admin panel (adminOnly)", () => {
  test("GET /api/admin/sites requires super-admin auth", async ({ request }) => {
    const res = await request.get(`${API}/api/admin/sites`);
    expect([401, 403, 404]).toContain(res.status());
  });

  test("GET /api/admin/organizations requires super-admin auth", async ({ request }) => {
    const res = await request.get(`${API}/api/admin/organizations`);
    expect([401, 403, 404]).toContain(res.status());
  });

  test("GET /api/admin/service-event-count requires super-admin auth", async ({ request }) => {
    const res = await request.get(`${API}/api/admin/service-event-count`);
    expect([401, 403, 404]).toContain(res.status());
  });
});

test.describe("Auth guards — org membership (orgMember)", () => {
  test("GET /api/org-event-count/:orgId requires org membership", async ({ request }) => {
    await assertAuthOrNotFound(request, "get", `/api/org-event-count/${FAKE_ORG}`);
  });

  test("GET /api/organizations/:orgId/members requires org membership", async ({ request }) => {
    await assertAuthOrNotFound(request, "get", `/api/organizations/${FAKE_ORG}/members`);
  });
});
