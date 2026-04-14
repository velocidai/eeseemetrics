import { and, eq } from "drizzle-orm";
import { DateTime } from "luxon";
import * as cron from "node-cron";
import { processResults } from "../api/analytics/utils/utils.js";
import { clickhouse } from "../db/clickhouse/clickhouse.js";
import { db } from "../db/postgres/postgres.js";
import { member, organization, sites, user } from "../db/postgres/schema.js";
import { DEFAULT_EVENT_LIMIT, IS_CLOUD } from "../lib/const.js";
import { sendLimitExceededEmail } from "../lib/email/email.js";
import { createServiceLogger } from "../lib/logger/logger.js";
import { getBestSubscription } from "../lib/subscriptionUtils.js";

class UsageService {
  private sitesOverLimit = new Set<number>();
  private usageCheckTask: cron.ScheduledTask | null = null;
  private logger = createServiceLogger("usage-checker");

  constructor() {
    this.initializeUsageCheckCron();
  }

  /**
   * Initialize the cron job for checking monthly usage
   */
  private initializeUsageCheckCron() {
    if (IS_CLOUD && process.env.NODE_ENV !== "development") {
      // Schedule the monthly usage checker to run every 30 minutes
      this.usageCheckTask = cron.schedule(
        "*/30 * * * *",
        async () => {
          try {
            await this.updateOrganizationsMonthlyUsage();
          } catch (error) {
            this.logger.error(error as Error, "Error during usage check");
          }
        },
        { timezone: "UTC" }
      );

      this.logger.info("Monthly usage check cron initialized (runs every 30 minutes)");
    }
  }

  /**
   * Gets the set of site IDs that are over their monthly limit
   */
  public getSitesOverLimit(): Set<number> {
    return this.sitesOverLimit;
  }

  /**
   * Checks if a site is over its monthly limit
   */
  public isSiteOverLimit(siteId: number): boolean {
    return this.sitesOverLimit.has(siteId);
  }

  /**
   * Gets the first day of the current month in YYYY-MM-DD format using Luxon
   */
  private getStartOfMonth(): string {
    return DateTime.now().startOf("month").toISODate() as string;
  }

  /**
   * Gets the emails of all organization owners
   */
  private async getOrganizationOwnerEmails(organizationId: string): Promise<string[]> {
    try {
      const owners = await db
        .select({
          email: user.email,
        })
        .from(member)
        .innerJoin(user, eq(member.userId, user.id))
        .where(and(eq(member.organizationId, organizationId), eq(member.role, "owner")));

      return owners.map(owner => owner.email);
    } catch (error) {
      this.logger.error(error as Error, `Error getting owner emails for organization ${organizationId}`);
      return [];
    }
  }

  /**
   * Gets all sites with their organization IDs (excludes sites without an organization)
   */
  private async getAllSites(): Promise<Array<{ siteId: number; organizationId: string }>> {
    try {
      const allSites = await db
        .select({
          siteId: sites.siteId,
          organizationId: sites.organizationId,
        })
        .from(sites);

      // Filter out sites without an organization ID
      return allSites.filter(site => site.organizationId !== null) as Array<{ siteId: number; organizationId: string }>;
    } catch (error) {
      this.logger.error(error as Error, `Error getting all sites`);
      return [];
    }
  }

  /**
   * Gets event limit and billing period start date for an organization based on their best subscription.
   * Checks Stripe subscription for the current event limit.
   * @returns [eventLimit, periodStartDate]
   */
  private async getOrganizationSubscriptionInfo(orgData: {
    id: string;
    stripeCustomerId: string | null;
    createdAt: string;
    name: string;
  }): Promise<[number, string | null]> {
    const adminOrgName = process.env.ADMIN_ORG_NAME;
    if (adminOrgName && orgData.name === adminOrgName) {
      return [Infinity, this.getStartOfMonth()];
    }

    const subscription = await getBestSubscription(orgData.id, orgData.stripeCustomerId);

    if (subscription.source === "stripe") {
      this.logger.info(
        `Organization ${orgData.name} using Stripe ${subscription.planName} (${subscription.interval}) with ${subscription.eventLimit} events/month`
      );
    } else {
      this.logger.info(`Organization ${orgData.name} on free tier with ${subscription.eventLimit} events/month`);
    }

    return [subscription.eventLimit, subscription.periodStart];
  }

