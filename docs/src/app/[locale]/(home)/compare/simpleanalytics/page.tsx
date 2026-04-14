import { ComparisonPage } from "../components/ComparisonPage";
import { simpleAnalyticsComparisonData, simpleAnalyticsExtendedData } from "./comparison-data";
import type { Metadata } from "next";
import { createOGImageUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Eesee Metrics vs Simple Analytics: Feature-Rich Alternative",
  description:
    "Compare Eesee Metrics and Simple Analytics. Both are privacy-focused, but Eesee Metrics offers more advanced features like session replay, funnels, and user journeys.",
  openGraph: {
    title: "Eesee Metrics vs Simple Analytics: Simple AND Powerful",
    description: "Simple Analytics keeps it basic. Eesee Metrics adds power without complexity. Compare features.",
    type: "website",
    url: "https://eeseemetrics.com/compare/simpleanalytics",
    images: [createOGImageUrl("Eesee Metrics vs Simple Analytics: Simple AND Powerful", "Simple Analytics keeps it basic. Eesee Metrics adds power without complexity. Compare features.", "Compare")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eesee Metrics vs Simple Analytics",
    description: "Privacy-first analytics compared. See which offers the best value.",
    images: [createOGImageUrl("Eesee Metrics vs Simple Analytics", "Privacy-first analytics compared. See which offers the best value.", "Compare")],
  },
  alternates: {
    canonical: "https://eeseemetrics.com/compare/simpleanalytics",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://eeseemetrics.com/compare/simpleanalytics",
      name: "Eesee Metrics vs Simple Analytics Comparison",
      description: "Compare Eesee Metrics and Simple Analytics. Simple Analytics is minimal and cloud-only. Eesee Metrics adds session replay, funnels, AI reports, MCP tools, and self-hosting.",
      url: "https://eeseemetrics.com/compare/simpleanalytics",
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
          name: "Is Eesee Metrics privacy-first like Simple Analytics?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Both Eesee Metrics and Simple Analytics are privacy-first and cookie-free. Eesee Metrics is a managed cloud service with EU data storage, no personal data collection, and no consent banners required.",
          },
        },
        {
          "@type": "Question",
          name: "What features does Eesee Metrics have that Simple Analytics doesn't?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Eesee Metrics includes session replay, funnel analysis, user journey visualization (Sankey diagrams), Web Vitals monitoring, error tracking, user profiles, city-level geolocation, and organization support. Simple Analytics focuses on simpler metrics with an AI assistant.",
          },
        },
        {
          "@type": "Question",
          name: "How does geolocation differ between the two?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Eesee Metrics provides city-level geolocation data, giving you more granular insights into where your visitors are. Simple Analytics only offers country-level data, which limits your ability to understand regional traffic patterns.",
          },
        },
        {
          "@type": "Question",
          name: "Are both equally private?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Both are privacy-first and cookie-free with EU data storage. Eesee Metrics adds a daily rotating salt option for extra privacy, ensuring visitor IDs can't be tracked across days. Both are GDPR compliant without requiring consent banners.",
          },
        },
        {
          "@type": "Question",
          name: "How easy is it to switch from Simple Analytics to Eesee Metrics easily?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Add Eesee Metrics' tracking script to your site and data collection begins immediately. You can run both tools in parallel during the transition. Setup takes less than 5 minutes.",
          },
        },
      ],
    },
  ],
};

export default function SimpleAnalytics() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ComparisonPage
        competitorName="Simple Analytics"
        sections={simpleAnalyticsComparisonData}
        subtitle={simpleAnalyticsExtendedData.subtitle}
        introHeading={simpleAnalyticsExtendedData.introHeading}
        introParagraphs={simpleAnalyticsExtendedData.introParagraphs}
        chooseEeseeMetrics={simpleAnalyticsExtendedData.chooseEeseeMetrics}
        chooseCompetitor={simpleAnalyticsExtendedData.chooseCompetitor}
        eeseemetricsPricing={simpleAnalyticsExtendedData.eeseemetricsPricing}
        competitorPricing={simpleAnalyticsExtendedData.competitorPricing}
        faqItems={simpleAnalyticsExtendedData.faqItems}
        relatedResources={simpleAnalyticsExtendedData.relatedResources}
      />
    </>
  );
}
