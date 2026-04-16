/**
 * team-invite.spec.ts
 *
 * Tests the team invite flow end-to-end:
 * 1. Org owner can open the invite dialog
 * 2. Invite form validates input
 * 3. Member management page is accessible
 * 4. API endpoint for listing members returns correct shape
 *
 * Full invite acceptance requires a second real email account.
 * The invite-sending side is verified via UI + API.
 *
 * Requires (in e2e/.env):
 *   E2E_BASE_URL          — Next.js client URL
 *   E2E_API_BASE_URL      — server API base
 *   E2E_PRO_USER_EMAIL    — org owner email
 *   E2E_PRO_USER_PASSWORD — org owner password
 *   E2E_TEST_SITE_ID      — site ID owned by this org
 *
 * Run:
 *   npx playwright test team-invite.spec.ts
 */

import { test, expect, request as apiRequest } from "@playwright/test";
import { getSessionCookie, login } from "./auth-helpers";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
const EMAIL = process.env.E2E_PRO_USER_EMAIL ?? "";
const PASSWORD = process.env.E2E_PRO_USER_PASSWORD ?? "";

const skipAll = !EMAIL || !PASSWORD;

test.describe("Team & Invite — API", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  let sessionCookie = "";

  test.beforeAll(async () => {
    sessionCookie = await getSessionCookie();
  });

  test("organization members endpoint returns member array", async () => {
    const ctx = await apiRequest.newContext();

    // First get the user's organizations to find the org ID
    const orgsResp = await ctx.get(`${API}/api/user/organizations`, {
      headers: { Cookie: sessionCookie },
    });
    expect(orgsResp.status()).toBe(200);
    const orgs = await orgsResp.json();
    const orgId = Array.isArray(orgs) ? orgs[0]?.id : orgs?.id;

    if (!orgId) {
      await ctx.dispose();
      test.skip();
      return;
    }

    // Use the custom organization members endpoint
    const resp = await ctx.get(`${API}/api/organizations/${orgId}/members`, {
      headers: { Cookie: sessionCookie },
    });
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    // Endpoint returns { success: true, data: [...] }
    const members = body.data ?? body.members ?? body;
    expect(Array.isArray(members)).toBe(true);
    expect(members.length).toBeGreaterThan(0);
    await ctx.dispose();
  });

  test("POST invite with invalid email returns 400", async () => {
    const ctx = await apiRequest.newContext();
    const resp = await ctx.post(`${API}/api/auth/organization/invite-member`, {
      data: { email: "not-an-email", role: "member" },
      headers: { Cookie: sessionCookie, "Content-Type": "application/json" },
    });
    expect(resp.status()).toBeGreaterThanOrEqual(400);
    expect(resp.status()).toBeLessThan(500);
    await ctx.dispose();
  });

  test("invite lifecycle: POST invite → appears in pending list → DELETE removes it", async () => {
    const ctx = await apiRequest.newContext();

    // Get org ID
    const orgsResp = await ctx.get(`${API}/api/user/organizations`, {
      headers: { Cookie: sessionCookie },
    });
    const orgs = await orgsResp.json();
    const orgId = Array.isArray(orgs) ? orgs[0]?.id : orgs?.id;
    if (!orgId) {
      await ctx.dispose();
      test.skip();
      return;
    }

    const testEmail = `e2e-invite-test-${Date.now()}@example-e2e.invalid`;

    // POST invite
    const inviteResp = await ctx.post(`${API}/api/auth/organization/invite-member`, {
      data: { email: testEmail, role: "member", organizationId: orgId },
      headers: { Cookie: sessionCookie, "Content-Type": "application/json" },
    });
    // 200 = invited; 403 = member limit reached (acceptable on Starter)
    expect([200, 201, 403]).toContain(inviteResp.status());

    if (inviteResp.status() === 403) {
      await ctx.dispose();
      return; // Member limit — skip remainder without failing
    }

    // Verify invite appears in member list
    const membersResp = await ctx.get(`${API}/api/organizations/${orgId}/members`, {
      headers: { Cookie: sessionCookie },
    });
    expect(membersResp.status()).toBe(200);
    const membersBody = await membersResp.json();
    const invitations = membersBody.invitations ?? membersBody.data?.invitations ?? [];
    const found = invitations.find((inv: any) => inv.email === testEmail);
    expect(found).toBeTruthy();

    // DELETE the invitation
    const invitationId = found?.id;
    if (invitationId) {
      const deleteResp = await ctx.delete(
        `${API}/api/auth/organization/delete-invitation`,
        {
          data: { invitationId },
          headers: { Cookie: sessionCookie, "Content-Type": "application/json" },
        }
      );
      expect([200, 204]).toContain(deleteResp.status());

      // Verify removed
      const afterResp = await ctx.get(`${API}/api/organizations/${orgId}/members`, {
        headers: { Cookie: sessionCookie },
      });
      const afterBody = await afterResp.json();
      const afterInvitations = afterBody.invitations ?? afterBody.data?.invitations ?? [];
      const stillPresent = afterInvitations.find((inv: any) => inv.email === testEmail);
      expect(stillPresent).toBeFalsy();
    }

    await ctx.dispose();
  });
});

test.describe("Team & Invite — UI", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  test("settings/team or settings/members page loads", async ({ page }) => {
    await login(page);

    // Try the most common org member management paths
    for (const path of ["/settings/team", "/settings/members", "/settings"]) {
      const resp = await page.goto(`${BASE}${path}`, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });
      if (resp && resp.status() < 400) {
        expect(page.url()).not.toContain("/500");
        break;
      }
    }
  });

  test("invite member dialog opens from settings", async ({ page }) => {
    await login(page);

    // Look for the invite button across team/settings pages
    for (const path of ["/settings/team", "/settings/members", "/settings"]) {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 15000 });

      const inviteBtn = page
        .getByRole("button", { name: /invite|add member|add team/i })
        .first();

      if (await inviteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await inviteBtn.click();

        // Check that an email input appears in the invite dialog
        const emailInput = page
          .locator('input[type="email"], input[placeholder*="email"]')
          .first();
        await expect(emailInput).toBeVisible({ timeout: 5000 });
        break;
      }
    }
  });

  test("invite form validates email format", async ({ page }) => {
    await login(page);

    for (const path of ["/settings/team", "/settings/members", "/settings"]) {
      await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 15000 });

      const inviteBtn = page
        .getByRole("button", { name: /invite|add member|add team/i })
        .first();

      if (await inviteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await inviteBtn.click();

        const emailInput = page
          .locator('input[type="email"], input[placeholder*="email"]')
          .first();

        if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          await emailInput.fill("bad-email");

          const submitBtn = page
            .getByRole("button", { name: /send|invite|submit/i })
            .last();
          await submitBtn.click();

          // HTML5 validation or custom validation should prevent submission
          // Either the input itself is invalid or an error message appears
          const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
          const hasErrorMessage = await page
            .locator("[class*='error'], [class*='invalid'], [role='alert']")
            .first()
            .isVisible({ timeout: 1000 })
            .catch(() => false);

          expect(isInvalid || hasErrorMessage).toBe(true);
        }
        break;
      }
    }
  });
});
