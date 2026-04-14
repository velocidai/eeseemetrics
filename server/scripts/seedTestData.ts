// server/scripts/seedTestData.ts
// Usage: cd server && SITE_ID=42 npx tsx scripts/seedTestData.ts
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

// Load .env from server/ directory regardless of where script is run from
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { createClient } from "@clickhouse/client";
import { DateTime } from "luxon";
import { randomUUID } from "crypto";

const SITE_ID = Number(process.env.SITE_ID ?? "0");
if (!SITE_ID) {
  console.error("ERROR: Set SITE_ID env var to the siteId you want to seed");
  console.error("Usage: SITE_ID=42 npx tsx scripts/seedTestData.ts");
  process.exit(1);
}

const clickhouse = createClient({
  url: process.env.CLICKHOUSE_HOST ?? "http://localhost:8123",
  database: process.env.CLICKHOUSE_DB ?? "default",
  password: process.env.CLICKHOUSE_PASSWORD ?? "",
});

const PAGES = ["/", "/pricing", "/docs", "/blog", "/about", "/contact", "/features"];
const REFERRERS = ["https://google.com", "https://twitter.com", "https://github.com", "", "https://linkedin.com"];
const COUNTRIES: string[] = ["US", "GB", "DE", "FR", "CA", "AU", "JP"];
const DEVICES = ["desktop", "mobile", "tablet"];
const BROWSERS = ["Chrome", "Firefox", "Safari", "Edge"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface EventRow {
  site_id: number;
  timestamp: string;
  session_id: string;
  user_id: string;
  hostname: string;
  pathname: string;
  querystring: string;
  referrer: string;
  channel: string;
  browser: string;
  device_type: string;
  country: string;
  type: string;
}

function makeSession(siteId: number, dayStart: DateTime): EventRow[] {
  const sessionId = randomUUID();
  const userId = randomUUID();
  const country = randomFrom(COUNTRIES);
  const device = randomFrom(DEVICES);
  const browser = randomFrom(BROWSERS);
  const referrer = randomFrom(REFERRERS);
  const channel = referrer.includes("google")
    ? "organic"
    : referrer
    ? "referral"
    : "direct";
  const hostname = "example.com";

  const pageCount = Math.floor(Math.random() * 4) + 1;
  const events: EventRow[] = [];

  const sessionStartOffset = Math.floor(Math.random() * 86400);

  for (let p = 0; p < pageCount; p++) {
    const offsetSeconds = sessionStartOffset + p * (30 + Math.floor(Math.random() * 120));
    const ts = dayStart.plus({ seconds: offsetSeconds });

    events.push({
      site_id: siteId,
      timestamp: ts.toFormat("yyyy-MM-dd HH:mm:ss"),
      session_id: sessionId,
      user_id: userId,
      hostname,
      pathname: randomFrom(PAGES),
      querystring: "",
      referrer: p === 0 ? referrer : "",
      channel: p === 0 ? channel : "",
      browser,
      device_type: device,
      country,
      type: "pageview",
    });
  }

  return events;
}

async function seedDay(siteId: number, dayStart: DateTime, sessionCount: number): Promise<void> {
  const allEvents: EventRow[] = [];
  for (let i = 0; i < sessionCount; i++) {
    allEvents.push(...makeSession(siteId, dayStart));
  }

  await clickhouse.insert({
    table: "events",
    values: allEvents,
    format: "JSONEachRow",
  });

  console.log(
    `  ${dayStart.toISODate()} — ${sessionCount} sessions, ${allEvents.length} events`
  );
}

async function main() {
  const now = DateTime.utc();

  console.log(`\nSeeding site_id=${SITE_ID} with 30 days of test data...`);
  console.log(`ClickHouse: ${process.env.CLICKHOUSE_HOST ?? "http://localhost:8123"}\n`);

  // Verify ClickHouse is reachable before starting
  console.log("Checking ClickHouse connection...");
  await clickhouse.ping();
  console.log("✓ ClickHouse connected\n");

  // Clean up any existing data for this site in the seeding window to avoid duplicates on re-run
  const cleanFrom = now.minus({ days: 31 }).startOf("day").toFormat("yyyy-MM-dd HH:mm:ss");
  console.log(`Cleaning up existing data for site_id=${SITE_ID} in seeding window...`);
  await clickhouse.exec({
    query: `ALTER TABLE events DELETE WHERE site_id = {siteId:UInt16} AND timestamp >= toDateTime({cleanFrom:String})`,
    query_params: { siteId: SITE_ID, cleanFrom },
  });
  console.log("✓ Old data cleared\n");

  // Days D-30 through D-2: normal traffic (100 sessions/day)
  for (let daysAgo = 30; daysAgo >= 2; daysAgo--) {
    const day = now.minus({ days: daysAgo }).startOf("day");
    await seedDay(SITE_ID, day, 100);
  }

  // Yesterday (D-1): deliberate drop to 40 sessions — 60% below baseline
  // Anomaly thresholds: alert at 30%, high severity at 50%
  // 60% drop → high severity alert on sessions metric
  const yesterday = now.minus({ days: 1 }).startOf("day");
  await seedDay(SITE_ID, yesterday, 40);

  console.log(`\n✓ Seeded 29 normal days + 1 anomaly day for site_id=${SITE_ID}`);
  console.log(`  Yesterday: 40 sessions vs ~100 baseline → ~60% drop`);
  console.log(`  This will trigger a HIGH severity sessions anomaly alert.\n`);

  await clickhouse.close();
}

main().catch((err) => {
  console.error("Seeder failed:", err);
  process.exit(1);
});
