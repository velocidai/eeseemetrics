import { describe, it, expect } from "vitest";
import { evaluateRule } from "./customAlertEvaluator.js";
import type { AlertRule } from "./customAlertTypes.js";
import type { DailyMetrics } from "../anomalyDetection/anomalyDetectionTypes.js";

const DATE = "2026-03-29";

const BASE_METRICS: DailyMetrics = { sessions: 500, pageviews: 1500, bounce_rate: 40 };
const LOW_METRICS: DailyMetrics = { sessions: 100, pageviews: 300, bounce_rate: 40 };
const HIGH_METRICS: DailyMetrics = { sessions: 1000, pageviews: 3000, bounce_rate: 70 };

function rule(overrides: Partial<AlertRule> = {}): AlertRule {
  return {
    id: 1,
    siteId: 42,
    name: "Test rule",
    metric: "sessions",
    operator: "drops_below",
    threshold: 200,
    enabled: true,
    cooldownHours: 24,
    ...overrides,
  };
}

describe("evaluateRule — drops_below", () => {
  it("fires when current sessions < threshold", () => {
    const result = evaluateRule(rule({ operator: "drops_below", threshold: 200 }), LOW_METRICS, null, DATE);
    expect(result.fired).toBe(true);
    expect(result.currentValue).toBe(100);
    expect(result.baselineValue).toBeNull();
    expect(result.percentChange).toBeNull();
  });

  it("does not fire when current sessions >= threshold", () => {
    const result = evaluateRule(rule({ operator: "drops_below", threshold: 200 }), BASE_METRICS, null, DATE);
    expect(result.fired).toBe(false);
  });

  it("fires for bounce_rate metric", () => {
    const result = evaluateRule(
      rule({ operator: "drops_below", metric: "bounce_rate", threshold: 50 }),
      LOW_METRICS,
      null,
      DATE
    );
    expect(result.fired).toBe(true); // bounce_rate = 40 < 50
  });
});

describe("evaluateRule — exceeds", () => {
  it("fires when current sessions > threshold", () => {
    const result = evaluateRule(rule({ operator: "exceeds", threshold: 800 }), HIGH_METRICS, null, DATE);
    expect(result.fired).toBe(true);
    expect(result.currentValue).toBe(1000);
  });

  it("does not fire when current sessions <= threshold", () => {
    const result = evaluateRule(rule({ operator: "exceeds", threshold: 800 }), BASE_METRICS, null, DATE);
    expect(result.fired).toBe(false);
  });
});

describe("evaluateRule — drops_by_more_than", () => {
  it("fires when drop exceeds threshold percentage", () => {
    // current=100, baseline=500, drop=80%
    const result = evaluateRule(
      rule({ operator: "drops_by_more_than", threshold: 30 }),
      LOW_METRICS, // sessions=100
      BASE_METRICS, // sessions=500
      DATE
    );
    expect(result.fired).toBe(true);
    expect(result.percentChange).toBeCloseTo(-80, 1);
    expect(result.baselineValue).toBe(500);
  });

  it("does not fire when drop is within threshold", () => {
    // current=450, baseline=500, drop=10% < 30%
    const current: DailyMetrics = { sessions: 450, pageviews: 1000, bounce_rate: 40 };
    const result = evaluateRule(
      rule({ operator: "drops_by_more_than", threshold: 30 }),
      current,
      BASE_METRICS,
      DATE
    );
    expect(result.fired).toBe(false);
  });

  it("does not fire when baseline is null", () => {
    const result = evaluateRule(
      rule({ operator: "drops_by_more_than", threshold: 30 }),
      LOW_METRICS,
      null,
      DATE
    );
    expect(result.fired).toBe(false);
  });

  it("does not fire when baseline is zero", () => {
    const zeroBaseline: DailyMetrics = { sessions: 0, pageviews: 0, bounce_rate: 0 };
    const result = evaluateRule(
      rule({ operator: "drops_by_more_than", threshold: 30 }),
      LOW_METRICS,
      zeroBaseline,
      DATE
    );
    expect(result.fired).toBe(false);
  });
});

