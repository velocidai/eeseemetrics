import { DateTime } from "luxon";
import type { ReportCadence } from "./aiReportTypes.js";

/**
 * Returns the report period window and its equivalent previous window for a given cadence.
 */
export function getPeriodDates(
  cadence: ReportCadence,
  now: DateTime
): {
  periodStart: DateTime;
  periodEnd: DateTime;
  prevPeriodStart: DateTime;
  prevPeriodEnd: DateTime;
} {
  const fmt = (d: DateTime) => d.toUTC();

  let periodStart: DateTime;
  let periodEnd: DateTime;

  switch (cadence) {
    case "weekly":
      periodEnd = fmt(now);
      periodStart = periodEnd.minus({ days: 7 });
      break;
    case "monthly":
      periodEnd = fmt(now.startOf("month"));
      periodStart = periodEnd.minus({ months: 1 });
      break;
    case "quarterly":
      periodEnd = fmt(now.startOf("quarter"));
      periodStart = periodEnd.minus({ months: 3 });
      break;
    case "yearly":
      periodEnd = fmt(now.startOf("year"));
      periodStart = periodEnd.minus({ years: 1 });
      break;
  }

  return {
    periodStart,
    periodEnd,
    prevPeriodStart: periodStart.minus(periodEnd.diff(periodStart)),
    prevPeriodEnd: periodStart,
  };
}

/**
 * Returns the date ranges for multi-period trend history.
 * Used to fetch N prior periods of overview data for context in AI reports.
 *
 * - weekly: returns [] (current vs previous is sufficient)
 * - monthly: returns 3 periods (last 3 months ending at periodStart)
 * - quarterly: returns 4 quarters ending at periodStart
 * - yearly: returns 2 years ending at periodStart
 */
export function getTrendPeriods(
  cadence: ReportCadence,
  periodStart: DateTime
): Array<{ start: DateTime; end: DateTime }> {
  const periods: Array<{ start: DateTime; end: DateTime }> = [];

  if (cadence === "monthly") {
    for (let i = 2; i >= 0; i--) {
      const end = periodStart.minus({ months: i });
      const start = end.minus({ months: 1 });
      periods.push({ start, end });
    }
  } else if (cadence === "quarterly") {
    for (let i = 3; i >= 0; i--) {
      const end = periodStart.minus({ months: i * 3 });
      const start = end.minus({ months: 3 });
      periods.push({ start, end });
    }
  } else if (cadence === "yearly") {
    for (let i = 1; i >= 0; i--) {
      const end = periodStart.minus({ years: i });
      const start = end.minus({ years: 1 });
      periods.push({ start, end });
    }
  }
  // weekly returns empty array — current vs previous is sufficient

  return periods;
}
