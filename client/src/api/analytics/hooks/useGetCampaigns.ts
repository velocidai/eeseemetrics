import { useQuery } from "@tanstack/react-query";
import { useStore } from "../../../lib/store";
import { fetchCampaigns, type CampaignsResponse, type UtmDimension } from "../endpoints/campaigns";

interface UseGetCampaignsOptions {
  dimension?: UtmDimension;
  limit?: number;
  page?: number;
}

/**
 * Returns current-period and previous-period campaign data together.
 * Delta computation is left to the consumer.
 */
export function useGetCampaigns(options: UseGetCampaignsOptions = {}) {
  const { site, time, previousTime, filters } = useStore();
  const { dimension = "utm_campaign", limit = 50, page = 1 } = options;

  const current = useQuery<CampaignsResponse>({
    queryKey: ["campaigns", site, time, filters, dimension, limit, page],
    queryFn: () => fetchCampaigns(site, { time, filters, dimension, limit, page }),
    enabled: !!site,
    staleTime: 60_000,
  });

  const previous = useQuery<CampaignsResponse>({
    queryKey: ["campaigns-prev", site, previousTime, filters, dimension, limit, page],
    queryFn: () => fetchCampaigns(site, { time: previousTime, filters, dimension, limit, page }),
    enabled: !!site && !!previousTime,
    staleTime: 60_000,
  });

  return { current, previous };
}
