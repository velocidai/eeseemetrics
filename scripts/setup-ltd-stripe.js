#!/usr/bin/env node
/**
 * One-time script: creates LTD products + prices in Stripe (live or test mode)
 * and patches server/src/api/ltd/checkout.ts with the resulting price IDs.
 *
 * Usage (from repo root):
 *   node scripts/setup-ltd-stripe.js
 */

const fs = require("fs");
const path = require("path");

// Load env from server/.env
require(path.join(__dirname, "../server/node_modules/dotenv")).config({
  path: path.join(__dirname, "../server/.env"),
});

const Stripe = require(path.join(__dirname, "../server/node_modules/stripe"));

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("❌  STRIPE_SECRET_KEY not found in server/.env");
  process.exit(1);
}

const isLive = key.startsWith("sk_live");
console.log(`\nStripe mode: ${isLive ? "🟢 LIVE" : "🧪 TEST"}\n`);

const stripe = new Stripe(key);

const TIERS = [
  { name: "Eesee Metrics LTD — Starter 100K", amount: 4900,  tier: 1, desc: "Lifetime access to Eesee Metrics Starter plan — 100,000 pageviews/month. One-time payment." },
  { name: "Eesee Metrics LTD — Starter 250K", amount: 7900,  tier: 2, desc: "Lifetime access to Eesee Metrics Starter plan — 250,000 pageviews/month. One-time payment." },
  { name: "Eesee Metrics LTD — Starter 500K", amount: 12900, tier: 3, desc: "Lifetime access to Eesee Metrics Starter plan — 500,000 pageviews/month. One-time payment. LTD-exclusive tier." },
];

async function main() {
  const priceIds = {};

  for (const tier of TIERS) {
    console.log(`Creating product: ${tier.name}...`);
    const product = await stripe.products.create({
      name: tier.name,
      description: tier.desc,
    });

    console.log(`  ✓ Product: ${product.id}`);

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: tier.amount,
      currency: "usd",
    });

    console.log(`  ✓ Price:   ${price.id}  ($${tier.amount / 100})\n`);
    priceIds[tier.tier] = price.id;
  }

  console.log("Price IDs created:");
  console.log(JSON.stringify(priceIds, null, 2));

  // Patch checkout.ts
  const checkoutPath = path.join(__dirname, "../server/src/api/ltd/checkout.ts");
  let src = fs.readFileSync(checkoutPath, "utf8");

  const mapKey = isLive ? "LTD_PRICE_IDS_LIVE" : "LTD_PRICE_IDS_TEST";
  const newMap = `const ${mapKey}: Record<number, string> = {
  1: "${priceIds[1]}", // $49 — 100K pv/mo
  2: "${priceIds[2]}", // $79 — 250K pv/mo
  3: "${priceIds[3]}", // $129 — 500K pv/mo
};`;

  // Replace the existing map block
  const regex = new RegExp(
    `const ${mapKey}: Record<number, string> = \\{[\\s\\S]*?\\};`
  );
  if (regex.test(src)) {
    src = src.replace(regex, newMap);
    fs.writeFileSync(checkoutPath, src);
    console.log(`\n✅  Patched ${checkoutPath} with ${mapKey}`);
  } else {
    console.warn(`\n⚠️  Could not auto-patch checkout.ts — update ${mapKey} manually with:`);
    console.log(newMap);
  }
}

main().catch(err => {
  console.error("❌ ", err.message);
  process.exit(1);
});
