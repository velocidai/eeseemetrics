"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminOrganizationData } from "@/api/admin/endpoints";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { formatter } from "@/lib/utils";
import { User, Building2, CreditCard, UserCheck, ExternalLink, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth";
import { userStore } from "@/lib/userStore";
import { CopyText } from "../../../../components/CopyText";
import { useExtracted } from "next-intl";
import { BACKEND_URL } from "@/lib/const";
import { toast } from "@/components/ui/sonner";
import { useQueryClient } from "@tanstack/react-query";

interface OrganizationExpandedRowProps {
  organization: AdminOrganizationData;
}

export function OrganizationExpandedRow({ organization }: OrganizationExpandedRowProps) {
  const router = useRouter();
  const t = useExtracted();
  const queryClient = useQueryClient();
  const [stripeCustomerId, setStripeCustomerId] = useState(organization.subscription.id ?? "");
  const [planOverride, setPlanOverride] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const patchOrg = async (updates: Record<string, any>) => {
    setIsSaving(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/organizations/${organization.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      toast.success("Organization updated");
      queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImpersonate = useCallback(
    async (userId: string) => {
      try {
        await authClient.admin.impersonateUser({
          userId,
        });
        window.location.reload();
        router.push("/");
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        console.error(`Failed to impersonate user: ${errorMessage}`);
        return false;
      }
    },
    [router]
  );

  return (
    <div className="space-y-6">
      <CopyText text={organization.id}></CopyText>

      {/* Subscription Details */}
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold mb-3">
          <CreditCard className="h-4 w-4" />
          {t("Subscription Details")}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-neutral-100 dark:border-neutral-800 rounded">
          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{t("Plan")}</div>
            <div className="font-medium">{organization.subscription.planName}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{t("Status")}</div>
            <div className="font-medium">{organization.subscription.status}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{t("Event Limit")}</div>
            <div className="font-medium">
              {organization.subscription.eventLimit == null
                ? t("Unlimited")
                : organization.subscription.eventLimit === 0
                ? "0 (no active plan)"
                : formatter(organization.subscription.eventLimit)}
            </div>
          </div>
          {organization.subscription.currentPeriodEnd && (
            <div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{t("Period End")}</div>
              <div className="font-medium">
                {formatDistanceToNow(new Date(organization.subscription.currentPeriodEnd), {
                  addSuffix: true,
                })}
              </div>
            </div>
          )}
          {organization.subscription.cancelAtPeriodEnd && (
            <div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{t("Cancellation")}</div>
              <div className="font-medium text-orange-400">{t("Cancels at period end")}</div>
            </div>
          )}
        </div>
      </div>

      {/* Sites */}
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold mb-3">
          <Building2 className="h-4 w-4" />
          {t("Sites ({count})", { count: String(organization.sites.length) })}
        </div>
        {organization.sites.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {organization.sites.map(site => (
              <Link
                key={site.siteId}
                href={`/${site.siteId}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm transition-colors"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{site.domain}</span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {t("{events24h} events (24h)", { events24h: formatter(site.eventsLast24Hours) })} · {t("{events30d} (30d)", { events30d: formatter(site.eventsLast30Days) })}
                  </span>
                </div>
                <ExternalLink className="h-3 w-3" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-neutral-500 dark:text-neutral-400 p-4 border border-neutral-100 dark:border-neutral-800 rounded">
            {t("No sites")}
          </div>
        )}
      </div>

      {/* Members */}
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold mb-3">
          <User className="h-4 w-4" />
          {t("Members ({count})", { count: String(organization.members.length) })}
        </div>
        {organization.members.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {organization.members.map(member => (
              <div
                key={member.userId}
                className="p-3 border border-neutral-100 dark:border-neutral-800 rounded flex items-center justify-between"
              >
                <div className="flex flex-col gap-1">
                  <div className="font-medium flex items-center gap-2">
                    {member.name}{" "}
                    <Badge variant="outline" className="text-xs">
                      {member.role}
                    </Badge>
                  </div>
                  <div className="text-sm text-neutral-700 dark:text-neutral-200">{member.email}</div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    <CopyText text={member.userId} className="text-xs"></CopyText>
                  </div>
                  <Button
                    onClick={() => handleImpersonate(member.userId)}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                    disabled={member.userId === userStore.getState().user?.id}
                  >
                    <UserCheck className="h-3 w-3" />
                    {t("Impersonate")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-neutral-500 dark:text-neutral-400 p-4 border border-neutral-100 dark:border-neutral-800 rounded">
            {t("No members")}
          </div>
        )}
      </div>

      {/* Plan Management */}
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold mb-3">
          <Settings className="h-4 w-4" />
          {t("Plan Management")}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-neutral-100 dark:border-neutral-800 rounded">
          {/* Stripe Customer ID */}
          <div className="space-y-2">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Stripe Customer ID</div>
            <div className="flex gap-2">
              <Input
                value={stripeCustomerId}
                onChange={e => setStripeCustomerId(e.target.value)}
                placeholder="cus_..."
                className="text-xs h-8"
              />
              <Button size="sm" disabled={isSaving} onClick={() => patchOrg({ stripeCustomerId: stripeCustomerId || null })}>
                Set
              </Button>
            </div>
          </div>
          {/* Plan Override */}
          <div className="space-y-2">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Plan Override</div>
            <div className="flex gap-2">
              <Input
                value={planOverride}
                onChange={e => setPlanOverride(e.target.value)}
                placeholder="e.g. pro1m"
                className="text-xs h-8"
              />
              <Button size="sm" disabled={isSaving} onClick={() => patchOrg({ planOverride: planOverride || null })}>
                Set
              </Button>
            </div>
          </div>
          {/* Danger actions */}
          <div className="space-y-2">
            <div className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Danger</div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="destructive"
                disabled={isSaving}
                onClick={() => patchOrg({ customPlan: null })}
              >
                Clear Custom Plan
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isSaving}
                onClick={() => patchOrg({ planOverride: null })}
              >
                Clear Override
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
