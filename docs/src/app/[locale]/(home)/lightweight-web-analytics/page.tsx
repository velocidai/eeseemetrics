"use client";

import { BackgroundGrid } from "@/components/BackgroundGrid";
import { CTASection } from "@/components/CTASection";
import {
  CheckCircle,
  Gauge,
  Rocket,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useExtracted } from "next-intl";
import Link from "next/link";

export default function LightweightWebAnalyticsPage() {
  const t = useExtracted();

  const scripts = [
    { name: "Eesee Metrics", size: "< 5 KB", color: "#2FC7B8", width: "6%" },
    { name: "Plausible", size: "~1 KB", color: "#6366f1", width: "2%" },
    { name: "Fathom", size: "~3 KB", color: "#22c55e", width: "4%" },
    { name: "Matomo", size: "~23 KB", color: "#f59e0b", width: "30%" },
    { name: "Google Analytics 4", size: "~73 KB", color: "#ef4444", width: "92%" },
  ];

  return (
    <main className="flex flex-col items-center min-h-screen relative overflow-hidden">
      <BackgroundGrid />

      {/* Hero */}
      <section className="w-full relative z-10 pt-20 pb-16 px-4">
        <div className="max-w-[800px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2FC7B8]/30 bg-[#2FC7B8]/10 px-3 py-1 text-xs font-medium text-[#2FC7B8] mb-6">
            <Zap className="w-3.5 h-3.5" />
            {t("Lightweight web analytics")}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-neutral-900 dark:text-[#EAF1F8]">
            {t("Analytics that won't slow your site down")}
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-[600px] mx-auto leading-relaxed mb-8">
            {t("Google Analytics adds 73 KB to every page load. Eesee adds under 5 KB. That's a 15× difference — and your Core Web Vitals will thank you for it.")}
          </p>
          <Link href="https://app.eeseemetrics.com/signup" target="_blank" className="inline-flex items-center gap-2 bg-[#2FC7B8] hover:bg-[#26B0A2] text-[#0D1322] font-semibold px-6 py-3 rounded-lg transition-colors">
            <Rocket className="w-4 h-4" />
            {t("Start free — no card needed")}
          </Link>
        </div>
      </section>

      {/* Script size comparison */}
      <section className="w-full relative z-10 py-16 px-4 border-t border-neutral-200 dark:border-neutral-800/50">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-neutral-900 dark:text-[#EAF1F8]">
            {t("Script size comparison")}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-10 leading-relaxed">
            {t("Every kilobyte of JavaScript your browser has to download, parse, and execute adds latency. Analytics should never be the bottleneck.")}
          </p>
          <div className="space-y-4">
            {scripts.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{s.name}</span>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{s.size}</span>
                </div>
                <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: s.width, backgroundColor: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-4">{t("Script sizes are approximate and measured at time of writing. GA4 includes gtag.js + analytics.js payload.")}</p>
        </div>
      </section>

      {/* Why size matters */}
      <section className="w-full relative z-10 py-16 px-4">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-neutral-900 dark:text-[#EAF1F8]">
            {t("Why script size actually matters")}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-10 leading-relaxed">
            {t("A heavier analytics script doesn't just slow down your page — it directly affects the metrics Google uses to rank you.")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <Gauge className="w-5 h-5" />,
                title: t("Core Web Vitals"),
                desc: t("LCP, INP, and CLS are all affected by blocking JavaScript. A large analytics script loaded in <head> can add hundreds of milliseconds to your LCP."),
              },
              {
                icon: <TrendingDown className="w-5 h-5" />,
                title: t("Bounce rate"),
                desc: t("Studies consistently show that a 1-second delay in page load increases bounce rate by 32%. Lighter analytics means faster pages means fewer people leaving immediately."),
              },
              {
                icon: <TrendingUp className="w-5 h-5" />,
                title: t("Search rankings"),
                desc: t("Google uses Core Web Vitals as a ranking signal. A slow analytics script is working against your SEO while trying to measure it."),
              },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-6">
                <div className="w-9 h-9 rounded-lg bg-[#2FC7B8]/10 flex items-center justify-center text-[#2FC7B8] mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Eesee stays small */}
      <section className="w-full relative z-10 py-16 px-4 border-t border-neutral-200 dark:border-neutral-800/50">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-neutral-900 dark:text-[#EAF1F8]">
            {t("How Eesee stays under 5 KB")}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-8 leading-relaxed">
            {t("GA4 is large because it's doing things analytics shouldn't need to do — advertising attribution, cross-device identity graphs, audience building for Google Ads. Eesee does exactly one job: measure your site traffic. That simplicity shows in the script size.")}
          </p>
          <div className="space-y-3">
            {[
              t("No advertising SDK — we have no ad network to feed"),
              t("No cross-device identity graph — no need to track the same person everywhere"),
              t("No A/B testing runtime — that belongs in a dedicated tool"),
              t("No tag manager dependency — one script does everything"),
              t("Aggressively minified and compressed at the edge"),
              t("Loaded asynchronously — never blocks page render"),
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#2FC7B8] shrink-0 mt-0.5" />
                <span className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="w-full relative z-10 py-12 px-4">
        <div className="max-w-[860px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: "< 5 KB", label: t("Script size"), note: t("vs 73 KB for GA4") },
              { value: "async", label: t("Loading strategy"), note: t("Never blocks page render") },
              { value: "0", label: t("Render-blocking requests"), note: t("Zero impact on LCP") },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-6 text-center">
                <div className="text-3xl font-bold text-[#2FC7B8] mb-1">{s.value}</div>
                <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">{s.label}</div>
                <div className="text-xs text-neutral-500">{s.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  );
}
