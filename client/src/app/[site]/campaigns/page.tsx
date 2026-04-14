"use client";

import { useState } from "react";
import { Megaphone } from "lucide-react";
import { useStore } from "@/lib/store";
import { useSetPageTitle } from "@/hooks/useSetPageTitle";
import { SubHeader } from "../components/SubHeader/SubHeader";
import { useGetCampaigns } from "@/api/analytics/hooks/useGetCampaigns";
import { useGetGoals } from "@/api/analytics/hooks/goals/useGetGoals";
import { useGetCampaignConversions } from "@/api/analytics/hooks/useGetCampaignConversions";
import { CampaignTable, DimensionTabs } from "./components/CampaignTable";
import { CampaignDrillDown } from "./components/CampaignDrillDown";
import type { UtmDimension } from "@/api/analytics/endpoints/campaigns";

const PAGE_SIZE = 50;

export default function CampaignsPage() {
  const { site } = useStore();
  const [dimension, setDimension] = useState<UtmDimension>("utm_campaign");
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useSetPageTitle("Campaigns");

  const { current, previous } = useGetCampaigns({ dimension, limit: PAGE_SIZE, page });
  const { data: goalsData } = useGetGoals({});
  const hasGoals = (goalsData?.data?.length ?? 0) > 0;
  const { data: conversionsData } = useGetCampaignConversions({ dimension });
  const conversionsMap = conversionsData ?? {};

  if (!site) return null;

  const isLoading = current.isLoading;
  const rows = current.data?.data ?? [];
  const prevRows = previous.data?.data ?? [];
  const totalCount = current.data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  function handleDimensionChange(d: UtmDimension) {
    setDimension(d);
    setSelectedRow(null);
    setPage(1);
  }

  if (selectedRow !== null) {
    return (
      <div className="p-2 md:p-4 max-w-[1100px] mx-auto space-y-4">
        <SubHeader pageInfo="campaigns" />
        <CampaignDrillDown
          dimensionValue={selectedRow}
          dimension={dimension}
          onBack={() => setSelectedRow(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-2 md:p-4 max-w-[1100px] mx-auto space-y-4">
      <SubHeader pageInfo="campaigns" />

      {/* Page header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="rounded-lg bg-accent-500/10 p-2">
          <Megaphone className="w-4 h-4 text-accent-500" />
        </div>
        <div className="flex-1">
          <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Campaigns
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Traffic grouped by UTM parameters with period-over-period comparison.
          </p>
        </div>
        <DimensionTabs active={dimension} onChange={handleDimensionChange} />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
        <CampaignTable
          rows={rows}
          previousRows={prevRows}
          dimension={dimension}
          hasGoals={hasGoals}
          conversionsMap={conversionsMap}
          onSelectRow={setSelectedRow}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-neutral-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-xs px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
