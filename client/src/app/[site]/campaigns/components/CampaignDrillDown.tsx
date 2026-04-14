"use client";

import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Filter } from "@eesee/shared";
import type { UtmDimension } from "@/api/analytics/endpoints/campaigns";
import { StandardSection } from "../../components/shared/StandardSection/StandardSection";
import { useGetOverviewBucketed } from "@/api/analytics/hooks/useGetOverviewBucketed";
import { SparklinesChart } from "@/app/[site]/main/components/MainSection/SparklinesChart";
import { useStore } from "@/lib/store";
import { buildApiParams } from "@/api/utils";
import { fetchGoals } from "@/api/analytics/endpoints";

interface CampaignDrillDownProps {
  dimensionValue: string;
  dimension: UtmDimension;
  onBack: () => void;
}

const BREAKDOWN_DIMENSION: Record<
  UtmDimension,
  "utm_source" | "utm_medium" | "utm_campaign"
> = {
  utm_campaign: "utm_source",
  utm_source: "utm_campaign",
  utm_medium: "utm_campaign",
};

const DIMENSION_LABEL: Record<UtmDimension, string> = {
  utm_campaign: "Campaign",
  utm_source: "Source",
  utm_medium: "Medium",
};

export function CampaignDrillDown({
  dimensionValue,
  dimension,
  onBack,
}: CampaignDrillDownProps) {
  const { site, time, filters: globalFilters, timezone } = useStore();
  const breakdownDimension = BREAKDOWN_DIMENSION[dimension];

  const utmFilter: Filter[] = [
    {
      parameter: dimension,
      value: [dimensionValue],
      type: "equals" as const,
    },
  ];

  // Traffic over time for the sparkline
  const sparklineQuery = useGetOverviewBucketed({
    site,
    dynamicFilters: utmFilter,
  });

  const sparklineData = sparklineQuery.data?.data?.map((d) => ({
    value: d.sessions,
    time: d.time,
  }));

  // Goal completions for this campaign value
  const goalsParams = buildApiParams(time, {
    filters: [...globalFilters, ...utmFilter],
  });
  const goalsQuery = useQuery({
    queryKey: [
      "campaign-drill-goals",
      site,
      time,
      globalFilters,
      dimension,
      dimensionValue,
      timezone,
    ],
    queryFn: () => fetchGoals(site, { ...goalsParams, page: 1, pageSize: 100 }),
    enabled: !!site,
  });

  const goalRows = goalsQuery.data?.data ?? [];
  const hasGoals = (goalsQuery.data?.meta?.total ?? 0) > 0;

  return (
    <div className="space-y-5">
      {/* Back button + heading */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-500"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-xs text-neutral-500">{DIMENSION_LABEL[dimension]}</p>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {dimensionValue || "(none)"}
          </h2>
        </div>
      </div>

      {/* Traffic over time sparkline */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Traffic Over Time
          </h3>
        </div>
        <div className="p-4 h-32">
          {sparklineQuery.isLoading ? (
            <div className="h-full rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          ) : (
            <SparklinesChart data={sparklineData} isHovering={false} />
          )}
        </div>
      </div>

      {/* Top landing pages for this campaign */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Top Landing Pages
          </h3>
        </div>
        <div className="p-4">
          <StandardSection
            filterParameter="pathname"
            title="Landing Pages"
            getKey={(e) => e.value}
            getLabel={(e) => e.value}
            getValue={(e) => e.value}
            expanded={false}
            close={() => {}}
            customFilters={utmFilter}
          />
        </div>
      </div>

      {/* Source/campaign breakdown */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            By {DIMENSION_LABEL[breakdownDimension]}
          </h3>
        </div>
        <div className="p-4">
          <StandardSection
            filterParameter={breakdownDimension}
            title={DIMENSION_LABEL[breakdownDimension]}
            getKey={(e) => e.value}
            getLabel={(e) => e.value}
            getValue={(e) => e.value}
            expanded={false}
            close={() => {}}
            customFilters={utmFilter}
          />
        </div>
      </div>

      {/* Goal completion breakdown */}
      {hasGoals && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Goal Completions
            </h3>
          </div>
          <div className="p-4">
            {goalRows.length === 0 ? (
              <p className="text-xs text-neutral-500 py-2">No conversions in this period.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
                    <th className="text-left py-2 font-medium">Goal</th>
                    <th className="text-right py-2 px-3 font-medium whitespace-nowrap">
                      Conversions
                    </th>
                    <th className="text-right py-2 font-medium whitespace-nowrap">
                      Conv. Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {goalRows.map((goal) => (
                    <tr
                      key={goal.goalId}
                      className="border-b border-neutral-100 dark:border-neutral-800/50"
                    >
                      <td className="py-2 text-neutral-900 dark:text-neutral-100 truncate max-w-[200px]">
                        {goal.name || `Goal #${goal.goalId}`}
                      </td>
                      <td className="text-right py-2 px-3 tabular-nums">
                        {goal.total_conversions.toLocaleString()}
                      </td>
                      <td className="text-right py-2 text-neutral-500 tabular-nums">
                        {(goal.conversion_rate * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
