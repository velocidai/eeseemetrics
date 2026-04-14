import { authedFetch } from "../../utils";

export type AlertRuleOperator =
  | "drops_below"
  | "exceeds"
  | "drops_by_more_than"
  | "spikes_by_more_than";

export type AlertRuleMetric = "sessions" | "pageviews" | "bounce_rate";

export interface AlertRule {
  id: number;
  siteId: number;
  organizationId: string;
  createdBy: string | null;
  name: string;
  metric: AlertRuleMetric;
  operator: AlertRuleOperator;
  threshold: number;
  enabled: boolean;
  cooldownHours: number;
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MetricAverages {
  sessions: number;
  pageviews: number;
  bounce_rate: number;
}

export async function fetchAlertRules(siteId: number): Promise<{ data: AlertRule[] }> {
  return authedFetch<{ data: AlertRule[] }>(`/sites/${siteId}/alert-rules`);
}

export async function createAlertRule(
  siteId: number,
  body: {
    name?: string;
    metric: AlertRuleMetric;
    operator: AlertRuleOperator;
    threshold: number;
  }
): Promise<{ data: AlertRule }> {
  return authedFetch<{ data: AlertRule }>(`/sites/${siteId}/alert-rules`, undefined, {
    method: "POST",
    data: body,
  });
}

export async function patchAlertRule(
  siteId: number,
  ruleId: number,
  updates: Partial<Pick<AlertRule, "name" | "metric" | "operator" | "threshold" | "enabled">>
): Promise<{ data: AlertRule }> {
  return authedFetch<{ data: AlertRule }>(
    `/sites/${siteId}/alert-rules/${ruleId}`,
    undefined,
    { method: "PATCH", data: updates }
  );
}

export async function deleteAlertRule(siteId: number, ruleId: number): Promise<void> {
  return authedFetch<void>(
    `/sites/${siteId}/alert-rules/${ruleId}`,
    undefined,
    { method: "DELETE" }
  );
}

export async function fetchMetricAverages(siteId: number): Promise<MetricAverages> {
  return authedFetch<MetricAverages>(`/sites/${siteId}/alert-rules/metric-averages`);
}
