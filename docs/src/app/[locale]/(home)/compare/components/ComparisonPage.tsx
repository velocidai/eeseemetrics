import { BackgroundGrid } from "@/components/BackgroundGrid";
import { CTASection } from "@/components/CTASection";
import { SectionBadge } from "@/components/SectionBadge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, BrainCircuit, CheckCircle, CircleMinus, Shield, type LucideIcon, Video, Zap } from "lucide-react";
import { useExtracted } from "next-intl";
import Link from "next/link";
import React from "react";
import { TrackedButton } from "@/components/TrackedButton";

export interface KeyDifference {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface ComparisonFeature {
  name: string;
  eeseemetricsValue: string | boolean;
  competitorValue: string | boolean;
}

export interface ComparisonSection {
  title: string;
  features: ComparisonFeature[];
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface PricingInfo {
  name: string;
  model: string;
  startingPrice: string;
  highlights: string[];
}

export interface RelatedResource {
  title: string;
  href: string;
  description: string;
}

export interface ComparisonPageProps {
  competitorName: string;
  sections: ComparisonSection[];
  comparisonContent?: React.ReactNode;
  subtitle?: string;
  introHeading?: string;
  introParagraphs?: string[];
  chooseEeseeMetrics?: string[];
  chooseCompetitor?: string[];
  eeseemetricsPricing?: PricingInfo;
  competitorPricing?: PricingInfo;
  faqItems?: FAQItem[];
  relatedResources?: RelatedResource[];
  keyDifferences?: KeyDifference[];
}

const DEFAULT_KEY_DIFFERENCES: KeyDifference[] = [
  {
    icon: Shield,
    title: "Privacy-first by design",
    description: "Cookie-free tracking. No consent banners needed. GDPR compliant out of the box.",
  },
  {
    icon: Video,
    title: "Session replay included",
    description: "Watch real user sessions to understand exactly how visitors interact with your site.",
  },
  {
    icon: Zap,
    title: "AI-powered reports",
    description: "Weekly and monthly insights generated automatically — no manual analysis required.",
  },
  {
    icon: BrainCircuit,
    title: "MCP tools for AI assistants",
    description: "Ask questions about your data directly in Claude, ChatGPT, or any MCP-compatible AI.",
  },
];

export function ComparisonPage({
  competitorName,
  sections,
  comparisonContent,
  subtitle,
  introHeading,
  introParagraphs,
  chooseEeseeMetrics,
  chooseCompetitor,
  eeseemetricsPricing,
  competitorPricing,
  faqItems,
  relatedResources,
  keyDifferences = DEFAULT_KEY_DIFFERENCES,
}: ComparisonPageProps) {
  const t = useExtracted();

  const hasNewSections = !!chooseEeseeMetrics;

  const renderFeatureValue = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <CheckCircle className="w-5 h-5 text-accent-500" />
      ) : (
        <CircleMinus className="w-5 h-5 text-neutral-500" />
      );
    }
    return <span className="text-neutral-700 dark:text-neutral-300">{value}</span>;
  };

  return (
    <div className="flex flex-col items-center justify-center overflow-x-hidden pt-16 md:pt-24">
      <BackgroundGrid />
      <div className="relative flex flex-col py-8">
        {/* Grid background with fade */}

        <h1
          className="relative z-10 text-4xl md:text-5xl lg:text-7xl font-medium px-4 tracking-tight max-w-4xl text-center text-transparent bg-clip-text bg-gradient-to-b from-neutral-900 via-neutral-700 to-neutral-500 dark:from-white dark:via-gray-100 dark:to-gray-400"
        >
          {t("Eesee Metrics vs {competitor}", { competitor: competitorName })}
        </h1>
        <h2 className="relative z-10 text-base md:text-xl pt-4 md:pt-6 px-4 tracking-tight max-w-4xl text-center text-neutral-600 dark:text-neutral-300 font-light">
          {subtitle
            ? subtitle
            : t("Compare the key features of Eesee Metrics and {competitor}.", { competitor: competitorName })}
        </h2>

        <div className="relative z-10 flex flex-col items-center my-8 md:my-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 text-base md:text-lg px-4">
            <TrackedButton
              href="https://app.eeseemetrics.com/signup"
              eventName="signup"
              eventProps={{ location: "hero", button_text: "Track your site" }}
              className="w-full sm:w-auto bg-accent-600 hover:bg-accent-500 text-white font-medium px-5 py-3 rounded-lg shadow-lg shadow-accent-900/20 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-opacity-50 cursor-pointer"
            >
              {t("Track your site")}
            </TrackedButton>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs md:text-sm flex items-center justify-center gap-2 mt-6">
            <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
            {t("7-day free trial. Cancel anytime.")}
          </p>
        </div>
      </div>

      {/* Intro paragraphs */}
      {introHeading && introParagraphs && introParagraphs.length > 0 && (
        <section className="w-full max-w-5xl mx-auto px-4 z-10 pb-4">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            {introHeading}
          </h2>
          <div className="space-y-4">
            {introParagraphs.map((paragraph, index) => (
              <p key={index} className="text-neutral-600 dark:text-neutral-300 leading-relaxed font-light">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Which is right for you? */}
      {chooseEeseeMetrics && chooseCompetitor && (
        <section className="py-12 w-full max-w-5xl mx-auto px-4 z-10">
          <div className="mb-8">
            <SectionBadge>{t("Comparison")}</SectionBadge>
            <h2 className="text-2xl md:text-3xl font-semibold mt-4">
              {t("Which is right for you?")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Choose Eesee Metrics */}
            <div className="bg-neutral-200/40 dark:bg-neutral-900/40 p-2 rounded-3xl border border-accent-500/30 dark:border-accent-500/20">
              <div className="bg-neutral-50 dark:bg-neutral-900 backdrop-blur-sm rounded-2xl border border-accent-500/20 dark:border-accent-500/10 p-6 h-full">
                <h3 className="text-lg font-semibold text-accent-600 dark:text-accent-400 mb-4">
                  {t("Choose Eesee Metrics if...")}
                </h3>
                <ul className="space-y-3">
                  {chooseEeseeMetrics.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent-500 mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-700 dark:text-neutral-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Choose Competitor */}
            <div className="bg-neutral-200/40 dark:bg-neutral-900/40 p-2 rounded-3xl border border-neutral-300 dark:border-neutral-800">
              <div className="bg-neutral-50 dark:bg-neutral-900 backdrop-blur-sm rounded-2xl border border-neutral-300 dark:border-neutral-800 p-6 h-full">
                <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
                  {t("Choose {competitor} if...", { competitor: competitorName })}
                </h3>
                <ul className="space-y-3">
                  {chooseCompetitor.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-neutral-400 dark:text-neutral-500 mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-700 dark:text-neutral-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Key Differences at a Glance */}
      <section className="w-full max-w-5xl mx-auto px-4 z-10 pb-8 pt-4">
        <div className="mb-6">
          <SectionBadge>{t("Why Eesee Metrics")}</SectionBadge>
          <h2 className="text-2xl md:text-3xl font-semibold mt-4">
            {t("Key differences at a glance")}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {keyDifferences.map((diff, index) => {
            const Icon = diff.icon;
            return (
              <div key={index} className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5">
                <div className="w-9 h-9 rounded-lg bg-accent-500/10 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-accent-500" />
                </div>
                <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 mb-1">{diff.title}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{diff.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="w-full max-w-5xl mx-auto mt-4 px-4 z-10">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6 text-left">
          {t("Why choose Eesee Metrics over {competitor}?", { competitor: competitorName })}
        </h2>
      </div>
      {/* Comparison Table */}
      <section className="pb-12 pt-4 w-full max-w-5xl mx-auto px-4">
        <div className="bg-neutral-200/40 dark:bg-neutral-900/40 p-2 rounded-3xl border border-neutral-300 dark:border-neutral-800">
          <div className="bg-neutral-50 dark:bg-neutral-900 backdrop-blur-sm rounded-2xl border border-neutral-300 dark:border-neutral-800 overflow-hidden text-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-300 dark:border-neutral-800">
                  <th className="text-left p-6 w-2/5"></th>
                  <th className="text-center p-6">
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-semibold text-sm">Eesee Metrics</span>
                    </div>
                  </th>
                  <th className="text-center p-6">
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-semibold">{competitorName}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section, sectionIndex) => (
                  <React.Fragment key={sectionIndex}>
                    <tr>
                      <td colSpan={3} className="px-6 py-4 bg-neutral-200/70 dark:bg-neutral-800/50">
                        <span className="text-neutral-600 dark:text-neutral-400 text-sm font-medium">
                          {section.title}
                        </span>
                      </td>
                    </tr>
                    {section.features.map((feature, featureIndex) => (
                      <tr
                        key={`${sectionIndex}-${featureIndex}`}
                        className={
                          featureIndex < section.features.length - 1
                            ? "border-b border-neutral-300 dark:border-neutral-800"
                            : ""
                        }
                      >
                        <td className="px-6 py-4 text-neutral-700 dark:text-neutral-300 text-sm">{feature.name}</td>
                        <td className="px-6 py-4 text-center text-sm">
                          <div className="flex justify-center">{renderFeatureValue(feature.eeseemetricsValue)}</div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm">
                          <div className="flex justify-center">{renderFeatureValue(feature.competitorValue)}</div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      {eeseemetricsPricing && competitorPricing && (
        <section className="py-12 w-full max-w-5xl mx-auto px-4 z-10">
          <div className="mb-8">
            <SectionBadge>{t("Pricing")}</SectionBadge>
            <h2 className="text-2xl md:text-3xl font-semibold mt-4">
              {t("Pricing comparison")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Eesee Metrics Pricing */}
            <div className="bg-neutral-200/40 dark:bg-neutral-900/40 p-2 rounded-3xl border border-accent-500/30 dark:border-accent-500/20">
              <div className="bg-neutral-50 dark:bg-neutral-900 backdrop-blur-sm rounded-2xl border border-accent-500/20 dark:border-accent-500/10 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{eeseemetricsPricing.name}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{eeseemetricsPricing.model}</p>
                </div>
                <p className="text-3xl font-bold text-accent-600 dark:text-accent-400 mb-6">{eeseemetricsPricing.startingPrice}</p>
                <ul className="space-y-3">
                  {eeseemetricsPricing.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent-500 mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-700 dark:text-neutral-300 text-sm">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Competitor Pricing */}
            <div className="bg-neutral-200/40 dark:bg-neutral-900/40 p-2 rounded-3xl border border-neutral-300 dark:border-neutral-800">
              <div className="bg-neutral-50 dark:bg-neutral-900 backdrop-blur-sm rounded-2xl border border-neutral-300 dark:border-neutral-800 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{competitorPricing.name}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{competitorPricing.model}</p>
                </div>
                <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-300 mb-6">{competitorPricing.startingPrice}</p>
                <ul className="space-y-3">
                  {competitorPricing.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-neutral-400 dark:text-neutral-500 mt-0.5 flex-shrink-0" />
                      <span className="text-neutral-700 dark:text-neutral-300 text-sm">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Old comparison content - only if new sections not provided */}
      {!hasNewSections && comparisonContent && (
        <section className="py-12 md:py-16 w-full max-w-3xl mx-auto px-4">
          <div className="prose prose-invert prose-neutral max-w-none">{comparisonContent}</div>
        </section>
      )}

      {/* FAQ Section */}
      {faqItems && faqItems.length > 0 && (
        <section className="py-12 w-full max-w-5xl mx-auto px-4 z-10">
          <div className="mb-8">
            <SectionBadge>{t("FAQ")}</SectionBadge>
            <h2 className="text-2xl md:text-3xl font-semibold mt-4">
              {t("Frequently asked questions")}
            </h2>
          </div>
          <div className="bg-neutral-100/50 dark:bg-neutral-800/20 backdrop-blur-sm border border-neutral-300/50 dark:border-neutral-800/50 rounded-xl overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className={index === faqItems.length - 1 ? "border-b-0" : ""}
                >
                  <AccordionTrigger className="md:text-lg">{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* Related Resources */}
      {relatedResources && relatedResources.length > 0 && (
        <section className="py-12 w-full max-w-5xl mx-auto px-4 z-10">
          <div className="mb-8">
            <SectionBadge>{t("Resources")}</SectionBadge>
            <h2 className="text-2xl md:text-3xl font-semibold mt-4">
              {t("Related resources")}
            </h2>
          </div>
          <ul className="space-y-3">
            {relatedResources.map((resource, index) => (
              <li key={index}>
                <Link
                  href={resource.href}
                  className="group flex items-center gap-2 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                  <span className="font-medium">{resource.title}</span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-500">&mdash; {resource.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <CTASection
        title="Switch to analytics that's made for you"
        eventLocation="comparison_bottom_cta"
      />
    </div>
  );
}
