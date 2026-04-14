"use client";

import { BackgroundGrid } from "@/components/BackgroundGrid";
import { CTASection } from "@/components/CTASection";
import {
  Ban,
  CheckCircle,
  Cookie,
  Database,
  EyeOff,
  Globe2,
  Lock,
  Rocket,
  Server,
  Shield,
  ShieldCheck,
  UserX,
} from "lucide-react";
import { useExtracted } from "next-intl";
import Link from "next/link";

export default function PrivacyFocusedWebAnalyticsPage() {
  const t = useExtracted();

  return (
    <main className="flex flex-col items-center min-h-screen relative overflow-hidden">
      <BackgroundGrid />

      {/* Hero */}
      <section className="w-full relative z-10 pt-20 pb-16 px-4">
        <div className="max-w-[800px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2FC7B8]/30 bg-[#2FC7B8]/10 px-3 py-1 text-xs font-medium text-[#2FC7B8] mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t("Privacy-focused web analytics")}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-neutral-900 dark:text-[#EAF1F8]">
            {t("Analytics your visitors won't hate you for")}
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-[600px] mx-auto leading-relaxed mb-8">
            {t("No cookies. No consent banners. No tracking across sites. Eesee gives you accurate analytics while fully respecting the privacy of every visitor.")}
          </p>
          <Link href="https://app.eeseemetrics.com/signup" target="_blank" className="inline-flex items-center gap-2 bg-[#2FC7B8] hover:bg-[#26B0A2] text-[#0D1322] font-semibold px-6 py-3 rounded-lg transition-colors">
            <Rocket className="w-4 h-4" />
            {t("Start free — no card needed")}
          </Link>
        </div>
      </section>

      {/* The cookie problem */}
      <section className="w-full relative z-10 py-16 px-4 border-t border-neutral-200 dark:border-neutral-800/50">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-neutral-900 dark:text-[#EAF1F8]">
            {t("Traditional analytics breaks privacy laws")}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-8 leading-relaxed">
            {t("Google Analytics uses cookies to track visitors across sessions and devices. Under GDPR, PECR, and similar laws, this requires explicit consent before any tracking starts — meaning a cookie banner on every page. Visitors click 'reject', your data becomes incomplete, and your UX suffers.")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: t("Visitors who reject cookies"), value: "~40%", note: t("Data you never see with GA") },
              { label: t("Countries with consent laws"), value: "100+", note: t("And growing every year") },
              { label: t("Max GDPR fine"), value: "€20M", note: t("Or 4% of global turnover") },
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

      {/* How Eesee handles privacy */}
      <section className="w-full relative z-10 py-16 px-4">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-neutral-900 dark:text-[#EAF1F8]">
            {t("How Eesee works without cookies")}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-10 leading-relaxed">
            {t("Instead of setting persistent cookies, Eesee identifies unique visitors using a daily rotating hash of anonymised signals — IP address, user agent, and a random salt. No personal data is stored. No visitor can be identified. No cross-site tracking is possible.")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: <Cookie className="w-5 h-5" />, title: t("No cookies set"), desc: t("Eesee sets zero cookies on your visitors' browsers. There is nothing to consent to.") },
              { icon: <UserX className="w-5 h-5" />, title: t("No personal data collected"), desc: t("We never store IP addresses, names, emails, or any data that could identify an individual.") },
              { icon: <EyeOff className="w-5 h-5" />, title: t("No cross-site tracking"), desc: t("Eesee only tracks visitors on your site. We have no advertising network and no interest in following people around the web.") },
              { icon: <Database className="w-5 h-5" />, title: t("Data belongs to you"), desc: t("Your analytics data is yours. We don't sell it, share it, or use it to build profiles. You can export or delete it at any time.") },
              { icon: <Globe2 className="w-5 h-5" />, title: t("EU-hosted infrastructure"), desc: t("All data is processed and stored in Europe. No transatlantic transfers, no Schrems II complications.") },
              { icon: <Ban className="w-5 h-5" />, title: t("No consent banner needed"), desc: t("Because no personal data is collected and no cookies are set, Eesee is exempt from cookie consent requirements in most jurisdictions.") },
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

      {/* Compliance */}
      <section className="w-full relative z-10 py-16 px-4 border-t border-neutral-200 dark:border-neutral-800/50">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-neutral-900 dark:text-[#EAF1F8]">
            {t("Compliant out of the box")}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-8 leading-relaxed">
            {t("Eesee's cookieless approach means you can run accurate analytics without a cookie consent banner and without legal risk — in the EU, UK, US, and most other jurisdictions.")}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["GDPR", "PECR", "CCPA", "LGPD"].map((law) => (
              <div key={law} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 p-5 text-center">
                <Shield className="w-6 h-6 text-[#2FC7B8] mx-auto mb-2" />
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{law}</div>
                <div className="text-xs text-neutral-500 mt-1">{t("Compliant")}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {t("We recommend consulting your own legal counsel for specific compliance questions, but Eesee's data model is designed from the ground up to require no personal data and no consent mechanism.")}
          </p>
        </div>
      </section>

      {/* Accurate data */}
      <section className="w-full relative z-10 py-16 px-4">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-neutral-900 dark:text-[#EAF1F8]">
            {t("More accurate data, not less")}
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-6 leading-relaxed">
            {t("Privacy-first doesn't mean less data. Because Eesee doesn't require consent, it captures traffic that GA4 completely misses — visitors who reject cookies, use ad blockers, or browse in private mode.")}
          </p>
          <div className="space-y-3">
            {[
              t("No consent gate means 100% of your traffic is counted"),
              t("Ad blocker-resistant — no third-party domains to block"),
              t("Works in private/incognito mode"),
              t("No data sampling — every session, every pageview"),
              t("Real-time data with no 24–48 hour processing lag"),
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#2FC7B8] shrink-0 mt-0.5" />
                <span className="text-neutral-700 dark:text-neutral-300 text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  );
}
