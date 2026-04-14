import { eq } from "drizzle-orm";
import { db } from "../../db/postgres/postgres.js";
import { sites, organization } from "../../db/postgres/schema.js";
import { auth } from "../../lib/auth.js";
import { getBestSubscription } from "../../lib/subscriptionUtils.js";
import { getPlanTier, tierAtLeast, type PlanTier } from "../../lib/tierUtils.js";

export interface McpTokenContext {
  userId: string;
  siteId: number;
  siteDomain: string;
  tier: PlanTier;
}

/**
 * Validates a bearer token and returns the resolved context (user, site, tier).
 * Returns null if the token is invalid, revoked, or not scoped to a site.
 */
export async function resolveMcpToken(token: string): Promise<McpTokenContext | null> {
  let result: Awaited<ReturnType<typeof auth.api.verifyApiKey>>;
  try {
    result = await auth.api.verifyApiKey({ body: { key: token } });
  } catch {
    return null;
  }

  if (!result.valid || !result.key) return null;

  const metadata = result.key.metadata as { siteId?: number; type?: string } | null;
  if (!metadata?.siteId || metadata.type !== "mcp") return null;

  const siteId = Number(metadata.siteId);

  const siteRows = await db
    .select({ domain: sites.domain, organizationId: sites.organizationId })
    .from(sites)
    .where(eq(sites.siteId, siteId))
    .limit(1);

  if (!siteRows[0]) return null;

  const { domain, organizationId } = siteRows[0];
  if (!organizationId) return null;

  const orgRows = await db
    .select({ stripeCustomerId: organization.stripeCustomerId })
    .from(organization)
    .where(eq(organization.id, organizationId))
    .limit(1);

  const sub = await getBestSubscription(organizationId, orgRows[0]?.stripeCustomerId ?? null);
  const tier = getPlanTier(sub.planName);

  if (!tierAtLeast(tier, "pro")) return null;

  return { userId: result.key.userId, siteId, siteDomain: domain, tier };
}

/**
 * Simple in-memory rate limiter — keyed by token userId.
 * Pro: 60 requests/minute. Scale: 200 requests/minute.
 */
const rateLimitWindows = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(userId: string, tier: PlanTier): boolean {
  const limit = tier === "scale" ? 200 : 60;
  const now = Date.now();
  const window = rateLimitWindows.get(userId);

  if (!window || now > window.resetAt) {
    rateLimitWindows.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (window.count >= limit) return false;

  window.count++;
  return true;
}
