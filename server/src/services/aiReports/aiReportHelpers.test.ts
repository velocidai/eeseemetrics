import { describe, it, expect } from "vitest";
import { DateTime } from "luxon";
import {
  pctChange,
  MIN_DATA_DAYS,
  PRO_CADENCES,
  SCALE_CADENCES,
} from "./aiReportTypes.js";
import { getPeriodDates, getTrendPeriods } from "./aiReportHelpers.js";

// ─── pctChange ────────────────────────────────────────────────────────────────

describe("pctChange", () => {
  it("returns null when previous is null", () => {
    expect(pctChange(100, null)).toBeNull();
  });

  it("returns null when previous is 0", () => {
    expect(pctChange(100, 0)).toBeNull();
  });

  it("returns null when previous is undefined", () => {
    expect(pctChange(100, undefined)).toBeNull();
  });

  it("calculates +50% correctly", () => {
    expect(pctChange(150, 100)).toBe(50);
  });

  it("calculates -25% correctly", () => {
    expect(pctChange(75, 100)).toBe(-25);
  });

  it("rounds to 1 decimal place", () => {
    expect(pctChange(110, 300)).toBe(-63.3);
  });
});

// ─── MIN_DATA_DAYS ────────────────────────────────────────────────────────────

describe("MIN_DATA_DAYS", () => {
  it("weekly requires 7 days", () => expect(MIN_DATA_DAYS.weekly).toBe(7));
  it("monthly requires 30 days", () => expect(MIN_DATA_DAYS.monthly).toBe(30));
  it("quarterly requires 90 days", () => expect(MIN_DATA_DAYS.quarterly).toBe(90));
  it("yearly requires 365 days", () => expect(MIN_DATA_DAYS.yearly).toBe(365));
});

// ─── Cadence eligibility ──────────────────────────────────────────────────────

describe("cadence eligibility", () => {
  it("PRO_CADENCES contains only weekly", () => {
    expect(PRO_CADENCES).toEqual(["weekly"]);
  });

  it("SCALE_CADENCES contains all four cadences", () => {
    expect(SCALE_CADENCES).toEqual(["weekly", "monthly", "quarterly", "yearly"]);
  });
});

// ─── getPeriodDates ───────────────────────────────────────────────────────────

const NOW = DateTime.fromISO("2026-03-29T08:00:00Z", { zone: "utc" });

describe("getPeriodDates - weekly", () => {
  const result = getPeriodDates("weekly", NOW);

  it("periodEnd equals now (UTC)", () => {
    expect(result.periodEnd.toISO()).toBe(NOW.toUTC().toISO());
  });

  it("periodStart is 7 days before now", () => {
    expect(result.periodStart.toISODate()).toBe("2026-03-22");
  });

  it("prevPeriodStart is 7 days before periodStart", () => {
    expect(result.prevPeriodStart.toISODate()).toBe("2026-03-15");
  });

  it("prevPeriodEnd equals periodStart", () => {
    expect(result.prevPeriodEnd.toISO()).toBe(result.periodStart.toISO());
  });
});

describe("getPeriodDates - monthly", () => {
  const result = getPeriodDates("monthly", NOW);

  it("periodEnd is start of current month (2026-03-01)", () => {
    expect(result.periodEnd.toISODate()).toBe("2026-03-01");
  });

  it("periodStart is start of previous month (2026-02-01)", () => {
    expect(result.periodStart.toISODate()).toBe("2026-02-01");
  });
});

describe("getPeriodDates - quarterly", () => {
  const result = getPeriodDates("quarterly", NOW);

  it("periodEnd is start of current quarter (2026-01-01)", () => {
    expect(result.periodEnd.toISODate()).toBe("2026-01-01");
  });

  it("periodStart is 3 months before quarter start (2025-10-01)", () => {
    expect(result.periodStart.toISODate()).toBe("2025-10-01");
  });
});

describe("getPeriodDates - yearly", () => {
  const result = getPeriodDates("yearly", NOW);

  it("periodEnd is start of current year (2026-01-01)", () => {
    expect(result.periodEnd.toISODate()).toBe("2026-01-01");
  });

  it("periodStart is start of previous year (2025-01-01)", () => {
    expect(result.periodStart.toISODate()).toBe("2025-01-01");
  });
});

// ─── getTrendPeriods ──────────────────────────────────────────────────────

describe("getTrendPeriods", () => {
  const now = DateTime.fromISO("2026-04-01T00:00:00Z");

  it("returns 3 periods for monthly cadence", () => {
    const periods = getTrendPeriods("monthly", now);
    expect(periods).toHaveLength(3);
    // Each period is 1 month wide
    expect(periods[0].end.diff(periods[0].start, "months").months).toBeCloseTo(1, 0);
    // Last period ends at start of current month
    expect(periods[2].end.toISODate()).toBe("2026-04-01");
  });

  it("returns 4 periods for quarterly cadence", () => {
    const periods = getTrendPeriods("quarterly", now);
    expect(periods).toHaveLength(4);
    expect(periods[3].end.toISODate()).toBe("2026-04-01");
  });

  it("returns 2 periods for yearly cadence", () => {
    const periods = getTrendPeriods("yearly", now);
    expect(periods).toHaveLength(2);
  });

  it("returns empty array for weekly cadence", () => {
    const periods = getTrendPeriods("weekly", now);
    expect(periods).toHaveLength(0);
  });
});
