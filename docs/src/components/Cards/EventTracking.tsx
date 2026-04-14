"use client";

import { useState, useEffect } from "react";
import { Card } from "./Card";
import { MousePointerClick } from "lucide-react";

interface LiveEvent {
  id: number;
  name: string;
  props: Record<string, string>;
  ts: string;
  isNew: boolean;
}

const EVENT_POOL: { name: string; props: Record<string, string> }[] = [
  { name: "signup_completed", props: { plan: "pro", source: "pricing_page" } },
  { name: "button_click", props: { button_id: "start-trial", section: "hero" } },
  { name: "form_submit", props: { form_id: "contact", success: "true" } },
  { name: "page_view", props: { path: "/pricing", referrer: "google" } },
  { name: "video_play", props: { video: "product-demo", position: "0s" } },
];

const TIMESTAMPS = ["just now", "3s ago", "11s ago", "24s ago"];

export function EventTracking({ bare }: { bare?: boolean } = {}) {
  const [events, setEvents] = useState<LiveEvent[]>(() =>
    EVENT_POOL.slice(0, 4).map((e, i) => ({
      ...e,
      id: i + 1,
      ts: TIMESTAMPS[i],
      isNew: false,
    }))
  );
  const [nextId, setNextId] = useState(5);
  const [poolIndex, setPoolIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPoolIndex((pi) => {
        const nextIdx = (pi + 1) % EVENT_POOL.length;
        const template = EVENT_POOL[nextIdx];
        setNextId((nid) => {
          const newEvent: LiveEvent = { ...template, id: nid, ts: "just now", isNew: true };
          setEvents((prev) =>
            [newEvent, ...prev.slice(0, 3)].map((ev, i) => ({
              ...ev,
              ts: TIMESTAMPS[i],
              isNew: i === 0,
            }))
          );
          return nid + 1;
        });
        return nextIdx;
      });
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <Card
      bare={bare}
      title="Track any interaction, with any data"
      description="One-line API to capture custom events. Attach any properties and query them instantly."
      icon={MousePointerClick}
    >
      <div className="mt-4 rounded-lg border border-neutral-300/50 dark:border-neutral-800/50 bg-neutral-100/50 dark:bg-neutral-900/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-200/40 dark:bg-neutral-800/40">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2FC7B8] opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#2FC7B8]" />
          </span>
          <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">Live event stream</span>
        </div>

        {/* Event rows */}
        <div className="divide-y divide-neutral-200/40 dark:divide-neutral-800/40">
          {events.map((ev, index) => (
            <EventRow key={ev.id} event={ev} index={index} />
          ))}
        </div>
      </div>
    </Card>
  );
}

function EventRow({ event, index }: { event: LiveEvent; index: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, []);
  const isVisible = !event.isNew || mounted;

  return (
    <div
      className="px-3 py-2.5 transition-all duration-400"
      style={{
        opacity: isVisible ? Math.max(0.4, 1 - index * 0.18) : 0,
        transform: isVisible ? "translateY(0)" : "translateY(-8px)",
        transition: "opacity 400ms ease-out, transform 400ms ease-out",
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-100 font-mono">{event.name}</span>
        <span className="ml-auto text-[10px] text-neutral-400 tabular-nums">{event.ts}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {Object.entries(event.props).map(([k, v]) => (
          <span
            key={k}
            className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800/60 border border-neutral-300/50 dark:border-neutral-700/50 font-mono"
          >
            <span className="text-neutral-400">{k}:</span>
            <span className="text-neutral-700 dark:text-neutral-300 ml-0.5">{v}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
