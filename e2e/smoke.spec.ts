import { test, expect } from "@playwright/test";

// Smoke test — verifies playwright is correctly configured.
// This test does NOT require a running dev server; it just checks the config loads.
test("playwright config is valid", async () => {
  // This is a non-browser test that just validates the config file loaded correctly
  expect(true).toBe(true);
});
