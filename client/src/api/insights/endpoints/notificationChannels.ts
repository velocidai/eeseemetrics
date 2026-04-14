import { authedFetch } from "../../utils";

export type ChannelType = "slack" | "discord" | "webhook" | "email";

export interface AnomalyNotificationChannel {
  id: number;
  siteId: number;
  organizationId: string;
  type: ChannelType;
  name: string;
  enabled: boolean;
  config: {
    email?: string;
    webhookUrl?: string;
    slackWebhookUrl?: string;
    slackChannel?: string;
  };
  triggerEvents: string[];
  cooldownMinutes: number;
  lastNotifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateChannelPayload {
  type: ChannelType;
  name: string;
  config: AnomalyNotificationChannel["config"];
  triggerEvents?: string[];
  cooldownMinutes?: number;
}

export interface UpdateChannelPayload {
  name?: string;
  enabled?: boolean;
  config?: AnomalyNotificationChannel["config"];
  triggerEvents?: string[];
  cooldownMinutes?: number;
}

export async function fetchNotificationChannels(
  siteId: number
): Promise<{ channels: AnomalyNotificationChannel[] }> {
  return authedFetch<{ channels: AnomalyNotificationChannel[] }>(
    `/sites/${siteId}/notification-channels`
  );
}

export async function createNotificationChannel(
  siteId: number,
  payload: CreateChannelPayload
): Promise<AnomalyNotificationChannel> {
  return authedFetch<AnomalyNotificationChannel>(
    `/sites/${siteId}/notification-channels`,
    undefined,
    { method: "POST", data: payload }
  );
}

export async function updateNotificationChannel(
  siteId: number,
  channelId: number,
  payload: UpdateChannelPayload
): Promise<AnomalyNotificationChannel> {
  return authedFetch<AnomalyNotificationChannel>(
    `/sites/${siteId}/notification-channels/${channelId}`,
    undefined,
    { method: "PUT", data: payload }
  );
}

export async function deleteNotificationChannel(
  siteId: number,
  channelId: number
): Promise<{ success: boolean }> {
  return authedFetch<{ success: boolean }>(
    `/sites/${siteId}/notification-channels/${channelId}`,
    undefined,
    { method: "DELETE" }
  );
}

export async function testNotificationChannel(
  siteId: number,
  channelId: number
): Promise<{ success: boolean; message: string }> {
  return authedFetch<{ success: boolean; message: string }>(
    `/sites/${siteId}/notification-channels/${channelId}/test`,
    undefined,
    { method: "POST", data: {} }
  );
}
