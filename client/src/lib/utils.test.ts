import { describe, it, expect, vi } from "vitest";

// Mock dependencies that require browser/Next.js environment
vi.mock("../components/Avatar", () => ({
  generateName: (id: string) => `anon-${id ?? "unknown"}`,
}));
vi.mock("./dateTimeUtils", () => ({
  userLocale: "en-US",
}));

import {
  formatSecondsAsMinutesAndSeconds,
  truncateString,
  truncateUrl,
  getCountryName,
  getLanguageName,
  normalizeDomain,
  isValidDomain,
  getUserDisplayName,
} from "./utils";

// ─── formatSecondsAsMinutesAndSeconds ─────────────────────────────────────────

describe("formatSecondsAsMinutesAndSeconds", () => {
  it("0 seconds", () => {
    expect(formatSecondsAsMinutesAndSeconds(0)).toBe("0s");
  });

  it("30 seconds", () => {
    expect(formatSecondsAsMinutesAndSeconds(30)).toBe("30s");
  });

  it("59 seconds", () => {
    expect(formatSecondsAsMinutesAndSeconds(59)).toBe("59s");
  });

  it("60 seconds → 1m 0s", () => {
    expect(formatSecondsAsMinutesAndSeconds(60)).toBe("1m 0s");
  });

  it("90 seconds → 1m 30s", () => {
    expect(formatSecondsAsMinutesAndSeconds(90)).toBe("1m 30s");
  });

  it("3600 seconds → 1hr 0min", () => {
    expect(formatSecondsAsMinutesAndSeconds(3600)).toBe("1hr 0min");
  });

  it("3661 seconds → 1hr 1min", () => {
    expect(formatSecondsAsMinutesAndSeconds(3661)).toBe("1hr 1min");
  });
});

// ─── truncateString ───────────────────────────────────────────────────────────

describe("truncateString", () => {
  it("returns string unchanged when under limit", () => {
    expect(truncateString("hello", 10)).toBe("hello");
  });

  it("returns string unchanged at exact limit", () => {
    expect(truncateString("hello", 5)).toBe("hello");
  });

  it("truncates and appends ... when over limit", () => {
    expect(truncateString("hello world", 5)).toBe("hello...");
  });

  it("uses default limit of 50", () => {
    const long = "a".repeat(55);
    const result = truncateString(long);
    expect(result).toBe("a".repeat(50) + "...");
  });

  it("handles empty string", () => {
    expect(truncateString("", 5)).toBe("");
  });
});

// ─── truncateUrl ─────────────────────────────────────────────────────────────

