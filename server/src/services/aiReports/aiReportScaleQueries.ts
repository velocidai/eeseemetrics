/**
 * Scale-tier enrichment queries for AI reports.
 * All functions are pure or take explicit ClickHouse/Postgres clients
 * so they can be tested with mocks.
 */
import type { PageMover, ChannelMixItem, CampaignSummary, EntryNextPage, PeakTrafficWindow } from "./aiReportTypes.js";
import { clickhouse } from "../../db/clickhouse/clickhouse.js";
import { processResults } from "../../api/analytics/utils/utils.js";
import { createServiceLogger } from "../../lib/logger/logger.js";

const logger = createServiceLogger("ai-report-scale");

// ---------------------------------------------------------------------------
// Pure helper — tested directly
// ---------------------------------------------------------------------------

type PageMoverRow = {
  page: string;
  current_sessions: number;
  prev_sessions: number;
  delta: number;
  in_current: number;
  in_prev: number;
};

export function categorizePageMovers(rows: PageMoverRow[]): {
  gainers: PageMover[];
  losers: PageMover[];
  newEntrants: PageMover[];
} {
  const gainers: PageMover[] = [];
  const losers: PageMover[] = [];
  const newEntrants: PageMover[] = [];

  for (const row of rows) {
    const inCurrent = Boolean(Number(row.in_current));
    const inPrev = Boolean(Number(row.in_prev));
    const mover: PageMover = {
      page: row.page,
      currentSessions: Number(row.current_sessions),
      prevSessions: Number(row.prev_sessions),
      delta: Number(row.delta),
      isNew: inCurrent && !inPrev,
    };

    if (mover.isNew && mover.currentSessions > 0) {
      newEntrants.push(mover);
    } else if (inCurrent && mover.delta > 0) {
      gainers.push(mover);
    } else if (mover.delta < 0) {
      losers.push(mover);
    }
  }

  // Sort losers by biggest absolute loss first
  losers.sort((a, b) => a.delta - b.delta);

  return {
    gainers: gainers.slice(0, 3),
    losers: losers.slice(0, 3),
    newEntrants: newEntrants.slice(0, 3),
  };
}

// ---------------------------------------------------------------------------
// ClickHouse queries
// ---------------------------------------------------------------------------

export async function fetchPageMovers(
  siteId: number,
  startDate: string,
  endDate: string,
  prevStartDate: string,
  prevEndDate: string
): Promise<{ gainers: PageMover[]; losers: PageMover[]; newEntrants: PageMover[] }> {
  try {
    const query = `
      WITH
        current_pages AS (
          SELECT pathname AS page, COUNT(DISTINCT session_id) AS sessions
          FROM events
          WHERE site_id = {siteId:Int32} AND type = 'pageview'
            AND timestamp >= toDateTime({startDate:String})
            AND timestamp < toDateTime({endDate:String})
          GROUP BY pathname ORDER BY sessions DESC LIMIT 10
        ),
        prev_pages AS (
          SELECT pathname AS page, COUNT(DISTINCT session_id) AS sessions
          FROM events
          WHERE site_id = {siteId:Int32} AND type = 'pageview'
            AND timestamp >= toDateTime({prevStartDate:String})
            AND timestamp < toDateTime({prevEndDate:String})
          GROUP BY pathname ORDER BY sessions DESC LIMIT 10
        ),
        all_pages AS (
          SELECT page FROM current_pages
          UNION DISTINCT
          SELECT page FROM prev_pages
        )
      SELECT
        a.page,
        coalesce(c.sessions, 0) AS current_sessions,
        coalesce(p.sessions, 0) AS prev_sessions,
        toInt64(coalesce(c.sessions, 0)) - toInt64(coalesce(p.sessions, 0)) AS delta,
        (c.page IS NOT NULL) AS in_current,
        (p.page IS NOT NULL) AS in_prev
      FROM all_pages a
      LEFT JOIN current_pages c ON a.page = c.page
      LEFT JOIN prev_pages p ON a.page = p.page
      ORDER BY delta DESC
    `;
    const result = await clickhouse.query({
      query,
      format: "JSONEachRow",
      query_params: { siteId, startDate, endDate, prevStartDate, prevEndDate },
    });
    const rows = await processResults<PageMoverRow>(result);
    return categorizePageMovers(rows);
  } catch (error) {
    logger.warn({ error, siteId }, "fetchPageMovers failed — returning empty");
    return { gainers: [], losers: [], newEntrants: [] };
  }
}

