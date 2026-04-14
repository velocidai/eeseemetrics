import { describe, it, expect } from "vitest";
import { getPlanTier, tierAtLeast } from "./tierUtils.js";

describe("getPlanTier", () => {
  it("starter100k → starter", () => expect(getPlanTier("starter100k")).toBe("starter"));
  it("pro5m → pro", () => expect(getPlanTier("pro5m")).toBe("pro"));
  it("scale10m → scale", () => expect(getPlanTier("scale10m")).toBe("scale"));
  it("custom → scale (highest access)", () => expect(getPlanTier("custom")).toBe("scale"));
  it("free → none", () => expect(getPlanTier("free")).toBe("none"));
  it("empty string → none", () => expect(getPlanTier("")).toBe("none"));
  it("unknown string → none", () => expect(getPlanTier("enterprise_xyz")).toBe("none"));
});

describe("tierAtLeast", () => {
  it("scale meets scale", () => expect(tierAtLeast("scale", "scale")).toBe(true));
  it("scale meets pro", () => expect(tierAtLeast("scale", "pro")).toBe(true));
  it("scale meets starter", () => expect(tierAtLeast("scale", "starter")).toBe(true));
  it("pro meets pro", () => expect(tierAtLeast("pro", "pro")).toBe(true));
  it("pro meets starter", () => expect(tierAtLeast("pro", "starter")).toBe(true));
  it("pro does NOT meet scale", () => expect(tierAtLeast("pro", "scale")).toBe(false));
  it("starter does NOT meet pro", () => expect(tierAtLeast("starter", "pro")).toBe(false));
  it("none does NOT meet starter", () => expect(tierAtLeast("none", "starter")).toBe(false));
});
