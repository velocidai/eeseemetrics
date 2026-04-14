import { createOGImageUrl } from "@/lib/metadata";
import type { Metadata } from "next";
import { FeaturePage } from "../components/FeaturePage";
import { SearchConsoleCard } from "@/components/Cards/SearchConsoleCard";
import {
  capabilities,
  faqItems,
  howItWorks,
  relatedFeatures,
  whoUses,
} from "./feature-data";

export const metadata: Metadata = {
  title: "Google Search Console Integration - Eesee Metrics | SEO Analytics",
  description:
    "See your Search Console data — queries, impressions, clicks, CTR, and rankings — inside your Eesee Metrics dashboard. No tab switching between tools.",
  openGraph: {
    title: "Google Search Console Integration - Eesee Metrics",
    description:
      "Search queries, rankings, and organic performance inside your analytics dashboard.",
    type: "website",
    url: "https://eeseemetrics.com/features/search-console",
    images: [
      createOGImageUrl(
        "Search Console Integration",
        "Search queries, rankings, and organic performance inside your analytics dashboard.",
        "Features"
      ),
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Google Search Console Integration - Eesee Metrics",
    description:
      "Search queries, rankings, and organic performance inside your analytics dashboard.",
    images: [
      createOGImageUrl(
        "Search Console Integration",
        "Search queries, rankings, and organic performance inside your analytics dashboard.",
        "Features"
      ),
    ],
  },
  alternates: {
    canonical: "https://eeseemetrics.com/features/search-console",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://eeseemetrics.com/features/search-console",
      name: "Eesee Metrics Google Search Console Integration",
      description:
        "Google Search Console data — queries, impressions, clicks, CTR, and rankings — inside your analytics dashboard.",
      url: "https://eeseemetrics.com/features/search-console",
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

export default function SearchConsolePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <FeaturePage
        featureName="search-console"
        headline="Your SEO data, where your analytics live."
        subtitle="Google Search Console data — queries, impressions, clicks, CTR, and average position — inside your Eesee Metrics dashboard. No more tab switching between tools."
        badgeText="Search Console"
        introParagraphs={[
          <>
            Understanding your organic search performance means constantly switching between Google Search Console and your analytics platform — correlating query data with session data, cross-referencing dates, copying numbers into spreadsheets.{" "}
            <strong className="text-neutral-900 dark:text-white">
              Eesee Metrics brings your Search Console data in-dashboard
            </strong>
            , so everything is in one place.
          </>,
          <>
            Connect your Google account with a single OAuth flow and select your Search Console property. From that point, your{" "}
            <strong className="text-neutral-900 dark:text-white">
              search queries, impression counts, click-through rates, and ranking positions
            </strong>{" "}
            are available alongside your traffic, sessions, and conversion data — using the same date filters and drill-downs you already use.
          </>,
          <>
            Spot which queries are generating impressions but low clicks — high-value optimisation opportunities hiding in the data. Track average ranking positions over time. Break down search performance by page, country, and device. Available on{" "}
            <strong className="text-neutral-900 dark:text-white">
              Scale
            </strong>{" "}
            with read-only access to your Search Console data — Eesee Metrics cannot make any changes to your Google account.
          </>,
        ]}
        featureCard={<SearchConsoleCard />}
        capabilities={capabilities}
        howItWorks={howItWorks}
        whoUses={whoUses}
        faqItems={faqItems}
        relatedFeatures={relatedFeatures}
        ctaTitle="Unify your SEO and analytics data"
        ctaDescription="Search Console queries and rankings inside your analytics dashboard. Available on Scale."
      />
    </>
  );
}
