import * as cron from "node-cron";
import { DateTime } from "luxon";
import { and, eq } from "drizzle-orm";
import SqlString from "sqlstring";
import { db } from "../../db/postgres/postgres.js";
import { organization, sites, aiReports, goals, gscConnections } from "../../db/postgres/schema.js";
import { clickhouse } from "../../db/clickhouse/clickhouse.js";
import { processResults, patternToRegex } from "../../api/analytics/utils/utils.js";
import { refreshGSCToken } from "../../api/gsc/utils.js";
import { callOpenRouter } from "../../lib/openrouter.js";
import { createServiceLogger } from "../../lib/logger/logger.js";
import { IS_CLOUD } from "../../lib/const.js";
import { getPlanTier } from "../../lib/tierUtils.js";
import { getBestSubscription } from "../../lib/subscriptionUtils.js";
import { buildAiReportMessages, parseLlmTextOutput } from "./aiReportPrompt.js";
import { getPeriodDates } from "./aiReportHelpers.js";
import {
  type ReportCadence,
  type AiReportStructuredSummary,
  type LlmTextOutput,
  MIN_DATA_DAYS,
  pctChange,
} from "./aiReportTypes.js";
import {
  fetchPageMovers,
  fetchChannelMix,
  fetchCampaignsForReport,
  fetchEntryNextPages,
  fetchPeakTrafficWindow,
} from "./aiReportScaleQueries.js";
import { getTrendPeriods } from "./aiReportHelpers.js";
import type {
  ScaleEnrichment,
  GoalTrend,
  TrendPoint,
} from "./aiReportTypes.js";
import type { OverviewData, MetricData } from "../weekyReports/weeklyReportTypes.js";

// ---------------------------------------------------------------------------
// Pure helper: build the full AiReportStructuredSummary from computed data
// + LLM-generated text. Numbers are NEVER sourced from the LLM.
// ---------------------------------------------------------------------------

function buildStructuredSummary(opts: {
  cadence: ReportCadence;
  periodStart: string;
  periodEnd: string;
  current: OverviewData;
  previous: OverviewData | null;
  topPages: MetricData[];
  topReferrers: MetricData[];
  topCountries: MetricData[];
  deviceBreakdown: MetricData[];
  goals?: Array<{ name: string; conversions: number; rate: number }>;
  newVsReturning?: { newVisitors: number; returningVisitors: number; newPercentage: number };
  gscTopQueries?: Array<{ query: string; clicks: number; impressions: number; position: number }>;
  scaleEnrichment?: ScaleEnrichment;
  llmText: LlmTextOutput;
}): AiReportStructuredSummary {
  const { cadence, periodStart, periodEnd, current, previous, topPages, topReferrers, topCountries, deviceBreakdown, llmText } = opts;

  return {
    period: { start: periodStart, end: periodEnd, cadence },
    overview: {
      pageviews: current.pageviews,
      sessions: current.sessions,
      uniqueVisitors: current.users,
      bounceRate: current.bounce_rate ?? null,
      avgSessionDuration: current.session_duration,
      pageviewsChange: pctChange(current.pageviews, previous?.pageviews),
      sessionsChange: pctChange(current.sessions, previous?.sessions),
      usersChange: pctChange(current.users, previous?.users),
      bounceRateChange:
        current.bounce_rate != null && previous?.bounce_rate != null
          ? pctChange(current.bounce_rate, previous.bounce_rate)
          : null,
    },
    topPages: topPages.map(i => ({ page: i.value, sessions: i.count, percentage: i.percentage ?? 0 })),
    topReferrers: topReferrers.map(i => ({ referrer: i.value, sessions: i.count, percentage: i.percentage ?? 0 })),
    topCountries: topCountries.map(i => ({ country: i.value, sessions: i.count, percentage: i.percentage ?? 0 })),
    deviceBreakdown: deviceBreakdown.map(i => ({ device: i.value, sessions: i.count, percentage: i.percentage ?? 0 })),
    goals: opts.goals,
    newVsReturning: opts.newVsReturning,
    gscTopQueries: opts.gscTopQueries,
    scaleEnrichment: opts.scaleEnrichment,
    summary: llmText.summary,
    highlights: llmText.highlights,
    recommendations: llmText.recommendations,
  };
}

