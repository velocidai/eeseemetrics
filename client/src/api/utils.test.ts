import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("../lib/const", () => ({
  BACKEND_URL: "http://localhost:3001",
}));

vi.mock("../lib/store", () => ({
  getTimezone: () => "UTC",
  useStore: {
    getState: () => ({ privateKey: null }),
  },
}));

vi.mock("axios", () => ({
  default: vi.fn(),
}));

import { getStartAndEndDate, buildApiParams } from "./utils";
import axios from "axios";

// ─── getStartAndEndDate ───────────────────────────────────────────────────────

describe("getStartAndEndDate", () => {
  it("day mode — returns same start and end", () => {
    const result = getStartAndEndDate({ mode: "day", day: "2024-06-15" });
    expect(result).toEqual({ startDate: "2024-06-15", endDate: "2024-06-15" });
  });

  it("range mode — returns start and end as provided", () => {
    const result = getStartAndEndDate({ mode: "range", startDate: "2024-06-01", endDate: "2024-06-15" });
    expect(result).toEqual({ startDate: "2024-06-01", endDate: "2024-06-15" });
  });

  it("week mode — startDate is week start, endDate is week end", () => {
    // 2024-06-10 (Monday of that week)
    const result = getStartAndEndDate({ mode: "week", week: "2024-06-10" });
    expect(result.startDate).toBe("2024-06-10");
    expect(result.endDate).toBe("2024-06-16"); // Sunday of that week (ISO week)
  });

  it("month mode — startDate is month start, endDate is last day of month", () => {
    const result = getStartAndEndDate({ mode: "month", month: "2024-06-01" });
    expect(result.startDate).toBe("2024-06-01");
    expect(result.endDate).toBe("2024-06-30");
  });

  it("month mode — handles February in leap year", () => {
    const result = getStartAndEndDate({ mode: "month", month: "2024-02-01" });
    expect(result.endDate).toBe("2024-02-29");
  });

  it("year mode — startDate is year start, endDate is Dec 31", () => {
    const result = getStartAndEndDate({ mode: "year", year: "2024-01-01" });
    expect(result.startDate).toBe("2024-01-01");
    expect(result.endDate).toBe("2024-12-31");
  });

  it("all-time mode — returns null, null", () => {
    const result = getStartAndEndDate({ mode: "all-time" });
    expect(result).toEqual({ startDate: null, endDate: null });
  });

  it("past-minutes mode — returns null, null", () => {
    const result = getStartAndEndDate({
      mode: "past-minutes",
      pastMinutesStart: 30,
      pastMinutesEnd: 0,
    });
    expect(result).toEqual({ startDate: null, endDate: null });
  });
});

// ─── buildApiParams ───────────────────────────────────────────────────────────

describe("buildApiParams", () => {
  it("builds params for day mode", () => {
    const params = buildApiParams({ mode: "day", day: "2024-06-15" });
    expect(params.startDate).toBe("2024-06-15");
    expect(params.endDate).toBe("2024-06-15");
    expect(params.timeZone).toBe("UTC");
  });

  it("builds params for range mode", () => {
    const params = buildApiParams({ mode: "range", startDate: "2024-06-01", endDate: "2024-06-30" });
    expect(params.startDate).toBe("2024-06-01");
    expect(params.endDate).toBe("2024-06-30");
  });

  it("builds params for past-minutes mode", () => {
    const params = buildApiParams({
      mode: "past-minutes",
      pastMinutesStart: 30,
      pastMinutesEnd: 0,
    });
    expect(params.pastMinutesStart).toBe(30);
    expect(params.pastMinutesEnd).toBe(0);
    expect(params.startDate).toBe("");
    expect(params.endDate).toBe("");
  });

  it("includes filters when provided", () => {
    const filters = [{ parameter: "browser" as const, type: "equals" as const, value: ["Chrome"] }];
    const params = buildApiParams({ mode: "day", day: "2024-06-15" }, { filters });
    expect(params.filters).toEqual(filters);
  });

  it("filters are undefined when not provided", () => {
    const params = buildApiParams({ mode: "day", day: "2024-06-15" });
    expect(params.filters).toBeUndefined();
  });

  it("timezone is included in all modes", () => {
    const modes = [
      { mode: "day" as const, day: "2024-06-15" },
      { mode: "all-time" as const },
    ];
    for (const time of modes) {
      const params = buildApiParams(time);
      expect(params.timeZone).toBe("UTC");
    }
  });
});

// ─── authedFetch — error extraction ──────────────────────────────────────────

describe("authedFetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns response data on success", async () => {
    (axios as any).mockResolvedValue({ data: { result: "ok" } });

    const { authedFetch } = await import("./utils");
    const result = await authedFetch("/api/test");
    expect(result).toEqual({ result: "ok" });
  });

  it("throws extracted error message from response", async () => {
    (axios as any).mockRejectedValue({
      response: { data: { error: "Not authorized" } },
    });

    const { authedFetch } = await import("./utils");
    await expect(authedFetch("/api/test")).rejects.toThrow("Not authorized");
  });

  it("re-throws raw error when no response.data.error", async () => {
    const networkError = new Error("Network error");
    (axios as any).mockRejectedValue(networkError);

    const { authedFetch } = await import("./utils");
    await expect(authedFetch("/api/test")).rejects.toThrow("Network error");
  });
});
