export interface StripePrice {
  priceId: string;
  price: number;
  name: string;
  interval: string;
  events: number;
  shortName: string;
}

// Starter = Eesee Metrics Basic. Pro = Eesee Metrics Standard. Scale = Eesee Metrics Pro.
// Annual price stored as total charge (monthly × 8). UI divides by 12 to show $/mo equivalent.
// Live price IDs: fill in when switching to Stripe live mode before launch.
const STRIPE_PRICES: StripePrice[] = [
  // Starter (capped at 250K)
  { name: "starter100k",        interval: "month", price: 14,       events: 100_000,    shortName: "100k", priceId: "price_1TBddYGIfYWdR0iZ3Pob1Yzv" },
  { name: "starter100k-annual", interval: "year",  price: 14 * 8,   events: 100_000,    shortName: "100k", priceId: "price_1TBddaGIfYWdR0iZ0J9cUlaG" },
  { name: "starter250k",        interval: "month", price: 24,       events: 250_000,    shortName: "250k", priceId: "price_1TBddcGIfYWdR0iZPb4Ksv5H" },
  { name: "starter250k-annual", interval: "year",  price: 24 * 8,   events: 250_000,    shortName: "250k", priceId: "price_1TBdddGIfYWdR0iZimra06GB" },

  // Pro
  { name: "pro100k",        interval: "month", price: 19,       events: 100_000,    shortName: "100k", priceId: "price_1TBddoGIfYWdR0iZfXq4ts0Q" },
  { name: "pro100k-annual", interval: "year",  price: 19 * 8,   events: 100_000,    shortName: "100k", priceId: "price_1TBddpGIfYWdR0iZ2KmyfYao" },
  { name: "pro250k",        interval: "month", price: 29,       events: 250_000,    shortName: "250k", priceId: "price_1TBddsGIfYWdR0iZG8N8wrBy" },
  { name: "pro250k-annual", interval: "year",  price: 29 * 8,   events: 250_000,    shortName: "250k", priceId: "price_1TBdduGIfYWdR0iZKsRlCDrM" },
  { name: "pro500k",        interval: "month", price: 49,       events: 500_000,    shortName: "500k", priceId: "price_1TBddvGIfYWdR0iZ4l7NDiLW" },
  { name: "pro500k-annual", interval: "year",  price: 49 * 8,   events: 500_000,    shortName: "500k", priceId: "price_1TBddyGIfYWdR0iZzv70cJIw" },
  { name: "pro1m",          interval: "month", price: 69,       events: 1_000_000,  shortName: "1m",   priceId: "price_1TBde1GIfYWdR0iZ9zMoo94G" },
  { name: "pro1m-annual",   interval: "year",  price: 69 * 8,   events: 1_000_000,  shortName: "1m",   priceId: "price_1TBde3GIfYWdR0iZCAXphWDa" },
  { name: "pro2m",          interval: "month", price: 99,       events: 2_000_000,  shortName: "2m",   priceId: "price_1TBde5GIfYWdR0iZsc6zlT92" },
  { name: "pro2m-annual",   interval: "year",  price: 99 * 8,   events: 2_000_000,  shortName: "2m",   priceId: "price_1TBde7GIfYWdR0iZt8BnuJCI" },
  { name: "pro5m",          interval: "month", price: 149,      events: 5_000_000,  shortName: "5m",   priceId: "price_1TBdeAGIfYWdR0iZQIBqdEK3" },
  { name: "pro5m-annual",   interval: "year",  price: 149 * 8,  events: 5_000_000,  shortName: "5m",   priceId: "price_1TBdeBGIfYWdR0iZU742LHoi" },
  { name: "pro10m",         interval: "month", price: 249,      events: 10_000_000, shortName: "10m",  priceId: "price_1TBdeDGIfYWdR0iZpC91gtqe" },
  { name: "pro10m-annual",  interval: "year",  price: 249 * 8,  events: 10_000_000, shortName: "10m",  priceId: "price_1TBdeFGIfYWdR0iZxb6AqfJ5" },

  // Scale
  { name: "scale100k",        interval: "month", price: 39,       events: 100_000,    shortName: "100k", priceId: "price_1TBdeVGIfYWdR0iZFAsEzKL5" },
  { name: "scale100k-annual", interval: "year",  price: 39 * 8,   events: 100_000,    shortName: "100k", priceId: "price_1TBdeXGIfYWdR0iZs0OyKNkH" },
  { name: "scale250k",        interval: "month", price: 59,       events: 250_000,    shortName: "250k", priceId: "price_1TBdeYGIfYWdR0iZFAoBAIWo" },
  { name: "scale250k-annual", interval: "year",  price: 59 * 8,   events: 250_000,    shortName: "250k", priceId: "price_1TBdeaGIfYWdR0iZIXUgZTMI" },
  { name: "scale500k",        interval: "month", price: 99,       events: 500_000,    shortName: "500k", priceId: "price_1TBdeeGIfYWdR0iZZEBz5kNW" },
  { name: "scale500k-annual", interval: "year",  price: 99 * 8,   events: 500_000,    shortName: "500k", priceId: "price_1TBdegGIfYWdR0iZCOyZgQmx" },
  { name: "scale1m",          interval: "month", price: 139,      events: 1_000_000,  shortName: "1m",   priceId: "price_1TBdeiGIfYWdR0iZAwz3lmQ3" },
  { name: "scale1m-annual",   interval: "year",  price: 139 * 8,  events: 1_000_000,  shortName: "1m",   priceId: "price_1TBdepGIfYWdR0iZXFKdGZgh" },
  { name: "scale2m",          interval: "month", price: 199,      events: 2_000_000,  shortName: "2m",   priceId: "price_1TBderGIfYWdR0iZq24KbVrT" },
  { name: "scale2m-annual",   interval: "year",  price: 199 * 8,  events: 2_000_000,  shortName: "2m",   priceId: "price_1TBdetGIfYWdR0iZTDfSTaMQ" },
  { name: "scale5m",          interval: "month", price: 299,      events: 5_000_000,  shortName: "5m",   priceId: "price_1TBdewGIfYWdR0iZzGdrT2zo" },
  { name: "scale5m-annual",   interval: "year",  price: 299 * 8,  events: 5_000_000,  shortName: "5m",   priceId: "price_1TBdezGIfYWdR0iZET5fyqqg" },
  { name: "scale10m",         interval: "month", price: 499,      events: 10_000_000, shortName: "10m",  priceId: "price_1TBdf0GIfYWdR0iZ7KLlQqS0" },
  { name: "scale10m-annual",  interval: "year",  price: 499 * 8,  events: 10_000_000, shortName: "10m",  priceId: "price_1TBdf2GIfYWdR0iZxKapDjLJ" },
];

