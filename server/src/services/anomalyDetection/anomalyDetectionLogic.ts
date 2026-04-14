import {
  type AnomalyMetric,
  type DetectedAnomaly,
  type DailyMetrics,
  METRIC_THRESHOLDS,
} from "./anomalyDetectionTypes.js";

export type { DailyMetrics };

/**
 * Pure function: compare current day metrics against a baseline,
 * return a DetectedAnomaly for each metric that exceeds its threshold.
 */
export function detectAnomalies(
  siteId: number,
  current: DailyMetrics,
  baseline: DailyMetrics,
  targetDate: string
): DetectedAnomaly[] {
  const anomalies: DetectedAnomaly[] = [];
  const metrics: AnomalyMetric[] = ["sessions", "pageviews", "bounce_rate"];

  for (const metric of metrics) {
    const currentVal = current[metric];
    const baselineVal = baseline[metric];

    if (currentVal == null || baselineVal == null || baselineVal === 0) continue;

    const config = METRIC_THRESHOLDS[metric];
    const pctChange = (currentVal - baselineVal) / baselineVal;
    const absPct = Math.abs(pctChange);

    if (absPct < config.alertThreshold) continue;

    const direction = pctChange > 0 ? "up" : "down";
    const severity: "low" | "medium" | "high" =
      absPct >= config.highThreshold
        ? "high"
        : absPct >= config.alertThreshold * 1.3
          ? "medium"
          : "low";

    anomalies.push({
      metric,
      currentValue: currentVal,
      baselineValue: baselineVal,
      percentChange: Math.round(pctChange * 1000) / 10,
      severity,
      cooldownKey: `${siteId}:${metric}:${direction}:${targetDate}`,
    });
  }

  return anomalies;
}