export async function fetchChannelMix(
  siteId: number,
  startDate: string,
  endDate: string,
  prevStartDate: string,
  prevEndDate: string
): Promise<ChannelMixItem[]> {
  try {
    const query = `
      WITH
        current_ch AS (
          SELECT channel AS ch, COUNT(DISTINCT session_id) AS sessions
          FROM events
          WHERE site_id = {siteId:Int32} AND type = 'pageview' AND channel != ''
            AND timestamp >= toDateTime({startDate:String})
            AND timestamp < toDateTime({endDate:String})
          GROUP BY ch
        ),
        prev_ch AS (
          SELECT channel AS ch, COUNT(DISTINCT session_id) AS sessions
          FROM events
          WHERE site_id = {siteId:Int32} AND type = 'pageview' AND channel != ''
            AND timestamp >= toDateTime({prevStartDate:String})
            AND timestamp < toDateTime({prevEndDate:String})
          GROUP BY ch
        ),
        cur_total AS (SELECT greatest(SUM(sessions), 1) AS total FROM current_ch),
        prv_total AS (SELECT greatest(SUM(sessions), 1) AS total FROM prev_ch)
      SELECT
        c.ch AS channel,
        c.sessions AS current_sessions,
        coalesce(p.sessions, 0) AS prev_sessions,
        round(c.sessions * 100.0 / (SELECT total FROM cur_total), 1) AS current_pct,
        round(coalesce(p.sessions, 0) * 100.0 / (SELECT total FROM prv_total), 1) AS prev_pct
      FROM current_ch c
      LEFT JOIN prev_ch p ON c.ch = p.ch
      ORDER BY current_sessions DESC
    `;
    const result = await clickhouse.query({
      query,
      format: "JSONEachRow",
      query_params: { siteId, startDate, endDate, prevStartDate, prevEndDate },
    });
    const rows = await processResults<{
      channel: string;
      current_sessions: number;
      prev_sessions: number;
      current_pct: number;
      prev_pct: number;
    }>(result);
    return rows.map(r => ({
      channel: r.channel,
      currentSessions: Number(r.current_sessions),
      prevSessions: Number(r.prev_sessions),
      currentPercentage: Number(r.current_pct),
      prevPercentage: Number(r.prev_pct),
    }));
  } catch (error) {
    logger.warn({ error, siteId }, "fetchChannelMix failed — returning empty");
    return [];
  }
}

export async function fetchCampaignsForReport(
  siteId: number,
  startDate: string,
  endDate: string
): Promise<CampaignSummary[] | undefined> {
  try {
    const query = `
      WITH totals AS (
        SELECT greatest(COUNT(DISTINCT session_id), 1) AS total
        FROM events
        WHERE site_id = {siteId:Int32} AND type = 'pageview'
          AND timestamp >= toDateTime({startDate:String})
          AND timestamp < toDateTime({endDate:String})
      )
      SELECT
        url_parameters['utm_campaign'] AS campaign,
        COUNT(DISTINCT session_id) AS sessions,
        round(COUNT(DISTINCT session_id) * 100.0 / (SELECT total FROM totals), 1) AS percentage
      FROM events
      WHERE site_id = {siteId:Int32}
        AND url_parameters['utm_campaign'] != ''
        AND type = 'pageview'
        AND timestamp >= toDateTime({startDate:String})
        AND timestamp < toDateTime({endDate:String})
      GROUP BY campaign
      ORDER BY sessions DESC
      LIMIT 5
    `;
    const result = await clickhouse.query({
      query,
      format: "JSONEachRow",
      query_params: { siteId, startDate, endDate },
    });
    const rows = await processResults<{
      campaign: string;
      sessions: number;
      percentage: number;
    }>(result);
    if (!rows.length) return undefined;
    return rows.map(r => ({
      campaign: r.campaign,
      sessions: Number(r.sessions),
      percentage: Number(r.percentage),
    }));
  } catch (error) {
    logger.warn({ error, siteId }, "fetchCampaignsForReport failed — returning undefined");
    return undefined;
  }
}

