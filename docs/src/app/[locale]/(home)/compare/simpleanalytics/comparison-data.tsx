import { ComparisonSection, FAQItem, PricingInfo, RelatedResource } from "../components/ComparisonPage";

export const simpleAnalyticsComparisonData: ComparisonSection[] = [
  {
    title: "Analytics Features",
    features: [
      { name: "Real-time analytics", eeseemetricsValue: true, competitorValue: true },
      { name: "Custom events", eeseemetricsValue: "With attributes", competitorValue: "Basic" },
      { name: "Funnels", eeseemetricsValue: true, competitorValue: false },
      { name: "User journeys (Sankey)", eeseemetricsValue: true, competitorValue: false },
      { name: "Conversion goals", eeseemetricsValue: true, competitorValue: true },
      { name: "UTM tracking", eeseemetricsValue: true, competitorValue: true },
      { name: "Public dashboards", eeseemetricsValue: true, competitorValue: true },
    ],
  },
  {
    title: "Advanced Features",
    features: [
      { name: "Session Replay", eeseemetricsValue: true, competitorValue: false },
      { name: "User profiles", eeseemetricsValue: true, competitorValue: false },
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
      { name: "privacy-first", eeseemetricsValue: true, competitorValue: false },
      { name: "Self-hostable", eeseemetricsValue: true, competitorValue: false },
    ],
  },
  {
    title: "Technical & Pricing",
    features: [
      { name: "Script size", eeseemetricsValue: "18KB", competitorValue: "~6KB" },
      { name: "Bypasses ad blockers", eeseemetricsValue: true, competitorValue: true },
      { name: "API access", eeseemetricsValue: true, competitorValue: true },
      { name: "Starting price", eeseemetricsValue: "$19/mo", competitorValue: "$19/mo" },
    ],
  },
];

export const simpleAnalyticsExtendedData = {
  subtitle: "Both prioritize privacy, but Eesee Metrics is privacy-first with session replay, funnels, and city-level geolocation that Simple Analytics lacks.",

  introHeading: "Why consider Eesee Metrics over Simple Analytics?",
  introParagraphs: [
    "Simple Analytics lives up to its name: it's a privacy-focused analytics tool that keeps things minimal. It offers a clean dashboard, cookie-free tracking, and EU-based data storage. But its simplicity means no session replay, no funnel analysis, no user journeys, and only country-level geolocation. It's also entirely closed-source with no self-hosting option.",
    "Eesee Metrics matches Simple Analytics on privacy (cookie-free, no personal data collection, EU data storage) but adds the advanced features growing teams actually need. Session replay lets you watch how users interact with your site. Funnel analysis shows where visitors drop off in your conversion flow. User journey visualization reveals the paths people take through your content. And city-level geolocation gives you much more granular insights into where your audience is.",
    "The business model difference matters too. Eesee Metrics is a managed cloud service built on privacy-first principles — no cookies, no personal data collection, and full transparency about how your data is handled. Simple Analytics is also proprietary cloud-only. If you want privacy-first analytics with the depth to actually improve your product, Eesee Metrics is the stronger choice.",
  ],

  chooseEeseeMetrics: [
    "You want transparent, predictable pricing with no hidden fees",
    "You need session replay, funnels, and user journey visualization",
    "You want city-level geolocation instead of country-level",
    "You need error tracking and Web Vitals monitoring",
    "You want organization support with team roles",
    "You want a 7-day free trial to evaluate the product",
  ],

  chooseCompetitor: [
    "You want built-in AI-powered analytics assistant",
    "You want a Mini plan with unlimited websites",
    "You prefer a longer-established product",
    "You don't need advanced features like funnels or session replay",
    "You want country-level data only for maximum privacy",
  ],

  eeseemetricsPricing: {
    name: "Eesee Metrics",
    model: "Events-based pricing",
    startingPrice: "$19/mo",
    highlights: [
      "Free trial. Cancel anytime.",
      "Session replay available on Pro plan",
      "Funnels, user journeys, and error tracking included",
      "Session replay and advanced analytics on Pro plan",
    ],
  } satisfies PricingInfo,

  competitorPricing: {
    name: "Simple Analytics",
    model: "Pageview-based pricing",
    startingPrice: "$19/mo",
    highlights: [
      "Starts at 100k pageviews/month",
      "No free tier.14-day trial only",
      "AI assistant included on all plans",
      "Cloud-only, no self-hosting option",
    ],
  } satisfies PricingInfo,

  faqItems: [
    {
      question: "Is Eesee Metrics privacy-first while Simple Analytics is not?",
      answer: "Both are privacy-first and cookie-free. Simple Analytics is a closed-source proprietary service. Eesee Metrics is a commercial managed cloud service built on privacy-first principles with full transparency about data handling.",
    },
    {
      question: "What features does Eesee Metrics have that Simple Analytics doesn't?",
      answer: "Eesee Metrics includes session replay, funnel analysis, user journey visualization (Sankey diagrams), Web Vitals monitoring, error tracking, user profiles, city-level geolocation, and organization support. Simple Analytics focuses on simpler metrics with an AI assistant.",
    },
    {
      question: "How does geolocation differ between the two?",
      answer: "Eesee Metrics provides city-level geolocation data, giving you more granular insights into where your visitors are. Simple Analytics only offers country-level data, which limits your ability to understand regional traffic patterns.",
    },
    {
      question: "Are both equally private?",
      answer: "Both are privacy-first and cookie-free with EU data storage. Eesee Metrics adds a daily rotating salt option for extra privacy, ensuring visitor IDs can't be tracked across days. Both are GDPR compliant without requiring consent banners.",
    },
    {
      question: "Can I switch from Simple Analytics to Eesee Metrics easily?",
      answer: "Yes. Add Eesee Metrics' tracking script to your site and data collection begins immediately. You can run both tools in parallel during the transition. Setup takes less than 5 minutes.",
    },
  ] satisfies FAQItem[],

  relatedResources: [
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
