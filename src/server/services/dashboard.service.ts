import { dashboardRepository, type DashboardIncidentStats, type SeverityBreakdown, type RecentIncident, type RecentAlert } from "@/server/repositories/dashboard.repository";

/**
 * Dashboard service — business logic layer for dashboard data.
 * Orchestrates repository calls and applies any business rules.
 *
 * This layer is responsible for:
 * - Coordinating multiple repository calls
 * - Applying business logic (e.g., filtering, transformations)
 * - Returning structured data to the action layer
 */

export type DashboardData = {
  incidentStats: DashboardIncidentStats;
  severityBreakdown: SeverityBreakdown;
  recentIncidents: RecentIncident[];
  recentAlerts: RecentAlert[];
};

export class DashboardService {
  /**
   * Get all dashboard data for an organization in a single call.
   * This is more efficient than multiple round-trips from the client.
   */
  async getDashboardData(organizationId: string): Promise<DashboardData> {
    const [incidentStats, severityBreakdown, recentIncidents, recentAlerts] =
      await Promise.all([
        dashboardRepository.getIncidentStats(organizationId),
        dashboardRepository.getSeverityBreakdown(organizationId),
        dashboardRepository.getRecentIncidents(organizationId, 5),
        dashboardRepository.getRecentAlerts(organizationId, 5),
      ]);

    return {
      incidentStats,
      severityBreakdown,
      recentIncidents,
      recentAlerts,
    };
  }

  /**
   * Get incident statistics only.
   */
  async getIncidentStats(organizationId: string): Promise<DashboardIncidentStats> {
    return dashboardRepository.getIncidentStats(organizationId);
  }

  /**
   * Get severity breakdown only.
   */
  async getSeverityBreakdown(organizationId: string): Promise<SeverityBreakdown> {
    return dashboardRepository.getSeverityBreakdown(organizationId);
  }

  /**
   * Get recent incidents only.
   */
  async getRecentIncidents(organizationId: string): Promise<RecentIncident[]> {
    return dashboardRepository.getRecentIncidents(organizationId, 5);
  }

  /**
   * Get recent alerts only.
   */
  async getRecentAlerts(organizationId: string): Promise<RecentAlert[]> {
    return dashboardRepository.getRecentAlerts(organizationId, 5);
  }
}

export const dashboardService = new DashboardService();
