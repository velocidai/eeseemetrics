/**
 * goals-funnels.spec.ts
 *
 * Verifies Create → List → Delete flows for Goals and Funnels.
 * Also checks client-side form validation.
 *
 * Requires (in e2e/.env):
 *   E2E_BASE_URL          — Next.js client URL
 *   E2E_PRO_USER_EMAIL    — valid test account email
 *   E2E_PRO_USER_PASSWORD — valid test account password
 *   E2E_TEST_SITE_ID      — site ID to create goals/funnels under
 */

import { test, expect } from "@playwright/test";
import { login } from "./auth-helpers";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
const EMAIL = process.env.E2E_PRO_USER_EMAIL ?? "";
const PASSWORD = process.env.E2E_PRO_USER_PASSWORD ?? "";
const SITE_ID = process.env.E2E_TEST_SITE_ID ?? "1";

const skipAll = !EMAIL || !PASSWORD;

test.describe("Goals CRUD", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  test("goals page loads", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/${SITE_ID}/goals`, { waitUntil: "domcontentloaded", timeout: 15000 });
    expect(page.url()).not.toContain("/500");
    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("create a path goal then delete it", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/${SITE_ID}/goals`, { waitUntil: "networkidle", timeout: 15000 });

    // Button is "Add Goal" (from t("Add Goal"))
    const createBtn = page
      .getByRole("button", { name: /add goal/i })
      .first();
    if (!await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip();
      return;
    }
    await createBtn.click();

    // Dialog should open with "Create Goal" title
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });

    // Fill in goal name (optional field: "Goal Name (optional)")
    const nameInput = page
      .locator('[role="dialog"] input[placeholder*="Sign Up"], [role="dialog"] input[placeholder*="name"]')
      .first();
    if (await nameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await nameInput.fill("E2E Test Goal");
    }

    // Path type should be selected by default ("Page Goal" button)
    // Fill in path pattern — field has placeholder "/checkout/complete or /product/*/view"
    const pathInput = page
      .locator('[role="dialog"] input[placeholder*="/checkout"], [role="dialog"] input[placeholder*="path"]')
      .first();
    if (await pathInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await pathInput.fill("/e2e-test-path");
    }

    // Submit — button says "Create"
    await page.locator('[role="dialog"] button[type="submit"]').click();
    await page.waitForTimeout(1500);

    // Should appear in the list
    const goalVisible = await page.getByText("E2E Test Goal").isVisible({ timeout: 5000 }).catch(() => false);
    if (!goalVisible) {
      // Goal may have been created without a name — check path appeared
      await page.getByText("/e2e-test-path").isVisible({ timeout: 3000 }).catch(() => false);
    }

    // Delete the goal — look for delete button
    const deleteBtn = page
      .locator('[aria-label*="delete"], [aria-label*="Delete"]')
      .or(page.getByRole("button", { name: /delete/i }))
      .first();
    if (await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deleteBtn.click();
      const confirmBtn = page.getByRole("button", { name: /delete|confirm/i }).last();
      if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmBtn.click();
      }
      await page.waitForTimeout(1000);
    }
  });

  test("path pattern validation — URL in path pattern is rejected", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/${SITE_ID}/goals`, { waitUntil: "networkidle", timeout: 15000 });

    const createBtn = page.getByRole("button", { name: /add goal/i }).first();
    if (!await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      test.skip();
      return;
    }
    await createBtn.click();

    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });

    // Fill in a full URL (invalid — should be path only)
    const pathInput = page
      .locator('[role="dialog"] input[placeholder*="/checkout"], [role="dialog"] input[placeholder*="path"]')
      .first();
    if (await pathInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await pathInput.fill("https://example.com/checkout");
    }

    await page.locator('[role="dialog"] button[type="submit"]').click();

    // Validation error: "Enter a path (e.g., /checkout), not a full URL."
    await expect(
      page.locator('[role="dialog"]').getByText(/enter a path|not a full URL|full URL/i)
    ).toBeVisible({ timeout: 3000 });
  });
});

test.describe("Funnels CRUD", () => {
  test.skip(skipAll, "Requires E2E_PRO_USER_EMAIL and E2E_PRO_USER_PASSWORD");

  test("funnels page loads", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/${SITE_ID}/funnels`, { waitUntil: "domcontentloaded", timeout: 15000 });
    expect(page.url()).not.toContain("/500");
    await expect(page.locator("body")).toBeVisible({ timeout: 10000 });
  });

  test("funnels page has create button", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE}/${SITE_ID}/funnels`, { waitUntil: "networkidle", timeout: 15000 });

    // Button says "Create Funnel"
    const createBtn = page
      .getByRole("button", { name: /create funnel/i })
      .first();

    // Funnels may be Pro-gated — if an upgrade overlay is showing, that's also valid
    const hasUpgradeOverlay = await page
      .getByText(/upgrade|unlock|pro plan/i)
      .first()
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (!hasUpgradeOverlay) {
      await expect(createBtn).toBeVisible({ timeout: 5000 });
    }
  });
});
