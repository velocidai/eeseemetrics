import { FastifyReply, FastifyRequest } from "fastify";
import { IS_CLOUD } from "../../lib/const.js";
import { siteConfig } from "../../lib/siteConfig.js";
import { getSitePlanTier, tierAtLeast } from "../../lib/tierUtils.js";

export async function getTrackingConfig(request: FastifyRequest<{ Params: { siteId: string } }>, reply: FastifyReply) {
  try {
    const config = await siteConfig.getConfig(request.params.siteId);

    // Return 404 if site doesn't exist
    if (!config) {
      return reply.status(404).send({ error: "Site not found" });
    }

    // On cloud, enforce tier-based feature flags so Starter sites cannot
    // record session replays or web vitals regardless of their site settings.
    let allowReplay = config.sessionReplay || false;
    let allowWebVitals = config.webVitals || false;

    if (IS_CLOUD) {
      const tier = await getSitePlanTier(Number(request.params.siteId));
      const isPro = tierAtLeast(tier, "pro");
      if (!isPro) {
        allowReplay = false;
        allowWebVitals = false;
      }
    }

    // This endpoint is public — the analytics script fetches it on every page load
    return reply.send({
      sessionReplay: allowReplay,
      webVitals: allowWebVitals,
      trackErrors: config.trackErrors || false,
      trackOutbound: config.trackOutbound ?? true,
      trackUrlParams: config.trackUrlParams ?? true,
      trackInitialPageView: config.trackInitialPageView ?? true,
      trackSpaNavigation: config.trackSpaNavigation ?? true,
      trackButtonClicks: config.trackButtonClicks || false,
      trackCopy: config.trackCopy || false,
      trackFormInteractions: config.trackFormInteractions || false,
    });
  } catch (error) {
    console.error("Error getting tracking config:", error);
    return reply.status(500).send({ error: "Failed to get tracking configuration" });
  }
}
