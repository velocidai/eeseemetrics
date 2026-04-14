import {
  BarChart3,
  Bell,
  BrainCircuit,
  Calendar,
  FileText,
  Mail,
  Sparkles,
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
    icon: <Sparkles className="w-5 h-5" />,
    title: "Weekly & monthly reports",
    description:
      "Receive a plain-English summary of your site's performance every week and month. No charts to interpret — just clear, actionable insights.",
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Trend analysis",
    description:
      "The AI identifies what changed, by how much, and surfaces possible explanations — rising pages, dropping channels, seasonal patterns.",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Quarterly & yearly summaries",
    description:
      "Longer-horizon reports that zoom out to show growth trajectories, best-performing periods, and audience trends over time.",
  },
  {
    icon: <Mail className="w-5 h-5" />,
    title: "Email delivery",
    description:
      "Reports land in your inbox automatically. No logins required — your team stays informed without checking the dashboard.",
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: "Highlights reel",
    description:
      "Each report leads with the most important findings — the biggest movers, the standout pages, and the channels that drove the most value.",
  },
  {
    icon: <BrainCircuit className="w-5 h-5" />,
    title: "Ask questions via MCP",
    description:
      "On Scale, combine AI reports with MCP tools to ask follow-up questions about your data directly in Claude or Cursor.",
  },
];

export const howItWorks: HowItWorksStep[] = [
  {
    step: 1,
    title: "Data is collected automatically",
    description:
      "As your site receives traffic, Eesee Metrics tracks pageviews, sessions, referrers, events, and conversions — all without any extra configuration.",
  },
  {
    step: 2,
    title: "AI analyses the period",
    description:
      "At the end of each week or month, the AI reviews your analytics data — comparing against the previous period, identifying trends, and spotting anomalies.",
  },
  {
    step: 3,
    title: "Report is generated in plain English",
    description:
      "The findings are written up in clear, jargon-free language. No data science degree required — the report reads like a briefing from a smart analyst.",
  },
  {
    step: 4,
    title: "Delivered to your inbox",
    description:
      "The report is emailed to you and available in your dashboard. You can also access all historical reports to track how your site has evolved over time.",
  },
];

export const whoUses: WhoUsesItem[] = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Founders & indie hackers",
    description:
      "Stay on top of your site's performance without spending time in dashboards. Get the signal you need to make product and marketing decisions.",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Content teams",
    description:
      "Understand which posts are growing, which referrers are sending traffic, and what topics are resonating — all summarised automatically each week.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Marketing managers",
    description:
      "Share weekly reports with stakeholders without manually building slide decks. The AI does the analysis; you provide the strategy.",
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Agency owners",
    description:
      "Deliver automated monthly performance summaries to clients across all their sites. No manual work, consistent value every month.",
  },
];

export const faqItems: FAQItem[] = [
  {
    question: "What plans include AI reports?",
    answer:
      "AI reports are available on Pro and Scale plans. Starter does not include AI reports.",
  },
  {
    question: "How often are reports generated?",
    answer:
      "Weekly reports are generated every Monday covering the previous week. Monthly reports are generated on the first of each month. Quarterly and yearly reports are also available.",
  },
  {
    question: "Do I need to configure anything?",
    answer:
      "No. Reports start automatically once you are on a Pro or Scale plan with a site that has traffic. You can configure your email address for delivery in account settings.",
  },
  {
    question: "Can I access past reports?",
    answer:
      "Yes. All generated reports are stored in your dashboard under the Reports section. You can view the full history of weekly, monthly, quarterly, and yearly reports for each site.",
  },
  {
    question: "What data does the AI have access to?",
    answer:
      "The AI analyses anonymised, aggregated analytics data — pageviews, sessions, referrers, top pages, conversion goals, UTM campaigns, and period-over-period comparisons. It never has access to personal user data.",
  },
  {
    question: "Can I get reports for multiple sites?",
    answer:
      "Yes. Reports are generated per site. If you manage multiple sites under one Eesee Metrics account, each site gets its own automated reports.",
  },
];

export const relatedFeatures: RelatedFeature[] = [
  {
    title: "Anomaly Alerts",
    href: "/features/alerts",
    description: "Get notified the moment something unusual happens on your site.",
  },
  {
    title: "Web Analytics",
    href: "/features/web-analytics",
    description: "The real-time dashboard that powers the AI's analysis.",
  },
  {
    title: "MCP Tools",
    href: "/features/mcp",
    description: "Ask questions about your reports directly in your AI assistant.",
  },
  {
    title: "Goals",
    href: "/features/goals",
    description: "Track conversions so the AI can report on what's actually working.",
  },
];