// ---------------------------------------------------------------------------
// LLM call with retry. On validation failure the error is fed back to the
// model so it can self-correct — max 2 retries (3 total attempts).
// ---------------------------------------------------------------------------

const MAX_LLM_RETRIES = 2;

async function callLlmWithRetry(
  initialMessages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  maxTokens = 600
): Promise<LlmTextOutput> {
  let messages = [...initialMessages];
  let lastError: Error = new Error("Unknown error");

  for (let attempt = 0; attempt <= MAX_LLM_RETRIES; attempt++) {
    let raw = "";
    try {
      raw = await callOpenRouter(messages, { temperature: 0.3, maxTokens });
      return parseLlmTextOutput(raw);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_LLM_RETRIES && raw) {
        // Feed the validation error back so the LLM can self-correct
        messages = [
          ...messages,
          { role: "assistant" as const, content: raw },
          {
            role: "user" as const,
            content: `Your response failed validation: ${lastError.message}. Please fix it and return valid JSON matching the schema exactly.`,
          },
        ];
      }
    }
  }

  throw lastError;
}

const formatDate = (d: DateTime) => d.toFormat("yyyy-MM-dd HH:mm:ss");

class AiReportService {
  private readonly logger = createServiceLogger("ai-report");
  private cronTasks: cron.ScheduledTask[] = [];

  // ---------------------------------------------------------------------------
  // ClickHouse data fetching (mirrors weeklyReportService logic)
  // ---------------------------------------------------------------------------

  private async fetchOverviewData(siteId: number, startDate: string, endDate: string): Promise<OverviewData | null> {
    try {
      const query = `SELECT
        session_stats.sessions,
        session_stats.pages_per_session,
        session_stats.bounce_rate * 100 AS bounce_rate,
        session_stats.session_duration,
        page_stats.pageviews,
        page_stats.users
      FROM (
        SELECT
          COUNT() AS sessions,
          AVG(pages_in_session) AS pages_per_session,
          sumIf(1, pages_in_session = 1) / COUNT() AS bounce_rate,
          AVG(end_time - start_time) AS session_duration
        FROM (
          SELECT
            session_id,
            MIN(timestamp) AS start_time,
            MAX(timestamp) AS end_time,
            COUNT(CASE WHEN type = 'pageview' THEN 1 END) AS pages_in_session
          FROM events
          WHERE site_id = {siteId:Int32}
            AND timestamp >= toDateTime({startDate:String})
            AND timestamp < toDateTime({endDate:String})
          GROUP BY session_id
        )
      ) AS session_stats
      CROSS JOIN (
        SELECT COUNT(*) AS pageviews, COUNT(DISTINCT user_id) AS users
        FROM events
        WHERE site_id = {siteId:Int32}
          AND timestamp >= toDateTime({startDate:String})
          AND timestamp < toDateTime({endDate:String})
          AND type = 'pageview'
      ) AS page_stats`;

      const result = await clickhouse.query({
        query,
        format: "JSONEachRow",
        query_params: { siteId, startDate, endDate },
      });

      const data = await processResults<OverviewData>(result);
      return data[0] ?? null;
    } catch (error) {
      this.logger.error({ error, siteId }, "Error fetching overview data");
      return null;
    }
  }

