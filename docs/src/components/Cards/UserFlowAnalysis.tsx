"use client";

import { useState, useEffect } from "react";
import { Card } from "./Card";
import { Route } from "lucide-react";

const BAR_W = 10;
const STEP_LABELS = ["Entry", "Page 2", "Page 3"];

type SNode = { col: number; x: number; y: number; h: number; label: string; color: string };
type SLink = { x1: number; x2: number; mx: number; sy1: number; sy2: number; ty1: number; ty2: number; color: string };

const NODES: SNode[] = [
  { col: 0, x: 35,  y: 10, h: 90, label: "/home",     color: "#2FC7B8" },
  { col: 1, x: 143, y: 6,  h: 38, label: "/pricing",  color: "#60a5fa" },
  { col: 1, x: 143, y: 48, h: 28, label: "/features", color: "#a78bfa" },
  { col: 1, x: 143, y: 80, h: 20, label: "/blog",     color: "#fb923c" },
  { col: 2, x: 253, y: 6,  h: 46, label: "/sign-up",  color: "#2FC7B8" },
  { col: 2, x: 253, y: 56, h: 38, label: "exit",      color: "#6b7280" },
];

// x1 = right edge of source bar, x2 = left edge of target bar
// MID_01 = (45 + 143) / 2 = 94, MID_12 = (153 + 253) / 2 = 203
const LINKS: SLink[] = [
  { x1: 45,  x2: 143, mx: 94,  sy1: 10, sy2: 48, ty1: 6,  ty2: 44, color: "#60a5fa" },
  { x1: 45,  x2: 143, mx: 94,  sy1: 48, sy2: 76, ty1: 48, ty2: 76, color: "#a78bfa" },
  { x1: 45,  x2: 143, mx: 94,  sy1: 76, sy2: 96, ty1: 80, ty2: 100, color: "#fb923c" },
  { x1: 153, x2: 253, mx: 203, sy1: 6,  sy2: 36, ty1: 6,  ty2: 36, color: "#2FC7B8" },
  { x1: 153, x2: 253, mx: 203, sy1: 36, sy2: 44, ty1: 56, ty2: 64, color: "#6b7280" },
  { x1: 153, x2: 253, mx: 203, sy1: 48, sy2: 64, ty1: 36, ty2: 52, color: "#2FC7B8" },
  { x1: 153, x2: 253, mx: 203, sy1: 64, sy2: 76, ty1: 64, ty2: 74, color: "#6b7280" },
  { x1: 153, x2: 253, mx: 203, sy1: 80, sy2: 100, ty1: 74, ty2: 94, color: "#6b7280" },
];

function linkPath({ x1, x2, mx, sy1, sy2, ty1, ty2 }: SLink) {
  return `M${x1},${sy1} C${mx},${sy1} ${mx},${ty1} ${x2},${ty1} L${x2},${ty2} C${mx},${ty2} ${mx},${sy2} ${x1},${sy2} Z`;
}

export function UserFlowAnalysis({ bare }: { bare?: boolean } = {}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <Card
      bare={bare}
      title="See how users navigate your site"
      description="Visualize user paths through your site with multi-step Sankey flow diagrams."
      icon={Route}
    >
      <div className="mt-4 rounded-lg border border-neutral-300/50 dark:border-neutral-800/50 bg-neutral-100/50 dark:bg-neutral-900/40 overflow-hidden">
        {/* Step headers */}
        <div className="grid grid-cols-3 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-200/40 dark:bg-neutral-800/40">
          {STEP_LABELS.map((label, i) => (
            <div
              key={label}
              className={`text-center text-[9px] font-medium uppercase tracking-wide text-neutral-400 py-1.5${i < 2 ? " border-r border-neutral-200/50 dark:border-neutral-700/50" : ""}`}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Sankey diagram */}
        <div
          className="px-2 py-3"
          style={{ opacity: visible ? 1 : 0, transition: "opacity 700ms ease-out" }}
        >
          <svg viewBox="0 0 320 110" className="w-full" style={{ height: 110 }}>
            {/* Flow links */}
            {LINKS.map((l, i) => (
              <path key={i} d={linkPath(l)} fill={l.color} opacity={0.22} />
            ))}
            {/* Node bars + labels */}
            {NODES.map((n, i) => (
              <g key={i}>
                <rect x={n.x} y={n.y} width={BAR_W} height={n.h} rx={2} fill={n.color} />
                <text
                  x={n.col === 0 ? n.x - 3 : n.x + BAR_W + 4}
                  y={n.y + n.h / 2 + 3}
                  fontSize={7}
                  fill="#9ca3af"
                  textAnchor={n.col === 0 ? "end" : "start"}
                >
                  {n.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </Card>
  );
}
