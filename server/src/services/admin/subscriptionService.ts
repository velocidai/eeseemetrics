import { DateTime } from "luxon";
import { db } from "../../db/postgres/postgres.js";
import { DEFAULT_EVENT_LIMIT, getStripePrices } from "../../lib/const.js";
import { stripe } from "../../lib/stripe.js";

export interface SubscriptionData {
  id: string;
  planName: string;
  status: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  eventLimit?: number;
  interval?: string;
}

/**
 * Fetches subscription data for multiple Stripe customer IDs
 * @param stripeCustomerIds Set of Stripe customer IDs to fetch subscriptions for
 * @param includeFullDetails Whether to include full subscription details (periods, limits, etc.)
 * @returns Map of customer ID to subscription data
 */
async function fetchSubscriptionsForCustomers(
  stripeCustomerIds: Set<string>,
  includeFullDetails = false
): Promise<Map<string, SubscriptionData>> {
  const subscriptionMap = new Map<string, SubscriptionData>();

  if (!stripe || stripeCustomerIds.size === 0) {
    return subscriptionMap;
  }

  try {
    for (const status of ["active", "trialing"] as const) {
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const subscriptions = await stripe.subscriptions.list({
        status,
        limit: 100,
        expand: ["data.plan.product"],
        ...(startingAfter && { starting_after: startingAfter }),
      });

      for (const subscription of subscriptions.data) {
        const customerId = subscription.customer as string;

        if (stripeCustomerIds.has(customerId)) {
          const subscriptionItem = subscription.items.data[0];
          const priceId = subscriptionItem.price.id;

          if (priceId) {
            const planDetails = getStripePrices().find(plan => plan.priceId === priceId);

            const subscriptionData: SubscriptionData = {
              id: subscription.id,
              planName: planDetails?.name || "Unknown Plan",
              status: subscription.status,
            };

            if (includeFullDetails) {
              subscriptionData.currentPeriodStart = new Date(subscriptionItem.current_period_start * 1000);
              subscriptionData.currentPeriodEnd = new Date(subscriptionItem.current_period_end * 1000);
              subscriptionData.cancelAtPeriodEnd = subscription.cancel_at_period_end;
              subscriptionData.eventLimit = planDetails?.limits.events || 0;
              subscriptionData.interval = subscriptionItem.price.recurring?.interval ?? "unknown";
            }

            subscriptionMap.set(customerId, subscriptionData);
          }
        }
      }

      hasMore = subscriptions.has_more;
      if (hasMore && subscriptions.data.length > 0) {
        startingAfter = subscriptions.data[subscriptions.data.length - 1].id;
      }

      // Rate limiting: wait 50ms between requests (20 req/s)
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    } // end for (status)
  } catch (error) {
    console.error("Error fetching subscriptions from Stripe:", error);
  }

  return subscriptionMap;
}


/**
 * Creates a map of organization IDs to their subscription data
 * @param organizations Array of organization objects with id and stripeCustomerId
 * @param includeFullDetails Whether to include full subscription details
 * @returns Map of organization ID to subscription data with fallback to free plan
 */
export async function getOrganizationSubscriptions(
  organizations: Array<{ id: string; stripeCustomerId?: string | null }>,
  includeFullDetails = false
): Promise<
  Map<string, SubscriptionData & { planName: string; status: string; eventLimit: number; currentPeriodEnd: Date }>
> {
  const orgsWithStripe = organizations.filter(org => org.stripeCustomerId);
  const stripeCustomerIds = new Set(orgsWithStripe.map(org => org.stripeCustomerId!));

  const stripeSubscriptionMap = await fetchSubscriptionsForCustomers(stripeCustomerIds, includeFullDetails);

  // Create organization map with subscription data
  const orgSubscriptionMap = new Map<
    string,
    SubscriptionData & { planName: string; status: string; eventLimit: number; currentPeriodEnd: Date }
  >();

  const nextMonthStart = DateTime.now().startOf("month").plus({ months: 1 }).toJSDate();

  for (const org of organizations) {
    const stripeData = org.stripeCustomerId ? stripeSubscriptionMap.get(org.stripeCustomerId) : null;

    if (stripeData) {
      orgSubscriptionMap.set(org.id, {
        ...stripeData,
        planName: stripeData.planName || "free",
        status: stripeData.status || "free",
        eventLimit: stripeData.eventLimit ?? 0,
        currentPeriodEnd: stripeData.currentPeriodEnd ?? new Date(),
      });
    } else {
      // Free plan with all required fields
      orgSubscriptionMap.set(org.id, {
        id: "",
        planName: "free",
        status: "free",
        eventLimit: DEFAULT_EVENT_LIMIT,
        currentPeriodEnd: nextMonthStart,
      });
    }
  }

  return orgSubscriptionMap;
}
