import { authedFetch, buildApiParams } from "../../utils";
import { toQueryParams } from "./types";
import type { CommonApiParams } from "./types";
import type { Time } from "../../../components/DateSelector/types";
import type { Filter } from "@eesee/shared";

export type UtmDimension = "utm_campaign" | "utm_source" | "utm_medium";

export interface CampaignRow {
  dimension_value: string;
  sessions: number;
  unique_visitors: number;
  pageviews: number;
  bounce_rate: number;
  avg_session_duration: number;
  percentage: number;
}

export interface CampaignsResponse {
  data: CampaignRow[];
  totalCount: number;
}

export interface FetchCampaignsParams {
  time: Time;
  filters?: Filter[];
  dimension?: UtmDimension;
  limit?: number;
  page?: number;
}

export async function fetchCampaigns(
  siteId: string | number,
  params: FetchCampaignsParams
): Promise<CampaignsResponse> {
  const apiParams = buildApiParams(params.time, { filters: params.filters });
  const query: Record<string, any> = {
    ...toQueryParams(apiParams),
  };
  if (params.dimension) query.dimension = params.dimension;
  if (params.limit) query.limit = params.limit;
  if (params.page) query.page = params.page;

  return authedFetch<CampaignsResponse>(`/sites/${siteId}/campaigns`, query);
}

export interface CampaignConversionsParams extends CommonApiParams {
  dimension?: UtmDimension;
}

export async function fetchCampaignConversions(
  siteId: string | number,
  params: CampaignConversionsParams
): Promise<Record<string, number>> {
  return authedFetch<Record<string, number>>(
    `/sites/${siteId}/campaign-conversions`,
    {
      ...toQueryParams(params),
      dimension: params.dimension,
    }
  );
}
