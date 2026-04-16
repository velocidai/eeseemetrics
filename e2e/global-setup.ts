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

const SESSION_MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6 hours

function isCacheValid(filename: string): boolean {
  try {
    const data = JSON.parse(fs.readFileSync(filename, "utf-8"));
    return typeof data.timestamp === "number" && Date.now() - data.timestamp < SESSION_MAX_AGE_MS;
  } catch {
    return false;
  }
}

async function saveSession(
  ctx: Awaited<ReturnType<typeof request.newContext>>,
  API: string,
  BASE: string,
  email: string,
  password: string,
  filename: string
) {
  const authDir = path.join(__dirname, ".auth");
  const filepath = path.join(authDir, filename);

  // Reuse cached session if still valid — conserves rate-limit budget
  if (isCacheValid(filepath)) {
    console.log(`[global-setup] Reusing cached session for ${email}.`);
    return;
  }

  const resp = await ctx.post(`${API}/api/auth/sign-in/email`, {
    data: { email, password },
    headers: { "Content-Type": "application/json", Origin: BASE },
  });

  if (resp.status() === 429) {
    console.warn(`[global-setup] Sign-in rate-limited for ${email} — tests will use stale cookie if available.`);
    return;
  }

  const setCookie = resp.headers()["set-cookie"] ?? "";
  const match = setCookie.match(/((?:__Secure-)?better-auth\.session_token)=([^;,\s]+)/);
  if (!match) {
    console.warn(`[global-setup] Sign-in for ${email} returned ${resp.status()} but no session cookie.`);
    return;
  }

  const name = match[1];
  const rawValue = match[2]; // URL-encoded, safe for addCookies()
  const value = decodeURIComponent(rawValue); // decoded, used for API Cookie headers
  const sessionCookie = `${name}=${value}`;

  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });
  fs.writeFileSync(
    filepath,
    JSON.stringify({ name, value, rawValue, sessionCookie, timestamp: Date.now() }, null, 2)
  );

  console.log(`[global-setup] Signed in as ${email}, cookie saved (${name}).`);
}

export default async function globalSetup() {
  const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
  const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";
  const EMAIL = process.env.E2E_PRO_USER_EMAIL ?? "";
  const PASSWORD = process.env.E2E_PRO_USER_PASSWORD ?? "";
  const LTD_EMAIL = process.env.E2E_LTD_USER_EMAIL ?? "";
  const LTD_PASSWORD = process.env.E2E_LTD_USER_PASSWORD ?? "";

  if (!EMAIL || !PASSWORD) {
    console.log("[global-setup] No credentials — skipping auth setup");
    return;
  }

  const ctx = await request.newContext();
  try {
    await saveSession(ctx, API, BASE, EMAIL, PASSWORD, "session.json");
    if (LTD_EMAIL && LTD_PASSWORD) {
      await saveSession(ctx, API, BASE, LTD_EMAIL, LTD_PASSWORD, "session-ltd.json");
    }
  } finally {
    await ctx.dispose();
  }
}
