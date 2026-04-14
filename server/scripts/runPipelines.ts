// server/scripts/runPipelines.ts
// Usage: cd server && SITE_ID=42 npx tsx scripts/runPipelines.ts
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { eq, desc } from "drizzle-orm";
import { db } from "../src/db/postgres/postgres.js";
import { anomalyAlerts, aiReports, sites } from "../src/db/postgres/schema.js";
import { anomalyDetectionService } from "../src/services/anomalyDetection/anomalyDetectionService.js";
import { aiReportService } from "../src/services/aiReports/aiReportService.js";

const SITE_ID = Number(process.env.SITE_ID ?? "0");
if (!SITE_ID) {
  console.error("ERROR: Set SITE_ID env var");
  console.error("Usage: SITE_ID=42 npx tsx scripts/runPipelines.ts");
  process.exit(1);
}

async function main() {
  // Look up site
  const [site] = await db
    .select({ domain: sites.domain, name: sites.name })
    .from(sites)
    .where(eq(sites.siteId, SITE_ID))
    .limit(1);

  if (!site) {
    console.error(`ERROR: Site ${SITE_ID} not found in DB`);
    process.exit(1);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Pipeline Runner — site ${SITE_ID} (${site.domain})`);
  console.log(`${"=".repeat(60)}\n`);

  // ── 1. Anomaly detection + custom alerts ───────────────────────────────────
  console.log("▶ Running anomaly detection + custom alerts...\n");
  await anomalyDetectionService.runForSite(SITE_ID);

  const alerts = await db
    .select()
    .from(anomalyAlerts)
    .where(eq(anomalyAlerts.siteId, SITE_ID))
    .orderBy(desc(anomalyAlerts.detectedAt))
    .limit(10);

  if (alerts.length === 0) {
    console.log("  No alerts. Check that yesterday has ≥30% drop vs 7-day baseline.");
    console.log("  Run the seeder first: SITE_ID=<id> npx tsx scripts/seedTestData.ts\n");
  } else {
    console.log(`  Last ${alerts.length} alert(s):\n`);
    for (const a of alerts) {
      const source = a.ruleId ? `[custom rule #${a.ruleId}]` : "[system anomaly]";
      const sign = a.percentChange > 0 ? "+" : "";
      console.log(
        `  ${source} ${a.metric}: ${sign}${Number(a.percentChange).toFixed(1)}% | ` +
        `severity=${a.severity} | detected=${a.detectedAt}`
      );
    }
    console.log();
  }

  // ── 2. AI report (weekly) ──────────────────────────────────────────────────
  console.log("▶ Running AI report (weekly cadence)...\n");
  await aiReportService.runForSite(SITE_ID, "weekly");

  const reports = await db
    .select()
    .from(aiReports)
    .where(eq(aiReports.siteId, SITE_ID))
    .orderBy(desc(aiReports.updatedAt))
    .limit(3);

  if (reports.length === 0) {
    console.log("  No reports. Site needs ≥7 days of data.\n");
  } else {
    console.log(`  Last ${reports.length} report(s):\n`);
    for (const r of reports) {
      console.log(`  [${r.cadence}] status=${r.status} | period: ${r.periodStart} → ${r.periodEnd}`);
      if (r.status === "complete" && r.structuredSummaryJson) {
        const rawJson = r.structuredSummaryJson;
        const s: Record<string, any> = typeof rawJson === "string"
          ? JSON.parse(rawJson)
          : (rawJson as Record<string, any>);
        const ov = s["overview"] as Record<string, any> | undefined;
        console.log(`    Sessions: ${ov?.["sessions"] ?? "(no data)"} | Pageviews: ${ov?.["pageviews"] ?? "(no data)"}`);
        const summary = s["summary"] as string | undefined;
        if (summary) {
          console.log(`    Summary: ${summary.slice(0, 120)}${summary.length > 120 ? "..." : ""}`);
        }
        const highlights = s["highlights"] as Array<Record<string, string>> | undefined;
        if (highlights?.length) {
          console.log(
            `    Highlights (${highlights.length}): ` +
            highlights.map((h) => `[${h["type"]}] ${h["metric"]}`).join(", ")
          );
        }
        const recs = s["recommendations"] as string[] | undefined;
        if (recs?.length) {
          console.log(`    Recommendations (${recs.length}): ${recs[0].slice(0, 80)}${recs[0].length > 80 ? "..." : ""}`);
        }
      } else if (r.status === "failed") {
        console.log(`    Error: ${r.errorMessage}`);
        console.log(`    Check: OPENROUTER_API_KEY in server/.env, site has ≥7 days data`);
      } else if (r.status === "generating") {
        console.log(`    Still generating...`);
      }
      console.log();
    }
  }

  console.log("=".repeat(60));
  console.log("Done");
  console.log("=".repeat(60) + "\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("Pipeline runner failed:", err);
  process.exit(1);
});
