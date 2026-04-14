"use client";
import {
  Activity,
  AlertTriangle,
  Bell,
  BellDot,
  BookOpen,
  Bookmark,
  Building2,
  ChartColumnDecreasing,
  Code,
  CreditCard,
  File,
  Funnel,
  Gauge,
  Globe2,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MousePointerClick,
  Rewind,
  Search,
  Settings,
  Sparkles,
  Split,
  Target,
  User,
  Video,
} from "lucide-react";
import { useExtracted } from "next-intl";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { useGetSite } from "../../../../api/admin/hooks/useSites";
import { useGetAlertUnreadCount } from "../../../../api/insights/hooks/useGetAlertUnreadCount";
import { Sidebar as SidebarComponents } from "../../../../components/sidebar/Sidebar";
import { SiteSettings } from "../../../../components/SiteSettings/SiteSettings";
import { ThemeSwitcher } from "../../../../components/ThemeSwitcher";
import { authClient } from "../../../../lib/auth";
import { IS_CLOUD } from "../../../../lib/const";
import { useStripeSubscription } from "../../../../lib/subscription/useStripeSubscription";
import { useSignout } from "../../../../hooks/useSignout";
import { getPlanTier, tierAtLeast } from "../../../../lib/tier";
import { useEmbedablePage } from "../../utils";
import { SiteSelector } from "./SiteSelector";

