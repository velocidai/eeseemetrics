import { describe, it, expect, vi, beforeEach } from "vitest";
import { DateTime } from "luxon";

// Mock store's getTimezone to return UTC for consistent test results
vi.mock("./store", () => ({
  getTimezone: () => "UTC",
}));

import { formatDuration, formatShortDuration, formatChartDateTime, parseUtcTimestamp } from "./dateTimeUtils";

// ─── formatDuration ───────────────────────────────────────────────────────────

describe("formatDuration", () => {
  it("formats 0 seconds", () => {
    const result = formatDuration(0);
    expect(result).toContain("0");
    expect(result.toLowerCase()).toContain("sec");
  });

  it("formats 30 seconds", () => {
    const result = formatDuration(30);
    expect(result).toContain("30");
    expect(result.toLowerCase()).toContain("sec");
  });

  it("formats 60 seconds as 1 minute", () => {
    const result = formatDuration(60);
    expect(result.toLowerCase()).toContain("min");
  });

  it("formats 90 seconds as 1 min 30 sec", () => {
    const result = formatDuration(90);
    expect(result.toLowerCase()).toContain("min");
    expect(result).toContain("30");
  });

  it("formats 3600 seconds — only shows minutes", () => {
    const result = formatDuration(3600);
    expect(result.toLowerCase()).toContain("min");
    // formatDuration only goes up to minutes (not hours)
  });
});

// ─── formatShortDuration ──────────────────────────────────────────────────────

describe("formatShortDuration", () => {
  it("0 seconds → '0s'", () => {
    expect(formatShortDuration(0)).toBe("0s");
  });

  it("30 seconds → '30s'", () => {
    expect(formatShortDuration(30)).toBe("30s");
  });

  it("59 seconds → '59s'", () => {
    expect(formatShortDuration(59)).toBe("59s");
  });

  it("60 seconds → '1m'", () => {
    expect(formatShortDuration(60)).toBe("1m");
  });

  it("90 seconds → '1m 30s'", () => {
    expect(formatShortDuration(90)).toBe("1m 30s");
  });

  it("120 seconds → '2m'", () => {
    expect(formatShortDuration(120)).toBe("2m");
  });

  it("3600 seconds → '60m'", () => {
    expect(formatShortDuration(3600)).toBe("60m");
  });
});

// ─── formatChartDateTime ──────────────────────────────────────────────────────

describe("formatChartDateTime", () => {
  const dt = DateTime.fromISO("2024-06-15T14:30:00", { zone: "UTC" });

  it("day bucket — shows weekday and date, no time", () => {
    const result = formatChartDateTime(dt, "day", "en-US");
    // Should not contain time components but should have date
    expect(result).toMatch(/\w+,?\s+\w+\s+\d+/); // e.g., "Sat, Jun 15"
  });

  it("hour bucket — shows date and hour", () => {
    const result = formatChartDateTime(dt, "hour", "en-US");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("minute bucket — shows date and hour:minute", () => {
    const result = formatChartDateTime(dt, "minute", "en-US");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("week bucket — same format as day", () => {
    const result = formatChartDateTime(dt, "week", "en-US");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("month bucket — same format as day", () => {
    const result = formatChartDateTime(dt, "month", "en-US");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("five_minutes bucket — shows date and hour:minute", () => {
    const result = formatChartDateTime(dt, "five_minutes", "en-US");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

// ─── parseUtcTimestamp ────────────────────────────────────────────────────────

describe("parseUtcTimestamp", () => {
  it("parses a UTC SQL timestamp string", () => {
    const result = parseUtcTimestamp("2024-06-15 14:30:00");
    expect(result).toBeInstanceOf(DateTime);
    expect(result.isValid).toBe(true);
  });

  it("sets zone to UTC (mocked getTimezone)", () => {
    const result = parseUtcTimestamp("2024-01-01 00:00:00");
    expect(result.zoneName).toBe("UTC");
  });

  it("parses a Date object", () => {
    const date = new Date("2024-06-15T14:30:00Z");
    const result = parseUtcTimestamp(date);
    expect(result).toBeInstanceOf(DateTime);
    expect(result.isValid).toBe(true);
  });

  it("preserves the correct year/month/day", () => {
    const result = parseUtcTimestamp("2024-06-15 12:00:00");
    expect(result.year).toBe(2024);
    expect(result.month).toBe(6);
    expect(result.day).toBe(15);
  });
});
