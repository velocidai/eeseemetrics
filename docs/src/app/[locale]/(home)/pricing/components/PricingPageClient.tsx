"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { BackgroundGrid } from "@/components/BackgroundGrid";
import { PricingSection } from "@/components/PricingSection";
import { ComparisonSection } from "./ComparisonSection";
import { LTD_CONFIG } from "@/lib/ltd-config";

function LtdCallout() {
  const slotsLeft =
    LTD_CONFIG.slots.tier1 + LTD_CONFIG.slots.tier2 + LTD_CONFIG.slots.tier3;

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 pt-8">
      <Link
        href="/lifetime-deal"
        className="flex items-center justify-between gap-4 rounded-xl border-2 border-[#2FC7B8] bg-[#2FC7B8]/5 hover:bg-[#2FC7B8]/10 transition-colors px-6 py-4 group"
      >
        <div className="flex items-center gap-3">
          <Flame className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <p className="font-semibold text-sm sm:text-base">
              Lifetime Deal Available
            </p>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              Pay once, use forever. Starter plan from{" "}
              <span className="font-semibold text-[#2FC7B8]">$49 one-time</span>.
              {slotsLeft > 0 && (
                <span className="ml-2 text-amber-400 font-medium">
                  Only {slotsLeft} slots remaining.
                </span>
              )}
            </p>
          </div>
        </div>
        <span className="text-[#2FC7B8] text-sm font-medium whitespace-nowrap group-hover:underline shrink-0">
          See the lifetime deal →
        </span>
      </Link>
    </div>
  );
}

export function PricingPageClient() {
  const [isAnnual, setIsAnnual] = useState(true);
  return (
    <div className="flex flex-col items-center justify-center overflow-x-hidden">
      <BackgroundGrid />
      {LTD_CONFIG.active && <LtdCallout />}
      <PricingSection isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
      <ComparisonSection isAnnual={isAnnual} />
    </div>
  );
}
