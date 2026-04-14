import { describe, it, expect } from "vitest";
import { validateFilters, filterParamSchema } from "./query-validation.js";

// ─── validateFilters ──────────────────────────────────────────────────────────

describe("validateFilters", () => {
  it("parses a valid single filter", () => {
    const result = validateFilters(
      JSON.stringify([{ parameter: "browser", type: "equals", value: ["Chrome"] }])
    );
    expect(result).toHaveLength(1);
    expect(result[0].parameter).toBe("browser");
    expect(result[0].type).toBe("equals");
    expect(result[0].value).toEqual(["Chrome"]);
  });

  it("parses multiple valid filters", () => {
    const filters = [
      { parameter: "country", type: "equals", value: ["US"] },
      { parameter: "device_type", type: "not_equals", value: ["mobile"] },
    ];
    const result = validateFilters(JSON.stringify(filters));
    expect(result).toHaveLength(2);
  });

  it("parses all supported filter types", () => {
    const types = ["equals", "not_equals", "contains", "not_contains", "regex", "not_regex", "greater_than", "less_than"];
    for (const type of types) {
      const result = validateFilters(
        JSON.stringify([{ parameter: "pathname", type, value: ["/test"] }])
      );
      expect(result[0].type).toBe(type);
    }
  });

  it("accepts numeric values in value array", () => {
    const result = validateFilters(
      JSON.stringify([{ parameter: "lat", type: "greater_than", value: [40] }])
    );
    expect(result[0].value).toEqual([40]);
  });

  it("accepts empty value array", () => {
    const result = validateFilters(
      JSON.stringify([{ parameter: "browser", type: "equals", value: [] }])
    );
    expect(result[0].value).toEqual([]);
  });

  it("parses an empty array (no filters)", () => {
    const result = validateFilters("[]");
    expect(result).toHaveLength(0);
  });

  it("throws on invalid JSON", () => {
    expect(() => validateFilters("not json")).toThrow("Invalid JSON format");
  });

  it("throws on unknown parameter name", () => {
    expect(() =>
      validateFilters(JSON.stringify([{ parameter: "unknown_field", type: "equals", value: ["x"] }]))
    ).toThrow();
  });

  it("throws on unknown filter type", () => {
    expect(() =>
      validateFilters(JSON.stringify([{ parameter: "browser", type: "unknown_operator", value: ["x"] }]))
    ).toThrow();
  });

  it("throws when value is not an array", () => {
    expect(() =>
      validateFilters(JSON.stringify([{ parameter: "browser", type: "equals", value: "Chrome" }]))
    ).toThrow();
  });

  it("throws when filter is missing parameter", () => {
    expect(() =>
      validateFilters(JSON.stringify([{ type: "equals", value: ["x"] }]))
    ).toThrow();
  });

  it("throws when filter is missing type", () => {
    expect(() =>
      validateFilters(JSON.stringify([{ parameter: "browser", value: ["x"] }]))
    ).toThrow();
  });

  it("throws when input is an object not an array", () => {
    expect(() =>
      validateFilters(JSON.stringify({ parameter: "browser", type: "equals", value: ["x"] }))
    ).toThrow();
  });
});

// ─── filterParamSchema ────────────────────────────────────────────────────────

describe("filterParamSchema", () => {
  it("accepts all valid parameter names", () => {
    const validParams = [
      "browser", "operating_system", "language", "country", "region", "city",
      "device_type", "referrer", "hostname", "pathname", "page_title", "querystring",
      "event_name", "channel", "utm_source", "utm_medium", "utm_campaign",
      "utm_term", "utm_content", "entry_page", "exit_page", "dimensions",
      "browser_version", "operating_system_version", "user_id",
    ];
    for (const param of validParams) {
      expect(filterParamSchema.safeParse(param).success).toBe(true);
    }
  });

  it("rejects unknown parameter name", () => {
    expect(filterParamSchema.safeParse("unknown_param").success).toBe(false);
  });

  it("rejects empty string", () => {
    expect(filterParamSchema.safeParse("").success).toBe(false);
  });
});