export function SidebarContent() {
  const t = useExtracted();
  const { data: subscription } = useStripeSubscription();
  const session = authClient.useSession();
  const pathname = usePathname();
  const embed = useEmbedablePage();
  const signout = useSignout();

  const { data: site } = useGetSite(Number(pathname.split("/")[1]));

  const planTier = getPlanTier(subscription?.planName);
  const hasInsightsAccess = IS_CLOUD ? tierAtLeast(planTier, "pro") : true;
  const isStarterGated = IS_CLOUD && planTier === "starter";

  const siteId = site?.siteId;
  const { data: unreadData } = useGetAlertUnreadCount(siteId);
  const unreadCount = unreadData?.count ?? 0;

  const getTabPath = (tabName: string) => {
    const segments = pathname.split("/").filter(Boolean);
    const siteId = segments[0];
    const hasPrivateKey = segments.length > 1 && /^[a-f0-9]{12}$/i.test(segments[1]);
    const privateKey = hasPrivateKey ? segments[1] : null;
    const basePath = privateKey
      ? `/${siteId}/${privateKey}/${tabName.toLowerCase()}`
      : `/${siteId}/${tabName.toLowerCase()}`;
    return `${basePath}${embed ? "?embed=true" : ""}`;
  };

  const isActiveTab = (tabName: string) => {
    if (!pathname.includes("/")) return false;
    const segments = pathname.split("/").filter(Boolean);
    const hasPrivateKey = segments.length > 1 && /^[a-f0-9]{12}$/i.test(segments[1]);
    const route = hasPrivateKey ? segments[2] || "main" : segments[1] || "main";
    return route === tabName.toLowerCase();
  };

  return (
    <div className="w-56 bg-neutral-50 border-r border-neutral-150 dark:bg-neutral-900 dark:border-neutral-850 flex flex-col h-dvh">
      <div className="flex flex-col p-3 border-b border-neutral-200 dark:border-neutral-800">
        <SiteSelector />
      </div>
      <div className="flex flex-col p-3 pt-1 overflow-y-auto flex-1">

        {/* ── Analytics ──────────────────────────────────────── */}
        <SidebarComponents.SectionHeader sectionKey="analytics">
          {t("Analytics")}
        </SidebarComponents.SectionHeader>
        <SidebarComponents.Item
          label={t("Main")}
          active={isActiveTab("main")}
          href={getTabPath("main")}
          icon={<LayoutDashboard className="w-4 h-4" />}
        />
        {IS_CLOUD && (
          isStarterGated ? (
            <SidebarComponents.LockedItem label={t("Pages")} icon={<File className="w-4 h-4" />} />
          ) : (
            <SidebarComponents.Item
              label={t("Pages")}
              active={isActiveTab("pages")}
              href={getTabPath("pages")}
              icon={<File className="w-4 h-4" />}
            />
          )
        )}
        <SidebarComponents.Item
          label={t("Map")}
          active={isActiveTab("globe")}
          href={getTabPath("globe")}
          icon={<Globe2 className="w-4 h-4" />}
        />
        {IS_CLOUD && (
          isStarterGated ? (
            <SidebarComponents.LockedItem label={t("Performance")} icon={<Gauge className="w-4 h-4" />} />
          ) : (
            <SidebarComponents.Item
              label={t("Performance")}
              active={isActiveTab("performance")}
              href={getTabPath("performance")}
              icon={<Gauge className="w-4 h-4" />}
            />
          )
        )}
        {IS_CLOUD && (
          isStarterGated ? (
            <SidebarComponents.LockedItem label={t("Search Console")} icon={<Search className="w-4 h-4" />} />
          ) : (
            <SidebarComponents.Item
              label={t("Search Console")}
              active={isActiveTab("search-console")}
              href={getTabPath("search-console")}
              icon={<Search className="w-4 h-4" />}
            />
          )
        )}

        {/* ── Behavior ───────────────────────────────────────── */}
        <SidebarComponents.SectionHeader sectionKey="behavior">
          {t("Behavior")}
        </SidebarComponents.SectionHeader>
        <div className="hidden md:block">
          {isStarterGated ? (
            <SidebarComponents.LockedItem label={t("Replay")} icon={<Video className="w-4 h-4" />} />
          ) : (
            <SidebarComponents.Item
              label={t("Replay")}
              active={isActiveTab("replay")}
              href={getTabPath("replay")}
              icon={<Video className="w-4 h-4" />}
            />
          )}
        </div>
        {isStarterGated ? (
          <SidebarComponents.LockedItem label={t("Funnels")} icon={<Funnel className="w-4 h-4" />} />
        ) : (
          <SidebarComponents.Item
            label={t("Funnels")}
            active={isActiveTab("funnels")}
            href={getTabPath("funnels")}
            icon={<Funnel className="w-4 h-4" />}
          />
        )}
        {isStarterGated ? (
          <SidebarComponents.LockedItem label={t("Journeys")} icon={<Split className="w-4 h-4" />} />
        ) : (
          <SidebarComponents.Item
            label={t("Journeys")}
            active={isActiveTab("journeys")}
            href={getTabPath("journeys")}
            icon={<Split className="w-4 h-4" />}
          />
        )}
        {isStarterGated ? (
          <SidebarComponents.LockedItem label={t("Retention")} icon={<ChartColumnDecreasing className="w-4 h-4" />} />
        ) : (
          <SidebarComponents.Item
            label={t("Retention")}
            active={isActiveTab("retention")}
            href={getTabPath("retention")}
            icon={<ChartColumnDecreasing className="w-4 h-4" />}
          />
        )}

        {/* ── Conversions ────────────────────────────────────── */}
        <SidebarComponents.SectionHeader sectionKey="conversions">
          {t("Conversions")}
        </SidebarComponents.SectionHeader>
        <SidebarComponents.Item
          label={t("Goals")}
          active={isActiveTab("goals")}
          href={getTabPath("goals")}
          icon={<Target className="w-4 h-4" />}
        />
        {(!IS_CLOUD || planTier !== "starter") && (
          <SidebarComponents.Item
            label={t("Campaigns")}
            active={isActiveTab("campaigns")}
            href={getTabPath("campaigns")}
            icon={<Megaphone className="w-4 h-4" />}
          />
        )}

        {/* ── Activity ───────────────────────────────────────── */}
        <SidebarComponents.SectionHeader sectionKey="activity">
          {t("Activity")}
        </SidebarComponents.SectionHeader>
        {isStarterGated ? (
          <SidebarComponents.LockedItem label={t("Sessions")} icon={<Rewind className="w-4 h-4" />} />
        ) : (
          <SidebarComponents.Item
            label={t("Sessions")}
            active={isActiveTab("sessions")}
            href={getTabPath("sessions")}
            icon={<Rewind className="w-4 h-4" />}
          />
        )}
        {isStarterGated ? (
          <SidebarComponents.LockedItem label={t("Users")} icon={<User className="w-4 h-4" />} />
        ) : (
          <SidebarComponents.Item
            label={t("Users")}
            active={isActiveTab("users")}
            href={getTabPath("users")}
            icon={<User className="w-4 h-4" />}
          />
        )}
        <SidebarComponents.Item
          label={t("Events")}
          active={isActiveTab("events")}
          href={getTabPath("events")}
          icon={<MousePointerClick className="w-4 h-4" />}
        />
        {isStarterGated ? (
          <SidebarComponents.LockedItem label={t("Errors")} icon={<AlertTriangle className="w-4 h-4" />} />
        ) : (
          <SidebarComponents.Item
            label={t("Errors")}
            active={isActiveTab("errors")}
            href={getTabPath("errors")}
            icon={<AlertTriangle className="w-4 h-4" />}
          />
        )}

        {/* ── Insights ─────────────────────────────────────── */}
        <SidebarComponents.SectionHeader sectionKey="insights">
          {t("Insights")}
        </SidebarComponents.SectionHeader>
        {isStarterGated ? (
          <SidebarComponents.LockedItem label={t("Alerts")} icon={<BellDot className="w-4 h-4" />} />
        ) : (
          <SidebarComponents.Item
            label={t("Alerts")}
            active={isActiveTab("alerts")}
            href={getTabPath("alerts")}
            icon={<BellDot className="w-4 h-4" />}
            badge={unreadCount}
          />
        )}
        {isStarterGated ? (
          <SidebarComponents.LockedItem label={t("Reports")} icon={<Sparkles className="w-4 h-4" />} />
        ) : hasInsightsAccess ? (
          <SidebarComponents.Item
            label={t("Reports")}
            active={isActiveTab("reports")}
            href={getTabPath("reports")}
            icon={<Sparkles className="w-4 h-4" />}
          />
        ) : null}

        {/* ── Monitoring ─────────────────────────────────────── */}
        <SidebarComponents.SectionHeader sectionKey="monitoring">
          {t("Monitoring")}
        </SidebarComponents.SectionHeader>
        <SidebarComponents.Item
          label={t("Monitors")}
          active={pathname.startsWith(getTabPath("uptime/monitors"))}
          href={getTabPath("uptime/monitors")}
          icon={<Activity className="w-4 h-4" />}
        />
        <SidebarComponents.Item
          label={t("Incidents")}
          active={pathname.startsWith(getTabPath("uptime/incidents"))}
          href={getTabPath("uptime/incidents")}
          icon={<AlertTriangle className="w-4 h-4" />}
        />
        <SidebarComponents.Item
          label={t("Status Page")}
          active={pathname.startsWith(getTabPath("uptime/status-page"))}
          href={getTabPath("uptime/status-page")}
          icon={<Globe2 className="w-4 h-4" />}
        />

        {/* ── Developer ──────────────────────────────────────── */}
        <div className="hidden md:block">
          <SidebarComponents.SectionHeader sectionKey="developer">
            {t("Developer")}
          </SidebarComponents.SectionHeader>
          <SidebarComponents.Item
            label={t("API Playground")}
            active={isActiveTab("api-playground")}
            href={getTabPath("api-playground")}
            icon={<Code className="w-4 h-4" />}
          />
          <SidebarComponents.Item
            label={t("Documentation")}
            href={`${process.env.NEXT_PUBLIC_DOCS_URL ?? "https://docs.eeseemetrics.com"}/docs`}
            target="_blank"
            active={false}
            icon={<BookOpen className="w-4 h-4" />}
          />
        </div>

        {/* ── Settings ───────────────────────────────────────── */}
        {session.data && !embed && (
          <>
            <SidebarComponents.SectionHeader>
              {t("Settings")}
            </SidebarComponents.SectionHeader>
            <SiteSettings
              siteId={site?.siteId ?? 0}
              trigger={
                <div className="px-3 py-2 rounded-lg transition-colors w-full text-neutral-700 hover:text-neutral-900 hover:bg-neutral-150 dark:text-neutral-200 dark:hover:text-white dark:hover:bg-neutral-800/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">{t("Site Settings")}</span>
                  </div>
                </div>
              }
            />
            <SidebarComponents.Item
              href={`/${pathname.split("/").filter(Boolean)[0]}/settings/notifications`}
              label={t("Notifications")}
              icon={<Bell className="h-4 w-4" />}
              active={pathname === `/${pathname.split("/").filter(Boolean)[0]}/settings/notifications`}
            />
            <SidebarComponents.Item
              href={`/${pathname.split("/").filter(Boolean)[0]}/settings/saved-views`}
              label={t("Saved Views")}
              icon={<Bookmark className="h-4 w-4" />}
              active={pathname === `/${pathname.split("/").filter(Boolean)[0]}/settings/saved-views`}
            />
          </>
        )}

        {/* ── Account ────────────────────────────────────────── */}
        {session.data && !embed && (
          <>
            <SidebarComponents.SectionHeader>
              {t("Account")}
            </SidebarComponents.SectionHeader>
            <SidebarComponents.Item
              href="/settings/account"
              label={t("Account")}
              icon={<User className="h-4 w-4" />}
              active={pathname.startsWith("/settings/account")}
            />
            <SidebarComponents.Item
              href="/settings/organization"
              label={t("Organization")}
              icon={<Building2 className="h-4 w-4" />}
              active={pathname.startsWith("/settings/organization/members") || pathname === "/settings/organization"}
            />
            {IS_CLOUD && (
              <SidebarComponents.Item
                href="/settings/organization/subscription"
                label={t("Subscription")}
                icon={<CreditCard className="h-4 w-4" />}
                active={pathname.startsWith("/settings/organization/subscription")}
              />
            )}
          </>
        )}
      </div>

      {/* ── Bottom bar: theme + sign out ───────────────────── */}
      {session.data && !embed && (
        <div className="shrink-0 border-t border-neutral-200 dark:border-neutral-800 px-3 py-2 flex items-center justify-between">
          <ThemeSwitcher />
          <button
            onClick={signout}
            className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t("Sign out")}
          </button>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  return (
    <Suspense fallback={null}>
      <SidebarContent />
    </Suspense>
  );
}
