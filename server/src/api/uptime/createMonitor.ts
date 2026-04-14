import { and, count, eq } from "drizzle-orm";
import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/postgres/postgres.js";
import { uptimeMonitors, uptimeMonitorStatus, member } from "../../db/postgres/schema.js";
import { getSessionFromReq } from "../../lib/auth-utils.js";
import { uptimeService } from "../../services/uptime/uptimeService.js";
import { createMonitorSchema, type CreateMonitorInput } from "./schemas.js";
import { getOrgPlanTier, tierAtLeast } from "../../lib/tierUtils.js";
import { STARTER_MONITOR_LIMIT, PRO_MONITOR_LIMIT, SCALE_MONITOR_LIMIT } from "../../lib/const.js";

interface CreateMonitorBody {
  Body: CreateMonitorInput;
}

export async function createMonitor(request: FastifyRequest<CreateMonitorBody>, reply: FastifyReply) {
  const session = await getSessionFromReq(request);
  const userId = session?.user?.id;

  if (!userId) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  try {
    // Validate request body with Zod
    const validatedBody = createMonitorSchema.parse(request.body);

    const {
      organizationId,
      siteId,
      name,
      monitorType,
      intervalSeconds,
      enabled,
      httpConfig,
      tcpConfig,
      validationRules,
      monitoringType,
      selectedRegions,
    } = validatedBody;

    // Check if user has access to the organization
    const userHasAccess = await db.query.member.findFirst({
      where: and(eq(member.userId, userId), eq(member.organizationId, organizationId)),
    });

    if (!userHasAccess) {
      return reply.status(403).send({ error: "Access denied to organization" });
    }

    // Enforce monitor count limit based on plan tier
    const tier = await getOrgPlanTier(organizationId);
    const monitorLimit = tierAtLeast(tier, "scale")
      ? SCALE_MONITOR_LIMIT
      : tierAtLeast(tier, "pro")
      ? PRO_MONITOR_LIMIT
      : tierAtLeast(tier, "starter")
      ? STARTER_MONITOR_LIMIT
      : 0; // no subscription

    if (monitorLimit !== null) {
      const [{ value: monitorCount }] = await db
        .select({ value: count() })
        .from(uptimeMonitors)
        .where(eq(uptimeMonitors.organizationId, organizationId));

      if (monitorCount >= monitorLimit) {
        return reply.status(403).send({
          error: `You have reached the limit of ${monitorLimit} uptime monitor${monitorLimit === 1 ? "" : "s"} for your plan. Please upgrade to add more.`,
        });
      }
    }

    // Create the monitor
    const [newMonitor] = await db
      .insert(uptimeMonitors)
      .values({
        organizationId,
        siteId: siteId ?? null,
        name,
        monitorType,
        intervalSeconds,
        enabled,
        httpConfig: monitorType === "http" ? httpConfig : null,
        tcpConfig: monitorType === "tcp" ? tcpConfig : null,
        validationRules,
        monitoringType: monitoringType || "local",
        selectedRegions: selectedRegions || ["local"],
        createdBy: userId,
      })
      .returning();

    // Initialize monitor status
    await db.insert(uptimeMonitorStatus).values({
      monitorId: newMonitor.id,
      currentStatus: "unknown",
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
    });

    // Schedule the monitor if enabled
    if (enabled) {
      await uptimeService.onMonitorCreated(newMonitor.id, intervalSeconds);
    }

    return reply.status(201).send(newMonitor);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      const zodError = error as any;
      return reply.status(400).send({
        error: "Validation error",
        details: zodError.errors,
      });
    }
    console.error("Error creating monitor:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
