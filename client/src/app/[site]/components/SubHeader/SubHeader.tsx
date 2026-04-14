"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { canGoForward, goBack, goForward, useStore } from "@/lib/store";
import { FilterParameter } from "@eesee/shared";
import { Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { Filters } from "./Filters/Filters";
import { DateSelector } from "../../../../components/DateSelector/DateSelector";
import { authClient } from "../../../../lib/auth";
import { MobileSidebar } from "../Sidebar/MobileSidebar";
import { PielPageInfo, type PageInfoKey } from "../../../../components/PielPageInfo";
import { ExportButton } from "./Export";
import { NewFilterButton } from "./Filters/NewFilterButton";
import { LiveUserCount } from "./LiveUserCount";
import { SaveViewDialog } from "./SaveViewDialog";
import { ShareSite } from "./ShareSite";
import { ViewsMenu } from "./ViewsMenu";

export function SubHeader({ availableFilters, pageInfo }: { availableFilters?: FilterParameter[]; pageInfo?: PageInfoKey }) {
  const { time, setTime, filters } = useStore();
  const session = authClient.useSession();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const hasNonDefaultState =
    filters.length > 0 || time.wellKnown !== "today";

  return (
    <div>
      <div className="flex gap-2 justify-between">
        <div className="flex items-center gap-2">
          <MobileSidebar />
          <div className="hidden md:block">
            <NewFilterButton availableFilters={availableFilters} />
          </div>
          {session.data && (
            <div className="hidden md:block">
              <ViewsMenu />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <LiveUserCount />
          {session.data && <ShareSite />}
          <div className="hidden md:block">
            <ExportButton />
          </div>
          {session.data && hasNonDefaultState && (
            <div className="hidden md:block">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setSaveDialogOpen(true)}
              >
                <Bookmark className="h-3.5 w-3.5 mr-1" />
                Save view
              </Button>
            </div>
          )}
          {pageInfo && <PielPageInfo page={pageInfo} />}
          <DateSelector time={time} setTime={setTime} />
          <div className="flex items-center">
            <Button
              variant="secondary"
              size="icon"
              onClick={goBack}
              disabled={time.mode === "past-minutes"}
              className="rounded-r-none h-8 w-8"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={goForward}
              disabled={!canGoForward(time)}
              className="rounded-l-none -ml-px h-8 w-8"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
      <div>
        <div className="md:hidden mt-3">
          <NewFilterButton availableFilters={availableFilters} />
        </div>
        <div className="mt-2">
          <Filters availableFilters={availableFilters} />
        </div>
      </div>
      {session.data && (
        <SaveViewDialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen} />
      )}
    </div>
  );
}
