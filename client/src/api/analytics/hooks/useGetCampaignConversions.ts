import { useQuery } from "@tanstack/react-query";
import { useStore } from "../../../lib/store";
import { buildApiParams } from "../../utils";
import { fetchCampaignConversions } from "../endpoints/campaigns";
import type { UtmDimension } from "../endpoints/campaigns";

export function useGetCampaignConversions({ dimension }: { dimension: UtmDimension }) {
  const { site, time, filters, timezone } = useStore();
  const params = buildApiParams(time, { filters });

  return useQuery({
    queryKey: ["campaign-conversions", site, time, filters, dimension, timezone],
    queryFn: () => fetchCampaignConversions(site, { ...params, dimension }),
    enabled: !!site,
    staleTime: 60_000,
  });
}
