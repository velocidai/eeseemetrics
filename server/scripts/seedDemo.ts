/**
 * Demo data seed script for eeseemetrics.com
 *
 * Usage:
 *   SITE_ID=1 CLICKHOUSE_HOST=http://localhost:18123 CLICKHOUSE_PASSWORD=frog npx tsx server/scripts/seedDemo.ts
 *
 * The SITE_ID must match a site already created in the app (check the URL when viewing it).
 */

import { createClient } from "@clickhouse/client";
import { randomBytes } from "crypto";

// ─── Config ─────────────────────────────────────────────────────────────────

const SITE_ID = Number(process.env.SITE_ID);
if (!SITE_ID) {
  console.error("Error: SITE_ID env var is required (e.g. SITE_ID=1)");
  process.exit(1);
}

const DAYS = 90; // how many days of history to generate
const BATCH_SIZE = 2000;

const ch = createClient({
  url: process.env.CLICKHOUSE_HOST ?? "http://localhost:18123",
  database: process.env.CLICKHOUSE_DB ?? "analytics",
  password: process.env.CLICKHOUSE_PASSWORD ?? "frog",
});

// ─── Weighted random helper ──────────────────────────────────────────────────

function pick<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randHex(bytes = 16) {
  return randomBytes(bytes).toString("hex");
}

// ─── Distribution tables ─────────────────────────────────────────────────────

const PAGES = [
  { path: "/", weight: 28 },
  { path: "/pricing", weight: 16 },
  { path: "/features/web-analytics", weight: 11 },
  { path: "/features/session-replay", weight: 7 },
  { path: "/features/funnels", weight: 5 },
  { path: "/docs", weight: 9 },
  { path: "/docs/getting-started", weight: 5 },
  { path: "/blog/google-analytics-alternative", weight: 8 },
  { path: "/blog/gdpr-compliant-analytics", weight: 6 },
  { path: "/compare/google-analytics", weight: 5 },
];

const INTERNAL_PAGES = [
  { path: "/pricing", weight: 25 },
  { path: "/docs", weight: 20 },
  { path: "/docs/getting-started", weight: 15 },
  { path: "/features/web-analytics", weight: 12 },
  { path: "/features/session-replay", weight: 10 },
  { path: "/blog/google-analytics-alternative", weight: 10 },
  { path: "/compare/google-analytics", weight: 8 },
];

const REFERRERS = [
  { ref: "", channel: "Direct", weight: 28 },
  { ref: "google.com", channel: "Organic Search", weight: 34 },
  { ref: "x.com", channel: "Social", weight: 10 },
  { ref: "linkedin.com", channel: "Social", weight: 9 },
  { ref: "news.ycombinator.com", channel: "Referral", weight: 8 },
  { ref: "dev.to", channel: "Referral", weight: 6 },
  { ref: "reddit.com", channel: "Social", weight: 5 },
];

const COUNTRIES = [
  { code: "US", weight: 38 },
  { code: "GB", weight: 14 },
  { code: "DE", weight: 11 },
  { code: "FR", weight: 8 },
  { code: "CA", weight: 7 },
  { code: "AU", weight: 5 },
  { code: "NL", weight: 4 },
  { code: "SE", weight: 3 },
  { code: "IN", weight: 5 },
  { code: "BR", weight: 3 },
  { code: "PL", weight: 2 },
];

const DEVICES = [
  { type: "desktop", width: 1920, height: 1080, weight: 63 },
  { type: "mobile", width: 390, height: 844, weight: 31 },
  { type: "tablet", width: 820, height: 1180, weight: 6 },
];

const BROWSERS = [
  { name: "Chrome", version: "124.0.0", weight: 62 },
  { name: "Firefox", version: "125.0", weight: 14 },
  { name: "Safari", version: "17.4", weight: 16 },
  { name: "Edge", version: "124.0.0", weight: 8 },
];

