import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import path from "path";

// Auto-load e2e/.env if it exists (safe: no-op if file is missing)
loadEnv({ path: path.join(__dirname, "e2e", ".env") });

// Allow pointing tests at production: E2E_BASE_URL=https://app.eeseemetrics.com
const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3002";

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  // Load e2e/.env automatically (Playwright 1.20+ supports envFile or dotenv natively via --env-file flag)
  // Run with: E2E_API_BASE_URL=https://... npx playwright test
  // Or copy e2e/.env.example → e2e/.env and use: dotenv -e e2e/.env npx playwright test
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
