import { z } from "zod";
import type { LlmTextOutput, ReportCadence, ScaleEnrichment } from "./aiReportTypes.js";
import { pctChange } from "./aiReportTypes.js";
import type { OverviewData, MetricData } from "../weekyReports/weeklyReportTypes.js";

// ---------------------------------------------------------------------------
// Zod schema — validates ONLY the text fields the LLM is responsible for.
// Numbers are never part of the LLM contract.
// ---------------------------------------------------------------------------

const highlightSchema = z.object({
  type: z.enum(["positive", "negative", "neutral"]),
  metric: z.string().min(1, "metric must not be empty"),
  observation: z.string().min(5, "observation is too short"),
});

export const llmTextOutputSchema = z.object({
  summary: z
    .string()
    .min(20, "summary must be at least 20 characters")
    .max(1000, "summary must be under 1000 characters"),
  highlights: z
    .array(highlightSchema)
    .min(1, "at least 1 highlight is required")
    .max(8, "no more than 8 highlights"),
  recommendations: z
    .array(z.string().min(10, "recommendation is too short"))
    .min(1, "at least 1 recommendation is required")
    .max(5, "no more than 5 recommendations"),
});

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

export interface PromptInput {
  siteDomain: string;
  cadence: ReportCadence;
  periodStart: string;
  periodEnd: string;
  current: OverviewData;
  previous: OverviewData | null;
  topPages: MetricData[];
  topReferrers: MetricData[];
  topCountries: MetricData[];
  deviceBreakdown: MetricData[];
  goals?: Array<{ name: string; conversions: number; rate: number }>;
  newVsReturning?: { newVisitors: number; returningVisitors: number; newPercentage: number };
  gscTopQueries?: Array<{ query: string; clicks: number; impressions: number; position: number }>;
  scaleEnrichment?: ScaleEnrichment;
  isScale?: boolean;
}

function buildScaleDataBlock(se: ScaleEnrichment): string {
  const lines: string[] = ["\n--- Scale insights ---"];

  // Page movers
  const { gainers, losers, newEntrants } = se.pageMovers;
  if (newEntrants.length || gainers.length || losers.length) {
    lines.push("\nPage movers vs previous period:");
    if (newEntrants.length)
      lines.push(`  New in top 10: ${newEntrants.map(p => `${p.page} (${p.currentSessions} sessions)`).join(", ")}`);
    if (gainers.length)
      lines.push(`  Biggest gainers: ${gainers.map(p => `${p.page} +${p.delta} sessions`).join(", ")}`);
    if (losers.length)
      lines.push(`  Biggest decliners: ${losers.map(p => `${p.page} ${p.delta} sessions`).join(", ")}`);
  }

  // Channel mix
  if (se.channelMix.length) {
    lines.push("\nChannel mix (this period vs previous):");
    for (const c of se.channelMix) {
      const arrow = c.currentPercentage > c.prevPercentage ? "↑" : c.currentPercentage < c.prevPercentage ? "↓" : "→";
      lines.push(`  ${c.channel}: ${c.currentSessions} sessions (${c.currentPercentage}%) [prev: ${c.prevSessions} (${c.prevPercentage}%)] ${arrow}`);
    }
  }

  // Goal trends
  if (se.goalTrends?.length) {
    lines.push("\nGoal trends:");
    for (const g of se.goalTrends) {
      const trend = g.rateChange !== null
        ? ` (rate ${g.rateChange > 0 ? "+" : ""}${g.rateChange}% vs prev)`
        : " (no prev data)";
      lines.push(`  ${g.name}: ${g.conversions} conversions (${g.rate.toFixed(1)}%) [prev: ${g.prevConversions} (${g.prevRate.toFixed(1)}%)]${trend}`);
    }
  }

  // Campaigns
  if (se.campaigns?.length) {
    lines.push("\nTop UTM campaigns:");
    for (const c of se.campaigns) {
      lines.push(`  ${c.campaign}: ${c.sessions} sessions (${c.percentage}%)`);
    }
  }

  // Entry → next page
  if (se.entryNextPages.length) {
    lines.push("\nEntry page → most common next page:");
    for (const e of se.entryNextPages) {
      lines.push(`  ${e.entryPage} → ${e.nextPage} (${e.sessions} sessions)`);
    }
  }

  // Peak traffic
  if (se.peakTrafficWindow.peakDays.length) {
    lines.push(
      `\nPeak traffic: ${se.peakTrafficWindow.peakDays.join(" and ")}, peak hour ${se.peakTrafficWindow.peakHour}:00–${(se.peakTrafficWindow.peakHour + 1) % 24}:00 UTC`
    );
  }

  // Trend history
  if (se.trendHistory?.length) {
    lines.push(`\nTraffic trend (${se.trendHistory.length} periods):`);
    for (const t of se.trendHistory) {
      const bounce = t.bounceRate !== null ? `, ${t.bounceRate.toFixed(1)}% bounce` : "";
      lines.push(`  ${t.periodStart} → ${t.periodEnd}: ${t.sessions} sessions, ${t.pageviews} pageviews${bounce}`);
    }
  }

  return lines.join("\n");
}

