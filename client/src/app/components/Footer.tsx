"use client";

import { useExtracted } from "next-intl";
import { IS_CLOUD } from "../../lib/const";
import { useWhiteLabel } from "../../hooks/useIsWhiteLabel";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { EeseeWordmark } from "../../components/EeseeLogo";

export function Footer() {
  const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION;
  const { isWhiteLabel } = useWhiteLabel();
  const t = useExtracted();

  if (isWhiteLabel) {
    return null;
  }

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-[1100px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <EeseeWordmark width={140} variant="light" className="block dark:hidden" />
            <EeseeWordmark width={140} variant="dark" className="hidden dark:block" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {t("Privacy-first analytics with AI-powered insights.")}
            </p>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{t("Resources")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://docs.eeseemetrics.com"
                  className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  {t("Documentation")}
                </a>
              </li>
              <li>
                <a
                  href="https://eeseemetrics.com/features"
                  className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  {t("Features")}
                </a>
              </li>
              <li>
                <a
                  href="https://eeseemetrics.com/pricing"
                  className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  {t("Pricing")}
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">{t("Company")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://eeseemetrics.com/privacy"
                  className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  {t("Privacy Policy")}
                </a>
              </li>
              <li>
                <a
                  href="https://eeseemetrics.com/terms"
                  className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  {t("Terms and Conditions")}
                </a>
              </li>
              <li>
                <a
                  href="https://eeseemetrics.com/security"
                  className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  {t("Security")}
                </a>
              </li>
              {IS_CLOUD && (
                <li>
                  <a
                    href="mailto:hello@eeseemetrics.com"
                    className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                  >
                    {t("Support")}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
              <span>{t("© {year} Eesee Metrics. All rights reserved.", { year: String(new Date().getFullYear()) })}</span>
              {APP_VERSION && (
                <span>v{APP_VERSION}</span>
              )}
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