  private async fetchTopN(
    siteId: number,
    parameter: "country" | "pathname" | "referrer" | "device_type",
    startDate: string,
    endDate: string,
    limit = 5
  ): Promise<MetricData[]> {
    const queries: Record<string, string> = {
      country: `WITH s AS (SELECT country AS value, COUNT(DISTINCT session_id) AS unique_sessions FROM events WHERE site_id={siteId:Int32} AND country IS NOT NULL AND country<>'' AND timestamp>=toDateTime({startDate:String}) AND timestamp<toDateTime({endDate:String}) GROUP BY value) SELECT value, unique_sessions AS count, round(unique_sessions/sum(unique_sessions) OVER()*100,2) AS percentage FROM s ORDER BY count DESC LIMIT {limit:Int32}`,
      pathname: `WITH s AS (SELECT pathname AS value, COUNT(DISTINCT session_id) AS unique_sessions FROM events WHERE site_id={siteId:Int32} AND type='pageview' AND timestamp>=toDateTime({startDate:String}) AND timestamp<toDateTime({endDate:String}) GROUP BY value) SELECT value, unique_sessions AS count, round(unique_sessions/sum(unique_sessions) OVER()*100,2) AS percentage FROM s ORDER BY count DESC LIMIT {limit:Int32}`,
      referrer: `WITH s AS (SELECT domainWithoutWWW(referrer) AS value, COUNT(DISTINCT session_id) AS unique_sessions FROM events WHERE site_id={siteId:Int32} AND domainWithoutWWW(referrer) IS NOT NULL AND domainWithoutWWW(referrer)<>'' AND timestamp>=toDateTime({startDate:String}) AND timestamp<toDateTime({endDate:String}) GROUP BY value) SELECT value, unique_sessions AS count, round(unique_sessions/sum(unique_sessions) OVER()*100,2) AS percentage FROM s ORDER BY count DESC LIMIT {limit:Int32}`,
      device_type: `WITH s AS (SELECT device_type AS value, COUNT(DISTINCT session_id) AS unique_sessions FROM events WHERE site_id={siteId:Int32} AND device_type IS NOT NULL AND device_type<>'' AND timestamp>=toDateTime({startDate:String}) AND timestamp<toDateTime({endDate:String}) GROUP BY value) SELECT value, unique_sessions AS count, round(unique_sessions/sum(unique_sessions) OVER()*100,2) AS percentage FROM s ORDER BY count DESC LIMIT {limit:Int32}`,
    };

    try {
      const result = await clickhouse.query({
        query: queries[parameter],
        format: "JSONEachRow",
        query_params: { siteId, startDate, endDate, limit },
      });
      return await processResults<MetricData>(result);
    } catch (error) {
      this.logger.error({ error, siteId, parameter }, "Error fetching top-N data");
      return [];
    }
  }

  /**
   * Returns the number of distinct calendar days with at least one pageview for the site.
   * Used to gate report generation: if we don't have enough history we skip silently.
   */
  private async countDaysWithData(siteId: number): Promise<number> {
    try {
      const result = await clickhouse.query({
        query: `SELECT COUNT(DISTINCT toDate(timestamp)) AS days FROM events WHERE site_id = {siteId:Int32} AND type = 'pageview'`,
        format: "JSONEachRow",
        query_params: { siteId },
      });
      const rows = await processResults<{ days: number }>(result);
      return rows[0]?.days ?? 0;
    } catch (error) {
      this.logger.error({ error, siteId }, "Error counting days with data");
      return 0;
    }
  }

