import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpTokenContext } from "../auth.js";
import { registerOverviewTool } from "./overview.js";
import { registerTopPagesTool } from "./topPages.js";
import { registerPageStatsTool } from "./pageStats.js";
import { registerTopReferrersTool } from "./topReferrers.js";
import { registerActiveAlertsTool } from "./activeAlerts.js";
import { registerLatestReportTool } from "./latestReport.js";
import { registerGoalsTool } from "./goals.js";
import { registerRetentionTool } from "./retention.js";
import { registerFunnelsTool } from "./funnels.js";
import { registerErrorsTool } from "./errors.js";
import { registerSessionsTool } from "./sessions.js";
import { registerComparePeriodsTool } from "./comparePeriods.js";
import { registerAllReportsTool } from "./allReports.js";
import { registerCampaignsTool } from "./campaigns.js";
import { registerPerformanceTool } from "./performance.js";
import { registerTopCountriesTool } from "./topCountries.js";
import { registerTopDevicesTool } from "./topDevices.js";
import { registerGscDataTool } from "./gscData.js";
import { registerEventsTool } from "./events.js";
import { registerGetUsersTool, registerGetUserTool } from "./users.js";

/**
 * Registers all 21 tools for Pro+ users.
 * Scale users get the same tools but with higher rate limits (200 req/min vs 60 req/min).
 */
export function registerTools(server: McpServer, ctx: McpTokenContext) {
  registerOverviewTool(server, ctx);
  registerTopPagesTool(server, ctx);
  registerPageStatsTool(server, ctx);
  registerTopReferrersTool(server, ctx);
  registerTopCountriesTool(server, ctx);
  registerTopDevicesTool(server, ctx);
  registerEventsTool(server, ctx);
  registerCampaignsTool(server, ctx);
  registerGoalsTool(server, ctx);
  registerComparePeriodsTool(server, ctx);
  registerActiveAlertsTool(server, ctx);
  registerLatestReportTool(server, ctx);
  registerAllReportsTool(server, ctx);
  registerGscDataTool(server, ctx);
  registerRetentionTool(server, ctx);
  registerFunnelsTool(server, ctx);
  registerErrorsTool(server, ctx);
  registerSessionsTool(server, ctx);
  registerGetUsersTool(server, ctx);
  registerGetUserTool(server, ctx);
  registerPerformanceTool(server, ctx);
}
