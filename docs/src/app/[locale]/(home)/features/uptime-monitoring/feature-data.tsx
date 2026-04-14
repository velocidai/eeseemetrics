import {
  Bell,
  CheckCircle,
  Clock,
  Globe,
  History,
  MessageSquare,
  Server,
  Shield,
  Sliders,
  Wifi,
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
    icon: <Globe className="w-5 h-5" />,
    title: "HTTP & HTTPS monitoring",
    description:
      "Monitor any URL for uptime, response time, and status codes. Check landing pages, API endpoints, or checkout flows — anything with a URL.",
  },
  {
    icon: <Server className="w-5 h-5" />,
    title: "TCP port monitoring",
    description:
      "Monitor TCP ports directly for non-HTTP services — databases, mail servers, custom services. Get alerted the moment a port goes unreachable.",
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: "Custom check intervals",
    description:
      "Set check frequency to match your needs — from every minute to every hour. Critical systems can be monitored more aggressively.",
  },
  {
    icon: <CheckCircle className="w-5 h-5" />,
    title: "Validation rules",
    description:
      "Go beyond simple up/down checks. Validate response status codes, body content, and headers to confirm your site is actually working — not just responding.",
  },
  {
    icon: <History className="w-5 h-5" />,
    title: "Uptime percentage & incident history",
    description:
      "Track uptime percentages over 24h, 7d, and 30d windows. Full incident history shows when outages started, how long they lasted, and when they resolved.",
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: "Slack, Discord & email alerts",
    description:
      "Get notified immediately when a monitor goes down — and when it recovers. Send alerts to Slack channels, Discord servers, or email addresses.",
  },
  {
    icon: <Sliders className="w-5 h-5" />,
    title: "Multiple monitors per site",
    description:
      "Add as many monitors as you need — homepage, checkout, API health endpoint, admin panel. Monitor every critical path independently.",
  },
];

export const howItWorks: HowItWorksStep[] = [
  {
    step: 1,
    title: "Add a monitor",
    description:
      "Enter the URL or TCP host you want to monitor, set the check interval, and configure any validation rules. The monitor is active within seconds.",
  },
  {
    step: 2,
    title: "Checks run on schedule",
    description:
      "Eesee Metrics sends requests to your endpoint at the interval you configured. Each check records the response time, status, and whether validation rules passed.",
  },
  {
    step: 3,
    title: "Incidents are detected automatically",
    description:
      "When a check fails, an incident is opened. You're alerted via your configured channels — Slack, Discord, or email — immediately.",
  },
  {
    step: 4,
    title: "Recovery is confirmed and reported",
    description:
      "When your site comes back up, the incident is closed and you're notified of recovery. The full incident duration is recorded in your history.",
  },
];

export const whoUses: WhoUsesItem[] = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Developers & DevOps",
    description:
      "Know before your users do when something breaks. Get paged the moment a deployment takes down a critical endpoint.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "SaaS founders",
    description:
      "Protect your reputation by catching outages before customers notice. Uptime history gives you data for status page updates and SLA reporting.",
  },
  {
    icon: <Wifi className="w-6 h-6" />,
    title: "E-commerce teams",
    description:
      "Monitor your checkout flow, payment API, and product pages independently. A down checkout is lost revenue — know immediately.",
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Agencies",
    description:
      "Monitor all client sites from one account. Impress clients with proactive incident response instead of waiting for them to report problems.",
  },
];

export const faqItems: FAQItem[] = [
  {
    question: "What plans include uptime monitoring?",
    answer:
      "Uptime monitoring is available on all plans, including Starter.",
  },
  {
    question: "How often can monitors check my site?",
    answer:
      "Check intervals are configurable. You can monitor as frequently as every minute or as infrequently as every hour, depending on how critical the endpoint is.",
  },
  {
    question: "What can I validate in each check?",
    answer:
      "You can validate HTTP status codes (e.g. must return 200), response body content (e.g. must contain specific text), and response headers. This lets you confirm your app is working correctly, not just that a server responded.",
  },
  {
    question: "What notification channels are supported?",
    answer:
      "Uptime monitoring supports Slack webhooks, Discord webhooks, and email notifications. You can configure multiple channels per monitor.",
  },
  {
    question: "How is uptime percentage calculated?",
    answer:
      "Uptime percentage is calculated as the ratio of successful checks to total checks within the selected window (24h, 7d, or 30d). A check is successful if it returns a valid response within the timeout and passes all validation rules.",
  },
  {
    question: "Can I monitor internal or private services?",
    answer:
      "Uptime monitoring checks are made from Eesee Metrics' servers, so the endpoint must be publicly reachable. For private services, you would need to expose an endpoint or use a VPN/tunnel.",
  },
];

export const relatedFeatures: RelatedFeature[] = [
  {
    title: "Anomaly Alerts",
    href: "/features/alerts",
    description: "Get notified when your analytics data shows unusual patterns.",
  },
  {
    title: "Web Analytics",
    href: "/features/web-analytics",
    description: "Correlate uptime incidents with traffic drops in your analytics.",
  },
  {
    title: "Error Tracking",
    href: "/features/error-tracking",
    description: "Catch JavaScript errors alongside server-side uptime issues.",
  },
  {
    title: "AI Reports",
    href: "/features/ai-reports",
    description: "Automated reports that contextualise performance alongside uptime.",
  },
];
