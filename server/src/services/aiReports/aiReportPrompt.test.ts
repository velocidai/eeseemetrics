import { describe, it, expect } from "vitest";
import { buildAiReportMessages } from "./aiReportPrompt.js";
import type { PromptInput } from "./aiReportPrompt.js";

const baseInput: PromptInput = {
  siteDomain: "example.com",
  cadence: "weekly",
  periodStart: "2026-03-24",
  periodEnd: "2026-03-31",
  current: { sessions: 500, pageviews: 1200, users: 400, pages_per_session: 2.4, bounce_rate: 65, session_duration: 90 },
  previous: { sessions: 420, pageviews: 980, users: 340, pages_per_session: 2.3, bounce_rate: 67, session_duration: 85 },
  topPages: [{ value: "/home", count: 200, percentage: 40 }],
  topReferrers: [{ value: "google.com", count: 100, percentage: 20 }],
  topCountries: [{ value: "US", count: 300, percentage: 60 }],
  deviceBreakdown: [{ value: "desktop", count: 350, percentage: 70 }],
};

describe("buildAiReportMessages", () => {
  it("includes Scale data block when scaleEnrichment is provided", () => {
    const input: PromptInput = {
      ...baseInput,
      isScale: true,
      scaleEnrichment: {
        pageMovers: {
          gainers: [{ page: "/pricing", currentSessions: 80, prevSessions: 50, delta: 30, isNew: false }],
          losers: [],
          newEntrants: [],
        },
        channelMix: [{ channel: "Organic", currentSessions: 200, prevSessions: 180, currentPercentage: 40, prevPercentage: 43 }],
        entryNextPages: [{ entryPage: "/blog", nextPage: "/pricing", sessions: 25 }],
        peakTrafficWindow: { peakDays: ["Tuesday"], peakHour: 9 },
      },
    };
    const messages = buildAiReportMessages(input);
    const userContent = messages[1].content;
    expect(userContent).toContain("Scale insights");
    expect(userContent).toContain("/pricing +30 sessions");
    expect(userContent).toContain("Organic");
    expect(userContent).toContain("/blog → /pricing");
    expect(userContent).toContain("Tuesday");
  });

  it("does not include Scale block for non-Scale reports", () => {
    const messages = buildAiReportMessages(baseInput);
    const userContent = messages[1].content;
    expect(userContent).not.toContain("Scale insights");
  });
});
