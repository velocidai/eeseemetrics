"use client";

import { useState, useEffect } from "react";
import { Card } from "./Card";
import { Activity } from "lucide-react";

const EVENT_POOL = [
  { dot: "🟢", page: "/pricing", flag: "🇩🇪" },
  { dot: "🟡", page: "/features", flag: "🇺🇸" },
  { dot: "🔵", page: "/", flag: "🇫🇷" },
  { dot: "🟢", page: "/docs", flag: "🇬🇧" },
  { dot: "🟡", page: "/blog/analytics", flag: "🇪🇸" },
];

const TIMESTAMPS = ["just now", "5s ago", "12s ago", "28s ago"];

interface FeedEvent {
  id: number;
  dot: string;
  page: string;
  flag: string;
  timestamp: string;
  isNew: boolean;
}

export function LiveDashboard({ bare }: { bare?: boolean } = {}) {
  const [onlineCount, setOnlineCount] = useState(28);
  const [nextId, setNextId] = useState(5);
  const [poolIndex, setPoolIndex] = useState(0);
  const [events, setEvents] = useState<FeedEvent[]>(() =>
    EVENT_POOL.slice(0, 4).map((e, i) => ({
      ...e,
      id: i + 1,
      timestamp: TIMESTAMPS[i],
      isNew: false,
    }))
  );

  // Fluctuate online count every 2s
  useEffect(() => {
    const id = setInterval(() => {
      setOnlineCount((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        return Math.max(20, Math.min(40, prev + delta));
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // New event every 2.5s
  useEffect(() => {
    const id = setInterval(() => {
      setPoolIndex((pi) => {
        const nextIdx = (pi + 1) % EVENT_POOL.length;
        const template = EVENT_POOL[nextIdx];
        setNextId((nid) => {
          const newEvent: FeedEvent = {
            ...template,
            id: nid,
            timestamp: "just now",
            isNew: true,
          };
          setEvents((prev) => {
            const updated = [newEvent, ...prev.slice(0, 3)].map((ev, i) => ({
              ...ev,
              timestamp: TIMESTAMPS[i],
              isNew: i === 0,
            }));
            return updated;
          });
          return nid + 1;
        });
        return nextIdx;
      });
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <Card
      bare={bare}
      title="Your site, live"
      description="See exactly who's on your site, where they came from, and what they're doing — updated every second."
      icon={Activity}
    >
      <div className="mt-4 rounded-lg border border-neutral-300/50 dark:border-neutral-800/50 bg-neutral-100/50 dark:bg-neutral-900/40 overflow-hidden">
        {/* Stat bar */}
        <div className="flex items-center gap-4 px-3 py-2.5 border-b border-neutral-300/50 dark:border-neutral-800/50">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2FC7B8] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2FC7B8]"></span>
            </span>
            <span className="text-xs font-semibold text-[#2FC7B8] tabular-nums">
              {onlineCount} online now
            </span>
          </div>
          <div className="h-3 w-px bg-neutral-300 dark:bg-neutral-700" />
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            <span className="text-neutral-700 dark:text-neutral-200 font-medium">1,284</span> pageviews today
          </span>
          <div className="h-3 w-px bg-neutral-300 dark:bg-neutral-700" />
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            <span className="text-neutral-700 dark:text-neutral-200 font-medium">847</span> sessions
          </span>
        </div>

        {/* Event feed */}
        <div className="relative overflow-hidden" style={{ height: "168px" }}>
          {events.map((ev, index) => (
            <EventRow key={ev.id} event={ev} index={index} />
          ))}
        </div>
      </div>
    </Card>
  );
}

function EventRow({ event, index }: { event: FeedEvent; index: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, []);

  const isVisible = !event.isNew || mounted;

  return (
    <div
      className="absolute w-full flex items-center gap-2 px-3 py-2 border-b border-neutral-200/50 dark:border-neutral-800/30 transition-all duration-500"
      style={{
        top: index * 42,
        opacity: isVisible ? (index < 4 ? 1 - index * 0.12 : 0) : 0,
        transform: isVisible ? "translateY(0)" : "translateY(-10px)",
      }}
    >
      <span className="text-sm leading-none">{event.dot}</span>
      <span className="text-xs font-mono text-neutral-700 dark:text-neutral-200 truncate flex-1">
        {event.page}
      </span>
      <span className="text-sm leading-none">{event.flag}</span>
      <span className="text-xs text-neutral-400 tabular-nums whitespace-nowrap">{event.timestamp}</span>
    </div>
  );
}
