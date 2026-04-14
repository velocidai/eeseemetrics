// Single source of truth for pricing displayed on the docs/marketing site.
// Keep in sync with client/src/lib/stripe.ts when prices change.

export interface PriceTier {
  events: number;
  starter: number | null; // null = not available at this tier
  pro: number;
  scale: number;
}

// Monthly prices per event tier
export const PRICE_TIERS: PriceTier[] = [
  { events: 100_000,    starter: 14,  pro: 19,  scale: 39  },
  { events: 250_000,    starter: 24,  pro: 29,  scale: 59  },
  { events: 500_000,    starter: null, pro: 49, scale: 99  },
  { events: 1_000_000,  starter: null, pro: 69, scale: 139 },
  { events: 2_000_000,  starter: null, pro: 99, scale: 199 },
  { events: 5_000_000,  starter: null, pro: 149, scale: 299 },
  { events: 10_000_000, starter: null, pro: 249, scale: 499 },
];

// Annual multiplier: 8× monthly (saves ~33% vs paying monthly)
export const ANNUAL_MULTIPLIER = 8;

export type PlanType = "starter" | "pro" | "scale";

export function getMonthlyPrice(events: number, plan: PlanType): number | null {
  const tier = PRICE_TIERS.find(t => t.events === events);
  if (!tier) return null;
  return tier[plan];
}

export function getPrice(
  events: number | string,
  plan: PlanType,
  isAnnual: boolean
): { monthly: number; display: number; custom: false } | { custom: true } {
  if (typeof events === "string") return { custom: true };
  const monthly = getMonthlyPrice(events, plan);
  if (monthly === null) return { custom: true };
  const annual = monthly * ANNUAL_MULTIPLIER;
  return {
    monthly,
    display: isAnnual ? Math.round(annual / 12) : monthly,
    custom: false,
  };
}

// Starter is only available up to 250K events
export const STARTER_MAX_EVENTS = 250_000;

export const EVENT_TIERS = PRICE_TIERS.map(t => t.events);
// Add "Custom" sentinel at the end
export const EVENT_TIERS_WITH_CUSTOM = [...EVENT_TIERS, "Custom"] as (number | "Custom")[];
