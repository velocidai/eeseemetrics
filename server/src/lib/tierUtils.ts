import { eq } from "drizzle-orm";
import { db } from "../db/postgres/postgres.js";
import { organization, sites } from "../db/postgres/schema.js";
import { getBestSubscription } from "./subscriptionUtils.js";

export type PlanTier = "starter" | "pro" | "scale" | "none";

/**
 * Returns the top-level tier for any plan name string.
 * Custom plans are treated as "scale" (highest access).
 */
export function getPlanTier(planName: string): PlanTier {
  if (planName.startsWith("scale")) return "scale";
  if (planName.startsWith("pro")) return "pro";
  if (planName.startsWith("starter")) return "starter";
  if (planName === "custom") return "scale";
  return "none";
}

const TIER_RANK: Record<PlanTier, number> = { none: 0, starter: 1, pro: 2, scale: 3 };

/** Returns true if the given tier meets the minimum requirement. */
export function tierAtLeast(actual: PlanTier, required: PlanTier): boolean {
  return TIER_RANK[actual] >= TIER_RANK[required];
}

/**
 * Resolves the plan tier for an organisation directly by ID.
 * Returns "none" if the org cannot be found.
 */
export async function getOrgPlanTier(organizationId: string): Promise<PlanTier> {
  const orgRows = await db
    .select({ stripeCustomerId: organization.stripeCustomerId })
    .from(organization)
    .where(eq(organization.id, organizationId))
    .limit(1);

  if (!orgRows[0]) return "none";

  const sub = await getBestSubscription(organizationId, orgRows[0].stripeCustomerId ?? null);
  return getPlanTier(sub.planName);
}

/**
 * Resolves the plan tier for the organisation that owns a given site.
 * Returns "none" if the site or org cannot be found.
 */
export async function getSitePlanTier(siteId: number): Promise<PlanTier> {
  const siteRows = await db
    .select({ organizationId: sites.organizationId })
    .from(sites)
    .where(eq(sites.siteId, siteId))
    .limit(1);

  const orgId = siteRows[0]?.organizationId;
  if (!orgId) return "none";

  const orgRows = await db
    .select({ stripeCustomerId: organization.stripeCustomerId })
    .from(organization)
    .where(eq(organization.id, orgId))
    .limit(1);

  const sub = await getBestSubscription(orgId, orgRows[0]?.stripeCustomerId ?? null);
  return getPlanTier(sub.planName);
}
