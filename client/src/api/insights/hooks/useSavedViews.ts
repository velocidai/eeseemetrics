import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSavedView,
  deleteSavedView,
  fetchSavedViews,
  updateSavedView,
  type CreateViewPayload,
  type UpdateViewPayload,
} from "../endpoints/savedViews";

export function useGetSavedViews(siteId: number) {
  return useQuery({
    queryKey: ["saved-views", siteId],
    queryFn: () => fetchSavedViews(siteId),
    enabled: siteId > 0,
  });
}

export function useCreateSavedView(siteId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateViewPayload) =>
      createSavedView(siteId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["saved-views", siteId] }),
  });
}

export function useUpdateSavedView(siteId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      viewId,
      payload,
    }: {
      viewId: number;
      payload: UpdateViewPayload;
    }) => updateSavedView(siteId, viewId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["saved-views", siteId] }),
  });
}

export function useDeleteSavedView(siteId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (viewId: number) => deleteSavedView(siteId, viewId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["saved-views", siteId] }),
  });
}
