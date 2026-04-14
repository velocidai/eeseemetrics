import { CTASection } from "@/components/CTASection";
import { FAQAccordion } from "@/components/FAQAccordion";
import { HeroSection } from "@/components/HeroSection";
import { IntegrationsGrid } from "@/components/Integration";
import { SectionBadge } from "@/components/SectionBadge";
import { ActivityIcon } from "@/components/ui/activity";
import { ArrowDownIcon } from "@/components/ui/arrow-down";
import { BanIcon } from "@/components/ui/ban";
import { BellIcon } from "@/components/ui/bell";
import { BotIcon } from "@/components/ui/bot";
import { EarthIcon } from "@/components/ui/earth";
import { GaugeIcon } from "@/components/ui/gauge";
import { LayersIcon } from "@/components/ui/layers";
import { LinkIcon } from "@/components/ui/link";
import { PlayIcon } from "@/components/ui/play";
import { ShieldCheckIcon } from "@/components/ui/shield-check";
import { TerminalIcon } from "@/components/ui/terminal";
import { UsersIcon } from "@/components/ui/users";
import { ZapIcon } from "@/components/ui/zap";
import { Wifi } from "lucide-react";
import { useExtracted } from "next-intl";
import { AiReportCard } from "@/components/Cards/AiReportCard";
import { AnomalyDetection } from "@/components/Cards/AnomalyDetection";
import { LiveDashboard } from "@/components/Cards/LiveDashboard";
import { McpChatCard } from "@/components/Cards/McpChatCard";
import { LandingPricing } from "@/components/LandingPricing";

// FAQ Structured Data
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Eesee Metrics GDPR and CCPA compliant?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Eesee Metrics is fully compliant with GDPR, CCPA, and other privacy regulations. We don't use cookies or collect any personal data that could identify your users. We salt user IDs daily to ensure users are not fingerprinted. You will not need to display a cookie consent banner to your users.",
      },
    },
    {
      "@type": "Question",
      name: "How do weekly reports work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every week, Eesee generates a plain-English email summary of your site's performance — top pages, top referrers, biggest changes versus the previous period. Eesee also monitors your metrics for anomalies and notifies you automatically when something unusual happens.",
      },
    },
    {
      "@type": "Question",
      name: "How easy is it to set up Eesee Metrics?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Setting up Eesee Metrics is incredibly simple. Just add a small script to your website or install our npm package, and you're good to go. Most users are up and running in less than 5 minutes.",
      },
    },
    {
      "@type": "Question",
      name: "What platforms does Eesee Metrics support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Eesee Metrics works with virtually any website platform. Whether you're using WordPress, Shopify, Next.js, React, Vue, or any other framework, our simple tracking snippet integrates seamlessly.",
      },
    },
    {
      "@type": "Question",
      name: "Where is my data stored?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "All data is stored on EU infrastructure hosted in Germany. Your data is never sold or shared with third parties. You can export your raw data at any time.",
      },
    },
  ],
};

interface LandingPageTemplateProps {
  title: React.ReactNode;
  subtitle: React.ReactNode;
}

