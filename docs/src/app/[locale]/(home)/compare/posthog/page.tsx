import { ComparisonPage } from "../components/ComparisonPage";
import { posthogComparisonData, posthogExtendedData } from "./comparison-data";
import type { Metadata } from "next";
import { createOGImageUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Eesee Metrics vs PostHog: Simple Analytics Alternative",
  description:
    "Compare Eesee Metrics and PostHog. See why Eesee Metrics' focused web analytics beats PostHog's complex product suite for teams wanting simplicity without sacrificing power.",
  openGraph: {
    title: "Eesee Metrics vs PostHog: Focused Analytics vs Feature Bloat",
    description: "PostHog does everything. Eesee Metrics does web analytics perfectly. Compare the approaches.",
    type: "website",
    url: "https://eeseemetrics.com/compare/posthog",
    images: [createOGImageUrl("Eesee Metrics vs PostHog: Focused Analytics vs Feature Bloat", "PostHog does everything. Eesee Metrics does web analytics perfectly. Compare the approaches.", "Compare")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eesee Metrics vs PostHog Comparison",
    description: "Focused web analytics vs all-in-one platform. Which approach fits your needs?",
    images: [createOGImageUrl("Eesee Metrics vs PostHog Comparison", "Focused web analytics vs all-in-one platform. Which approach fits your needs?", "Compare")],
  },
  alternates: {
    canonical: "https://eeseemetrics.com/compare/posthog",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://eeseemetrics.com/compare/posthog",
      name: "Eesee Metrics vs PostHog Comparison",
      description: "Compare Eesee Metrics and PostHog. Eesee Metrics is focused web analytics — cookieless, GDPR-native, with AI reports and MCP tools. PostHog is a broader product suite with more complexity.",
      url: "https://eeseemetrics.com/compare/posthog",
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
          name: "How is Eesee Metrics different from PostHog?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Eesee Metrics focuses exclusively on web analytics with a clean, simple interface. PostHog is an all-in-one product suite with analytics, feature flags, A/B testing, surveys, and more. if you primarily need web analytics, Eesee Metrics delivers a faster, simpler experience.",
          },
        },
        {
          "@type": "Question",
          name: "Is Eesee Metrics really simpler than PostHog?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Eesee Metrics provides a single-page dashboard where all essential metrics are visible at a glance. PostHog's extensive feature set means more menus, more configuration, and a steeper learning curve, especially for non-technical team members.",
          },
        },
        {
          "@type": "Question",
          name: "Does PostHog have features Eesee Metrics doesn't?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, PostHog offers feature flags, A/B testing, surveys, heatmaps, and a SQL query interface that Eesee Metrics doesn't have. These are powerful tools for product teams, but they add complexity. Eesee Metrics intentionally focuses on doing web analytics well.",
          },
        },
        {
          "@type": "Question",
          name: "How does hosting compare?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Eesee Metrics is a fully managed cloud service — no infrastructure to set up or maintain. PostHog's self-hosted version requires significantly more infrastructure (Kafka, Redis, PostgreSQL, ClickHouse, and more) and is much harder to maintain.",
          },
        },
        {
          "@type": "Question",
          name: "How easy is it to migrate to Eesee Metrics?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Just add Eesee Metrics' tracking script to your site and data starts flowing immediately. You can run both tools in parallel during the transition. Since Eesee Metrics uses a different data model, historical PostHog data won't transfer, but new data collection begins instantly.",
          },
        },
      ],
    },
  ],
};

export default function PostHog() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ComparisonPage
        competitorName="PostHog"
        sections={posthogComparisonData}
        subtitle={posthogExtendedData.subtitle}
        introHeading={posthogExtendedData.introHeading}
        introParagraphs={posthogExtendedData.introParagraphs}
        chooseEeseeMetrics={posthogExtendedData.chooseEeseeMetrics}
        chooseCompetitor={posthogExtendedData.chooseCompetitor}
        eeseemetricsPricing={posthogExtendedData.eeseemetricsPricing}
        competitorPricing={posthogExtendedData.competitorPricing}
        faqItems={posthogExtendedData.faqItems}
        relatedResources={posthogExtendedData.relatedResources}
      />
    </>
  );
}
