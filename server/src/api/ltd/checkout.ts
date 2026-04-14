import { FastifyReply, FastifyRequest } from "fastify";
import { and, eq } from "drizzle-orm";
import Stripe from "stripe";
import { db } from "../../db/postgres/postgres.js";
import { member, organization } from "../../db/postgres/schema.js";
import { stripe } from "../../lib/stripe.js";

// Test mode price IDs (created via Stripe MCP)
const LTD_PRICE_IDS_TEST: Record<number, string> = {
  1: "price_1TMER5GIfYWdR0iZFAz29yy7", // $49 — 100K pv/mo
  2: "price_1TMER7GIfYWdR0iZVdZJUeHo", // $79 — 250K pv/mo
  3: "price_1TMERAGIfYWdR0iZ1c5VCN7r", // $129 — 500K pv/mo
};

// Live mode price IDs (created via setup-ltd-stripe.js)
const LTD_PRICE_IDS_LIVE: Record<number, string> = {
  1: "price_1TMF3hGIfYWdR0iZbWlLRhSV", // $49 — 100K pv/mo
  2: "price_1TMF3iGIfYWdR0iZfONjkLvA", // $79 — 250K pv/mo
  3: "price_1TMF3iGIfYWdR0iZIkgq95Uo", // $129 — 500K pv/mo
};

const LTD_PRICE_IDS = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live")
  ? LTD_PRICE_IDS_LIVE
  : LTD_PRICE_IDS_TEST;

const LTD_PAGEVIEW_LIMITS: Record<number, number> = {
  1: 100_000,
  2: 250_000,
  3: 500_000,
};

interface LtdCheckoutBody {
  tier: number;
  organizationId: string;
}

export async function createLtdCheckoutSession(
  request: FastifyRequest<{ Body: LtdCheckoutBody }>,
  reply: FastifyReply
) {
  const userId = request.user?.id;
  if (!userId) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  const { tier, organizationId } = request.body;
  const parsedTier = parseInt(String(tier), 10);

  if (![1, 2, 3].includes(parsedTier) || !organizationId) {
    return reply.status(400).send({ error: "Missing or invalid tier / organizationId." });
  }

  const priceId = LTD_PRICE_IDS[parsedTier];
  const eventLimit = LTD_PAGEVIEW_LIMITS[parsedTier];

  // Verify user is owner of the org (same guard as createCheckoutSession)
  const memberResult = await db
    .select({ role: member.role })
    .from(member)
    .where(and(eq(member.userId, userId), eq(member.organizationId, organizationId)))
    .limit(1);

  if (!memberResult.length || memberResult[0].role !== "owner") {
    return reply.status(403).send({ error: "Only organization owners can purchase an LTD." });
  }

  // Check org doesn't already have an LTD
  const orgResult = await db
    .select({ ltdActive: organization.ltdActive, email: organization.stripeCustomerId })
    .from(organization)
    .where(eq(organization.id, organizationId))
    .limit(1);

  if (orgResult[0]?.ltdActive) {
    return reply.status(409).send({ error: "This organization already has an active lifetime deal." });
  }

  const appBaseUrl = "https://app.eeseemetrics.com";

  try {
    const checkoutSession = await (stripe as Stripe).checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appBaseUrl}/settings/organization/subscription?ltd=success&tier=${parsedTier}`,
      cancel_url: `${appBaseUrl}/ltd?tier=${parsedTier}`,
      metadata: {
        organizationId,
        ltd_tier: String(parsedTier),
        ltd_pageview_limit: String(eventLimit),
      },
      customer_email: request.user?.email,
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
    });

    return reply.send({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("[ltd] Failed to create checkout session:", error.message);
    return reply.status(500).send({ error: "Failed to create checkout session." });
  }
}
