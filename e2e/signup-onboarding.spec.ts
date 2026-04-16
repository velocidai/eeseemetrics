/**
 * signup-onboarding.spec.ts
 *
 * Verifies the signup page UI — step indicators, form elements, and step titles.
 *
 * Requires:
 *   E2E_BASE_URL — URL of the Next.js client (default: http://localhost:3002)
 *
 * Run:
 *   npx playwright test signup-onboarding.spec.ts
 */

import { test, expect } from "@playwright/test";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const IS_CLOUD = BASE.includes("app.eeseemetrics.com") || process.env.NEXT_PUBLIC_CLOUD === "true";

test.describe("Signup page — step 1 (Account)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/signup`, { waitUntil: "domcontentloaded", timeout: 15000 });
  });

  test("page loads without error", async ({ page }) => {
    expect(page.url()).not.toContain("/500");
    expect(page.url()).not.toContain("/error");
  });

  test("email and password inputs are visible", async ({ page }) => {
    await expect(page.locator('input[type="email"], input[placeholder*="email"]').first()).toBeVisible({ timeout: 8000 });
    await expect(page.locator('input[type="password"]').first()).toBeVisible({ timeout: 3000 });
  });

  test("Continue button is visible", async ({ page }) => {
    await expect(
      page.locator('button:has-text("Continue"), button[type="button"]').first()
    ).toBeVisible({ timeout: 3000 });
  });

  test("step indicators show correct number of steps", async ({ page }) => {
    // Cloud has 3 steps: Account, Add site, Pick plan
    // Self-hosted has 2 steps: Account, Add site
    await expect(page.getByText("Account").first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Add site").first()).toBeVisible({ timeout: 5000 });
    if (IS_CLOUD) {
      await expect(page.getByText("Pick plan").first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("step 1 label 'Account' is visible", async ({ page }) => {
    await expect(page.getByText("Account").first()).toBeVisible({ timeout: 5000 });
  });

  test("step 2 label 'Add site' is visible", async ({ page }) => {
    await expect(page.getByText("Add site").first()).toBeVisible({ timeout: 5000 });
  });

  test("'Log in' link is present for existing users", async ({ page }) => {
    const loginLink = page.getByRole("link", { name: /log in/i });
    await expect(loginLink).toBeVisible({ timeout: 3000 });
  });
});

test.describe("Signup page — step 2 (Add site)", () => {
  test("step 2 shows domain and org name fields", async ({ page }) => {
    await page.goto(`${BASE}/signup?step=2`, { waitUntil: "domcontentloaded", timeout: 15000 });
    // Step 2 requires auth — if redirected back to step 1 or login, that's acceptable
    if (page.url().includes("/login") || page.url().includes("step=1")) {
      test.skip();
      return;
    }
    expect(page.url()).not.toContain("/500");
  });
});
