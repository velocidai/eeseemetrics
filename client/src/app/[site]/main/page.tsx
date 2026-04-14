"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetSite } from "@/api/admin/hooks/useGetSite";
import { useGetLiveUserCount } from "../../../api/analytics/hooks/useGetLiveUserCount";
import { useSetPageTitle } from "../../../hooks/useSetPageTitle";
import { IS_CLOUD } from "../../../lib/const";
import { useStore } from "../../../lib/store";
import { SubHeader } from "../components/SubHeader/SubHeader";
import { MainSection } from "./components/MainSection/MainSection";
import { Countries } from "./components/sections/Countries";
import { Devices } from "./components/sections/Devices";
import { Events } from "./components/sections/Events";
import { InsightsPreview } from "./components/sections/InsightsPreview";
import { Network } from "./components/sections/Network";
import { Pages } from "./components/sections/Pages";
import { Referrers } from "./components/sections/Referrers";
import { Weekdays } from "./components/sections/Weekdays";

export default function MainPage() {
  const { site } = useStore();

  if (!site) {
    return null;
  }

  return <MainPageContent />;
}

function MainPageContent() {
  const { site } = useStore();
  const router = useRouter();
  const { data: siteData, isLoading: isSiteLoading } = useGetSite(Number(site));

  useEffect(() => {
    if (isSiteLoading || !siteData) return;
    if (siteData.onboardingCompletedAt && process.env.NODE_ENV !== "development") return;
    if (typeof window !== "undefined") {
      const skipped = sessionStorage.getItem(`onboarding_skip_${site}`);
      if (!skipped) {
        router.push(`/${site}/onboarding`);
      }
    }
  }, [isSiteLoading, siteData, site, router]);

  const { data } = useGetLiveUserCount(5);

  useSetPageTitle(`${data?.count ?? "…"} user${data?.count === 1 ? "" : "s"} online`);

  return (
    <div className="p-2 md:p-4 max-w-[1100px] mx-auto space-y-3">
      <SubHeader pageInfo="main" />
      <MainSection />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
        <Referrers />
        <Pages />
        <Devices />
        <Countries />
        <Events />
        <Weekdays />
        {IS_CLOUD && <Network />}
        <InsightsPreview />
      </div>
    </div>
  );
}
