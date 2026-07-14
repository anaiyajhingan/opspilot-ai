import { db } from "@/lib/db";
import type { Alert, AlertStatus, Severity } from "@prisma/client";

/**
 * Alert repository — data access layer for alert operations.
 * Handles CRUD, filtering, sorting, pagination, and related data.
 *
 * All queries are scoped to the user's organization via the organizationId
 * parameter — the caller (service layer) is responsible for resolving this
 * from the session.
 */

export type AlertWithRelations = Alert & {
  project: { id: string; name: string; organizationId: string };
  incident?: { id: string; title: string } | null;
  assignedUser?: { id: string; name: string; email: string } | null;
  incidentId?: string | null;
  assignedUserId?: string | null;
};

export type AlertListItem = Pick<
  Alert,
  "id" | "title" | "status" | "severity" | "source" | "createdAt" | "updatedAt"
> & {
  projectName: string;
  incidentId?: string | null;
  incidentTitle?: string | null;
  assignedUserId?: string | null;
  assignedUserName?: string | null;
};

export type AlertFilters = {
  status?: string[];
  severity?: string[];
  projectId?: string;
  source?: string;
  search?: string;
};

export type AlertSort = {
  field: "createdAt" | "updatedAt" | "severity" | "status" | "source";
  direction: "asc" | "desc";
};

export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export class AlertRepository {
  /**
   * Get alerts with filtering, sorting, and pagination.
   */
  async getAlerts(
    organizationId: string,
    filters: AlertFilters = {},
    sort: AlertSort = { field: "createdAt", direction: "desc" },
    pagination: PaginationParams = { page: 1, pageSize: 20 },
  ): Promise<PaginatedResult<AlertListItem>> {
    const { status, severity, projectId, source, search } = filters;
    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;

    const where: any = {
      project: { organizationId },
    };

    if (status && status.length > 0) {
      where.status = { in: status };
    }

    if (severity && severity.length > 0) {
      where.severity = { in: severity };
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (source) {
      where.source = source;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { source: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      db.alert.findMany({
        where,
        include: {
          project: { select: { id: true, name: true } },
          incident: { select: { id: true, title: true } },
          assignedUser: { select: { id: true, name: true } },
        },
        orderBy: { [sort.field]: sort.direction },
        skip,
        take: pageSize,
      }),
      db.alert.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        severity: item.severity,
        source: item.source,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        projectName: item.project.name,
        incidentId: item.incident?.id,
        incidentTitle: item.incident?.title,
        assignedUserId: item.assignedUser?.id,
        assignedUserName: item.assignedUser?.name,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get a single alert by ID with all relations.
   */
  async getAlertById(id: string, organizationId: string): Promise<AlertWithRelations | null> {
    const alert = await db.alert.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, organizationId: true } },
        incident: { select: { id: true, title: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });

    if (!alert || alert.project.organizationId !== organizationId) {
      return null;
    }

    return alert as AlertWithRelations;
  }

  /**
   * Create a new alert.
   */
  async createAlert(
    data: {
      title: string;
      source: string;
      severity: Severity;
      status: AlertStatus;
      projectId: string;
      incidentId?: string;
      assignedUserId?: string;
    },
  ): Promise<Alert> {
    return db.alert.create({
      data,
    });
  }

  /**
   * Update an existing alert.
   */
  async updateAlert(
    id: string,
    data: {
      title?: string;
      source?: string;
      status?: AlertStatus;
      severity?: Severity;
      incidentId?: string;
      assignedUserId?: string;
    },
  ): Promise<Alert> {
    return db.alert.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete an alert.
   */
  async deleteAlert(id: string): Promise<Alert> {
    return db.alert.delete({
      where: { id },
    });
  }

  /**
   * Get projects for the organization (for filtering).
   */
  async getProjects(organizationId: string) {
    return db.project.findMany({
      where: { organizationId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Get all unique sources across alerts in the organization.
   */
  async getSources(organizationId: string): Promise<string[]> {
    const alerts = await db.alert.findMany({
      where: { project: { organizationId } },
      select: { source: true },
      distinct: ["source"],
    });

    return alerts.map((alert) => alert.source).sort();
  }

  /**
   * Get incidents for linking to alerts.
   */
  async getIncidents(organizationId: string) {
    return db.incident.findMany({
      where: { project: { organizationId } },
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get users for assigning to alerts.
   */
  async getUsers(organizationId: string) {
    return db.user.findMany({
      where: { organizationId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  }
}

export const alertRepository = new AlertRepository();