  private async fetchGoalConversions(
    siteId: number,
    startDate: string,
    endDate: string
  ): Promise<Array<{ name: string; conversions: number; rate: number }> | undefined> {
    try {
      const siteGoals = await db.select().from(goals).where(eq(goals.siteId, siteId));
      if (!siteGoals.length) return undefined;

      const clauses: string[] = [];
      for (const goal of siteGoals) {
        if (goal.goalType === "path" && goal.config.pathPattern) {
          const regex = patternToRegex(goal.config.pathPattern);
          clauses.push(
            `COUNT(DISTINCT IF(type='pageview' AND match(pathname, ${SqlString.escape(regex)}), session_id, NULL)) AS g${goal.goalId}`
          );
        } else if (goal.goalType === "event" && goal.config.eventName) {
          clauses.push(
            `COUNT(DISTINCT IF(type='custom_event' AND event_name=${SqlString.escape(goal.config.eventName)}, session_id, NULL)) AS g${goal.goalId}`
          );
        }
      }
      if (!clauses.length) return undefined;

      const totalQ = `SELECT COUNT(DISTINCT session_id) AS total FROM events WHERE site_id = ${SqlString.escape(siteId)} AND timestamp >= toDateTime(${SqlString.escape(startDate)}) AND timestamp < toDateTime(${SqlString.escape(endDate)})`;
      const convQ = `SELECT ${clauses.join(", ")} FROM events WHERE site_id = ${SqlString.escape(siteId)} AND timestamp >= toDateTime(${SqlString.escape(startDate)}) AND timestamp < toDateTime(${SqlString.escape(endDate)})`;

      const [totalRes, convRes] = await Promise.all([
        clickhouse.query({ query: totalQ, format: "JSONEachRow" }),
        clickhouse.query({ query: convQ, format: "JSONEachRow" }),
      ]);
      const [totalRows, convRows] = await Promise.all([
        totalRes.json<{ total: number }>(),
        convRes.json<Record<string, number>>(),
      ]);

      const total = Number(totalRows[0]?.total ?? 0);
      if (total === 0) return undefined;
      const convData = convRows[0] ?? {};

      return siteGoals
        .filter(g => clauses.some(c => c.includes(`g${g.goalId}`)))
        .map(g => {
          const cnt = Number(convData[`g${g.goalId}`] ?? 0);
          const label = g.name ?? g.config.pathPattern ?? g.config.eventName ?? `Goal ${g.goalId}`;
          return { name: label, conversions: cnt, rate: total > 0 ? (cnt / total) * 100 : 0 };
        });
    } catch (error) {
      this.logger.warn({ error, siteId }, "Failed to fetch goal conversions for report — skipping");
      return undefined;
    }
  }

  private async fetchNewVsReturning(
    siteId: number,
    startDate: string,
    endDate: string
  ): Promise<{ newVisitors: number; returningVisitors: number; newPercentage: number } | undefined> {
    try {
      const query = `
        SELECT
          countIf(first_seen >= toDateTime({startDate:String})) AS new_visitors,
          countIf(first_seen < toDateTime({startDate:String}))  AS returning_visitors
        FROM (
          SELECT user_id, MIN(timestamp) AS first_seen
          FROM events
          WHERE site_id = {siteId:Int32} AND type = 'pageview'
          GROUP BY user_id
        )
        WHERE user_id IN (
          SELECT DISTINCT user_id FROM events
          WHERE site_id = {siteId:Int32}
            AND type = 'pageview'
            AND timestamp >= toDateTime({startDate:String})
            AND timestamp < toDateTime({endDate:String})
        )
      `;
      const result = await clickhouse.query({
        query,
        format: "JSONEachRow",
        query_params: { siteId, startDate, endDate },
      });
      const rows = await result.json<{ new_visitors: number; returning_visitors: number }>();
      const row = rows[0];
      if (!row) return undefined;
      const newV = Number(row.new_visitors);
      const retV = Number(row.returning_visitors);
      const total = newV + retV;
      if (total === 0) return undefined;
      return {
        newVisitors: newV,
        returningVisitors: retV,
        newPercentage: (newV / total) * 100,
      };
    } catch (error) {
      this.logger.warn({ error, siteId }, "Failed to fetch new vs returning for report — skipping");
      return undefined;
    }
  }

