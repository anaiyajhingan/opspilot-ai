import { incidentRepository, type IncidentWithRelations, type IncidentListItem, type IncidentFilters, type IncidentSort, type PaginationParams, type PaginatedResult } from "@/server/repositories/incident.repository";
import type { Severity, IncidentStatus } from "@prisma/client";

/**
 * Incident service — business logic layer for incident operations.
 * Orchestrates repository calls and applies business rules.
 *
 * This layer is responsible for:
 * - Coordinating multiple repository calls
 * - Applying business logic (e.g., status transitions, timeline events)
 * - Returning structured data to the action layer
 */

export class IncidentService {
  /**
   * Get incidents with filtering, sorting, and pagination.
   */
  async getIncidents(
    organizationId: string,
    filters: IncidentFilters = {},
    sort: IncidentSort = { field: "createdAt", direction: "desc" },
    pagination: PaginationParams = { page: 1, pageSize: 20 },
  ): Promise<PaginatedResult<IncidentListItem>> {
    return incidentRepository.getIncidents(organizationId, filters, sort, pagination);
  }

  /**
   * Get a single incident by ID with all relations.
   */
  async getIncidentById(id: string, organizationId: string): Promise<IncidentWithRelations | null> {
    return incidentRepository.getIncidentById(id, organizationId);
  }

  /**
   * Create a new incident with timeline event.
   */
  async createIncident(
    data: {
      title: string;
      description: string;
      severity: string;
      status: string;
      tags: string[];
      projectId: string;
      createdById: string;
      assigneeId?: string;
    },
  ): Promise<IncidentWithRelations> {
    const incident = await incidentRepository.createIncident({
      ...data,
      severity: data.severity as Severity,
      status: data.status as IncidentStatus,
    });

    // Create timeline event for incident creation
    await incidentRepository.createTimelineEvent({
      incidentId: incident.id,
      actorId: data.createdById,
      label: "Incident created",
      detail: `Severity: ${data.severity}, Status: ${data.status}`,
    });

    // Fetch the complete incident with relations
    const fullIncident = await incidentRepository.getIncidentById(incident.id, "");
    return fullIncident as IncidentWithRelations;
  }

  /**
   * Update an existing incident with timeline event.
   */
  async updateIncident(
    id: string,
    organizationId: string,
    data: {
      title?: string;
      description?: string;
      status?: string;
      severity?: string;
      tags?: string[];
      assigneeId?: string;
      resolvedAt?: Date | null;
      actorId: string;
    },
  ): Promise<IncidentWithRelations> {
    const { actorId, ...updateData } = data;
    const incident = await incidentRepository.updateIncident(id, {
      ...updateData,
      status: data.status as IncidentStatus | undefined,
      severity: data.severity as Severity | undefined,
    });

    // Create timeline event for significant changes
    const changes: string[] = [];
    if (data.status) changes.push(`status to ${data.status}`);
    if (data.severity) changes.push(`severity to ${data.severity}`);
    if (data.assigneeId !== undefined) changes.push("assignee");
    if (data.resolvedAt !== undefined) changes.push("resolved at");

    if (changes.length > 0) {
      await incidentRepository.createTimelineEvent({
        incidentId: id,
        actorId,
        label: "Incident updated",
        detail: `Changed ${changes.join(", ")}`,
      });
    }

    // Fetch the complete incident with relations
    const fullIncident = await incidentRepository.getIncidentById(id, organizationId);
    return fullIncident as IncidentWithRelations;
  }

  /**
   * Delete an incident.
   */
  async deleteIncident(id: string, organizationId: string): Promise<void> {
    // Verify the incident belongs to the organization
    const incident = await incidentRepository.getIncidentById(id, organizationId);
    if (!incident) {
      throw new Error("Incident not found");
    }

    await incidentRepository.deleteIncident(id);
  }

  /**
   * Add a comment to an incident.
   */
  async addComment(
    incidentId: string,
    organizationId: string,
    data: {
      body: string;
      authorId: string;
    },
  ): Promise<IncidentWithRelations> {
    // Verify the incident belongs to the organization
    const incident = await incidentRepository.getIncidentById(incidentId, organizationId);
    if (!incident) {
      throw new Error("Incident not found");
    }

    await incidentRepository.createComment({
      ...data,
      incidentId,
    });

    // Create timeline event for comment
    await incidentRepository.createTimelineEvent({
      incidentId,
      actorId: data.authorId,
      label: "Comment added",
    });

    // Fetch the complete incident with relations
    const fullIncident = await incidentRepository.getIncidentById(incidentId, organizationId);
    return fullIncident as IncidentWithRelations;
  }

  /**
   * Add an attachment to an incident.
   */
  async addAttachment(
    incidentId: string,
    organizationId: string,
    data: {
      fileName: string;
      url: string;
      kind: string;
      sizeBytes: number;
      actorId: string;
    },
  ): Promise<IncidentWithRelations> {
    // Verify the incident belongs to the organization
    const incident = await incidentRepository.getIncidentById(incidentId, organizationId);
    if (!incident) {
      throw new Error("Incident not found");
    }

    await incidentRepository.createAttachment({
      incidentId,
      fileName: data.fileName,
      url: data.url,
      kind: data.kind as any,
      sizeBytes: data.sizeBytes,
    });

    // Create timeline event for attachment
    await incidentRepository.createTimelineEvent({
      incidentId,
      actorId: data.actorId,
      label: "Attachment added",
      detail: data.fileName,
    });

    // Fetch the complete incident with relations
    const fullIncident = await incidentRepository.getIncidentById(incidentId, organizationId);
    return fullIncident as IncidentWithRelations;
  }

  /**
   * Delete an attachment.
   */
  async deleteAttachment(attachmentId: string, incidentId: string, organizationId: string, actorId: string): Promise<IncidentWithRelations> {
    // Verify the incident belongs to the organization
    const incident = await incidentRepository.getIncidentById(incidentId, organizationId);
    if (!incident) {
      throw new Error("Incident not found");
    }

    await incidentRepository.deleteAttachment(attachmentId);

    // Create timeline event for attachment deletion
    await incidentRepository.createTimelineEvent({
      incidentId,
      actorId,
      label: "Attachment deleted",
    });

    // Fetch the complete incident with relations
    const fullIncident = await incidentRepository.getIncidentById(incidentId, organizationId);
    return fullIncident as IncidentWithRelations;
  }

  /**
   * Get projects for filtering.
   */
  async getProjects(organizationId: string) {
    return incidentRepository.getProjects(organizationId);
  }

  /**
   * Get users for assignment.
   */
  async getUsers(organizationId: string) {
    return incidentRepository.getUsers(organizationId);
  }

  /**
   * Get all unique tags.
   */
  async getTags(organizationId: string) {
    return incidentRepository.getTags(organizationId);
  }
}

export const incidentService = new IncidentService();
