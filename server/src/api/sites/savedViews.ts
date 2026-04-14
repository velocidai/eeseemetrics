import { and, desc, eq } from "drizzle-orm";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { db } from "../../db/postgres/postgres.js";
import { savedViews } from "../../db/postgres/schema.js";
import { getSessionFromReq } from "../../lib/auth-utils.js";
import { getSitePlanTier, tierAtLeast } from "../../lib/tierUtils.js";

function parseSiteId(request: FastifyRequest): number {
  return parseInt((request.params as { siteId: string }).siteId, 10);
}

function parseViewId(request: FastifyRequest): number {
  return parseInt((request.params as { viewId: string }).viewId, 10);
}

const filterItemSchema = z.object({
  parameter: z.string(),
  value: z.array(z.union([z.string(), z.number()])),
  type: z.string(),
});

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  page: z.string().min(1).max(50),
  filters: z.array(filterItemSchema),
  timeConfig: z.record(z.unknown()),
});

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
});

export async function getSavedViews(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const siteId = parseSiteId(request);
  if (isNaN(siteId)) return reply.status(400).send({ error: "Invalid siteId" });

  const session = await getSessionFromReq(request);
  if (!session?.user?.id) return reply.status(401).send({ error: "Unauthorized" });

  const tier = await getSitePlanTier(siteId);
  if (!tierAtLeast(tier, "pro")) {
    return reply.status(403).send({ error: "Saved views require a Pro or Scale plan" });
  }

  const views = await db
    .select()
    .from(savedViews)
    .where(
      and(
        eq(savedViews.siteId, siteId),
        eq(savedViews.userId, session.user.id)
      )
    )
    .orderBy(desc(savedViews.createdAt));

  return reply.send({ views });
}

export async function createSavedView(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const siteId = parseSiteId(request);
  if (isNaN(siteId)) return reply.status(400).send({ error: "Invalid siteId" });

  const session = await getSessionFromReq(request);
  if (!session?.user?.id) return reply.status(401).send({ error: "Unauthorized" });

  const tier = await getSitePlanTier(siteId);
  if (!tierAtLeast(tier, "pro")) {
    return reply.status(403).send({ error: "Saved views require a Pro or Scale plan" });
  }

  let body: z.infer<typeof createSchema>;
  try {
    body = createSchema.parse(request.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply
        .status(400)
        .send({ error: error.errors[0]?.message ?? "Invalid request body" });
    }
    throw error;
  }

  const { name, description, page, filters, timeConfig } = body;

  const [view] = await db
    .insert(savedViews)
    .values({
      siteId,
      userId: session.user.id,
      name,
      description: description ?? null,
      page,
      filters,
      timeConfig,
    })
    .returning();

  return reply.status(201).send(view);
}

export async function updateSavedView(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const siteId = parseSiteId(request);
  const viewId = parseViewId(request);
  if (isNaN(siteId)) return reply.status(400).send({ error: "Invalid siteId" });
  if (isNaN(viewId)) return reply.status(400).send({ error: "Invalid viewId" });

  const session = await getSessionFromReq(request);
  if (!session?.user?.id) return reply.status(401).send({ error: "Unauthorized" });

  const [existing] = await db
    .select()
    .from(savedViews)
    .where(
      and(
        eq(savedViews.id, viewId),
        eq(savedViews.siteId, siteId),
        eq(savedViews.userId, session.user.id)
      )
    )
    .limit(1);

  if (!existing) return reply.status(404).send({ error: "View not found" });

  let updates: z.infer<typeof updateSchema>;
  try {
    updates = updateSchema.parse(request.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply
        .status(400)
        .send({ error: error.errors[0]?.message ?? "Invalid request body" });
    }
    throw error;
  }

  const [updated] = await db
    .update(savedViews)
    .set({ ...updates, updatedAt: new Date().toISOString() })
    .where(and(eq(savedViews.id, viewId), eq(savedViews.userId, session.user.id)))
    .returning();

  return reply.send(updated);
}

export async function deleteSavedView(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const siteId = parseSiteId(request);
  const viewId = parseViewId(request);
  if (isNaN(siteId)) return reply.status(400).send({ error: "Invalid siteId" });
  if (isNaN(viewId)) return reply.status(400).send({ error: "Invalid viewId" });

  const session = await getSessionFromReq(request);
  if (!session?.user?.id) return reply.status(401).send({ error: "Unauthorized" });

  const [existing] = await db
    .select()
    .from(savedViews)
    .where(
      and(
        eq(savedViews.id, viewId),
        eq(savedViews.siteId, siteId),
        eq(savedViews.userId, session.user.id)
      )
    )
    .limit(1);

  if (!existing) return reply.status(404).send({ error: "View not found" });

  await db.delete(savedViews).where(and(eq(savedViews.id, viewId), eq(savedViews.userId, session.user.id)));

  return reply.send({ success: true });
}