export async function fetchEntryNextPages(
  siteId: number,
  startDate: string,
  endDate: string
): Promise<EntryNextPage[]> {
  try {
    const query = `
      WITH ranked AS (
        SELECT
          session_id,
          pathname,
          row_number() OVER (PARTITION BY session_id ORDER BY timestamp) AS rn
        FROM events
        WHERE site_id = {siteId:Int32} AND type = 'pageview'
          AND timestamp >= toDateTime({startDate:String})
          AND timestamp < toDateTime({endDate:String})
      ),
      top_entries AS (
        SELECT pathname AS entry_page
        FROM ranked
        WHERE rn = 1
        GROUP BY entry_page
        ORDER BY COUNT(*) DESC
        LIMIT 5
      )
      SELECT
        e.pathname AS entry_page,
        n.pathname AS next_page,
        COUNT(*) AS sessions
      FROM ranked e
      JOIN ranked n ON e.session_id = n.session_id AND e.rn = 1 AND n.rn = 2
      WHERE e.pathname IN (SELECT entry_page FROM top_entries)
      GROUP BY entry_page, next_page
      ORDER BY entry_page, sessions DESC
      LIMIT 1 BY entry_page
    `;
    const result = await clickhouse.query({
      query,
      format: "JSONEachRow",
      query_params: { siteId, startDate, endDate },
    });
    const rows = await processResults<{
      entry_page: string;
      next_page: string;
      sessions: number;
    }>(result);
    return rows.map(r => ({
      entryPage: r.entry_page,
      nextPage: r.next_page,
      sessions: Number(r.sessions),
    }));
  } catch (error) {
    logger.warn({ error, siteId }, "fetchEntryNextPages failed — returning empty");
    return [];
  }
}

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export async function fetchPeakTrafficWindow(
  siteId: number,
  startDate: string,
  endDate: string
): Promise<PeakTrafficWindow> {
  try {
    const [dayResult, hourResult] = await Promise.all([
      clickhouse.query({
        query: `
          SELECT toDayOfWeek(timestamp) AS dow, COUNT(DISTINCT session_id) AS sessions
          FROM events
          WHERE site_id = {siteId:Int32} AND type = 'pageview'
            AND timestamp >= toDateTime({startDate:String})
            AND timestamp < toDateTime({endDate:String})
          GROUP BY dow ORDER BY sessions DESC LIMIT 2
        `,
        format: "JSONEachRow",
        query_params: { siteId, startDate, endDate },
      }),
      clickhouse.query({
        query: `
          SELECT toHour(timestamp) AS hour, COUNT(DISTINCT session_id) AS sessions
          FROM events
          WHERE site_id = {siteId:Int32} AND type = 'pageview'
            AND timestamp >= toDateTime({startDate:String})
            AND timestamp < toDateTime({endDate:String})
          GROUP BY hour ORDER BY sessions DESC LIMIT 1
        `,
        format: "JSONEachRow",
        query_params: { siteId, startDate, endDate },
      }),
    ]);
    const dayRows = await processResults<{ dow: number; sessions: number }>(dayResult);
    const hourRows = await processResults<{ hour: number; sessions: number }>(hourResult);
    return {
      peakDays: dayRows.map(r => DAY_NAMES[(Number(r.dow) - 1) % 7]),
      peakHour: Number(hourRows[0]?.hour ?? 12),
    };
  } catch (error) {
    logger.warn({ error, siteId }, "fetchPeakTrafficWindow failed — returning defaults");
    return { peakDays: [], peakHour: 12 };
  }
}
