import { ComparisonSection, FAQItem, PricingInfo, RelatedResource } from "../components/ComparisonPage";

export const fathomComparisonData: ComparisonSection[] = [
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
      { name: "Script size", eeseemetricsValue: "18KB", competitorValue: "~2KB" },
      { name: "Bypasses ad blockers", eeseemetricsValue: true, competitorValue: true },
      { name: "API access", eeseemetricsValue: true, competitorValue: true },
      { name: "Starting price", eeseemetricsValue: "$19/mo", competitorValue: "$15/mo" },
    ],
  },
];

export const fathomExtendedData = {
  subtitle: "Both are privacy-first, but Eesee Metrics adds session replay, funnels, user journeys, and a full analytics feature set that Fathom doesn't offer.",

  introHeading: "Why consider Eesee Metrics over Fathom?",
  introParagraphs: [
    "Fathom Analytics is a well-respected privacy-first analytics tool known for its clean interface and cookie-free tracking. It's a solid choice for websites that need simple traffic metrics without the complexity of Google Analytics. But Fathom is intentionally limited to basic web analytics: no session replay, no funnel analysis, no user journey visualization, and it's entirely closed-source with no self-hosting option.",
    "Eesee Metrics shares Fathom's commitment to privacy and simplicity but extends far beyond basic web metrics. You get session replay to see exactly how users interact with your site, funnel analysis to identify conversion bottlenecks, user journey visualization with Sankey diagrams, Web Vitals monitoring, and error tracking. This means you can understand not just how many visitors you get, but how they convert, where they drop off, and what issues they encounter.",
    "Pricing is another key difference. Eesee Metrics uses events-based pricing starting at $19/month with a 7-day free trial and includes session replay from the Pro plan. Fathom uses pageview-based pricing starting at $15/month with no free tier and no advanced features like session replay or funnels at any price. If you love Fathom's privacy-first approach but need deeper analytics to grow your product, Eesee Metrics gives you that depth.",
  ],

  chooseEeseeMetrics: [
    "You want transparent, predictable pricing with no hidden fees",
    "You need session replay, funnels, and user journey visualization",
    "You want a 7-day free trial to evaluate before committing",
    "You need error tracking and Web Vitals monitoring",
    "You prefer events-based pricing over pageview-based",
    "You want a 7-day free trial before committing to a plan",
  ],

  chooseCompetitor: [
    "You want the smallest possible tracking script (2KB)",
    "You prefer a more established product with a longer track record",
    "You only need basic pageview and conversion tracking",
    "You don't want to worry about self-hosting or infrastructure",
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
    name: "Fathom",
    model: "Pageview-based pricing",
    startingPrice: "$15/mo",
    highlights: [
      "Starts at 100k pageviews/month",
      "No free tier available",
      "All features included on every plan",
      "Cloud-only, no self-hosting option",
    ],
  } satisfies PricingInfo,

  faqItems: [
    {
      question: "Is Eesee Metrics privacy-first while Fathom is not?",
      answer: "Both are privacy-first and cookie-free. Eesee Metrics is a commercial managed cloud service built on privacy-first principles. Fathom is also proprietary and cloud-only. Neither requires consent banners or collects personal data.",
    },
    {
      question: "What features does Eesee Metrics have that Fathom doesn't?",
      answer: "Eesee Metrics includes session replay, funnel analysis, user journey visualization (Sankey diagrams), Web Vitals monitoring, error tracking, user profiles, and sessions tracking. Fathom focuses on basic pageview and conversion analytics.",
    },
    {
      question: "How does pricing compare between Eesee Metrics and Fathom?",
      answer: "Eesee Metrics starts at $19/month with events-based pricing and a 7-day free trial. Fathom starts at $15/month with pageview-based pricing. Eesee Metrics includes significantly more features at a comparable price point, including session replay, funnels, and error tracking.",
    },
    {
      question: "Does Eesee Metrics offer a free trial like I can with other tools?",
      answer: "Yes, Eesee Metrics offers a free trial. You can evaluate all features before committing to a plan. Cancel anytime. Fathom does not offer a free trial.",
    },
    {
      question: "Is it easy to switch to Eesee Metrics from Fathom?",
      answer: "Yes. Just add Eesee Metrics' script tag to your site and data starts collecting immediately. You can run both in parallel during the transition. The setup takes less than 5 minutes.",
    },
  ] satisfies FAQItem[],

  relatedResources: [
    {
      title: "Eesee Metrics vs Plausible",
      href: "/compare/plausible",
      description: "Compare two privacy-first analytics platforms",
    },
    {
      title: "Eesee Metrics vs Simple Analytics",
      href: "/compare/simpleanalytics",
      description: "Feature-rich vs minimal analytics",
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
