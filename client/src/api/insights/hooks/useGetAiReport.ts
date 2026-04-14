import { useQuery } from "@tanstack/react-query";
import { fetchAiReport, type AiReport } from "../endpoints";

export function useGetAiReport(siteId: number | undefined, reportId: string | null) {
  return useQuery<{ data: AiReport }>({
    queryKey: ["ai-report", siteId, reportId],
    queryFn: () => fetchAiReport(siteId!, reportId!),
    enabled: !!siteId && !!reportId,
    staleTime: Infinity, // reports are immutable once complete
  });
}
