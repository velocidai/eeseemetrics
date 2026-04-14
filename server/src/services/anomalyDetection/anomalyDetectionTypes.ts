export type AnomalyMetric = "sessions" | "pageviews" | "bounce_rate";

export interface DailyMetrics {
  sessions: number;
  pageviews: number;
  bounce_rate: number | null;
}

export interface MetricThreshold {
  /** Fraction deviation that triggers an alert (e.g. 0.30 = 30%). */
  alertThreshold: number;
  /** Deviation at which severity escalates to "high" (e.g. 0.50 = 50%). */
  highThreshold: number;
  /** true = a spike is bad; false = a drop is bad. For bounce_rate a spike is bad. */
  spikeIsBad: boolean;
}

/**
 * Thresholds per metric.
 * Deviations are measured as abs((current - baseline) / baseline).
 */
export const METRIC_THRESHOLDS: Record<AnomalyMetric, MetricThreshold> = {
  sessions: { alertThreshold: 0.30, highThreshold: 0.50, spikeIsBad: false },
  pageviews: { alertThreshold: 0.30, highThreshold: 0.50, spikeIsBad: false },
  bounce_rate: { alertThreshold: 0.15, highThreshold: 0.30, spikeIsBad: true },
};

/** Minimum days of data required before anomaly detection runs for a site. */
export const MIN_DAYS_FOR_ANOMALY = 7;

/** How many hours before the same metric/direction can fire again. */
export const COOLDOWN_HOURS = 24;

/** Days of alert history retained per tier. */
export const ALERT_HISTORY_DAYS: Record<"starter" | "pro" | "scale", number> = {
  starter: 14,
  pro: 30,
  scale: 90,
};

export interface DetectedAnomaly {
  metric: AnomalyMetric;
  currentValue: number;
  baselineValue: number;
  percentChange: number; // positive = spike, negative = drop
  severity: "low" | "medium" | "high";
  cooldownKey: string;
}