const OS_LIST = [
  { name: "Windows", version: "10", weight: 42 },
  { name: "macOS", version: "14.4", weight: 28 },
  { name: "Linux", version: "", weight: 10 },
  { name: "iOS", version: "17.4", weight: 12 },
  { name: "Android", version: "14", weight: 8 },
];

const LANGUAGES = [
  { lang: "en-US", weight: 45 },
  { lang: "en-GB", weight: 12 },
  { lang: "de-DE", weight: 10 },
  { lang: "fr-FR", weight: 8 },
  { lang: "en-AU", weight: 5 },
  { lang: "en-CA", weight: 5 },
  { lang: "nl-NL", weight: 4 },
  { lang: "sv-SE", weight: 3 },
  { lang: "pl-PL", weight: 4 },
  { lang: "pt-BR", weight: 4 },
];

// ─── Session generator ────────────────────────────────────────────────────────

interface Event {
  site_id: number;
  timestamp: string;
  session_id: string;
  user_id: string;
  hostname: string;
  pathname: string;
  querystring: string;
  page_title: string;
  referrer: string;
  channel: string;
  browser: string;
  browser_version: string;
  operating_system: string;
  operating_system_version: string;
  language: string;
  country: string;
  region: string;
  city: string;
  lat: number;
  lon: number;
  screen_width: number;
  screen_height: number;
  device_type: string;
  type: string;
  event_name: string;
}

function toClickhouseDate(date: Date): string {
  return date.toISOString().replace("T", " ").replace(/\.\d+Z$/, "");
}

function pageTitleForPath(path: string): string {
  const titles: Record<string, string> = {
    "/": "Eesee Metrics — Privacy-First Web Analytics",
    "/pricing": "Pricing — Eesee Metrics",
    "/features/web-analytics": "Web Analytics — Eesee Metrics",
    "/features/session-replay": "Session Replay — Eesee Metrics",
    "/features/funnels": "Funnels — Eesee Metrics",
    "/docs": "Documentation — Eesee Metrics",
    "/docs/getting-started": "Getting Started — Eesee Metrics",
    "/blog/google-analytics-alternative": "The Best Google Analytics Alternative in 2025",
    "/blog/gdpr-compliant-analytics": "GDPR Compliant Analytics Without Cookie Banners",
    "/compare/google-analytics": "Eesee Metrics vs Google Analytics",
  };
  return titles[path] ?? "Eesee Metrics";
}

const CITY_DATA: Record<string, { region: string; city: string; lat: number; lon: number }[]> = {
  US: [
    { region: "California", city: "San Francisco", lat: 37.77, lon: -122.42 },
    { region: "New York", city: "New York", lat: 40.71, lon: -74.01 },
    { region: "Texas", city: "Austin", lat: 30.27, lon: -97.74 },
    { region: "Washington", city: "Seattle", lat: 47.61, lon: -122.33 },
    { region: "Illinois", city: "Chicago", lat: 41.88, lon: -87.63 },
  ],
  GB: [
    { region: "England", city: "London", lat: 51.51, lon: -0.13 },
    { region: "England", city: "Manchester", lat: 53.48, lon: -2.24 },
  ],
  DE: [
    { region: "Bavaria", city: "Munich", lat: 48.14, lon: 11.58 },
    { region: "Berlin", city: "Berlin", lat: 52.52, lon: 13.41 },
  ],
  FR: [
    { region: "Île-de-France", city: "Paris", lat: 48.85, lon: 2.35 },
  ],
  CA: [
    { region: "Ontario", city: "Toronto", lat: 43.65, lon: -79.38 },
    { region: "British Columbia", city: "Vancouver", lat: 49.25, lon: -123.12 },
  ],
  AU: [{ region: "New South Wales", city: "Sydney", lat: -33.87, lon: 151.21 }],
  NL: [{ region: "North Holland", city: "Amsterdam", lat: 52.37, lon: 4.90 }],
  SE: [{ region: "Stockholm", city: "Stockholm", lat: 59.33, lon: 18.07 }],
  IN: [{ region: "Maharashtra", city: "Mumbai", lat: 19.08, lon: 72.88 }],
  BR: [{ region: "São Paulo", city: "São Paulo", lat: -23.55, lon: -46.63 }],
  PL: [{ region: "Masovian", city: "Warsaw", lat: 52.23, lon: 21.01 }],
};

