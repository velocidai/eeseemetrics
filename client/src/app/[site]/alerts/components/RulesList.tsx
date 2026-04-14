"use client";

import { useState } from "react";
import { Plus, Trash2, Clock } from "lucide-react";
import { DateTime } from "luxon";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useGetAlertRules, useUpdateAlertRule, useDeleteAlertRule } from "@/api/insights/hooks/useAlertRules";
import { useGetSite } from "@/api/admin/hooks/useGetSite";
import { updateSiteConfig } from "@/api/admin/endpoints/sites";
import { RuleBuilderModal } from "./RuleBuilderModal";
import type { AlertRule, AlertRuleMetric, AlertRuleOperator } from "@/api/insights/endpoints/alertRules";

const METRIC_LABEL: Record<AlertRuleMetric, string> = {
  sessions: "Sessions",
  pageviews: "Pageviews",
  bounce_rate: "Bounce rate",
};

const OPERATOR_LABEL: Record<AlertRuleOperator, string> = {
  drops_below: "drops below",
  exceeds: "exceeds",
  drops_by_more_than: "drops by more than",
  spikes_by_more_than: "spikes by more than",
};

function formatRuleDescription(rule: AlertRule): string {
  const metric = METRIC_LABEL[rule.metric] ?? rule.metric;
  const op = OPERATOR_LABEL[rule.operator] ?? rule.operator;
  const isRelative = rule.operator === "drops_by_more_than" || rule.operator === "spikes_by_more_than";
  const unit = isRelative ? "%" : " per day";
  return `${metric} ${op} ${rule.threshold}${unit}`;
}

function RuleCard({ rule, siteId }: { rule: AlertRule; siteId: number }) {
  const { mutate: updateRule, isPending: isUpdating } = useUpdateAlertRule(siteId);
  const { mutate: deleteRule, isPending: isDeleting } = useDeleteAlertRule(siteId);

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {rule.name}
          </p>
          <p className="text-xs text-neutral-500">{formatRuleDescription(rule)}</p>
          {rule.lastTriggeredAt && (
            <p className="text-xs text-neutral-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last triggered {DateTime.fromISO(rule.lastTriggeredAt).toRelative()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Switch
            checked={rule.enabled}
            disabled={isUpdating}
            onCheckedChange={(enabled) =>
              updateRule({ ruleId: rule.id, updates: { enabled } })
            }
          />
          <button
            onClick={() => deleteRule(rule.id)}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-500/5 transition-colors disabled:opacity-40"
            title="Delete rule"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function useUpdateSiteAnomalyDetection(siteId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (anomalyDetectionEnabled: boolean) =>
      updateSiteConfig(siteId, { anomalyDetectionEnabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site", siteId] });
    },
  });
}

export function RulesList({ siteId }: { siteId: number }) {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: rulesData, isLoading } = useGetAlertRules(siteId);
  const { data: site } = useGetSite(siteId);
  const { mutate: toggleAnomalyDetection, isPending: isToggling } =
    useUpdateSiteAnomalyDetection(siteId);

  const anomalyDetectionEnabled = site?.anomalyDetectionEnabled ?? true;
  const rules = rulesData?.data ?? [];

  return (
    <div className="space-y-6">
      {/* System anomaly detection toggle */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              System anomaly detection
            </p>
            <p className="text-xs text-neutral-500">
              Automatic daily checks for unusual patterns.
            </p>
          </div>
          <Switch
            checked={anomalyDetectionEnabled}
            disabled={isToggling}
            onCheckedChange={(enabled) => toggleAnomalyDetection(enabled)}
          />
        </div>
        {!anomalyDetectionEnabled && rules.length === 0 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 pt-1">
            ⚠ You have no active alert sources. Enable system detection or add a custom rule.
          </p>
        )}
      </div>

      {/* Custom rules */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Custom rules
          </h3>
          <Button size="sm" variant="outline" onClick={() => setModalOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add rule
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-sm">
            No custom rules yet. Add a rule to be alerted when a metric crosses a specific threshold.
          </div>
        ) : (
          <div className="space-y-2">
            {rules.map((rule) => (
              <RuleCard key={rule.id} rule={rule} siteId={siteId} />
            ))}
          </div>
        )}
      </div>

      <RuleBuilderModal
        siteId={siteId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
