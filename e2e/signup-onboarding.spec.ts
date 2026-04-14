import { test, expect } from "@playwright/test";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";

test.describe("Signup and Onboarding Flow", () => {
  test("signup page renders with form elements", async ({ page }) => {
    // Navigate to the signup page
    await page.goto(`${BASE}/signup`, { waitUntil: "domcontentloaded", timeout: 15000 });

    expect(page.url()).not.toContain("/500");
    expect(page.url()).not.toContain("/error");

    // Email input should be present
    const emailInput = page
      .locator('input[type="email"], input[placeholder*="email"]')
      .first();
    await expect(emailInput).toBeVisible({ timeout: 8000 });

    // Password input should be present
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible({ timeout: 3000 });

    // Submit button present (may be disabled until Turnstile solves).
    // AccountStep uses type="button" not type="submit".
    const submitBtn = page.locator('button[type="button"], button[type="submit"]').first();
    await expect(submitBtn).toBeVisible({ timeout: 3000 });
  });
});
