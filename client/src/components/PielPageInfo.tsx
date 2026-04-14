"use client";

import { useState } from "react";
import { PielHelpIcon, PielIcon } from "./EeseeLogo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

export type PageInfoKey =
  | "main"
  | "pages"
  | "globe"
  | "performance"
  | "replay"
  | "funnels"
  | "journeys"
  | "retention"
  | "goals"
  | "campaigns"
  | "sessions"
  | "users"
  | "events"
  | "errors"
  | "alerts"
  | "reports"
  | "monitors"
  | "incidents"
  | "status-page";

const PAGE_INFO: Record<PageInfoKey, { title: string; description: string[] }> = {
  main: {
    title: "Overview",
    description: [
      "Your main dashboard. Sessions, pageviews, unique visitors, bounce rate, and average session duration — all in one place. The top chart shows how traffic changes over time.",
      "Scroll down to see your top pages, referrers, countries, devices, and more. Everything updates when you change the date range or add filters.",
    ],
  },
  pages: {
    title: "Pages",
    description: [
      "A breakdown of every URL on your site by traffic. See which pages attract the most sessions, how engaged visitors are on each one, and how they compare across your date range.",
      "Use the search to find a specific path, or filter by device, country, or referrer to understand who visits each page.",
    ],
  },
  globe: {
    title: "Globe",
    description: [
      "A live 3D globe showing where your visitors come from. Watch traffic land in real time — spin it, zoom in, and see which countries and cities are sending you sessions.",
      "For the full country and city breakdown with numbers, check the Main overview page.",
    ],
  },
  performance: {
    title: "Performance",
    description: [
      "Core Web Vitals monitoring — the metrics Google uses to measure page experience. Tracks LCP (largest contentful paint), CLS (layout shift), INP (interactivity), and TTFB (server response time).",
      "Poor Web Vitals can hurt both user experience and search rankings. Use this page to find which pages are slow or janky and prioritize fixes.",
    ],
  },
  replay: {
    title: "Session Replay",
    description: [
      "Watch real recordings of how users interacted with your site — every click, scroll, pause, and exit. No configuration needed beyond the standard tracking script.",
      "Filter by page, session duration, country, or device to find the sessions worth watching. Replays are the fastest way to spot usability issues you'd never catch from numbers alone.",
    ],
  },
  funnels: {
    title: "Funnels",
    description: [
      "Define a sequence of steps — like /landing → /pricing → /checkout — and see how many visitors complete each one. The drop-off rate between steps shows exactly where you're losing people.",
      "Create as many funnels as you need. Each one saves automatically and updates with your current date range and filters.",
    ],
  },
  journeys: {
    title: "Journeys",
    description: [
      "A flow diagram of the most common paths visitors take through your site. Pick any starting page and see where people go next — and where they leave.",
      "Useful for finding unexpected navigation patterns, dead ends, and pages that are surprisingly effective at moving people toward conversion.",
    ],
  },
  retention: {
    title: "Retention",
    description: [
      "Shows how many of your visitors come back week after week. Each row is a cohort of users who first visited in a given week. The columns show what percentage returned in subsequent weeks.",
      "Strong week-2 and week-3 numbers mean your content brings people back. A sharp drop after week 1 suggests one-time visits with no reason to return.",
    ],
  },
  goals: {
    title: "Goals",
    description: [
      "Goals track specific user actions you care about — button clicks, form submissions, page visits, scroll depth, or any custom event. Each goal shows total completions and the percentage of sessions that triggered it.",
      "You define the goals; Eesee tracks them automatically. Goals data also flows into your AI reports for richer analysis.",
    ],
  },
  campaigns: {
    title: "Campaigns",
    description: [
      "Traffic from UTM-tagged links — your email campaigns, paid ads, social posts, and any other tracked links. See which campaigns, sources, mediums, and terms drive the most sessions.",
      "This page only shows data when UTM parameters are present in your traffic. Tag your links with utm_source, utm_medium, and utm_campaign to get started.",
    ],
  },
  sessions: {
    title: "Sessions",
    description: [
      "A chronological list of all user sessions on your site. Each row shows the visitor's location, device, entry page, duration, and pageview count.",
      "Click any session to see the full page-by-page timeline. If session replay is enabled, you can watch the recording directly from here.",
    ],
  },
  users: {
    title: "Users",
    description: [
      "Profiles of individual anonymous visitors. Each profile aggregates all sessions, pageviews, and custom events from a single visitor across their entire history on your site.",
      "Useful for understanding how your most engaged users behave — what they do, how often they return, and which pages they keep coming back to.",
    ],
  },
  events: {
    title: "Events",
    description: [
      "A log of all custom events fired on your site — button clicks, form submissions, video plays, or anything else you've instrumented. Each event shows how many times it fired and across how many sessions.",
      "Use the search and filters to analyse specific event types, spot patterns, and understand which interactions are most common.",
    ],
  },
  errors: {
    title: "Error Tracking",
    description: [
      "JavaScript errors caught in real time on your site. See the error message, affected pages, browser, and how many users experienced it.",
      "Click any error to see the full stack trace and session context. If session replay is enabled, you can jump straight to a recording of a user hitting the error.",
    ],
  },
  alerts: {
    title: "Alerts",
    description: [
      "Your key metrics are monitored automatically and unusual changes are flagged — a sudden spike in sessions, an unexpected drop in conversions, or a big shift in bounce rate.",
      "No thresholds to configure. Alerts appear here when something worth investigating happens. You can also set up email notifications in your site settings.",
    ],
  },
  reports: {
    title: "AI Reports",
    description: [
      "Automatic plain-English reports of your site's traffic. Each week, a summary covers your most important metric changes, highlights, and specific recommendations.",
      "Scale-tier reports include deeper analysis — channel trends, page movers, goal trend comparisons, campaign performance, and multi-period traffic history. Reports are also sent to your inbox if email reports are enabled.",
    ],
  },
  monitors: {
    title: "Uptime Monitors",
    description: [
      "Track the availability and response time of your HTTP endpoints and TCP services. Checks run every minute from multiple regions worldwide — you'll know within seconds if something goes down.",
      "Each monitor shows its current status, 30-day uptime percentage, and average response time. Click any monitor to see its full response time chart, event history, and region-by-region breakdown.",
    ],
  },
  incidents: {
    title: "Incidents",
    description: [
      "A log of all downtime events detected across your monitors. Each incident captures when the outage started, which regions were affected, how long it lasted, and when it was resolved.",
      "Incidents move through three states: Active (currently down), Acknowledged (you've seen it), and Resolved (service restored). Use the filter tabs to focus on what needs attention.",
    ],
  },
  "status-page": {
    title: "Status Page",
    description: [
      "A real-time overview of all your monitored endpoints in one place. Shows whether each service is up or down, its 30-day uptime percentage, and when it was last checked.",
      "Use this as your internal operations dashboard to quickly assess the health of your entire infrastructure at a glance.",
    ],
  },
};