describe("evaluateRule — spikes_by_more_than", () => {
  it("fires when spike exceeds threshold percentage", () => {
    // current=1000, baseline=500, spike=100% >= 50%
    const result = evaluateRule(
      rule({ operator: "spikes_by_more_than", threshold: 50 }),
      HIGH_METRICS, // sessions=1000
      BASE_METRICS, // sessions=500
      DATE
    );
    expect(result.fired).toBe(true);
    expect(result.percentChange).toBeCloseTo(100, 1);
  });

  it("does not fire when spike is within threshold", () => {
    // current=600, baseline=500, spike=20% < 50%
    const current: DailyMetrics = { sessions: 600, pageviews: 1500, bounce_rate: 40 };
    const result = evaluateRule(
      rule({ operator: "spikes_by_more_than", threshold: 50 }),
      current,
      BASE_METRICS,
      DATE
    );
    expect(result.fired).toBe(false);
  });
});

describe("evaluateRule — severity (absolute)", () => {
  it("low when deviation < 25%", () => {
    // threshold=200, current=180, deviation=10%
    const current: DailyMetrics = { sessions: 180, pageviews: 1000, bounce_rate: 40 };
    const result = evaluateRule(rule({ operator: "drops_below", threshold: 200 }), current, null, DATE);
    expect(result.fired).toBe(true);
    expect(result.severity).toBe("low");
  });

  it("medium when deviation 25–49%", () => {
    // threshold=200, current=120, deviation=40%
    const current: DailyMetrics = { sessions: 120, pageviews: 1000, bounce_rate: 40 };
    const result = evaluateRule(rule({ operator: "drops_below", threshold: 200 }), current, null, DATE);
    expect(result.severity).toBe("medium");
  });

  it("high when deviation >= 50%", () => {
    // threshold=200, current=50, deviation=75%
    const current: DailyMetrics = { sessions: 50, pageviews: 1000, bounce_rate: 40 };
    const result = evaluateRule(rule({ operator: "drops_below", threshold: 200 }), current, null, DATE);
    expect(result.severity).toBe("high");
  });
});

describe("evaluateRule — severity (relative)", () => {
  it("high when excessRatio >= 60%", () => {
    // threshold=30%, drop=-80% (excess=50%, ratio=50/30=167% > 60%)
    const result = evaluateRule(
      rule({ operator: "drops_by_more_than", threshold: 30 }),
      LOW_METRICS,
      BASE_METRICS,
      DATE
    );
    expect(result.severity).toBe("high");
  });

  it("medium when excessRatio 30–59%", () => {
    // threshold=30%, drop=-42% (excess=12%, ratio=12/30=40% → medium)
    const current: DailyMetrics = { sessions: 290, pageviews: 1000, bounce_rate: 40 };
    const result = evaluateRule(
      rule({ operator: "drops_by_more_than", threshold: 30 }),
      current,
      BASE_METRICS,
      DATE
    );
    expect(result.fired).toBe(true);
    expect(result.severity).toBe("medium");
  });

  it("low when excessRatio < 30%", () => {
    // threshold=30%, drop=-32% (excess=2%, ratio=2/30=6.7% → low)
    const current: DailyMetrics = { sessions: 340, pageviews: 1000, bounce_rate: 40 };
    const result = evaluateRule(
      rule({ operator: "drops_by_more_than", threshold: 30 }),
      current,
      BASE_METRICS,
      DATE
    );
    expect(result.fired).toBe(true);
    expect(result.severity).toBe("low");
  });
});

describe("evaluateRule — cooldownKey format", () => {
  it("uses custom:{ruleId}:{targetDate} format", () => {
    const result = evaluateRule(rule({ id: 7 }), LOW_METRICS, null, "2026-03-29");
    expect(result.cooldownKey).toBe("custom:7:2026-03-29");
  });
});
