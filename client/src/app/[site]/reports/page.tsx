"use client";

import { useState } from "react";
import { ArrowLeft, Calendar, CheckCircle, Clock, Mail, XCircle } from "lucide-react";
import { PielIcon } from "@/components/EeseeLogo";
import { DateTime } from "luxon";
import { useStore } from "@/lib/store";
import { useSetPageTitle } from "@/hooks/useSetPageTitle";
import { InsightsGate } from "@/components/InsightsGate";
import { NothingFound } from "@/components/NothingFound";
import { useGetAiReports } from "@/api/insights/hooks/useGetAiReports";
import { useGetAiReport } from "@/api/insights/hooks/useGetAiReport";
import { SubHeader } from "../components/SubHeader/SubHeader";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { authClient } from "@/lib/auth";
import { useUpdateAccountSettings } from "@/api/admin/hooks/useAccountSettings";
import { IS_CLOUD } from "@/lib/const";
import type {
  AiReportListItem,
  AiReportStructuredSummary,
  ReportCadence,
} from "@/api/insights/endpoints";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CADENCE_LABEL: Record<ReportCadence, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

const CADENCE_COLOR: Record<ReportCadence, string> = {
  weekly: "bg-blue-500/10 text-blue-500",
  monthly: "bg-violet-500/10 text-violet-500",
  quarterly: "bg-amber-500/10 text-amber-500",
  yearly: "bg-accent-500/10 text-accent-500",
};

function parseDate(ts: string) {
  return DateTime.fromISO(ts).isValid
    ? DateTime.fromISO(ts)
    : DateTime.fromSQL(ts);
}

function formatPeriod(start: string, end: string) {
  const s = parseDate(start).toFormat("MMM d, yyyy");
  const e = parseDate(end).toFormat("MMM d, yyyy");
  return `${s} – ${e}`;
}

function formatRelative(ts: string) {
  return parseDate(ts).toRelative() ?? ts;
}

function fmtPct(v: number | null) {
  if (v == null) return null;
  const sign = v > 0 ? "+" : "";
  return `${sign}${v}%`;
}

// ---------------------------------------------------------------------------
// Report list item row
// ---------------------------------------------------------------------------

