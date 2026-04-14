export type PlanTier = "starter" | "pro" | "scale" | "none";

/**
 * Maps any plan name string to a tier bucket.
 * Kept in sync with server/src/lib/tierUtils.ts.
 */
export function getPlanTier(planName: string | null | undefined): PlanTier {
  if (!planName) return "none";
  if (planName.startsWith("scale")) return "scale";
  if (planName.startsWith("pro")) return "pro";
  if (planName.startsWith("starter")) return "starter";
  if (planName === "custom") return "scale";
  return "none";
}

const TIER_RANK: Record<PlanTier, number> = { none: 0, starter: 1, pro: 2, scale: 3 };

/** Returns true if the actual tier meets or exceeds the required minimum. */
export function tierAtLeast(actual: PlanTier, required: PlanTier): boolean {
  return TIER_RANK[actual] >= TIER_RANK[required];
}
