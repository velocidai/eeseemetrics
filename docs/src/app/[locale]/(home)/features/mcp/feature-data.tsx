import {
  BarChart3,
  Bot,
  BrainCircuit,
  Code,
  FileText,
  Layers,
  MessageSquare,
  Rocket,
  Search,
  Shield,
  Sparkles,
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
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Natural language queries",
    description:
      "Ask questions like 'how did my traffic change last week?' or 'which pages have the highest bounce rate?' and get instant, data-backed answers.",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "All 21 analytics tools on Pro",
    description:
      "Pro includes all 21 MCP tools: traffic overview, top pages, page stats, referrers, goals, campaigns, web vitals, alerts, AI reports, funnels, retention cohorts, sessions, errors, users, Search Console data, and more.",
  },
  {
    icon: <Layers className="w-5 h-5" />,
    title: "Higher rate limits on Scale",
    description:
      "Scale gets the same 21 tools as Pro, but with 200 req/min rate limits vs 60 req/min on Pro — built for high-frequency AI workflows and automated dashboards.",
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "AI Chat on Scale",
    description:
      "Scale includes AI Chat — a dedicated in-dashboard chat interface where you can ask questions about your data without leaving Eesee Metrics.",
  },
  {
    icon: <Code className="w-5 h-5" />,
    title: "Works with Claude, Cursor & more",
    description:
      "Compatible with any MCP-capable AI assistant. Claude Desktop, Cursor, and other tools that support the Model Context Protocol can connect directly.",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Per-site token scoping",
    description:
      "Each MCP token is scoped to a single site. Your AI assistant can only access the data you explicitly grant — nothing else.",
  },
];

export const howItWorks: HowItWorksStep[] = [
  {
    step: 1,
    title: "Create an MCP token",
    description:
      "In Settings → Account, create a new MCP token and select which site it should have access to. Copy the token — you'll only see it once.",
  },
  {
    step: 2,
    title: "Add the config to your AI client",
    description:
      "Paste the generated config snippet into your Claude Desktop or Cursor MCP settings. Eesee Metrics shows you the exact JSON to copy — no manual configuration needed.",
  },
  {
    step: 3,
    title: "Your AI assistant connects",
    description:
      "Your AI client connects to the Eesee Metrics MCP server using your token. It can now call analytics tools on your behalf whenever you ask analytics-related questions.",
  },
  {
    step: 4,
    title: "Ask questions in plain English",
    description:
      "Chat with your AI assistant as normal. Ask about traffic, conversions, top pages, anomalies, or campaign performance — the AI pulls live data from your site to answer.",
  },
];

export const whoUses: WhoUsesItem[] = [
  {
    icon: <BrainCircuit className="w-6 h-6" />,
    title: "AI-native founders",
    description:
      "Already living inside Claude or Cursor? Query your analytics without switching context. Your AI assistant becomes your analytics co-pilot.",
  },
  {
    icon: <Code className="w-6 h-6" />,
    title: "Developers",
    description:
      "Ask about site performance while you're already debugging in Cursor. Correlate deployment times with traffic changes without leaving your IDE.",
  },
  {
    icon: <Rocket className="w-6 h-6" />,
    title: "Growth teams",
    description:
      "Use AI assistants to analyse campaign performance, spot opportunities, and draft growth hypotheses backed by your actual data — not general guesses.",
  },
  {
    icon: <Bot className="w-6 h-6" />,
    title: "Teams building AI workflows",
    description:
      "Plug Eesee Metrics analytics data into automated AI workflows. Let agents query site performance as part of broader content or marketing automation pipelines.",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Content creators",
    description:
      "Ask Claude which posts are driving the most traffic, which referrers are growing, and what topics your audience engages with most — then generate content briefs.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Non-technical stakeholders",
    description:
      "Team members who don't navigate analytics dashboards can ask plain-English questions and get clear answers without learning a new tool.",
  },
];

export const faqItems: FAQItem[] = [
  {
    question: "What is MCP?",
    answer:
      "MCP (Model Context Protocol) is an open standard that allows AI assistants to connect to external data sources and tools. When your AI client supports MCP, it can call tools on your behalf — like querying your analytics data — in response to natural language questions.",
  },
  {
    question: "What plans include MCP tools?",
    answer:
      "Pro and Scale both include all 21 MCP tools. Scale adds higher rate limits (200 req/min vs 60 req/min on Pro) and AI Chat. Starter does not include MCP access.",
  },
  {
    question: "Which AI clients support MCP?",
    answer:
      "Claude Desktop (Anthropic) and Cursor currently have the best MCP support. The ecosystem is growing — any client that implements the Model Context Protocol can connect to Eesee Metrics.",
  },
  {
    question: "Is the connection secure?",
    answer:
      "Yes. MCP tokens are scoped to a single site and grant read-only access. They use Bearer token authentication over HTTPS. You can revoke any token at any time from Settings → Account.",
  },
  {
    question: "What is the difference between MCP tools and AI Chat?",
    answer:
      "MCP tools connect your external AI assistant (Claude Desktop, Cursor, etc.) to your Eesee Metrics data. AI Chat is a built-in chat interface inside the Eesee Metrics dashboard itself, available on Scale. Both let you ask questions in natural language — MCP from your AI client, AI Chat from within the app.",
  },
  {
    question: "What tools are available on Pro vs Scale?",
    answer:
      "Pro and Scale both include all 21 tools: traffic overview, top pages, page stats, referrers, active alerts, latest AI report, goals, campaigns, web vitals, countries, devices, events, users list, user profile, retention cohorts, funnels, errors, sessions list, period comparisons, full report history, and Search Console data. Scale gets the same tools at higher rate limits (200 req/min vs Pro's 60 req/min).",
  },
  {
    question: "Can I use MCP tools with multiple sites?",
    answer:
      "Each MCP token is scoped to a single site. To query multiple sites, create a separate token for each site and configure them as separate MCP servers in your AI client.",
  },
];

export const relatedFeatures: RelatedFeature[] = [
  {
    title: "AI Reports",
    href: "/features/ai-reports",
    description: "Automated weekly and monthly reports you can query via MCP.",
  },
  {
    title: "Anomaly Alerts",
    href: "/features/alerts",
    description: "Ask your AI assistant about active alerts and recent anomalies.",
  },
  {
    title: "Web Analytics",
    href: "/features/web-analytics",
    description: "The core data that MCP tools query on your behalf.",
  },
  {
    title: "Search Console",
    href: "/features/search-console",
    description: "Scale's MCP includes a Search Console data tool.",
  },
];
