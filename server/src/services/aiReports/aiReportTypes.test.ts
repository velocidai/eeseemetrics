import { describe, it, expect } from "vitest";
import type { ScaleEnrichment } from "./aiReportTypes.js";

describe("ScaleEnrichment types", () => {
  it("accepts a valid ScaleEnrichment object", () => {
    const enrichment: ScaleEnrichment = {
      pageMovers: {
        gainers: [{ page: "/pricing", currentSessions: 120, prevSessions: 80, delta: 40, isNew: false }],
        losers: [{ page: "/old", currentSessions: 10, prevSessions: 50, delta: -40, isNew: false }],
        newEntrants: [{ page: "/new-post", currentSessions: 30, prevSessions: 0, delta: 30, isNew: true }],
      },
      channelMix: [{ channel: "Organic", currentSessions: 200, prevSessions: 180, currentPercentage: 45, prevPercentage: 42 }],
      entryNextPages: [{ entryPage: "/blog", nextPage: "/pricing", sessions: 34 }],
      peakTrafficWindow: { peakDays: ["Tuesday", "Wednesday"], peakHour: 9 },
    };
    expect(enrichment.pageMovers.gainers[0].delta).toBe(40);
    expect(enrichment.channelMix[0].channel).toBe("Organic");
  });
});
