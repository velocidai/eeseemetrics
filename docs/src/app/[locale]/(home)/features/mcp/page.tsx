import { createOGImageUrl } from "@/lib/metadata";
import type { Metadata } from "next";
import { FeaturePage } from "../components/FeaturePage";
import { McpChatCard } from "@/components/Cards/McpChatCard";
import {
  capabilities,
  faqItems,
  howItWorks,
  relatedFeatures,
  whoUses,
} from "./feature-data";

export const metadata: Metadata = {
  title: "MCP Tools - Eesee Metrics | Analytics for AI Assistants",
  description:
    "Connect Claude, Cursor, and other AI assistants to your Eesee Metrics data via MCP. Ask questions about your analytics in plain English — right inside your AI client.",
  openGraph: {
    title: "MCP Tools - Eesee Metrics",
    description:
      "Query your analytics data from Claude, Cursor, and any MCP-compatible AI assistant.",
    type: "website",
    url: "https://eeseemetrics.com/features/mcp",
    images: [
      createOGImageUrl(
        "MCP Tools",
        "Query your analytics data from Claude, Cursor, and any MCP-compatible AI assistant.",
        "Features"
      ),
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MCP Tools - Eesee Metrics",
    description:
      "Query your analytics data from Claude, Cursor, and any MCP-compatible AI assistant.",
    images: [
      createOGImageUrl(
        "MCP Tools",
        "Query your analytics data from Claude, Cursor, and any MCP-compatible AI assistant.",
        "Features"
      ),
    ],
  },
  alternates: {
    canonical: "https://eeseemetrics.com/features/mcp",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://eeseemetrics.com/features/mcp",
      name: "Eesee Metrics MCP Tools",
      description:
        "Connect AI assistants like Claude and Cursor to your analytics data via the Model Context Protocol.",
      url: "https://eeseemetrics.com/features/mcp",
      isPartOf: {
        "@type": "WebSite",
        name: "Eesee Metrics",
        url: "https://eeseemetrics.com",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqItems.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ],
};

export default function McpPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <FeaturePage
        featureName="mcp"
        headline="Your analytics inside your AI assistant."
        subtitle="Connect Claude, Cursor, and any MCP-compatible AI client to your Eesee Metrics data. Ask questions about your traffic in plain English — without opening a dashboard."
        badgeText="MCP Tools"
        introParagraphs={[
          <>
            If you&apos;re already working inside Claude Desktop or Cursor, switching to a browser tab to check analytics breaks your flow.{" "}
            <strong className="text-neutral-900 dark:text-white">
              MCP Tools bring your analytics data directly into your AI client
            </strong>{" "}
            — so you can ask &ldquo;which pages drove the most traffic this week?&rdquo; or &ldquo;did my last deployment affect bounce rate?&rdquo; without leaving your workspace.
          </>,
          <>
            The Model Context Protocol (MCP) is an open standard for connecting AI assistants to external data sources. Eesee Metrics implements an MCP server that exposes your analytics as tools your AI client can call.{" "}
            <strong className="text-neutral-900 dark:text-white">
              Pro and Scale both include all 21 tools
            </strong>{" "}
            — traffic overview, top pages, referrers, goals, funnels, retention cohorts, session replay list, error analytics, period comparisons, full report history, Search Console data, and more.{" "}
            <strong className="text-neutral-900 dark:text-white">
              Scale gets higher rate limits
            </strong>{" "}
            — 200 req/min vs Pro&apos;s 60 req/min, built for high-frequency AI workflows.
          </>,
          <>
            Setup takes under two minutes: create a token in Settings, paste the generated config into your AI client, and start asking questions. Each token is{" "}
            <strong className="text-neutral-900 dark:text-white">
              scoped to a single site and grants read-only access
            </strong>{" "}
            — your AI assistant can only see the data you explicitly grant, and nothing else.
          </>,
        ]}
        featureCard={<McpChatCard />}
        capabilities={capabilities}
        howItWorks={howItWorks}
        whoUses={whoUses}
        faqItems={faqItems}
        relatedFeatures={relatedFeatures}
        ctaTitle="Query your analytics from your AI assistant"
        ctaDescription="Connect Claude, Cursor, or any MCP client to your Eesee Metrics data in under 2 minutes."
      />
    </>
  );
}
