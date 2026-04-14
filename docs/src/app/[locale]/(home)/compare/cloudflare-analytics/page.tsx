import { ComparisonPage } from "../components/ComparisonPage";
import { cloudflareAnalyticsComparisonData, cloudflareAnalyticsExtendedData } from "./comparison-data";
import type { Metadata } from "next";
import { createOGImageUrl } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Eesee Metrics vs Cloudflare Analytics: Full-Featured Alternative",
  description:
    "Compare Eesee Metrics and Cloudflare Web Analytics. While Cloudflare is free and basic, Eesee Metrics offers advanced features like session replay, funnels, and custom events.",
  openGraph: {
    title: "Eesee Metrics vs Cloudflare Analytics: Basic vs Full-Featured",
    description: "Cloudflare is free but limited. Eesee Metrics offers the full analytics experience. Compare features.",
    type: "website",
    url: "https://eeseemetrics.com/compare/cloudflare-analytics",
    images: [createOGImageUrl("Eesee Metrics vs Cloudflare Analytics: Basic vs Full-Featured", "Cloudflare is free but limited. Eesee Metrics offers the full analytics experience. Compare features.", "Compare")],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eesee Metrics vs Cloudflare Analytics",
    description: "Free basic analytics vs full-featured platform. See the difference.",
    images: [createOGImageUrl("Eesee Metrics vs Cloudflare Analytics", "Free basic analytics vs full-featured platform. See the difference.", "Compare")],
  },
  alternates: {
    canonical: "https://eeseemetrics.com/compare/cloudflare-analytics",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://eeseemetrics.com/compare/cloudflare-analytics",
      name: "Eesee Metrics vs Cloudflare Analytics Comparison",
      description: "Compare Eesee Metrics and Cloudflare Web Analytics. Cloudflare is free but limited to basic traffic metrics. Eesee Metrics adds funnels, session replay, AI reports, and MCP tools.",
      url: "https://eeseemetrics.com/compare/cloudflare-analytics",
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
          name: "Why is Cloudflare Analytics data inaccurate?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Cloudflare Analytics samples only about 10% of your traffic and extrapolates the rest. This means visitor counts are often significantly overcounted and you can't trust the exact numbers. Eesee Metrics processes 100% of your events with no sampling.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need Cloudflare CDN to use Cloudflare Analytics?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Cloudflare Analytics requires routing your DNS through Cloudflare. Eesee Metrics works with any website regardless of CDN or hosting provider. Just add a single script tag.",
          },
        },
        {
          "@type": "Question",
          name: "What features does Cloudflare Analytics lack?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Cloudflare Analytics doesn't support custom events, conversion goals, UTM campaign tracking, session replay, funnels, user journeys, bounce rate, visit duration, entry/exit pages, or an API. It only provides basic traffic metrics with sampled data.",
          },
        },
        {
          "@type": "Question",
          name: "How long does Cloudflare keep my data?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Cloudflare retains analytics data for only 6 months. Eesee Metrics retains data for 2-5+ years depending on your plan, and you can export your data at any time.",
          },
        },
        {
          "@type": "Question",
          name: "Can I use Eesee Metrics alongside Cloudflare Analytics?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Many teams add Eesee Metrics for detailed analytics while keeping Cloudflare for basic CDN-level traffic monitoring. Just add Eesee Metrics' tracking script to your site, and it works alongside any other analytics tool.",
          },
        },
      ],
    },
  ],
};

export default function CloudflareAnalytics() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ComparisonPage
        competitorName="Cloudflare Analytics"
        sections={cloudflareAnalyticsComparisonData}
        subtitle={cloudflareAnalyticsExtendedData.subtitle}
        introHeading={cloudflareAnalyticsExtendedData.introHeading}
        introParagraphs={cloudflareAnalyticsExtendedData.introParagraphs}
        chooseEeseeMetrics={cloudflareAnalyticsExtendedData.chooseEeseeMetrics}
        chooseCompetitor={cloudflareAnalyticsExtendedData.chooseCompetitor}
        eeseemetricsPricing={cloudflareAnalyticsExtendedData.eeseemetricsPricing}
        competitorPricing={cloudflareAnalyticsExtendedData.competitorPricing}
        faqItems={cloudflareAnalyticsExtendedData.faqItems}
        relatedResources={cloudflareAnalyticsExtendedData.relatedResources}
      />
    </>
  );
}
