import { createOGImageUrl } from "@/lib/metadata";
import type { Metadata } from "next";
import { FeaturePage } from "../components/FeaturePage";
import { UptimeMonitor } from "@/components/Cards/UptimeMonitor";
import {
  capabilities,
  faqItems,
  howItWorks,
  relatedFeatures,
  whoUses,
} from "./feature-data";

export const metadata: Metadata = {
  title: "Uptime Monitoring - Eesee Metrics | Website & API Monitoring",
  description:
    "Monitor your website, API endpoints, and TCP services for uptime. Get instant alerts via Slack, Discord, or email when something goes down — and when it recovers.",
  openGraph: {
    title: "Uptime Monitoring - Eesee Metrics",
    description:
      "HTTP, HTTPS, and TCP monitoring with instant downtime alerts. Know before your users do.",
    type: "website",
    url: "https://eeseemetrics.com/features/uptime-monitoring",
    images: [
      createOGImageUrl(
        "Uptime Monitoring",
        "HTTP, HTTPS, and TCP monitoring with instant downtime alerts.",
        "Features"
      ),
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Uptime Monitoring - Eesee Metrics",
    description:
      "HTTP, HTTPS, and TCP monitoring with instant downtime alerts. Know before your users do.",
    images: [
      createOGImageUrl(
        "Uptime Monitoring",
        "HTTP, HTTPS, and TCP monitoring with instant downtime alerts.",
        "Features"
      ),
    ],
  },
  alternates: {
    canonical: "https://eeseemetrics.com/features/uptime-monitoring",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://eeseemetrics.com/features/uptime-monitoring",
      name: "Eesee Metrics Uptime Monitoring",
      description:
        "Monitor websites, APIs, and TCP services for uptime with instant downtime alerts.",
      url: "https://eeseemetrics.com/features/uptime-monitoring",
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

export default function UptimeMonitoringPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <FeaturePage
        featureName="uptime-monitoring"
        headline="Know before your users do."
        subtitle="Monitor any URL, API endpoint, or TCP service for uptime. Get alerted instantly via Slack, Discord, or email when something goes down — and notified again when it recovers."
        badgeText="Uptime Monitoring"
        introParagraphs={[
          <>
            Downtime is inevitable. How quickly you respond to it isn&apos;t.{" "}
            <strong className="text-neutral-900 dark:text-white">
              Every minute your site is down without you knowing is a minute customers are bouncing, support tickets are piling up, and revenue is lost.
            </strong>{" "}
            Eesee Metrics uptime monitoring checks your endpoints on your schedule and alerts you the moment something fails — before your users notice.
          </>,
          <>
            Monitor HTTP and HTTPS endpoints with{" "}
            <strong className="text-neutral-900 dark:text-white">
              validation rules
            </strong>{" "}
            that go beyond simple up/down checks. Confirm that the right status code is returned, that specific content appears in the response, and that headers are correct. A server can respond with a 200 and still be broken — Eesee Metrics catches that too.
          </>,
          <>
            Full incident history tracks when outages started, how long they lasted, and when they resolved.{" "}
            <strong className="text-neutral-900 dark:text-white">
              Uptime percentages over 24h, 7d, and 30d
            </strong>{" "}
            give you the data you need for SLA reporting and status page updates. Available on all plans, including Starter.
          </>,
        ]}
        featureCard={<UptimeMonitor />}
        capabilities={capabilities}
        howItWorks={howItWorks}
        whoUses={whoUses}
        faqItems={faqItems}
        relatedFeatures={relatedFeatures}
        ctaTitle="Start monitoring your site"
        ctaDescription="HTTP, HTTPS, and TCP monitoring with instant alerts. Available on all plans including Starter."
      />
    </>
  );
}
