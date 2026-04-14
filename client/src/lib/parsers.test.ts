import { describe, it, expect } from "vitest";

// nuqs parsers use parseServerSide for synchronous parsing outside Next.js context
import {
  parseAsTimeBucket,
  parseAsStatType,
  parseAsTimeMode,
  parseAsWellKnown,
  parseAsFilters,
} from "./parsers";

// ─── parseAsTimeBucket ────────────────────────────────────────────────────────

describe("parseAsTimeBucket", () => {
  const valid = ["minute", "five_minutes", "ten_minutes", "fifteen_minutes", "hour", "day", "week", "month", "year"];

  it.each(valid)("accepts valid bucket: %s", (bucket) => {
    expect(parseAsTimeBucket.parseServerSide(bucket)).toBe(bucket);
  });

  it("returns null for unknown bucket value", () => {
    expect(parseAsTimeBucket.parseServerSide("fortnight")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseAsTimeBucket.parseServerSide("")).toBeNull();
  });
});

// ─── parseAsStatType ──────────────────────────────────────────────────────────

describe("parseAsStatType", () => {
  const valid = ["pageviews", "sessions", "users", "pages_per_session", "bounce_rate", "session_duration"];

  it.each(valid)("accepts valid stat: %s", (stat) => {
    expect(parseAsStatType.parseServerSide(stat)).toBe(stat);
  });

  it("returns null for unknown stat", () => {
    expect(parseAsStatType.parseServerSide("conversions")).toBeNull();
  });
});

// ─── parseAsTimeMode ─────────────────────────────────────────────────────────

describe("parseAsTimeMode", () => {
  const valid = ["day", "range", "week", "month", "year", "all-time", "past-minutes"];

  it.each(valid)("accepts valid mode: %s", (mode) => {
    expect(parseAsTimeMode.parseServerSide(mode)).toBe(mode);
  });

  it("returns null for unknown mode", () => {
    expect(parseAsTimeMode.parseServerSide("decade")).toBeNull();
  });
});

// ─── parseAsWellKnown ─────────────────────────────────────────────────────────

describe("parseAsWellKnown", () => {
  const valid = [
    "today", "yesterday", "last-7-days", "last-30-days",
    "this-week", "last-week", "this-month", "last-month",
    "this-year", "last-30-minutes", "last-1-hour", "all-time",
  ];

  it.each(valid)("accepts valid well-known: %s", (wk) => {
    expect(parseAsWellKnown.parseServerSide(wk)).toBe(wk);
  });

  it("returns null for unknown preset", () => {
    expect(parseAsWellKnown.parseServerSide("last-5-years")).toBeNull();
  });
});

// ─── parseAsFilters ───────────────────────────────────────────────────────────

describe("parseAsFilters", () => {
  it("parses a valid JSON filters array", () => {
    const filters = [{ parameter: "browser", type: "equals", value: ["Chrome"] }];
    const json = JSON.stringify(filters);
    const result = parseAsFilters.parseServerSide(json);
    expect(result).toEqual(filters);
  });

  it("parses empty array", () => {
    expect(parseAsFilters.parseServerSide("[]")).toEqual([]);
  });

  it("returns null for invalid JSON", () => {
    expect(parseAsFilters.parseServerSide("not-json")).toBeNull();
  });
});
