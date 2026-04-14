"use client";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bookmark, ChevronDown } from "lucide-react";
import { useStore } from "@/lib/store";
import { useGetSavedViews } from "@/api/insights/hooks/useSavedViews";
import type { SavedView } from "@/api/insights/endpoints/savedViews";
import type { Time } from "@/components/DateSelector/types";
import type { Filter } from "@eesee/shared";

function getCurrentPage(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length > 1 ? segments[1] : "main";
}

export function ViewsMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams<{ site: string }>();
  const siteId = parseInt(params.site, 10);
  const { setFilters, setTime } = useStore();
  const currentPage = getCurrentPage(pathname);

  const { data, isLoading } = useGetSavedViews(siteId);
  const views = data?.views ?? [];

  // Return nothing when loading or when there are no saved views
  if (isLoading || views.length === 0) return null;

  function loadView(view: SavedView) {
    setFilters(view.filters as Filter[]);
    setTime(view.timeConfig as Time);
    const dest =
      view.page === "main" ? `/${siteId}` : `/${siteId}/${view.page}`;
    router.push(dest);
  }

  const pageViews = views.filter((v) => v.page === currentPage);
  const otherViews = views.filter((v) => v.page !== currentPage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Bookmark className="h-3.5 w-3.5 mr-1" />
          My views
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {pageViews.length > 0 ? (
          <>
            <DropdownMenuLabel className="text-xs text-neutral-400 font-normal">
              This page
            </DropdownMenuLabel>
            {pageViews.map((view) => (
              <DropdownMenuItem key={view.id} onClick={() => loadView(view)}>
                <span className="truncate">{view.name}</span>
              </DropdownMenuItem>
            ))}
          </>
        ) : (
          <DropdownMenuItem disabled>No views for this page</DropdownMenuItem>
        )}
        {otherViews.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-neutral-400 font-normal">
              Other pages
            </DropdownMenuLabel>
            {otherViews.map((view) => (
              <DropdownMenuItem key={view.id} onClick={() => loadView(view)}>
                <span className="truncate">{view.name}</span>
                <span className="ml-auto text-xs text-neutral-500 capitalize">
                  {view.page}
                </span>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
