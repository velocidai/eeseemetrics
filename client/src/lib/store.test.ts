import { describe, it, expect, beforeEach } from "vitest";
import { DateTime } from "luxon";
import { useStore, addFilter, removeFilter, goBack, goForward, canGoForward, resetStore } from "./store";

// Reset store state before each test
beforeEach(() => {
  resetStore();
  useStore.setState({
    filters: [],
    timezone: "UTC",
  });
});

// ─── Initial state ────────────────────────────────────────────────────────────

describe("initial state", () => {
  it("has empty filters", () => {
    expect(useStore.getState().filters).toHaveLength(0);
  });

  it("has 'users' as default selectedStat", () => {
    expect(useStore.getState().selectedStat).toBe("users");
  });

  it("has 'hour' as default bucket", () => {
    expect(useStore.getState().bucket).toBe("hour");
  });
});

// ─── setTime — bucket inference ───────────────────────────────────────────────

describe("setTime — bucket inference", () => {
  it("day mode → bucket hour", () => {
    const { setTime } = useStore.getState();
    setTime({ mode: "day", day: "2024-06-15" });
    expect(useStore.getState().bucket).toBe("hour");
  });

  it("week mode → bucket day", () => {
    const { setTime } = useStore.getState();
    setTime({ mode: "week", week: "2024-06-10" });
    expect(useStore.getState().bucket).toBe("day");
  });

  it("month mode → bucket day", () => {
    const { setTime } = useStore.getState();
    setTime({ mode: "month", month: "2024-06-01" });
    expect(useStore.getState().bucket).toBe("day");
  });

  it("year mode → bucket month", () => {
    const { setTime } = useStore.getState();
    setTime({ mode: "year", year: "2024-01-01" });
    expect(useStore.getState().bucket).toBe("month");
  });

  it("range <31 days → bucket day", () => {
    const { setTime } = useStore.getState();
    setTime({ mode: "range", startDate: "2024-06-01", endDate: "2024-06-15" });
    expect(useStore.getState().bucket).toBe("day");
  });

  it("range 32-180 days → bucket week", () => {
    const { setTime } = useStore.getState();
    setTime({ mode: "range", startDate: "2024-01-01", endDate: "2024-06-01" });
    expect(useStore.getState().bucket).toBe("week");
  });

  it("range >180 days → bucket month", () => {
    const { setTime } = useStore.getState();
    setTime({ mode: "range", startDate: "2023-01-01", endDate: "2024-06-01" });
    expect(useStore.getState().bucket).toBe("month");
  });

  it("changeBucket=false does not change bucket", () => {
    useStore.setState({ bucket: "hour" });
    const { setTime } = useStore.getState();
    setTime({ mode: "month", month: "2024-06-01" }, false);
    // Bucket should remain 'hour' since changeBucket=false
    expect(useStore.getState().bucket).toBe("hour");
  });
});

// ─── setTime — previousTime ───────────────────────────────────────────────────

describe("setTime — previousTime calculation", () => {
  it("day mode sets previousTime to day before", () => {
    const { setTime } = useStore.getState();
    setTime({ mode: "day", day: "2024-06-15" });
    expect(useStore.getState().previousTime).toMatchObject({
      mode: "day",
      day: "2024-06-14",
    });
  });

  it("week mode sets previousTime to previous week", () => {
    const { setTime } = useStore.getState();
    setTime({ mode: "week", week: "2024-06-10" });
    expect(useStore.getState().previousTime).toMatchObject({
      mode: "week",
    });
    const prev = useStore.getState().previousTime as any;
    expect(prev.week).toBe("2024-06-03");
  });

  it("month mode sets previousTime to previous month", () => {
    const { setTime } = useStore.getState();
    setTime({ mode: "month", month: "2024-06-01" });
    const prev = useStore.getState().previousTime as any;
    expect(prev.mode).toBe("month");
    expect(prev.month).toBe("2024-05-01");
  });

  it("year mode sets previousTime to previous year", () => {
    const { setTime } = useStore.getState();
    setTime({ mode: "year", year: "2024-01-01" });
    const prev = useStore.getState().previousTime as any;
    expect(prev.mode).toBe("year");
    expect(prev.year).toBe("2023-01-01");
  });
});

// ─── goBack ───────────────────────────────────────────────────────────────────

describe("goBack", () => {
  it("day mode — moves back one day", () => {
    useStore.setState({ time: { mode: "day", day: "2024-06-15" } });
    goBack();
    const { time } = useStore.getState();
    expect(time.mode).toBe("day");
    expect((time as any).day).toBe("2024-06-14");
  });

  it("week mode — moves back one week", () => {
    useStore.setState({ time: { mode: "week", week: "2024-06-10" } });
    goBack();
    const { time } = useStore.getState();
    expect((time as any).week).toBe("2024-06-03");
  });

  it("month mode — moves back one month", () => {
    useStore.setState({ time: { mode: "month", month: "2024-06-01" } });
    goBack();
    const { time } = useStore.getState();
    expect((time as any).month).toBe("2024-05-01");
  });

  it("year mode — moves back one year", () => {
    useStore.setState({ time: { mode: "year", year: "2024-01-01" } });
    goBack();
    const { time } = useStore.getState();
    expect((time as any).year).toBe("2023-01-01");
  });

  it("range mode — shifts range back by its own length", () => {
    useStore.setState({
      time: { mode: "range", startDate: "2024-06-08", endDate: "2024-06-15" },
    });
    goBack();
    const { time } = useStore.getState() as any;
    // 7 days diff → startDate goes back 7 days
    expect(time.startDate).toBe("2024-06-01");
    expect(time.endDate).toBe("2024-06-08");
  });
});

