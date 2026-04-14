import { BackgroundGrid } from "@/components/BackgroundGrid";
import { CTASection } from "@/components/CTASection";
import { createMetadata, createOGImageUrl } from "@/lib/metadata";
import {
  Ban,
  Bot,
  CheckCircle,
  Clock,
  Code2,
  Cookie,
  DollarSign,
  Eye,
  Globe2,
  Lock,
  Server,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import { useExtracted } from "next-intl";
import Link from "next/link";

export const metadata: Metadata = createMetadata({
  title: "Why Eesee Metrics",
  description:
    "Discover why Eesee Metrics is the smarter choice for analytics — privacy-first, blazing fast, no cookie banners, and powered by AI insights. No sampling. No bloat.",
  openGraph: {
    images: [
      createOGImageUrl(
        "Why Eesee Metrics",
        "Privacy-first analytics. No cookie banners. AI-powered insights. Simple pricing.",
        "Why Eesee"
      ),
    ],
  },
  twitter: {
    images: [
      createOGImageUrl(
        "Why Eesee Metrics",
        "Privacy-first analytics. No cookie banners. AI-powered insights. Simple pricing.",
        "Why Eesee"
      ),
    ],
  },
});

interface ReasonCardProps {
  icon: React.ReactNode;
  title: string;
  body: string;
}

function ReasonCard({ icon, title, body }: ReasonCardProps) {
  return (
    <div className="bg-neutral-100/50 dark:bg-neutral-800/20 border border-neutral-300/50 dark:border-neutral-800/50 rounded-xl p-6 flex flex-col gap-4">
      <div className="w-10 h-10 rounded-lg bg-[#2FC7B8]/10 flex items-center justify-center text-[#2FC7B8] shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-base mb-2 text-neutral-900 dark:text-neutral-100">{title}</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

interface CompareRowProps {
  feature: string;
  eesee: string;
  google: string;
  good: boolean;
}

function CompareRow({ feature, eesee, google, good }: CompareRowProps) {
  return (
    <tr className="border-b border-neutral-200 dark:border-neutral-800 last:border-0">
      <td className="py-3 pr-4 text-sm text-neutral-700 dark:text-neutral-300 font-medium">{feature}</td>
      <td className="py-3 px-4 text-sm">
        <span className={`flex items-center gap-1.5 ${good ? "text-[#2FC7B8]" : "text-neutral-600 dark:text-neutral-400"}`}>
          <CheckCircle className="w-4 h-4 shrink-0" />
          {eesee}
        </span>
      </td>
      <td className="py-3 pl-4 text-sm">
        <span className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-500">
          <Ban className="w-4 h-4 shrink-0" />
          {google}
        </span>
      </td>
    </tr>
  );
}

export default function WhyEeseePage() {
  const t = useExtracted();

  const reasons = [
    {
      icon: <Cookie className="w-5 h-5" />,
      title: t("No cookie banners required"),
      body: t(
        "Eesee uses cookieless tracking by default. No consent popups, no GDPR overhead, no annoying banners that ruin your UX — and you still get accurate data."
      ),
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: t("Built for privacy from day one"),
      body: t(
        "We never sell your data or your visitors' data. No cross-site tracking. No advertising network. Your analytics stay yours."
      ),
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: t("Lightweight script — under 5 KB"),
      body: t(
        "Our tracking script is tiny. It won't slow down your site or hurt your Core Web Vitals. Google Analytics adds 50–80 KB. We add under 5 KB."
      ),
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: t("No data sampling"),
      body: t(
        "Google Analytics samples your data at scale. Eesee shows you every single session, pageview, and event — 100% of your real traffic, always."
      ),
    },
    {
      icon: <Bot className="w-5 h-5" />,
      title: t("AI-powered weekly reports"),
      body: t(
        "Eesee generates plain-English weekly reports with highlights, anomalies, and specific recommendations — so you don't have to dig through dashboards."
      ),
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: t("Understand behaviour, not just traffic"),
      body: t(
        "Session replay, funnels, user journeys, retention cohorts, and goal tracking — all in one place. See what people actually do on your site, not just how many showed up."
      ),
    },
    {
      icon: <Globe2 className="w-5 h-5" />,
      title: t("Real-time, worldwide"),
      body: t(
        "See sessions arriving live on an interactive 3D globe. Real-time dashboards update without page refreshes so you always know what's happening right now."
      ),
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: t("Simple, honest pricing"),
      body: t(
        "One monthly price. No per-seat fees, no event quotas that spike your bill, no surprise overages. Upgrade or downgrade whenever you want."
      ),
    },
    {
      icon: <Code2 className="w-5 h-5" />,
      title: t("Works with everything"),
      body: t(
        "Drop in one script tag. Works with Next.js, React, Vue, WordPress, Webflow, Shopify, and any other platform. SDKs and REST API included for custom integrations."
      ),
    },
  ];

  return (
    <main className="flex flex-col items-center min-h-screen relative overflow-hidden">
      <BackgroundGrid />

      {/* Hero */}
      <section className="w-full relative z-10 pt-20 pb-16 px-4">
        <div className="max-w-[860px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2FC7B8]/30 bg-[#2FC7B8]/10 px-3 py-1 text-xs font-medium text-[#2FC7B8] mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            {t("The smarter analytics choice")}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-neutral-900 dark:text-[#EAF1F8]">
            {t("Why choose Eesee Metrics?")}
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-[640px] mx-auto leading-relaxed">
            {t(
              "Most analytics tools were built to serve ad networks, not you. Eesee was built to give you clear, accurate insights — without the baggage."
            )}
          </p>
        </div>
      </section>

      {/* Reasons grid */}
      <section className="w-full relative z-10 py-12 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reasons.map((r, i) => (
              <ReasonCard key={i} {...r} />
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="w-full relative z-10 py-16 px-4">
        <div className="max-w-[860px] mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-neutral-900 dark:text-[#EAF1F8]">
              {t("Eesee vs Google Analytics")}
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              {t("A direct comparison on the things that actually matter.")}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="grid grid-cols-3 bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
              <div className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t("Feature")}</div>
              <div className="py-3 px-4 text-xs font-semibold text-[#2FC7B8] uppercase tracking-wider">{t("Eesee Metrics")}</div>
              <div className="py-3 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">{t("Google Analytics 4")}</div>
            </div>
            <div className="bg-white dark:bg-neutral-950 px-4">
              <table className="w-full">
                <tbody>
                  <CompareRow
                    feature={t("Cookie consent required")}
                    eesee={t("Never")}
                    google={t("Required in most regions")}
                    good={true}
                  />
                  <CompareRow
                    feature={t("Data sampling")}
                    eesee={t("None — 100% of your data")}
                    google={t("Yes, at scale")}
                    good={true}
                  />
                  <CompareRow
                    feature={t("Script weight")}
                    eesee={t("< 5 KB")}
                    google={t("50–80 KB")}
                    good={true}
                  />
                  <CompareRow
                    feature={t("Data ownership")}
                    eesee={t("Yours, always")}
                    google={t("Google's servers")}
                    good={true}
                  />
                  <CompareRow
                    feature={t("Setup time")}
                    eesee={t("Under 2 minutes")}
                    google={t("Hours + GTM configuration")}
                    good={true}
                  />
                  <CompareRow
                    feature={t("Session replay")}
                    eesee={t("Built in")}
                    google={t("Not available")}
                    good={true}
                  />
                  <CompareRow
                    feature={t("AI insights")}
                    eesee={t("Weekly plain-English reports")}
                    google={t("Limited automated insights")}
                    good={true}
                  />
                  <CompareRow
                    feature={t("Real-time data")}
                    eesee={t("Live, no delay")}
                    google={t("24–48 hr processing delay")}
                    good={true}
                  />
                  <CompareRow
                    feature={t("Pricing model")}
                    eesee={t("Flat monthly rate")}
                    google={t("Free with data as the cost")}
                    good={true}
                  />
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-center text-sm text-neutral-500 mt-4">
            {t("Want a full comparison? ")}{" "}
            <Link href="/compare/google-analytics" className="text-[#2FC7B8] hover:underline">
              {t("See the detailed breakdown →")}
            </Link>
          </p>
        </div>
      </section>

      {/* Trust signals */}
      <section className="w-full relative z-10 py-12 px-4">
        <div className="max-w-[1000px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-6 text-center">
              <Lock className="w-6 h-6 text-[#2FC7B8] mx-auto mb-3" />
              <h3 className="font-semibold mb-1 text-neutral-900 dark:text-neutral-100">{t("GDPR & PECR compliant")}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {t("No personal data collected. No cross-site tracking. Works without a cookie banner.")}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-6 text-center">
              <Server className="w-6 h-6 text-[#2FC7B8] mx-auto mb-3" />
              <h3 className="font-semibold mb-1 text-neutral-900 dark:text-neutral-100">{t("EU-hosted infrastructure")}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {t("Your data is processed and stored in Europe. No transatlantic data transfers.")}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-6 text-center">
              <Clock className="w-6 h-6 text-[#2FC7B8] mx-auto mb-3" />
              <h3 className="font-semibold mb-1 text-neutral-900 dark:text-neutral-100">{t("Up and running in minutes")}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {t("Paste one script tag and you're live. No tag manager, no configuration, no waiting.")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  );
}
