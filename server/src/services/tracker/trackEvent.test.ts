import { describe, it, expect } from "vitest";
import { trackingPayloadSchema } from "./trackEvent.js";

// Helper — parse and return success/failure
function parse(data: unknown) {
  return trackingPayloadSchema.safeParse(data);
}

const BASE = { site_id: "abc123" };

// ─── pageview ─────────────────────────────────────────────────────────────────

describe("trackingPayloadSchema — pageview", () => {
  it("minimal valid pageview", () => {
    expect(parse({ ...BASE, type: "pageview" }).success).toBe(true);
  });

  it("pageview with all optional fields", () => {
    const result = parse({
      ...BASE,
      type: "pageview",
      hostname: "example.com",
      pathname: "/about",
      querystring: "?utm_source=google",
      screenWidth: 1920,
      screenHeight: 1080,
      language: "en-US",
      page_title: "About Us",
      referrer: "https://google.com",
      user_id: "user_42",
      ip_address: "1.2.3.4",
      user_agent: "Mozilla/5.0",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing site_id", () => {
    expect(parse({ type: "pageview" }).success).toBe(false);
  });

  it("rejects empty site_id", () => {
    expect(parse({ site_id: "", type: "pageview" }).success).toBe(false);
  });

  it("rejects invalid ip_address format", () => {
    expect(parse({ ...BASE, type: "pageview", ip_address: "not-an-ip" }).success).toBe(false);
  });

  it("rejects negative screenWidth", () => {
    expect(parse({ ...BASE, type: "pageview", screenWidth: -1 }).success).toBe(false);
  });

  it("rejects screenWidth of zero", () => {
    expect(parse({ ...BASE, type: "pageview", screenWidth: 0 }).success).toBe(false);
  });

  it("rejects extra (unknown) fields — strict", () => {
    expect(parse({ ...BASE, type: "pageview", unknownField: "oops" }).success).toBe(false);
  });

  it("rejects pathname exceeding 2048 chars", () => {
    expect(parse({ ...BASE, type: "pageview", pathname: "a".repeat(2049) }).success).toBe(false);
  });

  it("accepts pathname at exact limit", () => {
    expect(parse({ ...BASE, type: "pageview", pathname: "a".repeat(2048) }).success).toBe(true);
  });
});

// ─── custom_event ─────────────────────────────────────────────────────────────

describe("trackingPayloadSchema — custom_event", () => {
  it("minimal valid custom_event", () => {
    expect(parse({ ...BASE, type: "custom_event", event_name: "click" }).success).toBe(true);
  });

  it("custom_event with valid JSON properties", () => {
    expect(
      parse({
        ...BASE,
        type: "custom_event",
        event_name: "purchase",
        properties: JSON.stringify({ value: 99.99, currency: "USD" }),
      }).success
    ).toBe(true);
  });

  it("rejects missing event_name", () => {
    expect(parse({ ...BASE, type: "custom_event" }).success).toBe(false);
  });

  it("rejects empty event_name", () => {
    expect(parse({ ...BASE, type: "custom_event", event_name: "" }).success).toBe(false);
  });

  it("rejects event_name exceeding 256 chars", () => {
    expect(
      parse({ ...BASE, type: "custom_event", event_name: "e".repeat(257) }).success
    ).toBe(false);
  });

  it("rejects invalid JSON in properties", () => {
    expect(
      parse({ ...BASE, type: "custom_event", event_name: "click", properties: "not json" }).success
    ).toBe(false);
  });

  it("rejects extra fields — strict", () => {
    expect(
      parse({ ...BASE, type: "custom_event", event_name: "click", bogus: 1 }).success
    ).toBe(false);
  });
});

// ─── performance ──────────────────────────────────────────────────────────────

describe("trackingPayloadSchema — performance", () => {
  it("minimal valid performance event", () => {
    expect(parse({ ...BASE, type: "performance" }).success).toBe(true);
  });

  it("performance with all web vitals", () => {
    expect(
      parse({ ...BASE, type: "performance", lcp: 1200, cls: 0.05, inp: 100, fcp: 800, ttfb: 200 }).success
    ).toBe(true);
  });

  it("allows null vitals", () => {
    expect(parse({ ...BASE, type: "performance", lcp: null, cls: null }).success).toBe(true);
  });

  it("rejects negative vital value", () => {
    expect(parse({ ...BASE, type: "performance", lcp: -1 }).success).toBe(false);
  });
});

// ─── outbound ─────────────────────────────────────────────────────────────────

describe("trackingPayloadSchema — outbound", () => {
  it("valid outbound event", () => {
    expect(
      parse({
        ...BASE,
        type: "outbound",
        properties: JSON.stringify({ url: "https://external.com", text: "Click me" }),
      }).success
    ).toBe(true);
  });

  it("rejects missing properties", () => {
    expect(parse({ ...BASE, type: "outbound" }).success).toBe(false);
  });

  it("rejects outbound properties without url", () => {
    expect(
      parse({ ...BASE, type: "outbound", properties: JSON.stringify({ text: "no url" }) }).success
    ).toBe(false);
  });

  it("rejects outbound properties with invalid url", () => {
    expect(
      parse({ ...BASE, type: "outbound", properties: JSON.stringify({ url: "not-a-url" }) }).success
    ).toBe(false);
  });

  it("rejects outbound properties with non-string text", () => {
    expect(
      parse({
        ...BASE,
        type: "outbound",
        properties: JSON.stringify({ url: "https://example.com", text: 42 }),
      }).success
    ).toBe(false);
  });
});

// ─── error ────────────────────────────────────────────────────────────────────

describe("trackingPayloadSchema — error", () => {
  it("valid error event", () => {
    expect(
      parse({
        ...BASE,
        type: "error",
        event_name: "TypeError",
        properties: JSON.stringify({ message: "Cannot read property" }),
      }).success
    ).toBe(true);
  });

  it("error event with all optional fields", () => {
    expect(
      parse({
        ...BASE,
        type: "error",
        event_name: "ReferenceError",
        properties: JSON.stringify({
          message: "foo is not defined",
          stack: "ReferenceError: foo\n  at eval:1:1",
          fileName: "app.js",
          lineNumber: 42,
          columnNumber: 7,
        }),
      }).success
    ).toBe(true);
  });

  it("rejects missing event_name", () => {
    expect(
      parse({ ...BASE, type: "error", properties: JSON.stringify({ message: "oops" }) }).success
    ).toBe(false);
  });

  it("rejects non-string message in properties", () => {
    expect(
      parse({
        ...BASE,
        type: "error",
        event_name: "TypeError",
        properties: JSON.stringify({ message: 42 }),
      }).success
    ).toBe(false);
  });
});

// ─── button_click ─────────────────────────────────────────────────────────────

describe("trackingPayloadSchema — button_click", () => {
  it("minimal valid button_click", () => {
    expect(parse({ ...BASE, type: "button_click" }).success).toBe(true);
  });

  it("button_click with JSON properties", () => {
    expect(
      parse({ ...BASE, type: "button_click", properties: JSON.stringify({ label: "Submit" }) }).success
    ).toBe(true);
  });

  it("rejects invalid JSON properties", () => {
    expect(parse({ ...BASE, type: "button_click", properties: "bad json" }).success).toBe(false);
  });
});

// ─── copy ─────────────────────────────────────────────────────────────────────

describe("trackingPayloadSchema — copy", () => {
  it("valid copy event", () => {
    expect(
      parse({
        ...BASE,
        type: "copy",
        properties: JSON.stringify({ sourceElement: "p", text: "hello", textLength: 5 }),
      }).success
    ).toBe(true);
  });

  it("rejects copy without sourceElement", () => {
    expect(
      parse({ ...BASE, type: "copy", properties: JSON.stringify({ text: "hi" }) }).success
    ).toBe(false);
  });

  it("rejects negative textLength", () => {
    expect(
      parse({
        ...BASE,
        type: "copy",
        properties: JSON.stringify({ sourceElement: "span", textLength: -1 }),
      }).success
    ).toBe(false);
  });
});

// ─── form_submit ──────────────────────────────────────────────────────────────

describe("trackingPayloadSchema — form_submit", () => {
  it("valid form_submit event", () => {
    expect(
      parse({
        ...BASE,
        type: "form_submit",
        properties: JSON.stringify({
          formId: "login",
          formName: "Login",
          formAction: "/login",
          method: "POST",
          fieldCount: 3,
        }),
      }).success
    ).toBe(true);
  });

  it("rejects form_submit missing required properties fields", () => {
    expect(
      parse({
        ...BASE,
        type: "form_submit",
        properties: JSON.stringify({ formId: "x" }),
      }).success
    ).toBe(false);
  });

  it("rejects negative fieldCount", () => {
    expect(
      parse({
        ...BASE,
        type: "form_submit",
        properties: JSON.stringify({
          formId: "f",
          formName: "F",
          formAction: "/f",
          method: "GET",
          fieldCount: -1,
        }),
      }).success
    ).toBe(false);
  });
});

// ─── input_change ─────────────────────────────────────────────────────────────

describe("trackingPayloadSchema — input_change", () => {
  it("valid input_change event", () => {
    expect(
      parse({
        ...BASE,
        type: "input_change",
        properties: JSON.stringify({ element: "input[name=email]", inputName: "email" }),
      }).success
    ).toBe(true);
  });

  it("rejects missing inputName", () => {
    expect(
      parse({
        ...BASE,
        type: "input_change",
        properties: JSON.stringify({ element: "input" }),
      }).success
    ).toBe(false);
  });
});

// ─── discriminated union — missing/invalid type ───────────────────────────────

describe("trackingPayloadSchema — type field", () => {
  it("rejects unknown type", () => {
    expect(parse({ ...BASE, type: "video_play" }).success).toBe(false);
  });

  it("rejects missing type", () => {
    expect(parse({ ...BASE }).success).toBe(false);
  });
});
