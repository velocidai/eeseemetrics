import { describe, it, expect, vi } from "vitest";

// Mock all external dependencies that utils.ts imports
vi.mock("../../utils.js", () => ({ getIpAddress: vi.fn(() => "1.2.3.4") }));
vi.mock("../userId/userIdService.js", () => ({
  userIdService: { generateUserId: vi.fn(async () => "anon-id") },
}));
vi.mock("../../lib/siteConfig.js", () => ({}));

import { getUTMParams, getAllUrlParams, clearSelfReferrer } from "./utils.js";

// ─── getUTMParams ─────────────────────────────────────────────────────────────

describe("getUTMParams", () => {
  it("extracts utm_source", () => {
    expect(getUTMParams("utm_source=google")).toEqual({ utm_source: "google" });
  });

  it("extracts all standard UTM params", () => {
    const qs = "utm_source=google&utm_medium=cpc&utm_campaign=spring&utm_term=shoes&utm_content=ad1";
    expect(getUTMParams(qs)).toEqual({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "spring",
      utm_term: "shoes",
      utm_content: "ad1",
    });
  });

  it("extracts gclid", () => {
    expect(getUTMParams("gclid=abc123")).toEqual({ gclid: "abc123" });
  });

  it("extracts gad_source", () => {
    expect(getUTMParams("gad_source=1")).toEqual({ gad_source: "1" });
  });

  it("lowercases values", () => {
    expect(getUTMParams("utm_source=Google")).toEqual({ utm_source: "google" });
  });

  it("ignores non-UTM params", () => {
    expect(getUTMParams("page=1&sort=desc&utm_source=email")).toEqual({ utm_source: "email" });
  });

  it("returns empty object for empty string", () => {
    expect(getUTMParams("")).toEqual({});
  });

  it("returns empty object when no UTM params present", () => {
    expect(getUTMParams("foo=bar&baz=qux")).toEqual({});
  });

  it("handles URL-encoded values", () => {
    const result = getUTMParams("utm_campaign=hello%20world");
    expect(result.utm_campaign).toBe("hello world");
  });

  it("handles leading ? in querystring gracefully", () => {
    // URLSearchParams handles this fine — just verifying it doesn't throw
    expect(() => getUTMParams("?utm_source=test")).not.toThrow();
  });
});

// ─── getAllUrlParams ──────────────────────────────────────────────────────────

describe("getAllUrlParams", () => {
  it("extracts a single param", () => {
    expect(getAllUrlParams("foo=bar")).toEqual({ foo: "bar" });
  });

  it("extracts multiple params", () => {
    expect(getAllUrlParams("a=1&b=2&c=3")).toEqual({ a: "1", b: "2", c: "3" });
  });

  it("strips leading ? before parsing", () => {
    expect(getAllUrlParams("?foo=bar")).toEqual({ foo: "bar" });
  });

  it("lowercases keys", () => {
    expect(getAllUrlParams("FOO=bar")).toEqual({ foo: "bar" });
  });

  it("preserves value casing", () => {
    expect(getAllUrlParams("foo=Bar")).toEqual({ foo: "Bar" });
  });

  it("returns empty object for empty string", () => {
    expect(getAllUrlParams("")).toEqual({});
  });

  it("handles URL-encoded values", () => {
    expect(getAllUrlParams("q=hello%20world")).toEqual({ q: "hello world" });
  });

  it("handles params without values", () => {
    const result = getAllUrlParams("flag");
    expect(result).toHaveProperty("flag");
  });
});

// ─── clearSelfReferrer ────────────────────────────────────────────────────────

describe("clearSelfReferrer", () => {
  it("clears referrer when hostname matches", () => {
    expect(clearSelfReferrer("https://example.com/about", "example.com")).toBe("");
  });

  it("clears referrer when path differs but hostname matches", () => {
    expect(clearSelfReferrer("https://example.com/page/1", "example.com")).toBe("");
  });

  it("keeps referrer for different domain", () => {
    const ref = "https://google.com/search?q=test";
    expect(clearSelfReferrer(ref, "example.com")).toBe(ref);
  });

  it("keeps referrer for subdomain of same root", () => {
    // subdomain is NOT the same hostname, so referrer is kept
    const ref = "https://blog.example.com/post";
    expect(clearSelfReferrer(ref, "example.com")).toBe(ref);
  });

  it("clears referrer for exact subdomain match", () => {
    expect(clearSelfReferrer("https://blog.example.com/post", "blog.example.com")).toBe("");
  });

  it("returns original referrer when referrer is empty", () => {
    expect(clearSelfReferrer("", "example.com")).toBe("");
  });

  it("returns original referrer when hostname is empty", () => {
    const ref = "https://example.com/page";
    expect(clearSelfReferrer(ref, "")).toBe(ref);
  });

  it("returns original referrer for invalid URL", () => {
    expect(clearSelfReferrer("not-a-url", "example.com")).toBe("not-a-url");
  });
});
