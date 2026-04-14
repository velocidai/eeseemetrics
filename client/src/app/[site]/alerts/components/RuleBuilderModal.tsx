"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateAlertRule, useGetMetricAverages } from "@/api/insights/hooks/useAlertRules";
import type { AlertRuleMetric, AlertRuleOperator } from "@/api/insights/endpoints/alertRules";

const schema = z.object({
  metric: z.enum(["sessions", "pageviews", "bounce_rate"]),
  operator: z.enum(["drops_below", "exceeds", "drops_by_more_than", "spikes_by_more_than"]),
  threshold: z.coerce.number().positive("Must be a positive number"),
  name: z.string().trim().max(100).optional(),
});

type FormValues = z.infer<typeof schema>;

const METRIC_LABELS: Record<AlertRuleMetric, string> = {
  sessions: "Sessions",
  pageviews: "Pageviews",
  bounce_rate: "Bounce rate",
};

const OPERATOR_LABELS: Record<AlertRuleOperator, string> = {
  drops_below: "drops below",
  exceeds: "exceeds",
  drops_by_more_than: "drops by more than",
  spikes_by_more_than: "spikes by more than",
};

const OPERATOR_UNIT: Record<AlertRuleOperator, string> = {
  drops_below: "per day (absolute)",
  exceeds: "per day (absolute)",
  drops_by_more_than: "% vs 7-day average",
  spikes_by_more_than: "% vs 7-day average",
};

interface RuleBuilderModalProps {
  siteId: number;
  open: boolean;
  onClose: () => void;
}

export function RuleBuilderModal({ siteId, open, onClose }: RuleBuilderModalProps) {
  const { data: averages } = useGetMetricAverages(siteId);
  const { mutate: createRule, isPending } = useCreateAlertRule(siteId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { metric: "sessions", operator: "drops_below", threshold: undefined, name: "" },
  });

  const metric = watch("metric") as AlertRuleMetric;
  const operator = watch("operator") as AlertRuleOperator;

  const averageValue = averages?.[metric as keyof typeof averages];
  const isRelative = operator === "drops_by_more_than" || operator === "spikes_by_more_than";

  function onSubmit(values: FormValues) {
    createRule(
      {
        metric: values.metric as AlertRuleMetric,
        operator: values.operator as AlertRuleOperator,
        threshold: values.threshold,
        name: values.name || undefined,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create alert rule</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Metric */}
          <div className="space-y-1.5">
            <Label>Metric</Label>
            <Select
              value={metric}
              onValueChange={(v) => setValue("metric", v as AlertRuleMetric)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(METRIC_LABELS) as AlertRuleMetric[]).map((m) => (
                  <SelectItem key={m} value={m}>
                    {METRIC_LABELS[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Operator */}
          <div className="space-y-1.5">
            <Label>Condition</Label>
            <Select
              value={operator}
              onValueChange={(v) => setValue("operator", v as AlertRuleOperator)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(OPERATOR_LABELS) as AlertRuleOperator[]).map((op) => (
                  <SelectItem key={op} value={op}>
                    {OPERATOR_LABELS[op]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Threshold */}
          <div className="space-y-1.5">
            <Label>Threshold</Label>
            <Input
              type="number"
              step="1"
              min={0}
              placeholder={isRelative ? "e.g. 30" : "e.g. 200"}
              {...register("threshold")}
            />
            {errors.threshold && (
              <p className="text-xs text-destructive">{errors.threshold.message}</p>
            )}
            <p className="text-xs text-neutral-500">
              {OPERATOR_UNIT[operator]}
              {averageValue !== undefined && !isRelative && (
                <> — your 30-day average: <strong>{averageValue.toLocaleString()}</strong></>
              )}
            </p>
          </div>

          {/* Name (optional) */}
          <div className="space-y-1.5">
            <Label>
              Rule name <span className="text-neutral-400 font-normal">(optional)</span>
            </Label>
            <Input
              type="text"
              placeholder={`${METRIC_LABELS[metric]} ${OPERATOR_LABELS[operator]} ${watch("threshold") || "..."}`}
              {...register("name")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating…" : "Create rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
