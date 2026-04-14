import { ComparisonSection, FAQItem, PricingInfo, RelatedResource } from "../components/ComparisonPage";

export const posthogComparisonData: ComparisonSection[] = [
  {
    title: "Analytics Features",
    features: [
      { name: "Real-time analytics", eeseemetricsValue: true, competitorValue: true },
      { name: "Custom events", eeseemetricsValue: "With attributes", competitorValue: "With properties" },
      { name: "Funnels", eeseemetricsValue: true, competitorValue: true },
      { name: "User journeys (Sankey)", eeseemetricsValue: true, competitorValue: true },
      { name: "Conversion goals", eeseemetricsValue: true, competitorValue: true },
      { name: "UTM tracking", eeseemetricsValue: true, competitorValue: true },
      { name: "Public dashboards", eeseemetricsValue: true, competitorValue: true },
    ],
  },
  {
    title: "Advanced Features",
    features: [
      { name: "Session Replay", eeseemetricsValue: true, competitorValue: true },
      { name: "User profiles", eeseemetricsValue: true, competitorValue: true },
      { name: "Web Vitals monitoring", eeseemetricsValue: true, competitorValue: true },
      { name: "Error tracking", eeseemetricsValue: true, competitorValue: true },
      { name: "Real-time globe view", eeseemetricsValue: true, competitorValue: false },
      { name: "Autocapture", eeseemetricsValue: true, competitorValue: true },
    ],
  },
  {
    title: "Privacy & privacy-first",
    features: [
      { name: "Cookie-free tracking", eeseemetricsValue: true, competitorValue: "Optional" },
      { name: "No personal data collection", eeseemetricsValue: true, competitorValue: false },
      { name: "Daily rotating salt", eeseemetricsValue: true, competitorValue: false },
      { name: "privacy-first", eeseemetricsValue: true, competitorValue: true },
      { name: "Self-hostable", eeseemetricsValue: true, competitorValue: "Very difficult" },
    ],
  },
  {
    title: "Technical & Pricing",
    features: [
      { name: "Script size", eeseemetricsValue: "18KB", competitorValue: "~60KB" },
      { name: "Bypasses ad blockers", eeseemetricsValue: true, competitorValue: "With proxy" },
      { name: "API access", eeseemetricsValue: true, competitorValue: true },
      { name: "Starting price", eeseemetricsValue: "$19/mo", competitorValue: "Free" },
    ],
  },
];

export const posthogExtendedData = {
  subtitle: "Eesee Metrics' focused web analytics vs PostHog's complex product suite. See which approach fits your team.",

  introHeading: "Why consider Eesee Metrics over PostHog?",
  introParagraphs: [
    "PostHog is an ambitious all-in-one product analytics platform that bundles analytics, session replay, feature flags, A/B testing, and surveys into a single tool. It's powerful, but that power comes with significant complexity. Teams often find themselves spending more time configuring PostHog than actually using it, and the ~60KB script can noticeably impact page performance.",
    "Eesee Metrics takes the opposite approach: do web analytics exceptionally well instead of doing everything adequately. The single-page dashboard gives your entire team instant access to the metrics that matter, with no training required. Non-technical team members can understand user behavior, track conversions, and watch session replays without learning a complex query language or navigating dozens of menus.",
    "Privacy is another key difference. Eesee Metrics is cookie-free by default and never collects personal data, with no configuration needed. PostHog uses cookies by default and requires setup to achieve privacy compliance. Self-hosting is also dramatically simpler: Eesee Metrics runs on TypeScript and ClickHouse, while PostHog requires Kafka, Redis, PostgreSQL, and ClickHouse. If you need focused, privacy-first web analytics that your whole team can use from day one, Eesee Metrics is the better fit.",
  ],

  chooseEeseeMetrics: [
    "You want focused web analytics without the bloat",
    "You need a dashboard your non-technical team can use immediately",
    "You want privacy-first analytics that's cookie-free by default",
    "You prefer a lightweight script (18KB vs ~60KB)",
    "You want simple, predictable pricing without usage surprises",
    "You want a fully managed service with zero infrastructure to maintain",
  ],

  chooseCompetitor: [
    "You need feature flags and A/B testing in your analytics tool",
    "You want heatmaps out of the box",
    "You need a SQL query interface for custom analysis",
    "You want surveys integrated with your analytics",
    "You need a mobile app for on-the-go analytics",
    "You prefer an all-in-one product analytics platform",
  ],

  eeseemetricsPricing: {
    name: "Eesee Metrics",
    model: "Events-based pricing",
    startingPrice: "$19/mo",
    highlights: [
      "Free trial. Cancel anytime.",
      "All features included, no add-on costs",
      "Session replay available on Pro plan",
      "Predictable billing with no overages",
    ],
  } satisfies PricingInfo,

  competitorPricing: {
    name: "PostHog",
    model: "Usage-based per product",
    startingPrice: "Free",
    highlights: [
      "Generous free tier (1M events/month for analytics)",
      "Each product (replay, flags, surveys) billed separately",
      "Costs can scale quickly with multiple products enabled",
      "Self-hosting is free but complex to operate",
    ],
  } satisfies PricingInfo,

  faqItems: [
    {
      question: "How is Eesee Metrics different from PostHog?",
      answer: "Eesee Metrics focuses exclusively on web analytics with a clean, simple interface. PostHog is an all-in-one product suite with analytics, feature flags, A/B testing, surveys, and more. if you primarily need web analytics, Eesee Metrics delivers a faster, simpler experience.",
    },
    {
      question: "Is Eesee Metrics really simpler than PostHog?",
      answer: "Yes. Eesee Metrics provides a single-page dashboard where all essential metrics are visible at a glance. PostHog's extensive feature set means more menus, more configuration, and a steeper learning curve, especially for non-technical team members.",
    },
    {
      question: "Does PostHog have features Eesee Metrics doesn't?",
      answer: "Yes, PostHog offers feature flags, A/B testing, surveys, heatmaps, and a SQL query interface that Eesee Metrics doesn't have. These are powerful tools for product teams, but they add complexity. Eesee Metrics intentionally focuses on doing web analytics well.",
    },
    {
      question: "How does hosting compare?",
      answer: "Eesee Metrics is a fully managed cloud service — no infrastructure to set up or maintain. PostHog's self-hosted version requires significantly more infrastructure (Kafka, Redis, PostgreSQL, ClickHouse, and more) and is complex to operate. PostHog Cloud is available but can get expensive at scale.",
    },
    {
      question: "Can I migrate to Eesee Metrics?",
      answer: "Yes. Just add Eesee Metrics' script tag to your site and data starts flowing immediately. You can run both tools in parallel during the transition. Since Eesee Metrics uses a different data model, historical PostHog data won't transfer, but new data collection begins instantly.",
    },
  ] satisfies FAQItem[],

  relatedResources: [
    {
      title: "Eesee Metrics vs Google Analytics",
      href: "/compare/google-analytics",
      description: "The privacy-first alternative to GA4",
    },
    {
      title: "Eesee Metrics vs Plausible",
      href: "/compare/plausible",
      description: "Compare two privacy-first analytics platforms",
    },
    {
      title: "Eesee Metrics vs Umami",
      href: "/compare/umami",
      description: "Privacy-first analytics with more features",
    },
    {
      title: "Getting started with Eesee Metrics",
      href: "/docs",
      description: "Set up Eesee Metrics in under 5 minutes",
    },
    {
      title: "Pricing",
      href: "/pricing",
      description: "Simple, transparent pricing for every team size",
    },
  ] satisfies RelatedResource[],
};
