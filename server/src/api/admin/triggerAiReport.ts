import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { aiReportService } from "../../services/aiReports/aiReportService.js";
import type { ReportCadence } from "../../services/aiReports/aiReportTypes.js";

const bodySchema = z.object({
  siteId: z.number().int().positive(),
  cadence: z.enum(["weekly", "monthly", "quarterly", "yearly"]),
});

/**
 * POST /api/admin/ai-report/trigger
 *
 * Admin-only endpoint to trigger an AI report on demand for a specific site,
 * bypassing the IS_CLOUD gate and cron schedule. Used for testing and manual
 * report regeneration.
 */
export async function triggerAiReport(request: FastifyRequest, reply: FastifyReply) {
  const result = bodySchema.safeParse(request.body);
  if (!result.success) {
    return reply.status(400).send({ success: false, error: result.error.flatten() });
  }

  const { siteId, cadence } = result.data;

  try {
    // runForSite bypasses IS_CLOUD — works in dev and staging
    await aiReportService.runForSite(siteId, cadence as ReportCadence);
    return reply.status(200).send({
      success: true,
      message: `AI report triggered for site ${siteId} (${cadence})`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return reply.status(500).send({ success: false, error: message });
  }
}
