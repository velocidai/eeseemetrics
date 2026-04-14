"use client";

import { useState, useEffect } from "react";
import { Card } from "./Card";
import { AlertTriangle, ChevronRight, ChevronDown } from "lucide-react";

// Sparkline bar data per error (14 buckets, last 2 days)
const ERRORS = [
  {
    name: "TypeError",
    message: "Cannot read properties of undefined (reading 'map')",
    bars: [4, 6, 3, 8, 5, 7, 4, 6, 9, 12, 8, 14, 18, 16],
    occurrences: 143,
    sessions: 38,
  },
  {
    name: "ReferenceError",
    message: "analyticsInit is not defined",
    bars: [1, 2, 1, 3, 2, 1, 2, 3, 2, 4, 3, 5, 6, 7],
    occurrences: 67,
    sessions: 21,
  },
  {
    name: "NetworkError",
    message: "Failed to fetch /api/track — net::ERR_ABORTED",
    bars: [0, 1, 0, 1, 2, 0, 1, 0, 2, 1, 0, 2, 3, 2],
    occurrences: 29,
    sessions: 14,
  },
];

function Sparkline({ bars, hovering }: { bars: number[]; hovering: boolean }) {
  const max = Math.max(...bars);
  return (
    <svg viewBox={`0 0 ${bars.length * 8} 32`} className="w-full h-8" preserveAspectRatio="none">
      {bars.map((v, i) => {
        const h = max > 0 ? (v / max) * 28 : 2;
        return (
          <rect
            key={i}
            x={i * 8 + 1}
            y={32 - h}
            width={6}
            height={h}
            rx={1}
            fill={hovering ? "#2FC7B8" : "#2FC7B880"}
            style={{ transition: "fill 200ms" }}
          />
        );
      })}
    </svg>
  );
}

export function ErrorTrackingCard({ bare }: { bare?: boolean } = {}) {
  const [visible, setVisible] = useState([false, false, false]);
  const [expanded, setExpanded] = useState(false);
  const [hovering, setHovering] = useState<number | null>(null);

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisible([true, false, false]), 150),
      setTimeout(() => setVisible([true, true, false]), 400),
      setTimeout(() => setVisible([true, true, true]), 650),
      setTimeout(() => setExpanded(true), 1500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <Card
      bare={bare}
      title="Catch JS errors as they happen"
      description="Every unhandled exception with occurrence count, affected sessions, and a frequency sparkline."
      icon={AlertTriangle}
    >
      <div className="mt-4 space-y-2">
        {ERRORS.map((e, i) => (
          <div
            key={e.name}
            className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
            style={{
              opacity: visible[i] ? 1 : 0,
              transform: visible[i] ? "translateY(0)" : "translateY(6px)",
              transition: "opacity 350ms ease-out, transform 350ms ease-out",
            }}
            onMouseEnter={() => setHovering(i)}
            onMouseLeave={() => setHovering(null)}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 p-3">
              {/* Left: name + message */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">{e.name}</p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">{e.message}</p>
              </div>

              {/* Right: sparkline + counts + chevron */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-28 h-8">
                  <Sparkline bars={e.bars} hovering={hovering === i} />
                </div>
                <div className="text-center min-w-[56px]">
                  <div className="text-sm font-semibold">{e.occurrences}</div>
                  <div className="text-[9px] text-neutral-400">occurrences</div>
                </div>
                <div className="text-center min-w-[48px]">
                  <div className="text-sm font-semibold">{e.sessions}</div>
                  <div className="text-[9px] text-neutral-400">sessions</div>
                </div>
                {i === 0 ? (
                  expanded
                    ? <ChevronDown className="w-3.5 h-3.5 text-neutral-400" strokeWidth={3} />
                    : <ChevronRight className="w-3.5 h-3.5 text-neutral-400" strokeWidth={3} />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400" strokeWidth={3} />
                )}
              </div>
            </div>

            {/* Expanded stack trace for first error */}
            {i === 0 && expanded && (
              <div
                className="border-t border-neutral-100 dark:border-neutral-800 px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800/50"
                style={{ opacity: expanded ? 1 : 0, transition: "opacity 400ms" }}
              >
                <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-wide mb-1.5">Stack trace</p>
                <div className="font-mono text-[9px] text-neutral-500 dark:text-neutral-400 space-y-0.5">
                  <div><span className="text-red-400">TypeError</span> at <span className="text-[#2FC7B8]">bundle.js:4821</span></div>
                  <div className="opacity-70">at renderList (components/List.tsx:34)</div>
                  <div className="opacity-50">at App (app.tsx:12)</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
