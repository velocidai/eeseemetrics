import { and, eq, InferSelectModel } from "drizzle-orm";
import { db } from "../../db/postgres/postgres.js";
import { notificationChannels, sites } from "../../db/postgres/schema.js";
import { sendEmail } from "../../lib/email/email.js";
import { createServiceLogger } from "../../lib/logger/logger.js";

type NotificationChannel = InferSelectModel<typeof notificationChannels>;

const logger = createServiceLogger("anomaly-notification-service");

const APP_URL = process.env.APP_URL ?? "https://app.eeseemetrics.com";

export interface AnomalyAlertData {
  siteId: number;
  metric: string;
  currentValue: number;
  baselineValue: number;
  percentChange: number;
  severity: "low" | "medium" | "high";
  detectedAt: string;
}

function formatMetricLabel(metric: string): string {
  const labels: Record<string, string> = {
    sessions: "Sessions",
    pageviews: "Pageviews",
    bounce_rate: "Bounce Rate",
  };
  return labels[metric] ?? metric;
}

function formatPct(pct: number): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${Math.round(pct)}%`;
}

function directionLabel(pct: number): string {
  return pct > 0 ? "spiked" : "dropped";
}

const SEVERITY_EMOJI: Record<string, string> = {
  low: "🟡",
  medium: "🟠",
  high: "🔴",
};

const SEVERITY_COLOR: Record<string, number> = {
  low: 0xfbbf24,
  medium: 0xf97316,
  high: 0xef4444,
};

async function sendSlackAnomalyNotification(
  webhookUrl: string,
  slackChannel: string | undefined,
  domain: string,
  alert: AnomalyAlertData
): Promise<void> {
  const metric = formatMetricLabel(alert.metric);
  const pct = formatPct(alert.percentChange);
  const dir = directionLabel(alert.percentChange);
  const emoji = SEVERITY_EMOJI[alert.severity] ?? "⚠️";
  const alertUrl = `${APP_URL}/${alert.siteId}/alerts`;

  const blocks: unknown[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${emoji} ${metric} ${dir} ${pct} — ${domain}`,
        emoji: true,
      },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Metric:*\n${metric}` },
        { type: "mrkdwn", text: `*Severity:*\n${alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}` },
        { type: "mrkdwn", text: `*Current:*\n${alert.currentValue.toLocaleString()}` },
        { type: "mrkdwn", text: `*7-day baseline:*\n${alert.baselineValue.toLocaleString()}` },
      ],
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "View Alert" },
          url: alertUrl,
        },
      ],
    },
  ];

  const payload: Record<string, unknown> = {
    blocks,
    text: `${emoji} ${metric} ${dir} ${pct} on ${domain}`,
  };
  if (slackChannel) payload.channel = slackChannel;

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Slack webhook failed: ${res.status} ${res.statusText}`);
}

async function sendDiscordAnomalyNotification(
  webhookUrl: string,
  domain: string,
  alert: AnomalyAlertData
): Promise<void> {
  const metric = formatMetricLabel(alert.metric);
  const pct = formatPct(alert.percentChange);
  const dir = directionLabel(alert.percentChange);
  const alertUrl = `${APP_URL}/${alert.siteId}/alerts`;

  const embed = {
    title: `${SEVERITY_EMOJI[alert.severity] ?? "⚠️"} ${metric} ${dir} ${pct} — ${domain}`,
    color: SEVERITY_COLOR[alert.severity] ?? 0xfbbf24,
    fields: [
      { name: "Metric", value: metric, inline: true },
      {
        name: "Severity",
        value: alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1),
        inline: true,
      },
      { name: "Current Value", value: alert.currentValue.toLocaleString(), inline: true },
      { name: "7-day Baseline", value: alert.baselineValue.toLocaleString(), inline: true },
      { name: "Change", value: pct, inline: true },
    ],
    url: alertUrl,
    timestamp: new Date().toISOString(),
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  });
  if (!res.ok) throw new Error(`Discord webhook failed: ${res.status} ${res.statusText}`);
}

