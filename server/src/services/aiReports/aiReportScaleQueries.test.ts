import { describe, it, expect } from "vitest";
import { categorizePageMovers } from "./aiReportScaleQueries.js";

describe("categorizePageMovers", () => {
  it("identifies new entrants, gainers, and losers correctly", () => {
    const rows = [
      { page: "/new", current_sessions: 50, prev_sessions: 0, delta: 50, in_current: 1, in_prev: 0 },
      { page: "/pricing", current_sessions: 120, prev_sessions: 80, delta: 40, in_current: 1, in_prev: 1 },
      { page: "/blog", current_sessions: 30, prev_sessions: 70, delta: -40, in_current: 1, in_prev: 1 },
      { page: "/old", current_sessions: 0, prev_sessions: 60, delta: -60, in_current: 0, in_prev: 1 },
    ];

    const result = categorizePageMovers(rows);

    expect(result.newEntrants).toHaveLength(1);
    expect(result.newEntrants[0].page).toBe("/new");
    expect(result.newEntrants[0].isNew).toBe(true);

    expect(result.gainers).toHaveLength(1);
    expect(result.gainers[0].page).toBe("/pricing");
    expect(result.gainers[0].delta).toBe(40);

    expect(result.losers).toHaveLength(2);
    expect(result.losers[0].page).toBe("/old");  // biggest loss first
  });

  it("caps each category at 3", () => {
    const rows = Array.from({ length: 10 }, (_, i) => ({
      page: `/p${i}`,
      current_sessions: 100 + i * 10,
      prev_sessions: 0,
      delta: 100 + i * 10,
      in_current: 1,
      in_prev: 0,
    }));
    const result = categorizePageMovers(rows);
    expect(result.newEntrants.length).toBeLessThanOrEqual(3);
  });
});