  /**
   * Gets monthly event counts for all sites in a single query (for current month)
   * Returns a map of site_id -> event count
   */
  private async getAllSiteEventCounts(): Promise<Map<number, number>> {
    try {
      const periodStart = this.getStartOfMonth();

      const result = await clickhouse.query({
        query: `
          SELECT
            site_id,
            COUNT(*) as count
          FROM events
          WHERE type = 'pageview'
            AND timestamp >= toDate({periodStart:String})
          GROUP BY site_id
        `,
        format: "JSONEachRow",
        query_params: {
          periodStart: periodStart,
        },
      });

      const rows = await processResults<{ site_id: number; count: string }>(result);

      const eventCountMap = new Map<number, number>();
      for (const row of rows) {
        eventCountMap.set(row.site_id, parseInt(row.count, 10));
      }

      return eventCountMap;
    } catch (error) {
      this.logger.error(error as Error, "Error querying ClickHouse for event counts");
      return new Map();
    }
  }

  /**
   * Gets total pageview count for a specific set of sites since a given date.
   * Used to re-count events using the actual Stripe billing period start instead of the calendar month.
   */
  private async getSiteEventCountSinceDate(siteIds: number[], since: string): Promise<number> {
    try {
      const result = await clickhouse.query({
        query: `
          SELECT COUNT(*) as count
          FROM events
          WHERE type = 'pageview'
            AND timestamp >= toDate({since:String})
            AND site_id IN ({siteIds:Array(Int32)})
        `,
        format: "JSONEachRow",
        query_params: {
          since,
          siteIds,
        },
      });

      const rows = await processResults<{ count: string }>(result);
      return rows.length > 0 ? parseInt(rows[0].count, 10) : 0;
    } catch (error) {
      this.logger.error(error as Error, "Error querying ClickHouse for billing-period event counts");
      return 0;
    }
  }

