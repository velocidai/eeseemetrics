"use client";

import { useState, useEffect } from "react";
import { Card } from "./Card";
import { Wifi } from "lucide-react";

const MONITORS = [
  { name: "Homepage",     url: "eeseemetrics.com",  type: "HTTP", uptime: "99.98%", ms: 142,  status: "up" as const },
  { name: "Checkout API", url: "/api/checkout",     type: "HTTP", uptime: "99.91%", ms: 318,  status: "up" as const },
  { name: "Auth service", url: "/api/auth",         type: "HTTP", uptime: "100%",   ms: 89,   status: "up" as const },
  { name: "DB port 5432", url: "db.internal:5432",  type: "TCP",  uptime: "100%",   ms: 4,    status: "up" as const },
];

// Response time breakdown for homepage (stacked bar: dns + connect + tls + transfer)
const RT_BARS = [
  { dns: 8,  connect: 22, tls: 44, transfer: 68 },
  { dns: 7,  connect: 20, tls: 41, transfer: 72 },
  { dns: 9,  connect: 25, tls: 46, transfer: 62 },
  { dns: 8,  connect: 21, tls: 43, transfer: 70 },
  { dns: 10, connect: 28, tls: 48, transfer: 56 },
  { dns: 7,  connect: 19, tls: 40, transfer: 76 },
  { dns: 8,  connect: 22, tls: 44, transfer: 68 },
  { dns: 11, connect: 30, tls: 52, transfer: 49 },
  { dns: 8,  connect: 23, tls: 45, transfer: 66 },
  { dns: 7,  connect: 20, tls: 41, transfer: 74 },
  { dns: 9,  connect: 24, tls: 47, transfer: 63 },
  { dns: 8,  connect: 22, tls: 44, transfer: 68 },
];
const MAX_RT = Math.max(...RT_BARS.map((b) => b.dns + b.connect + b.tls + b.transfer));

const RT_COLORS = {
  dns:      "#60a5fa",
  connect:  "#34d399",
  tls:      "#a78bfa",
  transfer: "#2FC7B8",
};

export function UptimeMonitor({ bare }: { bare?: boolean } = {}) {
  const [rowsVisible, setRowsVisible] = useState([false, false, false, false]);
  const [chartVisible, setChartVisible] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setRowsVisible([true, false, false, false]), 100),
      setTimeout(() => setRowsVisible([true, true, false, false]), 280),
      setTimeout(() => setRowsVisible([true, true, true, false]), 460),
      setTimeout(() => setRowsVisible([true, true, true, true]), 640),
      setTimeout(() => setChartVisible(true), 1100),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <Card
      bare={bare}
      title="Know before your users do"
      description="HTTP, HTTPS, and TCP monitoring with response time breakdown and instant downtime alerts."
      icon={Wifi}
    >
      {/* Monitors table */}
      <div className="mt-4 rounded-lg border border-neutral-300/50 dark:border-neutral-800/50 bg-neutral-100/50 dark:bg-neutral-900/40 overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-3 px-3 py-1.5 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-200/40 dark:bg-neutral-800/40">
          <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400 w-2" />
          <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">Monitor</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400 text-right">Type</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400 text-right">Uptime</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-400 text-right">Resp.</span>
        </div>
        <div className="divide-y divide-neutral-200/40 dark:divide-neutral-800/40">
          {MONITORS.map((m, i) => (
            <div
              key={m.name}
              className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-3 items-center px-3 py-2"
              style={{
                opacity: rowsVisible[i] ? 1 : 0,
                transform: rowsVisible[i] ? "translateY(0)" : "translateY(5px)",
                transition: "opacity 300ms ease-out, transform 300ms ease-out",
              }}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${m.status === "up" ? "bg-[#2FC7B8]" : "bg-red-500"}`} />
              <div className="min-w-0">
                <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">{m.name}</span>
                <span className="text-[10px] text-neutral-400 font-mono ml-1.5">{m.url}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${m.type === "TCP" ? "bg-purple-500/10 text-purple-400" : "bg-blue-500/10 text-blue-400"}`}>{m.type}</span>
              <span className="text-xs font-medium text-[#2FC7B8] text-right tabular-nums">{m.uptime}</span>
              <span className="text-xs text-neutral-500 text-right tabular-nums">{m.ms}ms</span>
            </div>
          ))}
        </div>
      </div>

      {/* Response time breakdown chart */}
      <div
        className="mt-3 rounded-lg border border-neutral-300/50 dark:border-neutral-800/50 bg-neutral-100/50 dark:bg-neutral-900/40 p-3"
        style={{ opacity: chartVisible ? 1 : 0, transition: "opacity 500ms ease-out" }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">Homepage — response time (ms)</span>
          <span className="text-[10px] text-neutral-400">last 12 checks</span>
        </div>

        {/* Stacked bar chart */}
        <div className="flex items-end gap-0.5 h-12">
          {RT_BARS.map((b, i) => {
            const total = b.dns + b.connect + b.tls + b.transfer;
            const scale = (v: number) => (v / MAX_RT) * 48;
            return (
              <div key={i} className="flex-1 flex flex-col justify-end" style={{ height: scale(total) }}>
                {(["transfer", "tls", "connect", "dns"] as const).map((k) => (
                  <div key={k} style={{ height: scale(b[k]), backgroundColor: RT_COLORS[k], opacity: chartVisible ? 1 : 0, transition: `opacity ${300 + i * 40}ms` }} />
                ))}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-3 mt-2 flex-wrap">
          {(["dns", "connect", "tls", "transfer"] as const).map((k) => (
            <div key={k} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: RT_COLORS[k] }} />
              <span className="text-[9px] text-neutral-400 capitalize">{k}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
