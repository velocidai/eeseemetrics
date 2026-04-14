import { useQuery } from "@tanstack/react-query";
import { fetchAnomalyAlerts, type AnomalyAlertsListResponse, type AlertStatus, type AlertSeverity } from "../endpoints";

export function useGetAnomalyAlerts(
  siteId: number | undefined,
  params: { status?: AlertStatus; severity?: AlertSeverity; page?: number; pageSize?: number } = {}
) {
  return useQuery<AnomalyAlertsListResponse>({
    queryKey: ["anomaly-alerts", siteId, params.status, params.severity, params.page, params.pageSize],
    queryFn: () => fetchAnomalyAlerts(siteId!, params),
    enabled: !!siteId,
    staleTime: 60 * 1000,
  });
}
