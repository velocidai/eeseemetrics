"use client";

import { useState, useEffect } from "react";
import { Card } from "./Card";
import { Bell, Check, X } from "lucide-react";

type Severity = "high" | "medium" | "low";

const ALERTS: {
  severity: Severity;
  metric: string;
  change: string;
  desc: string;
  time: string;
  bad: boolean;
}[] = [
  {
    severity: "high",
    metric: "Sessions",
    change: "-42%",
    desc: "Down from 847 → 491 vs. 30-day avg",
    time: "2h ago",
    bad: true,
  },
  {
    severity: "medium",
    metric: "Pageviews",
    change: "+138%",
    desc: "Up from 2,341 → 5,572 vs. 30-day avg",
    time: "1d ago",
    bad: false,
  },
  {
    severity: "low",
    metric: "Bounce rate",
    change: "-18%",
    desc: "Down from 54% → 44% vs. 30-day avg",
    time: "3d ago",
    bad: false,
  },
];

const SEVERITY_STYLE: Record<Severity, { badge: string; label: string }> = {
  high:   { badge: "bg-red-500/10 text-red-500 border border-red-500/20",    label: "High"   },
  medium: { badge: "bg-orange-500/10 text-orange-500 border border-orange-500/20", label: "Medium" },
  low:    { badge: "bg-amber-500/10 text-amber-500 border border-amber-500/20",    label: "Low"    },
};

export function AnomalyDetection({ bare }: { bare?: boolean } = {}) {
  const [visible, setVisible] = useState([false, false, false]);

  useEffect(() => {
    const timers = ALERTS.map((_, i) =>
      setTimeout(() => {
        setVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 200 + i * 250)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <Card
      bare={bare}
      title="Alerts before you notice"
      description="Daily checks for unusual spikes or drops in sessions, pageviews, and bounce rate."
      icon={Bell}
    >
      <div className="mt-4 space-y-2">
        {ALERTS.map((a, i) => {
          const s = SEVERITY_STYLE[a.severity];
          return (
            <div
              key={i}
              className="rounded-xl border border-neutral-300/60 dark:border-neutral-700/60 bg-neutral-50 dark:bg-neutral-900 p-3"
              style={{
                opacity: visible[i] ? 1 : 0,
                transform: visible[i] ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 300ms ease-out, transform 300ms ease-out",
              }}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${s.badge}`}>
                      {s.label}
                    </span>
                    <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      {a.metric}
                    </span>
                    <span className={`text-xs font-semibold ml-auto ${a.bad ? "text-red-500" : "text-[#2FC7B8]"}`}>
                      {a.change}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{a.desc}</p>
                  <p className="text-[9px] text-neutral-400 mt-1">Detected {a.time}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0 mt-0.5">
                  <button className="p-1 rounded text-neutral-400 hover:text-[#2FC7B8] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                    <Check className="w-3 h-3" />
                  </button>
                  <button className="p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-red-500/5 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
