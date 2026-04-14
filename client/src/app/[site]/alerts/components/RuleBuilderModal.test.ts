import { describe, it, expect } from "vitest";
import { z } from "zod";

// Duplicate the schema from RuleBuilderModal.tsx (it's not exported)
const schema = z.object({
  metric: z.enum(["sessions", "pageviews", "bounce_rate"]),
  operator: z.enum(["drops_below", "exceeds", "drops_by_more_than", "spikes_by_more_than"]),
  threshold: z.coerce.number().positive("Must be a positive number"),
  name: z.string().trim().max(100).optional(),
});

function parse(data: unknown) {
  return schema.safeParse(data);
}

// ─── valid combinations ───────────────────────────────────────────────────────

describe("RuleBuilderModal schema — valid inputs", () => {
  it("valid: sessions + drops_below + positive threshold", () => {
    expect(parse({ metric: "sessions", operator: "drops_below", threshold: 100 }).success).toBe(true);
  });

  it("valid: pageviews + exceeds + threshold", () => {
    expect(parse({ metric: "pageviews", operator: "exceeds", threshold: 500 }).success).toBe(true);
  });

  it("valid: bounce_rate + drops_by_more_than", () => {
    expect(parse({ metric: "bounce_rate", operator: "drops_by_more_than", threshold: 20 }).success).toBe(true);
  });

  it("valid: with optional name", () => {
    expect(
      parse({ metric: "sessions", operator: "exceeds", threshold: 100, name: "My Alert" }).success
    ).toBe(true);
  });

  it("valid: name at exact 100 chars", () => {
    expect(
      parse({ metric: "sessions", operator: "exceeds", threshold: 1, name: "a".repeat(100) }).success
    ).toBe(true);
  });

  it("valid: threshold provided as string (coerced to number)", () => {
    const result = parse({ metric: "sessions", operator: "exceeds", threshold: "50" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.threshold).toBe(50);
  });
});

// ─── invalid inputs ───────────────────────────────────────────────────────────

describe("RuleBuilderModal schema — invalid inputs", () => {
  it("rejects zero threshold", () => {
    expect(parse({ metric: "sessions", operator: "exceeds", threshold: 0 }).success).toBe(false);
  });

  it("rejects negative threshold", () => {
    expect(parse({ metric: "sessions", operator: "exceeds", threshold: -10 }).success).toBe(false);
  });

  it("rejects missing threshold", () => {
    expect(parse({ metric: "sessions", operator: "exceeds" }).success).toBe(false);
  });

  it("rejects unknown metric", () => {
    expect(parse({ metric: "video_plays", operator: "exceeds", threshold: 10 }).success).toBe(false);
  });

  it("rejects unknown operator", () => {
    expect(parse({ metric: "sessions", operator: "is_exactly", threshold: 10 }).success).toBe(false);
  });

  it("rejects name over 100 chars", () => {
    expect(
      parse({ metric: "sessions", operator: "exceeds", threshold: 1, name: "a".repeat(101) }).success
    ).toBe(false);
  });

  it("rejects missing metric", () => {
    expect(parse({ operator: "exceeds", threshold: 10 }).success).toBe(false);
  });

  it("rejects missing operator", () => {
    expect(parse({ metric: "sessions", threshold: 10 }).success).toBe(false);
  });
});
