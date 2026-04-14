"use client";

import { BackgroundGrid } from "@/components/BackgroundGrid";
import { CTASection } from "@/components/CTASection";
import {
  BarChart2,
  CheckCircle,
  Clock,
  Globe2,
  LayoutDashboard,
  MousePointerClick,
  Rocket,
  Smile,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useExtracted } from "next-intl";
import Link from "next/link";

export default function SimpleWebAnalyticsPage() {
  const t = useExtracted();

  return (
    <main className="flex flex-col items-center min-h-screen relative overflow-hidden">
      <BackgroundGrid />

      {/* Hero */}
      <section className="w-full relative z-10 pt-20 pb-16 px-4">
        <div className="max-w-[800px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2FC7B8]/30 bg-[#2FC7B8]/10 px-3 py-1 text-xs font-medium text-[#2FC7B8] mb-6">
            <LayoutDashboard className="w-3.5 h-3.5" />
            {t("Simple web analytics")}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-neutral-900 dark:text-[#EAF1F8]">
            {t("Analytics that doesn't require a manual")}
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-[600px] mx-auto leading-relaxed mb-8">
            {t("Google Analytics has 125+ reports and 290+ metrics. Eesee gives you one dashboard with exactly what you need — and nothing you don't.")}
          </p>
          <Link href="https://app.eeseemetrics.com/signup" target="_blank" className="inline-flex items-center gap-2 bg-[#2FC7B8] hover:bg-[#26B0A2] text-[#0D1322] font-semibold px-6 py-3 rounded-lg transition-colors">
            <Rocket className="w-4 h-4" />
            {t("Start free — no card needed")}
          </Link>
        </div>
      </section>

      {/* The complexity problem */}
      <section className="w-full relative z-10 py-16 px-4 border-t border-neutral-200 dark:border-neutral-800/50">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-neutral-900 dark:text-[#EAF1F8]">
            {t("Google Analytics is overwhelming by design")}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-8 leading-relaxed">
            {t("GA4 was built to serve advertisers, not website owners. It surfaces data that helps ad targeting — not data that helps you grow. The result is a tool with hundreds of reports, a steep learning curve, and hours wasted trying to find a single number.")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: t("Reports in GA4"), value: "125+", note: t("Most of which you'll never open") },
              { label: t("Metrics available"), value: "290+", note: t("Requiring a PhD to interpret") },
              { label: t("Average setup time"), value: "3–5 hrs", note: t("With Google Tag Manager") },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-6 text-center">
                <div className="text-3xl font-bold text-neutral-900 dark:text-[#EAF1F8] mb-1">{s.value}</div>
                <div className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{s.label}</div>
                <div className="text-xs text-neutral-500">{s.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you actually need */}
      <section className="w-full relative z-10 py-16 px-4">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-neutral-900 dark:text-[#EAF1F8]">
            {t("Everything you need. Nothing you don't.")}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-10 leading-relaxed">
            {t("Eesee loads in one dashboard. You see your most important metrics the moment you log in — no setup, no configuration, no digging.")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: <TrendingUp className="w-5 h-5" />, title: t("Sessions & pageviews"), desc: t("See exactly how much traffic you're getting and how it's trending over any time range.") },
              { icon: <Users className="w-5 h-5" />, title: t("Unique visitors"), desc: t("Understand your real audience size without double-counting the same person.") },
              { icon: <Globe2 className="w-5 h-5" />, title: t("Traffic sources"), desc: t("Know whether traffic comes from Google, social media, direct, or referrals — at a glance.") },
              { icon: <BarChart2 className="w-5 h-5" />, title: t("Top pages"), desc: t("See which pages attract the most visitors and how long they stay.") },
              { icon: <MousePointerClick className="w-5 h-5" />, title: t("Devices & browsers"), desc: t("Know what devices your visitors use so you can optimise for the majority.") },
              { icon: <CheckCircle className="w-5 h-5" />, title: t("Bounce rate & duration"), desc: t("Quickly spot which pages engage visitors and which ones are losing them.") },
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

      {/* Setup simplicity */}
      <section className="w-full relative z-10 py-16 px-4 border-t border-neutral-200 dark:border-neutral-800/50">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-neutral-900 dark:text-[#EAF1F8]">
            {t("Up and running in under 2 minutes")}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-10 leading-relaxed">
            {t("No tag manager. No verification step. No waiting 24 hours for data to appear. Paste one script tag and you're live.")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Clock className="w-5 h-5" />, step: "1", title: t("Sign up"), desc: t("Create your account and add your site in 30 seconds.") },
              { icon: <Zap className="w-5 h-5" />, step: "2", title: t("Add the script"), desc: t("Paste one line of HTML into your site's <head>. Works on any platform.") },
              { icon: <Smile className="w-5 h-5" />, step: "3", title: t("See your data"), desc: t("Your dashboard populates in real time. No waiting, no processing delay.") },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-6">
                <div className="w-8 h-8 rounded-full bg-[#2FC7B8]/10 text-[#2FC7B8] text-sm font-bold flex items-center justify-center mb-4">{s.step}</div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{s.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple doesn't mean limited */}
      <section className="w-full relative z-10 py-16 px-4">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-neutral-900 dark:text-[#EAF1F8]">
            {t("Simple doesn't mean limited")}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-8 leading-relaxed">
            {t("Eesee keeps the interface simple while offering powerful features when you need them — session replay, funnels, AI reports, goal tracking, and more. You only see complexity when you go looking for it.")}
          </p>
          <div className="space-y-3">
            {[
              t("Session replay — watch real recordings of how users interact with your site"),
              t("Funnels — see exactly where visitors drop off before converting"),
              t("AI weekly reports — plain-English summaries of your traffic, delivered every week"),
              t("Goal tracking — measure what matters: form submissions, clicks, scroll depth"),
              t("Anomaly alerts — get notified by email or Slack when traffic spikes or drops"),
              t("User journeys — map the most common paths through your site"),
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#2FC7B8] shrink-0 mt-0.5" />
                <span className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-neutral-500 dark:text-neutral-400">
            {t("Want the full list? ")}{" "}
            <Link href="/features" className="text-[#2FC7B8] hover:underline">{t("See all features →")}</Link>
          </p>
        </div>
      </section>

      <CTASection />
    </main>
  );
}
