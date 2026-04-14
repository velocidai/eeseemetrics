export type AlertRuleOperator =
  | "drops_below"
  | "exceeds"
  | "drops_by_more_than"
  | "spikes_by_more_than";

export type AlertRuleMetric = "sessions" | "pageviews" | "bounce_rate";

/** Pro tier: max 5 custom rules per site. Scale: unlimited. */
export const MAX_RULES_PRO = 5;

export interface AlertRule {
  id: number;
  siteId: number;
  name: string;
  metric: AlertRuleMetric;
  operator: AlertRuleOperator;
  /** Absolute count for drops_below/exceeds; percentage (e.g. 30 = 30%) for relative operators. */
  threshold: number;
  enabled: boolean;
  cooldownHours: number;
}

export interface RuleEvaluationResult {
  fired: boolean;
  currentValue: number;
  baselineValue: number | null; // null for absolute operators
  percentChange: number | null; // null for absolute operators
  severity: "low" | "medium" | "high";
  cooldownKey: string; // format: "custom:{ruleId}:{targetDate}"
}
