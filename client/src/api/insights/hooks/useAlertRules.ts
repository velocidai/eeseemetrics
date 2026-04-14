import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAlertRules,
  createAlertRule,
  patchAlertRule,
  deleteAlertRule,
  fetchMetricAverages,
  type AlertRule,
  type AlertRuleMetric,
  type AlertRuleOperator,
} from "../endpoints/alertRules";

export function useGetAlertRules(siteId?: number) {
  return useQuery({
    queryKey: ["alert-rules", siteId],
    queryFn: () => fetchAlertRules(siteId!),
    enabled: !!siteId,
  });
}

export function useCreateAlertRule(siteId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name?: string;
      metric: AlertRuleMetric;
      operator: AlertRuleOperator;
      threshold: number;
    }) => createAlertRule(siteId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rules", siteId] });
    },
  });
}

export function useUpdateAlertRule(siteId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ruleId,
      updates,
    }: {
      ruleId: number;
      updates: Partial<Pick<AlertRule, "name" | "metric" | "operator" | "threshold" | "enabled">>;
    }) => patchAlertRule(siteId, ruleId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rules", siteId] });
    },
  });
}

export function useDeleteAlertRule(siteId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: number) => deleteAlertRule(siteId, ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rules", siteId] });
    },
  });
}

export function useGetMetricAverages(siteId?: number) {
  return useQuery({
    queryKey: ["metric-averages", siteId],
    queryFn: () => fetchMetricAverages(siteId!),
    enabled: !!siteId,
    staleTime: 5 * 60 * 1000,
  });
}
