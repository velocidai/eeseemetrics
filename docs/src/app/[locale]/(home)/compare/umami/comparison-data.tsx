import { ComparisonSection, FAQItem, PricingInfo, RelatedResource } from "../components/ComparisonPage";

export const umamiComparisonData: ComparisonSection[] = [
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
      { name: "Session Replay", eeseemetricsValue: true, competitorValue: false },
      { name: "User profiles", eeseemetricsValue: true, competitorValue: true },
      { name: "Web Vitals monitoring", eeseemetricsValue: true, competitorValue: false },
      { name: "Error tracking", eeseemetricsValue: true, competitorValue: false },
      { name: "Real-time globe view", eeseemetricsValue: true, competitorValue: false },
      { name: "Autocapture", eeseemetricsValue: true, competitorValue: false },
    ],
  },
  {
    title: "Privacy & privacy-first",
    features: [
      { name: "Cookie-free tracking", eeseemetricsValue: true, competitorValue: true },
      { name: "No personal data collection", eeseemetricsValue: true, competitorValue: true },
      { name: "Daily rotating salt", eeseemetricsValue: true, competitorValue: false },
      { name: "privacy-first", eeseemetricsValue: true, competitorValue: true },
      { name: "Self-hostable", eeseemetricsValue: true, competitorValue: true },
    ],
  },
  {
    title: "Technical & Pricing",
    features: [
      { name: "Script size", eeseemetricsValue: "18KB", competitorValue: "~2KB" },
      { name: "Bypasses ad blockers", eeseemetricsValue: true, competitorValue: true },
      { name: "API access", eeseemetricsValue: true, competitorValue: true },
      { name: "Starting price", eeseemetricsValue: "$19/mo", competitorValue: "$20/mo" },
    ],
  },
];

export const umamiExtendedData = {
  subtitle: "Both are privacy-first, but Eesee Metrics offers session replay, funnels, and user journeys that Umami doesn't.",

  introHeading: "Why consider Eesee Metrics over Umami?",
  introParagraphs: [
    "Umami is a popular open-source analytics tool known for its tiny 2KB script and simple, clean interface. It's a solid choice for personal blogs and small sites that just need basic traffic metrics. But Umami's simplicity comes at the cost of advanced features: no session replay, no error tracking, no Web Vitals monitoring, and limited organization support for teams.",
    "Eesee Metrics shares Umami's privacy-first values and privacy-first values but offers a much deeper feature set. You get session replay to watch how users interact with your site, funnel analysis to find conversion bottlenecks, user journey visualization with Sankey diagrams, and error tracking to catch issues before your users report them. All while maintaining the clean, intuitive dashboard experience that makes simple analytics tools appealing.",
    "Eesee Metrics is a fully managed cloud service — no servers to maintain, no updates to run. Umami is open-source and requires you to manage your own infrastructure. If you've been running Umami yourself and want to stop worrying about uptime and database backups, Eesee Metrics gives you that without sacrificing privacy or feature depth. If you've outgrown Umami's basic metrics and need analytics that can grow with your product, Eesee Metrics is the natural next step.",
  ],

  chooseEeseeMetrics: [
    "You need session replay to see how users interact with your site",
    "You want error tracking and Web Vitals monitoring built in",
    "You need organization support with team roles and permissions",
    "You want a daily rotating salt option for extra privacy",
    "You need ClickHouse performance for high-traffic analytics",
    "You want a real-time globe view of your visitors",
  ],

  chooseCompetitor: [
    "You want the smallest possible tracking script (2KB)",
    "You prefer PostgreSQL or MySQL over ClickHouse for self-hosting",
    "You only need basic pageview and event tracking",
    "You want a completely free self-hosted solution with no limits",
    "You're running a personal blog or lightweight content site",
  ],

  eeseemetricsPricing: {
    name: "Eesee Metrics",
    model: "Events-based pricing",
    startingPrice: "$19/mo",
    highlights: [
      "Free trial. Cancel anytime.",
      "All features included on every plan",
      "Session replay available on Pro plan",
      "Unlimited team members",
    ],
  } satisfies PricingInfo,

  competitorPricing: {
    name: "Umami",
    model: "Usage-based + flat fee",
    startingPrice: "$20/mo",
    highlights: [
      "Hobby plan at $20/mo for 100k events",
      "Self-hosted version is completely free",
      "Cloud plans scale with usage",
      "No free cloud tier available",
    ],
  } satisfies PricingInfo,

  faqItems: [
    {
      question: "How is Eesee Metrics different from Umami?",
      answer: "Both prioritise privacy and simplicity, but Eesee Metrics includes advanced features Umami lacks: session replay, error tracking, Web Vitals monitoring, real-time globe view, and organization support. Eesee Metrics also uses ClickHouse for better performance at scale.",
    },
    {
      question: "Can I migrate to Eesee Metrics?",
      answer: "Yes. Just add Eesee Metrics' script tag to your site and data starts flowing immediately. You can run both tools in parallel during the transition. Historical Umami data won't transfer, but new data collection begins instantly.",
    },
    {
      question: "Is Umami self-hostable while Eesee Metrics is managed?",
      answer: "Yes. Umami is open-source and can be self-hosted for free with Docker. Eesee Metrics is a fully managed cloud service — no server setup, automatic updates, and dedicated support. If you want to eliminate infrastructure overhead, Eesee Metrics is the right choice.",
    },
    {
      question: "Does Eesee Metrics have a larger script than Umami?",
      answer: "Yes, Eesee Metrics' script is 18KB compared to Umami's 2KB. The additional size enables features like session replay, error tracking, and Web Vitals monitoring. Both are small enough to have negligible impact on page load.",
    },
    {
      question: "Are both GDPR compliant?",
      answer: "Yes. Both Eesee Metrics and Umami are cookie-free and don't collect personal data. Eesee Metrics adds an extra privacy option with daily rotating salt for user ID hashing, ensuring visitors can't be tracked across days.",
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
      title: "Eesee Metrics vs Fathom",
      href: "/compare/fathom",
      description: "privacy-first vs proprietary privacy analytics",
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