export const STRIPE_TIERS = STRIPE_PRICES.filter(
  price => price.interval === "month" && price.name.startsWith("pro")
).map(price => ({
  events: price.events,
  shortName: price.shortName,
}));

const LIVE_PRICE_IDS: Record<string, string> = {
  "starter100k":        "price_1TK41cGIfYWdR0iZf8Y0D2q7",
  "starter100k-annual": "price_1TK41dGIfYWdR0iZO0TDD8nk",
  "starter250k":        "price_1TK41dGIfYWdR0iZjFUZN1ly",
  "starter250k-annual": "price_1TK41dGIfYWdR0iZcehRsSAG",
  "pro100k":            "price_1TK41eGIfYWdR0iZn1YfZk0B",
  "pro100k-annual":     "price_1TK41eGIfYWdR0iZbhuV0eTk",
  "pro250k":            "price_1TK41fGIfYWdR0iZb8V4baYh",
  "pro250k-annual":     "price_1TK41fGIfYWdR0iZ8OT9CR7c",
  "pro500k":            "price_1TK41fGIfYWdR0iZU98zgH9V",
  "pro500k-annual":     "price_1TK41gGIfYWdR0iZZgLuR5wq",
  "pro1m":              "price_1TK41gGIfYWdR0iZazkEUqVU",
  "pro1m-annual":       "price_1TK41hGIfYWdR0iZu4EZFAFG",
  "pro2m":              "price_1TK41hGIfYWdR0iZIRBWT1Z2",
  "pro2m-annual":       "price_1TK41hGIfYWdR0iZRrmDI9w2",
  "pro5m":              "price_1TK41iGIfYWdR0iZUyE5cWg4",
  "pro5m-annual":       "price_1TK41iGIfYWdR0iZ3I1Q96nw",
  "pro10m":             "price_1TK41iGIfYWdR0iZEvWEU4GL",
  "pro10m-annual":      "price_1TK41jGIfYWdR0iZVDqKLSwl",
  "scale100k":          "price_1TK41jGIfYWdR0iZNJ1odsaO",
  "scale100k-annual":   "price_1TK41kGIfYWdR0iZzJqRdNu9",
  "scale250k":          "price_1TK41kGIfYWdR0iZb5Vcb62v",
  "scale250k-annual":   "price_1TK41kGIfYWdR0iZAXLGy6hm",
  "scale500k":          "price_1TK41lGIfYWdR0iZcIWN6i0d",
  "scale500k-annual":   "price_1TK41lGIfYWdR0iZO3VeV72I",
  "scale1m":            "price_1TK41mGIfYWdR0iZavXISQlX",
  "scale1m-annual":     "price_1TK41mGIfYWdR0iZfcGYsJLt",
  "scale2m":            "price_1TK41mGIfYWdR0iZI6vt7hS4",
  "scale2m-annual":     "price_1TK41nGIfYWdR0iZvk2uIlAo",
  "scale5m":            "price_1TK41nGIfYWdR0iZFpEReD08",
  "scale5m-annual":     "price_1TK41nGIfYWdR0iZ168Yb6BP",
  "scale10m":           "price_1TK41oGIfYWdR0iZhP33Y92U",
  "scale10m-annual":    "price_1TK41oGIfYWdR0iZoXmpPkJx",
};

export const getStripePrices = () => {
  if (process.env.NEXT_PUBLIC_BACKEND_URL?.includes("app.eeseemetrics.com")) {
    // Live mode — swap in live price IDs when available
    return STRIPE_PRICES.map(price => ({
      ...price,
      priceId: LIVE_PRICE_IDS[price.name] ?? price.priceId,
    }));
  }
  // Test mode — use test price IDs already in STRIPE_PRICES
  return STRIPE_PRICES;
};

export function getPlanType(name: string) {
  if (name.includes("starter")) {
    return "Starter";
  }
  if (name.includes("pro")) {
    return "Pro";
  }
  if (name.includes("scale")) {
    return "Scale";
  }
  return "Free";
}