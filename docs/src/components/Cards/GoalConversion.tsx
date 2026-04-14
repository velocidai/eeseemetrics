"use client";

import { useState, useEffect } from "react";
import { Card } from "./Card";
import { Target } from "lucide-react";

const GOALS = [
  { name: "Free trial signup", conversions: 284, rate: 4.7, delta: +23 },
  { name: "Checkout complete", conversions: 142, rate: 2.4, delta: +11 },
  { name: "Newsletter signup", conversions: 531, rate: 8.8, delta: -4 },
  { name: "Contact form sent", conversions: 97, rate: 1.6, delta: +8 },
];

const MAX_RATE = Math.max(...GOALS.map((g) => g.rate));

export function GoalConversion({ bare }: { bare?: boolean } = {}) {
  const [visible, setVisible] = useState([false, false, false, false]);

  useEffect(() => {
    const timers = GOALS.map((_, i) =>
      setTimeout(() => {
        setVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 200 + i * 180)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <Card
      bare={bare}
      title="Track what actually matters"
      description="Define conversion goals and see exactly how many visitors complete them — and from which campaigns."
      icon={Target}
    >
      <div className="mt-4 rounded-lg border border-neutral-300/50 dark:border-neutral-800/50 bg-neutral-100/50 dark:bg-neutral-900/40 divide-y divide-neutral-200/50 dark:divide-neutral-800/50 overflow-hidden">
        {GOALS.map((g, i) => {
          const pos = g.delta > 0;
          const barWidth = (g.rate / MAX_RATE) * 100;
          return (
            <div
              key={g.name}
              className="px-3 py-2.5"
              style={{
                opacity: visible[i] ? 1 : 0,
                transform: visible[i] ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 350ms ease-out, transform 350ms ease-out",
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">{g.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 tabular-nums">{g.conversions}</span>
                  <span className="text-xs text-[#2FC7B8] tabular-nums">{g.rate}%</span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      pos ? "bg-[#2FC7B8]/10 text-[#2FC7B8]" : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {pos ? "+" : ""}{g.delta}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2FC7B8]/70 rounded-full"
                  style={{
                    width: visible[i] ? `${barWidth}%` : "0%",
                    transition: "width 600ms ease-out",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
