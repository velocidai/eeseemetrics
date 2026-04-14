"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGetAiReports } from "../../../../../api/insights/hooks/useGetAiReports";
import { useGetAlertUnreadCount } from "../../../../../api/insights/hooks/useGetAlertUnreadCount";
import { Card, CardContent } from "../../../../../components/ui/card";
import { IS_CLOUD } from "../../../../../lib/const";
import { useStripeSubscription } from "../../../../../lib/subscription/useStripeSubscription";
import { getPlanTier, tierAtLeast } from "../../../../../lib/tier";
import { useStore } from "../../../../../lib/store";
import { DateTime } from "luxon";

function getSiteBase(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const hasPrivateKey =
    segments.length > 1 && /^[a-f0-9]{12}$/i.test(segments[1]);
  return hasPrivateKey
    ? `/${segments[0]}/${segments[1]}`
    : `/${segments[0]}`;
}

export function InsightsPreview() {
  const pathname = usePathname();
  const { site } = useStore();
  const { data: subscription } = useStripeSubscription();

  const tier = getPlanTier(subscription?.planName);
  const hasAccess = !IS_CLOUD || tierAtLeast(tier, "pro");

  const siteBase = getSiteBase(pathname);
  const siteId = site ? Number(site) : undefined;

  const { data: reportsData } = useGetAiReports(hasAccess ? siteId : undefined, {
    page: 1,
    pageSize: 1,
  });
  const { data: alertsData } = useGetAlertUnreadCount(
    hasAccess ? siteId : undefined
  );

  if (!hasAccess) return null;

  const latestReport = reportsData?.data?.[0];
  const unreadAlerts = alertsData?.count ?? 0;

  return (
    <Card className="h-[405px]">
      <CardContent className="mt-2 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-md bg-accent-500/10 p-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-500" />
          </div>
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Insights
          </span>
        </div>

        {/* Latest report */}
        <div className="flex-1 flex flex-col gap-3">
          <Link
            href={`${siteBase}/reports`}
            className="group block rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors p-4"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-neutral-500">AI Reports</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-accent-500 transition-colors" />
            </div>
            {latestReport ? (
              <>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 capitalize">
                  {latestReport.cadence} report
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {latestReport.status === "complete"
                    ? `Generated ${DateTime.fromSQL(latestReport.createdAt).toRelative()}`
                    : latestReport.status === "generating"
                      ? "Generating now…"
                      : "Generation failed"}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  No reports yet
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Weekly reports run every Monday
                </p>
              </>
            )}
          </Link>

          {/* Alerts */}
          <Link
            href={`${siteBase}/alerts`}
            className="group block rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors p-4"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-neutral-500">Anomaly Alerts</span>
              <div className="flex items-center gap-1.5">
                {unreadAlerts > 0 && (
                  <span className="text-xs font-semibold bg-accent-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                    {unreadAlerts > 99 ? "99+" : unreadAlerts}
                  </span>
                )}
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-accent-500 transition-colors" />
              </div>
            </div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {unreadAlerts > 0
                ? `${unreadAlerts} new alert${unreadAlerts === 1 ? "" : "s"}`
                : "No new alerts"}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Checked daily for unusual patterns
            </p>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
