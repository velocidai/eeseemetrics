import Link from "next/link";
import { useExtracted } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function Footer() {
  const t = useExtracted();
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <span className="font-semibold text-lg tracking-tight">Eesee Metrics</span>
            <p className="text-sm text-neutral-400 max-w-xs">
              {t("Privacy-first analytics with weekly reports, anomaly alerts, and MCP integration.")}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t("Features")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/features/web-analytics" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("Web Analytics")}
                </Link>
              </li>
              <li>
                <Link href="/features/ai-reports" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("AI Reports")}
                </Link>
              </li>
              <li>
                <Link href="/features/mcp" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("MCP Tools")}
                </Link>
              </li>
              <li>
                <Link href="/features/session-replay" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("Session Replay")}
                </Link>
              </li>
              <li>
                <Link href="/features/funnels" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("Funnels")}
                </Link>
              </li>
              <li>
                <Link href="/features/goals" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("Goals")}
                </Link>
              </li>
              <li>
                <Link href="/features/user-journeys" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("User Journeys")}
                </Link>
              </li>
              <li>
                <Link href="/features/custom-events" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("Custom Events")}
                </Link>
              </li>
              <li>
                <Link href="/features/retention" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("Retention")}
                </Link>
              </li>
              <li>
                <Link href="/features/alerts" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("Anomaly Alerts")}
                </Link>
              </li>
              <li>
                <Link href="/features/uptime-monitoring" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("Uptime Monitoring")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t("Resources")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("Documentation")}
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("Features")}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("Pricing")}
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("Compare")}
                </Link>
              </li>
              <li>
                <Link href="/docs/api/getting-started" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("API Reference")}
                </Link>
              </li>
              <li>
                <a href="https://github.com/velocidai/eeseemetrics" target="_blank" rel="noopener noreferrer" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("GitHub")}
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t("Company")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("Contact")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("Privacy Policy")}
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("Terms and Conditions")}
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("Security")}
                </Link>
              </li>
              <li>
                <Link href="/dpa" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("DPA")}
                </Link>
              </li>
              <li>
                <a href="mailto:hello@eeseemetrics.com" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  {t("Support")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-neutral-400">{t("© {year} Eesee Metrics. All rights reserved.", { year: String(new Date().getFullYear()) })}</div>
            <div className="text-sm text-neutral-400 space-x-4 flex items-center">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
