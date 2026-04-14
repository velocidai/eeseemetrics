"use client";

import { useState, useEffect } from "react";
import { Card } from "./Card";
import { Users } from "lucide-react";

const PERIODS = ["Period 0", "Period 1", "Period 2", "Period 3"];
const COHORTS = [
  { label: "Mar 17", users: 234, values: [100, 43, 31, 24] as (number | null)[] },
  { label: "Mar 24", users: 198, values: [100, 45, 28, null] as (number | null)[] },
  { label: "Mar 31", users: 212, values: [100, 39, null, null] as (number | null)[] },
  { label: "Apr 7",  users: 241, values: [100, null, null, null] as (number | null)[] },
];

function cellBg(v: number | null): string {
  if (v === null) return "transparent";
  if (v === 0) return "rgba(16,185,129,0.05)";
  const log = Math.log(1 + v) / Math.log(101);
  const lin = v / 100;
  const opacity = 0.6 * log + 0.4 * lin;
  return `rgba(16,185,129,${Math.max(0.12, opacity * 0.95).toFixed(2)})`;
}

export function RetentionCohort({ bare }: { bare?: boolean } = {}) {
  const [rowsVisible, setRowsVisible] = useState([false, false, false, false]);

  useEffect(() => {
    const timers = COHORTS.map((_, i) =>
      setTimeout(() => {
        setRowsVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 200 + i * 200)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <Card
      bare={bare}
      title="See who keeps coming back"
      description="Cohort retention grid — track how many users return each period after their first visit."
      icon={Users}
    >
      <div className="mt-4 rounded-lg border border-neutral-300/50 dark:border-neutral-800/50 overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] bg-neutral-200/60 dark:bg-neutral-800/60">
          <div className="px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-neutral-500">
            Cohort
          </div>
          {PERIODS.map((p) => (
            <div
              key={p}
              className="px-1 py-1.5 text-center text-[9px] font-semibold uppercase tracking-wide text-neutral-500 border-l border-neutral-200/60 dark:border-neutral-700/60"
            >
              {p}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {COHORTS.map((c, ri) => (
          <div
            key={c.label}
            className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] border-t border-neutral-200/40 dark:border-neutral-800/40"
            style={{
              opacity: rowsVisible[ri] ? 1 : 0,
              transform: rowsVisible[ri] ? "translateY(0)" : "translateY(4px)",
              transition: "opacity 300ms ease-out, transform 300ms ease-out",
            }}
          >
            <div className="px-2 py-2 bg-neutral-100/80 dark:bg-neutral-900/60">
              <div className="text-[10px] font-medium text-neutral-700 dark:text-neutral-200">{c.label}</div>
              <div className="text-[9px] text-neutral-400">{c.users} users</div>
            </div>
            {c.values.map((v, ci) => (
              <div
                key={ci}
                className="flex items-center justify-center border-l border-neutral-200/40 dark:border-neutral-700/40 py-2"
                style={{ backgroundColor: cellBg(v) }}
              >
                <span
                  className="text-[10px] font-medium"
                  style={{ color: v !== null ? "white" : "transparent" }}
                >
                  {v !== null ? `${v}%` : "—"}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
