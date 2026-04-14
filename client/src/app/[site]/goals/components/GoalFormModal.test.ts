import { describe, it, expect } from "vitest";
import * as z from "zod";

// Duplicate the schema from GoalFormModal.tsx (it's not exported)
const formSchema = z
  .object({
    name: z.string().optional(),
    goalType: z.enum(["path", "event"]),
    config: z.object({
      pathPattern: z.string().optional(),
      eventName: z.string().optional(),
      eventPropertyKey: z.string().optional(),
      eventPropertyValue: z.string().optional(),
      propertyFilters: z
        .array(
          z.object({
            key: z.string(),
            value: z.union([z.string(), z.number(), z.boolean()]),
          })
        )
        .optional(),
    }),
  })
  .refine(
    data => {
      if (data.goalType === "path") {
        return !!data.config.pathPattern;
      } else if (data.goalType === "event") {
        return !!data.config.eventName;
      }
      return false;
    },
    {
      message: "Configuration is required based on goal type",
      path: ["config"],
    }
  )
  .refine(
    data => {
      if (data.goalType === "path" && data.config.pathPattern) {
        return !/^(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\/)/i.test(data.config.pathPattern);
      }
      return true;
    },
    {
      message: "Enter a path (e.g., /checkout), not a full URL.",
      path: ["config", "pathPattern"],
    }
  );

function parse(data: unknown) {
  return formSchema.safeParse(data);
}

// ─── path goalType ────────────────────────────────────────────────────────────

describe("GoalFormModal schema — path goalType", () => {
  it("valid: path goal with pathPattern", () => {
    expect(
      parse({ goalType: "path", config: { pathPattern: "/checkout" } }).success
    ).toBe(true);
  });

  it("valid: path goal with name and pattern", () => {
    expect(
      parse({ name: "Checkout", goalType: "path", config: { pathPattern: "/checkout" } }).success
    ).toBe(true);
  });

  it("valid: pattern with wildcard", () => {
    expect(
      parse({ goalType: "path", config: { pathPattern: "/blog/*" } }).success
    ).toBe(true);
  });

  it("rejects path goal without pathPattern", () => {
    expect(parse({ goalType: "path", config: {} }).success).toBe(false);
  });

  it("rejects full URL as pathPattern — http://", () => {
    expect(
      parse({ goalType: "path", config: { pathPattern: "http://example.com/checkout" } }).success
    ).toBe(false);
  });

  it("rejects full URL as pathPattern — https://", () => {
    expect(
      parse({ goalType: "path", config: { pathPattern: "https://example.com/checkout" } }).success
    ).toBe(false);
  });

  it("rejects URL with www. prefix", () => {
    expect(
      parse({ goalType: "path", config: { pathPattern: "www.example.com/checkout" } }).success
    ).toBe(false);
  });

  it("rejects URL with domain/path format", () => {
    expect(
      parse({ goalType: "path", config: { pathPattern: "example.com/checkout" } }).success
    ).toBe(false);
  });
});

// ─── event goalType ───────────────────────────────────────────────────────────

describe("GoalFormModal schema — event goalType", () => {
  it("valid: event goal with eventName", () => {
    expect(
      parse({ goalType: "event", config: { eventName: "purchase" } }).success
    ).toBe(true);
  });

  it("valid: event goal with property filters", () => {
    expect(
      parse({
        goalType: "event",
        config: {
          eventName: "purchase",
          propertyFilters: [{ key: "currency", value: "USD" }],
        },
      }).success
    ).toBe(true);
  });

  it("valid: property filter with numeric value", () => {
    expect(
      parse({
        goalType: "event",
        config: {
          eventName: "score",
          propertyFilters: [{ key: "amount", value: 99.99 }],
        },
      }).success
    ).toBe(true);
  });

  it("valid: property filter with boolean value", () => {
    expect(
      parse({
        goalType: "event",
        config: {
          eventName: "trial_started",
          propertyFilters: [{ key: "is_free", value: true }],
        },
      }).success
    ).toBe(true);
  });

  it("rejects event goal without eventName", () => {
    expect(parse({ goalType: "event", config: {} }).success).toBe(false);
  });

  it("rejects property filter missing key", () => {
    expect(
      parse({
        goalType: "event",
        config: {
          eventName: "purchase",
          propertyFilters: [{ value: "USD" }],
        },
      }).success
    ).toBe(false);
  });
});

// ─── missing required fields ──────────────────────────────────────────────────

describe("GoalFormModal schema — missing required fields", () => {
  it("rejects missing goalType", () => {
    expect(parse({ config: { pathPattern: "/checkout" } }).success).toBe(false);
  });

  it("rejects missing config", () => {
    expect(parse({ goalType: "path" }).success).toBe(false);
  });

  it("rejects unknown goalType", () => {
    expect(parse({ goalType: "video", config: {} }).success).toBe(false);
  });
});
