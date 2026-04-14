import { Infinity, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { useStripeSubscription } from "../../lib/subscription/useStripeSubscription";
import { UsageChart } from "../UsageChart";
import { authClient } from "@/lib/auth";

const TIER_LABELS: Record<number, string> = {
  1: "Personal — 100K pv/mo",
  2: "Growth — 250K pv/mo",
  3: "Business — 500K pv/mo",
};

export function LtdPlan() {
  const router = useRouter();
  const { data: activeSubscription } = useStripeSubscription();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const organizationId = activeOrg?.id;

  const eventLimit = activeSubscription?.eventLimit || 0;
  const currentUsage = activeSubscription?.monthlyEventCount || 0;
  const usagePercentage = eventLimit > 0 ? Math.min((currentUsage / eventLimit) * 100, 100) : 0;
  const tier = activeSubscription?.ltdTier ?? 1;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <div className="space-y-6 mt-3 p-2">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">Starter</p>
                  <Badge className="bg-[#2FC7B8]/15 text-[#2FC7B8] border-[#2FC7B8]/30 text-xs font-semibold">
                    Lifetime Deal
                  </Badge>
                </div>
                <p className="text text-neutral-600 dark:text-neutral-300">
                  {TIER_LABELS[tier]} · Paid once
                </p>
                <p className="text-neutral-400 text-sm flex items-center gap-1">
                  <Infinity className="w-3.5 h-3.5" /> Never expires · No recurring charges
                </p>
              </div>
              <Button variant="success" onClick={() => router.push("/subscribe")}>
                Upgrade to Pro <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium mb-2">Usage this month</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Pageviews</span>
                    <span className="text-sm">
                      {currentUsage.toLocaleString()} / {eventLimit.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={usagePercentage} />
                </div>

                {currentUsage >= eventLimit && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        <strong>Limit reached.</strong> Tracking pauses until next month. Upgrade for more.
                      </p>
                      <Button variant="success" size="sm" onClick={() => router.push("/subscribe")}>
                        Upgrade
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {organizationId && (
              <>
                <UsageChart organizationId={organizationId} />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-2">
                  Only pageviews count toward your monthly plan limit. Custom events, errors, and performance data are unlimited.
                </p>
              </>
            )}

            <div className="p-4 bg-[#2FC7B8]/5 border border-[#2FC7B8]/20 rounded-lg text-sm text-neutral-600 dark:text-neutral-300">
              Your lifetime deal is a permanent safety net. Upgrade to Pro or Scale for session replay, funnels, and AI reports —
              if you ever cancel, you automatically return to this plan at $0/month.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