export function LandingPageTemplate({
  title,
  subtitle,
}: LandingPageTemplateProps) {
  const t = useExtracted();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <HeroSection title={title} subtitle={subtitle} />

      {/* Core features — 4 category columns */}
      <section className="py-14 md:py-20 w-full max-w-[1200px] px-4 mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <SectionBadge className="mb-4">{t("Why Eesee Metrics")}</SectionBadge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{t("The complete analytics stack")}</h2>
          <p className="mt-4 text-base md:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto font-light">
            {t("Analytics, privacy, AI, and developer tools — everything in one place, nothing bolted on.")}
          </p>
        </div>
        {/* Category headers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-3 md:mb-4">
          {[
            { icon: ActivityIcon, label: t("Analytics") },
            { icon: ShieldCheckIcon, label: t("Privacy") },
            { icon: BotIcon, label: t("Intelligence") },
            { icon: TerminalIcon, label: t("Developer") },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 px-1">
              <Icon size={14} className="text-[#2FC7B8]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#2FC7B8]">{label}</span>
            </div>
          ))}
        </div>

        {/* Feature boxes — single grid so all rows are equal height */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: ActivityIcon, title: t("Real-time dashboard"), desc: t("See live visitors, top pages, referrers and sources as they happen.") },
            { icon: BanIcon, title: t("No cookies"), desc: t("Zero consent banners. Your visitors get a cleaner experience by default.") },
            { icon: LayersIcon, title: t("AI reports"), desc: t("Weekly and monthly plain-English summaries of what changed and why.") },
            { icon: ZapIcon, title: t("One-line setup"), desc: t("Paste one script tag and you're tracking. No configuration needed.") },

            { icon: PlayIcon, title: t("Session replay"), desc: t("Watch real user sessions to understand exactly how people use your site.") },
            { icon: ShieldCheckIcon, title: t("GDPR & CCPA ready"), desc: t("Privacy-first by design. Compliant out of the box, no lawyer required.") },
            { icon: BellIcon, title: t("Anomaly detection"), desc: t("Automatic spike and drop detection across sessions, pageviews and bounce rate.") },
            { icon: LinkIcon, title: t("Full REST API"), desc: t("Query your data programmatically and build custom integrations.") },

            { icon: ArrowDownIcon, title: t("Conversion funnels"), desc: t("Visualize where users drop off and fix the steps that cost you conversions.") },
            { icon: BotIcon, title: t("Bot filtering"), desc: t("Bots filtered automatically so your numbers reflect real humans.") },
            { icon: BotIcon, title: t("Ask AI via MCP"), desc: t("Connect Claude, Cursor or ChatGPT directly to your analytics data.") },
            { icon: LayersIcon, title: t("Custom events"), desc: t("Track signups, purchases, and any interaction that matters to your business.") },

            { icon: GaugeIcon, title: t("Web vitals"), desc: t("Monitor LCP, CLS and INP. Catch performance regressions before they hurt rankings.") },
            { icon: EarthIcon, title: t("Data export"), desc: t("Export your raw data anytime. Your data is yours — no lock-in, ever.") },
            { icon: Wifi, title: t("Uptime monitoring"), desc: t("HTTP, HTTPS, and TCP health checks with instant Slack, Discord, and email alerts when something goes down.") },
            { icon: UsersIcon, title: t("Team access"), desc: t("Invite teammates with role-based permissions per site.") },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-[#182235] border border-[#243146] rounded-lg p-5 hover:border-[#2FC7B8]/30 transition-colors flex flex-col gap-2"
            >
              <h3 className="font-semibold flex items-center gap-2 text-[#EAF1F8]">
                <Icon size={16} className="text-[#2FC7B8] shrink-0" />
                {title}
              </h3>
              <p className="text-sm text-[#A8B6C7] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* See it in action */}
      <section className="py-14 md:py-20 w-full max-w-[1200px] px-4 mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <SectionBadge className="mb-4">{t("See it in action")}</SectionBadge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{t("From data to insight")}</h2>
          <p className="mt-4 text-base md:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto font-light">
            {t("Eesee Metrics doesn't just show you numbers — it tells you what they mean.")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <LiveDashboard />
          <AnomalyDetection />
          <AiReportCard />
          <McpChatCard />
        </div>
      </section>

      {/* Reports & Alerts section */}
      <section className="py-14 md:py-20 w-full">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden border border-[#243146] bg-[#0D1322]">
            <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-[#2FC7B8]/8 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 p-8 md:p-14">
              <div className="text-center mb-10 md:mb-14">
                <SectionBadge className="mb-4">{t("Reports & Alerts")}</SectionBadge>
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#EAF1F8] mt-4">
                  {t("Your analytics, explained. Automatically.")}
                </h2>
                <p className="mt-3 text-[#A8B6C7] max-w-xl mx-auto text-base">
                  {t("Automated reports and anomaly detection built into every Pro and Scale account. No setup, no configuration — insights delivered automatically.")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Weekly Reports */}
                <div className="bg-[#121A2B] border border-[#243146] rounded-xl p-6 hover:border-[#2FC7B8]/40 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-[#2FC7B8]/12 border border-[#2FC7B8]/20 flex items-center justify-center mb-4">
                    <BotIcon size={16} className="text-[#2FC7B8]" />
                  </div>
                  <h3 className="font-semibold text-[#EAF1F8] mb-2">{t("Weekly reports, delivered automatically")}</h3>
                  <p className="text-sm text-[#A8B6C7] leading-relaxed">
                    {t("Every week, a plain-English summary lands in your inbox — top pages, top referrers, biggest changes versus the previous period. No dashboard required.")}
                  </p>
                  <div className="mt-5 pt-4 border-t border-[#243146] text-xs text-[#2FC7B8]">
                    {t("Weekly · Monthly · Quarterly · Yearly")}
                  </div>
                </div>

                {/* Anomaly Alerts */}
                <div className="bg-[#121A2B] border border-[#2FC7B8]/25 rounded-xl p-6 hover:border-[#2FC7B8]/50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-[#2FC7B8]/12 border border-[#2FC7B8]/20 flex items-center justify-center mb-4">
                    <BellIcon size={16} className="text-[#2FC7B8]" />
                  </div>
                  <h3 className="font-semibold text-[#EAF1F8] mb-2">{t("Anomaly detection, before you notice")}</h3>
                  <p className="text-sm text-[#A8B6C7] leading-relaxed">
                    {t("Your metrics are monitored around the clock. When sessions spike, conversions drop, or bounce rate shifts unexpectedly, you get notified — no thresholds to configure.")}
                  </p>
                  <div className="mt-5 pt-4 border-t border-[#243146] text-xs text-[#2FC7B8]">
                    {t("Daily detection · Severity levels")}
                  </div>
                </div>

                {/* MCP */}
                <div className="bg-[#121A2B] border border-[#243146] rounded-xl p-6 hover:border-[#2FC7B8]/40 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-[#2FC7B8]/12 border border-[#2FC7B8]/20 flex items-center justify-center mb-4">
                    <TerminalIcon size={16} className="text-[#2FC7B8]" />
                  </div>
                  <h3 className="font-semibold text-[#EAF1F8] mb-2">{t("Connect your AI tools to your data")}</h3>
                  <p className="text-sm text-[#A8B6C7] leading-relaxed">
                    {t("Plug Claude, Cursor, or any MCP-compatible tool directly into your analytics. Ask questions about your sessions, pages, and goals in plain English.")}
                  </p>
                  <div className="mt-5 pt-4 border-t border-[#243146] text-xs text-[#2FC7B8]">
                    {t("Works with Claude · Cursor · Windsurf")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-12 md:py-20 w-full">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-16">
            <div className="md:sticky md:top-24 md:self-start">
              <SectionBadge className="mb-4">{t("Integrations")}</SectionBadge>
              <h2 className="text-3xl md:text-4xl font-bold">{t("Works with everything")}</h2>
              <p className="mt-4 text-neutral-600 dark:text-neutral-300 font-light">
                {t("One snippet. Any platform. Up and running in under five minutes.")}
              </p>
            </div>
            <IntegrationsGrid />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 md:py-16 w-full">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-16">
            <div className="md:sticky md:top-24 md:self-start">
              <h2 className="text-3xl md:text-4xl font-bold">{t("Frequently Asked Questions")}</h2>
              <p className="mt-4 text-neutral-600 dark:text-neutral-300 font-light">
                {t("Everything you need to know about Eesee Metrics")}
              </p>
            </div>
            <FAQAccordion />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <LandingPricing />

      <CTASection />
    </>
  );
}
