"use client";
import { ArrowRight, Crown, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { PielSectionInfo, type SidebarSectionKey } from "../PielPageInfo";

function Root({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-56 bg-neutral-50 border-r border-neutral-150 dark:bg-neutral-900 dark:border-neutral-850 flex flex-col">
      {children}
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col p-3 pt-4 border-b border-neutral-300 dark:border-neutral-800">
      <div className="text-base text-neutral-900 dark:text-neutral-100 mx-1 font-medium">{children}</div>
    </div>
  );
}

function SectionHeader({ children, sectionKey }: { children: React.ReactNode; sectionKey?: SidebarSectionKey }) {
  return (
    <div className="flex items-center gap-1 mt-3 mb-1 mx-3">
      <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">{children}</span>
      {sectionKey && <PielSectionInfo section={sectionKey} />}
    </div>
  );
}

function Items({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col p-3">{children}</div>;
}

function Item({
  label,
  active = false,
  href,
  icon,
  badge,
  target,
}: {
  label: string;
  active?: boolean;
  href: string;
  icon?: React.ReactNode;
  badge?: number;
  target?: string;
}) {
  return (
    <Link href={href} className="focus:outline-none" target={target}>
      <div
        className={cn(
          "px-3 py-2 rounded-lg transition-colors w-full",
          active
            ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
            : "text-neutral-800 hover:text-neutral-950 hover:bg-neutral-150 dark:text-neutral-200 dark:hover:text-white dark:hover:bg-neutral-800/50"
        )}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm flex-1">{label}</span>
          {badge != null && badge > 0 && (
            <span className="ml-auto text-xs font-medium bg-accent-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function LockedItem({
  label,
  icon,
  requiredPlan = "pro",
}: {
  label: string;
  icon?: React.ReactNode;
  requiredPlan?: "pro" | "scale";
}) {
  const [open, setOpen] = useState(false);
  const planName = requiredPlan === "scale" ? "Scale" : "Pro";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="px-3 py-2 rounded-lg transition-colors w-full text-left text-neutral-400 dark:text-neutral-600 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/30"
          onClick={() => setOpen(true)}
        >
          <div className="flex items-center gap-2">
            {icon && <span className="opacity-50">{icon}</span>}
            <span className="text-sm flex-1 opacity-70">{label}</span>
            <Lock className="w-3 h-3 opacity-50 shrink-0" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="center" className="w-64 p-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-500 shrink-0" />
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Upgrade to {planName} to unlock {label}
            </p>
          </div>
          <Link
            href="/subscribe"
            className="flex items-center justify-center gap-1.5 w-full rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-3 py-1.5 transition-colors"
            onClick={() => setOpen(false)}
          >
            Upgrade to {planName} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const Sidebar = { Root, Title, Item, Items, SectionHeader, LockedItem };
