import { FastifyReply, FastifyRequest } from "fastify";
import { and, count, eq } from "drizzle-orm";
import { db } from "../../db/postgres/postgres.js";
import { organization } from "../../db/postgres/schema.js";

const LTD_TOTAL_SLOTS: Record<number, number> = {
  1: 150,
  2: 100,
  3: 50,
};

export async function getLtdSlots(_request: FastifyRequest, reply: FastifyReply) {
  try {
    const rows = await db
      .select({
        tier: organization.ltdTier,
        sold: count(),
      })
      .from(organization)
      .where(eq(organization.ltdActive, true))
      .groupBy(organization.ltdTier);

    const soldMap: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
    for (const row of rows) {
      if (row.tier && [1, 2, 3].includes(row.tier)) {
        soldMap[row.tier] = Number(row.sold);
      }
    }

    return reply.send({
      tier1: { total: LTD_TOTAL_SLOTS[1], sold: soldMap[1], remaining: Math.max(0, LTD_TOTAL_SLOTS[1] - soldMap[1]) },
      tier2: { total: LTD_TOTAL_SLOTS[2], sold: soldMap[2], remaining: Math.max(0, LTD_TOTAL_SLOTS[2] - soldMap[2]) },
      tier3: { total: LTD_TOTAL_SLOTS[3], sold: soldMap[3], remaining: Math.max(0, LTD_TOTAL_SLOTS[3] - soldMap[3]) },
    });
  } catch (error: any) {
    console.error("[ltd] Failed to query slot counts:", error.message);
    return reply.status(500).send({ error: "Failed to fetch slot counts." });
  }
}
