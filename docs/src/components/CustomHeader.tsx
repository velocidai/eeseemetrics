"use client";

import { trackAdEvent } from "@/lib/trackAdEvent";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart2,
  Bell,
  BellDot,
  Bot,
  ChevronDown,
  FileText,
  Filter,
  LayoutDashboard,
  Menu,
  RefreshCw,
  Rocket,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Video,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import { useExtracted } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { AppLink } from "./AppLink";
import { ThemeSwitcher } from "./ThemeSwitcher";

const WHY_EESEE_LINKS = [
  { href: "/why-eesee",                    icon: Rocket,        label: "Overview",          desc: "The case for switching to Eesee" },
  { href: "/simple-web-analytics",         icon: LayoutDashboard, label: "Simple analytics", desc: "One dashboard, no complexity" },
  { href: "/privacy-focused-web-analytics",icon: ShieldCheck,   label: "Privacy-focused",   desc: "No cookies, no consent banners" },
  { href: "/lightweight-web-analytics",    icon: Zap,           label: "Lightweight script", desc: "Under 5 KB, zero render blocking" },
  { href: "/analytics-alerts",             icon: BellDot,       label: "Always-on alerts",  desc: "Slack, Discord, email & webhooks" },
  { href: "/compare",                      icon: BarChart2,     label: "Compare",           desc: "Eesee Metrics vs the competition" },
] as const;

const FEATURES_COL1 = [
  { href: "/features/web-analytics",  icon: Activity,    label: "Web Analytics",  desc: "Real-time traffic, sources & pages" },
  { href: "/features/session-replay", icon: Video,       label: "Session Replay", desc: "Watch real user sessions" },
  { href: "/features/funnels",        icon: Filter,      label: "Funnels",        desc: "Visualise where users drop off" },
  { href: "/features/goals",          icon: Target,      label: "Goals",          desc: "Track conversions & key actions" },
  { href: "/features/retention",      icon: RefreshCw,   label: "Retention",      desc: "Cohort analysis & returning visitors" },
  { href: "/features/user-journeys",  icon: Route,       label: "User Journeys",  desc: "Sankey paths across your site" },
];

const FEATURES_COL2 = [
  { href: "/features/ai-reports",        icon: Sparkles,      label: "AI Reports",        desc: "Weekly plain-English analytics reports" },
  { href: "/features/mcp",               icon: Bot,           label: "MCP Tools",         desc: "Query analytics from Claude & Cursor" },
  { href: "/features/alerts",            icon: Bell,          label: "Anomaly Alerts",    desc: "Spike & drop detection via Slack" },
  { href: "/features/uptime-monitoring", icon: Wifi,          label: "Uptime Monitoring", desc: "HTTP, HTTPS & TCP health checks" },
  { href: "/features/error-tracking",    icon: AlertTriangle, label: "Error Tracking",    desc: "Catch JS errors as they happen" },
  { href: "/features/search-console",    icon: Search,        label: "Search Console",    desc: "Queries, CTR & rankings in-dashboard" },
];