/**
 * Builds the system + user messages sent to the LLM.
 *
 * The LLM is asked to return ONLY three text fields:
 *   summary, highlights, recommendations
 *
 * All numeric data (pageview counts, % changes, top-N lists) is computed
 * in TypeScript and provided to the LLM as READ-ONLY context — the LLM
 * references these numbers in its prose but never reproduces them in its
 * JSON response. This eliminates number hallucination entirely.
 */
export function buildAiReportMessages(
  input: PromptInput
): Array<{ role: "system" | "user"; content: string }> {
  const { siteDomain, cadence, periodStart, periodEnd, current, previous, topPages, topReferrers, topCountries, deviceBreakdown, goals, newVsReturning, gscTopQueries } = input;

  // Compute percentage changes in TypeScript — these are facts, not LLM output
  const pageviewsChange = pctChange(current.pageviews, previous?.pageviews);
  const sessionsChange = pctChange(current.sessions, previous?.sessions);
  const usersChange = pctChange(current.users, previous?.users);
  const bounceRateChange =
    current.bounce_rate != null && previous?.bounce_rate != null
      ? pctChange(current.bounce_rate, previous.bounce_rate)
      : null;

  const fmtPct = (v: number | null) =>
    v != null ? ` (${v > 0 ? "+" : ""}${v}% vs prev period)` : " (no prior period)";

  const fmtList = (items: MetricData[]) =>
    items.map(i => `  - ${i.value}: ${i.count} sessions (${i.percentage?.toFixed(1) ?? "?"}%)`).join("\n") ||
    "  (no data)";

  const dataBlock = `
Site: ${siteDomain}
Report period: ${periodStart} to ${periodEnd}  (${cadence})

--- Metrics ---
Pageviews:        ${current.pageviews}${fmtPct(pageviewsChange)}
Sessions:         ${current.sessions}${fmtPct(sessionsChange)}
Unique visitors:  ${current.users}${fmtPct(usersChange)}
Bounce rate:      ${current.bounce_rate != null ? current.bounce_rate.toFixed(1) + "%" : "N/A"}${bounceRateChange != null ? fmtPct(bounceRateChange) : ""}
Avg session:      ${current.session_duration.toFixed(0)}s
Pages / session:  ${current.pages_per_session?.toFixed(2) ?? "N/A"}

--- Top pages ---
${fmtList(topPages)}

--- Top referrers ---
${fmtList(topReferrers)}

--- Top countries ---
${fmtList(topCountries)}

--- Device breakdown ---
${fmtList(deviceBreakdown)}
${goals && goals.length > 0
  ? `\n--- Goals / conversions ---\n${goals.map(g => `  - ${g.name}: ${g.conversions} conversions (${g.rate.toFixed(1)}% of sessions)`).join("\n")}`
  : ""}
${newVsReturning
  ? `\n--- New vs returning ---\nNew visitors: ${newVsReturning.newPercentage.toFixed(1)}% | Returning: ${(100 - newVsReturning.newPercentage).toFixed(1)}%`
  : ""}
${gscTopQueries && gscTopQueries.length > 0
  ? `\n--- Top search queries (Google Search Console) ---\n${gscTopQueries.slice(0, 5).map(q => `  - "${q.query}": ${q.clicks} clicks | pos ${q.position.toFixed(1)}`).join("\n")}`
  : ""}
${input.scaleEnrichment ? buildScaleDataBlock(input.scaleEnrichment) : ""}
`.trim();

  // The schema the LLM must return — text only, no numbers
  const responseSchema = `{
  "summary": "<2-3 sentence plain-English narrative of this period's performance>",
  "highlights": [
    { "type": "positive|negative|neutral", "metric": "<metric name>", "observation": "<1 concise sentence referencing the specific figure>" }
  ],
  "recommendations": [
    "<specific, actionable suggestion based on the data>"
  ]
}`;

  return [
    {
      role: "system",
      content:
        "You are an analytics assistant for Eesee Metrics. You analyse real web traffic data and write brief, factual, opinionated commentary that helps website owners understand what happened and what to do next.\n\nTone rules — follow all of these:\n- Be direct and specific. Lead with the most significant change.\n- Always reference exact figures from the data (e.g. \"Sessions rose 23%\", not \"sessions increased significantly\").\n- Use plain English. No jargon, no filler phrases (\"it is worth noting\", \"interestingly\", \"it should be mentioned\").\n- Do not speculate about causes — report facts and observable patterns only.\n- One insight per sentence. No compound sentences joined with \"and\" or \"while\".\n\nVocabulary — always use these exact metric names (no synonyms):\n- \"Pageviews\" (not \"page views\", \"page visits\", \"views\")\n- \"Sessions\" (not \"visits\", \"user sessions\")\n- \"Unique visitors\" (not \"users\", \"unique users\", \"visitors\")\n- \"Bounce rate\" (not \"bounce\", \"single-page sessions\")\n- \"Avg. session duration\" (not \"session length\", \"time on site\")\n\nReturn ONLY valid JSON with no markdown fences, no preamble, no commentary.",
    },
    {
      role: "user",
      content: `Write a commentary for the analytics data below. Return JSON matching this exact schema:\n\n${responseSchema}\n\nRules:\n- summary: 2–3 sentences. First sentence states the single most significant metric change with exact figure. Second sentence names the top page or referrer. Third sentence (optional) notes a concern if bounce rate or session duration changed meaningfully.
- If goals data is present, the summary MUST mention the most significant goal conversion rate.
- If new vs returning data is present, mention it only if the split is notably skewed (>75% new or >75% returning).
- If GSC data is present, highlight the top search query or ranking opportunity in recommendations.
${input.scaleEnrichment ? `- Scale insights are provided. Reference page movers, channel shifts, goal trends, campaigns, and entry flows where they reveal meaningful patterns. Do not mention all data — only what is noteworthy.` : ""}\n- highlights: ${input.isScale ? "4–8" : "2–4"} items. Each is one factual observation tied to a specific metric. Use the exact metric vocabulary defined in your instructions. type must reflect whether the change is good or bad for the site (positive = growth/improvement, negative = decline/concern).\n- recommendations: ${input.isScale ? "3–5" : "2–3"} items. Each is a specific, actionable suggestion directly derived from the data — name the page, referrer, or metric it applies to. Never give generic advice.\n- Do NOT include any numbers in your JSON output — only text that references the numbers provided above.\n- Return raw JSON only, no markdown.\n\nExample of a good output (for illustration only — do not copy this data):\n{\n  "summary": "Sessions rose 34% this week, the strongest growth in the past month. The /pricing page was the top entry point, accounting for 28% of all sessions. Bounce rate climbed to 71%, suggesting visitors are not finding what they expect on landing.",\n  "highlights": [\n    { "type": "positive", "metric": "Sessions", "observation": "Sessions increased 34% compared to the prior week, reaching the highest weekly total." },\n    { "type": "positive", "metric": "Pageviews", "observation": "Pageviews grew in line with sessions, indicating visitors are browsing multiple pages per visit." },\n    { "type": "negative", "metric": "Bounce rate", "observation": "Bounce rate rose to 71%, up from 54% the previous week — a significant deterioration in engagement." },\n    { "type": "neutral", "metric": "Avg. session duration", "observation": "Avg. session duration remained flat at 94 seconds, consistent with the prior period." }\n  ],\n  "recommendations": [\n    "Review the /pricing page — it drives 28% of sessions but has the highest bounce rate; consider adding a clearer CTA or social proof above the fold.",\n    "Investigate the spike in direct traffic on Tuesday — an unusual volume jump that may indicate a campaign or mention worth tracking.",\n    "The top referrer (twitter.com) sent 18% of sessions this week; consider posting more consistently there to sustain the traffic."\n  ]\n}\n\nData:\n\n${dataBlock}`,
    },
  ];
}

// ---------------------------------------------------------------------------
// Parser — Zod validation with descriptive error messages used for retry
// ---------------------------------------------------------------------------

/**
 * Parses and validates the raw LLM response as LlmTextOutput.
 * Strips markdown code fences defensively.
 * Throws a descriptive error if JSON is invalid or Zod validation fails.
 * The error message is fed back to the LLM on retry so it can self-correct.
 */
export function parseLlmTextOutput(raw: string): LlmTextOutput {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `Response is not valid JSON. First 200 chars received: ${cleaned.slice(0, 200)}`
    );
  }

  const result = llmTextOutputSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map(i => `${i.path.join(".") || "root"}: ${i.message}`)
      .join("; ");
    throw new Error(`Schema validation failed — ${issues}`);
  }

  return result.data;
}
