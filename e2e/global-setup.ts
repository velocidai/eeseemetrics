/**
 * global-setup.ts
 *
 * Runs once before the entire test suite.
 * Signs in once and writes the session cookie to .auth/session.json
 * so every spec file can read it without calling the sign-in endpoint.
 *
 * Rate limit context: the sign-in endpoint allows 10 attempts per 15 minutes
 * per IP. Running 10+ spec files each with their own beforeAll sign-in would
 * exhaust this limit. Global setup solves it.
 */

import { request } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import path from "path";
import fs from "fs";

// Load e2e/.env (same file playwright.config.ts loads)
loadEnv({ path: path.join(__dirname, ".env") });

export default async function globalSetup() {
  const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
  const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
  const EMAIL = process.env.E2E_PRO_USER_EMAIL ?? "";
  const PASSWORD = process.env.E2E_PRO_USER_PASSWORD ?? "";

  if (!EMAIL || !PASSWORD) {
    console.log("[global-setup] No credentials — skipping auth setup");
    return;
  }

  const ctx = await request.newContext();
  try {
    const resp = await ctx.post(`${API}/api/auth/sign-in/email`, {
      data: { email: EMAIL, password: PASSWORD },
      headers: { "Content-Type": "application/json", Origin: BASE },
    });

    if (resp.status() === 429) {
      console.warn(
        "[global-setup] Sign-in rate-limited (429). Tests that need auth will skip or use stale cookie."
      );
      return;
    }

    const setCookie = resp.headers()["set-cookie"] ?? "";
    const match = setCookie.match(/((?:__Secure-)?better-auth\.session_token)=([^;,\s]+)/);
    if (!match) {
      console.warn(`[global-setup] Sign-in returned ${resp.status()} but no session cookie found.`);
      return;
    }

    const name = match[1];
    const value = decodeURIComponent(match[2]);
    const sessionCookie = `${name}=${value}`;

    const authDir = path.join(__dirname, ".auth");
    if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });
    fs.writeFileSync(
      path.join(authDir, "session.json"),
      JSON.stringify({ name, value, sessionCookie, timestamp: Date.now() }, null, 2)
    );

    console.log(`[global-setup] Signed in as ${EMAIL}, cookie saved (${name}).`);
  } finally {
    await ctx.dispose();
  }
}
