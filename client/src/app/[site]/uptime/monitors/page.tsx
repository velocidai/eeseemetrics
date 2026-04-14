"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { UptimePageHeader } from "../../../uptime/components/UptimePageHeader";
import { MonitorDialog } from "../../../uptime/monitors/components/dialog";
import { MonitorsTable } from "../../../uptime/monitors/components/MonitorsTable";

export default function SiteUptimeMonitorsPage() {
  const { site } = useParams<{ site: string }>();
  const router = useRouter();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleMonitorClick = (monitor: any) => {
    router.push(`/${site}/uptime/monitors/${monitor.id}`);
  };

  return (
    <div className="p-2 md:p-4 max-w-[1300px] mx-auto space-y-3">
      <UptimePageHeader
        title="Uptime Monitoring"
        description="Monitor the availability and performance of your endpoints"
        pageInfo="monitors"
        actions={
          <Button size="sm" className="flex items-center gap-2" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4" />
            Add Monitor
          </Button>
        }
      />

      <MonitorsTable onMonitorClick={handleMonitorClick} siteId={Number(site)} />

      <MonitorDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} siteId={Number(site)} />
    </div>
  );
}
