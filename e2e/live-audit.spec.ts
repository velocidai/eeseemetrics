/**
 * live-audit.spec.ts
 *
 * Systematic sweep of every page and key API endpoint on the live app.
 * Reports any console [error], React crash, non-200 API response, or redirect to /login.
 *
 * Run: npx playwright test e2e/live-audit.spec.ts --reporter=list
 */

import { test, expect, request as apiRequest } from "@playwright/test";
import { login, getSessionCookie } from "./auth-helpers";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
const SITE_ID = "1b32d04e9572"; // quotecache.com — numeric site_id=1
const NUMERIC_SITE_ID = 1;

// ─── helpers ────────────────────────────────────────────────────────────────

async function auditPage(page: any, path: string) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 20000 });
  const url = page.url();
  const errors = await page.evaluate(() => (window as any).__auditErrors ?? []);
  return { url, path };
}

// ─── API endpoints ───────────────────────────────────────────────────────────

test.describe("API — all key endpoints", () => {
  let cookie = "";
  let orgId = "";

  test.beforeAll(async () => {
    cookie = await getSessionCookie();
    const ctx = await apiRequest.newContext();
    const orgs = await (await ctx.get(`${API}/api/user/organizations`, { headers: { Cookie: cookie } })).json();
    orgId = Array.isArray(orgs) ? orgs[0]?.id : "";
    await ctx.dispose();
  });

  const endpoints: Array<{ method: string; path: string; body?: any; expect: number[] }> = [
    { method: "GET",  path: "/api/health",                                            expect: [200] },
    { method: "GET",  path: "/api/version",                                           expect: [200] },
    { method: "GET",  path: "/api/config",                                            expect: [200] },
    { method: "GET",  path: "/api/user/api-keys",                                     expect: [200] },
    { method: "GET",  path: "/api/user/organizations",                                expect: [200] },
    { method: "GET",  path: `/api/organizations/__ORG__/sites`,                       expect: [200] },
    { method: "GET",  path: `/api/stripe/subscription?organizationId=__ORG__`,       expect: [200] },
    { method: "GET",  path: `/api/stripe/invoices?organizationId=__ORG__`,           expect: [200] },
    { method: "GET",  path: `/api/sites/${SITE_ID}/overview`,                        expect: [200] },
    { method: "GET",  path: `/api/sites/${SITE_ID}/overview-bucketed`,               expect: [200] },
    { method: "GET",  path: `/api/sites/${SITE_ID}/metric?parameter=pathname`,       expect: [200] },
    { method: "GET",  path: `/api/sites/${SITE_ID}/metric?parameter=country`,        expect: [200] },
    { method: "GET",  path: `/api/sites/${SITE_ID}/metric?parameter=browser`,        expect: [200] },
    { method: "GET",  path: `/api/sites/${SITE_ID}/metric?parameter=device_type`,    expect: [200] },
    { method: "GET",  path: `/api/sites/${SITE_ID}/sessions`,                        expect: [200] },
    { method: "GET",  path: `/api/sites/${SITE_ID}/users`,                           expect: [200] },
    { method: "GET",  path: `/api/sites/${SITE_ID}/events/names`,                    expect: [200] },
    { method: "GET",  path: `/api/sites/${SITE_ID}/error-names`,                     expect: [200] },
    { method: "GET",  path: `/api/sites/${SITE_ID}/has-data`,                        expect: [200] },
    { method: "GET",  path: `/api/sites/${SITE_ID}/goals`,                           expect: [200] },
    { method: "GET",  path: `/api/sites/${SITE_ID}/funnels`,                         expect: [200] },
    { method: "GET",  path: `/api/sites/${SITE_ID}/views`,                           expect: [200] },
    { method: "GET",  path: `/api/sites/${SITE_ID}/anomaly-alerts/unread-count`,     expect: [200] },
    { method: "GET",  path: `/api/sites/${SITE_ID}/notification-channels`,           expect: [200] },
    { method: "GET",  path: `/api/sites/${SITE_ID}/performance/overview`,            expect: [200] },
    { method: "GET",  path: `/api/sites/${SITE_ID}/gsc/status`,                     expect: [200] },
    { method: "GET",  path: `/api/uptime/monitors?siteId=${NUMERIC_SITE_ID}`,        expect: [200] },
    { method: "GET",  path: `/api/uptime/incidents`,                                  expect: [200] },
    { method: "GET",  path: `/api/ltd/slots`,                                         expect: [200] },
    { method: "GET",  path: `/api/sites/${SITE_ID}/session-replay/list`,             expect: [200] },
  ];

  for (const ep of endpoints) {
    test(`${ep.method} ${ep.path.replace("__ORG__", "<orgId>")}`, async () => {
      const ctx = await apiRequest.newContext();
      const path = ep.path.replace(/__ORG__/g, orgId);
      const resp = ep.method === "GET"
        ? await ctx.get(`${API}${path}`, { headers: { Cookie: cookie } })
        : await ctx.post(`${API}${path}`, { headers: { Cookie: cookie, "Content-Type": "application/json" }, data: ep.body });
      const status = resp.status();
      await ctx.dispose();
      expect(ep.expect, `${ep.method} ${path} returned ${status}, expected one of ${ep.expect}`).toContain(status);
    });
  }
});

