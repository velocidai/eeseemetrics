import { useQuery } from "@tanstack/react-query";
import { fetchAiReports, type AiReportsListResponse, type ReportCadence } from "../endpoints";

export function useGetAiReports(
  siteId: number | undefined,
  params: { cadence?: ReportCadence; page?: number; pageSize?: number } = {}
) {
  return useQuery<AiReportsListResponse>({
    queryKey: ["ai-reports", siteId, params.cadence, params.page, params.pageSize],
    queryFn: () => fetchAiReports(siteId!, params),
    enabled: !!siteId,
    staleTime: 5 * 60 * 1000,
  });
}