function generateSession(dayStart: Date, userId: string): Event[] {
  const ref = pick(REFERRERS);
  const country = pick(COUNTRIES);
  const device = pick(DEVICES);
  const browser = pick(BROWSERS);
  const os = pick(OS_LIST);
  const lang = pick(LANGUAGES);
  const sessionId = randHex(8);

  // Random time within the day, weighted towards working hours UTC
  const hourWeights = [
    1,1,1,1,1,1,  // 0-5: low
    2,3,4,5,6,7,  // 6-11: rising
    8,8,8,7,7,8,  // 12-17: peak
    7,6,5,4,3,2,  // 18-23: declining
  ];
  const hour = (() => {
    let r = Math.random() * hourWeights.reduce((a, b) => a + b, 0);
    for (let h = 0; h < 24; h++) {
      r -= hourWeights[h];
      if (r <= 0) return h;
    }
    return 12;
  })();
  const minute = randInt(0, 59);
  const second = randInt(0, 59);

  const sessionStart = new Date(dayStart);
  sessionStart.setUTCHours(hour, minute, second, 0);

  const cityList = CITY_DATA[country.code] ?? [{ region: "", city: "", lat: 0, lon: 0 }];
  const cityData = cityList[randInt(0, cityList.length - 1)];

  const landingPage = pick(PAGES);

  // 48% bounce (1 page), otherwise 2-6 pages
  const isBounce = Math.random() < 0.48;
  const pageCount = isBounce ? 1 : randInt(2, 6);

  const events: Event[] = [];
  let currentTime = new Date(sessionStart);

  for (let p = 0; p < pageCount; p++) {
    const path = p === 0 ? landingPage.path : pick(INTERNAL_PAGES).path;
    events.push({
      site_id: SITE_ID,
      timestamp: toClickhouseDate(currentTime),
      session_id: sessionId,
      user_id: userId,
      hostname: "eeseemetrics.com",
      pathname: path,
      querystring: "",
      page_title: pageTitleForPath(path),
      referrer: p === 0 ? ref.ref : "",
      channel: p === 0 ? ref.channel : "",
      browser: browser.name,
      browser_version: browser.version,
      operating_system: os.name,
      operating_system_version: os.version,
      language: lang.lang,
      country: country.code,
      region: cityData.region,
      city: cityData.city,
      lat: cityData.lat,
      lon: cityData.lon,
      screen_width: device.width,
      screen_height: device.height,
      device_type: device.type,
      type: "pageview",
      event_name: "",
    });
    // Time between pages: 20s–3min
    currentTime = new Date(currentTime.getTime() + randInt(20, 180) * 1000);
  }

  return events;
}

// ─── Main ────────────────────────────────────────────────────────────────────

function generateLiveSession(userId: string): Event[] {
  const ref = pick(REFERRERS);
  const country = pick(COUNTRIES);
  const device = pick(DEVICES);
  const browser = pick(BROWSERS);
  const os = pick(OS_LIST);
  const lang = pick(LANGUAGES);
  const sessionId = randHex(8);

  // Timestamp: 10 seconds to 4.5 minutes ago
  const secondsAgo = randInt(10, 270);
  const sessionStart = new Date(Date.now() - secondsAgo * 1000);

  const cityList = CITY_DATA[country.code] ?? [{ region: "", city: "", lat: 0, lon: 0 }];
  const cityData = cityList[randInt(0, cityList.length - 1)];

  const landingPage = pick(PAGES);
  // Live sessions: mostly 1-2 pages (they just arrived)
  const pageCount = Math.random() < 0.6 ? 1 : randInt(2, 3);

  const events: Event[] = [];
  let currentTime = new Date(sessionStart);

  for (let p = 0; p < pageCount; p++) {
    const path = p === 0 ? landingPage.path : pick(INTERNAL_PAGES).path;
    events.push({
      site_id: SITE_ID,
      timestamp: toClickhouseDate(currentTime),
      session_id: sessionId,
      user_id: userId,
      hostname: "eeseemetrics.com",
      pathname: path,
      querystring: "",
      page_title: pageTitleForPath(path),
      referrer: p === 0 ? ref.ref : "",
      channel: p === 0 ? ref.channel : "",
      browser: browser.name,
      browser_version: browser.version,
      operating_system: os.name,
      operating_system_version: os.version,
      language: lang.lang,
      country: country.code,
      region: cityData.region,
      city: cityData.city,
      lat: cityData.lat,
      lon: cityData.lon,
      screen_width: device.width,
      screen_height: device.height,
      device_type: device.type,
      type: "pageview",
      event_name: "",
    });
    currentTime = new Date(currentTime.getTime() + randInt(20, 90) * 1000);
    // Don't go into the future
    if (currentTime > new Date()) break;
  }

  return events;
}

