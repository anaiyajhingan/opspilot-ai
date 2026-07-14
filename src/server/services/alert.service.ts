import { alertRepository, type AlertWithRelations, type AlertListItem, type AlertFilters, type AlertSort, type PaginationParams, type PaginatedResult } from "@/server/repositories/alert.repository";
import type { Severity, AlertStatus } from "@prisma/client";

/**
 * Alert service — business logic layer for alert operations.
 * Orchestrates repository calls and applies business rules.
 *
 * This layer is responsible for:
 * - Coordinating multiple repository calls
 * - Applying business logic (e.g., status transitions)
 * - Returning structured data to the action layer
 */

export class AlertService {
  /**
   * Get alerts with filtering, sorting, and pagination.
   */
  async getAlerts(
    organizationId: string,
    filters: AlertFilters = {},
    sort: AlertSort = { field: "createdAt", direction: "desc" },
    pagination: PaginationParams = { page: 1, pageSize: 20 },
  ): Promise<PaginatedResult<AlertListItem>> {
    return alertRepository.getAlerts(organizationId, filters, sort, pagination);
  }

  /**
   * Get a single alert by ID with all relations.
   */
  async getAlertById(id: string, organizationId: string): Promise<AlertWithRelations | null> {
    return alertRepository.getAlertById(id, organizationId);
  }

  /**
   * Create a new alert.
   */
  async createAlert(
    organizationId: string,
    data: {
      title: string;
      source: string;
      severity: string;
      status: string;
      projectId: string;
      incidentId?: string;
      assignedUserId?: string;
    },
  ): Promise<AlertWithRelations> {
    const alert = await alertRepository.createAlert({
      ...data,
      severity: data.severity as Severity,
      status: data.status as AlertStatus,
    });

    // Fetch the complete alert with relations
    const fullAlert = await alertRepository.getAlertById(
      alert.id,
      organizationId,
    );
    return fullAlert as AlertWithRelations;
  }

  /**
   * Update an existing alert.
   */
  async updateAlert(
    id: string,
    organizationId: string,
    data: {
      title?: string;
      source?: string;
      status?: string;
      severity?: string;
      incidentId?: string;
      assignedUserId?: string;
    },
  ): Promise<AlertWithRelations> {
    // Verify the alert belongs to the organization
    const existingAlert = await alertRepository.getAlertById(id, organizationId);
    if (!existingAlert) {
      throw new Error("Alert not found");
    }

    const alert = await alertRepository.updateAlert(id, {
      ...data,
      status: data.status as AlertStatus | undefined,
      severity: data.severity as Severity | undefined,
    });

    // Fetch the complete alert with relations
    const fullAlert = await alertRepository.getAlertById(id, organizationId);
    return fullAlert as AlertWithRelations;
  }

  /**
   * Delete an alert.
   */
  async deleteAlert(id: string, organizationId: string): Promise<void> {
    // Verify the alert belongs to the organization
    const alert = await alertRepository.getAlertById(id, organizationId);
    if (!alert) {
      throw new Error("Alert not found");
    }

    await alertRepository.deleteAlert(id);
  }

  /**
   * Acknowledge an alert (change status to ACKNOWLEDGED).
   */
  async acknowledgeAlert(id: string, organizationId: string): Promise<AlertWithRelations> {
    // Verify the alert belongs to the organization
    const existingAlert = await alertRepository.getAlertById(id, organizationId);
    if (!existingAlert) {
      throw new Error("Alert not found");
    }

    const alert = await alertRepository.updateAlert(id, {
      status: "ACKNOWLEDGED",
    });

    // Fetch the complete alert with relations
    const fullAlert = await alertRepository.getAlertById(id, organizationId);
    return fullAlert as AlertWithRelations;
  }

  /**
   * Resolve an alert (change status to RESOLVED).
   */
  async resolveAlert(id: string, organizationId: string): Promise<AlertWithRelations> {
    // Verify the alert belongs to the organization
    const existingAlert = await alertRepository.getAlertById(id, organizationId);
    if (!existingAlert) {
      throw new Error("Alert not found");
    }

    const alert = await alertRepository.updateAlert(id, {
      status: "RESOLVED",
    });

    // Fetch the complete alert with relations
    const fullAlert = await alertRepository.getAlertById(id, organizationId);
    return fullAlert as AlertWithRelations;
  }

  /**
   * Get projects for filtering.
   */
  async getProjects(organizationId: string) {
    return alertRepository.getProjects(organizationId);
  }

  /**
   * Get all unique sources.
   */
  async getSources(organizationId: string) {
    return alertRepository.getSources(organizationId);
  }

  /**
   * Get incidents for linking to alerts.
   */
  async getIncidents(organizationId: string) {
    return alertRepository.getIncidents(organizationId);
  }

  /**
   * Get users for assigning to alerts.
   */
  async getUsers(organizationId: string) {
    return alertRepository.getUsers(organizationId);
  }
}

export const alertService = new AlertService();