describe("truncateUrl", () => {
  it("returns '-' for empty string", () => {
    expect(truncateUrl("")).toBe("-");
  });

  it("returns URL unchanged when under maxLength", () => {
    const url = "https://example.com/page";
    expect(truncateUrl(url, 100)).toBe(url);
  });

  it("strips protocol and www from long URL", () => {
    const url = "https://www.example.com/a-very-long-path-that-needs-truncating";
    const result = truncateUrl(url, 30);
    expect(result.length).toBeLessThanOrEqual(33); // 30 + "..."
    expect(result).toContain("example.com");
  });

  it("truncates path when domain + path exceeds limit", () => {
    const url = "https://example.com/" + "a".repeat(100);
    const result = truncateUrl(url, 30);
    expect(result.endsWith("...")).toBe(true);
  });

  it("handles invalid URL gracefully", () => {
    const result = truncateUrl("not-a-real-url-that-exceeds-the-default-limit-of-sixty-chars", 20);
    expect(result.endsWith("...")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(23);
  });
});

// ─── getCountryName ───────────────────────────────────────────────────────────

describe("getCountryName", () => {
  it("returns full name for valid ISO code", () => {
    expect(getCountryName("US")).toBe("United States");
  });

  it("handles lowercase input", () => {
    expect(getCountryName("gb")).toBe("United Kingdom");
  });

  it("returns a string for unknown code (Intl may return 'Unknown Region' or the code itself)", () => {
    const result = getCountryName("ZZ");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});

// ─── getLanguageName ──────────────────────────────────────────────────────────

describe("getLanguageName", () => {
  it("returns language name for simple code", () => {
    const result = getLanguageName("en");
    expect(typeof result).toBe("string");
    expect(result?.toLowerCase()).toContain("english");
  });

  it("handles lang-region format", () => {
    const result = getLanguageName("en-US");
    expect(result).toContain("English");
    expect(result).toContain("United States");
  });

  it("returns original code for invalid code", () => {
    const result = getLanguageName("zz-ZZ");
    // Should not throw, may return original or partial
    expect(typeof result).toBe("string");
  });
});

// ─── normalizeDomain ─────────────────────────────────────────────────────────

describe("normalizeDomain", () => {
  it("strips http:// protocol", () => {
    expect(normalizeDomain("http://example.com")).toBe("example.com");
  });

  it("strips https:// protocol", () => {
    expect(normalizeDomain("https://example.com")).toBe("example.com");
  });

  it("strips www. prefix", () => {
    expect(normalizeDomain("www.example.com")).toBe("example.com");
  });

  it("strips protocol and www combined", () => {
    expect(normalizeDomain("https://www.example.com")).toBe("example.com");
  });

  it("strips trailing slash", () => {
    expect(normalizeDomain("example.com/")).toBe("example.com");
  });

  it("strips path after domain", () => {
    expect(normalizeDomain("example.com/page/1")).toBe("example.com");
  });

  it("handles subdomain correctly", () => {
    expect(normalizeDomain("https://blog.example.com")).toBe("blog.example.com");
  });

  it("returns empty string for empty input", () => {
    expect(normalizeDomain("")).toBe("");
  });

  it("trims whitespace", () => {
    expect(normalizeDomain("  example.com  ")).toBe("example.com");
  });
});

// ─── isValidDomain ────────────────────────────────────────────────────────────

describe("isValidDomain", () => {
  it("accepts a simple domain", () => {
    expect(isValidDomain("example.com")).toBe(true);
  });

  it("accepts subdomain", () => {
    expect(isValidDomain("blog.example.com")).toBe(true);
  });

  it("accepts domain with http:// prefix", () => {
    expect(isValidDomain("http://example.com")).toBe(true);
  });

  it("accepts domain with https:// prefix", () => {
    expect(isValidDomain("https://example.com")).toBe(true);
  });

  it("rejects domain without TLD", () => {
    expect(isValidDomain("localhost")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidDomain("")).toBe(false);
  });

  it("rejects plain IP address", () => {
    expect(isValidDomain("192.168.1.1")).toBe(false);
  });
});

// ─── getUserDisplayName ───────────────────────────────────────────────────────

describe("getUserDisplayName", () => {
  it("returns traits.username when available", () => {
    const result = getUserDisplayName({
      user_id: "u1",
      identified_user_id: "i1",
      traits: { username: "johndoe", name: "John Doe", email: "john@example.com" },
    });
    expect(result).toBe("johndoe");
  });

  it("falls back to traits.name when no username", () => {
    const result = getUserDisplayName({
      user_id: "u1",
      identified_user_id: "i1",
      traits: { name: "John Doe", email: "john@example.com" },
    });
    expect(result).toBe("John Doe");
  });

  it("falls back to traits.email when no name", () => {
    const result = getUserDisplayName({
      user_id: "u1",
      identified_user_id: "i1",
      traits: { email: "john@example.com" },
    });
    expect(result).toBe("john@example.com");
  });

  it("falls back to identified_user_id when no traits", () => {
    const result = getUserDisplayName({
      user_id: "u1",
      identified_user_id: "identified-123",
      traits: null,
    });
    expect(result).toBe("identified-123");
  });

  it("generates anon name when not identified and no traits", () => {
    const result = getUserDisplayName({
      user_id: "u1",
      traits: null,
    });
    expect(result).toContain("anon-");
  });
});
