"use client";
import { ArrowLeft, Building2, CreditCard, UserCircle } from "lucide-react";
import Link from "next/link";
import { useExtracted } from "next-intl";
import { usePathname } from "next/navigation";
import { Sidebar } from "../../../components/sidebar/Sidebar";
import { IS_CLOUD } from "../../../lib/const";

export function SettingsSidebar() {
  const t = useExtracted();
  const pathname = usePathname();

  return (
    <Sidebar.Root>
      <div className="p-3 border-b border-neutral-200 dark:border-neutral-800">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("Back to app")}
        </Link>
      </div>
      <Sidebar.Items>
        <Sidebar.Item
          label={t("Account")}
          active={pathname.startsWith("/settings/account")}
          href={"/settings/account"}
          icon={<UserCircle className="w-4 h-4" />}
        />
        <Sidebar.Item
          label={t("Organization")}
          active={pathname.startsWith("/settings/organization/members")}
          href={"/settings/organization"}
          icon={<Building2 className="w-4 h-4" />}
        />
        {IS_CLOUD && (
          <Sidebar.Item
            label={t("Subscription")}
            active={pathname.startsWith("/settings/organization/subscription")}
            href={"/settings/organization/subscription"}
            icon={<CreditCard className="w-4 h-4" />}
          />
        )}
      </Sidebar.Items>
    </Sidebar.Root>
  );
}