  private async fetchGscTopQueries(
    siteId: number,
    startDate: string,
    endDate: string
  ): Promise<Array<{ query: string; clicks: number; impressions: number; position: number }> | undefined> {
    try {
      const [connection] = await db.select().from(gscConnections).where(eq(gscConnections.siteId, siteId));
      if (!connection) return undefined;

      const accessToken = await refreshGSCToken(siteId);
      if (!accessToken) return undefined;

      const response = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(connection.gscPropertyUrl)}/searchAnalytics/query`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ startDate, endDate, dimensions: ["query"], rowLimit: 10 }),
        }
      );
      if (!response.ok) return undefined;

      const data = await response.json() as { rows?: Array<{ keys: string[]; clicks: number; impressions: number; position: number }> };
      if (!data.rows?.length) return undefined;

      return data.rows.map(r => ({
        query: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        position: r.position,
      }));
    } catch (error) {
      this.logger.warn({ error, siteId }, "Failed to fetch GSC data for report — skipping");
      return undefined;
    }
  }

  // ---------------------------------------------------------------------------
  // Report generation for a single site
  // ---------------------------------------------------------------------------

  private async generateAndSaveSiteReport(
    siteId: number,
    siteDomain: string,
    siteName: string,
    cadence: ReportCadence,
    isScale = false
  ): Promise<void> {
    const now = DateTime.utc();
    const { periodStart, periodEnd, prevPeriodStart, prevPeriodEnd } = getPeriodDates(cadence, now);

    const startStr = formatDate(periodStart);
    const endStr = formatDate(periodEnd);
    const prevStartStr = formatDate(prevPeriodStart);
    const prevEndStr = formatDate(prevPeriodEnd);

    // Check data sufficiency
    const daysWithData = await this.countDaysWithData(siteId);
    if (daysWithData < MIN_DATA_DAYS[cadence]) {
      this.logger.info(
        { siteId, cadence, daysWithData, required: MIN_DATA_DAYS[cadence] },
        "Skipping — not enough data for report cadence"
      );
      return;
    }

    // Avoid duplicate reports for the same period
    const existing = await db
      .select({ id: aiReports.id })
      .from(aiReports)
      .where(
        and(
          eq(aiReports.siteId, siteId),
          eq(aiReports.cadence, cadence),
          eq(aiReports.periodStart, startStr)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      this.logger.info({ siteId, cadence }, "Report already exists for this period, skipping");
      return;
    }

    // Insert a placeholder row so we can track the generation attempt
    const [row] = await db
      .insert(aiReports)
      .values({
        siteId,
        cadence,
        periodStart: startStr,
        periodEnd: endStr,
        status: "generating",
      })
      .returning({ id: aiReports.id });

    const reportId = row.id;

    try {
      const [current, previous, topPages, topReferrers, topCountries, deviceBreakdown, goalConversions, newVsReturning, gscTopQueries] = await Promise.all([
        this.fetchOverviewData(siteId, startStr, endStr),
        this.fetchOverviewData(siteId, prevStartStr, prevEndStr),
        this.fetchTopN(siteId, "pathname", startStr, endStr),
        this.fetchTopN(siteId, "referrer", startStr, endStr),
        this.fetchTopN(siteId, "country", startStr, endStr),
        this.fetchTopN(siteId, "device_type", startStr, endStr),
        this.fetchGoalConversions(siteId, startStr, endStr),
        this.fetchNewVsReturning(siteId, startStr, endStr),
        this.fetchGscTopQueries(siteId, startStr, endStr),
      ]);

      if (!current || current.pageviews === 0) {
        await db
          .update(aiReports)
          .set({ status: "failed", errorMessage: "No pageviews in period", updatedAt: DateTime.utc().toISO() })
          .where(eq(aiReports.id, reportId));
        return;
      }

      // Scale-only enrichment — fetched in parallel, each fails silently
      let scaleEnrichment: ScaleEnrichment | undefined;
      if (isScale) {
        const [
          pageMovers,
          channelMix,
          campaigns,
          entryNextPages,
          peakTrafficWindow,
          prevGoalConversions,
        ] = await Promise.all([
          fetchPageMovers(siteId, startStr, endStr, prevStartStr, prevEndStr),
          fetchChannelMix(siteId, startStr, endStr, prevStartStr, prevEndStr),
          fetchCampaignsForReport(siteId, startStr, endStr),
          fetchEntryNextPages(siteId, startStr, endStr),
          fetchPeakTrafficWindow(siteId, startStr, endStr),
          goalConversions
            ? this.fetchGoalConversions(siteId, prevStartStr, prevEndStr)
            : Promise.resolve(undefined),
        ]);

        // Trend history — reuses fetchOverviewData for N prior periods
        const trendPeriods = getTrendPeriods(cadence, periodStart);
        let trendHistory: TrendPoint[] | undefined;
        if (trendPeriods.length >= 2) {
          const points = await Promise.all(
            trendPeriods.map(async ({ start, end }) => {
              const ov = await this.fetchOverviewData(siteId, formatDate(start), formatDate(end));
              if (!ov) return null;
              return {
                periodStart: start.toISODate() ?? "",
                periodEnd: end.toISODate() ?? "",
                sessions: ov.sessions,
                pageviews: ov.pageviews,
                bounceRate: ov.bounce_rate ?? null,
              } as TrendPoint;
            })
          );
          const valid = points.filter((p): p is TrendPoint => p !== null);
          if (valid.length >= 2) trendHistory = valid;
        }

        // Goal trends — diff current vs prev period conversion rates
        let goalTrends: GoalTrend[] | undefined;
        if (goalConversions && prevGoalConversions) {
          goalTrends = goalConversions.map(g => {
            const prev = prevGoalConversions.find(p => p.name === g.name);
            return {
              name: g.name,
              conversions: g.conversions,
              rate: g.rate,
              prevConversions: prev?.conversions ?? 0,
              prevRate: prev?.rate ?? 0,
              rateChange: prev ? pctChange(g.rate, prev.rate) : null,
            };
          });
        }

        scaleEnrichment = {
          pageMovers,
          channelMix,
          campaigns: campaigns ?? undefined,
          entryNextPages,
          peakTrafficWindow,
          trendHistory,
          goalTrends,
        };
      }

      const messages = buildAiReportMessages({
        siteDomain,
        cadence,
        periodStart: periodStart.toISO() ?? startStr,
        periodEnd: periodEnd.toISO() ?? endStr,
        current,
        previous,
        topPages,
        topReferrers,
        topCountries,
        deviceBreakdown,
        goals: goalConversions ?? undefined,
        newVsReturning: newVsReturning ?? undefined,
        gscTopQueries: gscTopQueries ?? undefined,
        scaleEnrichment: scaleEnrichment ?? undefined,
        isScale,
      });

      // LLM produces text only — numbers are computed above in TypeScript
      const llmText = await callLlmWithRetry(messages, isScale ? 1200 : 600);

      const structured: AiReportStructuredSummary = buildStructuredSummary({
        cadence,
        periodStart: startStr,
        periodEnd: endStr,
        current,
        previous,
        topPages,
        topReferrers,
        topCountries,
        deviceBreakdown,
        goals: goalConversions ?? undefined,
        newVsReturning: newVsReturning ?? undefined,
        gscTopQueries: gscTopQueries ?? undefined,
        scaleEnrichment: scaleEnrichment ?? undefined,
        llmText,
      });

      await db
        .update(aiReports)
        .set({
          status: "complete",
          structuredSummaryJson: structured,
          updatedAt: DateTime.utc().toISO(),
        })
        .where(eq(aiReports.id, reportId));

      this.logger.info({ siteId, cadence, reportId }, "AI report generated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error({ error, siteId, cadence, reportId }, "Failed to generate AI report");
      await db
        .update(aiReports)
        .set({ status: "failed", errorMessage: message, updatedAt: DateTime.utc().toISO() })
        .where(eq(aiReports.id, reportId));
    }
  }

  // ---------------------------------------------------------------------------
  // Per-cadence batch runner
  // ---------------------------------------------------------------------------

  /**
   * Bypass for local development and testing — skips IS_CLOUD gate.
   * Generates a report for a single site at the specified cadence.
   */
  public async runForSite(siteId: number, cadence: ReportCadence): Promise<void> {
    this.logger.info({ siteId, cadence }, "runForSite: starting (IS_CLOUD bypass)");

    const [site] = await db
      .select({ domain: sites.domain, name: sites.name })
      .from(sites)
      .where(eq(sites.siteId, siteId))
      .limit(1);

    if (!site) {
      this.logger.error({ siteId }, "runForSite: site not found");
      return;
    }

    await this.generateAndSaveSiteReport(siteId, site.domain, site.name, cadence, true);
    this.logger.info({ siteId, cadence }, "runForSite: complete");
  }

  /**
   * Finds all sites belonging to orgs on the given tier(s) and generates reports
   * for the specified cadence.
   */
  public async runCadence(cadence: ReportCadence, tierFilter: ("pro" | "scale")[]): Promise<void> {
    if (!IS_CLOUD) {
      this.logger.info({ cadence }, "Skipping AI report cron — not a cloud instance");
      return;
    }

    this.logger.info({ cadence, tierFilter }, "Starting AI report generation run");

    const orgs = await db
      .select({
        id: organization.id,
        stripeCustomerId: organization.stripeCustomerId,
      })
      .from(organization);

    let processed = 0;
    let generated = 0;

    for (const org of orgs) {
      try {
        const sub = await getBestSubscription(org.id, org.stripeCustomerId);
        const tier = getPlanTier(sub.planName);

        if (!tierFilter.includes(tier as "pro" | "scale")) {
          continue;
        }

        const orgSites = await db
          .select({ siteId: sites.siteId, name: sites.name, domain: sites.domain })
          .from(sites)
          .where(eq(sites.organizationId, org.id));

        const isScale = tier === "scale";
        for (const site of orgSites) {
          await this.generateAndSaveSiteReport(site.siteId, site.domain, site.name, cadence, isScale);
          generated++;
        }

        processed++;
      } catch (error) {
        this.logger.error({ error, orgId: org.id }, "Error processing org for AI report");
      }
    }

    this.logger.info({ cadence, processed, generated }, "AI report generation run complete");
  }

  // ---------------------------------------------------------------------------
  // Cron scheduling
  // ---------------------------------------------------------------------------

  public startCrons(): void {
    if (!IS_CLOUD) {
      this.logger.info("Skipping AI report crons — not a cloud instance");
      return;
    }

    // Weekly — Pro + Scale — every Monday at 01:00 UTC
    this.cronTasks.push(
      cron.schedule("0 1 * * 1", () => this.runCadence("weekly", ["pro", "scale"]).catch(err =>
        this.logger.error(err, "Error in weekly AI report cron")
      ), { timezone: "UTC" })
    );

    // Monthly — Scale only — 1st of each month at 02:00 UTC
    this.cronTasks.push(
      cron.schedule("0 2 1 * *", () => this.runCadence("monthly", ["scale"]).catch(err =>
        this.logger.error(err, "Error in monthly AI report cron")
      ), { timezone: "UTC" })
    );

    // Quarterly — Scale only — 1st of Jan/Apr/Jul/Oct at 03:00 UTC
    this.cronTasks.push(
      cron.schedule("0 3 1 1,4,7,10 *", () => this.runCadence("quarterly", ["scale"]).catch(err =>
        this.logger.error(err, "Error in quarterly AI report cron")
      ), { timezone: "UTC" })
    );

    // Yearly — Scale only — 1st Jan at 04:00 UTC
    this.cronTasks.push(
      cron.schedule("0 4 1 1 *", () => this.runCadence("yearly", ["scale"]).catch(err =>
        this.logger.error(err, "Error in yearly AI report cron")
      ), { timezone: "UTC" })
    );

    this.logger.info("AI report crons started (weekly Mon 01:00, monthly 1st 02:00, quarterly 03:00, yearly 04:00 UTC)");
  }

  public stopCrons(): void {
    for (const task of this.cronTasks) {
      task.stop();
    }
    this.cronTasks = [];
    this.logger.info("AI report crons stopped");
  }
}

export const aiReportService = new AiReportService();
