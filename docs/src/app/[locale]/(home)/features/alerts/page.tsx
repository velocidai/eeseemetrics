import { createOGImageUrl } from "@/lib/metadata";
import type { Metadata } from "next";
import { FeaturePage } from "../components/FeaturePage";
import { AnomalyDetection } from "@/components/Cards/AnomalyDetection";
import {
  capabilities,
  faqItems,
  howItWorks,
  relatedFeatures,
  whoUses,
} from "./feature-data";

export const metadata: Metadata = {
  title: "Anomaly Alerts - Eesee Metrics | Traffic Spike & Drop Detection",
  description:
    "Get alerted the moment your traffic spikes or drops. Automatic anomaly detection with Slack, Discord, email, and webhook notifications — no thresholds to configure.",
  openGraph: {
    title: "Anomaly Alerts - Eesee Metrics",
    description:
      "Automatic traffic anomaly detection. Get notified the moment something unusual happens on your site.",
    type: "website",
    url: "https://eeseemetrics.com/features/alerts",
    images: [
      createOGImageUrl(
        "Anomaly Alerts",
        "Automatic traffic anomaly detection. Get notified the moment something unusual happens.",
        "Features"
      ),
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anomaly Alerts - Eesee Metrics",
    description:
      "Automatic traffic anomaly detection. Get notified the moment something unusual happens on your site.",
    images: [
      createOGImageUrl(
        "Anomaly Alerts",
        "Automatic traffic anomaly detection. Get notified the moment something unusual happens.",
        "Features"
      ),
    ],
  },
  alternates: {
    canonical: "https://eeseemetrics.com/features/alerts",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://eeseemetrics.com/features/alerts",
      name: "Eesee Metrics Anomaly Alerts",
      description:
        "Automatic traffic spike and drop detection with real-time notifications.",
      url: "https://eeseemetrics.com/features/alerts",
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

export default function AlertsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <FeaturePage
        featureName="alerts"
        headline="Know the moment something changes."
        subtitle="Automatic anomaly detection that alerts you when traffic spikes or drops — without manual thresholds. Get notified via Slack, Discord, email, or webhook within minutes."
        badgeText="Anomaly Alerts"
        introParagraphs={[
          <>
            Traffic anomalies happen when you least expect them. A viral post drives a 10x spike. A broken deployment silently kills 80% of your traffic. A page gets de-indexed overnight.{" "}
            <strong className="text-neutral-900 dark:text-white">
              By the time you notice, the window to act has closed.
            </strong>
          </>,
          <>
            Eesee Metrics continuously monitors your site and{" "}
            <strong className="text-neutral-900 dark:text-white">
              automatically detects statistically significant deviations
            </strong>{" "}
            from your normal patterns. No manual thresholds to configure. The system learns your site&apos;s behaviour — including time-of-day and day-of-week variations — so it knows the difference between a quiet Sunday and an actual drop.
          </>,
          <>
            When an anomaly is detected, you&apos;re notified immediately via your preferred channel. Click through to your dashboard to see exactly which pages and sources are affected.{" "}
            <strong className="text-neutral-900 dark:text-white">
              Capitalise on spikes while they&apos;re live. Catch problems before your users report them.
            </strong>
          </>,
        ]}
        featureCard={<AnomalyDetection />}
        capabilities={capabilities}
        howItWorks={howItWorks}
        whoUses={whoUses}
        faqItems={faqItems}
        relatedFeatures={relatedFeatures}
        ctaTitle="Never miss a traffic event"
        ctaDescription="Automatic anomaly detection with instant notifications. Know the moment something changes on your site."
      />
    </>
  );
}
