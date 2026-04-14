"use client";

import { useState, useEffect } from "react";
import { Card } from "./Card";
import { Megaphone } from "lucide-react";

type Dim = "Campaign" | "Source" | "Medium";

const TABS: Dim[] = ["Campaign", "Source", "Medium"];

const DATA: Record<Dim, { name: string; sessions: number; delta: number | null; visitors: number; bounce: string; duration: string }[]> = {
  Campaign: [
    { name: "spring-launch",   sessions: 1240, delta: +18.3, visitors: 984,  bounce: "42.1%", duration: "3m 12s" },
    { name: "weekly-digest",   sessions:  843, delta: +31.0, visitors: 701,  bounce: "38.7%", duration: "4m 05s" },
    { name: "product-update",  sessions:  512, delta:  -8.2, visitors: 430,  bounce: "55.3%", duration: "1m 48s" },
    { name: "b2b-awareness",   sessions:  289, delta: +12.1, visitors: 241,  bounce: "47.9%", duration: "2m 31s" },
  ],
  Source: [
    { name: "google",      sessions: 2180, delta: +22.4, visitors: 1820, bounce: "43.2%", duration: "3m 01s" },
    { name: "newsletter",  sessions:  843, delta: +31.0, visitors: 701,  bounce: "38.7%", duration: "4m 05s" },
    { name: "twitter",     sessions:  512, delta:  -8.2, visitors: 430,  bounce: "55.3%", duration: "1m 48s" },
    { name: "linkedin",    sessions:  289, delta: +12.1, visitors: 241,  bounce: "47.9%", duration: "2m 31s" },
  ],
  Medium: [
    { name: "cpc",     sessions: 2180, delta: +22.4, visitors: 1820, bounce: "43.2%", duration: "3m 01s" },
    { name: "email",   sessions:  843, delta: +31.0, visitors: 701,  bounce: "38.7%", duration: "4m 05s" },
    { name: "social",  sessions:  801, delta:  -3.1, visitors: 671,  bounce: "51.4%", duration: "2m 04s" },
    { name: "organic", sessions:  512, delta: +14.8, visitors: 430,  bounce: "39.6%", duration: "3m 44s" },
  ],
};

function DeltaPill({ value }: { value: number | null }) {
  if (value == null) return <span className="text-neutral-400 text-xs">—</span>;
  const pos = value >= 0;
  return (
    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${pos ? "bg-[#2FC7B8]/10 text-[#2FC7B8]" : "bg-red-500/10 text-red-500"}`}>
      {pos ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
}

export function CampaignAnalytics({ bare }: { bare?: boolean } = {}) {
  const [activeDim, setActiveDim] = useState<Dim>("Campaign");
  const [visible, setVisible] = useState([false, false, false, false]);

  useEffect(() => {
    setVisible([false, false, false, false]);
    const timers = [0, 1, 2, 3].map((i) =>
      setTimeout(() => setVisible((prev) => { const n = [...prev]; n[i] = true; return n; }), 100 + i * 120)
    );
    return () => timers.forEach(clearTimeout);
  }, [activeDim]);

  const rows = DATA[activeDim];

  return (
    <Card
      bare={bare}
      title="See which campaigns actually work"
      description="UTM parameters captured automatically. Sessions, visitors, bounce rate, and period deltas in one table."
      icon={Megaphone}
    >
      {/* Dimension tabs */}
      <div className="flex gap-1 mt-4 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveDim(tab)}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors font-medium ${
              activeDim === tab
                ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-neutral-300/50 dark:border-neutral-800/50 bg-neutral-100/50 dark:bg-neutral-900/40 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-3 px-3 py-1.5 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-200/40 dark:bg-neutral-800/40">
          <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">{activeDim}</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400 text-right">Sessions</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400 text-right">Δ</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400 text-right">Visitors</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400 text-right">Bounce</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400 text-right">Duration</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-neutral-200/50 dark:divide-neutral-800/50">
          {rows.map((r, i) => (
            <div
              key={r.name}
              className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-x-3 items-center px-3 py-2"
              style={{
                opacity: visible[i] ? 1 : 0,
                transform: visible[i] ? "translateY(0)" : "translateY(5px)",
                transition: "opacity 300ms ease-out, transform 300ms ease-out",
              }}
            >
              <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">{r.name}</span>
              <span className="text-xs tabular-nums text-right">{r.sessions.toLocaleString()}</span>
              <div className="flex justify-end"><DeltaPill value={r.delta} /></div>
              <span className="text-xs tabular-nums text-right text-neutral-500">{r.visitors.toLocaleString()}</span>
              <span className="text-xs tabular-nums text-right text-neutral-500">{r.bounce}</span>
              <span className="text-xs tabular-nums text-right text-neutral-500">{r.duration}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
