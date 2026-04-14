// Common utility functions and constants for subscription components

import { STARTER_SITE_LIMIT, STARTER_TEAM_LIMIT, PRO_SITE_LIMIT, PRO_TEAM_LIMIT } from "../../../lib/const";
import { getStripePrices, STRIPE_TIERS } from "../../../lib/stripe";
import { FeatureItem } from "@/components/pricing/PricingCard";

export const EVENT_TIERS = [...STRIPE_TIERS.map(tier => tier.events), "Custom"];

// Starter: capped at 250K — dims and disables above this
export const STARTER_MAX_EVENTS = 250_000;
export const isStarterAvailable = (eventLimit: number | string): boolean =>
  typeof eventLimit === "number" && eventLimit <= STARTER_MAX_EVENTS;

export const STARTER_FEATURES: FeatureItem[] = [
  { feature: `${STARTER_SITE_LIMIT} website`, included: true },
  { feature: `${STARTER_TEAM_LIMIT} team member`, included: true },
  { feature: "Core web analytics", included: true },
  { feature: "Goals & custom events", included: true },
  { feature: "Uptime monitoring (5 monitors)", included: true },
  { feature: "2 year data retention", included: true },
  { feature: "Up to 250K pageviews/mo", included: true },
  { feature: "Session replays", included: false },
  { feature: "AI reports & anomaly alerts", included: false },
  { feature: "MCP / API access", included: false },
];

export const PRO_FEATURES: FeatureItem[] = [
  { feature: `Up to ${PRO_SITE_LIMIT} websites`, included: true },
  { feature: `Up to ${PRO_TEAM_LIMIT} team members`, included: true },
  { feature: "Everything in Starter", included: true },
  { feature: "Sessions, funnels & journeys", included: true },
  { feature: "Retention analysis", included: true },
  { feature: "User profiles", included: true },
  { feature: "Web vitals & error tracking", included: true },
  { feature: "Google Search Console", included: true },
  { feature: "Session replays", included: true },
  { feature: "AI reports (weekly)", included: true },
  { feature: "Anomaly alerts", included: true },
  { feature: "Uptime monitoring (10 monitors)", included: true },
  { feature: "Full MCP toolset (21 tools)", included: true },
  { feature: "Data export (CSV/JSON)", included: true },
  { feature: "3 year data retention", included: true },
];

export const SCALE_FEATURES: FeatureItem[] = [
  { feature: "Unlimited websites", included: true },
  { feature: "Unlimited team members", included: true },
  { feature: "Everything in Pro", included: true },
  { feature: "AI reports (all cadences)", included: true },
  { feature: "Higher MCP rate limits (200 req/min)", included: true },
  { feature: "Uptime monitoring (50 monitors)", included: true },
  { feature: "Email report delivery", included: true },
  { feature: "Public dashboard branding removal", included: true },
  { feature: "5 year data retention", included: true },
  { feature: "Priority support", included: true },
];

const stripePrices = getStripePrices();

// Find the appropriate price for a tier at current event limit
export function findPriceForTier(
  eventLimit: number | string,
  interval: "month" | "year",
  planType: "starter" | "pro" | "scale" = "pro"
) {
  if (eventLimit === "Custom") {
    return null;
  }

  const eventLimitValue = Number(eventLimit);
  const isAnnual = interval === "year";

  const plans = stripePrices.filter(
    plan =>
      (isAnnual
        ? plan.name.startsWith(planType) && plan.name.includes("-annual")
        : plan.name.startsWith(planType) && !plan.name.includes("-annual")) &&
      plan.interval === interval
  );

  const matchingPlan = plans.find(plan => plan.events >= eventLimitValue);
  return matchingPlan || plans[plans.length - 1] || null;
}

// Format event tier for display
export function formatEventTier(tier: number | string): string {
  if (typeof tier === "string") {
    return tier;
  }
  return tier >= 1_000_000 ? `${tier / 1_000_000}M` : `${tier / 1_000}k`;
}
