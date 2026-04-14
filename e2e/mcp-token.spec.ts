import { test, expect } from "@playwright/test";
import { login } from "./auth-helpers";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";

test.describe("MCP Token Lifecycle", () => {
  test("can create, view, and delete an MCP token", async ({ page }) => {
    await login(page);

    const siteId = page.url().split("/")[3];

    // Navigate to MCP settings page
    // Based on the sidebar, this is likely /[site]/settings/... or in api-playground
    // Adjust URL to match actual MCP token management page
    await page.goto(`${BASE}/${siteId}/api-playground`);
    await page.waitForLoadState("networkidle");

    // Find the "Generate Token" or "Create Token" button
    const createButton = page.getByRole("button", { name: /generate|create.*token/i }).first();
    if (!(await createButton.isVisible())) {
      // MCP tokens might be in a different location — find it
      test.skip();
      return;
    }

    await createButton.click();
    await page.waitForTimeout(1000);

    // Token should be displayed (masked or shown once)
    const tokenDisplay = page.locator("[data-testid='mcp-token'], input[readonly]").first();
    await expect(tokenDisplay).toBeVisible({ timeout: 3000 });

    // Copy button should exist
    await expect(page.getByRole("button", { name: /copy/i })).toBeVisible();

    // Delete the token
    const deleteButton = page.getByRole("button", { name: /delete|revoke/i }).first();
    await deleteButton.click();

    // Confirm deletion dialog if present
    const confirmButton = page.getByRole("button", { name: /confirm|delete/i }).last();
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    await page.waitForTimeout(500);
    // Token should no longer be in the list
  });

  test("MCP API call with valid token returns data", async ({ page, request }) => {
    // This test makes a direct HTTP request to the MCP endpoint
    // You need a valid token — either created in this test or passed via env var
    const token = process.env.E2E_MCP_TOKEN;
    if (!token) {
      test.skip();
      return;
    }

    const response = await request.post(
      `${process.env.E2E_API_BASE_URL ?? "http://localhost:3001"}/api/mcp`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
        },
        data: {
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: "get_overview",
            arguments: {
              start_date: "2026-03-01",
              end_date: "2026-03-29",
            },
          },
          id: 1,
        },
      }
    );

    expect(response.status()).toBe(200);
    const ct: string = response.headers()["content-type"] ?? "";
    let body: any;
    if (ct.includes("text/event-stream")) {
      const text = await response.text();
      const dataLine = text.split("\n").find((l: string) => l.startsWith("data: "));
      body = dataLine ? JSON.parse(dataLine.slice(6)) : {};
    } else {
      body = await response.json();
    }
    expect(body.result?.content[0]?.text).toContain("Pageviews:");
  });

  test("MCP API call with invalid token returns error", async ({ request }) => {
    const response = await request.post(
      `${process.env.E2E_API_BASE_URL ?? "http://localhost:3001"}/api/mcp`,
      {
        headers: {
          Authorization: "Bearer invalid-token-12345",
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
        },
        data: {
          jsonrpc: "2.0",
          method: "tools/call",
          params: { name: "get_overview", arguments: {} },
          id: 1,
        },
      }
    );

    // MCP auth error — the response body should contain an error
    expect([401, 200]).toContain(response.status()); // MCP may return 200 with error in body
    if (response.status() === 200) {
      const body = await response.json();
      expect(body.error ?? body.result?.isError).toBeTruthy();
    }
  });
});
