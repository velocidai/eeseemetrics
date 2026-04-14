import { createOGImageUrl } from "@/lib/metadata";
import type { Metadata } from "next";
import { FeaturePage } from "../components/FeaturePage";
import { AiReportCard } from "@/components/Cards/AiReportCard";
import {
  capabilities,
  faqItems,
  howItWorks,
  relatedFeatures,
  whoUses,
} from "./feature-data";

export const metadata: Metadata = {
  title: "AI Reports - Eesee Metrics | Automated Analytics Reports",
  description:
    "Get AI-generated weekly and monthly analytics reports delivered to your inbox. Plain-English summaries of what changed, why it matters, and what to do next.",
  openGraph: {
    title: "AI Reports - Eesee Metrics",
    description:
      "Automated analytics reports that tell you what changed and why — no dashboard required.",
    type: "website",
    url: "https://eeseemetrics.com/features/ai-reports",
    images: [
      createOGImageUrl(
        "AI Reports",
        "Automated analytics reports that tell you what changed and why.",
        "Features"
      ),
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Reports - Eesee Metrics",
    description:
      "Automated analytics reports that tell you what changed and why — no dashboard required.",
    images: [
      createOGImageUrl(
        "AI Reports",
        "Automated analytics reports that tell you what changed and why.",
        "Features"
      ),
    ],
  },
  alternates: {
    canonical: "https://eeseemetrics.com/features/ai-reports",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://eeseemetrics.com/features/ai-reports",
      name: "Eesee Metrics AI Reports",
      description:
        "AI-generated weekly and monthly analytics reports delivered to your inbox.",
      url: "https://eeseemetrics.com/features/ai-reports",
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

export default function AiReportsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <FeaturePage
        featureName="ai-reports"
        headline="Your analytics, explained."
        subtitle="AI-generated weekly and monthly reports delivered to your inbox. Plain-English summaries of what changed, what drove it, and what to watch next — without opening a dashboard."
        badgeText="AI Reports"
        introParagraphs={[
          <>
            Most people check their analytics dashboard once, feel vaguely informed, and move on. The data is there — but turning numbers into decisions takes time and context you don&apos;t always have.{" "}
            <strong className="text-neutral-900 dark:text-white">
              AI Reports do that work for you.
            </strong>{" "}
            Each week and month, Eesee Metrics analyses your traffic, compares it to the prior period, and writes a structured report in plain English — delivered straight to your inbox.
          </>,
          <>
            Reports highlight your{" "}
            <strong className="text-neutral-900 dark:text-white">
              top traffic sources, best-performing pages, notable trends, and anomalies
            </strong>{" "}
            — all with the context of what changed and by how much. No spreadsheets. No manual analysis. Just a clear summary of what your site did and what deserves your attention.
          </>,
          <>
            On Scale, AI Reports go deeper — incorporating session counts, conversion data, and richer trend history. And because reports are stored and accessible via the{" "}
            <strong className="text-neutral-900 dark:text-white">
              MCP tools integration
            </strong>
            , you can ask your AI assistant to pull up past reports and drill into specific findings in a conversation.
          </>,
        ]}
        featureCard={<AiReportCard />}
        capabilities={capabilities}
        howItWorks={howItWorks}
        whoUses={whoUses}
        faqItems={faqItems}
        relatedFeatures={relatedFeatures}
        ctaTitle="Let AI do the analysis"
        ctaDescription="Weekly and monthly reports written for you. Know what changed and why, without opening a dashboard."
      />
    </>
  );
}
