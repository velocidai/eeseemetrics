/**
 * cors.spec.ts
 *
 * Verifies CORS behavior for all endpoint categories:
 *   - Public tracking endpoint allows any origin
 *   - Static assets allow any origin
 *   - Auth-required endpoints still send CORS headers (so JS clients get the 401, not a CORS failure)
 *   - credentials: true is signalled (Access-Control-Allow-Credentials)
 *   - Preflight OPTIONS requests are handled correctly
 *
 * No auth required.
 */

import { test, expect } from "@playwright/test";

const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";

const THIRD_PARTY_ORIGIN = "https://customer-site.example.com";
const LOCALHOST_ORIGIN = "http://localhost:3002";

/** Make an actual cross-origin request (simulated) and return CORS response headers */
async function corsRequest(
  request: import("@playwright/test").APIRequestContext,
  method: string,
  path: string,
  origin: string,
  data?: object
) {
  const headers: Record<string, string> = { Origin: origin };
  if (data) headers["Content-Type"] = "application/json";

  return request.fetch(`${API}${path}`, {
    method,
    headers,
    data: data ? JSON.stringify(data) : undefined,
  });
}

/** Make an OPTIONS preflight request */
async function preflight(
  request: import("@playwright/test").APIRequestContext,
  path: string,
  origin: string,
  requestMethod = "POST"
) {
  return request.fetch(`${API}${path}`, {
    method: "OPTIONS",
    headers: {
      Origin: origin,
      "Access-Control-Request-Method": requestMethod,
      "Access-Control-Request-Headers": "Content-Type",
    },
  });
}

test.describe("CORS — tracking endpoint", () => {
  test("POST /api/track from third-party origin has ACAO header", async ({ request }) => {
    const res = await corsRequest(
      request,
      "POST",
      "/api/track",
      THIRD_PARTY_ORIGIN,
      { type: "pageview", site_id: "1", hostname: "customer-site.example.com", pathname: "/" }
    );
    const acao = res.headers()["access-control-allow-origin"];
    expect(acao, "ACAO header must be present").toBeTruthy();
    // Wildcard or explicit echo
    expect(["*", THIRD_PARTY_ORIGIN]).toContain(acao);
  });

  test("POST /api/track preflight from third-party origin returns 200/204", async ({
    request,
  }) => {
    const res = await preflight(request, "/api/track", THIRD_PARTY_ORIGIN);
    expect([200, 204]).toContain(res.status());
    const acam = res.headers()["access-control-allow-methods"];
    expect(acam).toMatch(/POST/i);
  });

  test("POST /track alias preflight does not return 5xx", async ({ request }) => {
    // The /track alias is registered as POST only (not inside the cors plugin scope),
    // so OPTIONS may return 400/404 instead of 204 — that's acceptable as long as
    // the actual POST still works (tested in tracking-validation.spec.ts).
    const res = await preflight(request, "/track", THIRD_PARTY_ORIGIN);
    expect(res.status()).toBeLessThan(500);
  });

  test("CORS headers present even when payload is invalid (so JS can read the error)", async ({
    request,
  }) => {
    const res = await corsRequest(request, "POST", "/api/track", THIRD_PARTY_ORIGIN, {
      /* missing required fields */
    });
    // Response may be 4xx but must still include ACAO so the browser can read the error body
    const acao = res.headers()["access-control-allow-origin"];
    expect(acao).toBeTruthy();
  });
});

test.describe("CORS — static assets", () => {
  test("GET /api/script.js from any origin succeeds", async ({ request }) => {
    const res = await corsRequest(request, "GET", "/api/script.js", THIRD_PARTY_ORIGIN);
    expect(res.status()).toBe(200);
  });

  test("GET /api/replay.js from any origin succeeds", async ({ request }) => {
    const res = await corsRequest(request, "GET", "/api/replay.js", THIRD_PARTY_ORIGIN);
    expect(res.status()).toBe(200);
  });

  test("GET /api/metrics.js from any origin succeeds", async ({ request }) => {
    const res = await corsRequest(request, "GET", "/api/metrics.js", THIRD_PARTY_ORIGIN);
    expect(res.status()).toBe(200);
  });
});

test.describe("CORS — auth-required endpoints still respond (not pre-blocked)", () => {
  test("GET /api/sites/1/excluded-ips returns ACAO header with 401/403", async ({ request }) => {
    const res = await corsRequest(request, "GET", "/api/sites/1/excluded-ips", LOCALHOST_ORIGIN);
    // Auth should fail, but CORS headers must be present so the browser delivers the 401
    expect([401, 403]).toContain(res.status());
    const acao = res.headers()["access-control-allow-origin"];
    expect(acao).toBeTruthy();
  });

  test("POST /api/stripe/create-checkout-session returns ACAO header with 401/403/404", async ({
    request,
  }) => {
    const res = await corsRequest(
      request,
      "POST",
      "/api/stripe/create-checkout-session",
      LOCALHOST_ORIGIN,
      {}
    );
    // 404 if IS_CLOUD=false; 401/403 if IS_CLOUD=true
    expect([401, 403, 404]).toContain(res.status());
    const acao = res.headers()["access-control-allow-origin"];
    expect(acao).toBeTruthy();
  });

  test("OPTIONS preflight on auth endpoint returns 200/204 (not blocked)", async ({
    request,
  }) => {
    const res = await preflight(request, "/api/sites/1/excluded-ips", LOCALHOST_ORIGIN, "GET");
    expect([200, 204]).toContain(res.status());
  });
});

test.describe("CORS — credentials flag", () => {
  test("Credentialed request to /api/track includes allow-credentials header", async ({
    request,
  }) => {
    const res = await request.fetch(`${API}/api/track`, {
      method: "POST",
      headers: {
        Origin: LOCALHOST_ORIGIN,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        type: "pageview",
        site_id: "1",
        hostname: "localhost",
        pathname: "/test",
      }),
    });
    const acac = res.headers()["access-control-allow-credentials"];
    // If origin is echoed (not *), credentials header should be "true"
    const acao = res.headers()["access-control-allow-origin"];
    if (acao && acao !== "*") {
      expect(acac).toBe("true");
    }
    // If wildcard, credentials is omitted — both are valid configurations
  });

  test("Preflight from localhost includes allowed headers for Content-Type", async ({
    request,
  }) => {
    const res = await preflight(request, "/api/track", LOCALHOST_ORIGIN);
    expect([200, 204]).toContain(res.status());
    const acah = res.headers()["access-control-allow-headers"] ?? "";
    expect(acah.toLowerCase()).toContain("content-type");
  });

  test("Preflight from localhost includes x-private-key in allowed headers", async ({
    request,
  }) => {
    const res = await request.fetch(`${API}/api/sites/1/overview`, {
      method: "OPTIONS",
      headers: {
        Origin: LOCALHOST_ORIGIN,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "x-private-key",
      },
    });
    expect([200, 204]).toContain(res.status());
    const acah = res.headers()["access-control-allow-headers"] ?? "";
    expect(acah.toLowerCase()).toContain("x-private-key");
  });
});

test.describe("CORS — method allowlist", () => {
  const methodsToCheck = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;

  for (const method of methodsToCheck) {
    test(`OPTIONS preflight advertises ${method} as allowed`, async ({ request }) => {
      const res = await preflight(request, "/api/track", LOCALHOST_ORIGIN, method);
      expect([200, 204]).toContain(res.status());
      const acam = res.headers()["access-control-allow-methods"] ?? "";
      expect(acam.toUpperCase()).toContain(method);
    });
  }
});
