"use client";

import { useState, useEffect } from "react";
import { Laptop, Smartphone } from "lucide-react";
import { Browser } from "../Browser";
import { CountryFlag } from "../Country";
import { Card } from "./Card";
import { Avatar } from "../Avatar";
import { Users } from "lucide-react";

const SESSIONS = [
  { id: "john-doe",   name: "john_doe",           flag: "US", browser: "Chrome",  device: "desktop", duration: "14m", pages: 8,  time: "2m ago" },
  { id: "sarah-m",    name: "sarah.m@email.com",   flag: "DE", browser: "Firefox", device: "desktop", duration: "6m",  pages: 4,  time: "5m ago" },
  { id: "anon-1",     name: "Anonymous",           flag: "GB", browser: "Safari",  device: "mobile",  duration: "2m",  pages: 2,  time: "12m ago" },
  { id: "alex-k",     name: "alex.k",              flag: "FR", browser: "Chrome",  device: "mobile",  duration: "9m",  pages: 5,  time: "18m ago" },
];

export function UserSessions({ bare }: { bare?: boolean } = {}) {
  const [rowsVisible, setRowsVisible] = useState([false, false, false, false]);

  useEffect(() => {
    const timers = SESSIONS.map((_, i) =>
      setTimeout(() => {
        setRowsVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 150 + i * 150)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <Card
      bare={bare}
      title="Every session, every visitor"
      description="Browse and filter every recorded session with duration, pageviews, and event counts."
      icon={Users}
    >
      <div className="mt-4 rounded-lg border border-neutral-300/50 dark:border-neutral-800/50 bg-neutral-100/50 dark:bg-neutral-900/40 overflow-hidden">
        {/* Filter bar */}
        <div className="flex items-center gap-3 px-3 py-2 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-200/40 dark:bg-neutral-800/40">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-3.5 rounded-full bg-[#2FC7B8]/30 border border-[#2FC7B8]/50 relative">
              <div className="absolute right-0.5 top-0.5 w-2.5 h-2.5 rounded-full bg-[#2FC7B8]" />
            </div>
            <span className="text-[9px] text-neutral-400">Identified only</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[9px] text-neutral-400">Min pages</span>
            <div className="w-6 h-4 rounded bg-neutral-200/80 dark:bg-neutral-700/80 border border-neutral-300/50 dark:border-neutral-600/50 flex items-center justify-center">
              <span className="text-[9px] text-neutral-500">1</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] text-neutral-400">Min dur (s)</span>
            <div className="w-7 h-4 rounded bg-neutral-200/80 dark:bg-neutral-700/80 border border-neutral-300/50 dark:border-neutral-600/50 flex items-center justify-center">
              <span className="text-[9px] text-neutral-500">30</span>
            </div>
          </div>
        </div>

        {/* Session rows */}
        <div className="divide-y divide-neutral-200/40 dark:divide-neutral-800/40">
          {SESSIONS.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center gap-2 px-3 py-2"
              style={{
                opacity: rowsVisible[i] ? 1 : 0,
                transform: rowsVisible[i] ? "translateY(0)" : "translateY(4px)",
                transition: "opacity 280ms ease-out, transform 280ms ease-out",
              }}
            >
              <Avatar size={22} id={s.id} />
              <span className="text-[10px] font-medium text-neutral-700 dark:text-neutral-200 flex-1 truncate min-w-0">
                {s.name}
              </span>
              <div className="flex items-center gap-1 flex-shrink-0">
                <CountryFlag country={s.flag} />
                <Browser browser={s.browser} />
                {s.device === "mobile" ? (
                  <Smartphone className="w-3 h-3 text-neutral-400" />
                ) : (
                  <Laptop className="w-3 h-3 text-neutral-400" />
                )}
              </div>
              <span className="text-[10px] text-neutral-400 flex-shrink-0">{s.pages}p</span>
              <span className="text-[10px] text-neutral-400 flex-shrink-0">{s.duration}</span>
              <span className="text-[10px] text-neutral-400 flex-shrink-0 w-12 text-right">{s.time}</span>
            </div>
          ))}
        </div>

        {/* Pagination hint */}
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-neutral-200/40 dark:border-neutral-800/40 bg-neutral-200/30 dark:bg-neutral-800/30">
          <span className="text-[9px] text-neutral-400">Page 1</span>
          <div className="flex gap-1">
            <div className="w-5 h-4 rounded border border-neutral-300/50 dark:border-neutral-700/50 flex items-center justify-center opacity-40">
              <span className="text-[8px] text-neutral-400">‹</span>
            </div>
            <div className="w-5 h-4 rounded border border-neutral-300/50 dark:border-neutral-700/50 flex items-center justify-center">
              <span className="text-[8px] text-neutral-400">›</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
