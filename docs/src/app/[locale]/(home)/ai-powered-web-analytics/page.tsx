"use client";

import { BackgroundGrid } from "@/components/BackgroundGrid";
import { CTASection } from "@/components/CTASection";
import {
  Bot,
  CheckCircle,
  Code2,
  Mail,
  Rocket,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useExtracted } from "next-intl";
import Link from "next/link";

export default function AiPoweredWebAnalyticsPage() {
  const t = useExtracted();

  return (
    <main className="flex flex-col items-center min-h-screen relative overflow-hidden">
      <BackgroundGrid />

      {/* Hero */}
      <section className="w-full relative z-10 pt-20 pb-16 px-4">
        <div className="max-w-[800px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2FC7B8]/30 bg-[#2FC7B8]/10 px-3 py-1 text-xs font-medium text-[#2FC7B8] mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            {t("AI-powered web analytics")}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-neutral-900 dark:text-[#EAF1F8]">
            {t("Analytics that reads itself — so you don't have to")}
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-[600px] mx-auto leading-relaxed mb-8">
            {t("Eesee generates weekly plain-English reports, monitors your traffic for anomalies, and connects your analytics to Claude, Cursor, and other AI tools in real time.")}
          </p>
          <Link href="https://app.eeseemetrics.com/signup" target="_blank" className="inline-flex items-center gap-2 bg-[#2FC7B8] hover:bg-[#26B0A2] text-[#0D1322] font-semibold px-6 py-3 rounded-lg transition-colors">
            <Rocket className="w-4 h-4" />
            {t("Start free — no card needed")}
          </Link>
        </div>
      </section>

      {/* Weekly reports */}
      <section className="w-full relative z-10 py-16 px-4 border-t border-neutral-200 dark:border-neutral-800/50">
        <div className="max-w-[860px] mx-auto">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#2FC7B8]/10 flex items-center justify-center text-[#2FC7B8] shrink-0 mt-1">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-neutral-900 dark:text-[#EAF1F8]">
                {t("Weekly AI reports, delivered automatically")}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed">
                {t("Every week, Eesee generates a plain-English summary of your traffic — no dashboards to dig through, no metrics to interpret. Just clear insights in your inbox.")}
              </p>
            </div>
          </div>

          {/* Mock report card */}
          <div className="rounded-xl border border-[#2FC7B8]/30 bg-neutral-50 dark:bg-neutral-900/80 p-6 my-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-[#2FC7B8]/10 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#2FC7B8]" />
              </div>
              <span className="text-xs font-semibold text-[#2FC7B8] uppercase tracking-wide">{t("Example weekly report excerpt")}</span>
            </div>
            <p className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed mb-4 italic">
              {t("\"Sessions rose 34% this week, the strongest growth in the past month. The /pricing page was your top entry point, accounting for 28% of all sessions. Bounce rate climbed to 71%, suggesting visitors aren't finding what they expect on landing — consider reviewing the above-the-fold content.\"")}
            </p>
            <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: t("Sessions"), value: "+34%" },
                { label: t("Top entry page"), value: "/pricing" },
                { label: t("Bounce rate"), value: "↑ 71%" },
                { label: t("Highlights"), value: "8" },
              ].map((m, i) => (
                <div key={i} className="text-center">
                  <div className="text-base font-bold text-neutral-900 dark:text-neutral-100">{m.value}</div>
                  <div className="text-xs text-neutral-500">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: <TrendingUp className="w-5 h-5" />, title: t("Traffic highlights"), desc: t("Sessions, pageviews, unique visitors, bounce rate — all summarised with context about whether changes are meaningful.") },
              { icon: <Zap className="w-5 h-5" />, title: t("Actionable recommendations"), desc: t("Reports don't just show numbers — each one includes 3–5 specific, data-backed recommendations on what to do next.") },
              { icon: <CheckCircle className="w-5 h-5" />, title: t("Channel & page analysis"), desc: t("Scale-tier reports include channel mix shifts, top page movers, entry→next page flows, campaign performance, and multi-period trend history.") },
              { icon: <Mail className="w-5 h-5" />, title: t("Delivered to your inbox"), desc: t("Reports land in your email automatically every week. No need to log in to stay informed.") },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-5">
                <div className="w-9 h-9 rounded-lg bg-[#2FC7B8]/10 flex items-center justify-center text-[#2FC7B8] shrink-0 mt-0.5">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{f.title}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MCP */}
      <section className="w-full relative z-10 py-16 px-4 border-t border-neutral-200 dark:border-neutral-800/50">
        <div className="max-w-[860px] mx-auto">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#2FC7B8]/10 flex items-center justify-center text-[#2FC7B8] shrink-0 mt-1">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-neutral-900 dark:text-[#EAF1F8]">
                {t("Ask your analytics anything — from any AI tool")}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed">
                {t("Eesee exposes a Model Context Protocol (MCP) server so your analytics data is available inside Claude, Cursor, and any MCP-compatible AI tool. Ask questions in plain English and get live answers from your real data.")}
              </p>
            </div>
          </div>

          {/* Mock chat */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 p-6 my-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-bold text-neutral-600 dark:text-neutral-300 shrink-0">U</div>
              <div className="bg-white dark:bg-neutral-800 rounded-lg px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                {t("Which pages drove the most conversions last month and what were their top referrers?")}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#2FC7B8]/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-[#2FC7B8]" />
              </div>
              <div className="bg-[#2FC7B8]/5 border border-[#2FC7B8]/20 rounded-lg px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 italic">
                {t("\"Last month /pricing drove 61% of goal completions, primarily from organic search (google.com) at 44% and direct traffic at 22%. /docs/getting-started contributed another 18%, mostly via referrals from dev.to and GitHub.\"")}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: t("Claude & Claude.ai"), desc: t("Query your analytics directly inside Claude using the MCP integration.") },
              { title: t("Cursor"), desc: t("Query your analytics from inside your code editor while you build.") },
              { title: t("Any MCP client"), desc: t("The Eesee MCP server works with any tool that supports the Model Context Protocol.") },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-5">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{f.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-neutral-500">
            <Link href="/docs/mcp" className="text-[#2FC7B8] hover:underline">{t("Read the MCP setup guide →")}</Link>
          </p>
        </div>
      </section>

      {/* Pro vs Scale */}
      <section className="w-full relative z-10 py-16 px-4">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-neutral-900 dark:text-[#EAF1F8]">
            {t("Reports that grow with you")}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-8 leading-relaxed">
            {t("Pro gets weekly AI reports with traffic summaries and recommendations. Scale unlocks deeper analysis including channel mix shifts, page movers, campaign performance, goal trend comparisons, and multi-period history.")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-6">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">{t("Pro plan")}</div>
              <ul className="space-y-2">
                {[
                  t("Weekly traffic summary"),
                  t("Up to 4 highlights"),
                  t("3 actionable recommendations"),
                  t("Top pages, referrers, countries"),
                  t("Email delivery"),
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <CheckCircle className="w-4 h-4 text-[#2FC7B8] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-[#2FC7B8]/40 bg-[#2FC7B8]/5 dark:bg-[#2FC7B8]/5 p-6">
              <div className="text-xs font-semibold text-[#2FC7B8] uppercase tracking-wide mb-3">{t("Scale plan")}</div>
              <ul className="space-y-2">
                {[
                  t("Everything in Pro"),
                  t("Up to 8 highlights"),
                  t("5 actionable recommendations"),
                  t("Channel mix shift analysis"),
                  t("Top page movers vs prior period"),
                  t("Goal trend + top conversion channels"),
                  t("Campaign performance (UTM)"),
                  t("Multi-period trend history"),
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                    <CheckCircle className="w-4 h-4 text-[#2FC7B8] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  );
}
