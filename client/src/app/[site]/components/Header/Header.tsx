"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rocket } from "lucide-react";
import { FreePlanBanner } from "../../../../components/FreePlanBanner";
import { useGetSite, useSiteHasData } from "../../../../api/admin/hooks/useSites";
import { useStore } from "../../../../lib/store";
import { userStore } from "../../../../lib/userStore";
import { DemoSignupBanner } from "./DemoSignupBanner";
import { NoData } from "./NoData";
import { UsageBanners } from "./UsageBanners";

function SetupTrackingBanner() {
  const { site } = useStore();
  const { data: siteData } = useGetSite(site);
  const { data: siteHasData } = useSiteHasData(site);

  if (!siteData || siteData.onboardingCompletedAt || siteHasData) return null;

  return (
    <Link
      href={`/${site}/onboarding`}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-500/10 border border-accent-500/30 text-accent-600 dark:text-accent-400 hover:bg-accent-500/20 transition-colors text-sm font-medium mt-2"
    >
      <Rocket className="w-3.5 h-3.5 shrink-0" />
      Finish setting up tracking →
    </Link>
  );
}

export function Header() {
  const { user } = userStore();
  const pathname = usePathname();

  return (
    <div className="flex flex-col">
      {user && !pathname.includes("/globe") && !pathname.includes("/onboarding") && (
        <div className="flex flex-col px-2 md:px-4">
          <DemoSignupBanner />
          <FreePlanBanner />
          <UsageBanners />
          <SetupTrackingBanner />
          <NoData />
        </div>
      )}
    </div>
  );
}
