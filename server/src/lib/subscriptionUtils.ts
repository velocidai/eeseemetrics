import { eq } from "drizzle-orm";
import { DateTime } from "luxon";
import Stripe from "stripe";
import { db } from "../db/postgres/postgres.js";
import { organization } from "../db/postgres/schema.js";
import { DEFAULT_EVENT_LIMIT, getStripePrices, StripePlan } from "./const.js";
import { stripe } from "./stripe.js";
import { logger } from "./logger/logger.js";

export interface StripeSubscriptionInfo {
  source: "stripe";
  subscriptionId: string;
  priceId: string;
  planName: string;
  eventLimit: number;
  periodStart: string;
  currentPeriodEnd: Date;
  status: string;
  interval: string;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  trialEnd?: Date;
}

export interface FreeSubscriptionInfo {
  source: "free";
  eventLimit: number;
  periodStart: string;
  planName: "free";
  status: "free";
}

export interface OverrideSubscriptionInfo {
  source: "override";
  planName: string;
  eventLimit: number;
  replayLimit: number;
  periodStart: string;
  status: "active";
  interval: "month" | "year" | "lifetime";
  cancelAtPeriodEnd: false;
}

export interface CustomPlanSubscriptionInfo {
  source: "custom";
  planName: "custom";
  eventLimit: number;
  memberLimit: number | null; // null = unlimited
  siteLimit: number | null; // null = unlimited
  periodStart: string;
  status: "active";
  interval: "lifetime";
  cancelAtPeriodEnd: false;
}

export interface LtdSubscriptionInfo {
  source: "ltd";
  planName: "starter_ltd";
  tier: 1 | 2 | 3;
  eventLimit: number;
  periodStart: string;
  status: "active";
  interval: "lifetime";
  cancelAtPeriodEnd: false;
}

export type SubscriptionInfo =
  | StripeSubscriptionInfo
  | FreeSubscriptionInfo
  | OverrideSubscriptionInfo
  | CustomPlanSubscriptionInfo
  | LtdSubscriptionInfo;

/**
 * Gets the first day of the current month in YYYY-MM-DD format
 */
function getStartOfMonth(): string {
  return DateTime.now().startOf("month").toISODate() as string;
}

/**
 * Gets plan override subscription info for an organization
 * @returns Override subscription info or null if no override set
 */
export async function getOverrideSubscription(organizationId: string): Promise<OverrideSubscriptionInfo | null> {
  try {
    const orgResult = await db
      .select({ planOverride: organization.planOverride })
      .from(organization)
      .where(eq(organization.id, organizationId))
      .limit(1);

    const org = orgResult[0];
    if (!org?.planOverride) {
      return null;
    }

    // Look up plan details from the plan name (Stripe plans)
    const planDetails = getStripePrices().find((plan: StripePlan) => plan.name === org.planOverride);

    if (!planDetails) {
      console.error("Plan override not found in price list:", org.planOverride);
      return null;
    }

    return {
      source: "override",
      planName: planDetails.name,
      eventLimit: planDetails.limits.events,
      replayLimit: planDetails.limits.replays,
      periodStart: getStartOfMonth(),
      status: "active",
      interval: planDetails.interval,
      cancelAtPeriodEnd: false,
    };
  } catch (error) {
    console.error("Error checking plan override:", error);
    return null;
  }
}

/**
 * Gets Stripe subscription info for an organization
 * @returns Stripe subscription info or null if no active subscription found
 */
