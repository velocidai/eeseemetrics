"use client";

import { useState, useEffect } from "react";
import { Card } from "./Card";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";

const VITALS = [
  { abbr: "LCP",  name: "Largest Contentful Paint", value: "2.4",  unit: "s",  good: true,  change: -0.2, changeUnit: "s"  },
  { abbr: "INP",  name: "Interaction to Next Paint", value: "110",  unit: "ms", good: true,  change: -8,   changeUnit: "ms" },
  { abbr: "CLS",  name: "Cumulative Layout Shift",   value: "0.08", unit: "",   good: true,  change: 0.01, changeUnit: ""   },
  { abbr: "FCP",  name: "First Contentful Paint",    value: "1.8",  unit: "s",  good: true,  change: -0.1, changeUnit: "s"  },
  { abbr: "TTFB", name: "Time to First Byte",        value: "420",  unit: "ms", good: true,  change: -15,  changeUnit: "ms" },
];

// Bar fill widths as % of threshold (LCP 4s, INP 200ms, CLS 0.25, FCP 3s, TTFB 800ms)
const BAR_PCT = [60, 55, 32, 60, 53];

export function WebVitals({ bare }: { bare?: boolean } = {}) {
  const [barsVisible, setBarsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBarsVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <Card
      bare={bare}
      title="Core Web Vitals"
      description="Monitor LCP, INP, CLS, FCP, and TTFB — the five metrics Google uses to measure page experience."
      icon={Activity}
    >
      <div className="mt-4 rounded-lg border border-neutral-300/50 dark:border-neutral-800/50 bg-neutral-100/50 dark:bg-neutral-900/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-200/40 dark:bg-neutral-800/40">
          <span className="text-[10px] font-medium text-neutral-500">Web Vitals · p75 · Last 28 days</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#2FC7B8]/10 text-[#2FC7B8] font-medium">All Good</span>
        </div>

        {/* Metrics list */}
        <div className="divide-y divide-neutral-200/40 dark:divide-neutral-800/40">
          {VITALS.map((v, i) => {
            const improved = v.change < 0;
            return (
              <div key={v.abbr} className="px-3 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-200 w-9">{v.abbr}</span>
                  <span className="text-[9px] text-neutral-400 flex-1 truncate">{v.name}</span>
                  <div className={`flex items-center gap-0.5 text-[9px] font-medium ${improved ? "text-[#2FC7B8]" : "text-red-400"}`}>
                    {improved ? <TrendingDown className="w-2.5 h-2.5" /> : <TrendingUp className="w-2.5 h-2.5" />}
                    {Math.abs(v.change)}{v.changeUnit}
                  </div>
                  <span className="text-xs font-semibold text-[#2FC7B8] w-14 text-right">
                    {v.value}{v.unit && <span className="text-[9px] font-normal text-neutral-400 ml-0.5">{v.unit}</span>}
                  </span>
                </div>
                <div className="h-1 bg-neutral-200 dark:bg-neutral-700/60 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#2FC7B8] transition-all duration-700 ease-out"
                    style={{ width: barsVisible ? `${BAR_PCT[i]}%` : "0%" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export default WebVitals;
