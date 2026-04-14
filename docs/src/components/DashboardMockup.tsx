"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bookmark,
  Building2,
  ChartColumnDecreasing,
  Funnel,
  Globe2,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MousePointerClick,
  Rewind,
  Settings,
  Sparkles,
  Split,
  Target,
  User,
  Video,
} from "lucide-react";

// ─── Colors (dark theme hardcoded) ──────────────────────────────────────────
// Background: #0D1322 | Sidebar: #0B1120 | Card: #121A2B
// Border: #243146 | Active: #182235 | Text: #EAF1F8
// Muted: #A8B6C7 | Dimmed: #4A5568 | Teal (dataviz): #6EDDD2
// PrevLine: #252F41 | Grid: #1A2540

// ─── Static chart data ───────────────────────────────────────────────────────

const SESSION_DATA = [
  120, 115, 132, 118, 145, 160, 155, 170, 165, 180,
  175, 190, 185, 200, 195, 210, 205, 220, 215, 230,
  225, 240, 235, 248, 242, 255, 250, 265, 258, 272,
];
const PREV_DATA = [
  89, 85, 98, 87, 107, 118, 115, 126, 122, 133,
  130, 141, 137, 148, 144, 155, 152, 163, 159, 170,
  167, 178, 174, 184, 179, 189, 185, 196, 191, 201,
];

const SPARK = {
  users:    [45,48,44,52,50,55,53,58,56,62,60,65,63,68,66,72,70,75,73,78],
  sessions: [60,58,65,62,70,68,73,72,76,78,80,79,83,82,86,85,88,87,91,90],
  pageviews:[130,125,140,135,148,145,152,150,158,155,162,160,168,165,172,170,178,175,182,180],
  pps:      [8,7,9,8,9,10,9,10,11,10,11,10,11,12,11,12,11,12,13,12],
  bounce:   [58,60,57,59,56,58,55,57,54,56,53,55,52,54,51,53,50,52,49,48],
  duration: [80,78,85,82,90,88,92,91,95,93,96,95,98,97,100,99,102,101,104,103],
};

// ─── SVG path builders ────────────────────────────────────────────────────────

// Smooth bezier for main chart — coordinate space 0,0 → W,H
function buildSmoothPath(data: number[], W: number, H: number, minVal = 0, maxVal = 290) {
  const step = W / (data.length - 1);
  const pts = data.map((v, i) => ({
    x: +(i * step).toFixed(2),
    y: +(H - ((v - minVal) / (maxVal - minVal)) * H).toFixed(2),
  }));
  let line = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], c = pts[i];
    const cpx = +((p.x + c.x) / 2).toFixed(2);
    line += ` C ${cpx},${p.y} ${cpx},${c.y} ${c.x},${c.y}`;
  }
  const last = pts[pts.length - 1];
  const area = `${line} L ${last.x},${H} L 0,${H} Z`;
  return { line, area };
}

// Step path for sparklines
function buildStepPath(data: number[], W: number, H: number) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const low = min - range * 0.05, high = max + range * 0.05;
  const step = W / (data.length - 1);
  const pts = data.map((v, i) => ({
    x: +(i * step).toFixed(1),
    y: +(H - ((v - low) / (high - low)) * H).toFixed(1),
  }));
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) d += ` H ${pts[i].x} V ${pts[i].y}`;
  return d;
}

