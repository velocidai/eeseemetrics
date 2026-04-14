// client/src/app/[site]/campaigns/components/CampaignTable.tsx
"use client";

import type { CampaignRow, UtmDimension } from "@/api/analytics/endpoints/campaigns";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function DeltaPill({ value }: { value: number | null }) {
  if (value == null) return <span className="text-neutral-400 text-xs">—</span>;
  const pos = value >= 0;
  return (
    <span
      className={`text-xs font-medium px-1.5 py-0.5 rounded ${
        pos ? "bg-accent-500/10 text-accent-500" : "bg-red-500/10 text-red-500"
      }`}
    >
      {pos ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

function pctDelta(current: number, previous: number | undefined): number | null {
  if (previous == null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

// ---------------------------------------------------------------------------
// Dimension tab bar
// ---------------------------------------------------------------------------

const DIMENSION_TABS: { value: UtmDimension; label: string }[] = [
  { value: "utm_campaign", label: "Campaign" },
  { value: "utm_source", label: "Source" },
  { value: "utm_medium", label: "Medium" },
];

export function DimensionTabs({
  active,
  onChange,
}: {
  active: UtmDimension;
  onChange: (d: UtmDimension) => void;
}) {
  return (
    <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-fit">
      {DIMENSION_TABS.map((tab) => (
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

// ---------------------------------------------------------------------------
// Main table
// ---------------------------------------------------------------------------

interface CampaignTableProps {
  rows: CampaignRow[];
  previousRows?: CampaignRow[];
  dimension: UtmDimension;
  hasGoals: boolean;
  conversionsMap: Record<string, number>;
  onSelectRow: (value: string) => void;
  isLoading: boolean;
}

export function CampaignTable({
  rows,
  previousRows,
  dimension,
  hasGoals,
  conversionsMap,
  onSelectRow,
  isLoading,
}: CampaignTableProps) {
  const prevMap = new Map(previousRows?.map((r) => [r.dimension_value, r]));

  const dimensionLabel =
    dimension === "utm_campaign" ? "Campaign" : dimension === "utm_source" ? "Source" : "Medium";

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          No campaign data yet
        </p>
        <p className="text-xs text-neutral-500 max-w-xs">
          Add UTM parameters to your links to track campaign performance.{" "}
          <a
            href="https://ga-dev-tools.google/campaign-url-builder/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-500 underline underline-offset-2"
          >
            Build UTM URLs →
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
            <th className="text-left py-2 pr-4 font-medium">{dimensionLabel}</th>
            <th className="text-right py-2 px-3 font-medium whitespace-nowrap">Sessions</th>
            <th className="text-right py-2 px-3 font-medium whitespace-nowrap">Δ</th>
            <th className="text-right py-2 px-3 font-medium whitespace-nowrap">Visitors</th>
            <th className="text-right py-2 px-3 font-medium whitespace-nowrap">Pageviews</th>
            <th className="text-right py-2 px-3 font-medium whitespace-nowrap">Bounce</th>
            <th className="text-right py-2 px-3 font-medium whitespace-nowrap">Duration</th>
            <th className="text-right py-2 px-3 font-medium whitespace-nowrap">% Traffic</th>
            {hasGoals && (
              <th className="text-right py-2 pl-3 font-medium whitespace-nowrap">Conv.</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const prev = prevMap.get(row.dimension_value);
            const delta = pctDelta(row.sessions, prev?.sessions);
            return (
              <tr
                key={row.dimension_value}
                onClick={() => onSelectRow(row.dimension_value)}
                className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors"
              >
                <td className="py-2.5 pr-4 font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-[200px]">
                  {row.dimension_value || "(none)"}
                </td>
                <td className="text-right py-2.5 px-3 tabular-nums">
                  {row.sessions.toLocaleString()}
                </td>
                <td className="text-right py-2.5 px-3">
                  <DeltaPill value={delta} />
                </td>
                <td className="text-right py-2.5 px-3 tabular-nums text-neutral-500">
                  {row.unique_visitors.toLocaleString()}
                </td>
                <td className="text-right py-2.5 px-3 tabular-nums text-neutral-500">
                  {row.pageviews.toLocaleString()}
                </td>
                <td className="text-right py-2.5 px-3 tabular-nums text-neutral-500">
                  {row.bounce_rate.toFixed(1)}%
                </td>
                <td className="text-right py-2.5 px-3 text-neutral-500">
                  {fmtDuration(row.avg_session_duration)}
                </td>
                <td className="text-right py-2.5 px-3 text-neutral-500">
                  {row.percentage.toFixed(1)}%
                </td>
                {hasGoals && (
                  <td className="text-right py-2.5 pl-3 tabular-nums text-neutral-500">
                    {(conversionsMap[row.dimension_value] ?? 0).toLocaleString()}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
