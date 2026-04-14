import { ComparisonPage } from "../components/ComparisonPage";
import { googleAnalyticsComparisonData, googleAnalyticsExtendedData } from "./comparison-data";
import type { Metadata } from "next";
import { createOGImageUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Eesee Metrics vs Google Analytics: Best Privacy-First Alternative",
  description:
    "Compare Eesee Metrics and Google Analytics. Discover why privacy-conscious businesses are switching from GA4 to Eesee Metrics' Privacy-first, cookie-free analytics.",
  openGraph: {
    title: "Eesee Metrics vs Google Analytics: The Privacy-First Alternative",
    description:
      "Why teams are switching from Google Analytics to Eesee Metrics. Privacy-first, cookie-free, GDPR compliant.",
    type: "website",
    url: "https://eeseemetrics.com/compare/google-analytics",
    images: [createOGImageUrl("Eesee Metrics vs Google Analytics: The Privacy-First Alternative", "Why teams are switching from Google Analytics to Eesee Metrics. Privacy-first, cookie-free, GDPR compliant.", "Compare")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eesee Metrics vs Google Analytics",
    description: "The privacy-first Google Analytics alternative. Compare features side-by-side.",
    images: [createOGImageUrl("Eesee Metrics vs Google Analytics", "The privacy-first Google Analytics alternative. Compare features side-by-side.", "Compare")],
  },
  alternates: {
    canonical: "https://eeseemetrics.com/compare/google-analytics",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://eeseemetrics.com/compare/google-analytics",
      name: "Eesee Metrics vs Google Analytics Comparison",
      description: "Compare Eesee Metrics and Google Analytics. Eesee Metrics is cookieless, GDPR-compliant, and requires no consent banner — with AI reports, session replay, and MCP tools built in.",
      url: "https://eeseemetrics.com/compare/google-analytics",
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
          name: "Why switch from Google Analytics to Eesee Metrics?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Eesee Metrics offers privacy-first analytics without cookies, no consent banners needed, GDPR compliance by default, and a simpler interface. Unlike GA4's complex 150+ report system, Eesee Metrics shows all essential metrics on a single dashboard.",
          },
        },
        {
          "@type": "Question",
          name: "Is Eesee Metrics GDPR compliant unlike Google Analytics?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Eesee Metrics is GDPR compliant by default with no cookies, no personal data collection, and EU data storage. Google Analytics has faced GDPR issues in multiple EU countries due to data transfers to the US.",
          },
        },
        {
          "@type": "Question",
          name: "Does Eesee Metrics offer the same features as GA4?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Eesee Metrics offers all essential analytics features plus session replay, funnels, user journeys, and real-time data. While GA4 has more advanced enterprise features, Eesee Metrics provides what most businesses actually need without the complexity.",
          },
        },
        {
          "@type": "Question",
          name: "Can Eesee Metrics track conversions and goals like GA4?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Eesee Metrics supports conversion goals, funnels, and custom events with attributes. While the setup is simpler than GA4's event configuration, you get the same core conversion tracking capabilities.",
          },
        },
        {
          "@type": "Question",
          name: "Does Eesee Metrics offer real-time analytics?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, Eesee Metrics provides real-time data out of the box with no sampling. Unlike GA4 which may sample data on high-traffic properties, Eesee Metrics shows every event as it happens.",
          },
        },
      ],
    },
  ],
};

export default function GoogleAnalytics() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ComparisonPage
        competitorName="Google Analytics"
        sections={googleAnalyticsComparisonData}
        subtitle={googleAnalyticsExtendedData.subtitle}
        introHeading={googleAnalyticsExtendedData.introHeading}
        introParagraphs={googleAnalyticsExtendedData.introParagraphs}
        chooseEeseeMetrics={googleAnalyticsExtendedData.chooseEeseeMetrics}
        chooseCompetitor={googleAnalyticsExtendedData.chooseCompetitor}
        eeseemetricsPricing={googleAnalyticsExtendedData.eeseemetricsPricing}
        competitorPricing={googleAnalyticsExtendedData.competitorPricing}
        faqItems={googleAnalyticsExtendedData.faqItems}
        relatedResources={googleAnalyticsExtendedData.relatedResources}
      />
    </>
  );
}
