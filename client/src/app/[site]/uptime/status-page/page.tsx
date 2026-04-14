"use client";

import { useParams } from "next/navigation";
import { StatusOrb } from "../../../uptime/monitors/components/StatusOrb";
import { useMonitors } from "../../../../api/uptime/monitors";
import { UptimePageHeader } from "../../../uptime/components/UptimePageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateTime } from "luxon";

function OverallStatusBanner({ monitors }: { monitors: any[] }) {
  const downCount = monitors.filter(m => m.status?.currentStatus === "down").length;
  const unknownCount = monitors.filter(m => !m.status || m.status.currentStatus === "unknown").length;

  if (downCount > 0) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
        <XCircle className="h-6 w-6 text-red-500 shrink-0" />
        <div>
          <p className="font-semibold text-red-400">Partial Outage</p>
          <p className="text-sm text-neutral-400">
            {downCount} monitor{downCount > 1 ? "s" : ""} currently down
          </p>
        </div>
      </div>
    );
  }

  if (unknownCount === monitors.length) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-800/60 border border-neutral-700">
        <AlertTriangle className="h-6 w-6 text-neutral-400 shrink-0" />
        <div>
          <p className="font-semibold text-neutral-300">No Data Yet</p>
          <p className="text-sm text-neutral-400">Monitors have not reported yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
      <CheckCircle2 className="h-6 w-6 text-green-400 shrink-0" />
      <div>
        <p className="font-semibold text-green-400">All Systems Operational</p>
        <p className="text-sm text-neutral-400">All monitors are reporting up</p>
      </div>
    </div>
  );
}

function MonitorStatusCard({ monitor }: { monitor: any }) {
  const status: "up" | "down" | "unknown" = monitor.status?.currentStatus ?? "unknown";
  const uptime = monitor.status?.uptimePercentage30d;
  const lastChecked = monitor.status?.lastCheckedAt
    ? DateTime.fromISO(monitor.status.lastCheckedAt).toRelative()
    : null;

  const url =
    monitor.monitorType === "http"
      ? monitor.httpConfig?.url
      : monitor.tcpConfig
        ? `${monitor.tcpConfig.host}:${monitor.tcpConfig.port}`
        : null;

  return (
    <div className="flex items-center justify-between py-4 border-b border-neutral-800 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <StatusOrb status={status} size="md" />
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{monitor.name || url}</p>
          {monitor.name && url && <p className="text-xs text-neutral-500 truncate">{url}</p>}
        </div>
      </div>
      <div className="flex items-center gap-6 shrink-0 ml-4">
        {uptime !== null && uptime !== undefined && (
          <div className="text-right">
            <p
              className={cn(
                "text-sm font-medium",
                uptime >= 99 ? "text-green-400" : uptime >= 95 ? "text-yellow-400" : "text-red-400"
              )}
            >
              {uptime.toFixed(2)}%
            </p>
            <p className="text-xs text-neutral-500">30d uptime</p>
          </div>
        )}
        <div className="text-right">
          <p
            className={cn(
              "text-sm font-medium capitalize",
              status === "up" ? "text-green-400" : status === "down" ? "text-red-400" : "text-neutral-400"
            )}
          >
            {status}
          </p>
          {lastChecked && <p className="text-xs text-neutral-500">{lastChecked}</p>}
        </div>
      </div>
    </div>
  );
}

export default function SiteStatusPage() {
  const { site } = useParams<{ site: string }>();
  const { data: monitors, isLoading } = useMonitors({ siteId: Number(site) });

  return (
    <div className="p-2 md:p-4 max-w-[1300px] mx-auto space-y-3">
      <UptimePageHeader
        title="Status Page"
        description="Current status of all monitored endpoints"
        pageInfo="status-page"
      />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      ) : !monitors || monitors.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <p className="text-lg font-medium mb-1">No monitors configured</p>
          <p className="text-sm">Add monitors on the Monitors page to see their status here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <OverallStatusBanner monitors={monitors} />

          <div className="rounded-lg border border-neutral-800 bg-neutral-900/40">
            <div className="px-4 py-3 border-b border-neutral-800">
              <h2 className="text-sm font-medium text-neutral-300">
                Monitors <span className="text-neutral-500 ml-1">({monitors.length})</span>
              </h2>
            </div>
            <div className="px-4">
              {monitors.map(monitor => (
                <MonitorStatusCard key={monitor.id} monitor={monitor} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
