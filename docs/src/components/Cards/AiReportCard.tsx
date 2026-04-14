"use client";

import { useState, useEffect } from "react";
import { Card } from "./Card";
import { FileText, CheckCircle } from "lucide-react";

function PielLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -5 100 115" width="13" height="13">
      <polygon points="40,6 72,76 8,76" fill="#2FC7B8" />
    </svg>
  );
}

function ChangePill({ value, visible }: { value: number; visible: boolean }) {
  const positive = value > 0;
  const sign = value > 0 ? "+" : "";
  return (
    <span
      className={`text-xs font-medium px-1.5 py-0.5 rounded ${
        positive ? "bg-[#2FC7B8]/10 text-[#2FC7B8]" : "bg-red-500/10 text-red-500"
      }`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(4px)",
        transition: "opacity 400ms ease-out, transform 400ms ease-out",
      }}
    >
      {sign}{value}%
    </span>
  );
}

const METRICS = [
  { label: "Sessions", value: "1,682", change: +31 },
  { label: "Visitors", value: "1,241", change: +28 },
  { label: "Pageviews", value: "4,103", change: +24 },
  { label: "Bounce rate", value: "48.2%", change: -6 },
];

const HIGHLIGHTS = [
  {
    type: "positive",
    metric: "Organic",
    text: "Google sent 43% more visitors after /blog/seo-guide started ranking.",
  },
  {
    type: "positive",
    metric: "Engagement",
    text: "Bounce rate improved from 54% to 48.2% — new homepage copy is working.",
  },
];

export function AiReportCard({ bare }: { bare?: boolean } = {}) {
  const [metricVisible, setMetricVisible] = useState([false, false, false, false]);
  const [highlightsVisible, setHighlightsVisible] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    [0, 1, 2, 3].forEach((i) => {
      timers.push(
        setTimeout(() => {
          setMetricVisible((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, 300 + i * 150)
      );
    });

    timers.push(setTimeout(() => setHighlightsVisible(true), 1200));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <Card
      bare={bare}
      title="Your weekly briefing, written for you"
      description="Every week, Eesee generates a structured report on what changed and why."
      icon={FileText}
    >
      <div className="mt-4 rounded-lg border border-neutral-300/50 dark:border-neutral-800/50 bg-neutral-100/50 dark:bg-neutral-900/40 p-3 space-y-3">
        {/* Report header row */}
        <div className="flex items-center gap-2 pb-2.5 border-b border-neutral-200/60 dark:border-neutral-800/60">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
            Weekly
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Mar 17 – Mar 24, 2025
          </span>
          <CheckCircle className="w-3.5 h-3.5 text-[#2FC7B8] ml-auto shrink-0" />
        </div>

        {/* 2×2 metric tiles */}
        <div className="grid grid-cols-2 gap-2">
          {METRICS.map((m, i) => (
            <div
              key={m.label}
              className="rounded-lg border border-neutral-200/60 dark:border-neutral-700/40 bg-neutral-50/80 dark:bg-neutral-800/40 p-2.5"
              style={{
                opacity: metricVisible[i] ? 1 : 0,
                transform: metricVisible[i] ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 400ms ease-out, transform 400ms ease-out",
              }}
            >
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mb-1">
                {m.label}
              </p>
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                {m.value}
              </p>
              <ChangePill value={m.change} visible={metricVisible[i]} />
            </div>
          ))}
        </div>

        {/* Highlights */}
        <div
          style={{
            opacity: highlightsVisible ? 1 : 0,
            transition: "opacity 500ms ease-out",
          }}
          className="space-y-1.5"
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <PielLogo />
            <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
              Highlights
            </span>
          </div>
          {HIGHLIGHTS.map((h, i) => (
            <div key={i} className="flex gap-2">
              <span
                className={`mt-1 shrink-0 w-1.5 h-1.5 rounded-full ${
                  h.type === "positive" ? "bg-[#2FC7B8]" : "bg-red-500"
                }`}
              />
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {h.metric}:{" "}
                </span>
                {h.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
