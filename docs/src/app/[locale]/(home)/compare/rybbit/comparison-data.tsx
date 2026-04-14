import { ComparisonSection, FAQItem, PricingInfo, RelatedResource } from "../components/ComparisonPage";

export const rybbitComparisonData: ComparisonSection[] = [
  {
    title: "Analytics Features",
    features: [
      { name: "Real-time analytics", eeseemetricsValue: true, competitorValue: true },
      { name: "Custom events", eeseemetricsValue: "With attributes", competitorValue: true },
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
      { name: "Session Replay", eeseemetricsValue: true, competitorValue: "Pro only ($26/mo)" },
      { name: "User profiles", eeseemetricsValue: true, competitorValue: true },
      { name: "Web Vitals monitoring", eeseemetricsValue: true, competitorValue: true },
      { name: "Error tracking", eeseemetricsValue: true, competitorValue: true },
      { name: "Real-time globe view", eeseemetricsValue: true, competitorValue: true },
      { name: "Autocapture", eeseemetricsValue: true, competitorValue: true },
      { name: "AI-powered reports", eeseemetricsValue: "Pro+", competitorValue: false },
      { name: "AI Chat (ask your data)", eeseemetricsValue: "Scale only", competitorValue: false },
      { name: "MCP tools for AI assistants", eeseemetricsValue: "Pro+", competitorValue: false },
      { name: "Anomaly alerts", eeseemetricsValue: "Pro+", competitorValue: false },
      { name: "Google Search Console", eeseemetricsValue: "Pro+", competitorValue: false },
    ],
  },
  {
    title: "Privacy & Compliance",
    features: [
      { name: "Cookie-free tracking", eeseemetricsValue: true, competitorValue: true },
      { name: "No personal data collection", eeseemetricsValue: true, competitorValue: true },
      { name: "Daily rotating salt", eeseemetricsValue: true, competitorValue: true },
      { name: "GDPR compliant", eeseemetricsValue: true, competitorValue: true },
      { name: "Self-hostable", eeseemetricsValue: true, competitorValue: true },
    ],
  },
  {
    title: "Technical & Pricing",
    features: [
      { name: "Script size", eeseemetricsValue: "18KB", competitorValue: "~6KB" },
      { name: "Bypasses ad blockers", eeseemetricsValue: true, competitorValue: true },
      { name: "API access", eeseemetricsValue: true, competitorValue: true },
      { name: "Free tier", eeseemetricsValue: "7-day trial", competitorValue: "3K pageviews/mo" },
      { name: "Starting price", eeseemetricsValue: "$19/mo", competitorValue: "$13/mo" },
      { name: "Session replay starting price", eeseemetricsValue: "$19/mo (Pro)", competitorValue: "$26/mo (Pro)" },
    ],
  },
];

