"use client";

import { useState, useEffect } from "react";
import { Laptop, Smartphone, UserCog } from "lucide-react";
import { Browser } from "../Browser";
import { CountryFlag } from "../Country";
import { Card } from "./Card";
import { Avatar } from "../Avatar";

const USERS = [
  { id: "john-doe",  name: "john_doe",          flag: "US", browser: "Chrome",  device: "desktop", sessions: 18, lastSeen: "4m ago"  },
  { id: "sarah-m",   name: "sarah.m@email.com",  flag: "DE", browser: "Firefox", device: "desktop", sessions: 24, lastSeen: "1m ago"  },
  { id: "alex-k",    name: "alex.k",             flag: "FR", browser: "Chrome",  device: "mobile",  sessions: 9,  lastSeen: "23m ago" },
  { id: "maria-s",   name: "maria.s",            flag: "ES", browser: "Safari",  device: "mobile",  sessions: 31, lastSeen: "1h ago"  },
  { id: "anon-gb",   name: "Anonymous",          flag: "GB", browser: "Safari",  device: "mobile",  sessions: 3,  lastSeen: "11m ago" },
];

export function UserProfiles({ bare }: { bare?: boolean } = {}) {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [rowsVisible, setRowsVisible] = useState([false, false, false, false, false]);

  useEffect(() => {
    const timers = [
      setTimeout(() => setHeaderVisible(true), 100),
      ...USERS.map((_, i) =>
        setTimeout(() => {
          setRowsVisible((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, 300 + i * 130)
      ),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <Card
      bare={bare}
      title="Know your users, session by session"
      description="Every visitor gets a profile — all their sessions, pages, events, and properties in one place."
      icon={UserCog}
    >
      <div className="mt-4 rounded-lg border border-neutral-300/50 dark:border-neutral-800/50 bg-neutral-100/50 dark:bg-neutral-900/40 overflow-hidden">
        {/* Search / filter bar */}
        <div
          className="flex items-center gap-2 px-3 py-2 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-200/40 dark:bg-neutral-800/40"
          style={{
            opacity: headerVisible ? 1 : 0,
            transition: "opacity 300ms ease-out",
          }}
        >
          <div className="flex-1 h-5 rounded bg-neutral-200/80 dark:bg-neutral-700/80 border border-neutral-300/50 dark:border-neutral-600/50 flex items-center px-2">
            <span className="text-[9px] text-neutral-400">Search by username, email…</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-3.5 rounded-full bg-neutral-300 dark:bg-neutral-700 relative">
              <div className="absolute left-0.5 top-0.5 w-2.5 h-2.5 rounded-full bg-neutral-400 dark:bg-neutral-500" />
            </div>
            <span className="text-[9px] text-neutral-400 whitespace-nowrap">Identified only</span>
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-3 px-3 py-1 bg-neutral-100/60 dark:bg-neutral-900/60 border-b border-neutral-200/40 dark:border-neutral-800/40">
          <span className="text-[9px] font-medium uppercase tracking-wide text-neutral-400">User</span>
          <span className="text-[9px] font-medium uppercase tracking-wide text-neutral-400">Browser</span>
          <span className="text-[9px] font-medium uppercase tracking-wide text-neutral-400 text-right">Sessions</span>
          <span className="text-[9px] font-medium uppercase tracking-wide text-neutral-400 text-right">Last seen</span>
        </div>

        {/* User rows */}
        <div className="divide-y divide-neutral-200/40 dark:divide-neutral-800/40">
          {USERS.map((u, i) => (
            <div
              key={u.id}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-3 items-center px-3 py-1.5"
              style={{
                opacity: rowsVisible[i] ? 1 : 0,
                transform: rowsVisible[i] ? "translateY(0)" : "translateY(4px)",
                transition: "opacity 260ms ease-out, transform 260ms ease-out",
              }}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Avatar size={18} id={u.id} />
                <span className="text-[10px] font-medium text-neutral-700 dark:text-neutral-200 truncate">{u.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <CountryFlag country={u.flag} />
                <Browser browser={u.browser} />
                {u.device === "mobile" ? (
                  <Smartphone className="w-3 h-3 text-neutral-400" />
                ) : (
                  <Laptop className="w-3 h-3 text-neutral-400" />
                )}
              </div>
              <span className="text-[10px] font-medium text-neutral-700 dark:text-neutral-200 text-right">{u.sessions}</span>
              <span className="text-[10px] text-neutral-400 text-right w-14">{u.lastSeen}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
