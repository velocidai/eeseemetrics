import { http, HttpResponse } from "msw";

/** Stripe subscription list response for a Pro subscriber (pro100k monthly). */
const proSubscriptionResponse = {
  object: "list",
  data: [
    {
      id: "sub_test_pro",
      object: "subscription",
      status: "active",
      cancel_at_period_end: false,
      created: Math.floor(Date.now() / 1000) - 86400 * 30,
      trial_end: null,
      items: {
        object: "list",
        data: [
          {
            object: "subscription_item",
            price: {
              id: "price_1TBddoGIfYWdR0iZfXq4ts0Q", // pro100k monthly
              object: "price",
              recurring: { interval: "month" },
            },
            current_period_start: Math.floor(Date.now() / 1000) - 86400 * 10,
            current_period_end: Math.floor(Date.now() / 1000) + 86400 * 20,
          },
        ],
      },
    },
  ],
  has_more: false,
};

export const stripeHandlers = [
  http.get("https://api.stripe.com/v1/subscriptions", () => {
    return HttpResponse.json(proSubscriptionResponse);
  }),
];
