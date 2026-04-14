"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Bell, Plus, Trash2, TestTube2, Power, Pencil, Edit, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ConfirmationModal,
} from "@/components/ConfirmationModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetNotificationChannels,
  useCreateNotificationChannel,
  useUpdateNotificationChannel,
  useDeleteNotificationChannel,
  useTestNotificationChannel,
} from "@/api/insights/hooks/useAnomalyNotificationChannels";
import type {
  AnomalyNotificationChannel,
  ChannelType,
  CreateChannelPayload,
} from "@/api/insights/endpoints/notificationChannels";
import {
  useNotificationChannels,
  useDeleteChannel,
  useUpdateChannel,
  useTestChannel,
  NotificationChannel,
} from "@/api/uptime/notifications";
import { NotificationDialog } from "../../../uptime/notifications/components/NotificationDialog";
import { CHANNEL_CONFIG } from "../../../uptime/notifications/constants";
import { useNotificationsStore } from "../../../uptime/notifications/notificationsStore";

// ---------------------------------------------------------------------------
// Anomaly channel type metadata
// ---------------------------------------------------------------------------

const ANOMALY_CHANNEL_TYPES: {
  type: ChannelType;
  label: string;
  description: string;
  scaleOnly?: boolean;
}[] = [
  { type: "slack", label: "Slack", description: "Send alerts to a Slack channel via incoming webhook" },
  { type: "discord", label: "Discord", description: "Send alerts to a Discord channel via webhook" },
  { type: "webhook", label: "Webhook", description: "POST JSON payload to any URL (Zapier, PagerDuty, custom)" },
  {
    type: "email",
    label: "Email",
    description: "Send alert emails via Eesee Metrics",
    scaleOnly: true,
  },
];

// ---------------------------------------------------------------------------
// Anomaly channel dialog
// ---------------------------------------------------------------------------

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(["slack", "discord", "webhook", "email"]),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  webhookUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  slackWebhookUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  slackChannel: z.string().optional(),
  cooldownMinutes: z.coerce.number().int().min(0).max(1440),
});

type FormValues = z.infer<typeof formSchema>;