// Pre-compute all paths at module level (static, no hydration issues)
const CHART_W = 760, CHART_H = 170;
const { line: MAIN_LINE, area: MAIN_AREA } = buildSmoothPath(SESSION_DATA, CHART_W, CHART_H);
const { line: PREV_LINE } = buildSmoothPath(PREV_DATA, CHART_W, CHART_H);
const SPARK_PATHS = {
  users:    buildStepPath(SPARK.users, 90, 30),
  sessions: buildStepPath(SPARK.sessions, 90, 30),
  pageviews:buildStepPath(SPARK.pageviews, 90, 30),
  pps:      buildStepPath(SPARK.pps, 90, 30),
  bounce:   buildStepPath(SPARK.bounce, 90, 30),
  duration: buildStepPath(SPARK.duration, 90, 30),
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const NAV = [
  { section: "Analytics", items: [
    { icon: LayoutDashboard, label: "Main", active: true },
    { icon: Globe2, label: "Globe" },
  ]},
  { section: "Behavior", items: [
    { icon: Video, label: "Replay" },
    { icon: Funnel, label: "Funnels" },
    { icon: Split, label: "Journeys" },
    { icon: ChartColumnDecreasing, label: "Retention" },
  ]},
  { section: "Conversions", items: [
    { icon: Target, label: "Goals" },
    { icon: Megaphone, label: "Campaigns" },
  ]},
  { section: "Activity", items: [
    { icon: Rewind, label: "Sessions" },
    { icon: User, label: "Users" },
    { icon: MousePointerClick, label: "Events" },
    { icon: AlertTriangle, label: "Errors" },
  ]},
  { section: "Reports", items: [
    { icon: AlertTriangle, label: "Alerts" },
    { icon: Sparkles, label: "Reports" },
    { icon: User, label: "Ask AI" },
  ]},
  { section: "Settings", items: [
    { icon: Settings, label: "Site Settings" },
    { icon: AlertTriangle, label: "Notifications" },
    { icon: Bookmark, label: "Saved Views" },
  ]},
  { section: "Account", items: [
    { icon: User, label: "Account" },
    { icon: Building2, label: "Organization" },
  ]},
];

function MockSidebar() {
  return (
    <div className="w-[200px] shrink-0 flex flex-col h-full overflow-hidden" style={{ background: "#0B1220", borderRight: "1px solid #1E2B3E" }}>
      {/* Site selector */}
      <div className="p-3" style={{ borderBottom: "1px solid #1E2B3E" }}>
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md" style={{ background: "#182235", border: "1px solid #243146" }}>
          <div className="w-5 h-5 rounded-sm flex items-center justify-center shrink-0" style={{ background: "rgba(47,199,184,0.15)" }}>
            <span className="text-[8px] font-bold" style={{ color: "#2FC7B8" }}>E</span>
          </div>
          <span className="text-xs font-medium truncate" style={{ color: "#EAF1F8" }}>haboochi.com</span>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-hidden p-2 pt-1 space-y-0.5">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <div className="px-2 py-1 text-[8.5px] font-semibold uppercase tracking-widest" style={{ color: "#4A5568" }}>
              {section}
            </div>
            {items.map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-[11px] font-medium"
                style={{
                  background: active ? "rgba(47,199,184,0.08)" : "transparent",
                  color: active ? "#6EDDD2" : "#A8B6C7",
                }}
              >
                <Icon size={12} strokeWidth={active ? 2 : 1.5} />
                <span>{label}</span>
                {label === "Alerts" && (
                  <span className="ml-auto w-2 h-2 rounded-full" style={{ background: "#6EDDD2" }} />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="shrink-0 px-3 py-2 flex items-center justify-between" style={{ borderTop: "1px solid #1E2B3E" }}>
        <span className="text-[10px]" style={{ color: "#4A5568" }}>Dark</span>
        <div className="flex items-center gap-1" style={{ color: "#4A5568" }}>
          <LogOut size={10} />
          <span className="text-[10px]">Sign out</span>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  change: number;
  reverseColor?: boolean;
  sparkPath: string;
  visible: boolean;
  delay: number;
}

function StatCard({ label, value, change, reverseColor, sparkPath, visible, delay }: StatCardProps) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [visible, delay]);

  const isGood = reverseColor ? change < 0 : change > 0;
  const sign = change > 0 ? "+" : "";

  return (
    <div
      className="flex flex-col cursor-pointer"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(5px)",
        transition: "opacity 350ms ease-out, transform 350ms ease-out",
        borderRight: "1px solid #1E2B3E",
      }}
    >
      <div className="px-3 py-2">
        <div className="text-[10px] font-medium mb-0.5" style={{ color: "#A8B6C7" }}>{label}</div>
        <div className="flex items-baseline justify-between gap-1">
          <span className="text-xl font-semibold" style={{ color: "#EAF1F8" }}>{value}</span>
          <span className="text-[10px] flex items-center gap-0.5" style={{ color: isGood ? "#4ADE80" : "#F87171" }}>
            {isGood ? <ArrowUp size={9} strokeWidth={3} /> : <ArrowDown size={9} strokeWidth={3} />}
            {sign}{Math.abs(change)}%
          </span>
        </div>
      </div>
      {/* Sparkline — step curve, no fill */}
      <div className="h-[32px] -mt-3 overflow-hidden">
        <svg viewBox="0 0 90 30" className="w-full h-full" preserveAspectRatio="none">
          <path d={sparkPath} fill="none" stroke="#6EDDD2" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}

interface TablePanelProps {
  tabs: string[];
  rows: { label: string; value: string; pct: number }[];
  visible: boolean;
}

function TablePanel({ tabs, rows, visible }: TablePanelProps) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 400ms ease-out, transform 400ms ease-out",
        background: "#121A2B",
        border: "1px solid #243146",
        height: "180px",
      }}
    >
      {/* Tab bar */}
      <div className="flex items-center gap-0 px-1 pt-1" style={{ borderBottom: "1px solid #1E2B3E" }}>
        {tabs.map((tab, i) => (
          <div
            key={tab}
            className="px-2 py-1.5 text-[10px] font-medium cursor-pointer"
            style={{
              color: i === 0 ? "#EAF1F8" : "#4A5568",
              borderBottom: i === 0 ? "2px solid #EAF1F8" : "2px solid transparent",
              marginBottom: "-1px",
            }}
          >
            {tab}
          </div>
        ))}
        <div className="ml-auto pr-2">
          <div style={{ color: "#4A5568" }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></div>
        </div>
      </div>
      {/* Rows */}
      <div className="px-3 pt-2 space-y-2">
        {rows.map((r, i) => (
          <div key={i}>
            <div className="flex items-center justify-between text-[10px] mb-0.5">
              <span className="truncate flex-1 mr-2" style={{ color: "#A8B6C7" }}>{r.label}</span>
              <span className="font-medium shrink-0" style={{ color: "#EAF1F8" }}>{r.value}</span>
            </div>
            <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "#1E2B3E" }}>
              <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: "#6EDDD2", opacity: 0.55 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DashboardMockup() {
  const [statsVisible, setStatsVisible] = useState(false);
  const [chartVisible, setChartVisible] = useState(false);
  const [tables, setTables] = useState([false, false, false, false]);
  const [liveCount, setLiveCount] = useState(14);
  const [clipW, setClipW] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStatsVisible(true), 200),
      setTimeout(() => setChartVisible(true), 500),
      setTimeout(() => setTables([true, false, false, false]), 1100),
      setTimeout(() => setTables([true, true, false, false]), 1250),
      setTimeout(() => setTables([true, true, true, false]), 1400),
      setTimeout(() => setTables([true, true, true, true]), 1550),
    ];
    const live = setInterval(() => {
      setLiveCount(c => Math.max(8, Math.min(30, c + (Math.random() > 0.5 ? 1 : -1))));
    }, 2500);
    return () => { timers.forEach(clearTimeout); clearInterval(live); };
  }, []);

  useEffect(() => {
    if (!chartVisible) return;
    const start = performance.now();
    const duration = 1400;
    function frame(now: number) {
      const p = Math.min((now - start) / duration, 1);
      setClipW((1 - Math.pow(1 - p, 3)) * CHART_W);
      if (p < 1) rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [chartVisible]);

  // Chart grid Y positions (value → SVG y in plot space, height=170, max=290)
  const yGridVals = [50, 100, 150, 200, 250];
  const toY = (v: number) => +(CHART_H - (v / 290) * CHART_H).toFixed(1);
  // X axis label positions (plot space x, total width=760, 30 points)
  const xLabels = [
    { x: 0, label: "Mar 2" },
    { x: Math.round(760 * 6 / 29), label: "Mar 8" },
    { x: Math.round(760 * 12 / 29), label: "Mar 14" },
    { x: Math.round(760 * 18 / 29), label: "Mar 20" },
    { x: Math.round(760 * 24 / 29), label: "Mar 26" },
    { x: 760, label: "Mar 31" },
  ];

  const STATS = [
    { label: "Unique Users",     value: "12.4k", change: 31,  sparkPath: SPARK_PATHS.users },
    { label: "Sessions",          value: "18.2k", change: 28,  sparkPath: SPARK_PATHS.sessions },
    { label: "Pageviews",         value: "47.1k", change: 24,  sparkPath: SPARK_PATHS.pageviews },
    { label: "Pages per Session", value: "2.6",   change: 3,   sparkPath: SPARK_PATHS.pps },
    { label: "Bounce Rate",       value: "48.2%", change: -6,  sparkPath: SPARK_PATHS.bounce, reverseColor: true },
    { label: "Session Duration",  value: "2:14",  change: 8,   sparkPath: SPARK_PATHS.duration },
  ];

  return (
    <div className="w-full rounded-xl overflow-hidden" style={{ border: "1px solid #243146", boxShadow: "0 0 80px -15px rgba(110,221,210,0.12)" }}>
      {/* Browser chrome */}
      <div className="flex items-center gap-3 px-4 py-2" style={{ background: "#0B1220", borderBottom: "1px solid #1E2B3E" }}>
        <div className="flex gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(239,68,68,0.6)" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(234,179,8,0.6)" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(34,197,94,0.6)" }} />
        </div>
        <div className="flex-1 mx-3">
          <div className="rounded px-3 py-0.5 text-[10px] text-center max-w-xs mx-auto" style={{ background: "#182235", border: "1px solid #243146", color: "#4A5568" }}>
            app.eeseemetrics.com
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: "#6EDDD2" }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "#6EDDD2" }} />
          </span>
          <span className="text-[10px]" style={{ color: "#6EDDD2" }}>{liveCount} online</span>
        </div>
      </div>

      {/* App body */}
      <div className="flex" style={{ height: "clamp(380px, 52vw, 640px)", background: "#0D1322" }}>
        <MockSidebar />

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* SubHeader */}
          <div className="flex items-center gap-2 px-4 py-1.5 shrink-0" style={{ borderBottom: "1px solid #1E2B3E" }}>
            <div className="flex items-center gap-1.5 text-[10px] rounded px-2 py-0.5" style={{ background: "#182235", border: "1px solid #243146", color: "#A8B6C7" }}>
              <Globe2 size={10} />
              haboochi.com
            </div>
            <div className="flex items-center gap-1 text-[10px] rounded px-2 py-0.5" style={{ background: "#182235", border: "1px solid #243146", color: "#A8B6C7" }}>
              Last 30 days
            </div>
            <span className="text-[9px]" style={{ color: "#4A5568" }}>vs previous period</span>
            <div className="ml-auto text-[9px]" style={{ color: "#4A5568" }}>Mar 1 – Mar 31, 2025</div>
          </div>

          <div className="flex-1 overflow-hidden p-2.5 space-y-2.5">
            {/* Overview stats card */}
            <div className="rounded-xl overflow-hidden" style={{ background: "#121A2B", border: "1px solid #243146" }}>
              <div className="grid grid-cols-6 last:[&>*]:border-r-0">
                {STATS.map((s, i) => (
                  <StatCard key={s.label} {...s} visible={statsVisible} delay={i * 55} />
                ))}
              </div>
            </div>

            {/* Chart card */}
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "#121A2B",
                border: "1px solid #243146",
                opacity: chartVisible ? 1 : 0,
                transition: "opacity 500ms ease-out",
              }}
            >
              {/* Chart header */}
              <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: "1px solid #1E2B3E" }}>
                <span className="text-[10px] font-semibold" style={{ color: "#A8B6C7" }}>Sessions</span>
                <div className="flex items-center gap-3 text-[8.5px]" style={{ color: "#4A5568" }}>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-px inline-block" style={{ background: "#6EDDD2" }} />
                    This period
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-px inline-block" style={{ background: "#252F41" }} />
                    Previous
                  </span>
                  <div className="flex gap-1 ml-1">
                    {["Hour","Day","Week","Month"].map((b, i) => (
                      <span key={b} className="px-1.5 py-0.5 rounded text-[8px]" style={{ background: i === 1 ? "#243146" : "transparent", color: i === 1 ? "#EAF1F8" : "#4A5568" }}>{b}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* SVG chart */}
              <div className="px-2 pb-1">
                <svg
                  viewBox={`0 0 ${CHART_W + 55} ${CHART_H + 40}`}
                  className="w-full"
                  style={{ height: "clamp(70px, 14vw, 160px)" }}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="dmAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6EDDD2" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#6EDDD2" stopOpacity="0.01" />
                    </linearGradient>
                    <clipPath id="dmReveal">
                      <rect x="0" y="0" width={clipW} height={CHART_H + 10} />
                    </clipPath>
                  </defs>

                  {/* Y axis labels */}
                  {yGridVals.map(v => (
                    <text key={v} x="33" y={toY(v) + 10 + 3} textAnchor="end" fontSize="9" fill="#4A5568">
                      {v}
                    </text>
                  ))}
                  <text x="33" y={CHART_H + 10 + 3} textAnchor="end" fontSize="9" fill="#4A5568">0</text>

                  {/* Grid lines */}
                  <g transform="translate(38, 10)">
                    {yGridVals.map(v => (
                      <line key={v} x1="0" y1={toY(v)} x2={CHART_W} y2={toY(v)} stroke="#1A2540" strokeWidth="1" />
                    ))}
                    <line x1="0" y1={CHART_H} x2={CHART_W} y2={CHART_H} stroke="#1A2540" strokeWidth="1" />

                    {/* Previous period line */}
                    <path d={PREV_LINE} fill="none" stroke="#252F41" strokeWidth="1.5" clipPath="url(#dmReveal)" />
                    {/* Current period area */}
                    <path d={MAIN_AREA} fill="url(#dmAreaGrad)" clipPath="url(#dmReveal)" />
                    {/* Current period line */}
                    <path d={MAIN_LINE} fill="none" stroke="#6EDDD2" strokeWidth="2" clipPath="url(#dmReveal)" />

                    {/* X axis labels */}
                    {xLabels.map(({ x, label }) => (
                      <text key={label} x={x} y={CHART_H + 18} textAnchor="middle" fontSize="9" fill="#4A5568">{label}</text>
                    ))}
                  </g>
                </svg>
              </div>
            </div>

            {/* Data table panels */}
            <div className="grid grid-cols-2 gap-2.5">
              <TablePanel
                visible={tables[0]}
                tabs={["Referrers", "Channels", "UTM"]}
                rows={[
                  { label: "google.com", value: "7,842", pct: 100 },
                  { label: "Direct", value: "4,291", pct: 55 },
                  { label: "twitter.com", value: "2,156", pct: 28 },
                  { label: "github.com", value: "1,834", pct: 23 },
                  { label: "dev.to", value: "1,047", pct: 13 },
                ]}
              />
              <TablePanel
                visible={tables[1]}
                tabs={["Pages", "Titles", "Entries", "Exits", "Hostnames"]}
                rows={[
                  { label: "/", value: "12,451", pct: 100 },
                  { label: "/pricing", value: "8,234", pct: 66 },
                  { label: "/blog/seo-guide", value: "6,891", pct: 55 },
                  { label: "/docs", value: "5,102", pct: 41 },
                  { label: "/features", value: "3,847", pct: 31 },
                ]}
              />
              <TablePanel
                visible={tables[2]}
                tabs={["Countries"]}
                rows={[
                  { label: "🇺🇸 United States", value: "7,634", pct: 100 },
                  { label: "🇬🇧 United Kingdom", value: "3,271", pct: 43 },
                  { label: "🇩🇪 Germany", value: "2,182", pct: 29 },
                  { label: "🇫🇷 France", value: "1,455", pct: 19 },
                  { label: "🇨🇦 Canada", value: "1,091", pct: 14 },
                ]}
              />
              <TablePanel
                visible={tables[3]}
                tabs={["Devices"]}
                rows={[
                  { label: "Desktop", value: "10,903", pct: 100 },
                  { label: "Mobile", value: "7,270", pct: 67 },
                  { label: "Tablet", value: "909", pct: 8 },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