function ReportRow({
  report,
  onSelect,
}: {
  report: AiReportListItem;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(report.id)}
      className="w-full text-left rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors p-4 space-y-1"
    >
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${CADENCE_COLOR[report.cadence]}`}
          >
            {CADENCE_LABEL[report.cadence]}
          </span>
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {formatPeriod(report.periodStart, report.periodEnd)}
          </span>
        </div>
        {report.status === "complete" ? (
          <CheckCircle className="w-4 h-4 text-accent-500 shrink-0" />
        ) : report.status === "failed" ? (
          <XCircle className="w-4 h-4 text-destructive shrink-0" />
        ) : (
          <Clock className="w-4 h-4 text-neutral-400 shrink-0 animate-pulse" />
        )}
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Generated {formatRelative(report.createdAt)}
      </p>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Metric change pill
// ---------------------------------------------------------------------------

function ChangePill({ value }: { value: number | null }) {
  if (value == null) return <span className="text-neutral-400 text-xs">—</span>;
  const positive = value > 0;
  return (
    <span
      className={`text-xs font-medium px-1.5 py-0.5 rounded ${positive ? "bg-accent-500/10 text-accent-500" : "bg-red-500/10 text-red-500"}`}
    >
      {fmtPct(value)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Full report detail view
// ---------------------------------------------------------------------------

function ReportDetail({
  siteId,
  reportId,
  onBack,
}: {
  siteId: number;
  reportId: string;
  onBack: () => void;
}) {
  const { data, isLoading, isError } = useGetAiReport(siteId, reportId);
  const report = data?.data;
  const s = report?.structuredSummaryJson as AiReportStructuredSummary | null;

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
        ))}
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="text-center py-12 text-destructive text-sm">
        Failed to load report.
      </div>
    );
  }

  if (report.status === "failed") {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-2">
        <XCircle className="w-8 h-8 text-destructive mx-auto" />
        <p className="text-sm font-medium text-destructive">Report generation failed</p>
        {report.errorMessage && (
          <p className="text-xs text-neutral-500">{report.errorMessage}</p>
        )}
      </div>
    );
  }

  if (report.status === "generating" || !s) {
    return (
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-8 text-center space-y-2">
        <Clock className="w-8 h-8 text-neutral-400 mx-auto animate-pulse" />
        <p className="text-sm text-neutral-500">Report is being generated…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Back + period header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CADENCE_COLOR[s.period.cadence]}`}>
              {CADENCE_LABEL[s.period.cadence]}
            </span>
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {formatPeriod(s.period.start, s.period.end)}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Generated {formatRelative(report.createdAt)}
          </p>
        </div>
      </div>

      {/* Overview metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pageviews", value: s.overview.pageviews.toLocaleString(), change: s.overview.pageviewsChange },
          { label: "Sessions", value: s.overview.sessions.toLocaleString(), change: s.overview.sessionsChange },
          { label: "Visitors", value: s.overview.uniqueVisitors.toLocaleString(), change: s.overview.usersChange },
          {
            label: "Bounce rate",
            value: s.overview.bounceRate != null ? `${s.overview.bounceRate.toFixed(1)}%` : "—",
            change: s.overview.bounceRateChange,
          },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4"
          >
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{m.label}</p>
            <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{m.value}</p>
            <div className="mt-1">
              <ChangePill value={m.change} />
            </div>
          </div>
        ))}
      </div>

      {s.newVsReturning && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-5 py-3 flex items-center gap-6">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 shrink-0">Visitor split</p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">{s.newVsReturning.newPercentage.toFixed(1)}% new</span>
            <div className="h-2 rounded-full bg-accent-500/20 overflow-hidden flex-1 min-w-[80px]">
              <div className="h-full bg-accent-500 rounded-full" style={{ width: `${s.newVsReturning.newPercentage}%` }} />
            </div>
            <span className="text-xs font-medium text-neutral-500">{(100 - s.newVsReturning.newPercentage).toFixed(1)}% returning</span>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-5 space-y-2">
        <div className="flex items-center gap-2">
          <PielIcon size={16} />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Summary</h3>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{s.summary}</p>
      </div>

      {/* Highlights */}
      {s.highlights.length > 0 && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <PielIcon size={16} />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Highlights</h3>
          </div>
          <ul className="space-y-2">
            {s.highlights.map((h, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span
                  className={`mt-0.5 shrink-0 w-2 h-2 rounded-full ${
                    h.type === "positive"
                      ? "bg-accent-500"
                      : h.type === "negative"
                        ? "bg-red-500"
                        : "bg-neutral-400"
                  }`}
                />
                <span className="text-neutral-600 dark:text-neutral-300">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">{h.metric}: </span>
                  {h.observation}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {s.goals && s.goals.length > 0 && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <PielIcon size={16} />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Goals</h3>
          </div>
          <ul className="space-y-2">
            {s.goals.map((g, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-neutral-600 dark:text-neutral-300 truncate flex-1">{g.name}</span>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-neutral-900 dark:text-neutral-100 font-medium">{g.conversions.toLocaleString()}</span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${g.rate >= 5 ? "bg-accent-500/10 text-accent-500" : g.rate >= 1 ? "bg-blue-500/10 text-blue-500" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500"}`}>
                    {g.rate.toFixed(1)}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Top pages + referrers + countries side-by-side on larger screens */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { title: "Top pages", rows: s.topPages.map((r) => ({ label: r.page, value: r.sessions, pct: r.percentage })) },
          { title: "Top referrers", rows: s.topReferrers.map((r) => ({ label: r.referrer || "(direct)", value: r.sessions, pct: r.percentage })) },
          { title: "Top countries", rows: s.topCountries.map((r) => ({ label: r.country, value: r.sessions, pct: r.percentage })) },
          { title: "Devices", rows: s.deviceBreakdown.map((r) => ({ label: r.device, value: r.sessions, pct: r.percentage })) },
        ].map((section) => (
          <div
            key={section.title}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4 space-y-3"
          >
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{section.title}</h3>
            <ul className="space-y-2">
              {section.rows.slice(0, 5).map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-neutral-600 dark:text-neutral-300 flex-1">{r.label}</span>
                  <span className="text-neutral-900 dark:text-neutral-100 font-medium shrink-0">{r.value.toLocaleString()}</span>
                  <span className="text-neutral-400 shrink-0 w-9 text-right">{r.pct.toFixed(0)}%</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {s.recommendations.length > 0 && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <PielIcon size={16} />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Recommendations</h3>
          </div>
          <ol className="space-y-2 list-decimal list-inside">
            {s.recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-neutral-600 dark:text-neutral-300">{rec}</li>
            ))}
          </ol>
        </div>
      )}

      {s.gscTopQueries && s.gscTopQueries.length > 0 && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Top search queries</h3>
          <ul className="space-y-2">
            {s.gscTopQueries.slice(0, 8).map((q, i) => (
              <li key={i} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-neutral-600 dark:text-neutral-300 truncate flex-1">"{q.query}"</span>
                <div className="flex items-center gap-3 shrink-0 text-neutral-500">
                  <span><span className="text-neutral-900 dark:text-neutral-100 font-medium">{q.clicks.toLocaleString()}</span> clicks</span>
                  <span>pos <span className="text-neutral-900 dark:text-neutral-100 font-medium">{q.position.toFixed(1)}</span></span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reports list view
// ---------------------------------------------------------------------------

const PAGE_SIZE = 15;

function ReportsList({
  siteId,
  onSelect,
}: {
  siteId: number;
  onSelect: (id: string) => void;
}) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useGetAiReports(siteId, { page, pageSize: PAGE_SIZE });

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-destructive text-sm">
        Failed to load reports.
      </div>
    );
  }

  const reports = data?.data ?? [];
  const meta = data?.meta;

  if (reports.length === 0) {
    return (
      <NothingFound
        title="No reports yet"
        description="Reports are generated automatically on your plan's schedule. Weekly reports run every Monday."
      />
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <ReportRow key={r.id} report={r} onSelect={onSelect} />
      ))}
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page root
// ---------------------------------------------------------------------------

export default function ReportsPage() {
  const { site } = useStore();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const session = authClient.useSession();
  const updateAccountSettings = useUpdateAccountSettings();

  useSetPageTitle("Reports");

  const sendEmailReports = (session.data?.user as any)?.sendAutoEmailReports ?? false;

  const handleEmailReportsToggle = async (checked: boolean) => {
    try {
      await updateAccountSettings.mutateAsync({ sendAutoEmailReports: checked });
      toast.success(checked ? "Email reports enabled" : "Email reports disabled");
      session.refetch();
    } catch {
      toast.error("Failed to update setting");
    }
  };

  if (!site) return null;

  return (
    <InsightsGate>
      <div className="p-2 md:p-4 max-w-[1100px] mx-auto space-y-4">
        <SubHeader pageInfo="reports" />

        {/* Page header */}
        {!selectedReportId && (
          <div className="flex items-center gap-3">
            <PielIcon size={36} />
            <div>
              <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                AI Reports
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Automatic plain-English reports of your site's performance, delivered on your plan's schedule.
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              {IS_CLOUD && (
                <label className="flex items-center gap-1.5 text-xs text-neutral-500 cursor-pointer select-none">
                  <Mail className="w-3.5 h-3.5" />
                  Email reports
                  <Switch
                    checked={sendEmailReports}
                    onCheckedChange={handleEmailReportsToggle}
                    disabled={updateAccountSettings.isPending}
                    className="ml-1"
                  />
                </label>
              )}
              <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Calendar className="w-3.5 h-3.5" />
                Scheduled reports only
              </div>
            </div>
          </div>
        )}

        {selectedReportId ? (
          <ReportDetail
            siteId={Number(site)}
            reportId={selectedReportId}
            onBack={() => setSelectedReportId(null)}
          />
        ) : (
          <ReportsList siteId={Number(site)} onSelect={setSelectedReportId} />
        )}
      </div>
    </InsightsGate>
  );
}
