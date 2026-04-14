import { ComparisonPage } from "../components/ComparisonPage";
import { umamiComparisonData, umamiExtendedData } from "./comparison-data";
import type { Metadata } from "next";
import { createOGImageUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Eesee Metrics vs Umami: Privacy-First Analytics Comparison",
  description:
    "Compare Eesee Metrics and Umami analytics. Both are privacy-focused, but Eesee Metrics offers advanced features like session replay, AI reports, funnels, and a fully managed cloud service.",
  openGraph: {
    title: "Eesee Metrics vs Umami: Analytics Feature Comparison",
    description: "Compare features, pricing, and capabilities between Eesee Metrics and Umami analytics.",
    type: "website",
    url: "https://eeseemetrics.com/compare/umami",
    images: [createOGImageUrl("Eesee Metrics vs Umami: Analytics Feature Comparison", "Compare features, pricing, and capabilities between Eesee Metrics and Umami analytics.", "Compare")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eesee Metrics vs Umami Comparison",
    description: "Compare privacy-first analytics: Eesee Metrics vs Umami. See features, pricing, and more.",
    images: [createOGImageUrl("Eesee Metrics vs Umami Comparison", "Compare privacy-first analytics: Eesee Metrics vs Umami. See features, pricing, and more.", "Compare")],
  },
  alternates: {
    canonical: "https://eeseemetrics.com/compare/umami",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://eeseemetrics.com/compare/umami",
      name: "Eesee Metrics vs Umami Comparison",
      description: "Compare Eesee Metrics and Umami. Both are open-source and self-hostable, but Eesee Metrics adds AI reports, anomaly detection, session replay, error tracking, and MCP tools.",
      url: "https://eeseemetrics.com/compare/umami",
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
          name: "How is Eesee Metrics different from Umami?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Both prioritise privacy and simplicity, but Eesee Metrics includes advanced features Umami lacks: session replay, error tracking, Web Vitals monitoring, real-time globe view, and organization support. Eesee Metrics also uses ClickHouse for better performance at scale.",
          },
        },
        {
          "@type": "Question",
          name: "How easy is it to migrate to Eesee Metrics?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Just add Eesee Metrics' tracking script to your site and data starts flowing immediately. You can run both tools in parallel during the transition. Historical Umami data won't transfer, but new data collection begins instantly.",
          },
        },
        {
          "@type": "Question",
          name: "Is Umami self-hostable while Eesee Metrics is cloud-only?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Umami is open-source and can be self-hosted. Eesee Metrics is a fully managed cloud service, which means no server management, automatic updates, and a 7-day free trial. If you want managed infrastructure with a dedicated support team, Eesee Metrics is the better choice.",
          },
        },
        {
          "@type": "Question",
          name: "Does Eesee Metrics have a larger script than Umami?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, Eesee Metrics' tracking script is 18KB compared to Umami's 2KB. The additional size enables features like session replay, error tracking, and Web Vitals monitoring. Both are small enough to have negligible impact on page load.",
          },
        },
        {
          "@type": "Question",
          name: "Are both GDPR compliant?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Both Eesee Metrics and Umami are cookie-free and don't collect personal data. Eesee Metrics adds an extra privacy option with daily rotating salt for user ID hashing, ensuring visitors can't be tracked across days.",
          },
        },
      ],
    },
  ],
};

export default function Umami() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ComparisonPage
        competitorName="Umami"
        sections={umamiComparisonData}
        subtitle={umamiExtendedData.subtitle}
        introHeading={umamiExtendedData.introHeading}
        introParagraphs={umamiExtendedData.introParagraphs}
        chooseEeseeMetrics={umamiExtendedData.chooseEeseeMetrics}
        chooseCompetitor={umamiExtendedData.chooseCompetitor}
        eeseemetricsPricing={umamiExtendedData.eeseemetricsPricing}
        competitorPricing={umamiExtendedData.competitorPricing}
        faqItems={umamiExtendedData.faqItems}
        relatedResources={umamiExtendedData.relatedResources}
      />
    </>
  );
}
