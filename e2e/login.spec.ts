/**
 * login.spec.ts
 *
 * Verifies the login page UI and auth flow.
 *
 * Requires:
 *   E2E_BASE_URL  — URL of the Next.js client (default: http://localhost:3002)
 *   E2E_PRO_USER_EMAIL    — valid test user email
 *   E2E_PRO_USER_PASSWORD — valid test user password
 *
 * Run with: E2E_BASE_URL=https://app.eeseemetrics.com npx playwright test login.spec.ts
 */

import { test, expect } from "@playwright/test";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const EMAIL = process.env.E2E_PRO_USER_EMAIL ?? "";
const PASSWORD = process.env.E2E_PRO_USER_PASSWORD ?? "";
const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";

// Turnstile CAPTCHA is enabled in production and disables the submit button
// until the CAPTCHA is solved — tests that click the submit button are skipped
// in cloud mode. API-level auth tests are not affected.
const isProduction = BASE.includes("app.eeseemetrics.com");

test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
  });

  test("login page loads", async ({ page }) => {
    // Should show email and password inputs
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("login form has a submit button", async ({ page }) => {
    const btn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")');
    await expect(btn.first()).toBeVisible();
  });

  test("empty form submission shows validation or stays on page", async ({ page }) => {
    test.skip(isProduction, "Submit button disabled by Turnstile in production");
    const btn = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")');
    await btn.first().click();
    // Should either show validation errors or stay on the login page
    await expect(page).not.toHaveURL(/\/(main|dashboard)/, { timeout: 3000 }).catch(() => {});
    // Either an error message appears or required field validation triggers
    const url = page.url();
    expect(url).toContain("login");
  });

  test("invalid credentials show error message", async ({ page }) => {
    test.skip(isProduction, "Submit button disabled by Turnstile in production");
    await page.locator('input[type="email"], input[name="email"]').fill("invalid@example.com");
    await page.locator('input[type="password"]').fill("wrongpassword");
    await page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")').first().click();

    // Should stay on login page or show an error
    await page.waitForTimeout(2000);
    const url = page.url();
    // Either we're still on login or there's an error visible
    const isStillOnLogin = url.includes("login");
    const hasError = await page.locator('[role="alert"], .error, [class*="error"]').count() > 0;
    expect(isStillOnLogin || hasError).toBe(true);
  });

  test.skip(!EMAIL || !PASSWORD, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  test("valid credentials redirect to dashboard", async ({ page }) => {
    test.skip(!EMAIL || !PASSWORD, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");
    test.skip(isProduction, "Submit button disabled by Turnstile in production");

    await page.locator('input[type="email"], input[name="email"]').fill(EMAIL);
    await page.locator('input[type="password"]').fill(PASSWORD);
    await page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")').first().click();

    // Should redirect away from login page
    await page.waitForURL(url => !url.href.includes("/login"), { timeout: 15000 });
    expect(page.url()).not.toContain("login");
  });
});
