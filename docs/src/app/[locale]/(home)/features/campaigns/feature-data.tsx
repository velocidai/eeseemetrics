import {
  BarChart3,
  Filter,
  Layers,
  Link2,
  Megaphone,
  PenTool,
  Rocket,
  Tag,
  Target,
  TrendingUp,
  Users,
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
    icon: <Tag className="w-5 h-5" />,
    title: "Full UTM parameter capture",
    description:
      "Automatically captures utm_source, utm_medium, utm_campaign, utm_term, and utm_content from every visit. No extra configuration required.",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Campaign performance table",
    description:
      "See sessions, visitors, pageviews, bounce rate, session duration, and conversion rate for every campaign, source, and medium in one table.",
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Period-over-period deltas",
    description:
      "Compare any campaign against the previous period at a glance. Green and red indicators show what's growing and what's declining.",
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Conversion tracking",
    description:
      "See exactly how many conversions each campaign, source, or medium drove. Link campaigns directly to your defined goals.",
  },
  {
    icon: <Layers className="w-5 h-5" />,
    title: "Drill-down breakdowns",
    description:
      "Click any campaign to see its top landing pages, secondary dimensions, traffic over time, and goal conversions — all in one expanded view.",
  },
  {
    icon: <Link2 className="w-5 h-5" />,
    title: "Google Ads support",
    description:
      "Automatically captures gclid and gad_source from Google Ads click links, so paid search traffic is tracked without manual UTM tagging.",
  },
  {
    icon: <Filter className="w-5 h-5" />,
    title: "Source & medium breakdowns",
    description:
      "View your campaign data grouped by utm_campaign, utm_source, or utm_medium with a single click. Switch views without losing your filters.",
  },
];

export const howItWorks: HowItWorksStep[] = [
  {
    step: 1,
    title: "Tag your campaign links",
    description:
      "Add UTM parameters to your URLs — utm_source, utm_medium, and utm_campaign are the essentials. Use our free UTM builder at /tools/utm-builder to generate them in seconds.",
  },
  {
    step: 2,
    title: "Eesee Metrics captures them automatically",
    description:
      "When a visitor lands on a tagged URL, the tracking script reads the UTM parameters from the URL and attaches them to the session. No extra code needed.",
  },
  {
    step: 3,
    title: "Parameters persist across the session",
    description:
      "If a visitor navigates to other pages, the UTM values follow them through the session so the entire visit is attributed to the original campaign.",
  },
  {
    step: 4,
    title: "View in the Campaigns dashboard",
    description:
      "Open the Campaigns page to see all your campaigns, sources, and mediums in one table — with sessions, conversions, and period comparisons already calculated.",
  },
];

export const whoUses: WhoUsesItem[] = [
  {
    icon: <Megaphone className="w-6 h-6" />,
    title: "Paid advertising teams",
    description:
      "Track Google Ads, Meta, and LinkedIn campaigns side by side. See which spend is driving real sessions and which is driving conversions.",
  },
  {
    icon: <PenTool className="w-6 h-6" />,
    title: "Email marketers",
    description:
      "Tag every email link with utm_source=newsletter and utm_medium=email. Instantly see how many sessions and conversions each campaign drives.",
  },
  {
    icon: <Rocket className="w-6 h-6" />,
    title: "Founders running growth experiments",
    description:
      "Test different channels and messages with UTM tags. Get data-backed answers to 'is this working?' without needing a data team.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Content & SEO teams",
    description:
      "Distinguish organic search traffic from link-building campaigns. Understand which content drives lasting organic growth vs. short-term referral spikes.",
  },
];

export const faqItems: FAQItem[] = [
  {
    question: "What UTM parameters does Eesee Metrics capture?",
    answer:
      "Eesee Metrics automatically captures utm_source, utm_medium, utm_campaign, utm_term, and utm_content. It also captures gclid and gad_source for Google Ads click tracking.",
  },
  {
    question: "Do I need to configure anything to track UTM parameters?",
    answer:
      "No. UTM capture is automatic. As long as your URLs include UTM parameters, Eesee Metrics will track them. No tag manager, no extra settings, no code changes required.",
  },
  {
    question: "Are UTM parameters tied to cookies?",
    answer:
      "No. Eesee Metrics uses sessionStorage (browser memory) to persist UTM values across pages within the same session. No cookies are set. The data is cleared when the browser tab is closed.",
  },
  {
    question: "What plans include campaign tracking?",
    answer:
      "Campaign tracking is available on all plans, including Starter.",
  },
  {
    question: "Can I see which campaigns led to conversions?",
    answer:
      "Yes. The Campaigns dashboard shows conversion counts and conversion rates per campaign, source, and medium. Drill down into any campaign to see a breakdown by goal.",
  },
  {
    question: "Is there a UTM link builder?",
    answer:
      "Yes. Eesee Metrics has a free UTM URL builder at /tools/utm-builder. Enter your base URL and campaign parameters and it generates a tagged URL you can copy instantly.",
  },
  {
    question: "Does Eesee Metrics support cross-session attribution?",
    answer:
      "Not currently. UTM attribution is session-based — if a visitor returns in a new session without a UTM parameter, that session is attributed to direct or organic. Cross-session first-touch attribution is on the roadmap.",
  },
];

export const relatedFeatures: RelatedFeature[] = [
  {
    title: "Goals",
    href: "/features/goals",
    description: "Define conversions so campaigns can be measured against real outcomes.",
  },
  {
    title: "Funnels",
    href: "/features/funnels",
    description: "See how campaign traffic moves through your conversion funnel.",
  },
  {
    title: "Web Analytics",
    href: "/features/web-analytics",
    description: "The traffic sources overview that complements campaign data.",
  },
  {
    title: "AI Reports",
    href: "/features/ai-reports",
    description: "Automated reports that include campaign performance summaries.",
  },
];
