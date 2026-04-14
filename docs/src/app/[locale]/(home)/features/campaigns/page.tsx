import { createOGImageUrl } from "@/lib/metadata";
import type { Metadata } from "next";
import { FeaturePage } from "../components/FeaturePage";
import { CampaignAnalytics } from "@/components/Cards/CampaignAnalytics";
import {
  capabilities,
  faqItems,
  howItWorks,
  relatedFeatures,
  whoUses,
} from "./feature-data";

export const metadata: Metadata = {
  title: "Campaign Analytics - Eesee Metrics | UTM Tracking & Attribution",
  description:
    "Track UTM campaigns, measure conversions, and compare channel performance — all without cookies. Automatic UTM capture with no extra configuration required.",
  openGraph: {
    title: "Campaign Analytics - Eesee Metrics",
    description:
      "UTM campaign tracking and attribution without cookies. See which campaigns drive real conversions.",
    type: "website",
    url: "https://eeseemetrics.com/features/campaigns",
    images: [
      createOGImageUrl(
        "Campaign Analytics",
        "UTM campaign tracking and attribution without cookies.",
        "Features"
      ),
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Campaign Analytics - Eesee Metrics",
    description:
      "UTM campaign tracking and attribution without cookies. See which campaigns drive real conversions.",
    images: [
      createOGImageUrl(
        "Campaign Analytics",
        "UTM campaign tracking and attribution without cookies.",
        "Features"
      ),
    ],
  },
  alternates: {
    canonical: "https://eeseemetrics.com/features/campaigns",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://eeseemetrics.com/features/campaigns",
      name: "Eesee Metrics Campaign Analytics",
      description:
        "UTM campaign tracking and attribution. Measure which campaigns drive traffic and conversions.",
      url: "https://eeseemetrics.com/features/campaigns",
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

export default function CampaignsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <FeaturePage
        featureName="campaigns"
        headline="See which campaigns actually work."
        subtitle="Automatic UTM tracking that captures every campaign parameter and links them to real conversions — without cookies, without tag managers, without extra configuration."
        badgeText="Campaign Analytics"
        introParagraphs={[
          <>
            You&apos;re spending money on ads, sending newsletters, and posting on social. But which channel is actually driving growth?{" "}
            <strong className="text-neutral-900 dark:text-white">
              Without campaign tracking, every traffic source looks the same.
            </strong>{" "}
            With Eesee Metrics, UTM parameters are captured automatically the moment a tagged link is clicked — no tag manager, no extra script, no configuration required.
          </>,
          <>
            The Campaigns dashboard shows every source, medium, and campaign in one table — with sessions, visitors, bounce rate, session duration, and{" "}
            <strong className="text-neutral-900 dark:text-white">
              conversion rate
            </strong>{" "}
            for each. Period-over-period deltas show what&apos;s growing and what&apos;s declining at a glance. Drill down into any campaign to see its top landing pages, traffic over time, and goal breakdown.
          </>,
          <>
            Because UTM values are stored in{" "}
            <strong className="text-neutral-900 dark:text-white">
              sessionStorage — not cookies
            </strong>{" "}
            — the tracking is fully GDPR compliant and requires no consent banner. Data clears automatically when the browser tab closes, with no persistent personal data stored.
          </>,
        ]}
        featureCard={<CampaignAnalytics />}
        capabilities={capabilities}
        howItWorks={howItWorks}
        whoUses={whoUses}
        faqItems={faqItems}
        relatedFeatures={relatedFeatures}
        ctaTitle="Measure every campaign"
        ctaDescription="Automatic UTM capture. Conversion attribution. No cookies. Available on all plans."
      />
    </>
  );
}
