"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useStripeSubscription } from "../lib/subscription/useStripeSubscription";
import { getPlanTier, tierAtLeast } from "../lib/tier";
import { IS_CLOUD } from "../lib/const";

interface InsightsGateProps {
  children: React.ReactNode;
  /** Minimum tier required — defaults to "pro". */
  requiredTier?: "pro" | "scale";
}

/**
 * Wraps any Insights feature (Reports, Alert Rules) and shows an upgrade prompt
 * when the user's plan is below the required tier.
 *
 * On self-hosted (IS_CLOUD = false) we always render children — the backend
 * still enforces tier checks; this gate is only a UX affordance.
 */
export function InsightsGate({ children, requiredTier = "pro" }: InsightsGateProps) {
  const { data: subscription, isLoading } = useStripeSubscription();

  // Self-hosted: no billing, pass through
  if (!IS_CLOUD) {
    return <>{children}</>;
  }

  // Show nothing while loading to avoid flash of upgrade prompt
  if (isLoading) {
    return null;
  }

  const tier = getPlanTier(subscription?.planName);
  const hasAccess = tierAtLeast(tier, requiredTier);

  if (hasAccess) {
    return <>{children}</>;
  }

  const planLabel = requiredTier === "scale" ? "Scale" : "Pro";

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-5 p-8 text-center">
      <div className="rounded-full bg-accent-500/10 p-4">
        <Sparkles className="w-8 h-8 text-accent-500" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {planLabel} plan required
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {requiredTier === "scale"
            ? "Upgrade to Scale to access this feature, including expanded report cadences and priority alerts."
            : "Upgrade to Pro or Scale to get automatic AI-generated insights reports and custom alert rules for this site."}
        </p>
      </div>
      <Link
        href="/subscribe"
        className="inline-flex items-center gap-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium px-4 py-2 transition-colors"
      >
        View plans
      </Link>
    </div>
  );
}
