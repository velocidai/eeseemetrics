// server/src/services/anomaly/anomalyNotificationService.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock drizzle DB before importing the service
vi.mock("../../db/postgres/postgres.js", () => {
  return {
    db: {
      select: vi.fn(),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn().mockResolvedValue(undefined),
        })),
      })),
    },
  };
});

// Mock drizzle-orm so eq/and/etc. don't fail without a real DB connection
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...actual,
    eq: vi.fn((_col: unknown, _val: unknown) => ({})),
    and: vi.fn((..._args: unknown[]) => ({})),
  };
});

// Mock the schema so column references don't blow up
vi.mock("../../db/postgres/schema.js", () => ({
  sites: { siteId: "siteId", domain: "domain", organizationId: "organizationId" },
  notificationChannels: {
    id: "id",
    siteId: "siteId",
    organizationId: "organizationId",
    enabled: "enabled",
  },
}));

// Mock the logger so we don't need a real logger instance
vi.mock("../../lib/logger/logger.js", () => ({
  createServiceLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  })),
}));

// Mock the email sender so email tests don't need real SMTP
vi.mock("../../lib/email/email.js", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

import { sendAnomalyNotifications, type AnomalyAlertData } from "./anomalyNotificationService.js";
import { db } from "../../db/postgres/postgres.js";

const SITE_ROW = { domain: "example.com", organizationId: "org-test" };

const makeWebhookChannel = (
  overrides: Partial<{
    lastNotifiedAt: string | null;
    triggerEvents: string[];
    cooldownMinutes: number;
  }> = {}
) => ({
  id: 1,
  type: "webhook" as const,
  config: { webhookUrl: "https://hooks.example.com/test" },
  enabled: true,
  triggerEvents: overrides.triggerEvents ?? ["all"],
  cooldownMinutes: overrides.cooldownMinutes ?? 60,
  lastNotifiedAt: overrides.lastNotifiedAt ?? null,
});

const makeSlackChannel = () => ({
  id: 2,
  type: "slack" as const,
  config: { slackWebhookUrl: "https://hooks.slack.com/test" },
  enabled: true,
  triggerEvents: ["all"],
  cooldownMinutes: 0,
  lastNotifiedAt: null,
});

const alert: AnomalyAlertData = {
  siteId: 9999,
  metric: "sessions",
  currentValue: 40,
  baselineValue: 100,
  percentChange: -60,
  severity: "high",
  detectedAt: "2026-03-30 06:00:00",
};

// Helper: configure db.select mock for the two sequential calls
function setupDbMocks(channels: unknown[]) {
  // Call 1: site lookup — chain ends with .limit() which resolves
  vi.mocked(db.select).mockReturnValueOnce({
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([SITE_ROW]),
  } as any);

  // Call 2: channel lookup — chain ends with .where() which resolves
  vi.mocked(db.select).mockReturnValueOnce({
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue(channels),
  } as any);
}

describe("sendAnomalyNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends webhook POST with correct payload shape", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 200 })
    );
    setupDbMocks([makeWebhookChannel()]);

    await sendAnomalyNotifications(alert);

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://hooks.example.com/test");
    const body = JSON.parse((opts as RequestInit).body as string);
    expect(body).toMatchObject({
      event: "anomaly_detected",
      metric: "sessions",
      currentValue: 40,
      baselineValue: 100,
      percentChange: -60,
      severity: "high",
      siteDomain: "example.com",
      siteId: "9999", // service does String(alert.siteId)
    });
    expect(body).toHaveProperty("alertUrl");
  });

  it("sends Slack payload with blocks array containing metric and change", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response(null, { status: 200 })
    );
    setupDbMocks([makeSlackChannel()]);

    await sendAnomalyNotifications(alert);

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://hooks.slack.com/test");
    const body = JSON.parse((opts as RequestInit).body as string);
    expect(body).toHaveProperty("blocks");
    expect(Array.isArray(body.blocks)).toBe(true);
    expect(body.blocks.length).toBeGreaterThan(0);
    // Block Kit content should mention the metric and the change percentage
    const blockText = JSON.stringify(body.blocks);
    expect(blockText).toContain("Sessions");
    expect(blockText).toContain("-60%");
  });

  it("does NOT call fetch when metric is not in channel triggerEvents", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    setupDbMocks([
      makeWebhookChannel({ triggerEvents: ["pageviews"] }), // only pageviews, alert is "sessions"
    ]);

    await sendAnomalyNotifications(alert);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("does NOT call fetch when channel is within cooldown window", async () => {
    const fetchSpy = vi.spyOn(global, "fetch");
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    setupDbMocks([
      makeWebhookChannel({ cooldownMinutes: 60, lastNotifiedAt: tenMinutesAgo }),
    ]);

    await sendAnomalyNotifications(alert);

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
