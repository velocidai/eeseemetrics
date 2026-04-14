import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../../src/db/postgres/postgres.js";
import {
  organization,
  user,
  member,
  sites,
  anomalyAlerts,
  aiReports,
} from "../../src/db/postgres/schema.js";

// Use a short random suffix to avoid collisions between test runs
function testId() {
  return randomUUID().slice(0, 8);
}

export interface TestContext {
  orgId: string;
  userId: string;
  siteId: number;
  userEmail: string;
}

/**
 * Creates a test org + user + member + site.
 * planOverride bypasses Stripe so tier checks work without a real subscription.
 */
export async function createTestContext(
  planOverride: "starter100k" | "pro100k" | "scale100k" = "pro100k"
): Promise<TestContext> {
  const id = testId();
  const orgId = `test-org-${id}`;
  const userId = `test-user-${id}`;
  const userEmail = `test-${id}@eesee-test.invalid`;

  // organization has no updatedAt column
  await db.insert(organization).values({
    id: orgId,
    name: `Test Org ${id}`,
    slug: `test-org-${id}`,
    createdAt: new Date().toISOString(),
    planOverride,
  });

  await db.insert(user).values({
    id: userId,
    name: `Test User ${id}`,
    email: userEmail,
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    role: "user",
  });

  await db.insert(member).values({
    id: `test-member-${id}`,
    userId,
    organizationId: orgId,
    role: "owner",
    createdAt: new Date().toISOString(),
  });

  const [insertedSite] = await db
    .insert(sites)
    .values({
      name: `Test Site ${id}`,
      domain: `test-${id}.eesee-test.invalid`,
      organizationId: orgId,
      createdBy: userId,
      public: false,
      saltUserIds: false,
      blockBots: false,
      apiKey: `testkey-${randomUUID().replace(/-/g, "").slice(0, 24)}`,
      privateLinkKey: randomUUID().replace(/-/g, "").slice(0, 12),
    })
    .returning({ siteId: sites.siteId });

  return {
    orgId,
    userId,
    siteId: insertedSite.siteId,
    userEmail,
  };
}

/**
 * Removes all test records created by createTestContext.
 * Call this in afterAll.
 */
export async function cleanupTestContext(ctx: TestContext): Promise<void> {
  // Delete in reverse dependency order
  await db.delete(anomalyAlerts).where(eq(anomalyAlerts.siteId, ctx.siteId)).catch(() => {});
  await db.delete(aiReports).where(eq(aiReports.siteId, ctx.siteId)).catch(() => {});
  await db.delete(sites).where(eq(sites.siteId, ctx.siteId)).catch(() => {});
  await db.delete(member).where(eq(member.userId, ctx.userId)).catch(() => {});
  await db.delete(user).where(eq(user.id, ctx.userId)).catch(() => {});
  await db.delete(organization).where(eq(organization.id, ctx.orgId)).catch(() => {});
}