async function sendWebhookAnomalyNotification(
  webhookUrl: string,
  domain: string,
  alert: AnomalyAlertData
): Promise<void> {
  const payload = {
    event: "anomaly_detected",
    siteId: String(alert.siteId),
    siteDomain: domain,
    metric: alert.metric,
    currentValue: alert.currentValue,
    baselineValue: alert.baselineValue,
    percentChange: alert.percentChange,
    severity: alert.severity,
    detectedAt: alert.detectedAt,
    alertUrl: `${APP_URL}/${alert.siteId}/alerts`,
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Webhook POST failed: ${res.status} ${res.statusText}`);
}

async function sendEmailAnomalyNotification(
  email: string,
  domain: string,
  alert: AnomalyAlertData
): Promise<void> {
  const metric = formatMetricLabel(alert.metric);
  const pct = formatPct(alert.percentChange);
  const dir = directionLabel(alert.percentChange);
  const emoji = SEVERITY_EMOJI[alert.severity] ?? "⚠️";
  const alertUrl = `${APP_URL}/${alert.siteId}/alerts`;

  const subject = `${emoji} ${metric} ${dir} ${pct} — ${domain}`;
  const html = `
    <h2>${emoji} Anomaly Detected on ${domain}</h2>
    <p><strong>${metric}</strong> ${dir} <strong>${pct}</strong> compared to the 7-day baseline.</p>
    <table>
      <tr><td><strong>Metric</strong></td><td>${metric}</td></tr>
      <tr><td><strong>Severity</strong></td><td>${alert.severity}</td></tr>
      <tr><td><strong>Current value</strong></td><td>${alert.currentValue.toLocaleString()}</td></tr>
      <tr><td><strong>7-day baseline</strong></td><td>${alert.baselineValue.toLocaleString()}</td></tr>
      <tr><td><strong>Change</strong></td><td>${pct}</td></tr>
    </table>
    <p><a href="${alertUrl}">View alert →</a></p>
  `;

  await sendEmail(email, subject, html, "Eesee Metrics <alerts@eeseemetrics.com>");
}

async function dispatchToChannel(
  channel: NotificationChannel,
  domain: string,
  alert: AnomalyAlertData,
  now: Date
): Promise<void> {
  // Cooldown check
  if (channel.lastNotifiedAt) {
    const lastNotified = new Date(channel.lastNotifiedAt);
    const cooldownMs = (channel.cooldownMinutes ?? 60) * 60 * 1000;
    if (now.getTime() - lastNotified.getTime() < cooldownMs) return;
  }

  // Metric filter: triggerEvents stores metric names or ["all"]
  if (
    channel.triggerEvents &&
    channel.triggerEvents.length > 0 &&
    !channel.triggerEvents.includes("all") &&
    !channel.triggerEvents.includes(alert.metric)
  ) {
    return;
  }

  if (channel.type === "slack" && channel.config.slackWebhookUrl) {
    await sendSlackAnomalyNotification(
      channel.config.slackWebhookUrl,
      channel.config.slackChannel ?? undefined,
      domain,
      alert
    );
  } else if (channel.type === "discord" && channel.config.webhookUrl) {
    await sendDiscordAnomalyNotification(channel.config.webhookUrl, domain, alert);
  } else if (channel.type === "webhook" && channel.config.webhookUrl) {
    await sendWebhookAnomalyNotification(channel.config.webhookUrl, domain, alert);
  } else if (channel.type === "email" && channel.config.email) {
    await sendEmailAnomalyNotification(channel.config.email, domain, alert);
  }

  await db
    .update(notificationChannels)
    .set({ lastNotifiedAt: now.toISOString() })
    .where(eq(notificationChannels.id, channel.id));

  logger.info(
    { channelId: channel.id, channelType: channel.type, siteId: alert.siteId },
    "Sent anomaly notification"
  );
}

export async function sendAnomalyNotifications(alert: AnomalyAlertData): Promise<void> {
  try {
    const [site] = await db
      .select({ domain: sites.domain, organizationId: sites.organizationId })
      .from(sites)
      .where(eq(sites.siteId, alert.siteId))
      .limit(1);

    if (!site?.organizationId) return;

    const channels = await db
      .select()
      .from(notificationChannels)
      .where(
        and(
          eq(notificationChannels.siteId, alert.siteId),
          eq(notificationChannels.organizationId, site.organizationId),
          eq(notificationChannels.enabled, true)
        )
      );

    if (channels.length === 0) return;

    const now = new Date();
    const results = await Promise.allSettled(
      channels.map((channel) => dispatchToChannel(channel, site.domain, alert, now))
    );

    results.forEach((result, i) => {
      if (result.status === "rejected") {
        logger.error(
          { channelId: channels[i].id, channelType: channels[i].type, error: result.reason },
          "Failed to send anomaly notification"
        );
      }
    });
  } catch (error) {
    logger.error({ siteId: alert.siteId, error }, "sendAnomalyNotifications failed");
  }
}

// Used by the test endpoint — bypasses cooldown, sends directly to one channel
export async function sendTestAnomalyNotification(
  channel: Pick<NotificationChannel, "type" | "config">,
  domain: string,
  alert: AnomalyAlertData
): Promise<void> {
  if (channel.type === "slack" && channel.config.slackWebhookUrl) {
    await sendSlackAnomalyNotification(
      channel.config.slackWebhookUrl,
      channel.config.slackChannel ?? undefined,
      domain,
      alert
    );
  } else if (channel.type === "discord" && channel.config.webhookUrl) {
    await sendDiscordAnomalyNotification(channel.config.webhookUrl, domain, alert);
  } else if (channel.type === "webhook" && channel.config.webhookUrl) {
    await sendWebhookAnomalyNotification(channel.config.webhookUrl, domain, alert);
  } else if (channel.type === "email" && channel.config.email) {
    await sendEmailAnomalyNotification(channel.config.email, domain, alert);
  } else {
    throw new Error(`Cannot test: missing config for channel type "${channel.type}"`);
  }
}
