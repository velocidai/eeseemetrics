import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchAnomalyAlert } from "../endpoints";

export function useUpdateAnomalyAlert(siteId: number | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, status }: { alertId: string; status: "seen" | "dismissed" }) =>
      patchAnomalyAlert(siteId!, alertId, status),
    onSuccess: () => {
      // Invalidate both the list and the unread badge
      queryClient.invalidateQueries({ queryKey: ["anomaly-alerts", siteId] });
      queryClient.invalidateQueries({ queryKey: ["alert-unread-count", siteId] });
    },
  });
}
