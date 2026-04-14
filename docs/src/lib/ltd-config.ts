// LTD campaign configuration.
// Control everything via Vercel environment variables — no code changes needed.
//
// NEXT_PUBLIC_LTD_ACTIVE        "true" to enable the banner + pricing callout (default: false)
// NEXT_PUBLIC_LTD_END_DATE      ISO date string for the deal deadline (default: 2026-05-14)
// NEXT_PUBLIC_APP_BASE_URL      App URL (default: https://app.eeseemetrics.com)
// API_BASE_URL                  Backend API URL for live slot counts (server-side only, optional)
//
// Slot counts are fetched live from the backend API (/api/ltd/slots).
// Set NEXT_PUBLIC_API_BASE_URL to enable live counts; falls back to these defaults:
// NEXT_PUBLIC_LTD_SLOTS_TIER1   Fallback slot count for $49 tier (default: 150)
// NEXT_PUBLIC_LTD_SLOTS_TIER2   Fallback slot count for $79 tier (default: 100)
// NEXT_PUBLIC_LTD_SLOTS_TIER3   Fallback slot count for $129 tier (default: 50)
//
// To end the campaign: set NEXT_PUBLIC_LTD_ACTIVE=false → redeploy.

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_BASE_URL ?? "https://app.eeseemetrics.com";

export const LTD_CONFIG = {
  active: process.env.NEXT_PUBLIC_LTD_ACTIVE === "true",
  endDate: process.env.NEXT_PUBLIC_LTD_END_DATE ?? "2026-05-14T23:59:59Z",
  appBaseUrl: APP_BASE_URL,
  apiBaseUrl: process.env.API_BASE_URL ?? null,
  // Fallback slot counts — overridden by live API fetch when available
  slots: {
    tier1: parseInt(process.env.NEXT_PUBLIC_LTD_SLOTS_TIER1 ?? "150", 10),
    tier2: parseInt(process.env.NEXT_PUBLIC_LTD_SLOTS_TIER2 ?? "100", 10),
    tier3: parseInt(process.env.NEXT_PUBLIC_LTD_SLOTS_TIER3 ?? "50", 10),
  },
  // Buy links: route through the app so checkout is always auth-aware
  checkout: {
    tier1: `${APP_BASE_URL}/ltd?tier=1`,
    tier2: `${APP_BASE_URL}/ltd?tier=2`,
    tier3: `${APP_BASE_URL}/ltd?tier=3`,
  },
} as const;
