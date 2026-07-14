"use server";

import { auth } from "@/lib/auth";
import { loggerApi as logger } from "@/lib/logger";
import { assertCan, denormalizeRole } from "@/lib/rbac";
import type { Result } from "@/types";
import { incidentService } from "@/server/services/incident.service";
import {
  type CreateIncidentInput,
  type UpdateIncidentInput,
  type CommentInput,
  type IncidentFiltersInput,
  type IncidentSortInput,
  type PaginationInput,
  createIncidentSchema,
  updateIncidentSchema,
  commentSchema,
  incidentFiltersSchema,
  incidentSortSchema,
  paginationSchema,
} from "@/features/incidents/schemas";

/**
 * Server actions for incident operations.
 *
 * These actions are the entry points for client-side mutations and queries.
 * They handle authentication, authorization, and error handling.
 */

/**
 * Get incidents with filtering, sorting, and pagination.
 */
export async function getIncidents(
  filters: IncidentFiltersInput = {},
  sort: IncidentSortInput = { field: "createdAt", direction: "desc" },
  pagination: PaginationInput = { page: 1, pageSize: 20 },
) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized: No organization found");
  }

  try {
    const result = await incidentService.getIncidents(
      session.user.organizationId,
      filters,
      sort,
      pagination,
    );
    logger.info("Incidents fetched", { orgId: session.user.organizationId, count: result.items.length });
    return result;
  } catch (error) {
    logger.error("Failed to fetch incidents", {
      orgId: session.user.organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get a single incident by ID.
 */
export async function getIncident(id: string) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized: No organization found");
  }

  try {
    const incident = await incidentService.getIncidentById(id, session.user.organizationId);
    if (!incident) {
      throw new Error("Incident not found");
    }
    logger.info("Incident fetched", { orgId: session.user.organizationId, incidentId: id });
    return incident;
  } catch (error) {
    logger.error("Failed to fetch incident", {
      orgId: session.user.organizationId,
      incidentId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Create a new incident.
 */
export async function createIncident(input: CreateIncidentInput): Promise<Result<{ id: string }>> {
  const session = await auth();

  if (!session?.user?.organizationId || !session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = createIncidentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    assertCan(session.user.role, "incident:create");

    const incident = await incidentService.createIncident({
      ...parsed.data,
      createdById: session.user.id,
    });

    logger.info("Incident created", { orgId: session.user.organizationId, incidentId: incident.id });
    return { ok: true, data: { id: incident.id } };
  } catch (error) {
    logger.error("Failed to create incident", {
      orgId: session.user.organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to create incident" };
  }
}

/**
 * Update an existing incident.
 */
export async function updateIncident(id: string, input: UpdateIncidentInput): Promise<Result<{ id: string }>> {
  const session = await auth();

  if (!session?.user?.organizationId || !session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = updateIncidentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    assertCan(session.user.role, "incident:edit");

    const incident = await incidentService.updateIncident(id, session.user.organizationId, {
      ...parsed.data,
      actorId: session.user.id,
    });

    logger.info("Incident updated", { orgId: session.user.organizationId, incidentId: id });
    return { ok: true, data: { id: incident.id } };
  } catch (error) {
    logger.error("Failed to update incident", {
      orgId: session.user.organizationId,
      incidentId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to update incident" };
  }
}

/**
 * Delete an incident.
 */
export async function deleteIncident(id: string): Promise<Result<null>> {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    assertCan(session.user.role, "incident:delete");

    await incidentService.deleteIncident(id, session.user.organizationId);

    logger.info("Incident deleted", { orgId: session.user.organizationId, incidentId: id });
    return { ok: true, data: null };
  } catch (error) {
    logger.error("Failed to delete incident", {
      orgId: session.user.organizationId,
      incidentId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to delete incident" };
  }
}

/**
 * Add a comment to an incident.
 */
export async function addComment(incidentId: string, input: CommentInput): Promise<Result<{ id: string }>> {
  const session = await auth();

  if (!session?.user?.organizationId || !session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = commentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    assertCan(session.user.role, "incident:comment");

    const incident = await incidentService.addComment(incidentId, session.user.organizationId, {
      ...parsed.data,
      authorId: session.user.id,
    });

    logger.info("Comment added", { orgId: session.user.organizationId, incidentId });
    return { ok: true, data: { id: incident.id } };
  } catch (error) {
    logger.error("Failed to add comment", {
      orgId: session.user.organizationId,
      incidentId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to add comment" };
  }
}

/**
 * Get projects for filtering.
 */
export async function getProjects() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized: No organization found");
  }

  try {
    const projects = await incidentService.getProjects(session.user.organizationId);
    return projects;
  } catch (error) {
    logger.error("Failed to fetch projects", {
      orgId: session.user.organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get users for assignment.
 */
export async function getUsers() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized: No organization found");
  }

  try {
    const users = await incidentService.getUsers(session.user.organizationId);
    return users;
  } catch (error) {
    logger.error("Failed to fetch users", {
      orgId: session.user.organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get all unique tags.
 */
export async function getTags() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized: No organization found");
  }

  try {
    const tags = await incidentService.getTags(session.user.organizationId);
    return tags;
  } catch (error) {
    logger.error("Failed to fetch tags", {
      orgId: session.user.organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
