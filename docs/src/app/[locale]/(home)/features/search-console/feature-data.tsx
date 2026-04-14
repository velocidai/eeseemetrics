import {
  BarChart3,
  Eye,
  Globe,
  Link2,
  Search,
  SlidersHorizontal,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import type {
  FAQItem,
  FeatureCapability,
  HowItWorksStep,
  RelatedFeature,
  WhoUsesItem,
} from "../components/FeaturePage";

export const capabilities: FeatureCapability[] = [
  {
    icon: <Search className="w-5 h-5" />,
    title: "Search query data",
    description:
      "See the exact search queries people use to find your site. Understand what intent is driving your organic traffic.",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Impressions, clicks & CTR",
    description:
      "Track how often your pages appear in search results, how many clicks they earn, and your click-through rate — all in one view.",
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Average position tracking",
    description:
      "Monitor your average ranking position for each query. Spot which keywords are climbing and which are slipping over time.",
  },
  {
    icon: <Link2 className="w-5 h-5" />,
    title: "Page-level search performance",
    description:
      "Break down search data by page. See which pages rank for the most queries and which drive the most organic clicks.",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Country & device breakdown",
    description:
      "Understand how your search performance varies by geography and device type. Optimise for the audiences and devices that matter most.",
  },
  {
    icon: <SlidersHorizontal className="w-5 h-5" />,
    title: "Side-by-side with your analytics",
    description:
      "Search Console data lives inside your Eesee Metrics dashboard — no tab switching between Google Search Console and your analytics.",
  },
];

export const howItWorks: HowItWorksStep[] = [
  {
    step: 1,
    title: "Connect your Google account",
    description:
      "In site settings, connect your Google account with Search Console access. Eesee Metrics requests read-only permission to your Search Console data.",
  },
  {
    step: 2,
    title: "Select your property",
    description:
      "Choose the Search Console property that corresponds to your site. Eesee Metrics will begin pulling data from Google's Search Console API.",
  },
  {
    step: 3,
    title: "Search data appears in your dashboard",
    description:
      "Your Search Console data is now available in the Search Console section of your Eesee Metrics dashboard — queries, impressions, clicks, CTR, and position.",
  },
  {
    step: 4,
    title: "Analyse alongside your analytics",
    description:
      "Use the same date filters and drill-downs you use elsewhere in Eesee Metrics. Cross-reference organic search queries with your session and conversion data.",
  },
];

export const whoUses: WhoUsesItem[] = [
  {
    icon: <Target className="w-6 h-6" />,
    title: "SEO teams",
    description:
      "Track keyword rankings, click-through rates, and impression share without leaving your analytics platform. One less tool to manage.",
  },
  {
    icon: <Eye className="w-6 h-6" />,
    title: "Content strategists",
    description:
      "Discover which queries are generating impressions but low clicks — high-value optimisation opportunities hiding in your data.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Growth-stage founders",
    description:
      "Understand whether your content strategy is building organic search visibility. See which posts rank and which queries you're missing.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Marketing managers",
    description:
      "Report on organic channel performance alongside paid and social. A unified view of what's driving traffic and from where.",
  },
];

export const faqItems: FAQItem[] = [
  {
    question: "What plans include Google Search Console integration?",
    answer:
      "Google Search Console integration is available on the Scale plan only.",
  },
  {
    question: "Does Eesee Metrics write anything to my Search Console?",
    answer:
      "No. Eesee Metrics requests read-only access to your Search Console data. It cannot make any changes to your Search Console account or Google Search configuration.",
  },
  {
    question: "How far back does the data go?",
    answer:
      "Google Search Console provides up to 16 months of historical data. Eesee Metrics will show data within that window when you apply date filters.",
  },
  {
    question: "How do I connect Search Console?",
    answer:
      "Go to your site settings in Eesee Metrics, navigate to Integrations, and click 'Connect Google Search Console'. You will be redirected to Google to authorise read-only access, then returned to your dashboard.",
  },
  {
    question: "Can I connect multiple sites?",
    answer:
      "Yes. Each site in Eesee Metrics can be connected to its own Search Console property. The connection is per-site, not per-account.",
  },
  {
    question: "Is there a data delay?",
    answer:
      "Yes. Google Search Console data typically has a 2–3 day delay. This is a limitation of the Google Search Console API, not Eesee Metrics.",
  },
];

export const relatedFeatures: RelatedFeature[] = [
  {
    title: "Web Analytics",
    href: "/features/web-analytics",
    description: "Organic search traffic in context with all your other channels.",
  },
  {
    title: "Campaigns",
    href: "/features/campaigns",
    description: "Measure paid search alongside your organic performance.",
  },
  {
    title: "AI Reports",
    href: "/features/ai-reports",
    description: "AI-generated reports that incorporate your search performance data.",
  },
  {
    title: "Goals",
    href: "/features/goals",
    description: "See which organic queries ultimately drive conversions.",
  },
];
