import { ComparisonSection, FAQItem, PricingInfo, RelatedResource } from "../components/ComparisonPage";

export const matomoComparisonData: ComparisonSection[] = [
  {
    title: "Analytics Features",
    features: [
      { name: "Real-time analytics", eeseemetricsValue: true, competitorValue: true },
      { name: "Custom events", eeseemetricsValue: "With attributes", competitorValue: true },
      { name: "Funnels", eeseemetricsValue: true, competitorValue: true },
      { name: "User journeys (Sankey)", eeseemetricsValue: true, competitorValue: false },
      { name: "Conversion goals", eeseemetricsValue: true, competitorValue: true },
      { name: "UTM tracking", eeseemetricsValue: true, competitorValue: true },
      { name: "Public dashboards", eeseemetricsValue: true, competitorValue: false },
    ],
  },
  {
    title: "Advanced Features",
    features: [
      { name: "Session Replay", eeseemetricsValue: true, competitorValue: true },
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
      { name: "Cookie-free tracking", eeseemetricsValue: true, competitorValue: "Optional" },
      { name: "No personal data collection", eeseemetricsValue: true, competitorValue: false },
      { name: "Daily rotating salt", eeseemetricsValue: true, competitorValue: false },
      { name: "privacy-first", eeseemetricsValue: true, competitorValue: true },
      { name: "Self-hostable", eeseemetricsValue: true, competitorValue: true },
    ],
  },
  {
    title: "Technical & Pricing",
    features: [
      { name: "Script size", eeseemetricsValue: "18KB", competitorValue: "20-50KB" },
      { name: "Bypasses ad blockers", eeseemetricsValue: true, competitorValue: false },
      { name: "API access", eeseemetricsValue: true, competitorValue: true },
      { name: "Starting price", eeseemetricsValue: "$19/mo", competitorValue: "\u20AC19/mo" },
    ],
  },
];

export const matomoExtendedData = {
  subtitle: "Eesee Metrics is the modern, simple alternative to Matomo: no PHP, no complex setup, and privacy-first by default.",

  introHeading: "Why consider Eesee Metrics over Matomo?",
  introParagraphs: [
    "Matomo (formerly Piwik) has been around since 2007 and positions itself as the open-source Google Analytics alternative. It's feature-rich with 70+ reports, heatmaps, A/B testing, and form analytics. But that breadth comes with Google Analytics-level complexity, and most teams need training just to find the metrics they care about, and the PHP/MySQL stack feels increasingly dated.",
    "Eesee Metrics is what a modern analytics tool should look like. A single-page dashboard shows all essential metrics at a glance, with no training required. Privacy works by default: no cookies, no consent banners, no configuration needed. The tech stack (TypeScript, ClickHouse) is built for performance, and the managed cloud option means zero server maintenance. You get session replay, user journeys, Web Vitals, and error tracking without installing plugins.",
    "Matomo's cloud pricing starts at €19/month for just 50k hits, and many useful features require paid plugins on top of that. Eesee Metrics starts at $19/month with all features included. If you're tired of Matomo's complexity, maintenance burden, or plugin costs, Eesee Metrics offers a dramatically simpler path to the analytics insights your team actually needs.",
  ],

  chooseEeseeMetrics: [
    "You want a simple single-page dashboard with no training required",
    "You need privacy by default, with no cookie consent configuration needed",
    "You prefer a modern tech stack (Next.js/ClickHouse) over legacy PHP",
    "You want cloud hosting with zero maintenance",
    "You need session replay, user journeys, and Web Vitals built in",
    "You want a 7-day free trial to evaluate before committing",
  ],

  chooseCompetitor: [
    "You need heatmaps, A/B testing, or form analytics",
    "You have strict on-premise requirements for compliance",
    "You rely on the WordPress plugin ecosystem",
    "You need a Google Analytics data import tool",
    "You want a custom report builder with 70+ report types",
  ],

  eeseemetricsPricing: {
    name: "Eesee Metrics",
    model: "Events-based pricing",
    startingPrice: "$19/mo",
    highlights: [
      "Free trial. Cancel anytime.",
      "All features included on every plan",
      "Session replay available on Pro plan",
      "Zero maintenance cloud hosting",
    ],
  } satisfies PricingInfo,

  competitorPricing: {
    name: "Matomo Cloud",
    model: "Pageview-based pricing",
    startingPrice: "\u20AC19/mo",
    highlights: [
      "Starts at 50k hits/month",
      "On-Premise edition available for free (self-host)",
      "Many features require paid plugins on top",
      "Self-hosting requires server maintenance",
    ],
  } satisfies PricingInfo,

  faqItems: [
    {
      question: "Is Eesee Metrics really simpler than Matomo?",
      answer: "Yes. Matomo has 70+ reports across 12 sections, inheriting Google Analytics-style complexity. Eesee Metrics shows all essential metrics on a single intuitive dashboard. Your team can start using Eesee Metrics immediately without training.",
    },
    {
      question: "Does Eesee Metrics require cookies like Matomo?",
      answer: "No. Eesee Metrics is cookie-free by default and never requires consent banners. Matomo uses cookies by default and requires configuration to achieve cookieless tracking, which can reduce its accuracy.",
    },
    {
      question: "How does hosting compare?",
      answer: "Eesee Metrics is a fully managed cloud service — no servers, no updates, no maintenance required. Matomo is available as a self-hosted open-source product (free) or as a cloud service (paid). If you're currently self-hosting Matomo and want to eliminate that overhead, Eesee Metrics is the simpler path.",
    },
    {
      question: "Can I migrate to Eesee Metrics?",
      answer: "Yes. Add Eesee Metrics' script tag to your site and data starts flowing immediately. You can run both tools in parallel during the transition. Eesee Metrics' simpler setup means you'll be collecting data within minutes.",
    },
    {
      question: "Does Matomo have features Eesee Metrics doesn't?",
      answer: "Yes, Matomo offers heatmaps, A/B testing, form analytics, and a custom report builder that Eesee Metrics doesn't have. However, many of these require paid plugins. Eesee Metrics focuses on delivering the analytics features most teams actually need, with a much simpler experience.",
    },
  ] satisfies FAQItem[],

  relatedResources: [
    {
      title: "Eesee Metrics vs Google Analytics",
      href: "/compare/google-analytics",
      description: "The privacy-first alternative to GA4",
    },
    {
      title: "Eesee Metrics vs PostHog",
      href: "/compare/posthog",
      description: "Focused analytics vs all-in-one product suite",
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
