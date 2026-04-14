import { describe, it, expect, vi } from "vitest";

// Mock logger so it doesn't fail during tests
vi.mock("./logger/logger.js", () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
  createServiceLogger: () => ({ warn: vi.fn(), info: vi.fn(), error: vi.fn() }),
}));

import { validateIPPattern, matchesCIDR, matchesRange } from "./ipUtils.js";

// ─── validateIPPattern ────────────────────────────────────────────────────────

describe("validateIPPattern", () => {
  describe("empty / whitespace", () => {
    it("empty string is valid", () => {
      expect(validateIPPattern("")).toEqual({ valid: true });
    });
    it("whitespace-only string is valid", () => {
      expect(validateIPPattern("   ")).toEqual({ valid: true });
    });
  });

  describe("single IPv4", () => {
    it("valid IPv4 address", () => {
      expect(validateIPPattern("192.168.1.1")).toEqual({ valid: true });
    });
    it("loopback address", () => {
      expect(validateIPPattern("127.0.0.1")).toEqual({ valid: true });
    });
    it("broadcast address", () => {
      expect(validateIPPattern("255.255.255.255")).toEqual({ valid: true });
    });
    it("zero address", () => {
      expect(validateIPPattern("0.0.0.0")).toEqual({ valid: true });
    });
    it("invalid IPv4 — out-of-range octet", () => {
      const result = validateIPPattern("256.1.1.1");
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
    it("invalid IPv4 — letters", () => {
      const result = validateIPPattern("abc.def.ghi.jkl");
      expect(result.valid).toBe(false);
    });
    it("invalid — random string without dash", () => {
      const result = validateIPPattern("notanip");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid IP address format");
    });
  });

  describe("single IPv6", () => {
    it("valid full IPv6", () => {
      expect(validateIPPattern("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toEqual({ valid: true });
    });
    it("valid abbreviated IPv6 (::)", () => {
      expect(validateIPPattern("::1")).toEqual({ valid: true });
    });
    it("valid mixed notation IPv6", () => {
      expect(validateIPPattern("::ffff:192.168.1.1")).toEqual({ valid: true });
    });
  });

  describe("CIDR notation", () => {
    it("valid IPv4 /24", () => {
      expect(validateIPPattern("192.168.1.0/24")).toEqual({ valid: true });
    });
    it("valid IPv4 /32 (host)", () => {
      expect(validateIPPattern("10.0.0.1/32")).toEqual({ valid: true });
    });
    it("valid IPv4 /0", () => {
      expect(validateIPPattern("0.0.0.0/0")).toEqual({ valid: true });
    });
    it("valid IPv6 CIDR /128", () => {
      expect(validateIPPattern("::1/128")).toEqual({ valid: true });
    });
    it("valid IPv6 CIDR /32", () => {
      expect(validateIPPattern("2001:db8::/32")).toEqual({ valid: true });
    });
    it("invalid CIDR — prefix out of range", () => {
      const result = validateIPPattern("192.168.1.0/33");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Invalid CIDR notation");
    });
    it("invalid CIDR — bad base IP", () => {
      const result = validateIPPattern("999.999.999.999/24");
      expect(result.valid).toBe(false);
    });
  });

  describe("range notation (IPv4 only)", () => {
    it("valid IPv4 range", () => {
      expect(validateIPPattern("192.168.1.1-192.168.1.255")).toEqual({ valid: true });
    });
    it("valid range — same start and end", () => {
      expect(validateIPPattern("10.0.0.5-10.0.0.5")).toEqual({ valid: true });
    });
    it("IPv6 range — returns specific error", () => {
      const result = validateIPPattern("2001:db8::1-2001:db8::ff");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("IPv6 range notation not supported");
    });
    it("invalid range — bad IP addresses", () => {
      const result = validateIPPattern("foo-bar");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid");
    });
    it("invalid range — missing end", () => {
      const result = validateIPPattern("192.168.1.1-");
      expect(result.valid).toBe(false);
    });
  });
});

// ─── matchesCIDR ─────────────────────────────────────────────────────────────

describe("matchesCIDR", () => {
  it("IP inside /24 subnet", () => {
    expect(matchesCIDR("192.168.1.100", "192.168.1.0/24")).toBe(true);
  });
  it("IP outside /24 subnet", () => {
    expect(matchesCIDR("192.168.2.1", "192.168.1.0/24")).toBe(false);
  });
  it("IP at network boundary — first usable", () => {
    expect(matchesCIDR("10.0.0.0", "10.0.0.0/8")).toBe(true);
  });
  it("IP at broadcast boundary", () => {
    expect(matchesCIDR("10.255.255.255", "10.0.0.0/8")).toBe(true);
  });
  it("IP outside /8 subnet", () => {
    expect(matchesCIDR("11.0.0.1", "10.0.0.0/8")).toBe(false);
  });
  it("/32 matches exact host", () => {
    expect(matchesCIDR("172.16.0.1", "172.16.0.1/32")).toBe(true);
  });
  it("/32 does not match different host", () => {
    expect(matchesCIDR("172.16.0.2", "172.16.0.1/32")).toBe(false);
  });
  it("IPv6 loopback in /128", () => {
    expect(matchesCIDR("::1", "::1/128")).toBe(true);
  });
  it("IPv6 in /32 subnet", () => {
    expect(matchesCIDR("2001:db8::1", "2001:db8::/32")).toBe(true);
  });
  it("IPv6 outside /32 subnet", () => {
    expect(matchesCIDR("2001:db9::1", "2001:db8::/32")).toBe(false);
  });
  it("invalid IP returns false", () => {
    expect(matchesCIDR("not-an-ip", "192.168.1.0/24")).toBe(false);
  });
  it("invalid CIDR returns false", () => {
    expect(matchesCIDR("192.168.1.1", "bad-cidr")).toBe(false);
  });
});

// ─── matchesRange ─────────────────────────────────────────────────────────────

describe("matchesRange", () => {
  it("IP inside range", () => {
    expect(matchesRange("192.168.1.100", "192.168.1.1-192.168.1.200")).toBe(true);
  });
  it("IP at start boundary", () => {
    expect(matchesRange("192.168.1.1", "192.168.1.1-192.168.1.200")).toBe(true);
  });
  it("IP at end boundary", () => {
    expect(matchesRange("192.168.1.200", "192.168.1.1-192.168.1.200")).toBe(true);
  });
  it("IP below range", () => {
    expect(matchesRange("192.168.1.0", "192.168.1.1-192.168.1.200")).toBe(false);
  });
  it("IP above range", () => {
    expect(matchesRange("192.168.1.201", "192.168.1.1-192.168.1.200")).toBe(false);
  });
  it("cross-octet range", () => {
    expect(matchesRange("10.0.0.128", "10.0.0.1-10.0.1.255")).toBe(true);
  });
  it("IPv6 range is not supported — returns false", () => {
    expect(matchesRange("2001:db8::5", "2001:db8::1-2001:db8::ff")).toBe(false);
  });
  it("invalid IP in range returns false", () => {
    expect(matchesRange("not-an-ip", "192.168.1.1-192.168.1.200")).toBe(false);
  });
});
