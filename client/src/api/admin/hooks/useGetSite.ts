import { useQuery } from "@tanstack/react-query";
import { fetchSite } from "../endpoints/sites";

export function useGetSite(siteId: number) {
  return useQuery({
    queryKey: ["site", siteId],
    queryFn: () => fetchSite(siteId),
    enabled: !!siteId && siteId > 0,
    staleTime: 5 * 60 * 1000,
  });
}
