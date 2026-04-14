import type { DailyMetrics } from "../anomalyDetection/anomalyDetectionTypes.js";
import type { AlertRule, RuleEvaluationResult } from "./customAlertTypes.js";

function getMetricValue(metrics: DailyMetrics, metric: string): number {
  switch (metric) {
    case "sessions": return metrics.sessions;
    case "pageviews": return metrics.pageviews;
    case "bounce_rate": return metrics.bounce_rate ?? 0;
    default: return 0;
  }
}

/**
 * Severity for absolute threshold operators.
 * deviation >= 50% of threshold → high, >= 25% → medium, else low.
 */
function absoluteSeverity(
  currentValue: number,
  threshold: number
): "low" | "medium" | "high" {
  const deviation = Math.abs(currentValue - threshold) / Math.max(threshold, 1);
  if (deviation >= 0.5) return "high";
  if (deviation >= 0.25) return "medium";
  return "low";
}

/**
 * Severity for relative operators.
 * excess = |percentChange| - threshold (how much the threshold was exceeded).
 * excessRatio = excess / threshold.
 * excessRatio >= 60% → high, >= 30% → medium, else low.
 */
function relativeSeverity(
  percentChange: number,
  threshold: number
): "low" | "medium" | "high" {
  const excess = Math.abs(percentChange) - threshold;
  const excessRatio = excess / Math.max(threshold, 1);
  if (excessRatio >= 0.6) return "high";
  if (excessRatio >= 0.3) return "medium";
  return "low";
}

/**
 * Evaluates a single custom alert rule against current and baseline metrics.
 *
 * @param rule - The rule to evaluate
 * @param current - Yesterday's daily metrics
 * @param baseline - 7-day rolling average (required for relative operators; pass null to skip)
 * @param targetDate - ISO date string for the day being evaluated (used in cooldownKey)
 */
export function evaluateRule(
  rule: AlertRule,
  current: DailyMetrics,
  baseline: DailyMetrics | null,
  targetDate: string
): RuleEvaluationResult {
  const currentValue = getMetricValue(current, rule.metric);
  const cooldownKey = `custom:${rule.id}:${targetDate}`;

  if (rule.operator === "drops_below") {
    const fired = currentValue < rule.threshold;
    return {
      fired,
      currentValue,
      baselineValue: null,
      percentChange: null,
      severity: fired ? absoluteSeverity(currentValue, rule.threshold) : "low",
      cooldownKey,
    };
  }

  if (rule.operator === "exceeds") {
    const fired = currentValue > rule.threshold;
    return {
      fired,
      currentValue,
      baselineValue: null,
      percentChange: null,
      severity: fired ? absoluteSeverity(currentValue, rule.threshold) : "low",
      cooldownKey,
    };
  }

  // Relative operators require a baseline
  if (!baseline) {
    return {
      fired: false,
      currentValue,
      baselineValue: null,
      percentChange: null,
      severity: "low",
      cooldownKey,
    };
  }

  const baselineValue = getMetricValue(baseline, rule.metric);
  if (baselineValue === 0) {
    return {
      fired: false,
      currentValue,
      baselineValue: 0,
      percentChange: null,
      severity: "low",
      cooldownKey,
    };
  }

  const percentChange = ((currentValue - baselineValue) / baselineValue) * 100;

  if (rule.operator === "drops_by_more_than") {
    // threshold is a positive percentage; drop means percentChange is negative
    // "more than" is inclusive — fires at exactly the threshold as well (<= semantics)
    const fired = percentChange <= -rule.threshold;
    return {
      fired,
      currentValue,
      baselineValue,
      percentChange,
      severity: fired ? relativeSeverity(percentChange, rule.threshold) : "low",
      cooldownKey,
    };
  }

  if (rule.operator === "spikes_by_more_than") {
    // "more than" is inclusive — fires at exactly the threshold as well (>= semantics)
    const fired = percentChange >= rule.threshold;
    return {
      fired,
      currentValue,
      baselineValue,
      percentChange,
      severity: fired ? relativeSeverity(percentChange, rule.threshold) : "low",
      cooldownKey,
    };
  }

  return {
    fired: false,
    currentValue,
    baselineValue: null,
    percentChange: null,
    severity: "low",
    cooldownKey,
  };
}