export const rybbitExtendedData = {
  subtitle: "Both tools share privacy-first analytics DNA. Here's where Eesee Metrics pulls ahead with AI-powered insights and managed infrastructure.",

  introHeading: "Eesee Metrics vs Rybbit: Same roots, different direction",
  introParagraphs: [
    "Rybbit is a privacy-first web analytics platform — open-source, AGPL 3.0, with 11K+ GitHub stars and a solid feature set covering funnels, user journeys, session replay, web vitals, and error tracking. It offers both a managed cloud service and a self-hosted option.",
    "Eesee Metrics is built on the same open-source foundation — AGPL 3.0, fully self-hostable via Docker — while adding a layer of intelligence that Rybbit doesn't have. AI-powered weekly and monthly reports surface insights automatically, without you having to dig through dashboards. AI Chat lets you ask plain-English questions about your data directly in Claude or any MCP-compatible AI assistant. These features are built into Pro and Scale plans.",
    "On pricing, the comparison is closer than it looks. Rybbit's Standard plan is $13/mo but does not include session replay — you need their $26/mo Pro tier for that. Eesee Metrics includes session replay starting at $19/mo. So if session replay matters to you, Eesee Metrics is actually the better value. Rybbit does offer a free tier (3,000 pageviews/month) while Eesee Metrics offers a 7-day free trial instead.",
  ],

  chooseEeseeMetrics: [
    "You want AI-generated reports delivered automatically — no manual analysis needed",
    "You want to query your analytics data using natural language in AI assistants (MCP)",
    "You want anomaly alerts and Google Search Console integration out of the box",
    "You prefer a fully managed service with no infrastructure to maintain",
    "You need session replay and don't want to pay $26/mo just to get it",
    "You want dedicated support rather than community forums",
  ],

  chooseCompetitor: [
    "You want Rybbit's community support and ecosystem specifically",
    "You need a free tier for very low-traffic sites (Rybbit offers 3K pageviews/month free)",
    "You need a free tier for very low-traffic sites",
    "You're comfortable with community-based support",
    "You want to avoid any vendor lock-in with a commercial SaaS",
  ],

  eeseemetricsPricing: {
    name: "Eesee Metrics",
    model: "Events-based pricing",
    startingPrice: "$19/mo",
    highlights: [
      "Free trial. Cancel anytime.",
      "Session replay included from $19/mo (Pro)",
      "AI reports, alerts, and MCP tools on Pro+",
      "Fully managed — zero infrastructure to maintain",
    ],
  } satisfies PricingInfo,

  competitorPricing: {
    name: "Rybbit",
    model: "Pageview-based pricing",
    startingPrice: "$13/mo",
    highlights: [
      "Free tier available (3,000 pageviews/month)",
      "Standard: $13/mo — no session replay",
      "Pro: $26/mo — session replay + 5-year retention",
      "Self-hosted option available (free, AGPL 3.0)",
    ],
  } satisfies PricingInfo,

  faqItems: [
    {
      question: "How is Eesee Metrics different from Rybbit?",
      answer: "Both are privacy-first, open-source (AGPL 3.0) analytics tools with similar core feature sets. The main differences: Eesee Metrics adds AI-powered reports, AI Chat for natural-language data queries, MCP tools for AI assistants, and anomaly alerts — none of which Rybbit offers. Both support self-hosting via Docker.",
    },
    {
      question: "Is Rybbit cheaper than Eesee Metrics?",
      answer: "Rybbit's entry price ($13/mo Standard) is lower, but the Standard plan does not include session replay. If you need session replay, Rybbit requires their $26/mo Pro plan. Eesee Metrics includes session replay from $19/mo — making it the better value if session replay is on your list.",
    },
    {
      question: "Can I self-host Eesee Metrics like Rybbit?",
      answer: "Yes. Eesee Metrics is open-source (AGPL 3.0) and fully self-hostable via Docker — just like Rybbit. You can run it on your own infrastructure for free. The cloud-hosted version at eeseemetrics.com adds managed uptime, automatic updates, and dedicated support.",
    },
    {
      question: "What AI features does Eesee Metrics have that Rybbit doesn't?",
      answer: "Eesee Metrics Pro includes AI-powered weekly and monthly reports that automatically surface trends, anomalies, and opportunities in plain English. Scale adds AI Chat, which lets you ask questions about your analytics data in natural language — directly inside Claude, ChatGPT, or any MCP-compatible AI assistant. Rybbit has no AI features.",
    },
    {
      question: "Can I migrate from Rybbit to Eesee Metrics?",
      answer: "Yes. Add Eesee Metrics' tracking script to your site and data starts flowing immediately. You can run both in parallel during the transition. Historical Rybbit data won't transfer, but new data collection begins within minutes.",
    },
  ] satisfies FAQItem[],

  relatedResources: [
    {
      title: "Eesee Metrics vs Plausible",
      href: "/compare/plausible",
      description: "More features with the same privacy-first approach",
    },
    {
      title: "Eesee Metrics vs Umami",
      href: "/compare/umami",
      description: "Advanced features beyond lightweight minimalism",
    },
    {
      title: "Eesee Metrics vs PostHog",
      href: "/compare/posthog",
      description: "Focused web analytics vs all-in-one product suite",
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
