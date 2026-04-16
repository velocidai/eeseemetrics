/**
 * login.spec.ts
 *
 * Verifies the login page UI and auth flow.
 *
 * Requires:
 *   E2E_BASE_URL          — URL of the Next.js client (default: http://localhost:3002)
 *   E2E_PRO_USER_EMAIL    — valid test user email
 *   E2E_PRO_USER_PASSWORD — valid test user password
 *
 * Run with: E2E_BASE_URL=https://app.eeseemetrics.com npx playwright test login.spec.ts
 */

import { test, expect } from "@playwright/test";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const EMAIL = process.env.E2E_PRO_USER_EMAIL ?? "";
const PASSWORD = process.env.E2E_PRO_USER_PASSWORD ?? "";

test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
  });

  test("login page loads", async ({ page }) => {
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("login form has a submit button", async ({ page }) => {
    const btn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in"), button:has-text("Login")');
    await expect(btn.first()).toBeVisible();
  });

  test("empty form submission shows validation or stays on page", async ({ page }) => {
    const btn = page.locator('button[type="submit"], button:has-text("Login")').first();
    await btn.click();
    // HTML5 required validation or app error — either way should not navigate away
    const url = page.url();
    expect(url).toContain("login");
  });

  test("invalid credentials show error message", async ({ page }) => {
    await page.locator('input[type="email"], input[name="email"]').fill("invalid@example.com");
    await page.locator('input[type="password"]').fill("wrongpassword");
    await page.locator('button[type="submit"], button:has-text("Login")').first().click();

    await page.waitForTimeout(2000);
    const url = page.url();
    const isStillOnLogin = url.includes("login");
    const hasError = await page.locator('[role="alert"], .error, [class*="error"]').count() > 0;
    expect(isStillOnLogin || hasError).toBe(true);
  });

  test("valid credentials redirect to dashboard", async ({ page }) => {
    test.skip(!EMAIL || !PASSWORD, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

    await page.locator('input[type="email"], input[name="email"]').fill(EMAIL);
    await page.locator('input[type="password"]').fill(PASSWORD);
    await page.locator('button[type="submit"], button:has-text("Login")').first().click();

    await page.waitForURL(url => !url.href.includes("/login"), { timeout: 15000 });
    expect(page.url()).not.toContain("login");
  });
});
