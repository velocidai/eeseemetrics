import type { Filter } from "@eesee/shared";
import type { Time } from "../../../components/DateSelector/types";
import { authedFetch } from "../../utils";

export interface SavedView {
  id: number;
  siteId: number;
  userId: string;
  name: string;
  description: string | null;
  page: string;
  filters: Filter[];
  timeConfig: Time;
  createdAt: string;
  updatedAt: string;
}

export interface CreateViewPayload {
  name: string;
  description?: string;
  page: string;
  filters: Filter[];
  timeConfig: Time;
}

export interface UpdateViewPayload {
  name?: string;
  description?: string | null;
}

export async function fetchSavedViews(
  siteId: number
): Promise<{ views: SavedView[] }> {
  return authedFetch<{ views: SavedView[] }>(`/sites/${siteId}/views`);
}

export async function createSavedView(
  siteId: number,
  payload: CreateViewPayload
): Promise<SavedView> {
  return authedFetch<SavedView>(`/sites/${siteId}/views`, undefined, {
    method: "POST",
    data: payload,
  });
}

export async function updateSavedView(
  siteId: number,
  viewId: number,
  payload: UpdateViewPayload
): Promise<SavedView> {
  return authedFetch<SavedView>(
    `/sites/${siteId}/views/${viewId}`,
    undefined,
    { method: "PATCH", data: payload }
  );
}

export async function deleteSavedView(
  siteId: number,
  viewId: number
): Promise<{ success: boolean }> {
  return authedFetch<{ success: boolean }>(
    `/sites/${siteId}/views/${viewId}`,
    undefined,
    { method: "DELETE" }
  );
}