// ---------------------------------------------------------------------------
// Sidebar section modals
// ---------------------------------------------------------------------------

export type SidebarSectionKey =
  | "analytics"
  | "behavior"
  | "conversions"
  | "activity"
  | "insights"
  | "developer"
  | "monitoring";

const SECTION_INFO: Record<SidebarSectionKey, { title: string; description: string[] }> = {
  analytics: {
    title: "Analytics",
    description: [
      "The big picture of your site's traffic. Track pageviews, sessions, unique visitors, bounce rate, and session duration. See which pages get the most attention, where visitors come from, what devices they use, and where in the world they are.",
      "Start here to understand your overall traffic trends before diving into deeper analysis.",
    ],
  },
  behavior: {
    title: "Behavior",
    description: [
      "How visitors actually move through your site. Watch session recordings to see exactly what people do, build funnels to find where they drop off, map the most common paths visitors take, and measure how many come back week after week.",
      "Use this section when you want to understand not just how many people visit, but what they do when they get there.",
    ],
  },
  conversions: {
    title: "Conversions",
    description: [
      "Track what matters most to your business. Define goals to measure specific user actions — form submissions, button clicks, page visits — and see what percentage of sessions trigger each one.",
      "Track UTM-tagged campaigns to measure which marketing efforts actually drive traffic and conversions. Both goals and campaigns feed into your AI reports for richer analysis.",
    ],
  },
  activity: {
    title: "Activity",
    description: [
      "Individual-level data behind your aggregate stats. Browse raw session timelines, view complete visitor histories, analyse custom event logs, and catch JavaScript errors in real time.",
      "Use this section to investigate specific users, debug issues, or verify that your tracking is working correctly.",
    ],
  },
  insights: {
    title: "Insights",
    description: [
      "Automatic monitoring of your key metrics — traffic spikes, conversion drops, bounce rate shifts are flagged in the Alerts tab. No thresholds to configure.",
      "Every week, a plain-English report lands in your inbox with highlights and specific recommendations. Scale-tier reports include deeper analysis: channel trends, page movers, campaign performance, and more.",
    ],
  },
  developer: {
    title: "Developer",
    description: [
      "Programmatic access to your analytics data. Use the API Playground to explore the REST API interactively — build and test queries directly in your browser.",
      "Visit the documentation for setup guides, SDK references, tracking script options, and integration examples for React, Next.js, WordPress, and more.",
    ],
  },
  monitoring: {
    title: "Monitoring",
    description: [
      "Uptime monitoring for this site's endpoints. Create HTTP or TCP monitors and know within seconds if something goes down — checks run every minute from multiple regions worldwide.",
      "View all active monitors, browse the incident log, and check the real-time status of every monitored endpoint from the Status Page.",
    ],
  },
};

export function PielSectionInfo({ section }: { section: SidebarSectionKey }) {
  const [open, setOpen] = useState(false);
  const info = SECTION_INFO[section];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center text-neutral-400 dark:text-neutral-600 hover:text-[#2FC7B8] dark:hover:text-[#2FC7B8] transition-colors"
        aria-label={`What is ${info.title}?`}
      >
        <PielHelpIcon size={16} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <div className="flex flex-col items-center gap-3 pb-2">
              <PielIcon size={56} />
              <DialogTitle className="text-xl font-semibold text-center">
                {info.title}
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-3 text-sm text-neutral-400 leading-relaxed px-1">
            {info.description.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          <div className="flex justify-center pt-2">
            <Button onClick={() => setOpen(false)} className="px-8">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function PielPageInfo({ page }: { page: PageInfoKey }) {
  const [open, setOpen] = useState(false);
  const info = PAGE_INFO[page];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center rounded-md h-8 w-8 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-xs"
        aria-label={`What is ${info.title}?`}
      >
        <PielHelpIcon size={38} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <div className="flex flex-col items-center gap-3 pb-2">
              <PielIcon size={56} />
              <DialogTitle className="text-xl font-semibold text-center">
                {info.title}
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-3 text-sm text-neutral-400 leading-relaxed px-1">
            {info.description.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          <div className="flex justify-center pt-2">
            <Button onClick={() => setOpen(false)} className="px-8">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