async function main() {
  console.log(`Seeding ${DAYS} days of demo data for site_id=${SITE_ID}...`);

  const now = new Date();
  const allEvents: Event[] = [];

  // Pool of returning user IDs (25% of traffic is returning visitors)
  const returningUserPool: string[] = Array.from({ length: 80 }, () => randHex(16));

  for (let day = DAYS - 1; day >= 0; day--) {
    const dayStart = new Date(now);
    dayStart.setUTCDate(dayStart.getUTCDate() - day);
    dayStart.setUTCHours(0, 0, 0, 0);

    const dayOfWeek = dayStart.getUTCDay(); // 0=Sun, 6=Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Growth: starts at ~120 sessions/day, grows to ~280 over 90 days
    // Last 7 days spike to ~380-420 (viral/campaign effect)
    const progress = (DAYS - 1 - day) / (DAYS - 1);
    const baseSessions = Math.round(120 + progress * 160);
    const surgeFactor = day <= 7 ? 1.45 + (7 - day) * 0.05 : 1.0;
    // Weekend dip + some natural day-to-day variation
    const variation = 0.88 + Math.random() * 0.24;
    const sessionCount = Math.round(baseSessions * surgeFactor * (isWeekend ? 0.5 : 1.0) * variation);

    for (let s = 0; s < sessionCount; s++) {
      // 25% chance of returning user
      const isReturning = Math.random() < 0.25;
      const userId = isReturning
        ? returningUserPool[randInt(0, returningUserPool.length - 1)]
        : randHex(16);

      const events = generateSession(dayStart, userId);
      allEvents.push(...events);
    }

    if (day % 10 === 0) {
      console.log(`  Day ${DAYS - day}/${DAYS} — ${allEvents.length.toLocaleString()} events so far`);
    }
  }

  // ── Live visitors (12–18 active sessions right now) ─────────────────────
  const liveCount = randInt(12, 18);
  console.log(`\nGenerating ${liveCount} live visitor sessions...`);
  for (let i = 0; i < liveCount; i++) {
    const userId = randHex(16);
    allEvents.push(...generateLiveSession(userId));
  }

  console.log(`\nGenerated ${allEvents.length.toLocaleString()} total events. Inserting...`);

  // Insert in batches
  for (let i = 0; i < allEvents.length; i += BATCH_SIZE) {
    const batch = allEvents.slice(i, i + BATCH_SIZE);
    await ch.insert({
      table: "events",
      values: batch,
      format: "JSONEachRow",
    });
    process.stdout.write(`\r  Inserted ${Math.min(i + BATCH_SIZE, allEvents.length).toLocaleString()} / ${allEvents.length.toLocaleString()}`);
  }

  console.log("\n\nDone! ✓");
  console.log(`\nNext steps:`);
  console.log(`  1. Open the app and go to site ${SITE_ID}`);
  console.log(`  2. Enable public sharing in Site Settings`);
  console.log(`  3. Copy the share URL (format: /siteId/privateKey/main)`);
  console.log(`  4. Update HeroSection.tsx iframe src to that URL`);

  await ch.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
