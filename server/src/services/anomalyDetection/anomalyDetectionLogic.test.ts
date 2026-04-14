import { describe, it, expect } from "vitest";
import { detectAnomalies } from "./anomalyDetectionLogic.js";
import type { DailyMetrics } from "./anomalyDetectionTypes.js";

const baseline: DailyMetrics = {
  sessions: 1000,
  pageviews: 3000,
  bounce_rate: 40,
};

// ─── Sessions ─────────────────────────────────────────────────────────────────

describe("detectAnomalies — sessions", () => {
  it("sessions +35% → severity low (above 30% alert, below 39% medium threshold)", () => {
    // alertThreshold=0.30, alertThreshold*1.3=0.39, highThreshold=0.50
    // 35% > 30% (alert fires), 35% < 39% (medium threshold) → low
    const current: DailyMetrics = { sessions: 1350, pageviews: 3000, bounce_rate: 40 };
    const result = detectAnomalies(1, current, baseline, "2026-03-28");
    const alert = result.find(a => a.metric === "sessions");
    expect(alert).toBeDefined();
    expect(alert!.severity).toBe("low");
    expect(alert!.percentChange).toBe(35);
  });

  it("sessions +42% → severity medium (above 39% but below 50% high)", () => {
    const current: DailyMetrics = { sessions: 1420, pageviews: 3000, bounce_rate: 40 };
    const result = detectAnomalies(1, current, baseline, "2026-03-28");
    const alert = result.find(a => a.metric === "sessions");
    expect(alert!.severity).toBe("medium");
  });

  it("sessions +55% → severity high (above 50% highThreshold)", () => {
    const current: DailyMetrics = { sessions: 1550, pageviews: 3000, bounce_rate: 40 };
    const result = detectAnomalies(1, current, baseline, "2026-03-28");
    const alert = result.find(a => a.metric === "sessions");
    expect(alert!.severity).toBe("high");
    expect(alert!.cooldownKey).toBe("1:sessions:up:2026-03-28");
  });

  it("sessions -35% → flagged with negative percentChange and 'down' in cooldownKey", () => {
    const current: DailyMetrics = { sessions: 650, pageviews: 3000, bounce_rate: 40 };
    const result = detectAnomalies(1, current, baseline, "2026-03-28");
    const alert = result.find(a => a.metric === "sessions");
    expect(alert).toBeDefined();
    expect(alert!.percentChange).toBeLessThan(0);
    expect(alert!.cooldownKey).toContain(":down:");
  });

  it("sessions +5% → NOT flagged (below 30% alertThreshold)", () => {
    const current: DailyMetrics = { sessions: 1050, pageviews: 3000, bounce_rate: 40 };
    const result = detectAnomalies(1, current, baseline, "2026-03-28");
    expect(result.find(a => a.metric === "sessions")).toBeUndefined();
  });
});

// ─── Bounce rate ──────────────────────────────────────────────────────────────

describe("detectAnomalies — bounce_rate", () => {
  it("bounce_rate +20% spike → medium (alertThreshold=15%, highThreshold=30%)", () => {
    // 40 * 1.20 = 48 → pct = 20% > 15% (alert), 20% > 15%*1.3=19.5% → medium? 20% > 19.5% → medium
    const current: DailyMetrics = { sessions: 1000, pageviews: 3000, bounce_rate: 48 };
    const result = detectAnomalies(1, current, baseline, "2026-03-28");
    const alert = result.find(a => a.metric === "bounce_rate");
    expect(alert).toBeDefined();
    expect(alert!.severity).toBe("medium");
  });

  it("bounce_rate +35% spike → high (above 30% highThreshold)", () => {
    const current: DailyMetrics = { sessions: 1000, pageviews: 3000, bounce_rate: 54 };
    const result = detectAnomalies(1, current, baseline, "2026-03-28");
    const alert = result.find(a => a.metric === "bounce_rate");
    expect(alert!.severity).toBe("high");
  });

  it("bounce_rate +10% → NOT flagged (below 15% alertThreshold)", () => {
    const current: DailyMetrics = { sessions: 1000, pageviews: 3000, bounce_rate: 44 };
    const result = detectAnomalies(1, current, baseline, "2026-03-28");
    expect(result.find(a => a.metric === "bounce_rate")).toBeUndefined();
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe("detectAnomalies — edge cases", () => {
  it("baseline sessions is 0 → no alert (division-by-zero guard)", () => {
    const zeroBaseline: DailyMetrics = { sessions: 0, pageviews: 3000, bounce_rate: 40 };
    const current: DailyMetrics = { sessions: 500, pageviews: 3000, bounce_rate: 40 };
    expect(detectAnomalies(1, current, zeroBaseline, "2026-03-28").find(a => a.metric === "sessions")).toBeUndefined();
  });

  it("bounce_rate null in current → no bounce_rate alert, sessions can still fire", () => {
    const current: DailyMetrics = { sessions: 1550, pageviews: 3000, bounce_rate: null };
    const result = detectAnomalies(1, current, baseline, "2026-03-28");
    expect(result.find(a => a.metric === "bounce_rate")).toBeUndefined();
    expect(result.find(a => a.metric === "sessions")).toBeDefined();
  });

  it("no anomalies → returns empty array", () => {
    const normal: DailyMetrics = { sessions: 1010, pageviews: 3030, bounce_rate: 41 };
    expect(detectAnomalies(1, normal, baseline, "2026-03-28")).toHaveLength(0);
  });

  it("percentChange is rounded to 1 decimal place", () => {
    // 1333/1000 - 1 = 0.333... → 33.3%
    const current: DailyMetrics = { sessions: 1333, pageviews: 3000, bounce_rate: 40 };
    const result = detectAnomalies(1, current, baseline, "2026-03-28");
    expect(result[0]?.percentChange).toBe(33.3);
  });
});
