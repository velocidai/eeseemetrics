import { authedFetch } from "../../utils";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type ReportCadence = "weekly" | "monthly" | "quarterly" | "yearly";
export type ReportStatus = "generating" | "complete" | "failed";
export type AlertStatus = "new" | "seen" | "dismissed";
export type AlertSeverity = "low" | "medium" | "high";

// ---------------------------------------------------------------------------
// AI Report types
// ---------------------------------------------------------------------------

export interface ReportHighlight {
  type: "positive" | "negative" | "neutral";
  metric: string;
  observation: string;
}

export interface AiReportOverview {
  pageviews: number;
  sessions: number;
  uniqueVisitors: number;
  bounceRate: number | null;
  avgSessionDuration: number;
  pageviewsChange: number | null;
  sessionsChange: number | null;
  usersChange: number | null;
  bounceRateChange: number | null;
}

export interface AiReportStructuredSummary {
  period: { start: string; end: string; cadence: ReportCadence };
  overview: AiReportOverview;
  topPages: Array<{ page: string; sessions: number; percentage: number }>;
  topReferrers: Array<{ referrer: string; sessions: number; percentage: number }>;
  topCountries: Array<{ country: string; sessions: number; percentage: number }>;
  deviceBreakdown: Array<{ device: string; sessions: number; percentage: number }>;
  highlights: ReportHighlight[];
  summary: string;
  recommendations: string[];
  goals?: Array<{ name: string; conversions: number; rate: number }>;
  newVsReturning?: { newVisitors: number; returningVisitors: number; newPercentage: number };
  gscTopQueries?: Array<{ query: string; clicks: number; impressions: number; position: number }>;
}

/** Row returned by the list endpoint (no structuredSummaryJson). */
export interface AiReportListItem {
  id: string;
  cadence: ReportCadence;
  periodStart: string;
  periodEnd: string;
  status: ReportStatus;
  createdAt: string;
}

/** Full row returned by the single-report endpoint. */
export interface AiReport extends AiReportListItem {
  structuredSummaryJson: AiReportStructuredSummary | null;
  errorMessage: string | null;
  updatedAt: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasEnoughData?: boolean;
}

export interface AiReportsListResponse {
  data: AiReportListItem[];
  meta: PaginatedMeta;
}

// ---------------------------------------------------------------------------
// Anomaly Alert types
// ---------------------------------------------------------------------------

export interface AnomalyAlert {
  id: string;
  siteId: number;
  metric: string;
  currentValue: number;
  baselineValue: number;
  percentChange: number;
  severity: AlertSeverity;
  status: AlertStatus;
  cooldownKey: string;
  detectedAt: string;
  createdAt: string;
  updatedAt: string;
  ruleId: number | null;
}

export interface AnomalyAlertsListResponse {
  data: AnomalyAlert[];
  meta: PaginatedMeta;
}

// ---------------------------------------------------------------------------
// Fetch functions
// ---------------------------------------------------------------------------

export async function fetchAiReports(
  siteId: number,
  params: { cadence?: ReportCadence; page?: number; pageSize?: number }
): Promise<AiReportsListResponse> {
  const query: Record<string, any> = {};
  if (params.cadence) query.cadence = params.cadence;
  if (params.page) query.page = params.page;
  if (params.pageSize) query.page_size = params.pageSize;

  return authedFetch<AiReportsListResponse>(`/sites/${siteId}/ai-reports`, query);
}

export async function fetchAiReport(
  siteId: number,
  reportId: string
): Promise<{ data: AiReport }> {
  return authedFetch<{ data: AiReport }>(`/sites/${siteId}/ai-reports/${reportId}`);
}

export async function fetchAnomalyAlerts(
  siteId: number,
  params: { status?: AlertStatus; severity?: AlertSeverity; page?: number; pageSize?: number }
): Promise<AnomalyAlertsListResponse> {
  const query: Record<string, any> = {};
  if (params.status) query.status = params.status;
  if (params.severity) query.severity = params.severity;
  if (params.page) query.page = params.page;
  if (params.pageSize) query.page_size = params.pageSize;

  return authedFetch<AnomalyAlertsListResponse>(`/sites/${siteId}/anomaly-alerts`, query);
}

export async function patchAnomalyAlert(
  siteId: number,
  alertId: string,
  status: "seen" | "dismissed"
): Promise<{ data: AnomalyAlert }> {
  return authedFetch<{ data: AnomalyAlert }>(
    `/sites/${siteId}/anomaly-alerts/${alertId}`,
    undefined,
    { method: "PATCH", data: { status } }
  );
}

export async function fetchAlertUnreadCount(siteId: number): Promise<{ count: number }> {
  return authedFetch<{ count: number }>(`/sites/${siteId}/anomaly-alerts/unread-count`);
}
