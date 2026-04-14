export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL === "http://localhost:3001"
    ? "http://localhost:3001/api"
    : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
export const IS_CLOUD = process.env.NEXT_PUBLIC_CLOUD === "true";

// Time constants
export const MINUTES_IN_24_HOURS = 24 * 60; // 1440 minutes

export const DEMO_HOSTNAME = "demo.eeseemetrics.com";

export const STARTER_SITE_LIMIT = 1;
export const STARTER_TEAM_LIMIT = 1;
export const PRO_SITE_LIMIT = 5;
export const PRO_TEAM_LIMIT = 3;
// Scale: unlimited sites and members