import { FastifyReply, FastifyRequest } from "fastify";
import { stripe } from "../../lib/stripe.js";
import { db } from "../../db/postgres/postgres.js";
import { organization } from "../../db/postgres/schema.js";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import dotenv from "dotenv";
import { usageService } from "../../services/usageService.js";

dotenv.config();

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function handleWebhook(request: FastifyRequest, reply: FastifyReply) {
  if (!webhookSecret) {
    console.error("Stripe webhook secret is not configured.");
    return reply.status(500).send({ error: "Webhook secret not configured." });
  }

  const sig = request.headers["stripe-signature"];
  let event: Stripe.Event;

  try {
    // Use rawBody instead of request.body for signature verification
    const rawBody = (request.raw as any).body;
    if (!rawBody) {
      return reply.status(400).send("Webhook error: No raw body available");
    }

    event = (stripe as Stripe).webhooks.constructEvent(rawBody, sig as string, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return reply.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Subscription checkout — link Stripe customer ID to org
      if (session.mode === "subscription" && session.customer) {
        const stripeCustomerId = session.customer as string;
        const organizationId = session.metadata?.organizationId;

        if (stripeCustomerId && organizationId) {
          try {
            const existingOrg = await db
              .select({ id: organization.id })
              .from(organization)
              .where(eq(organization.stripeCustomerId, stripeCustomerId))
              .limit(1);

            if (existingOrg.length === 0) {
              await db
                .update(organization)
                .set({ stripeCustomerId: stripeCustomerId })
                .where(eq(organization.id, organizationId));
            }
          } catch (dbError: any) {
            console.error(`Database error updating organization with Stripe customer ID: ${dbError.message}`);
          }
        } else {
          console.error(
            `Missing required metadata in checkout session ${session.id}. Customer ID: ${stripeCustomerId}, Organization ID: ${organizationId}`
          );
        }
      }

      // LTD one-time payment — tag org with lifetime deal fields
      if (session.mode === "payment" && session.metadata?.ltd_tier) {
        const organizationId = session.metadata.organizationId;
        const ltdTier = parseInt(session.metadata.ltd_tier, 10) as 1 | 2 | 3;
        const ltdPageviewLimitMap: Record<number, number> = {
          1: 100_000,
          2: 250_000,
          3: 500_000,
        };
        const ltdPageviewLimit = ltdPageviewLimitMap[ltdTier];

        if (!organizationId || !ltdPageviewLimit) {
          console.error(`[stripe] LTD checkout missing metadata: session=${session.id}`);
          break;
        }

        try {
          await db
            .update(organization)
            .set({
              ltdActive: true,
              ltdTier,
              ltdPageviewLimit,
              ltdPurchaseDate: new Date().toISOString(),
              ltdStripePaymentId: session.id,
            })
            .where(eq(organization.id, organizationId));

          console.log(`[stripe] LTD tier ${ltdTier} activated for org=${organizationId} (${ltdPageviewLimit.toLocaleString()} pv/mo)`);

          // Immediately refresh usage so the new plan takes effect
          usageService.updateOrganizationsMonthlyUsage().catch(err =>
            console.error("[stripe] Failed to refresh usage after LTD purchase:", err)
          );
        } catch (dbError: any) {
          console.error(`[stripe] Database error activating LTD for org ${organizationId}: ${dbError.message}`);
        }
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log(`[stripe] invoice.payment_succeeded — customer=${invoice.customer} amount=${invoice.amount_paid}`);
      // Refresh usage immediately so a previously past_due org gets unblocked
      usageService.updateOrganizationsMonthlyUsage().catch(err =>
        console.error("[stripe] Failed to refresh usage after payment_succeeded:", err)
      );
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.error(`[stripe] invoice.payment_failed — customer=${invoice.customer} attempt=${invoice.attempt_count}`);
      // Refresh usage so overMonthlyLimit state reflects the new subscription status
      usageService.updateOrganizationsMonthlyUsage().catch(err =>
        console.error("[stripe] Failed to refresh usage after payment_failed:", err)
      );
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      console.log(`[stripe] customer.subscription.deleted — subscription=${sub.id} customer=${sub.customer}`);
      // Immediately refresh usage so the org loses access now, not in up to 30 min
      usageService.updateOrganizationsMonthlyUsage().catch(err =>
        console.error("[stripe] Failed to refresh usage after subscription.deleted:", err)
      );
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      console.log(`[stripe] customer.subscription.updated — subscription=${sub.id} status=${sub.status}`);
      // Refresh so plan upgrades/downgrades take effect immediately
      usageService.updateOrganizationsMonthlyUsage().catch(err =>
        console.error("[stripe] Failed to refresh usage after subscription.updated:", err)
      );
      break;
    }

    default:
      break;
  }

  // Return a 200 response to acknowledge receipt of the event
  reply.send({ received: true });
}
