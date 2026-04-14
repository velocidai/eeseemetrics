"use client";

import { useState } from "react";
import Link from "next/link";
import { RulesList } from "./components/RulesList";
import { BellDot, Check, X } from "lucide-react";
import { DateTime } from "luxon";
import { useStore } from "@/lib/store";
import { useSetPageTitle } from "@/hooks/useSetPageTitle";
import { InsightsGate } from "@/components/InsightsGate";
import { NothingFound } from "@/components/NothingFound";
import { useGetAnomalyAlerts } from "@/api/insights/hooks/useGetAnomalyAlerts";
import { useUpdateAnomalyAlert } from "@/api/insights/hooks/useUpdateAnomalyAlert";
import { SubHeader } from "../components/SubHeader/SubHeader";
import type { AnomalyAlert, AlertStatus, AlertSeverity } from "@/api/insights/endpoints";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SEVERITY_STYLES = {
  low: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  medium: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  high: "bg-red-500/10 text-red-500 border-red-500/20",
};

const METRIC_LABEL: Record<string, string> = {
  sessions: "Sessions",
  pageviews: "Pageviews",
  bounce_rate: "Bounce rate",
};

function formatRelative(ts: string) {
  return DateTime.fromISO(ts).toRelative() ?? ts;
}

function formatChange(change: number) {
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

// ---------------------------------------------------------------------------
// Status filter tab bar
// ---------------------------------------------------------------------------

type StatusFilter = AlertStatus | "all";
type SeverityFilter = AlertSeverity | "all";

function FilterTabs<T extends string>({
  active,
  onChange,
  tabs,
}: {
  active: T;
  onChange: (v: T) => void;
  tabs: { value: T; label: string }[];
}) {
  return (
    <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`text-xs px-3 py-1.5 rounded-md transition-colors font-medium ${
            active === tab.value
              ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "seen", label: "Seen" },
  { value: "dismissed", label: "Dismissed" },
];

const SEVERITY_TABS: { value: SeverityFilter; label: string }[] = [
  { value: "all", label: "All severities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

// ---------------------------------------------------------------------------
// Single alert row
// ---------------------------------------------------------------------------

function AlertRow({
  alert,
  onMarkSeen,
  onDismiss,
  isPending,
}: {
  alert: AnomalyAlert;
  onMarkSeen: (id: string) => void;
  onDismiss: (id: string) => void;
  isPending: boolean;
}) {
  const isSpike = alert.percentChange > 0;
  const isBounceRate = alert.metric === "bounce_rate";
  // For bounce rate, a spike is bad; for traffic metrics, a drop is bad
  const isBad = isBounceRate ? isSpike : !isSpike;

  return (
    <div
      className={`rounded-xl border p-4 transition-opacity ${
        alert.status === "dismissed" ? "opacity-50" : ""
      } ${
        alert.status === "new"
          ? "border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
          : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Severity + metric + new badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${SEVERITY_STYLES[alert.severity]}`}
            >
              {alert.severity}
            </span>
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {METRIC_LABEL[alert.metric] ?? alert.metric}
            </span>
            {alert.status === "new" && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-500">
                New
              </span>
            )}
            {alert.ruleId !== null && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                Custom rule
              </span>
            )}
          </div>

          {/* Change description */}
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            <span className={`font-medium ${isBad ? "text-red-500" : "text-accent-500"}`}>
              {formatChange(alert.percentChange)}
            </span>{" "}
            {isSpike ? "spike" : "drop"} detected —{" "}
            <span className="text-neutral-900 dark:text-neutral-100 font-medium">
              {alert.currentValue % 1 === 0
                ? alert.currentValue.toLocaleString()
                : alert.currentValue.toFixed(2)}
            </span>{" "}
            vs baseline{" "}
            <span className="text-neutral-500">
              {alert.baselineValue % 1 === 0
                ? alert.baselineValue.toLocaleString()
                : alert.baselineValue.toFixed(2)}
            </span>
          </p>

          {/* Timestamp */}
          <p className="text-xs text-neutral-400">Detected {formatRelative(alert.detectedAt)}</p>
        </div>

        {/* Actions */}
        {alert.status !== "dismissed" && (
          <div className="flex items-center gap-1 shrink-0">
            {alert.status === "new" && (
              <button
                onClick={() => onMarkSeen(alert.id)}
                disabled={isPending}
                title="Mark as seen"
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => onDismiss(alert.id)}
              disabled={isPending}
              title="Dismiss"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-500/5 transition-colors disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Alerts list
// ---------------------------------------------------------------------------

const PAGE_SIZE = 20;

function AlertsList({ siteId }: { siteId: number }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetAnomalyAlerts(siteId, {
    status: statusFilter === "all" ? undefined : statusFilter,
    severity: severityFilter === "all" ? undefined : severityFilter,
    page,
    pageSize: PAGE_SIZE,
  });

  const { mutate: updateAlert, isPending } = useUpdateAnomalyAlert(siteId);

  const alerts = data?.data ?? [];
  const meta = data?.meta;
  const hasEnoughData = meta?.hasEnoughData ?? true; // default true to avoid flash

  function handleStatusChange(s: StatusFilter) {
    setStatusFilter(s);
    setPage(1);
  }

  function handleSeverityChange(s: SeverityFilter) {
    setSeverityFilter(s);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <FilterTabs active={statusFilter} onChange={handleStatusChange} tabs={STATUS_TABS} />
        <FilterTabs active={severityFilter} onChange={handleSeverityChange} tabs={SEVERITY_TABS} />
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-destructive text-sm">
          Failed to load alerts.
        </div>
      ) : !hasEnoughData ? (
        <NothingFound
          title="Not enough traffic yet"
          description="Anomaly detection needs at least 7 days of data to establish a reliable baseline. Keep your tracking snippet installed and check back soon."
        />
      ) : alerts.length === 0 ? (
        <NothingFound
          title="No alerts found"
          description={
            statusFilter === "all" && severityFilter === "all"
              ? "Anomaly detection runs daily. Alerts will appear here when unusual traffic patterns are detected."
              : "No alerts match the selected filters."
          }
        />
      ) : (
        <>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <AlertRow
                key={alert.id}
                alert={alert}
                onMarkSeen={(id) => updateAlert({ alertId: id, status: "seen" })}
                onDismiss={(id) => updateAlert({ alertId: id, status: "dismissed" })}
                isPending={isPending}
              />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-neutral-500">
                Page {page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page root
// ---------------------------------------------------------------------------

export default function AlertsPage() {
  const { site } = useStore();
  const [activeTab, setActiveTab] = useState<"alerts" | "rules">("alerts");

  useSetPageTitle("Alerts");

  if (!site) return null;

  return (
    <div className="p-2 md:p-4 max-w-[1100px] mx-auto space-y-4">
        <SubHeader pageInfo="alerts" />

        {/* Page header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <BellDot className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Anomaly Alerts
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Daily checks for unusual spikes or drops in sessions, pageviews, and bounce rate.
              </p>
            </div>
          </div>
          <Link
            href={`/${site}/settings/notifications`}
            className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors shrink-0"
          >
            Configure notifications →
          </Link>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-fit">
          {(["alerts", "rules"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors font-medium capitalize ${
                activeTab === tab
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              {tab === "alerts" ? "Alert feed" : "Rules"}
            </button>
          ))}
        </div>

        {activeTab === "alerts" ? (
          <AlertsList siteId={Number(site)} />
        ) : (
          <InsightsGate>
            <RulesList siteId={Number(site)} />
          </InsightsGate>
        )}
      </div>
  );
}
