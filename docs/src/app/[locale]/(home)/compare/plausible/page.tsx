import { ComparisonPage } from "../components/ComparisonPage";
import { plausibleComparisonData, plausibleExtendedData } from "./comparison-data";
import type { Metadata } from "next";
import { createOGImageUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Eesee Metrics vs Plausible: More Features, Same Privacy",
  description:
    "Compare Eesee Metrics and Plausible analytics. Both are privacy-first, but Eesee Metrics offers more features like session replay, funnels, and user journeys at competitive pricing.",
  openGraph: {
    title: "Eesee Metrics vs Plausible: Which Privacy-First Analytics Wins?",
    description: "Both respect privacy, but Eesee Metrics offers more power. Compare session replay, funnels, and pricing.",
    type: "website",
    url: "https://eeseemetrics.com/compare/plausible",
    images: [createOGImageUrl("Eesee Metrics vs Plausible: Which Privacy-First Analytics Wins?", "Both respect privacy, but Eesee Metrics offers more power. Compare session replay, funnels, and pricing.", "Compare")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eesee Metrics vs Plausible Comparison",
    description: "Privacy-first analytics showdown. See which platform offers more value.",
    images: [createOGImageUrl("Eesee Metrics vs Plausible Comparison", "Privacy-first analytics showdown. See which platform offers more value.", "Compare")],
  },
  alternates: {
    canonical: "https://eeseemetrics.com/compare/plausible",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://eeseemetrics.com/compare/plausible",
      name: "Eesee Metrics vs Plausible Comparison",
      description: "Compare Eesee Metrics and Plausible. Both are privacy-first, but Eesee Metrics adds session replay, funnels, AI reports, and MCP tools that Plausible doesn't offer.",
      url: "https://eeseemetrics.com/compare/plausible",
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
          name: "How does Eesee Metrics compare to Plausible?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Both Eesee Metrics and Plausible are privacy-first analytics platforms, but Eesee Metrics offers more advanced features like session replay, funnels, user journeys, and error tracking while maintaining simplicity.",
          },
        },
        {
          "@type": "Question",
          name: "Does Eesee Metrics have features Plausible doesn't?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Eesee Metrics includes session replay, funnel analysis, user journey visualization (Sankey diagrams), Web Vitals monitoring, error tracking, and public dashboards that Plausible doesn't offer.",
          },
        },
        {
          "@type": "Question",
          name: "Which is more affordable, Eesee Metrics or Plausible?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Plausible starts at $9/month for 10k pageviews, while Eesee Metrics starts at $19/month for events-based pricing. Eesee Metrics includes more features at each price point, including session replay, funnels, and error tracking.",
          },
        },
        {
          "@type": "Question",
          name: "Does Eesee Metrics have a free trial like Plausible?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, Eesee Metrics is a fully managed cloud service hosted in the EU. You get complete data ownership without infrastructure management.",
          },
        },
        {
          "@type": "Question",
          name: "Does Eesee Metrics have session replay?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, session replay is one of the biggest differentiators. Eesee Metrics offers session replay on the Pro plan, allowing you to watch how users interact with your site. Plausible does not offer this feature at any price point.",
          },
        },
      ],
    },
  ],
};

export default function Plausible() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ComparisonPage
        competitorName="Plausible"
        sections={plausibleComparisonData}
        subtitle={plausibleExtendedData.subtitle}
        introHeading={plausibleExtendedData.introHeading}
        introParagraphs={plausibleExtendedData.introParagraphs}
        chooseEeseeMetrics={plausibleExtendedData.chooseEeseeMetrics}
        chooseCompetitor={plausibleExtendedData.chooseCompetitor}
        eeseemetricsPricing={plausibleExtendedData.eeseemetricsPricing}
        competitorPricing={plausibleExtendedData.competitorPricing}
        faqItems={plausibleExtendedData.faqItems}
        relatedResources={plausibleExtendedData.relatedResources}
      />
    </>
  );
}
