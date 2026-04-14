import { describe, it, expect } from "vitest";
import { validateIPPattern } from "./ipValidation";

// ─── validateIPPattern ────────────────────────────────────────────────────────

describe("validateIPPattern", () => {
  describe("empty / whitespace", () => {
    it("empty string is valid", () => {
      expect(validateIPPattern("")).toEqual({ valid: true });
    });
    it("whitespace-only is valid", () => {
      expect(validateIPPattern("   ")).toEqual({ valid: true });
    });
  });

  describe("single IPv4", () => {
    it("valid IPv4", () => {
      expect(validateIPPattern("192.168.1.1")).toEqual({ valid: true });
    });
    it("loopback", () => {
      expect(validateIPPattern("127.0.0.1")).toEqual({ valid: true });
    });
    it("all zeros", () => {
      expect(validateIPPattern("0.0.0.0")).toEqual({ valid: true });
    });
    it("broadcast", () => {
      expect(validateIPPattern("255.255.255.255")).toEqual({ valid: true });
    });
    it("invalid — out of range octet", () => {
      expect(validateIPPattern("256.1.1.1").valid).toBe(false);
    });
    it("invalid — letters", () => {
      expect(validateIPPattern("not-an-ip").valid).toBe(false);
    });
    it("returns error message for invalid", () => {
      const result = validateIPPattern("bad-input");
      expect(result.error).toBeDefined();
    });
  });

  describe("single IPv6", () => {
    it("loopback ::1", () => {
      expect(validateIPPattern("::1")).toEqual({ valid: true });
    });
    it("full IPv6", () => {
      expect(validateIPPattern("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toEqual({ valid: true });
    });
    it("abbreviated IPv6", () => {
      expect(validateIPPattern("2001:db8::1")).toEqual({ valid: true });
    });
  });

  describe("CIDR notation", () => {
    it("IPv4 /24", () => {
      expect(validateIPPattern("192.168.1.0/24")).toEqual({ valid: true });
    });
    it("IPv4 /32 host", () => {
      expect(validateIPPattern("10.0.0.1/32")).toEqual({ valid: true });
    });
    it("IPv6 /128", () => {
      expect(validateIPPattern("::1/128")).toEqual({ valid: true });
    });
    it("IPv6 /32", () => {
      expect(validateIPPattern("2001:db8::/32")).toEqual({ valid: true });
    });
    it("invalid CIDR — prefix too large", () => {
      expect(validateIPPattern("192.168.1.0/33").valid).toBe(false);
    });
    it("invalid CIDR — bad base", () => {
      expect(validateIPPattern("999.0.0.0/24").valid).toBe(false);
    });
  });

  describe("range notation", () => {
    it("valid IPv4 range", () => {
      expect(validateIPPattern("192.168.1.1-192.168.1.255")).toEqual({ valid: true });
    });
    it("single-IP range (start equals end)", () => {
      expect(validateIPPattern("10.0.0.5-10.0.0.5")).toEqual({ valid: true });
    });
    it("IPv6 range returns specific error", () => {
      const result = validateIPPattern("2001:db8::1-2001:db8::ff");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("IPv6 range notation not supported");
    });
    it("invalid range — bad IPs", () => {
      expect(validateIPPattern("foo-bar").valid).toBe(false);
    });
    it("invalid range — missing end IP", () => {
      expect(validateIPPattern("192.168.1.1-").valid).toBe(false);
    });
  });
});
