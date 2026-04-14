import dotenv from "dotenv";

dotenv.config();

export const IS_CLOUD = process.env.CLOUD === "true";
export const DISABLE_SIGNUP = process.env.DISABLE_SIGNUP === "true";
export const DISABLE_TELEMETRY = process.env.DISABLE_TELEMETRY === "true";
export const SECRET = process.env.BETTER_AUTH_SECRET;
export const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

// No free tier — orgs with no active subscription get zero quota
export const DEFAULT_EVENT_LIMIT = 0;

// Site and member limits per plan tier
export const STARTER_SITE_LIMIT = 1;
export const STARTER_MEMBER_LIMIT = 1;
export const PRO_SITE_LIMIT = 5;
export const PRO_MEMBER_LIMIT = 3;
// Scale: unlimited sites and members (null = no limit enforced)

// Uptime monitor limits per plan tier
export const STARTER_MONITOR_LIMIT = 5;
export const PRO_MONITOR_LIMIT = 10;
export const SCALE_MONITOR_LIMIT = 50;


// Define a type for the plan objects
export interface StripePlan {
  priceId: string;
  name: string;
  interval: "month" | "year";
  limits: {
    events: number;
    replays: number;
  };
}

const STRIPE_PRICES: StripePlan[] = [
  // Starter tiers
  { priceId: "price_1TBddYGIfYWdR0iZ3Pob1Yzv", name: "starter100k",        interval: "month", limits: { events: 100_000,    replays: 10_000    } },
  { priceId: "price_1TBddaGIfYWdR0iZ0J9cUlaG", name: "starter100k-annual", interval: "year",  limits: { events: 100_000,    replays: 10_000    } },
  { priceId: "price_1TBddcGIfYWdR0iZPb4Ksv5H", name: "starter250k",        interval: "month", limits: { events: 250_000,    replays: 25_000    } },
  { priceId: "price_1TBdddGIfYWdR0iZimra06GB", name: "starter250k-annual", interval: "year",  limits: { events: 250_000,    replays: 25_000    } },
  // Pro tiers
  { priceId: "price_1TBddoGIfYWdR0iZfXq4ts0Q", name: "pro100k",            interval: "month", limits: { events: 100_000,    replays: 10_000    } },
  { priceId: "price_1TBddpGIfYWdR0iZ2KmyfYao", name: "pro100k-annual",     interval: "year",  limits: { events: 100_000,    replays: 10_000    } },
  { priceId: "price_1TBddsGIfYWdR0iZG8N8wrBy", name: "pro250k",            interval: "month", limits: { events: 250_000,    replays: 25_000    } },
  { priceId: "price_1TBdduGIfYWdR0iZKsRlCDrM", name: "pro250k-annual",     interval: "year",  limits: { events: 250_000,    replays: 25_000    } },
  { priceId: "price_1TBddvGIfYWdR0iZ4l7NDiLW", name: "pro500k",            interval: "month", limits: { events: 500_000,    replays: 50_000    } },
  { priceId: "price_1TBddyGIfYWdR0iZzv70cJIw", name: "pro500k-annual",     interval: "year",  limits: { events: 500_000,    replays: 50_000    } },
  { priceId: "price_1TBde1GIfYWdR0iZ9zMoo94G", name: "pro1m",              interval: "month", limits: { events: 1_000_000,  replays: 100_000   } },
  { priceId: "price_1TBde3GIfYWdR0iZCAXphWDa", name: "pro1m-annual",       interval: "year",  limits: { events: 1_000_000,  replays: 100_000   } },
  { priceId: "price_1TBde5GIfYWdR0iZsc6zlT92", name: "pro2m",              interval: "month", limits: { events: 2_000_000,  replays: 200_000   } },
  { priceId: "price_1TBde7GIfYWdR0iZt8BnuJCI", name: "pro2m-annual",       interval: "year",  limits: { events: 2_000_000,  replays: 200_000   } },
  { priceId: "price_1TBdeAGIfYWdR0iZQIBqdEK3", name: "pro5m",              interval: "month", limits: { events: 5_000_000,  replays: 500_000   } },
  { priceId: "price_1TBdeBGIfYWdR0iZU742LHoi", name: "pro5m-annual",       interval: "year",  limits: { events: 5_000_000,  replays: 500_000   } },
  { priceId: "price_1TBdeDGIfYWdR0iZpC91gtqe", name: "pro10m",             interval: "month", limits: { events: 10_000_000, replays: 1_000_000 } },
  { priceId: "price_1TBdeFGIfYWdR0iZxb6AqfJ5", name: "pro10m-annual",      interval: "year",  limits: { events: 10_000_000, replays: 1_000_000 } },
  // Scale tiers
  { priceId: "price_1TBdeVGIfYWdR0iZFAsEzKL5", name: "scale100k",          interval: "month", limits: { events: 100_000,    replays: 10_000    } },
  { priceId: "price_1TBdeXGIfYWdR0iZs0OyKNkH", name: "scale100k-annual",   interval: "year",  limits: { events: 100_000,    replays: 10_000    } },
  { priceId: "price_1TBdeYGIfYWdR0iZFAoBAIWo", name: "scale250k",          interval: "month", limits: { events: 250_000,    replays: 25_000    } },
  { priceId: "price_1TBdeaGIfYWdR0iZIXUgZTMI", name: "scale250k-annual",   interval: "year",  limits: { events: 250_000,    replays: 25_000    } },
  { priceId: "price_1TBdeeGIfYWdR0iZZEBz5kNW", name: "scale500k",          interval: "month", limits: { events: 500_000,    replays: 50_000    } },
  { priceId: "price_1TBdegGIfYWdR0iZCOyZgQmx", name: "scale500k-annual",   interval: "year",  limits: { events: 500_000,    replays: 50_000    } },
  { priceId: "price_1TBdeiGIfYWdR0iZAwz3lmQ3", name: "scale1m",            interval: "month", limits: { events: 1_000_000,  replays: 100_000   } },
  { priceId: "price_1TBdepGIfYWdR0iZXFKdGZgh", name: "scale1m-annual",     interval: "year",  limits: { events: 1_000_000,  replays: 100_000   } },
  { priceId: "price_1TBderGIfYWdR0iZq24KbVrT", name: "scale2m",            interval: "month", limits: { events: 2_000_000,  replays: 200_000   } },
  { priceId: "price_1TBdetGIfYWdR0iZTDfSTaMQ", name: "scale2m-annual",     interval: "year",  limits: { events: 2_000_000,  replays: 200_000   } },
  { priceId: "price_1TBdewGIfYWdR0iZzGdrT2zo", name: "scale5m",            interval: "month", limits: { events: 5_000_000,  replays: 500_000   } },
  { priceId: "price_1TBdezGIfYWdR0iZET5fyqqg", name: "scale5m-annual",     interval: "year",  limits: { events: 5_000_000,  replays: 500_000   } },
  { priceId: "price_1TBdf0GIfYWdR0iZ7KLlQqS0", name: "scale10m",           interval: "month", limits: { events: 10_000_000, replays: 1_000_000 } },
  { priceId: "price_1TBdf2GIfYWdR0iZxKapDjLJ", name: "scale10m-annual",    interval: "year",  limits: { events: 10_000_000, replays: 1_000_000 } },
];

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
  if (process.env.STRIPE_SECRET_KEY?.startsWith("sk_live")) {
    return STRIPE_PRICES.map(price => ({
      ...price,
      priceId: LIVE_PRICE_IDS[price.name] ?? price.priceId,
    }));
  }
  return STRIPE_PRICES;
};
