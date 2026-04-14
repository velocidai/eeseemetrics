import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createNotificationChannel,
  deleteNotificationChannel,
  fetchNotificationChannels,
  testNotificationChannel,
  updateNotificationChannel,
  type CreateChannelPayload,
  type UpdateChannelPayload,
} from "../endpoints/notificationChannels";

export function useGetNotificationChannels(siteId: number) {
  return useQuery({
    queryKey: ["notification-channels", siteId],
    queryFn: () => fetchNotificationChannels(siteId),
    enabled: siteId > 0,
  });
}

export function useCreateNotificationChannel(siteId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateChannelPayload) =>
      createNotificationChannel(siteId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notification-channels", siteId] }),
  });
}

export function useUpdateNotificationChannel(siteId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ channelId, payload }: { channelId: number; payload: UpdateChannelPayload }) =>
      updateNotificationChannel(siteId, channelId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notification-channels", siteId] }),
  });
}

export function useDeleteNotificationChannel(siteId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (channelId: number) => deleteNotificationChannel(siteId, channelId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notification-channels", siteId] }),
  });
}

export function useTestNotificationChannel(siteId: number) {
  return useMutation({
    mutationFn: (channelId: number) => testNotificationChannel(siteId, channelId),
  });
}
