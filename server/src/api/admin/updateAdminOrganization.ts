import { eq } from "drizzle-orm";
import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/postgres/postgres.js";
import { organization } from "../../db/postgres/schema.js";

interface UpdateOrgBody {
  stripeCustomerId?: string | null;
  customPlan?: { events: number; members: number | null; websites: number | null } | null;
  planOverride?: string | null;
  ltdActive?: boolean | null;
  ltdTier?: 1 | 2 | 3 | null;
  ltdPageviewLimit?: number | null;
}

export async function updateAdminOrganization(
  request: FastifyRequest<{ Params: { organizationId: string }; Body: UpdateOrgBody }>,
  reply: FastifyReply
) {
  const { organizationId } = request.params;
  const { stripeCustomerId, customPlan, planOverride, ltdActive, ltdTier, ltdPageviewLimit } = request.body;

  const updates: Record<string, any> = {};

  if (stripeCustomerId !== undefined) updates.stripeCustomerId = stripeCustomerId;
  if (customPlan !== undefined) updates.customPlan = customPlan;
  if (planOverride !== undefined) updates.planOverride = planOverride;
  if (ltdActive !== undefined) updates.ltdActive = ltdActive;
  if (ltdTier !== undefined) updates.ltdTier = ltdTier;
  if (ltdPageviewLimit !== undefined) updates.ltdPageviewLimit = ltdPageviewLimit;

  if (Object.keys(updates).length === 0) {
    return reply.status(400).send({ error: "No fields to update" });
  }

  try {
    await db.update(organization).set(updates).where(eq(organization.id, organizationId));
    return reply.status(200).send({ success: true });
  } catch (error) {
    console.error("Update Admin Organization Error:", error);
    return reply.status(500).send({ error: "Failed to update organization" });
  }
}
