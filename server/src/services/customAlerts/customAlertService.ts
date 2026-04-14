import { and, eq, sql } from "drizzle-orm";
import { DateTime } from "luxon";
import { db } from "../../db/postgres/postgres.js";
import { alertRules, anomalyAlerts } from "../../db/postgres/schema.js";
import { clickhouse } from "../../db/clickhouse/clickhouse.js";
import { processResults } from "../../api/analytics/utils/utils.js";
import { sendAnomalyNotifications } from "../anomaly/anomalyNotificationService.js";
import { createServiceLogger } from "../../lib/logger/logger.js";
import { evaluateRule } from "./customAlertEvaluator.js";
import type { DailyMetrics } from "../anomalyDetection/anomalyDetectionTypes.js";
import type { AlertRule } from "./customAlertTypes.js";

const logger = createServiceLogger("custom-alert-service");
const fmtDate = (d: DateTime) => d.toFormat("yyyy-MM-dd HH:mm:ss");

async function fetchDayMetrics(
  siteId: number,
  dayStart: string,
  dayEnd: string
): Promise<DailyMetrics | null> {
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
    logger.error({ error, siteId }, "Error fetching day metrics for custom alerts");
    return null;
  }
}

async function fetchBaselineMetrics(
  siteId: number,
  windowStart: string,
  windowEnd: string
): Promise<DailyMetrics | null> {
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
    logger.error({ error, siteId }, "Error fetching baseline for custom alerts");
    return null;
  }
}

export async function processCustomAlertsForSite(siteId: number): Promise<void> {
  // Load enabled rules for this site
  const rules = await db
    .select()
    .from(alertRules)
    .where(and(eq(alertRules.siteId, siteId), eq(alertRules.enabled, true)));

  if (rules.length === 0) return;

  const now = DateTime.utc();
  const targetDay = now.minus({ days: 1 }).startOf("day");
  const dayStart = fmtDate(targetDay);
  const dayEnd = fmtDate(targetDay.plus({ days: 1 }));
  const baselineEnd = targetDay;
  const baselineStart = baselineEnd.minus({ days: 7 });

  const [current, baseline] = await Promise.all([
    fetchDayMetrics(siteId, dayStart, dayEnd),
    fetchBaselineMetrics(siteId, fmtDate(baselineStart), fmtDate(baselineEnd)),
  ]);

  if (!current) return;

  const targetDate = targetDay.toISODate() ?? dayStart;

  for (const rule of rules as AlertRule[]) {
    const evaluation = evaluateRule(rule, current, baseline, targetDate);

    if (!evaluation.fired) continue;

    // Cooldown check: skip if same rule already fired within cooldown period
    const cooldownCutoff = fmtDate(now.minus({ hours: rule.cooldownHours }));
    const existing = await db
      .select({ id: anomalyAlerts.id })
      .from(anomalyAlerts)
      .where(
        and(
          eq(anomalyAlerts.cooldownKey, evaluation.cooldownKey),
          sql`${anomalyAlerts.detectedAt} >= ${cooldownCutoff}`
        )
      )
      .limit(1);

    if (existing.length > 0) {
      logger.debug({ siteId, ruleId: rule.id }, "Custom alert in cooldown — skipping");
      continue;
    }

    await db.insert(anomalyAlerts).values({
      siteId,
      metric: rule.metric,
      currentValue: evaluation.currentValue,
      baselineValue: evaluation.baselineValue ?? evaluation.currentValue,
      percentChange: evaluation.percentChange ?? 0,
      severity: evaluation.severity,
      status: "new",
      cooldownKey: evaluation.cooldownKey,
      detectedAt: fmtDate(now),
      ruleId: rule.id,
    });

    // Update lastTriggeredAt on the rule
    await db
      .update(alertRules)
      .set({ lastTriggeredAt: fmtDate(now) })
      .where(eq(alertRules.id, rule.id));

    logger.info(
      { siteId, ruleId: rule.id, metric: rule.metric, severity: evaluation.severity },
      "Custom alert fired"
    );

    // Fire-and-forget notifications — same path as system alerts
    void sendAnomalyNotifications({
      siteId,
      metric: rule.metric,
      currentValue: evaluation.currentValue,
      baselineValue: evaluation.baselineValue ?? evaluation.currentValue,
      percentChange: evaluation.percentChange ?? 0,
      severity: evaluation.severity,
      detectedAt: fmtDate(now),
    });
  }
}
