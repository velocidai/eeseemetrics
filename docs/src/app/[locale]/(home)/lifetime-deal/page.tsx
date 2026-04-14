import type { Metadata } from "next";
import {
  Activity,
  Bot,
  Check,
  Database,
  ExternalLink,
  Github,
  Globe2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Target,
  Wifi,
  Zap,
} from "lucide-react";
import { BackgroundGrid } from "@/components/BackgroundGrid";
import { LTD_CONFIG } from "@/lib/ltd-config";
import { CountdownTimer } from "./components/CountdownTimer";
import { LtdFaq } from "./components/LtdFaq";
import { LtdUpgradeSection } from "./components/LtdUpgradeSection";

export const metadata: Metadata = {
  title: "eesee metrics Lifetime Deal — Privacy-First Web Analytics, Pay Once",
  description:
    "Get lifetime access to eesee metrics. GDPR-compliant, cookieless web analytics with real-time dashboards, custom events, and uptime monitoring. One-time payment from $49. Limited slots.",
  openGraph: {
    title: "eesee metrics Lifetime Deal — Pay Once, Use Forever",
    description:
      "Limited lifetime deal for eesee metrics Starter. Cookieless, EU-hosted web analytics. From $49 one-time.",
  },
};

// ── Data ─────────────────────────────────────────────────────────────────────

const TIER_META = [
  {
    name: "Personal",
    price: 49,
    regularPrice: 168,
    pageviews: "100K",
    badge: null as string | null,
    checkoutLink: LTD_CONFIG.checkout.tier1,
    maxSlots: 150,
    note: null as string | null,
    tierNum: 1,
  },
  {
    name: "Growth",
    price: 79,
    regularPrice: 288,
    pageviews: "250K",
    badge: "Most Popular",
    checkoutLink: LTD_CONFIG.checkout.tier2,
    maxSlots: 100,
    note: null as string | null,
    tierNum: 2,
  },
  {
    name: "Business",
    price: 129,
    regularPrice: 588,
    pageviews: "500K",
    badge: "Best Value",
    checkoutLink: LTD_CONFIG.checkout.tier3,
    maxSlots: 50,
    note: "500K pv requires Pro plan ($49/mo) on regular pricing — only available here.",
    tierNum: 3,
  },
];

const STARTER_FEATURES = [
  {
    icon: <Activity className="w-5 h-5" />,
    title: "Real-time analytics",
    desc: "Live visitors, top pages, referrers, sources, UTMs, and more.",
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Goals & custom events",
    desc: "Track signups, purchases, button clicks, or any custom interaction.",
  },
  {
    icon: <Wifi className="w-5 h-5" />,
    title: "Uptime monitoring (5 monitors)",
    desc: "HTTP and TCP checks with email, Slack, and Discord alerts.",
  },
  {
    icon: <Bot className="w-5 h-5" />,
    title: "Bot filtering",
    desc: "Only real humans in your data. Bots filtered automatically.",
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: "Data export",
    desc: "Your data is yours. Export any time, no lock-in.",
  },
  {
    icon: <RefreshCw className="w-5 h-5" />,
    title: "2-year data retention",
    desc: "Full history retained for two years.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "One-line setup",
    desc: "Paste one script tag and start tracking in under a minute.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "No cookies, no consent banners",
    desc: "Cookieless by design. GDPR and CCPA compliant out of the box.",
  },
];

const PLAN_FEATURES = ["Real-time analytics dashboard", "Goals & custom events", "Uptime monitoring (5 monitors)", "Bot filtering", "Data export", "2-year data retention", "One-line setup", "No cookies, no consent banners"];

