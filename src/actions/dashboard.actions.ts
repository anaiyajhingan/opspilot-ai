"use server";

import { auth } from "@/lib/auth";
import { dashboardService, type DashboardData } from "@/server/services/dashboard.service";
import { loggerApi as logger } from "@/lib/logger";

/**
 * Server actions for dashboard data fetching.
 *
 * These actions are the entry points for client-side mutations and queries.
 * They handle authentication, authorization, and error handling.
 */

/**
 * Get all dashboard data for the current user's organization.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized: No organization found");
  }

  try {
    const data = await dashboardService.getDashboardData(session.user.organizationId);
    logger.info("Dashboard data fetched", { orgId: session.user.organizationId });
    return data;
  } catch (error) {
    logger.error("Failed to fetch dashboard data", {
      orgId: session.user.organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
