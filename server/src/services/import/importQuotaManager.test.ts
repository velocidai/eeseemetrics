import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock IS_CLOUD = true so gating logic is active
vi.mock("../../lib/const.js", () => ({
  IS_CLOUD: true,
}));

// Mock ImportQuotaTracker (we only test the manager's own logic here)
vi.mock("./importQuotaTracker.js", () => ({
  ImportQuotaTracker: {
    create: vi.fn(async (orgId: string) => ({ orgId })),
  },
}));

import { importQuotaManager } from "./importQuotaManager.js";

// ─── startImport / completeImport ─────────────────────────────────────────────

describe("importQuotaManager.startImport", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    // Clean up any active imports between tests by completing them
    importQuotaManager.completeImport("org1");
    importQuotaManager.completeImport("org2");
  });

  it("first import for an org succeeds", () => {
    expect(importQuotaManager.startImport("org1")).toBe(true);
  });

  it("second concurrent import for same org is blocked", () => {
    importQuotaManager.startImport("org1");
    expect(importQuotaManager.startImport("org1")).toBe(false);
  });

  it("completing import allows next import to start", () => {
    importQuotaManager.startImport("org1");
    importQuotaManager.completeImport("org1");
    expect(importQuotaManager.startImport("org1")).toBe(true);
  });

  it("different orgs can import concurrently", () => {
    expect(importQuotaManager.startImport("org1")).toBe(true);
    expect(importQuotaManager.startImport("org2")).toBe(true);
  });

  it("timed-out import (> 2 hours) allows new import to start", () => {
    importQuotaManager.startImport("org1");

    // Advance time past the 2-hour import timeout
    vi.advanceTimersByTime(2 * 60 * 60 * 1000 + 1);

    // Now a new import should be allowed
    expect(importQuotaManager.startImport("org1")).toBe(true);
  });
});

// ─── cleanup ──────────────────────────────────────────────────────────────────

describe("importQuotaManager.cleanup", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    importQuotaManager.completeImport("org-cleanup");
  });

  it("cleanup removes timed-out active imports", () => {
    importQuotaManager.startImport("org-cleanup");

    // Advance past the 2-hour import timeout
    vi.advanceTimersByTime(2 * 60 * 60 * 1000 + 1);

    importQuotaManager.cleanup();

    // After cleanup, a new import for the same org should be allowed
    expect(importQuotaManager.startImport("org-cleanup")).toBe(true);
  });
});
