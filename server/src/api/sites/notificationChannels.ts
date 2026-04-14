import { and, eq } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { db } from "../../db/postgres/postgres.js";
import { notificationChannels, sites } from "../../db/postgres/schema.js";
import { getSessionFromReq } from "../../lib/auth-utils.js";
import { getSitePlanTier, tierAtLeast } from "../../lib/tierUtils.js";
import {
  sendTestAnomalyNotification,
  type AnomalyAlertData,
} from "../../services/anomaly/anomalyNotificationService.js";

const channelTypeSchema = z.enum(["slack", "discord", "webhook", "email"]);

const configSchema = z.object({
  email: z.string().email().optional(),
  webhookUrl: z.string().url().optional(),
  slackWebhookUrl: z.string().url().optional(),
  slackChannel: z.string().optional(),
});

const createSchema = z.object({
  type: channelTypeSchema,
  name: z.string().min(1).max(100),
  config: configSchema,
  triggerEvents: z.array(z.string()).optional(),
  cooldownMinutes: z.number().int().min(0).max(1440).default(60),
});

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  enabled: z.boolean().optional(),
  config: configSchema.optional(),
  triggerEvents: z.array(z.string()).optional(),
  cooldownMinutes: z.number().int().min(0).max(1440).optional(),
});

function parseSiteId(request: FastifyRequest): number {
  return parseInt((request.params as { siteId: string }).siteId, 10);
}

function parseChannelId(request: FastifyRequest): number {
  return parseInt((request.params as { channelId: string }).channelId, 10);
}

async function getSiteDomainAndOrg(
  siteId: number
): Promise<{ domain: string; organizationId: string } | null> {
  const [site] = await db
    .select({ domain: sites.domain, organizationId: sites.organizationId })
    .from(sites)
    .where(eq(sites.siteId, siteId))
    .limit(1);
  if (!site?.organizationId) return null;
  return { domain: site.domain, organizationId: site.organizationId };
}

export async function getNotificationChannels(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const siteId = parseSiteId(request);
  if (isNaN(siteId)) return reply.status(400).send({ error: "Invalid siteId" });

  const tier = await getSitePlanTier(siteId);
  if (!tierAtLeast(tier, "pro")) {
    return reply.status(403).send({ error: "Notification channels require a Pro or Scale plan" });
  }

  const site = await getSiteDomainAndOrg(siteId);
  if (!site) return reply.status(404).send({ error: "Site not found" });

  const channels = await db
    .select()
    .from(notificationChannels)
    .where(
      and(
        eq(notificationChannels.siteId, siteId),
        eq(notificationChannels.organizationId, site.organizationId)
      )
    );

  return reply.send({ channels });
}

export async function createNotificationChannel(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const siteId = parseSiteId(request);
  if (isNaN(siteId)) return reply.status(400).send({ error: "Invalid siteId" });

  const session = await getSessionFromReq(request);
  if (!session?.user?.id) return reply.status(401).send({ error: "Unauthorized" });

  const tier = await getSitePlanTier(siteId);
  if (!tierAtLeast(tier, "pro")) {
    return reply.status(403).send({ error: "Notification channels require a Pro or Scale plan" });
  }

  let body: z.infer<typeof createSchema>;
  try {
    body = createSchema.parse(request.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ error: error.errors[0]?.message ?? "Invalid request body" });
    }
    throw error;
  }
  const { type, name, config, triggerEvents, cooldownMinutes } = body;

  if (type === "email" && !config.email)
    return reply.status(400).send({ error: "Email address required" });
  if (type === "discord" && !config.webhookUrl)
    return reply.status(400).send({ error: "Webhook URL required for Discord" });
  if (type === "slack" && !config.slackWebhookUrl)
    return reply.status(400).send({ error: "Slack webhook URL required" });
  if (type === "webhook" && !config.webhookUrl)
    return reply.status(400).send({ error: "Webhook URL required" });

  const site = await getSiteDomainAndOrg(siteId);
  if (!site) return reply.status(404).send({ error: "Site not found" });

  const [channel] = await db
    .insert(notificationChannels)
    .values({
      siteId,
      organizationId: site.organizationId,
      type,
      name,
      config,
      monitorIds: null,
      triggerEvents: triggerEvents ?? ["all"],
      cooldownMinutes: cooldownMinutes ?? 60,
      createdBy: session.user.id,
    })
    .returning();

  return reply.send(channel);
}

