"use client";

import { useState, useEffect } from "react";
import { Card } from "./Card";
import { Search, TrendingUp, TrendingDown } from "lucide-react";

const QUERIES = [
  { query: "web analytics without cookies", clicks: 342, impressions: 4820, ctr: 7.1, pos: 2.3, posChange: -0.4 },
  { query: "privacy first analytics", clicks: 218, impressions: 3150, ctr: 6.9, pos: 3.1, posChange: -0.8 },
  { query: "google analytics alternative", clicks: 187, impressions: 8940, ctr: 2.1, pos: 7.4, posChange: +1.2 },
  { query: "gdpr compliant analytics", clicks: 143, impressions: 2210, ctr: 6.5, pos: 4.0, posChange: -0.5 },
  { query: "plausible analytics pricing", clicks: 96, impressions: 1870, ctr: 5.1, pos: 5.8, posChange: +0.3 },
];

export function SearchConsoleCard({ bare }: { bare?: boolean } = {}) {
  const [visible, setVisible] = useState([false, false, false, false, false]);

  useEffect(() => {
    const timers = QUERIES.map((_, i) =>
      setTimeout(() => {
        setVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 150 + i * 160)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <Card
      bare={bare}
      title="Your SEO data, where your analytics live"
      description="Queries, clicks, CTR, and average position — inside your Eesee Metrics dashboard."
      icon={Search}
    >
      <div className="mt-4 rounded-lg border border-neutral-300/50 dark:border-neutral-800/50 bg-neutral-100/50 dark:bg-neutral-900/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-200/40 dark:bg-neutral-800/40">
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4"/>
              <path d="M12 2v10l8.66 5A10 10 0 0 0 12 2z" fill="#34A853"/>
              <path d="M12 12 3.34 17A10 10 0 0 0 12 22V12z" fill="#FBBC05"/>
              <path d="M12 12 3.34 7A10 10 0 0 0 3.34 17L12 12z" fill="#EA4335"/>
            </svg>
            <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">Search Console · Last 28 days</span>
          </div>
          <span className="ml-auto text-[10px] text-[#2FC7B8]">986 total clicks</span>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-1.5 border-b border-neutral-200/40 dark:border-neutral-800/40">
          <span className="text-[9px] font-medium uppercase tracking-wide text-neutral-400">Query</span>
          <span className="text-[9px] font-medium uppercase tracking-wide text-neutral-400 text-right">Clicks</span>
          <span className="text-[9px] font-medium uppercase tracking-wide text-neutral-400 text-right">CTR</span>
          <span className="text-[9px] font-medium uppercase tracking-wide text-neutral-400 text-right">Pos</span>
        </div>

        {/* Query rows */}
        <div className="divide-y divide-neutral-200/40 dark:divide-neutral-800/40">
          {QUERIES.map((q, i) => (
            <div
              key={q.query}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center px-3 py-2"
              style={{
                opacity: visible[i] ? 1 : 0,
                transform: visible[i] ? "translateY(0)" : "translateY(5px)",
                transition: "opacity 300ms ease-out, transform 300ms ease-out",
              }}
            >
              <span className="text-[10px] text-neutral-700 dark:text-neutral-300 truncate">{q.query}</span>
              <span className="text-[10px] font-medium tabular-nums text-right">{q.clicks}</span>
              <span className="text-[10px] text-[#2FC7B8] tabular-nums text-right">{q.ctr}%</span>
              <div className="flex items-center gap-0.5 justify-end">
                <span className="text-[10px] tabular-nums">{q.pos}</span>
                {q.posChange < 0 ? (
                  <TrendingUp className="w-2.5 h-2.5 text-[#2FC7B8]" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5 text-red-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
