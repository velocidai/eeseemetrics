import { ComparisonPage } from "../components/ComparisonPage";
import { fathomComparisonData, fathomExtendedData } from "./comparison-data";
import type { Metadata } from "next";
import { createOGImageUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Eesee Metrics vs Fathom: Privacy Analytics Comparison",
  description:
    "Compare Eesee Metrics and Fathom analytics. Both prioritize privacy, but Eesee Metrics offers more features like session replay, funnels, AI reports, and MCP tools.",
  openGraph: {
    title: "Eesee Metrics vs Fathom: More Features, Same Privacy Focus",
    description: "Fathom is simple. Eesee Metrics is simple AND powerful. Compare session replay, funnels, and more.",
    type: "website",
    url: "https://eeseemetrics.com/compare/fathom",
    images: [createOGImageUrl("Eesee Metrics vs Fathom: More Features, Same Privacy Focus", "Fathom is simple. Eesee Metrics is simple AND powerful. Compare session replay, funnels, and more.", "Compare")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eesee Metrics vs Fathom Analytics",
    description: "Privacy-first analytics compared. See which offers more value.",
    images: [createOGImageUrl("Eesee Metrics vs Fathom Analytics", "Privacy-first analytics compared. See which offers more value.", "Compare")],
  },
  alternates: {
    canonical: "https://eeseemetrics.com/compare/fathom",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://eeseemetrics.com/compare/fathom",
      name: "Eesee Metrics vs Fathom Comparison",
      description: "Compare Eesee Metrics and Fathom. Both are privacy-first, but Eesee Metrics adds session replay, funnels, user journeys, AI reports, and uptime monitoring at competitive pricing.",
      url: "https://eeseemetrics.com/compare/fathom",
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
          name: "Is Eesee Metrics privacy-first like Fathom?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Both Eesee Metrics and Fathom are privacy-first and cookie-free. Eesee Metrics is a managed cloud service. All data is stored on EU infrastructure and never shared with third parties.",
          },
        },
        {
          "@type": "Question",
          name: "What features does Eesee Metrics have that Fathom doesn't?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Eesee Metrics includes session replay, funnel analysis, user journey visualization (Sankey diagrams), Web Vitals monitoring, error tracking, user profiles, and sessions tracking. Fathom focuses on basic pageview and conversion analytics.",
          },
        },
        {
          "@type": "Question",
          name: "How does pricing compare between Eesee Metrics and Fathom?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Eesee Metrics starts at $19/month with events-based pricing and a 7-day free trial. Fathom starts at $15/month with pageview-based pricing. Eesee Metrics includes significantly more features at a comparable price point, including session replay, funnels, and error tracking.",
          },
        },
        {
          "@type": "Question",
          name: "Does Eesee Metrics have a free trial like I can with other tools?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, Eesee Metrics is a fully managed cloud service hosted in the EU. You get complete data ownership without infrastructure management.",
          },
        },
        {
          "@type": "Question",
          name: "Is it easy to switch to Eesee Metrics from Fathom?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Just add Eesee Metrics' tracking script to your site and data starts collecting immediately. You can run both in parallel during the transition. The setup takes less than 5 minutes.",
          },
        },
      ],
    },
  ],
};

export default function Fathom() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ComparisonPage
        competitorName="Fathom"
        sections={fathomComparisonData}
        subtitle={fathomExtendedData.subtitle}
        introHeading={fathomExtendedData.introHeading}
        introParagraphs={fathomExtendedData.introParagraphs}
        chooseEeseeMetrics={fathomExtendedData.chooseEeseeMetrics}
        chooseCompetitor={fathomExtendedData.chooseCompetitor}
        eeseemetricsPricing={fathomExtendedData.eeseemetricsPricing}
        competitorPricing={fathomExtendedData.competitorPricing}
        faqItems={fathomExtendedData.faqItems}
        relatedResources={fathomExtendedData.relatedResources}
      />
    </>
  );
}
