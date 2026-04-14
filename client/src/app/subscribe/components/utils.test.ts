import { describe, it, expect } from "vitest";
import {
  isStarterAvailable,
  findPriceForTier,
  formatEventTier,
} from "./utils";
import { getPlanType } from "../../../lib/stripe";

// ─── isStarterAvailable ───────────────────────────────────────────────────────

describe("isStarterAvailable", () => {
  it("returns true for 100k", () => expect(isStarterAvailable(100_000)).toBe(true));
  it("returns true for 250k (at the cap)", () => expect(isStarterAvailable(250_000)).toBe(true));
  it("returns false for 500k (above 250k cap)", () => expect(isStarterAvailable(500_000)).toBe(false));
  it("returns false for Custom string", () => expect(isStarterAvailable("Custom")).toBe(false));
  it("returns false for a non-number string", () => expect(isStarterAvailable("anything")).toBe(false));
});

// ─── findPriceForTier ─────────────────────────────────────────────────────────

describe("findPriceForTier", () => {
  it("finds starter100k monthly price", () => {
    const price = findPriceForTier(100_000, "month", "starter");
    expect(price?.name).toBe("starter100k");
    expect(price?.price).toBe(14);
  });

  it("finds starter250k monthly price", () => {
    const price = findPriceForTier(250_000, "month", "starter");
    expect(price?.name).toBe("starter250k");
    expect(price?.price).toBe(24);
  });

  it("finds pro250k monthly price", () => {
    const price = findPriceForTier(250_000, "month", "pro");
    expect(price?.name).toBe("pro250k");
    expect(price?.price).toBe(29);
  });

  it("finds pro1m monthly price", () => {
    const price = findPriceForTier(1_000_000, "month", "pro");
    expect(price?.name).toBe("pro1m");
    expect(price?.price).toBe(69);
  });

  it("finds scale1m annual price", () => {
    const price = findPriceForTier(1_000_000, "year", "scale");
    expect(price?.name).toBe("scale1m-annual");
    expect(price?.price).toBe(139 * 8);
  });

  it("annual price equals monthly * 8 for pro100k", () => {
    const monthly = findPriceForTier(100_000, "month", "pro");
    const annual = findPriceForTier(100_000, "year", "pro");
    expect(annual?.price).toBe((monthly?.price ?? 0) * 8);
  });

  it("returns null for Custom", () => {
    expect(findPriceForTier("Custom", "month", "pro")).toBeNull();
  });
});

// ─── formatEventTier ──────────────────────────────────────────────────────────

describe("formatEventTier", () => {
  it("formats 100_000 as '100k'", () => expect(formatEventTier(100_000)).toBe("100k"));
  it("formats 250_000 as '250k'", () => expect(formatEventTier(250_000)).toBe("250k"));
  it("formats 1_000_000 as '1M'", () => expect(formatEventTier(1_000_000)).toBe("1M"));
  it("formats 5_000_000 as '5M'", () => expect(formatEventTier(5_000_000)).toBe("5M"));
  it("passes Custom string through unchanged", () => expect(formatEventTier("Custom")).toBe("Custom"));
});

// ─── getPlanType ──────────────────────────────────────────────────────────────

describe("getPlanType", () => {
  it("starter100k → Starter", () => expect(getPlanType("starter100k")).toBe("Starter"));
  it("pro5m → Pro", () => expect(getPlanType("pro5m")).toBe("Pro"));
  it("scale10m → Scale", () => expect(getPlanType("scale10m")).toBe("Scale"));
  it("free → Free", () => expect(getPlanType("free")).toBe("Free"));
  it("unknown → Free", () => expect(getPlanType("unknown")).toBe("Free"));
});