export async function getStripeSubscription(stripeCustomerId: string | null): Promise<StripeSubscriptionInfo | null> {
  if (!stripeCustomerId) {
    return null;
  }

  try {
    const subscriptions = await (stripe as Stripe).subscriptions.list({
      customer: stripeCustomerId,
      status: "active",
      limit: 1,
      expand: ["data.plan.product"],
    });

    let subscription: Stripe.Subscription;
    let isTrial = false;

    if (subscriptions.data.length === 0) {
      // Check for trialing subscriptions
      const trialSubs = await (stripe as Stripe).subscriptions.list({
        customer: stripeCustomerId,
        status: "trialing",
        limit: 1,
        expand: ["data.plan.product"],
      });
      if (trialSubs.data.length > 0) {
        subscription = trialSubs.data[0];
        isTrial = true;
      } else {
        // Check for past_due subscriptions — payment failed but Stripe is still retrying.
        // Treat as active so paying customers aren't immediately locked out during payment retries.
        const pastDueSubs = await (stripe as Stripe).subscriptions.list({
          customer: stripeCustomerId,
          status: "past_due",
          limit: 1,
          expand: ["data.plan.product"],
        });
        if (pastDueSubs.data.length === 0) {
          return null;
        }
        subscription = pastDueSubs.data[0];
      }
    } else {
      subscription = subscriptions.data[0];
    }

    const subscriptionItem = subscription.items.data[0];
    const priceId = subscriptionItem.price.id;

    if (!priceId) {
      console.error("Subscription item price ID not found");
      return null;
    }

    // Find corresponding plan details from constants
    const planDetails = getStripePrices().find((plan: StripePlan) => plan.priceId === priceId);

    if (!planDetails) {
      console.error("Plan details not found for price ID:", priceId);
      // Return basic info even without plan details
      return {
        source: "stripe",
        subscriptionId: subscription.id,
        priceId,
        planName: "Unknown Plan",
        eventLimit: 0,
        periodStart: getStartOfMonth(),
        currentPeriodEnd: new Date(subscriptionItem.current_period_end * 1000),
        status: subscription.status,
        interval: subscriptionItem.price.recurring?.interval ?? "unknown",
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        createdAt: new Date(subscription.created * 1000),
        ...(isTrial && subscription.trial_end ? { trialEnd: new Date(subscription.trial_end * 1000) } : {}),
      };
    }

    // Determine period start
    const currentMonthStart = DateTime.now().startOf("month");
    const subscriptionStartDate = DateTime.fromSeconds(subscriptionItem.current_period_start);

    // If subscription started within current month, use that date; otherwise use month start
    const periodStart =
      subscriptionStartDate >= currentMonthStart ? (subscriptionStartDate.toISODate() as string) : getStartOfMonth();

    return {
      source: "stripe",
      subscriptionId: subscription.id,
      priceId,
      planName: planDetails.name,
      eventLimit: planDetails.limits.events,
      periodStart,
      currentPeriodEnd: new Date(subscriptionItem.current_period_end * 1000),
      status: subscription.status,
      interval: subscriptionItem.price.recurring?.interval ?? "unknown",
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      createdAt: new Date(subscription.created * 1000),
      ...(isTrial && subscription.trial_end ? { trialEnd: new Date(subscription.trial_end * 1000) } : {}),
    };
  } catch (error) {
    console.error("Error fetching Stripe subscription:", error);
    return null;
  }
}

/**
 * Gets custom plan subscription info for an organization
 * @returns Custom plan subscription info or null if no custom plan set
 */
export async function getCustomPlanSubscription(organizationId: string): Promise<CustomPlanSubscriptionInfo | null> {
  try {
    const orgResult = await db
      .select({ customPlan: organization.customPlan })
      .from(organization)
      .where(eq(organization.id, organizationId))
      .limit(1);

    const org = orgResult[0];
    if (!org?.customPlan) {
      return null;
    }

    const cp = org.customPlan;

    return {
      source: "custom",
      planName: "custom",
      eventLimit: cp.events,
      memberLimit: cp.members ?? null,
      siteLimit: cp.websites ?? null,
      periodStart: getStartOfMonth(),
      status: "active",
      interval: "lifetime",
      cancelAtPeriodEnd: false,
    };
  } catch (error) {
    console.error("Error checking custom plan:", error);
    return null;
  }
}

/**
 * Gets LTD subscription info for an organization
 * @returns LTD subscription info or null if no LTD purchased
 */
export async function getLtdSubscription(organizationId: string): Promise<LtdSubscriptionInfo | null> {
  try {
    const orgResult = await db
      .select({
        ltdActive: organization.ltdActive,
        ltdTier: organization.ltdTier,
        ltdPageviewLimit: organization.ltdPageviewLimit,
      })
      .from(organization)
      .where(eq(organization.id, organizationId))
      .limit(1);

    const org = orgResult[0];
    if (!org?.ltdActive || !org.ltdTier || !org.ltdPageviewLimit) {
      return null;
    }

    return {
      source: "ltd",
      planName: "starter_ltd",
      tier: org.ltdTier as 1 | 2 | 3,
      eventLimit: org.ltdPageviewLimit,
      periodStart: getStartOfMonth(),
      status: "active",
      interval: "lifetime",
      cancelAtPeriodEnd: false,
    };
  } catch (error) {
    console.error("Error checking LTD subscription:", error);
    return null;
  }
}

/**
 * Gets the best subscription for an organization
 * Priority: CustomPlan > Override > Stripe > LTD > Free
 * @returns The active subscription, or free tier if none found
 */
export async function getBestSubscription(
  organizationId: string,
  stripeCustomerId: string | null
): Promise<SubscriptionInfo> {
  const customSub = await getCustomPlanSubscription(organizationId);
  if (customSub) return customSub;

  const overrideSub = await getOverrideSubscription(organizationId);
  if (overrideSub) return overrideSub;

  const stripeSub = await getStripeSubscription(stripeCustomerId);
  if (stripeSub) return stripeSub;

  // LTD acts as a permanent safety net: if no active Stripe sub, fall back to LTD
  const ltdSub = await getLtdSubscription(organizationId);
  if (ltdSub) return ltdSub;

  return {
    source: "free",
    eventLimit: DEFAULT_EVENT_LIMIT,
    periodStart: getStartOfMonth(),
    planName: "free",
    status: "free",
  };
}
