import { useQuery } from "@tanstack/react-query";
import { fetchAlertUnreadCount } from "../endpoints";

export function useGetAlertUnreadCount(siteId: number | undefined) {
  return useQuery<{ count: number }>({
    queryKey: ["alert-unread-count", siteId],
    queryFn: () => fetchAlertUnreadCount(siteId!),
    enabled: !!siteId,
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // poll every 5 minutes for new alerts
  });
}
