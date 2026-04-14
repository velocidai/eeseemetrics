import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Hoisted mocks (accessible inside vi.mock factories) ──────────────────────

const { mockDb, mockAuth, mockSiteConfig } = vi.hoisted(() => ({
  mockDb: {
    select: vi.fn(),
    query: { member: { findFirst: vi.fn() } },
  },
  mockAuth: {
    api: {
      getSession: vi.fn(),
      verifyApiKey: vi.fn(),
    },
  },
  mockSiteConfig: {
    getConfig: vi.fn(),
    isIPExcluded: vi.fn(),
    isCountryExcluded: vi.fn(),
  },
}));

vi.mock("./logger/logger.js", () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
  createServiceLogger: () => ({ warn: vi.fn(), info: vi.fn(), error: vi.fn() }),
}));

vi.mock("node-cache", () => ({
  default: class {
    private store = new Map<string, any>();
    get(key: string) { return this.store.get(key); }
    set(key: string, value: any) { this.store.set(key, value); return true; }
    del(key: string) { this.store.delete(key); return 1; }
  },
}));

vi.mock("../db/postgres/postgres.js", () => ({ db: mockDb }));
vi.mock("../db/postgres/schema.js", () => ({
  member: { userId: "userId", organizationId: "organizationId", id: "id", role: "role", hasRestrictedSiteAccess: "hasRestrictedSiteAccess" },
  memberSiteAccess: { siteId: "siteId", memberId: "memberId" },
  sites: { siteId: "siteId", organizationId: "organizationId" },
  user: { id: "id", role: "role" },
}));

vi.mock("./auth.js", () => ({ auth: mockAuth }));
vi.mock("./siteConfig.js", () => ({ siteConfig: mockSiteConfig }));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((...args: any[]) => args),
  and: vi.fn((...args: any[]) => args),
  inArray: vi.fn((...args: any[]) => args),
}));

import { mapHeaders, getUserHasAccessToSite, getUserHasAccessToSitePublic } from "./auth-utils.js";

// ─── mapHeaders ───────────────────────────────────────────────────────────────

describe("mapHeaders", () => {
  it("converts object entries to a Map", () => {
    const result = mapHeaders({ "content-type": "application/json", accept: "text/html" });
    expect(result.get("content-type")).toBe("application/json");
    expect(result.get("accept")).toBe("text/html");
  });

  it("excludes null values", () => {
    const result = mapHeaders({ "x-null": null, "x-valid": "yes" });
    expect(result.has("x-null")).toBe(false);
    expect(result.get("x-valid")).toBe("yes");
  });

  it("excludes undefined values", () => {
    const result = mapHeaders({ "x-undef": undefined, "x-ok": "ok" });
    expect(result.has("x-undef")).toBe(false);
  });

  it("returns empty map for empty object", () => {
    expect(mapHeaders({}).size).toBe(0);
  });
});

// ─── getUserHasAccessToSite ───────────────────────────────────────────────────

function makeReq(headers = {}): any {
  return { headers };
}

describe("getUserHasAccessToSite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false when no session exists", async () => {
    mockAuth.api.getSession.mockResolvedValue(null);
    const result = await getUserHasAccessToSite(makeReq(), 1);
    expect(result).toBe(false);
  });

  it("returns true when user has access to the site", async () => {
    mockAuth.api.getSession.mockResolvedValue({ user: { id: "u2" } });

    // In Promise.all, the two calls start concurrently:
    // 1. getIsUserAdmin → getSession (async) → then db.select for user role
    // 2. db.select for member records (synchronous start)
    // So actual db.select call order: member (1st), user role (2nd), then sites (3rd)
    mockDb.select
      .mockImplementationOnce(() => ({
        // call 1: member records
        from: () => ({ where: () => Promise.resolve([{ organizationId: "org1", role: "owner", hasRestrictedSiteAccess: false }]) }),
      }))
      .mockImplementationOnce(() => ({
        // call 2: user role check (inside getIsUserAdmin)
        from: () => ({ where: () => ({ limit: () => Promise.resolve([{ role: "user" }]) }) }),
      }))
      .mockImplementationOnce(() => ({
        // call 3: sites for org
        from: () => ({ where: () => Promise.resolve([{ siteId: 1, organizationId: "org1" }]) }),
      }));

    const result = await getUserHasAccessToSite(makeReq(), 1);
    expect(result).toBe(true);
  });

  it("returns false when user has no member records", async () => {
    mockAuth.api.getSession.mockResolvedValue({ user: { id: "u3" } });

    // member records first, then user role check
    mockDb.select
      .mockImplementationOnce(() => ({
        from: () => ({ where: () => Promise.resolve([]) }), // member records: empty
      }))
      .mockImplementationOnce(() => ({
        from: () => ({ where: () => ({ limit: () => Promise.resolve([{ role: "user" }]) }) }), // user role
      }));

    const result = await getUserHasAccessToSite(makeReq(), 1);
    expect(result).toBe(false);
  });
});

// ─── getUserHasAccessToSitePublic ─────────────────────────────────────────────

describe("getUserHasAccessToSitePublic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true for a public site even without auth", async () => {
    mockAuth.api.getSession.mockResolvedValue(null);
    mockSiteConfig.getConfig.mockResolvedValue({ siteId: 5, public: true, privateLinkKey: null });
    mockAuth.api.verifyApiKey.mockResolvedValue({ valid: false });

    const result = await getUserHasAccessToSitePublic(makeReq(), 5);
    expect(result).toBe(true);
  });

  it("returns false for a private site without auth", async () => {
    mockAuth.api.getSession.mockResolvedValue(null);
    mockSiteConfig.getConfig.mockResolvedValue({ siteId: 5, public: false, privateLinkKey: null });
    mockAuth.api.verifyApiKey.mockResolvedValue({ valid: false });

    const result = await getUserHasAccessToSitePublic(makeReq(), 5);
    expect(result).toBe(false);
  });

  it("returns true when valid private key header is provided", async () => {
    mockAuth.api.getSession.mockResolvedValue(null);
    mockSiteConfig.getConfig.mockResolvedValue({
      siteId: 5,
      public: false,
      privateLinkKey: "secret-key-abc",
    });
    mockAuth.api.verifyApiKey.mockResolvedValue({ valid: false });

    const req = makeReq({ "x-private-key": "secret-key-abc" });
    const result = await getUserHasAccessToSitePublic(req, 5);
    expect(result).toBe(true);
  });

  it("returns false when private key does not match", async () => {
    mockAuth.api.getSession.mockResolvedValue(null);
    mockSiteConfig.getConfig.mockResolvedValue({
      siteId: 5,
      public: false,
      privateLinkKey: "secret-key-abc",
    });
    mockAuth.api.verifyApiKey.mockResolvedValue({ valid: false });

    const req = makeReq({ "x-private-key": "wrong-key" });
    const result = await getUserHasAccessToSitePublic(req, 5);
    expect(result).toBe(false);
  });
});
