import {
  Activity,
  Bell,
  BellOff,
  Bot,
  Gauge,
  MessageSquare,
  Settings,
  Slack,
  TrendingDown,
  TrendingUp,
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
    icon: <Activity className="w-5 h-5" />,
    title: "Automatic anomaly detection",
    description:
      "Eesee Metrics continuously monitors your traffic and automatically flags deviations that are statistically significant — without you needing to set manual thresholds.",
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Traffic spike alerts",
    description:
      "Know the moment your site goes viral, a campaign lands, or a press mention drives a surge. Capitalise on spikes while they're happening.",
  },
  {
    icon: <TrendingDown className="w-5 h-5" />,
    title: "Traffic drop alerts",
    description:
      "Detect sudden drops in traffic before they become a crisis. Catch broken pages, failed deployments, or de-indexing events early.",
  },
  {
    icon: <Settings className="w-5 h-5" />,
    title: "Custom alert rules",
    description:
      "Define your own thresholds for specific pages, events, or metrics. Go beyond automated detection with rules tailored to your site.",
  },
  {
    icon: <Slack className="w-5 h-5" />,
    title: "Slack & Discord notifications",
    description:
      "Send alerts directly to your team's Slack channel or Discord server. The whole team stays informed without checking dashboards.",
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: "Email & webhook delivery",
    description:
      "Receive alerts via email or route them to any webhook endpoint — integrate with PagerDuty, Zapier, or your own systems.",
  },
];

export const howItWorks: HowItWorksStep[] = [
  {
    step: 1,
    title: "Monitoring starts automatically",
    description:
      "As soon as your site has traffic, Eesee Metrics begins building a baseline of normal behaviour — pageviews, sessions, and engagement patterns.",
  },
  {
    step: 2,
    title: "Anomalies are detected in real time",
    description:
      "The detection engine compares current traffic against your historical baseline. When something deviates significantly, an anomaly is flagged.",
  },
  {
    step: 3,
    title: "You are notified immediately",
    description:
      "Alerts are delivered via your configured channels — Slack, Discord, email, or webhook — within minutes of detection.",
  },
  {
    step: 4,
    title: "Investigate in the dashboard",
    description:
      "Click through from the alert to your analytics dashboard to see the anomaly in context — which pages, which sources, and what changed.",
  },
];

export const whoUses: WhoUsesItem[] = [
  {
    icon: <Bot className="w-6 h-6" />,
    title: "Developers & DevOps",
    description:
      "Catch broken deployments, misconfigured redirects, or missing pages before users start complaining. Real-time traffic drops tell you something went wrong.",
  },
  {
    icon: <Gauge className="w-6 h-6" />,
    title: "Marketing teams",
    description:
      "Know the moment a campaign starts driving results — or stops. Traffic spike alerts let you capitalise while the momentum is live.",
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Content publishers",
    description:
      "Spot viral content the moment it happens. Understand which posts are getting picked up and respond while the window is open.",
  },
  {
    icon: <BellOff className="w-6 h-6" />,
    title: "Founders monitoring growth",
    description:
      "Stay aware of your site's health without constant dashboard checking. Alerts notify you when something significant happens.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Agencies managing multiple sites",
    description:
      "Monitor all client sites simultaneously. A single Slack channel can receive alerts from every site you manage.",
  },
];

export const faqItems: FAQItem[] = [
  {
    question: "What plans include anomaly alerts?",
    answer:
      "Anomaly alerts are available on Pro and Scale plans. Starter does not include alerts.",
  },
  {
    question: "How does automatic anomaly detection work?",
    answer:
      "Eesee Metrics builds a baseline of your site's normal traffic patterns over time. When current traffic deviates significantly from that baseline — either up or down — an anomaly is flagged. The system accounts for time-of-day and day-of-week patterns to minimise false positives.",
  },
  {
    question: "How quickly are alerts sent?",
    answer:
      "Anomalies are typically detected and alerted within minutes of the deviation occurring.",
  },
  {
    question: "Can I set up alerts for specific pages or events?",
    answer:
      "Yes. In addition to site-wide anomaly detection, you can create custom alert rules targeting specific pages, referrers, or custom events with your own thresholds.",
  },
  {
    question: "What notification channels are supported?",
    answer:
      "Eesee Metrics supports Slack (via webhook), Discord (via webhook), email, and generic HTTP webhooks. You can configure multiple channels and send different alerts to different destinations.",
  },
  {
    question: "Can I silence alerts during maintenance windows?",
    answer:
      "Yes. You can pause alerts for individual sites from the notification settings. This prevents false alarms during planned deployments or maintenance.",
  },
];

export const relatedFeatures: RelatedFeature[] = [
  {
    title: "AI Reports",
    href: "/features/ai-reports",
    description: "Automated weekly and monthly reports delivered to your inbox.",
  },
  {
    title: "Uptime Monitoring",
    href: "/features/uptime-monitoring",
    description: "Know immediately when your site goes down.",
  },
  {
    title: "Web Analytics",
    href: "/features/web-analytics",
    description: "The real-time dashboard behind the anomaly detection.",
  },
  {
    title: "MCP Tools",
    href: "/features/mcp",
    description: "Ask your AI assistant about active alerts and recent anomalies.",
  },
];
