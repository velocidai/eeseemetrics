// server/src/services/aiReports/aiReportService.test.ts
// Integration test — requires real ClickHouse data + OPENROUTER_API_KEY
// Usage: SITE_ID=42 npx vitest run src/services/aiReports/aiReportService.test.ts
import { describe, it, expect, beforeAll } from "vitest";
import { eq, desc } from "drizzle-orm";
import { db } from "../../db/postgres/postgres.js";
import { aiReports } from "../../db/postgres/schema.js";
import { aiReportService } from "./aiReportService.js";
import type { AiReportStructuredSummary, ReportHighlight } from "./aiReportTypes.js";

const SITE_ID = Number(process.env.SITE_ID ?? "0");

describe.skipIf(!SITE_ID)(
  "aiReportService.runForSite (integration — real OpenRouter)",
  () => {
    beforeAll(async () => {
      // Delete existing reports to force regeneration
      await db.delete(aiReports).where(eq(aiReports.siteId, SITE_ID));
    });

    it(
      "generates a complete weekly report with valid AiReportStructuredSummary shape",
      async () => {
        await aiReportService.runForSite(SITE_ID, "weekly");

        const [report] = await db
          .select()
          .from(aiReports)
          .where(eq(aiReports.siteId, SITE_ID))
          .orderBy(desc(aiReports.updatedAt))
          .limit(1);

        // Report must exist
        expect(report, "Report row should exist in DB after runForSite").toBeDefined();

        // Print status for debugging
        console.log(`\nReport status: ${report.status}`);
        if (report.status === "failed") {
          console.log(`Error: ${report.errorMessage}`);
          console.log("Troubleshooting:");
          console.log("  1. Check OPENROUTER_API_KEY is set in server/.env");
          console.log("  2. Check site has ≥7 days of ClickHouse data (run seedTestData.ts)");
        }

        expect(report.status, `Report failed: ${report.errorMessage}`).toBe("complete");
        expect(report.errorMessage).toBeNull();

        const summary = report.structuredSummaryJson as AiReportStructuredSummary;
        expect(summary, "structuredSummaryJson should be a non-null object").toBeTruthy();

        // Period
        expect(summary.period.cadence).toBe("weekly");
        expect(typeof summary.period.start).toBe("string");
        expect(typeof summary.period.end).toBe("string");
        expect(summary.period.start.length).toBeGreaterThan(0);

        // Overview — computed in TypeScript, never from LLM
        expect(summary.overview.sessions).toBeGreaterThan(0);
        expect(summary.overview.pageviews).toBeGreaterThan(0);
        expect(summary.overview.uniqueVisitors).toBeGreaterThan(0);
        expect(typeof summary.overview.avgSessionDuration).toBe("number");
        // pageviewsChange may be null if no prior data, but must be number or null
        expect(
          summary.overview.pageviewsChange === null || typeof summary.overview.pageviewsChange === "number"
        ).toBe(true);

        // Top lists — must have entries
        expect(Array.isArray(summary.topPages)).toBe(true);
        expect(summary.topPages.length).toBeGreaterThan(0);
        expect(summary.topPages[0]).toHaveProperty("page");
        expect(typeof summary.topPages[0].sessions).toBe("number");
        expect(typeof summary.topPages[0].percentage).toBe("number");

        expect(Array.isArray(summary.topCountries)).toBe(true);
        expect(summary.topCountries.length).toBeGreaterThan(0);

        expect(Array.isArray(summary.topReferrers)).toBe(true);
        expect(Array.isArray(summary.deviceBreakdown)).toBe(true);
        expect(summary.deviceBreakdown.length).toBeGreaterThan(0);

        // LLM text fields — non-empty strings
        expect(typeof summary.summary).toBe("string");
        expect(summary.summary.trim().length).toBeGreaterThan(20);

        expect(Array.isArray(summary.highlights)).toBe(true);
        expect(summary.highlights.length).toBeGreaterThan(0);
        for (const h of summary.highlights as ReportHighlight[]) {
          expect(["positive", "negative", "neutral"]).toContain(h.type);
          expect(typeof h.metric).toBe("string");
          expect(h.metric.length).toBeGreaterThan(0);
          expect(typeof h.observation).toBe("string");
          expect(h.observation.length).toBeGreaterThan(0);
        }

        expect(Array.isArray(summary.recommendations)).toBe(true);
        expect(summary.recommendations.length).toBeGreaterThan(0);
        for (const r of summary.recommendations) {
          expect(typeof r).toBe("string");
          expect(r.trim().length).toBeGreaterThan(10);
        }

        // Print full output for manual review
        console.log("\n── AI Report Output ──────────────────────────────────");
        console.log(`Period:     ${summary.period.start} → ${summary.period.end}`);
        console.log(`Sessions:   ${summary.overview.sessions}`);
        console.log(`Pageviews:  ${summary.overview.pageviews}`);
        console.log(`Visitors:   ${summary.overview.uniqueVisitors}`);
        console.log(`Bounce:     ${summary.overview.bounceRate ?? "n/a"}%`);
        console.log(`\nSummary:\n${summary.summary}`);
        console.log(`\nHighlights (${summary.highlights.length}):`);
        for (const h of summary.highlights as ReportHighlight[]) {
          console.log(`  [${h.type}] ${h.metric}: ${h.observation}`);
        }
        console.log(`\nRecommendations (${summary.recommendations.length}):`);
        for (const r of summary.recommendations) {
          console.log(`  • ${r}`);
        }
        console.log("──────────────────────────────────────────────────────\n");
      },
      60_000 // 60-second timeout for real LLM call
    );
  }
);
