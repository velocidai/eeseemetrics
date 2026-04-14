import * as cron from "node-cron";
import { DateTime } from "luxon";
import { and, eq, lt, sql } from "drizzle-orm";
import { db } from "../../db/postgres/postgres.js";
import { organization, sites, anomalyAlerts } from "../../db/postgres/schema.js";
import { clickhouse } from "../../db/clickhouse/clickhouse.js";
import { processResults } from "../../api/analytics/utils/utils.js";
import { createServiceLogger } from "../../lib/logger/logger.js";
import { IS_CLOUD } from "../../lib/const.js";
import { getBestSubscription } from "../../lib/subscriptionUtils.js";
import { getPlanTier } from "../../lib/tierUtils.js";
import { sendAnomalyNotifications } from "../anomaly/anomalyNotificationService.js";
import {
  MIN_DAYS_FOR_ANOMALY,
  COOLDOWN_HOURS,
  ALERT_HISTORY_DAYS,
} from "./anomalyDetectionTypes.js";
import { detectAnomalies, type DailyMetrics } from "./anomalyDetectionLogic.js";
import { processCustomAlertsForSite } from "../customAlerts/customAlertService.js";

const fmtDate = (d: DateTime) => d.toFormat("yyyy-MM-dd HH:mm:ss");

class AnomalyDetectionService {
  private readonly logger = createServiceLogger("anomaly-detection");
  private cronTask: cron.ScheduledTask | null = null;

  // ---------------------------------------------------------------------------
  // ClickHouse helpers
  // ---------------------------------------------------------------------------

  /** Count distinct days that have at least one pageview. */
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

  /**
   * Fetch aggregated sessions, pageviews, and bounce rate for a single day
   * (today = yesterday's date, since cron runs early morning).
   */
  private async fetchDayMetrics(siteId: number, dayStart: string, dayEnd: string): Promise<DailyMetrics | null> {
    try {
      const result = await clickhouse.query({
        query: `SELECT
          session_stats.sessions,
          session_stats.bounce_rate * 100 AS bounce_rate,
          page_stats.pageviews
        FROM (
          SELECT
            COUNT() AS sessions,
            sumIf(1, pages_in_session = 1) / COUNT() AS bounce_rate
          FROM (
            SELECT
              session_id,
              COUNT(CASE WHEN type = 'pageview' THEN 1 END) AS pages_in_session
            FROM events
            WHERE site_id = {siteId:Int32}
              AND timestamp >= toDateTime({dayStart:String})
              AND timestamp < toDateTime({dayEnd:String})
            GROUP BY session_id
          )
        ) AS session_stats
        CROSS JOIN (
          SELECT COUNT(*) AS pageviews
          FROM events
          WHERE site_id = {siteId:Int32}
            AND timestamp >= toDateTime({dayStart:String})
            AND timestamp < toDateTime({dayEnd:String})
            AND type = 'pageview'
        ) AS page_stats`,
        format: "JSONEachRow",
        query_params: { siteId, dayStart, dayEnd },
      });

      const rows = await processResults<DailyMetrics>(result);
      return rows[0] ?? null;
    } catch (error) {
      this.logger.error({ error, siteId }, "Error fetching day metrics");
      return null;
    }
  }

