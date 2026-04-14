/**
 * auth-helpers.ts
 *
 * Shared authentication utilities for e2e tests.
 * Reads the session cookie written by global-setup.ts so tests
 * never call the sign-in endpoint themselves (avoiding rate limits).
 */

import { request as apiRequest } from "@playwright/test";
import type { Page } from "@playwright/test";
import path from "path";
import fs from "fs";

const API = process.env.E2E_API_BASE_URL ?? "http://localhost:3001";
const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3002";

// Written by global-setup.ts
const AUTH_FILE = path.join(__dirname, ".auth", "session.json");

interface AuthState {
  name: string;
  value: string;
  sessionCookie: string; // "name=value"
  timestamp: number;
}

/** Read the cookie that global-setup.ts wrote. Falls back to a fresh sign-in if absent. */
export async function getSessionCookie(
  email = process.env.E2E_PRO_USER_EMAIL ?? "",
  password = process.env.E2E_PRO_USER_PASSWORD ?? ""
): Promise<string> {
  try {
    const state: AuthState = JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));
    if (state.sessionCookie) return state.sessionCookie;
  } catch {
    // file missing or corrupt — fall through to live sign-in
  }

  // Live sign-in fallback (will be rate-limited if called too often)
  return signIn(email, password);
}

/** Sign in via API and return the session cookie string. */
export async function signIn(
  email = process.env.E2E_PRO_USER_EMAIL ?? "",
  password = process.env.E2E_PRO_USER_PASSWORD ?? ""
): Promise<string> {
  const ctx = await apiRequest.newContext();
  const resp = await ctx.post(`${API}/api/auth/sign-in/email`, {
    data: { email, password },
    headers: { "Content-Type": "application/json", Origin: BASE },
  });
  const setCookie = resp.headers()["set-cookie"] ?? "";
  const match = setCookie.match(/((?:__Secure-)?better-auth\.session_token)=([^;,\s]+)/);
  const cookie = match ? `${match[1]}=${decodeURIComponent(match[2])}` : "";
  await ctx.dispose();
  return cookie;
}

/**
 * Inject the session cookie into the page context and navigate to the app root.
 * For the default pro user, reads from the global-setup cache to avoid rate limits.
 * For any other credentials, performs a live sign-in.
 */
export async function login(
  page: Page,
  email = process.env.E2E_PRO_USER_EMAIL ?? "",
  password = process.env.E2E_PRO_USER_PASSWORD ?? ""
): Promise<void> {
  const isDefaultUser = email === (process.env.E2E_PRO_USER_EMAIL ?? "");

  let name = "";
  let value = "";

  if (isDefaultUser) {
    // Try to load pre-saved auth state for the default user
    try {
      const state: AuthState = JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));
      if (state.name && state.value) {
        name = state.name;
        value = state.value;
      }
    } catch {
      // No cached state — fall through to live sign-in
    }
  }

  if (!name || !value) {
    // Live sign-in for non-default users or when cache is missing
    const resp = await page.request.post(`${API}/api/auth/sign-in/email`, {
      data: { email, password },
      headers: { "Content-Type": "application/json", Origin: BASE },
    });
    const setCookie = resp.headers()["set-cookie"] ?? "";
    const match = setCookie.match(/((?:__Secure-)?better-auth\.session_token)=([^;]+)/);
    if (match) {
      name = match[1];
      value = decodeURIComponent(match[2]);
    }
  }

  if (name && value) {
    await page.context().addCookies([
      {
        name,
        value,
        domain: new URL(BASE).hostname,
        path: "/",
        httpOnly: true,
        secure: BASE.startsWith("https"),
        sameSite: "Lax",
      },
    ]);
  }

  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
}