// ─── goForward ────────────────────────────────────────────────────────────────

describe("goForward", () => {
  it("day mode — moves forward one day", () => {
    useStore.setState({ time: { mode: "day", day: "2024-01-01" } });
    goForward();
    const { time } = useStore.getState();
    expect((time as any).day).toBe("2024-01-02");
  });

  it("week mode — moves forward one week", () => {
    useStore.setState({ time: { mode: "week", week: "2024-01-01" } });
    goForward();
    const { time } = useStore.getState();
    expect((time as any).week).toBe("2024-01-08");
  });

  it("month mode — moves forward one month", () => {
    useStore.setState({ time: { mode: "month", month: "2024-01-01" } });
    goForward();
    const { time } = useStore.getState();
    expect((time as any).month).toBe("2024-02-01");
  });

  it("year mode — moves forward one year", () => {
    useStore.setState({ time: { mode: "year", year: "2022-01-01" } });
    goForward();
    const { time } = useStore.getState();
    expect((time as any).year).toBe("2023-01-01");
  });
});

// ─── canGoForward ─────────────────────────────────────────────────────────────

describe("canGoForward", () => {
  it("day mode — today returns false", () => {
    const today = DateTime.now().toISODate()!;
    expect(canGoForward({ mode: "day", day: today })).toBe(false);
  });

  it("day mode — yesterday returns true", () => {
    const yesterday = DateTime.now().minus({ days: 1 }).toISODate()!;
    expect(canGoForward({ mode: "day", day: yesterday })).toBe(true);
  });

  it("week mode — next week (future) returns false", () => {
    const nextWeek = DateTime.now().plus({ weeks: 1 }).startOf("week").toISODate()!;
    expect(canGoForward({ mode: "week", week: nextWeek })).toBe(false);
  });

  it("week mode — last week returns true", () => {
    const lastWeek = DateTime.now().minus({ weeks: 2 }).startOf("week").toISODate()!;
    expect(canGoForward({ mode: "week", week: lastWeek })).toBe(true);
  });

  it("month mode — next month (future) returns false", () => {
    const nextMonth = DateTime.now().plus({ months: 1 }).startOf("month").toISODate()!;
    expect(canGoForward({ mode: "month", month: nextMonth })).toBe(false);
  });

  it("all-time mode — returns false", () => {
    expect(canGoForward({ mode: "all-time" })).toBe(false);
  });
});

// ─── addFilter ────────────────────────────────────────────────────────────────

describe("addFilter", () => {
  it("adds a new filter", () => {
    addFilter({ parameter: "browser", type: "equals", value: ["Chrome"] });
    expect(useStore.getState().filters).toHaveLength(1);
  });

  it("adds multiple filters with different parameters", () => {
    addFilter({ parameter: "browser", type: "equals", value: ["Chrome"] });
    addFilter({ parameter: "country", type: "equals", value: ["US"] });
    expect(useStore.getState().filters).toHaveLength(2);
  });

  it("replaces existing filter with same parameter and type", () => {
    addFilter({ parameter: "browser", type: "equals", value: ["Chrome"] });
    addFilter({ parameter: "browser", type: "equals", value: ["Firefox"] });
    const { filters } = useStore.getState();
    expect(filters).toHaveLength(1);
    expect(filters[0].value).toEqual(["Firefox"]);
  });

  it("adds filter with different type for same parameter", () => {
    addFilter({ parameter: "browser", type: "equals", value: ["Chrome"] });
    addFilter({ parameter: "browser", type: "not_equals", value: ["Firefox"] });
    expect(useStore.getState().filters).toHaveLength(2);
  });
});

// ─── removeFilter ─────────────────────────────────────────────────────────────

describe("removeFilter", () => {
  it("removes a filter by reference", () => {
    const filter = { parameter: "browser" as const, type: "equals" as const, value: ["Chrome"] };
    addFilter(filter);
    const added = useStore.getState().filters[0];
    removeFilter(added);
    expect(useStore.getState().filters).toHaveLength(0);
  });

  it("only removes the matching filter", () => {
    addFilter({ parameter: "browser", type: "equals", value: ["Chrome"] });
    addFilter({ parameter: "country", type: "equals", value: ["US"] });
    const filters = useStore.getState().filters;
    removeFilter(filters[0]);
    expect(useStore.getState().filters).toHaveLength(1);
    expect(useStore.getState().filters[0].parameter).toBe("country");
  });

  it("does nothing when filter is not found", () => {
    addFilter({ parameter: "browser", type: "equals", value: ["Chrome"] });
    const ghost = { parameter: "device_type" as const, type: "equals" as const, value: ["mobile"] };
    removeFilter(ghost);
    expect(useStore.getState().filters).toHaveLength(1);
  });
});