function AnomalyChannelDialog({
  siteId,
  editing,
  defaultType,
  open,
  onClose,
}: {
  siteId: number;
  editing: AnomalyNotificationChannel | null;
  defaultType: ChannelType;
  open: boolean;
  onClose: () => void;
}) {
  const createMutation = useCreateNotificationChannel(siteId);
  const updateMutation = useUpdateNotificationChannel(siteId);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: editing
      ? {
          name: editing.name,
          type: editing.type,
          email: editing.config.email ?? "",
          webhookUrl: editing.config.webhookUrl ?? "",
          slackWebhookUrl: editing.config.slackWebhookUrl ?? "",
          slackChannel: editing.config.slackChannel ?? "",
          cooldownMinutes: editing.cooldownMinutes,
        }
      : {
          type: defaultType,
          name: "",
          email: "",
          webhookUrl: "",
          slackWebhookUrl: "",
          slackChannel: "",
          cooldownMinutes: 60,
        },
  });

  const selectedType = watch("type");

  async function onSubmit(values: FormValues) {
    const config: CreateChannelPayload["config"] = {};
    if (values.email) config.email = values.email;
    if (values.webhookUrl) config.webhookUrl = values.webhookUrl;
    if (values.slackWebhookUrl) config.slackWebhookUrl = values.slackWebhookUrl;
    if (values.slackChannel) config.slackChannel = values.slackChannel;

    if (editing) {
      await updateMutation.mutateAsync({
        channelId: editing.id,
        payload: { name: values.name, config, cooldownMinutes: values.cooldownMinutes },
      });
    } else {
      await createMutation.mutateAsync({
        type: values.type,
        name: values.name,
        config,
        triggerEvents: ["all"],
        cooldownMinutes: values.cooldownMinutes,
      });
    }
    reset();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit channel" : "Add anomaly channel"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input {...register("name")} placeholder="e.g. #alerts-channel" />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {!editing && (
            <div className="space-y-1">
              <Label>Type</Label>
              <select
                {...register("type")}
                className="w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              >
                {ANOMALY_CHANNEL_TYPES.map((ct) => (
                  <option key={ct.type} value={ct.type}>
                    {ct.label}
                    {ct.scaleOnly ? " (Scale only)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedType === "slack" && (
            <>
              <div className="space-y-1">
                <Label>Slack webhook URL</Label>
                <Input {...register("slackWebhookUrl")} placeholder="https://hooks.slack.com/services/..." />
                {errors.slackWebhookUrl && <p className="text-xs text-red-500">{errors.slackWebhookUrl.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Slack channel (optional)</Label>
                <Input {...register("slackChannel")} placeholder="#alerts" />
              </div>
            </>
          )}

          {(selectedType === "discord" || selectedType === "webhook") && (
            <div className="space-y-1">
              <Label>Webhook URL</Label>
              <Input {...register("webhookUrl")} placeholder="https://..." />
              {errors.webhookUrl && <p className="text-xs text-red-500">{errors.webhookUrl.message}</p>}
            </div>
          )}

          {selectedType === "email" && (
            <div className="space-y-1">
              <Label>Email address</Label>
              <Input {...register("email")} type="email" placeholder="you@example.com" />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
          )}

          <div className="space-y-1">
            <Label>Cooldown (minutes)</Label>
            <Input {...register("cooldownMinutes")} type="number" min={0} max={1440} />
            <p className="text-xs text-neutral-500">Minimum time between repeat notifications for the same metric.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => { reset(); onClose(); }}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : editing ? "Save changes" : "Add channel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Anomaly channels section
// ---------------------------------------------------------------------------

function AnomalyChannelsSection({ siteId }: { siteId: number }) {
  const { data, isLoading } = useGetNotificationChannels(siteId);
  const deleteMutation = useDeleteNotificationChannel(siteId);
  const updateMutation = useUpdateNotificationChannel(siteId);
  const testMutation = useTestNotificationChannel(siteId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<AnomalyNotificationChannel | null>(null);
  const [defaultType, setDefaultType] = useState<ChannelType>("slack");
  const [testingId, setTestingId] = useState<number | null>(null);

  const channels = data?.channels ?? [];

  function openCreate(type: ChannelType) {
    setEditingChannel(null);
    setDefaultType(type);
    setDialogOpen(true);
  }

  function openEdit(channel: AnomalyNotificationChannel) {
    setEditingChannel(channel);
    setDialogOpen(true);
  }

  async function handleTest(channelId: number) {
    setTestingId(channelId);
    try {
      await testMutation.mutateAsync(channelId);
    } finally {
      setTestingId(null);
    }
  }

  async function handleToggleEnabled(channel: AnomalyNotificationChannel) {
    await updateMutation.mutateAsync({
      channelId: channel.id,
      payload: { enabled: !channel.enabled },
    });
  }

  async function handleDelete(channelId: number) {
    await deleteMutation.mutateAsync(channelId);
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Anomaly Alert Channels</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Get notified when anomalies are detected on this site. Channels are site-specific.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ANOMALY_CHANNEL_TYPES.map((ct) => (
          <button
            key={ct.type}
            onClick={() => openCreate(ct.type)}
            className="flex flex-col items-start gap-1 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 text-left hover:border-accent-500 transition-colors"
          >
            <span className="text-sm font-medium">{ct.label}</span>
            {ct.scaleOnly && (
              <Badge variant="outline" className="text-xs">Scale</Badge>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : channels.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 py-8 text-center">
          <p className="text-sm text-neutral-500">No anomaly alert channels yet.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => openCreate("slack")}>
            <Plus className="w-4 h-4 mr-1" /> Add your first channel
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 dark:border-neutral-700 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${channel.enabled ? "bg-accent-500" : "bg-neutral-400"}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{channel.name}</p>
                  <p className="text-xs text-neutral-500 capitalize">{channel.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTest(channel.id)}
                  disabled={testingId === channel.id}
                  className="text-xs"
                >
                  <TestTube2 className="w-3.5 h-3.5 mr-1" />
                  {testingId === channel.id ? "Sending…" : "Test"}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <span className="sr-only">Actions</span>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
                        <circle cx="7.5" cy="3" r="1" />
                        <circle cx="7.5" cy="7.5" r="1" />
                        <circle cx="7.5" cy="12" r="1" />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(channel)}>
                      <Pencil className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleEnabled(channel)}>
                      <Power className="w-4 h-4 mr-2" />
                      {channel.enabled ? "Disable" : "Enable"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(channel.id)}
                      className="text-red-500 focus:text-red-500"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnomalyChannelDialog
        siteId={siteId}
        editing={editingChannel}
        defaultType={defaultType}
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingChannel(null); }}
      />
    </section>
  );
}

// ---------------------------------------------------------------------------
// Uptime channels section
// ---------------------------------------------------------------------------

type UptimeChannelType = NotificationChannel["type"];

function UptimeChannelsSection() {
  const { data, isLoading } = useNotificationChannels();
  const updateChannel = useUpdateChannel();
  const deleteChannel = useDeleteChannel();
  const testChannel = useTestChannel();
  const { openDialog } = useNotificationsStore();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<NotificationChannel | null>(null);

  const handleToggleChannel = async (channel: NotificationChannel) => {
    try {
      await updateChannel.mutateAsync({ id: channel.id, data: { enabled: !channel.enabled } });
      toast.success(channel.enabled ? "Channel disabled" : "Channel enabled");
    } catch {
      toast.error("Failed to update channel");
    }
  };

  const handleDeleteChannel = async () => {
    if (!channelToDelete) return;
    try {
      await deleteChannel.mutateAsync(channelToDelete.id);
      toast.success("Channel deleted");
      setChannelToDelete(null);
    } catch (error) {
      toast.error("Failed to delete channel");
      throw error;
    }
  };

  const handleTestChannel = async (channel: NotificationChannel) => {
    try {
      await testChannel.mutateAsync(channel.id);
      toast.success("Test notification sent");
    } catch {
      toast.error("Failed to send test notification");
    }
  };

  const openCreateDialog = (type: UptimeChannelType) => {
    if (CHANNEL_CONFIG[type].disabled) {
      toast.info("This channel type is coming soon");
      return;
    }
    openDialog(type);
  };

  const channels = data?.channels ?? [];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Uptime Alert Channels</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Get notified when monitors go down or recover. Channels apply across your organization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(CHANNEL_CONFIG).map(([type, config]) => {
          const Icon = config.icon;
          return (
            <div
              key={type}
              className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:border-accent-500 transition-colors"
              onClick={() => openCreateDialog(type as UptimeChannelType)}
            >
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {config.title}
                </p>
                <p className="text-xs text-neutral-500">{config.description}{config.disabled ? " — Coming soon" : ""}</p>
              </div>
              <Button variant="outline" size="sm" disabled={config.disabled}>
                Create
              </Button>
            </div>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : channels.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 py-8 text-center">
          <p className="text-sm text-neutral-500">No uptime alert channels yet.</p>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channels.map((channel) => {
                const config = CHANNEL_CONFIG[channel.type];
                const Icon = config.icon;
                return (
                  <TableRow key={channel.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {channel.name}
                        {!channel.enabled && (
                          <span className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded">
                            Disabled
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="capitalize">{channel.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-neutral-500">
                      {channel.type === "email" && channel.config?.email}
                      {channel.type === "discord" && "Discord webhook"}
                      {channel.type === "slack" && `Slack ${channel.config?.slackChannel || "webhook"}`}
                      {channel.type === "sms" && channel.config?.phoneNumber}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleToggleChannel(channel)}>
                            <Power className="h-4 w-4" />
                            {channel.enabled ? "Disable" : "Enable"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleTestChannel(channel)}
                            disabled={!channel.enabled}
                          >
                            <Bell className="h-4 w-4" />
                            Test
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDialog(channel.type, channel)}>
                            <Edit className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => { setChannelToDelete(channel); setDeleteModalOpen(true); }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <NotificationDialog />
      <ConfirmationModal
        isOpen={deleteModalOpen}
        setIsOpen={setDeleteModalOpen}
        onConfirm={handleDeleteChannel}
        title="Delete Notification Channel"
        description={
          channelToDelete ? (
            <>Are you sure you want to delete <strong>{channelToDelete.name}</strong>? This action cannot be undone.</>
          ) : (
            "Are you sure you want to delete this notification channel?"
          )
        }
        primaryAction={{ children: "Delete Channel", variant: "destructive" }}
      />
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function NotificationsPage() {
  const params = useParams<{ site: string }>();
  const siteId = Number(params.site);

  return (
    <div className="p-6 max-w-3xl space-y-10">
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Channels
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Manage where alerts are sent for anomaly detection and uptime monitoring.
        </p>
      </div>

      <AnomalyChannelsSection siteId={siteId} />

      <div className="border-t border-neutral-200 dark:border-neutral-800" />

      <UptimeChannelsSection />
    </div>
  );
}