export async function updateNotificationChannel(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const siteId = parseSiteId(request);
  const channelId = parseChannelId(request);
  if (isNaN(siteId)) return reply.status(400).send({ error: "Invalid siteId" });
  if (isNaN(channelId)) return reply.status(400).send({ error: "Invalid channelId" });

  const tier = await getSitePlanTier(siteId);
  if (!tierAtLeast(tier, "pro")) {
    return reply.status(403).send({ error: "Notification channels require a Pro or Scale plan" });
  }

  const site = await getSiteDomainAndOrg(siteId);
  if (!site) return reply.status(404).send({ error: "Site not found" });

  const [existing] = await db
    .select()
    .from(notificationChannels)
    .where(
      and(
        eq(notificationChannels.id, channelId),
        eq(notificationChannels.siteId, siteId),
        eq(notificationChannels.organizationId, site.organizationId)
      )
    )
    .limit(1);

  if (!existing) return reply.status(404).send({ error: "Channel not found" });

  let updates: z.infer<typeof updateSchema>;
  try {
    updates = updateSchema.parse(request.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ error: error.errors[0]?.message ?? "Invalid request body" });
    }
    throw error;
  }
  const [updated] = await db
    .update(notificationChannels)
    .set({ ...updates, updatedAt: new Date().toISOString() })
    .where(eq(notificationChannels.id, channelId))
    .returning();

  return reply.send(updated);
}

export async function deleteNotificationChannel(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const siteId = parseSiteId(request);
  const channelId = parseChannelId(request);
  if (isNaN(siteId)) return reply.status(400).send({ error: "Invalid siteId" });
  if (isNaN(channelId)) return reply.status(400).send({ error: "Invalid channelId" });

  const tier = await getSitePlanTier(siteId);
  if (!tierAtLeast(tier, "pro")) {
    return reply.status(403).send({ error: "Notification channels require a Pro or Scale plan" });
  }

  const site = await getSiteDomainAndOrg(siteId);
  if (!site) return reply.status(404).send({ error: "Site not found" });

  const [existing] = await db
    .select()
    .from(notificationChannels)
    .where(
      and(
        eq(notificationChannels.id, channelId),
        eq(notificationChannels.siteId, siteId),
        eq(notificationChannels.organizationId, site.organizationId)
      )
    )
    .limit(1);

  if (!existing) return reply.status(404).send({ error: "Channel not found" });

  await db
    .delete(notificationChannels)
    .where(eq(notificationChannels.id, channelId));

  return reply.send({ success: true });
}

export async function testNotificationChannel(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const siteId = parseSiteId(request);
  const channelId = parseChannelId(request);
  if (isNaN(siteId)) return reply.status(400).send({ error: "Invalid siteId" });
  if (isNaN(channelId)) return reply.status(400).send({ error: "Invalid channelId" });

  const tier = await getSitePlanTier(siteId);
  if (!tierAtLeast(tier, "pro")) {
    return reply.status(403).send({ error: "Notification channels require a Pro or Scale plan" });
  }

  const site = await getSiteDomainAndOrg(siteId);
  if (!site) return reply.status(404).send({ error: "Site not found" });

  const [channel] = await db
    .select()
    .from(notificationChannels)
    .where(
      and(
        eq(notificationChannels.id, channelId),
        eq(notificationChannels.siteId, siteId),
        eq(notificationChannels.organizationId, site.organizationId)
      )
    )
    .limit(1);

  if (!channel) return reply.status(404).send({ error: "Channel not found" });

  const testAlert: AnomalyAlertData = {
    siteId,
    metric: "sessions",
    currentValue: 42,
    baselineValue: 120,
    percentChange: -65,
    severity: "high",
    detectedAt: new Date().toISOString(),
  };

  try {
    await sendTestAnomalyNotification(channel, site.domain, testAlert);
    return reply.send({ success: true, message: `Test notification sent to "${channel.name}"` });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Failed to send test notification",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