  /**
   * Fetch the average daily metrics over the trailing N days (excluding today).
   */
  private async fetchBaselineMetrics(siteId: number, windowStart: string, windowEnd: string): Promise<DailyMetrics | null> {
    try {
      const result = await clickhouse.query({
        query: `SELECT
          session_stats.avg_sessions AS sessions,
          session_stats.avg_bounce_rate * 100 AS bounce_rate,
          page_stats.avg_pageviews AS pageviews
        FROM (
          SELECT
            AVG(daily_sessions) AS avg_sessions,
            AVG(daily_bounce_rate) AS avg_bounce_rate
          FROM (
            SELECT
              toDate(timestamp) AS day,
              COUNT(DISTINCT session_id) AS daily_sessions,
              sumIf(1, pages_in_session = 1) / COUNT() AS daily_bounce_rate
            FROM (
              SELECT
                session_id,
                timestamp,
                COUNT(CASE WHEN type = 'pageview' THEN 1 END) OVER (PARTITION BY session_id) AS pages_in_session
              FROM events
              WHERE site_id = {siteId:Int32}
                AND timestamp >= toDateTime({windowStart:String})
                AND timestamp < toDateTime({windowEnd:String})
            )
            GROUP BY day
          )
        ) AS session_stats
        CROSS JOIN (
          SELECT AVG(daily_pageviews) AS avg_pageviews
          FROM (
            SELECT toDate(timestamp) AS day, COUNT(*) AS daily_pageviews
            FROM events
            WHERE site_id = {siteId:Int32}
              AND timestamp >= toDateTime({windowStart:String})
              AND timestamp < toDateTime({windowEnd:String})
              AND type = 'pageview'
            GROUP BY day
          )
        ) AS page_stats`,
        format: "JSONEachRow",
        query_params: { siteId, windowStart, windowEnd },
      });

      const rows = await processResults<DailyMetrics>(result);
      return rows[0] ?? null;
    } catch (error) {
      this.logger.error({ error, siteId }, "Error fetching baseline metrics");
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Per-site processing
  // ---------------------------------------------------------------------------

  private async processSite(siteId: number): Promise<void> {
    const now = DateTime.utc();

    // "Today" = the calendar day that just completed (yesterday in UTC if running at 06:00)
    const targetDay = now.minus({ days: 1 }).startOf("day");
    const dayStart = fmtDate(targetDay);
    const dayEnd = fmtDate(targetDay.plus({ days: 1 }));

    // Trailing 7-day baseline window: 8 days ago → yesterday (exclusive of target day)
    const baselineEnd = targetDay;
    const baselineStart = baselineEnd.minus({ days: 7 });
    const windowStart = fmtDate(baselineStart);
    const windowEnd = fmtDate(baselineEnd);

    const daysWithData = await this.countDaysWithData(siteId);
    if (daysWithData < MIN_DAYS_FOR_ANOMALY) {
      this.logger.debug({ siteId, daysWithData }, "Not enough data for anomaly detection — skipping");
      return;
    }

    const [current, baseline] = await Promise.all([
      this.fetchDayMetrics(siteId, dayStart, dayEnd),
      this.fetchBaselineMetrics(siteId, windowStart, windowEnd),
    ]);

    if (!current || !baseline) return;
    if (current.pageviews === 0) return; // nothing tracked today

    const anomalies = detectAnomalies(siteId, current, baseline, targetDay.toISODate() ?? dayStart);

    for (const anomaly of anomalies) {
      // Deduplication: skip if an alert with this cooldown key already exists in the last COOLDOWN_HOURS
      const cooldownCutoff = fmtDate(now.minus({ hours: COOLDOWN_HOURS }));
      const existing = await db
        .select({ id: anomalyAlerts.id })
        .from(anomalyAlerts)
        .where(
          and(
            eq(anomalyAlerts.cooldownKey, anomaly.cooldownKey),
            sql`${anomalyAlerts.detectedAt} >= ${cooldownCutoff}`
          )
        )
        .limit(1);

      if (existing.length > 0) {
        this.logger.debug({ siteId, metric: anomaly.metric }, "Alert in cooldown — skipping");
        continue;
      }

      await db.insert(anomalyAlerts).values({
        siteId,
        metric: anomaly.metric,
        currentValue: anomaly.currentValue,
        baselineValue: anomaly.baselineValue,
        percentChange: anomaly.percentChange,
        severity: anomaly.severity,
        status: "new",
        cooldownKey: anomaly.cooldownKey,
        detectedAt: fmtDate(now),
      });

      this.logger.info(
        { siteId, metric: anomaly.metric, severity: anomaly.severity, pct: anomaly.percentChange },
        "Anomaly alert created"
      );

      // Fire-and-forget notification dispatch — errors are logged inside, do not block detection
      void sendAnomalyNotifications({
        siteId,
        metric: anomaly.metric as "sessions" | "pageviews" | "bounce_rate",
        currentValue: anomaly.currentValue,
        baselineValue: anomaly.baselineValue,
        percentChange: anomaly.percentChange,
        severity: anomaly.severity as "low" | "medium" | "high",
        detectedAt: fmtDate(now),
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Purge old alerts
  // ---------------------------------------------------------------------------

  private async purgeOldAlerts(siteId: number, historyDays: number): Promise<void> {
    const cutoff = fmtDate(DateTime.utc().minus({ days: historyDays }));
    try {
      await db
        .delete(anomalyAlerts)
        .where(
          and(
            eq(anomalyAlerts.siteId, siteId),
            lt(anomalyAlerts.detectedAt, cutoff)
          )
        );
    } catch (error) {
      this.logger.error({ error, siteId }, "Error purging old anomaly alerts");
    }
  }

  // ---------------------------------------------------------------------------
  // Main daily run
  // ---------------------------------------------------------------------------

  /**
   * Bypass for local development and testing — skips IS_CLOUD gate.
   * Runs system anomaly detection + custom alert evaluation for a single site.
   */
  public async runForSite(siteId: number): Promise<void> {
    this.logger.info({ siteId }, "runForSite: starting (IS_CLOUD bypass)");
    await this.processSite(siteId);
    await processCustomAlertsForSite(siteId).catch((err) =>
      this.logger.error({ err, siteId }, "Error in custom alert evaluation")
    );
    this.logger.info({ siteId }, "runForSite: complete");
  }

  public async runDaily(): Promise<void> {
    if (!IS_CLOUD) {
      this.logger.info("Skipping anomaly detection — not a cloud instance");
      return;
    }

    this.logger.info("Starting daily anomaly detection run");

    const orgs = await db
      .select({ id: organization.id, stripeCustomerId: organization.stripeCustomerId })
      .from(organization);

    let processed = 0;
    let alertsCreated = 0;

    for (const org of orgs) {
      try {
        const sub = await getBestSubscription(org.id, org.stripeCustomerId);
        const tier = getPlanTier(sub.planName);

        const historyDays = ALERT_HISTORY_DAYS[tier as "starter" | "pro" | "scale"] ?? ALERT_HISTORY_DAYS.starter;

        const orgSites = await db
          .select({ siteId: sites.siteId, anomalyDetectionEnabled: sites.anomalyDetectionEnabled })
          .from(sites)
          .where(eq(sites.organizationId, org.id));

        for (const site of orgSites) {
          // System anomaly detection — only if enabled for this site
          if (site.anomalyDetectionEnabled !== false) {
            const beforeCount = await db
              .select({ id: anomalyAlerts.id })
              .from(anomalyAlerts)
              .where(eq(anomalyAlerts.siteId, site.siteId));

            await this.processSite(site.siteId);
            await this.purgeOldAlerts(site.siteId, historyDays);

            const afterCount = await db
              .select({ id: anomalyAlerts.id })
              .from(anomalyAlerts)
              .where(eq(anomalyAlerts.siteId, site.siteId));

            alertsCreated += Math.max(0, afterCount.length - beforeCount.length);
          } else {
            this.logger.debug({ siteId: site.siteId }, "System anomaly detection disabled for site — skipping");
          }

          // Custom alert rules — always run (rules are enabled/disabled individually)
          await processCustomAlertsForSite(site.siteId).catch((err) =>
            this.logger.error({ err, siteId: site.siteId }, "Error in custom alert evaluation")
          );
        }

        processed++;
      } catch (error) {
        this.logger.error({ error, orgId: org.id }, "Error processing org for anomaly detection");
      }
    }

    this.logger.info({ processed, alertsCreated }, "Daily anomaly detection run complete");
  }

  // ---------------------------------------------------------------------------
  // Cron scheduling
  // ---------------------------------------------------------------------------

  public startCron(): void {
    if (!IS_CLOUD) {
      this.logger.info("Skipping anomaly detection cron — not a cloud instance");
      return;
    }

    // Run daily at 06:00 UTC — after the previous day's data is fully settled
    this.cronTask = cron.schedule("0 6 * * *", () =>
      this.runDaily().catch(err => this.logger.error(err, "Error in anomaly detection cron")),
      { timezone: "UTC" }
    );

    this.logger.info("Anomaly detection cron started (runs daily at 06:00 UTC)");
  }

  public stopCron(): void {
    if (this.cronTask) {
      this.cronTask.stop();
      this.cronTask = null;
      this.logger.info("Anomaly detection cron stopped");
    }
  }
}

export const anomalyDetectionService = new AnomalyDetectionService();