export function CustomHeader() {
  const t = useExtracted();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav className="mx-auto flex max-w-[1167px] items-center justify-between px-4 py-3 sm:border border-[#243146] sm:rounded-xl dark:border-[#243146] bg-white/50 dark:bg-[#0D1322]/80 backdrop-blur-md sm:mt-1" aria-label="Global">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -5 100 115" className="h-7 w-auto shrink-0">
              <style>{`
                .ch-body { transform-origin: 40px 52.6px; animation: chBreath 2.4s ease-in-out infinite; }
                @keyframes chBreath {
                  0%   { transform: scaleX(1)    scaleY(1); }
                  25%  { transform: scaleX(0.92) scaleY(1.08); }
                  50%  { transform: scaleX(1)    scaleY(1); }
                  75%  { transform: scaleX(1.08) scaleY(0.93); }
                  100% { transform: scaleX(1)    scaleY(1); }
                }
                .ch-eye { transform-box: fill-box; transform-origin: center; animation: chBlink 4s ease-in-out infinite; }
                .ch-eye-r { animation-delay: 0.04s; }
                @keyframes chBlink {
                  0%, 88%, 96%, 100% { transform: scaleY(1); }
                  92%                { transform: scaleY(0.07); }
                }
              `}</style>
              <g className="ch-body">
                <polygon points="40,6 72,76 8,76" fill="#2FC7B8" />
                <rect className="ch-eye"          x="22" y="40" width="12" height="12" fill="#0a1015" rx="2" />
                <rect className="ch-eye ch-eye-r" x="46" y="40" width="12" height="12" fill="#0a1015" rx="2" />
              </g>
            </svg>
            <span className="font-semibold text-base tracking-tight text-neutral-900 dark:text-[#EAF1F8]">
              eesee <span className="font-light opacity-60">metrics</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:flex-1 md:justify-center">
          <div className="flex items-center gap-x-6">

            {/* Features dropdown */}
            <div className="relative" onMouseEnter={() => setFeaturesOpen(true)} onMouseLeave={() => setFeaturesOpen(false)}>
              <button className="flex items-center gap-1 text-sm text-neutral-600 dark:text-[#A8B6C7] hover:text-neutral-900 dark:hover:text-[#EAF1F8] transition-colors">
                {t("Features")}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${featuresOpen ? "rotate-180" : ""}`} />
              </button>
              {featuresOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                  <div className="w-[560px] rounded-xl border border-[#243146] bg-white/95 dark:bg-[#0D1322]/98 backdrop-blur-md shadow-xl overflow-hidden">
                    {/* Two columns */}
                    <div className="grid grid-cols-2 gap-px bg-neutral-200/50 dark:bg-[#243146]/50">
                      {/* Column 1 — Analytics */}
                      <div className="bg-white/95 dark:bg-[#0D1322]/98 p-2">
                        <div className="px-3 py-1.5 mb-1">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Analytics</span>
                        </div>
                        {FEATURES_COL1.map(({ href, icon: Icon, label, desc }) => (
                          <Link key={href} href={href} className="flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-neutral-100 dark:hover:bg-[#182235] transition-colors group">
                            <div className="w-6 h-6 rounded-md bg-[#2FC7B8]/10 flex items-center justify-center text-[#2FC7B8] shrink-0 mt-0.5">
                              <Icon className="w-3 h-3" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-neutral-900 dark:text-[#EAF1F8] group-hover:text-[#2FC7B8] transition-colors leading-tight">{label}</div>
                              <div className="text-[11px] text-neutral-500 dark:text-neutral-500 mt-0.5 leading-tight">{desc}</div>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Column 2 — Intelligence & Monitoring */}
                      <div className="bg-white/95 dark:bg-[#0D1322]/98 p-2">
                        <div className="px-3 py-1.5 mb-1">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Intelligence & Monitoring</span>
                        </div>
                        {FEATURES_COL2.map(({ href, icon: Icon, label, desc }) => (
                          <Link key={href} href={href} className="flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-neutral-100 dark:hover:bg-[#182235] transition-colors group">
                            <div className="w-6 h-6 rounded-md bg-[#2FC7B8]/10 flex items-center justify-center text-[#2FC7B8] shrink-0 mt-0.5">
                              <Icon className="w-3 h-3" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-neutral-900 dark:text-[#EAF1F8] group-hover:text-[#2FC7B8] transition-colors leading-tight">{label}</div>
                              <div className="text-[11px] text-neutral-500 dark:text-neutral-500 mt-0.5 leading-tight">{desc}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Footer — view all */}
                    <div className="border-t border-neutral-200/60 dark:border-[#243146] px-4 py-2.5 bg-neutral-50/80 dark:bg-[#0B1120]/80">
                      <Link href="/features" className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-[#2FC7B8] transition-colors group">
                        <span>{t("View all features")}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Why Eesee dropdown */}
            <div className="relative" onMouseEnter={() => setWhyOpen(true)} onMouseLeave={() => setWhyOpen(false)}>
              <button className="flex items-center gap-1 text-sm text-neutral-600 dark:text-[#A8B6C7] hover:text-neutral-900 dark:hover:text-[#EAF1F8] transition-colors">
                {t("Why Eesee")}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${whyOpen ? "rotate-180" : ""}`} />
              </button>
              {whyOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                  <div className="w-72 rounded-xl border border-[#243146] bg-white/95 dark:bg-[#0D1322]/98 backdrop-blur-md shadow-xl p-2">
                    {WHY_EESEE_LINKS.map(({ href, icon: Icon, label, desc }) => (
                      <Link key={href} href={href} className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-neutral-100 dark:hover:bg-[#182235] transition-colors group">
                        <div className="w-7 h-7 rounded-md bg-[#2FC7B8]/10 flex items-center justify-center text-[#2FC7B8] shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-neutral-900 dark:text-[#EAF1F8] group-hover:text-[#2FC7B8] transition-colors">{label}</div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-500 mt-0.5">{desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/pricing" className="text-sm text-neutral-600 dark:text-[#A8B6C7] hover:text-neutral-900 dark:hover:text-[#EAF1F8] transition-colors">
              {t("Pricing")}
            </Link>
            <Link href="/docs" className="text-sm text-neutral-600 dark:text-[#A8B6C7] hover:text-neutral-900 dark:hover:text-[#EAF1F8] transition-colors">
              {t("Docs")}
            </Link>
          </div>
        </div>

        {/* Right side */}
        <div className="hidden md:flex md:items-center md:gap-x-2">
          <AppLink href="https://app.eeseemetrics.com" target="_blank">
            <button
              onClick={() => trackAdEvent("login", { location: "header" })}
              className="bg-transparent border border-[#243146] hover:border-[#2FC7B8]/40 hover:bg-[#182235] text-neutral-700 dark:text-[#A8B6C7] hover:text-[#EAF1F8] text-sm font-medium px-3 py-1.5 rounded-md transition-colors duration-150 focus:outline-none"
            >
              {t("Login")}
            </button>
          </AppLink>
          <AppLink href="https://app.eeseemetrics.com/signup" target="_blank">
            <button
              onClick={() => trackAdEvent("signup", { location: "header" })}
              className="bg-[#2FC7B8] hover:bg-[#26B0A2] text-[#0D1322] text-sm font-medium px-3 py-1.5 rounded-md transition-colors duration-150 focus:outline-none"
            >
              {t("Sign up")}
            </button>
          </AppLink>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-neutral-600 dark:text-[#A8B6C7] hover:bg-neutral-200 dark:hover:bg-[#182235] hover:text-neutral-900 dark:hover:text-[#EAF1F8]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">{t("Open main menu")}</span>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-[#0D1322]/95 backdrop-blur-md border-b border-[#243146]">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {/* Features mobile section */}
            <div className="px-3 py-2">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{t("Features")}</div>
                <Link href="/features" className="text-xs text-[#2FC7B8] hover:underline" onClick={() => setMobileMenuOpen(false)}>{t("View all")}</Link>
              </div>
              <div className="grid grid-cols-2 gap-x-2">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-1">Analytics</div>
                  {FEATURES_COL1.map(({ href, label }) => (
                    <Link key={href} href={href} className="block rounded-md px-2 py-1.5 text-sm text-neutral-600 dark:text-[#A8B6C7] hover:bg-neutral-100 dark:hover:bg-[#182235] hover:text-neutral-900 dark:hover:text-[#EAF1F8]" onClick={() => setMobileMenuOpen(false)}>
                      {label}
                    </Link>
                  ))}
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-1">Intelligence</div>
                  {FEATURES_COL2.map(({ href, label }) => (
                    <Link key={href} href={href} className="block rounded-md px-2 py-1.5 text-sm text-neutral-600 dark:text-[#A8B6C7] hover:bg-neutral-100 dark:hover:bg-[#182235] hover:text-neutral-900 dark:hover:text-[#EAF1F8]" onClick={() => setMobileMenuOpen(false)}>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Why Eesee mobile section */}
            <div className="px-3 py-2">
              <div className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">{t("Why Eesee")}</div>
              <div className="space-y-0.5">
                {WHY_EESEE_LINKS.map(({ href, label }) => (
                  <Link key={href} href={href} className="block rounded-md px-2 py-1.5 text-sm text-neutral-600 dark:text-[#A8B6C7] hover:bg-neutral-100 dark:hover:bg-[#182235] hover:text-neutral-900 dark:hover:text-[#EAF1F8]" onClick={() => setMobileMenuOpen(false)}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/pricing" className="block rounded-md px-3 py-2 text-sm text-neutral-600 dark:text-[#A8B6C7] hover:bg-neutral-100 dark:hover:bg-[#182235] hover:text-neutral-900 dark:hover:text-[#EAF1F8]" onClick={() => setMobileMenuOpen(false)}>
              {t("Pricing")}
            </Link>
            <Link href="/docs" className="block rounded-md px-3 py-2 text-sm text-neutral-600 dark:text-[#A8B6C7] hover:bg-neutral-100 dark:hover:bg-[#182235] hover:text-neutral-900 dark:hover:text-[#EAF1F8]" onClick={() => setMobileMenuOpen(false)}>
              {t("Docs")}
            </Link>

            <div className="pt-2 border-t border-neutral-200 dark:border-[#243146]">
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-[#A8B6C7]">{t("Theme")}</span>
                <ThemeSwitcher />
              </div>
            </div>

            <div className="border-t border-neutral-200 dark:border-[#243146] pt-2 space-y-2">
              <AppLink href="https://app.eeseemetrics.com" target="_blank" rel="noopener noreferrer" className="block w-full">
                <button
                  onClick={() => trackAdEvent("login", { location: "header" })}
                  className="w-full border border-[#243146] text-neutral-900 dark:text-[#EAF1F8] text-sm font-medium px-3 py-2 rounded-md hover:bg-[#182235]"
                >
                  {t("Login")}
                </button>
              </AppLink>
              <AppLink href="https://app.eeseemetrics.com/signup" target="_blank" rel="noopener noreferrer" className="block w-full">
                <button
                  onClick={() => trackAdEvent("signup", { location: "header" })}
                  className="w-full bg-[#2FC7B8] hover:bg-[#26B0A2] text-[#0D1322] text-sm font-medium px-3 py-2 rounded-md"
                >
                  {t("Sign up")}
                </button>
              </AppLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
