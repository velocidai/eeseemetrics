import { describe, it, expect } from "vitest";
import { applyValidationRules } from "./validationEngine.js";
import { HttpCheckResult, ValidationRule } from "./types.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeResult(overrides: Partial<HttpCheckResult> = {}): HttpCheckResult {
  return {
    status: "success",
    statusCode: 200,
    responseTimeMs: 150,
    timing: {},
    headers: {},
    bodySizeBytes: 1024,
    validationErrors: [],
    ...overrides,
  };
}

// ─── status_code ──────────────────────────────────────────────────────────────

describe("applyValidationRules — status_code", () => {
  it("equals — passes when code matches", () => {
    const errors = applyValidationRules(
      makeResult({ statusCode: 200 }),
      [{ type: "status_code", operator: "equals", value: 200 }]
    );
    expect(errors).toHaveLength(0);
  });

  it("equals — fails when code does not match", () => {
    const errors = applyValidationRules(
      makeResult({ statusCode: 404 }),
      [{ type: "status_code", operator: "equals", value: 200 }]
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("404");
  });

  it("not_equals — passes when code differs", () => {
    const errors = applyValidationRules(
      makeResult({ statusCode: 301 }),
      [{ type: "status_code", operator: "not_equals", value: 200 }]
    );
    expect(errors).toHaveLength(0);
  });

  it("not_equals — fails when code equals forbidden value", () => {
    const errors = applyValidationRules(
      makeResult({ statusCode: 500 }),
      [{ type: "status_code", operator: "not_equals", value: 500 }]
    );
    expect(errors).toHaveLength(1);
  });

  it("in — passes when code is in list", () => {
    const errors = applyValidationRules(
      makeResult({ statusCode: 301 }),
      [{ type: "status_code", operator: "in", value: [200, 301, 302] }]
    );
    expect(errors).toHaveLength(0);
  });

  it("in — fails when code is not in list", () => {
    const errors = applyValidationRules(
      makeResult({ statusCode: 500 }),
      [{ type: "status_code", operator: "in", value: [200, 301, 302] }]
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("500");
  });

  it("not_in — passes when code is absent from list", () => {
    const errors = applyValidationRules(
      makeResult({ statusCode: 200 }),
      [{ type: "status_code", operator: "not_in", value: [404, 500, 503] }]
    );
    expect(errors).toHaveLength(0);
  });

  it("not_in — fails when code is in forbidden list", () => {
    const errors = applyValidationRules(
      makeResult({ statusCode: 500 }),
      [{ type: "status_code", operator: "not_in", value: [500, 503] }]
    );
    expect(errors).toHaveLength(1);
  });

  it("no error when statusCode is undefined", () => {
    const errors = applyValidationRules(
      makeResult({ statusCode: undefined }),
      [{ type: "status_code", operator: "equals", value: 200 }]
    );
    expect(errors).toHaveLength(0);
  });
});

// ─── response_time ────────────────────────────────────────────────────────────

describe("applyValidationRules — response_time", () => {
  it("less_than — passes when under threshold", () => {
    const errors = applyValidationRules(
      makeResult({ responseTimeMs: 99 }),
      [{ type: "response_time", operator: "less_than", value: 100 }]
    );
    expect(errors).toHaveLength(0);
  });

  it("less_than — fails when at or above threshold", () => {
    const errors = applyValidationRules(
      makeResult({ responseTimeMs: 100 }),
      [{ type: "response_time", operator: "less_than", value: 100 }]
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("100ms");
  });

  it("greater_than — passes when above threshold", () => {
    const errors = applyValidationRules(
      makeResult({ responseTimeMs: 101 }),
      [{ type: "response_time", operator: "greater_than", value: 100 }]
    );
    expect(errors).toHaveLength(0);
  });

  it("greater_than — fails when at or below threshold", () => {
    const errors = applyValidationRules(
      makeResult({ responseTimeMs: 50 }),
      [{ type: "response_time", operator: "greater_than", value: 100 }]
    );
    expect(errors).toHaveLength(1);
  });
});

// ─── response_body_contains ───────────────────────────────────────────────────

describe("applyValidationRules — response_body_contains", () => {
  it("passes when body contains value (case-sensitive)", () => {
    const errors = applyValidationRules(
      makeResult(),
      [{ type: "response_body_contains", value: "Hello" }],
      "Hello World"
    );
    expect(errors).toHaveLength(0);
  });

  it("fails when body does not contain value", () => {
    const errors = applyValidationRules(
      makeResult(),
      [{ type: "response_body_contains", value: "missing" }],
      "Hello World"
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("missing");
  });

  it("case-insensitive match passes", () => {
    const errors = applyValidationRules(
      makeResult(),
      [{ type: "response_body_contains", value: "hello", caseSensitive: false }],
      "Hello World"
    );
    expect(errors).toHaveLength(0);
  });

  it("case-sensitive match fails for wrong case", () => {
    const errors = applyValidationRules(
      makeResult(),
      [{ type: "response_body_contains", value: "hello", caseSensitive: true }],
      "Hello World"
    );
    expect(errors).toHaveLength(1);
  });

  it("returns error when body is empty", () => {
    const errors = applyValidationRules(
      makeResult(),
      [{ type: "response_body_contains", value: "something" }],
      ""
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("empty");
  });
});

// ─── response_body_not_contains ───────────────────────────────────────────────

describe("applyValidationRules — response_body_not_contains", () => {
  it("passes when body does NOT contain value", () => {
    const errors = applyValidationRules(
      makeResult(),
      [{ type: "response_body_not_contains", value: "error" }],
      "OK"
    );
    expect(errors).toHaveLength(0);
  });

  it("fails when body contains forbidden value", () => {
    const errors = applyValidationRules(
      makeResult(),
      [{ type: "response_body_not_contains", value: "error" }],
      "Internal server error"
    );
    expect(errors).toHaveLength(1);
  });

  it("no error when body is empty (not_contains trivially passes)", () => {
    const errors = applyValidationRules(
      makeResult(),
      [{ type: "response_body_not_contains", value: "error" }]
      // no body passed
    );
    expect(errors).toHaveLength(0);
  });
});

// ─── header_exists ────────────────────────────────────────────────────────────

describe("applyValidationRules — header_exists", () => {
  it("passes when header is present", () => {
    const errors = applyValidationRules(
      makeResult({ headers: { "content-type": "application/json" } }),
      [{ type: "header_exists", header: "content-type" }]
    );
    expect(errors).toHaveLength(0);
  });

  it("passes — header name is case-insensitive", () => {
    const errors = applyValidationRules(
      makeResult({ headers: { "Content-Type": "application/json" } }),
      [{ type: "header_exists", header: "content-type" }]
    );
    expect(errors).toHaveLength(0);
  });

  it("fails when header is absent", () => {
    const errors = applyValidationRules(
      makeResult({ headers: {} }),
      [{ type: "header_exists", header: "x-custom-header" }]
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("x-custom-header");
  });

  it("returns error when header name is not specified", () => {
    const errors = applyValidationRules(
      makeResult({ headers: {} }),
      [{ type: "header_exists" } as ValidationRule]
    );
    expect(errors).toHaveLength(1);
  });
});

// ─── header_value ─────────────────────────────────────────────────────────────

describe("applyValidationRules — header_value", () => {
  it("equals — passes when header value matches", () => {
    const errors = applyValidationRules(
      makeResult({ headers: { "content-type": "application/json" } }),
      [{ type: "header_value", header: "content-type", operator: "equals", value: "application/json" }]
    );
    expect(errors).toHaveLength(0);
  });

  it("equals — fails when header value does not match", () => {
    const errors = applyValidationRules(
      makeResult({ headers: { "content-type": "text/html" } }),
      [{ type: "header_value", header: "content-type", operator: "equals", value: "application/json" }]
    );
    expect(errors).toHaveLength(1);
  });

  it("contains — passes when header value contains substring", () => {
    const errors = applyValidationRules(
      makeResult({ headers: { "content-type": "application/json; charset=utf-8" } }),
      [{ type: "header_value", header: "content-type", operator: "contains", value: "application/json" }]
    );
    expect(errors).toHaveLength(0);
  });

  it("fails when header is absent", () => {
    const errors = applyValidationRules(
      makeResult({ headers: {} }),
      [{ type: "header_value", header: "x-missing", operator: "equals", value: "something" }]
    );
    expect(errors).toHaveLength(1);
  });
});

// ─── response_size ────────────────────────────────────────────────────────────

describe("applyValidationRules — response_size", () => {
  it("less_than — passes when size is under limit", () => {
    const errors = applyValidationRules(
      makeResult({ bodySizeBytes: 999 }),
      [{ type: "response_size", operator: "less_than", value: 1000 }]
    );
    expect(errors).toHaveLength(0);
  });

  it("less_than — fails when size is at or above limit", () => {
    const errors = applyValidationRules(
      makeResult({ bodySizeBytes: 1000 }),
      [{ type: "response_size", operator: "less_than", value: 1000 }]
    );
    expect(errors).toHaveLength(1);
  });

  it("greater_than — passes when size exceeds threshold", () => {
    const errors = applyValidationRules(
      makeResult({ bodySizeBytes: 5000 }),
      [{ type: "response_size", operator: "greater_than", value: 1000 }]
    );
    expect(errors).toHaveLength(0);
  });

  it("greater_than — fails when size is below threshold", () => {
    const errors = applyValidationRules(
      makeResult({ bodySizeBytes: 100 }),
      [{ type: "response_size", operator: "greater_than", value: 1000 }]
    );
    expect(errors).toHaveLength(1);
  });
});

// ─── multiple rules ───────────────────────────────────────────────────────────

describe("applyValidationRules — multiple rules", () => {
  it("all passing rules yields empty errors", () => {
    const errors = applyValidationRules(
      makeResult({ statusCode: 200, responseTimeMs: 80, bodySizeBytes: 500 }),
      [
        { type: "status_code", operator: "equals", value: 200 },
        { type: "response_time", operator: "less_than", value: 100 },
        { type: "response_size", operator: "less_than", value: 1000 },
      ],
      "Hello World"
    );
    expect(errors).toHaveLength(0);
  });

  it("collects errors from all failing rules", () => {
    const errors = applyValidationRules(
      makeResult({ statusCode: 500, responseTimeMs: 2000 }),
      [
        { type: "status_code", operator: "equals", value: 200 },
        { type: "response_time", operator: "less_than", value: 500 },
      ]
    );
    expect(errors).toHaveLength(2);
  });

  it("unknown rule type returns an error message", () => {
    const errors = applyValidationRules(
      makeResult(),
      [{ type: "unknown_rule_type" as any }]
    );
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("Unknown validation rule type");
  });
});