const COMPARISON_ROWS = [
  ["Price",                    "$49 once",        "Free*",                        "$19/mo ($228/yr)",  "$15/mo ($180/yr)"],
  ["Cookies required",         "No",              "Yes",                          "No",                "No"],
  ["Consent banner needed",    "No",              "Yes",                          "No",                "No"],
  ["GDPR compliant",           "Yes, by design",  "⚠ Ruled non-compliant in EU",  "Yes",               "Yes"],
  ["Data hosted in EU",        "Yes (Germany)",   "No (US servers)",              "Yes",               "No (US/Canada)"],
  ["Real-time dashboard",      "Yes",             "Limited",                      "Yes",               "Yes"],
  ["Custom events",            "Yes",             "Yes",                          "Yes",               "Yes"],
  ["Uptime monitoring",        "Yes (5 monitors)","No",                           "No",                "No"],
  ["Open source",              "Yes",             "No",                           "Yes",               "No"],
  ["One-time payment option",  "Yes — this deal", "N/A",                          "No",                "No"],
];

// ── Slot fetcher (server-side, with fallback) ─────────────────────────────────

async function fetchLiveSlots(): Promise<{ tier1: number; tier2: number; tier3: number }> {
  const fallback = {
    tier1: LTD_CONFIG.slots.tier1,
    tier2: LTD_CONFIG.slots.tier2,
    tier3: LTD_CONFIG.slots.tier3,
  };

  if (!LTD_CONFIG.apiBaseUrl) return fallback;

  try {
    const res = await fetch(`${LTD_CONFIG.apiBaseUrl}/api/ltd/slots`, {
      next: { revalidate: 60 }, // cache for 60 seconds
    });
    if (!res.ok) return fallback;
    const data = await res.json();
    return {
      tier1: data.tier1?.remaining ?? fallback.tier1,
      tier2: data.tier2?.remaining ?? fallback.tier2,
      tier3: data.tier3?.remaining ?? fallback.tier3,
    };
  } catch {
    return fallback;
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function LtdPage() {
  const liveSlots = await fetchLiveSlots();

  const TIERS = TIER_META.map((t) => ({
    ...t,
    slots: liveSlots[`tier${t.tierNum}` as keyof typeof liveSlots],
  }));

  const totalSlots = liveSlots.tier1 + liveSlots.tier2 + liveSlots.tier3;

  return (
    <div className="flex flex-col items-center overflow-x-hidden">
      <BackgroundGrid />

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 w-full relative z-10">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          {/* Urgency badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            Limited Lifetime Deal — {totalSlots} total slots
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-b from-neutral-900 via-neutral-700 to-neutral-500 dark:from-white dark:via-gray-200 dark:to-gray-400">
            Never pay for web analytics again.
          </h1>

          <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 mb-10 max-w-2xl mx-auto font-light">
            Privacy-first, cookieless web analytics — built in Spain, hosted in
            Germany. Real-time dashboards, custom events, and uptime monitoring.
            One payment. Lifetime access.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href="#pricing"
              className="w-full sm:w-auto bg-[#26B0A2] hover:bg-[#2FC7B8] text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-[#26B0A2]/20 transform hover:-translate-y-0.5 transition-all duration-200 text-lg"
            >
              Get Lifetime Access — from $49
            </a>
          </div>

          <p className="text-neutral-500 dark:text-neutral-400 text-sm flex items-center justify-center gap-4 flex-wrap mb-12">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#2FC7B8]" /> One-time payment
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#2FC7B8]" /> No recurring charges
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#2FC7B8]" /> 30-day money-back guarantee
            </span>
          </p>

          {/* Countdown */}
          <div className="inline-flex flex-col items-center gap-4 px-8 py-6 bg-neutral-900/50 border border-neutral-700/50 rounded-2xl">
            <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider">
              Deal ends in
            </p>
            <CountdownTimer endDate={LTD_CONFIG.endDate} />
          </div>
        </div>
      </section>

      {/* ── WHAT'S INCLUDED ────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 w-full relative z-10">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything included in your lifetime deal
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">
              The complete Starter plan, forever. No feature degradation over time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {STARTER_FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-neutral-100/50 dark:bg-neutral-800/20 border border-neutral-300/50 dark:border-neutral-800/50 rounded-lg p-5"
              >
                <div className="text-[#2FC7B8] mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-12 md:py-16 w-full relative z-10">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Choose your plan
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">
              One payment. Lifetime access. 30-day money-back guarantee.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {TIERS.map((tier) => {
              const isPopular = tier.badge === "Most Popular";
              const soldPct = Math.max(
                5,
                Math.round(((tier.maxSlots - tier.slots) / tier.maxSlots) * 100)
              );

              return (
                <div
                  key={tier.name}
                  className={`relative rounded-2xl border p-6 flex flex-col ${
                    isPopular
                      ? "bg-neutral-50 dark:bg-neutral-800 border-[#2FC7B8] border-2"
                      : "bg-neutral-100/50 dark:bg-neutral-900/50 border-neutral-300 dark:border-neutral-800"
                  }`}
                >
                  {/* Badge */}
                  {tier.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                          isPopular
                            ? "bg-[#2FC7B8] text-neutral-900"
                            : "bg-neutral-700 text-white"
                        }`}
                      >
                        {tier.badge}
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-0.5">{tier.name}</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                      {tier.pageviews} pageviews / month
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold">${tier.price}</span>
                      <span className="text-neutral-500 text-sm">one-time</span>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      <span className="line-through">${tier.regularPrice}/yr</span>
                      <span className="ml-2 text-[#2FC7B8] font-medium">
                        Save ${tier.regularPrice - tier.price}
                      </span>
                    </p>
                  </div>

                  {/* Slots remaining bar */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-neutral-500 dark:text-neutral-400">
                        Slots remaining
                      </span>
                      <span className="text-amber-400 font-medium">
                        {tier.slots} left
                      </span>
                    </div>
                    <div className="bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all"
                        style={{ width: `${soldPct}%` }}
                      />
                    </div>
                  </div>

                  <a
                    href={tier.checkoutLink}
                    className={`w-full text-center font-semibold px-5 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 mb-6 block ${
                      isPopular
                        ? "bg-[#26B0A2] hover:bg-[#2FC7B8] text-white shadow-lg shadow-[#26B0A2]/20"
                        : "bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white"
                    }`}
                  >
                    Get Lifetime Access
                  </a>

                  {/* Feature list */}
                  <ul className="space-y-2.5 mt-auto">
                    {PLAN_FEATURES.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-[#2FC7B8] mt-0.5 shrink-0" />
                        <span className="text-neutral-700 dark:text-neutral-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                    {tier.note && (
                      <li className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                        * {tier.note}
                      </li>
                    )}
                  </ul>

                  <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-5">
                    One-time payment · 30-day money-back guarantee
                  </p>
                </div>
              );
            })}
          </div>

          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
            Need more than 500K pageviews?{" "}
            <a
              href="mailto:hello@eeseemetrics.com"
              className="text-[#2FC7B8] hover:underline"
            >
              Contact us
            </a>{" "}
            for a custom lifetime deal.
          </p>
        </div>
      </section>

      {/* ── COMPARISON TABLE ───────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 w-full relative z-10">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              How eesee compares
            </h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-600 dark:text-neutral-400 w-[28%]">
                    Feature
                  </th>
                  <th className="py-3 px-4 font-semibold text-[#2FC7B8] bg-[#2FC7B8]/5 text-center">
                    eesee (LTD)
                  </th>
                  <th className="py-3 px-4 font-semibold text-neutral-600 dark:text-neutral-400 text-center">
                    Google Analytics
                  </th>
                  <th className="py-3 px-4 font-semibold text-neutral-600 dark:text-neutral-400 text-center">
                    Plausible
                  </th>
                  <th className="py-3 px-4 font-semibold text-neutral-600 dark:text-neutral-400 text-center">
                    Fathom
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map(([feature, eesee, ga, plausible, fathom], i) => (
                  <tr
                    key={i}
                    className={`border-b border-neutral-200/70 dark:border-neutral-800/50 last:border-0 ${
                      i % 2 !== 0 ? "bg-neutral-50/50 dark:bg-neutral-800/10" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-neutral-700 dark:text-neutral-300">
                      {feature}
                    </td>
                    <td className="py-3 px-4 text-center bg-[#2FC7B8]/5 font-medium text-neutral-900 dark:text-white">
                      {eesee}
                    </td>
                    <td className="py-3 px-4 text-center text-neutral-600 dark:text-neutral-400">
                      {ga}
                    </td>
                    <td className="py-3 px-4 text-center text-neutral-600 dark:text-neutral-400">
                      {plausible}
                    </td>
                    <td className="py-3 px-4 text-center text-neutral-600 dark:text-neutral-400">
                      {fathom}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 text-center">
            * Google Analytics is free because your visitors' data funds Google's
            advertising business. Competitor prices verified at time of writing —
            check their sites for current pricing.
          </p>
        </div>
      </section>

      {/* ── UPGRADE SECTION ────────────────────────────────────────────────── */}
      <section className="w-full relative z-10">
        <div className="max-w-[1200px] mx-auto px-4 pt-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Need funnels, session replay, or AI reports?
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-2">
            Your lifetime Starter plan stays free forever. Upgrade anytime —
            your LTD remains your permanent safety net if you ever cancel.
          </p>
        </div>
        <LtdUpgradeSection />
      </section>

      {/* ── SOCIAL PROOF ───────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 w-full relative z-10">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Built in the open
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg">
              Inspect the code, verify the privacy claims, trust the product.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
            {[
              {
                label: "Open source",
                desc: "Full source code on GitHub. Inspect exactly how your data is handled.",
                icon: <Github className="w-6 h-6" />,
                href: "https://github.com/velocidai/eeseemetrics",
                linkLabel: "View on GitHub",
              },
              {
                label: "EU-hosted",
                desc: "Hetzner infrastructure, Germany. Your data never leaves the EU.",
                icon: <Globe2 className="w-6 h-6" />,
                href: null,
                linkLabel: null,
              },
              {
                label: "GDPR compliant",
                desc: "No cookies, no personal data. Compliant by design, not configuration.",
                icon: <Lock className="w-6 h-6" />,
                href: null,
                linkLabel: null,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-neutral-100/50 dark:bg-neutral-800/20 border border-neutral-300/50 dark:border-neutral-800/50 rounded-xl p-6 text-center"
              >
                <div className="text-[#2FC7B8] mx-auto mb-3 flex justify-center">
                  {item.icon}
                </div>
                <h3 className="font-semibold mb-1">{item.label}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  {item.desc}
                </p>
                {item.href && (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#2FC7B8] hover:underline"
                  >
                    {item.linkLabel}{" "}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="py-12 md:py-16 w-full relative z-10">
        <div className="max-w-[800px] mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <LtdFaq />
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 w-full relative z-10">
        <div className="max-w-[800px] mx-auto px-4 text-center">
          <p className="text-amber-400 text-sm font-medium uppercase tracking-wider mb-4">
            Don't miss out. This deal won't come back.
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
            Get lifetime access — starting at $49
          </h2>

          <div className="flex justify-center mb-8">
            <CountdownTimer endDate={LTD_CONFIG.endDate} />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <a
              href="#pricing"
              className="w-full sm:w-auto bg-[#26B0A2] hover:bg-[#2FC7B8] text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-[#26B0A2]/20 transform hover:-translate-y-0.5 transition-all duration-200 text-lg"
            >
              Get Lifetime Access — from $49
            </a>
          </div>

          <p className="text-neutral-500 dark:text-neutral-400 text-sm flex items-center justify-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#2FC7B8]" /> One-time payment
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#2FC7B8]" /> 30-day money-back guarantee
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#2FC7B8]" /> Lifetime access, no fine print
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}
