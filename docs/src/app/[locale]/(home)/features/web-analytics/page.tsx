import { createOGImageUrl } from "@/lib/metadata";
import type { Metadata } from "next";
import { FeaturePage } from "../components/FeaturePage";
import { LiveDashboard } from "@/components/Cards/LiveDashboard";
import {
  capabilities,
  faqItems,
  howItWorks,
  relatedFeatures,
  whoUses,
} from "./feature-data";

export const metadata: Metadata = {
  title: "Web Analytics - Eesee Metrics | Privacy-First Website Analytics",
  description:
    "Real-time web analytics without cookies or consent banners. Track pageviews, visitors, traffic sources, and more with a single script. Privacy-first and GDPR compliant.",
  openGraph: {
    title: "Web Analytics - Eesee Metrics",
    description:
      "Real-time, privacy-first web analytics. One script, full dashboard. No cookies required.",
    type: "website",
    url: "https://eeseemetrics.com/features/web-analytics",
    images: [
      createOGImageUrl(
        "Web Analytics",
        "Real-time, privacy-first web analytics. One script, full dashboard.",
        "Features"
      ),
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Web Analytics - Eesee Metrics",
    description:
      "Real-time, privacy-first web analytics. One script, full dashboard.",
    images: [
      createOGImageUrl(
        "Web Analytics",
        "Real-time, privacy-first web analytics. One script, full dashboard.",
        "Features"
      ),
    ],
  },
  alternates: {
    canonical: "https://eeseemetrics.com/features/web-analytics",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://eeseemetrics.com/features/web-analytics",
      name: "Eesee Metrics Web Analytics",
      description:
        "Real-time web analytics without cookies or consent banners.",
      url: "https://eeseemetrics.com/features/web-analytics",
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

export default function WebAnalyticsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <FeaturePage
        featureName="web-analytics"
        headline="One script. Full dashboard."
        subtitle="Real-time web analytics without cookies, consent banners, or complexity. See your traffic, sources, and audience — all on a single page."
        badgeText="Web Analytics"
        introParagraphs={[
          <>
            Most analytics tools make you choose between <strong className="text-neutral-900 dark:text-white">power and simplicity</strong>. Google Analytics has hundreds of reports but takes a PhD to navigate. Simple tools show you numbers but can&apos;t tell you <em>why</em> they changed. Eesee Metrics gives you both: a single, real-time dashboard with every metric that matters, plus the ability to click into any dimension and drill down instantly.
          </>,
          <>
            There are <strong className="text-neutral-900 dark:text-white">no cookies, no personal data collection, and no consent banners</strong>. Your tracking script is just 18KB — compared to Google Analytics&apos; 371KB. That means faster page loads and <strong className="text-neutral-900 dark:text-white">100% visitor capture</strong> since no one gets blocked by ad blockers or cookie rejections.
          </>,
          <>
            Whether you&apos;re monitoring a blog, a SaaS product, or a portfolio of client sites, Eesee Metrics adapts. Filter by country, device, referrer, or any custom property. Compare date ranges. Share public dashboards. And because it&apos;s fully EU-hosted, <strong className="text-neutral-900 dark:text-white">you own your data and it never leaves our EU infrastructure</strong>.
          </>,
        ]}
        featureCard={<LiveDashboard />}
        capabilities={capabilities}
        howItWorks={howItWorks}
        whoUses={whoUses}
        faqItems={faqItems}
        relatedFeatures={relatedFeatures}
        ctaTitle="See your analytics clearly"
        ctaDescription="One script. Real-time data. No cookies. Get started in under 5 minutes."
      />
    </>
  );
}
