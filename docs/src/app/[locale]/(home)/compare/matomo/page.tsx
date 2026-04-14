import { ComparisonPage } from "../components/ComparisonPage";
import { matomoComparisonData, matomoExtendedData } from "./comparison-data";
import type { Metadata } from "next";
import { createOGImageUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Eesee Metrics vs Matomo: Modern Analytics Alternative",
  description:
    "Compare Eesee Metrics and Matomo analytics. See how Eesee Metrics offers simpler setup, modern UI, privacy by default, and zero maintenance vs Matomo's complex PHP-based system.",
  openGraph: {
    title: "Eesee Metrics vs Matomo: Which Analytics Platform is Right for You?",
    description: "Side-by-side comparison of Eesee Metrics and Matomo. Modern, privacy-first analytics vs legacy PHP system.",
    type: "website",
    url: "https://eeseemetrics.com/compare/matomo",
    images: [createOGImageUrl("Eesee Metrics vs Matomo: Which Analytics Platform is Right for You?", "Side-by-side comparison of Eesee Metrics and Matomo. Modern, privacy-first analytics vs legacy PHP system.", "Compare")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eesee Metrics vs Matomo Comparison",
    description: "Compare Eesee Metrics and Matomo analytics. See which platform fits your needs.",
    images: [createOGImageUrl("Eesee Metrics vs Matomo Comparison", "Compare Eesee Metrics and Matomo analytics. See which platform fits your needs.", "Compare")],
  },
  alternates: {
    canonical: "https://eeseemetrics.com/compare/matomo",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://eeseemetrics.com/compare/matomo",
      name: "Eesee Metrics vs Matomo Comparison",
      description: "Compare Eesee Metrics and Matomo. Eesee Metrics is cookieless by default, modern tech stack, with AI reports and MCP tools. Matomo is a legacy PHP platform that still uses cookies.",
      url: "https://eeseemetrics.com/compare/matomo",
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
          name: "Is Eesee Metrics really simpler than Matomo?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Matomo has 70+ reports across 12 sections, inheriting Google Analytics-style complexity. Eesee Metrics shows all essential metrics on a single intuitive dashboard. Your team can start using Eesee Metrics immediately without training.",
          },
        },
        {
          "@type": "Question",
          name: "Does Eesee Metrics require cookies like Matomo?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Eesee Metrics is cookie-free by default and never requires consent banners. Matomo uses cookies by default and requires configuration to achieve cookieless tracking, which can reduce its accuracy.",
          },
        },
        {
          "@type": "Question",
          name: "How does hosting compare?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Eesee Metrics is a fully managed cloud service — no servers, no updates, no maintenance required. Matomo is available as a self-hosted open-source product (free) or as a paid cloud service. If you're currently self-hosting Matomo and want to eliminate that overhead, Eesee Metrics is the simpler path.",
          },
        },
        {
          "@type": "Question",
          name: "How easy is it to migrate to Eesee Metrics?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Add Eesee Metrics' tracking script to your site and data starts flowing immediately. You can run both tools in parallel during the transition. Eesee Metrics's simpler setup means you'll be collecting data within minutes.",
          },
        },
        {
          "@type": "Question",
          name: "Does Matomo have features Eesee Metrics doesn't?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, Matomo offers heatmaps, A/B testing, form analytics, and a custom report builder that Eesee Metrics doesn't have. However, many of these require paid plugins. Eesee Metrics focuses on delivering the analytics features most teams actually need, with a much simpler experience.",
          },
        },
      ],
    },
  ],
};

export default function Matomo() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ComparisonPage
        competitorName="Matomo"
        sections={matomoComparisonData}
        subtitle={matomoExtendedData.subtitle}
        introHeading={matomoExtendedData.introHeading}
        introParagraphs={matomoExtendedData.introParagraphs}
        chooseEeseeMetrics={matomoExtendedData.chooseEeseeMetrics}
        chooseCompetitor={matomoExtendedData.chooseCompetitor}
        eeseemetricsPricing={matomoExtendedData.eeseemetricsPricing}
        competitorPricing={matomoExtendedData.competitorPricing}
        faqItems={matomoExtendedData.faqItems}
        relatedResources={matomoExtendedData.relatedResources}
      />
    </>
  );
}
