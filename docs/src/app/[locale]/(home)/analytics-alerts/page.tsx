"use client";

import { BackgroundGrid } from "@/components/BackgroundGrid";
import { CTASection } from "@/components/CTASection";
import {
  Bell,
  BellDot,
  CheckCircle,
  Clock,
  Mail,
  MessageSquare,
  Rocket,
  Settings,
  TrendingDown,
  TrendingUp,
  Webhook,
  Zap,
} from "lucide-react";
import { useExtracted } from "next-intl";
import Link from "next/link";

export default function AnalyticsAlertsPage() {
  const t = useExtracted();

  return (
    <main className="flex flex-col items-center min-h-screen relative overflow-hidden">
      <BackgroundGrid />

      {/* Hero */}
      <section className="w-full relative z-10 pt-20 pb-16 px-4">
        <div className="max-w-[800px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2FC7B8]/30 bg-[#2FC7B8]/10 px-3 py-1 text-xs font-medium text-[#2FC7B8] mb-6">
            <BellDot className="w-3.5 h-3.5" />
            {t("Analytics alerts & notifications")}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-neutral-900 dark:text-[#EAF1F8]">
            {t("Know the moment something changes on your site")}
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-[600px] mx-auto leading-relaxed mb-8">
            {t("Eesee monitors your traffic 24/7 and pings you wherever you work — Slack, Discord, email, or webhooks — the moment sessions spike, drop, or something unusual happens.")}
          </p>
          <Link href="https://app.eeseemetrics.com/signup" target="_blank" className="inline-flex items-center gap-2 bg-[#2FC7B8] hover:bg-[#26B0A2] text-[#0D1322] font-semibold px-6 py-3 rounded-lg transition-colors">
            <Rocket className="w-4 h-4" />
            {t("Start free — no card needed")}
          </Link>
        </div>
      </section>

      {/* Anomaly detection */}
      <section className="w-full relative z-10 py-16 px-4 border-t border-neutral-200 dark:border-neutral-800/50">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-neutral-900 dark:text-[#EAF1F8]">
            {t("Automatic anomaly detection — no thresholds to set")}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-10 leading-relaxed">
            {t("Most alert systems make you guess the right threshold. Eesee learns your site's normal traffic patterns and flags deviations automatically — so you get alerted when something is actually unusual for your site, not just when it crosses an arbitrary number.")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <TrendingUp className="w-5 h-5" />,
                title: t("Traffic spikes"),
                desc: t("A sudden surge in sessions could mean a viral post, a product launch landing, or a bot attack. Eesee flags it so you can react immediately."),
                badge: t("Sessions +50%"),
                badgeColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
              },
              {
                icon: <TrendingDown className="w-5 h-5" />,
                title: t("Traffic drops"),
                desc: t("A steep drop in pageviews or sessions could signal a broken deployment, a Google penalty, or a referral source drying up. Catch it before it costs you."),
                badge: t("Pageviews −40%"),
                badgeColor: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: t("Bounce rate shifts"),
                desc: t("A sudden increase in bounce rate often means a page is broken, a campaign is sending the wrong audience, or a recent change hurt UX."),
                badge: t("Bounce rate +20%"),
                badgeColor: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
              },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-6">
                <div className="w-9 h-9 rounded-lg bg-[#2FC7B8]/10 flex items-center justify-center text-[#2FC7B8] mb-3">
                  {f.icon}
                </div>
                <div className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium mb-3 ${f.badgeColor}`}>
                  {f.badge}
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notification channels */}
      <section className="w-full relative z-10 py-16 px-4">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-neutral-900 dark:text-[#EAF1F8]">
            {t("Get notified wherever you work")}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-10 leading-relaxed">
            {t("Set up as many notification channels as you need. Route critical alerts to your team's Slack, send a copy to email, and wire up a webhook to trigger your own automations.")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: <MessageSquare className="w-5 h-5" />,
                title: "Slack",
                desc: t("Send alerts to any Slack channel via incoming webhook. Your whole team sees traffic anomalies in real time, right where they work."),
              },
              {
                icon: <MessageSquare className="w-5 h-5" />,
                title: "Discord",
                desc: t("Post alerts to a Discord channel or server. Great for teams, communities, and indie developers who live in Discord."),
              },
              {
                icon: <Mail className="w-5 h-5" />,
                title: t("Email"),
                desc: t("Classic email alerts delivered instantly. Add multiple email addresses and make sure the right person is always in the loop."),
              },
              {
                icon: <Webhook className="w-5 h-5" />,
                title: t("Webhooks"),
                desc: t("Send a structured JSON payload to any URL when an anomaly fires. Trigger your own automations, pipe into PagerDuty, or log to a custom system."),
              },
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

      {/* Smart controls */}
      <section className="w-full relative z-10 py-16 px-4 border-t border-neutral-200 dark:border-neutral-800/50">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-neutral-900 dark:text-[#EAF1F8]">
            {t("Smart controls — no noise, just signal")}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-8 leading-relaxed">
            {t("Alerts are only useful if they don't become noise. Eesee's notification system is designed to give you the important ones and silence the rest.")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <Clock className="w-5 h-5" />,
                title: t("Cooldown periods"),
                desc: t("Set a cooldown so the same alert can't fire more than once every N minutes. One notification per incident, not one per data point."),
              },
              {
                icon: <Settings className="w-5 h-5" />,
                title: t("Per-channel configuration"),
                desc: t("Each notification channel has its own settings. Route spike alerts to Slack and send the daily summary to email only."),
              },
              {
                icon: <Bell className="w-5 h-5" />,
                title: t("Severity levels"),
                desc: t("Anomalies are graded low, medium, or high. Set channels to only receive high-severity alerts if you want to keep things quiet."),
              },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-5">
                <div className="w-9 h-9 rounded-lg bg-[#2FC7B8]/10 flex items-center justify-center text-[#2FC7B8] mb-3">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{f.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Always on */}
      <section className="w-full relative z-10 py-12 px-4">
        <div className="max-w-[860px] mx-auto">
          <div className="rounded-xl border border-[#2FC7B8]/30 bg-[#2FC7B8]/5 p-8">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-[#EAF1F8] mb-3">
              {t("Always-on monitoring — even when you're not watching")}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-6">
              {t("You don't have to be logged into your dashboard for Eesee to be working. Anomaly detection runs continuously in the background. The moment your traffic does something unexpected — whether you're in a meeting, asleep, or on holiday — Eesee will let you know.")}
            </p>
            <div className="space-y-2">
              {[
                t("Monitoring runs 24/7, no configuration needed"),
                t("Alerts fire within minutes of an anomaly being detected"),
                t("Works across all your sites from a single account"),
                t("No agents or integrations to maintain"),
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#2FC7B8] shrink-0" />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  );
}