  /**
   * Updates monthly event usage for all organizations
   */
  public async updateOrganizationsMonthlyUsage(): Promise<void> {
    this.logger.info("Starting check of monthly event usage for organizations...");

    try {
      // Step 1: Get all sites with their organization IDs
      const allSites = await this.getAllSites();

      // Step 2: Get event counts for all sites in a single query (current month)
      const eventCountMap = await this.getAllSiteEventCounts();

      // Step 3: Build a map of organizationId -> { siteIds, eventCount }
      const orgDataMap = new Map<string, { siteIds: number[]; eventCount: number }>();
      for (const site of allSites) {
        const orgData = orgDataMap.get(site.organizationId) || { siteIds: [], eventCount: 0 };
        orgData.siteIds.push(site.siteId);
        orgData.eventCount += eventCountMap.get(site.siteId) || 0;
        orgDataMap.set(site.organizationId, orgData);
      }

      // Step 4: Get all organizations
      const organizations = await db
        .select({
          id: organization.id,
          name: organization.name,
          stripeCustomerId: organization.stripeCustomerId,
          createdAt: organization.createdAt,
          overMonthlyLimit: organization.overMonthlyLimit,
        })
        .from(organization);

      // Step 5: Process each organization
      for (const orgData of organizations) {
        try {
          const orgStats = orgDataMap.get(orgData.id);
          const eventCount = orgStats?.eventCount || 0;
          const siteIds = orgStats?.siteIds || [];

          // Only fetch subscription info for organizations with > 3000 events
          // This avoids slow Stripe API calls for low-usage orgs
          let eventLimit: number;
          let isOverLimit: boolean;

          if (eventCount <= DEFAULT_EVENT_LIMIT) {
            // No events yet — not over limit
            eventLimit = DEFAULT_EVENT_LIMIT;
            isOverLimit = false;
            this.logger.debug(`Organization ${orgData.name} has ${eventCount} events, skipping subscription check`);
          } else {
            // Has events — check their actual subscription
            const [fetchedLimit, periodStart] = await this.getOrganizationSubscriptionInfo(orgData);
            eventLimit = fetchedLimit;

            // Use the Stripe billing period start if it's later than the calendar month start.
            // Without this, a user who upgraded mid-month would have all their pre-upgrade
            // events counted against their new plan's limit, causing an early quota hit.
            let billingPeriodEventCount = eventCount;
            const calendarMonthStart = this.getStartOfMonth();
            if (periodStart && periodStart > calendarMonthStart && siteIds.length > 0) {
              billingPeriodEventCount = await this.getSiteEventCountSinceDate(siteIds, periodStart);
              this.logger.info(
                `Organization ${orgData.name}: billing period started ${periodStart} (after calendar month ${calendarMonthStart}), recounted ${billingPeriodEventCount} events`
              );
            }

            isOverLimit = billingPeriodEventCount > eventLimit;
          }

          const wasOverLimit = orgData.overMonthlyLimit ?? false;

          // Update organization's monthlyEventCount and overMonthlyLimit fields
          await db
            .update(organization)
            .set({
              monthlyEventCount: eventCount,
              overMonthlyLimit: isOverLimit,
            })
            .where(eq(organization.id, orgData.id));

          // Send email notification if transitioning from under limit to over limit.
          // Only send when eventLimit > 0 (they had a real paid plan and exceeded it).
          if (isOverLimit && !wasOverLimit && eventLimit > 0) {
            const ownerEmails = await this.getOrganizationOwnerEmails(orgData.id);

            // Send email to all owners if found
            if (ownerEmails.length > 0) {
              for (const ownerEmail of ownerEmails) {
                try {
                  await sendLimitExceededEmail(ownerEmail, orgData.name, eventCount, eventLimit);
                  this.logger.info(`Sent limit exceeded email to owner ${ownerEmail} for organization ${orgData.name}`);
                } catch (error) {
                  this.logger.error(
                    error as Error,
                    `Failed to send limit exceeded email to owner ${ownerEmail} for organization ${orgData.name}`
                  );
                }
              }
            } else {
              this.logger.warn(`No owners found for organization ${orgData.name}, skipping limit exceeded email`);
            }
          }

          // If over the limit, add all this organization's sites to the global set
          if (isOverLimit) {
            for (const siteId of siteIds) {
              this.sitesOverLimit.add(siteId);
            }
            this.logger.info(
              `Organization ${orgData.name} is over limit. Added ${siteIds.length} sites to blocked list.`
            );
          } else {
            for (const siteId of siteIds) {
              this.sitesOverLimit.delete(siteId);
            }
          }

          this.logger.info(
            `Updated organization ${orgData.name}: ${eventCount.toLocaleString()} events, limit ${eventLimit.toLocaleString()}`
          );
        } catch (error) {
          this.logger.error(error as Error, `Error processing organization ${orgData.id}`);
        }
      }

      this.logger.info(`Completed monthly event usage check. ${this.sitesOverLimit.size} sites are over their limit.`);
    } catch (error) {
      this.logger.error(error as Error, "Error updating monthly usage");
    }
  }

  /**
   * Method to stop the usage check cron job (useful for graceful shutdown)
   */
  public stopUsageCheckCron() {
    if (this.usageCheckTask) {
      this.usageCheckTask.stop();
      this.logger.info("Monthly usage check cron stopped");
    }
  }
}

// Create a singleton instance
export const usageService = new UsageService();
