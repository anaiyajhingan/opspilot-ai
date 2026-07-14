import { db } from "@/lib/db";
import type { Incident, Alert } from "@prisma/client";

/**
 * Dashboard repository — data access layer for dashboard aggregations.
 * Handles incident counts, severity breakdown, recent alerts, and activity.
 *
 * All queries are scoped to the user's organization via the organizationId
 * parameter — the caller (service layer) is responsible for resolving this
 * from the session.
 */

export type DashboardIncidentStats = {
  total: number;
  open: number;
  investigating: number;
  identified: number;
  monitoring: number;
  resolved: number;
  closed: number;
};

export type SeverityBreakdown = {
  sev1: number;
  sev2: number;
  sev3: number;
  sev4: number;
};

export type RecentIncident = Pick<
  Incident,
  "id" | "title" | "status" | "severity" | "createdAt"
> & {
  assigneeName: string | null;
  projectName: string;
};

export type RecentAlert = Pick<Alert, "id" | "title" | "source" | "status" | "severity" | "createdAt"> & {
  projectName: string;
};

export class DashboardRepository {
  /**
   * Get incident statistics for the organization.
   */
  async getIncidentStats(organizationId: string): Promise<DashboardIncidentStats> {
    const incidents = await db.incident.findMany({
      where: {
        project: {
          organizationId,
        },
      },
      select: {
        status: true,
      },
    });

    const stats: DashboardIncidentStats = {
      total: incidents.length,
      open: 0,
      investigating: 0,
      identified: 0,
      monitoring: 0,
      resolved: 0,
      closed: 0,
    };

    for (const incident of incidents) {
      stats[incident.status.toLowerCase() as keyof DashboardIncidentStats]++;
    }

    return stats;
  }

  /**
   * Get severity breakdown for open incidents.
   */
  async getSeverityBreakdown(organizationId: string): Promise<SeverityBreakdown> {
    const incidents = await db.incident.findMany({
      where: {
        project: {
          organizationId,
        },
        status: {
          in: ["OPEN", "INVESTIGATING", "IDENTIFIED", "MONITORING"],
        },
      },
      select: {
        severity: true,
      },
    });

    const breakdown: SeverityBreakdown = {
      sev1: 0,
      sev2: 0,
      sev3: 0,
      sev4: 0,
    };

    for (const incident of incidents) {
      const key = incident.severity.toLowerCase() as keyof SeverityBreakdown;
      breakdown[key]++;
    }

    return breakdown;
  }

  /**
   * Get recent incidents for the organization.
   */
  async getRecentIncidents(organizationId: string, limit = 5): Promise<RecentIncident[]> {
    const incidents = await db.incident.findMany({
      where: {
        project: {
          organizationId,
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
        severity: true,
        createdAt: true,
        assignee: {
          select: {
            name: true,
          },
        },
        project: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return incidents.map((incident) => ({
      id: incident.id,
      title: incident.title,
      status: incident.status,
      severity: incident.severity,
      createdAt: incident.createdAt,
      assigneeName: incident.assignee?.name ?? null,
      projectName: incident.project.name,
    }));
  }

  /**
   * Get recent firing alerts for the organization.
   */
  async getRecentAlerts(organizationId: string, limit = 5): Promise<RecentAlert[]> {
    const alerts = await db.alert.findMany({
      where: {
        project: {
          organizationId,
        },
        status: "FIRING",
      },
      select: {
        id: true,
        title: true,
        source: true,
        status: true,
        severity: true,
        createdAt: true,
        project: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return alerts.map((alert) => ({
      id: alert.id,
      title: alert.title,
      source: alert.source,
      status: alert.status,
      severity: alert.severity,
      createdAt: alert.createdAt,
      projectName: alert.project.name,
    }));
  }
}

export const dashboardRepository = new DashboardRepository();
