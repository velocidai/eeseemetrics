import { ComparisonPage } from "../components/ComparisonPage";
import { rybbitComparisonData, rybbitExtendedData } from "./comparison-data";
import type { Metadata } from "next";
import { createOGImageUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Eesee Metrics vs Rybbit: Privacy Analytics with AI-Powered Insights",
  description:
    "Compare Eesee Metrics and Rybbit analytics. Both are privacy-first with no cookies — but Eesee Metrics adds AI reports, MCP tools, and anomaly alerts that Rybbit doesn't offer.",
  openGraph: {
    title: "Eesee Metrics vs Rybbit: Which Privacy-First Analytics Tool Is Right for You?",
    description: "Same privacy-first foundation, very different feature sets. See how Eesee Metrics' AI-powered insights compare to Rybbit.",
    type: "website",
    url: "https://eeseemetrics.com/compare/rybbit",
    images: [createOGImageUrl("Eesee Metrics vs Rybbit: Which Privacy-First Analytics Tool Is Right for You?", "Same privacy-first foundation, very different feature sets. See how Eesee Metrics' AI-powered insights compare to Rybbit.", "Compare")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eesee Metrics vs Rybbit Comparison",
    description: "Compare Eesee Metrics and Rybbit: privacy-first analytics vs AI-powered insights platform.",
    images: [createOGImageUrl("Eesee Metrics vs Rybbit Comparison", "Compare Eesee Metrics and Rybbit: privacy-first analytics vs AI-powered insights platform.", "Compare")],
  },
  alternates: {
    canonical: "https://eeseemetrics.com/compare/rybbit",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://eeseemetrics.com/compare/rybbit",
      name: "Eesee Metrics vs Rybbit Comparison",
      description: "Compare Eesee Metrics and Rybbit. Both are open-source, AGPL-3.0, self-hostable, and privacy-first. Eesee Metrics adds AI reports, anomaly detection, and an MCP server that Rybbit doesn't offer.",
      url: "https://eeseemetrics.com/compare/rybbit",
      isPartOf: {
        "@type": "WebSite",
        name: "Eesee Metrics",
        url: "https://eeseemetrics.com",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How is Eesee Metrics different from Rybbit?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Both are privacy-first, open-source (AGPL 3.0) analytics tools with similar core feature sets. The main differences: Eesee Metrics adds AI-powered reports, AI Chat for natural-language data queries, MCP tools for AI assistants, and anomaly alerts — none of which Rybbit offers. Both support self-hosting via Docker.",
          },
        },
        {
          "@type": "Question",
          name: "Is Rybbit cheaper than Eesee Metrics?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Rybbit's entry price ($13/mo Standard) is lower, but the Standard plan does not include session replay. If you need session replay, Rybbit requires their $26/mo Pro plan. Eesee Metrics includes session replay from $19/mo — making it the better value if session replay is on your list.",
          },
        },
        {
          "@type": "Question",
          name: "Can I self-host Eesee Metrics like Rybbit?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Eesee Metrics is open-source (AGPL 3.0) and fully self-hostable via Docker — just like Rybbit. You can run it on your own infrastructure for free. The cloud-hosted version at eeseemetrics.com adds managed uptime, automatic updates, and dedicated support.",
          },
        },
        {
          "@type": "Question",
          name: "What AI features does Eesee Metrics have that Rybbit doesn't?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Eesee Metrics Pro includes AI-powered weekly and monthly reports that automatically surface trends, anomalies, and opportunities in plain English. Scale adds AI Chat, which lets you ask questions about your analytics data in natural language — directly inside Claude, ChatGPT, or any MCP-compatible AI assistant. Rybbit has no AI features.",
          },
        },
        {
          "@type": "Question",
          name: "Can I migrate from Rybbit to Eesee Metrics?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Add Eesee Metrics' tracking script to your site and data starts flowing immediately. You can run both in parallel during the transition. Historical Rybbit data won't transfer, but new data collection begins within minutes.",
          },
        },
      ],
    },
  ],
};

export default function Rybbit() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ComparisonPage
        competitorName="Rybbit"
        sections={rybbitComparisonData}
        subtitle={rybbitExtendedData.subtitle}
        introHeading={rybbitExtendedData.introHeading}
        introParagraphs={rybbitExtendedData.introParagraphs}
        chooseEeseeMetrics={rybbitExtendedData.chooseEeseeMetrics}
        chooseCompetitor={rybbitExtendedData.chooseCompetitor}
        eeseemetricsPricing={rybbitExtendedData.eeseemetricsPricing}
        competitorPricing={rybbitExtendedData.competitorPricing}
        faqItems={rybbitExtendedData.faqItems}
        relatedResources={rybbitExtendedData.relatedResources}
      />
    </>
  );
}
