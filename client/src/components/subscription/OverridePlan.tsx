import { authClient } from "@/lib/auth";
import { Shield } from "lucide-react";
import { useState } from "react";
import { useExtracted } from "next-intl";
import { toast } from "@/components/ui/sonner";
import { useStripeSubscription } from "../../lib/subscription/useStripeSubscription";
import { UsageChart } from "../UsageChart";
import { getPlanType } from "../../lib/stripe";
import { BACKEND_URL } from "../../lib/const";
import { PlanCard } from "./components/PlanCard";
import { UsageLimitAlerts } from "./components/UsageLimitAlerts";
import { UsageProgressBar } from "./components/UsageProgressBar";
import { useUsageStats } from "./components/useUsageStats";
import { Button } from "../ui/button";

export function OverridePlan() {
  const t = useExtracted();
  const { data: subscription } = useStripeSubscription();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const [isProcessing, setIsProcessing] = useState(false);

  const organizationId = activeOrg?.id;
  const { currentUsage, limit, percentageUsed, isNearLimit, isLimitExceeded } = useUsageStats(subscription);

  if (!subscription) return null;

  const openPortal = async () => {
    if (!organizationId) return;
    setIsProcessing(true);
    try {
      const response = await fetch(`${BACKEND_URL}/stripe/create-portal-session`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, returnUrl: window.location.href }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create portal session.");
      if (data.portalUrl) window.location.href = data.portalUrl;
    } catch (err: any) {
      toast.error(err.message || "Could not open billing portal.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPlanName = (name: string) => {
    const eventMatch = name.match(/(\d+)(k|m)/i);
    if (!eventMatch) return name;

    const num = parseInt(eventMatch[1]);
    const unit = eventMatch[2].toLowerCase();
    const events = unit === "m" ? `${num}M` : `${num}K`;

    return `${getPlanType(name)} ${events}`;
  };

  return (
    <PlanCard
      title={
        <>
          <Shield className="h-5 w-5" />
          {t("{plan} Plan", { plan: formatPlanName(subscription.planName) })}
        </>
      }
      description={t("You have a custom plan with up to {limit} pageviews per month.", { limit: subscription?.eventLimit.toLocaleString() })}
    >
      <UsageLimitAlerts
        isLimitExceeded={isLimitExceeded}
        isNearLimit={isNearLimit}
        exceededMessage={t("You have exceeded your monthly event limit. Please contact support for assistance.")}
        nearLimitMessage={t("You are approaching your monthly event limit. Please contact support if you need more capacity.")}
      />
      <UsageProgressBar
        currentUsage={currentUsage}
        limit={limit}
        percentageUsed={percentageUsed}
        isNearLimit={isNearLimit}
      />
      {organizationId && <UsageChart organizationId={organizationId} />}
      <div className="flex gap-2 mt-2">
        <Button onClick={openPortal} disabled={isProcessing} variant="outline">
          {isProcessing ? t("Loading...") : t("Manage Subscription")}
        </Button>
      </div>
    </PlanCard>
  );
}