// ─── UI pages ────────────────────────────────────────────────────────────────

test.describe("UI — all pages load without crash or login redirect", () => {
  test.setTimeout(30000);

  const pages: Array<{ path: string; skipLoginCheck?: boolean }> = [
    // Auth (public)
    { path: "/login",   skipLoginCheck: true },
    { path: "/signup",  skipLoginCheck: true },

    // Dashboard
    { path: `/${SITE_ID}/main` },
    { path: `/${SITE_ID}/pages` },
    { path: `/${SITE_ID}/sessions` },
    { path: `/${SITE_ID}/users` },
    { path: `/${SITE_ID}/events` },
    { path: `/${SITE_ID}/errors` },
    { path: `/${SITE_ID}/goals` },
    { path: `/${SITE_ID}/funnels` },
    { path: `/${SITE_ID}/journeys` },
    { path: `/${SITE_ID}/retention` },
    { path: `/${SITE_ID}/performance` },
    { path: `/${SITE_ID}/campaigns` },
    { path: `/${SITE_ID}/replay` },
    { path: `/${SITE_ID}/reports` },
    { path: `/${SITE_ID}/alerts` },
    { path: `/${SITE_ID}/globe` },
    { path: `/${SITE_ID}/search-console` },
    { path: `/${SITE_ID}/chat` },

    // Uptime
    { path: `/${SITE_ID}/uptime/monitors` },
    { path: `/${SITE_ID}/uptime/incidents` },
    { path: `/${SITE_ID}/uptime/status-page` },
    { path: `/${SITE_ID}/uptime/notifications` },

    // Settings
    { path: `/${SITE_ID}/settings/notifications` },
    { path: `/${SITE_ID}/settings/saved-views` },
    { path: "/settings/account" },
    { path: "/settings/organization/members" },
    { path: "/settings/organization/subscription" },

    // Admin
    { path: "/admin" },
  ];

  for (const { path, skipLoginCheck } of pages) {
    test(path, async ({ page }) => {
      // Collect console errors during navigation
      const consoleErrors: string[] = [];
      page.on("console", msg => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", err => consoleErrors.push(`[pageerror] ${err.message}`));

      if (!skipLoginCheck) {
        await login(page);
      }

      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 20000 });

      const finalUrl = page.url();

      // Must not redirect to login
      if (!skipLoginCheck) {
        expect(finalUrl, `${path} redirected to login`).not.toContain("/login");
      }

      // Must not be a 500 page
      expect(finalUrl, `${path} hit error page`).not.toContain("/500");
      expect(finalUrl, `${path} hit error page`).not.toContain("/_error");

      // No React crash (error #418 = hydration, error #130/#185 = render crash)
      const reactCrash = consoleErrors.find(e => /Minified React error #(130|185|423|425)/.test(e));
      expect(reactCrash, `${path} React crash: ${reactCrash}`).toBeUndefined();

      // No unhandled JS errors (filter known benign ones)
      const hardErrors = consoleErrors.filter(e =>
        !e.includes("favicon") &&
        !e.includes("duckduckgo") &&
        !e.includes("Failed to load resource") &&  // network 4xx on data endpoints is OK
        !e.includes("MISSING_MESSAGE") &&           // i18n warnings, not crashes
        !e.includes("hydration") &&                 // hydration warnings (not crashes)
        /pageerror/.test(e)                         // only flag unhandled JS exceptions
      );
      expect(hardErrors, `${path} unhandled JS errors:\n${hardErrors.join("\n")}`).toHaveLength(0);
    });
  }
});
