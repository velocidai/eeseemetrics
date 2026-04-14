import { FastifyReply, FastifyRequest } from "fastify";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { DateTime } from "luxon";
import { db } from "../../db/postgres/postgres.js";
import { anomalyAlerts } from "../../db/postgres/schema.js";
import { getUserHasAccessToSite } from "../../lib/auth-utils.js";

const bodySchema = z.object({
  status: z.enum(["seen", "dismissed"]),
});

export async function updateAnomalyAlert(
  request: FastifyRequest<{
    Params: { siteId: string; alertId: string };
    Body: z.infer<typeof bodySchema>;
  }>,
  reply: FastifyReply
) {
  const siteId = parseInt(request.params.siteId, 10);
  const { alertId } = request.params;

  if (isNaN(siteId)) {
    return reply.status(400).send({ error: "Invalid site ID" });
  }

  const hasAccess = await getUserHasAccessToSite(request, siteId);
  if (!hasAccess) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(request.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ error: "Validation error", details: error.errors });
    }
    return reply.status(400).send({ error: "Invalid request body" });
  }

  try {
    const [updated] = await db
      .update(anomalyAlerts)
      .set({ status: body.status, updatedAt: DateTime.utc().toISO() })
      .where(and(eq(anomalyAlerts.id, alertId), eq(anomalyAlerts.siteId, siteId)))
      .returning({ id: anomalyAlerts.id, status: anomalyAlerts.status });

    if (!updated) {
      return reply.status(404).send({ error: "Alert not found" });
    }

    return reply.send({ data: updated });
  } catch (error) {
    console.error("Error updating anomaly alert:", error);
    return reply.status(500).send({ error: "Failed to update anomaly alert" });
  }
}
