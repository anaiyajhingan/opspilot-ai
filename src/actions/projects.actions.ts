"use server";

import { auth } from "@/lib/auth";
import { loggerApi as logger } from "@/lib/logger";
import { assertCan } from "@/lib/rbac";
import type { Result } from "@/types";
import { projectService } from "@/server/services/project.service";
import {
  type CreateProjectInput,
  type UpdateProjectInput,
  type ProjectFiltersInput,
  type ProjectSortInput,
  type PaginationInput,
  createProjectSchema,
  updateProjectSchema,
  projectFiltersSchema,
  projectSortSchema,
  paginationSchema,
} from "@/features/projects/schemas";

/**
 * Server actions for project operations.
 *
 * These actions are the entry points for client-side mutations and queries.
 * They handle authentication, authorization, and error handling.
 */

/**
 * Get projects with filtering, sorting, and pagination.
 */
export async function getProjects(
  filters: ProjectFiltersInput = {},
  sort: ProjectSortInput = { field: "createdAt", direction: "desc" },
  pagination: PaginationInput = { page: 1, pageSize: 20 },
) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized: No organization found");
  }

  try {
    const result = await projectService.getProjects(
      session.user.organizationId,
      filters,
      sort,
      pagination,
    );
    logger.info("Projects fetched", { orgId: session.user.organizationId, count: result.items.length });
    return result;
  } catch (error) {
    logger.error("Failed to fetch projects", {
      orgId: session.user.organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get a single project by ID.
 */
export async function getProject(id: string) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized: No organization found");
  }

  try {
    const project = await projectService.getProjectById(id, session.user.organizationId);
    if (!project) {
      throw new Error("Project not found");
    }
    logger.info("Project fetched", { orgId: session.user.organizationId, projectId: id });
    return project;
  } catch (error) {
    logger.error("Failed to fetch project", {
      orgId: session.user.organizationId,
      projectId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Create a new project.
 */
export async function createProject(input: CreateProjectInput): Promise<Result<{ id: string }>> {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = createProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    assertCan(session.user.role, "project:create");

    const project = await projectService.createProject({
      ...parsed.data,
      organizationId: session.user.organizationId,
    });

    logger.info("Project created", { orgId: session.user.organizationId, projectId: project.id });
    return { ok: true, data: { id: project.id } };
  } catch (error) {
    logger.error("Failed to create project", {
      orgId: session.user.organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to create project" };
  }
}

/**
 * Update an existing project.
 */
export async function updateProject(id: string, input: UpdateProjectInput): Promise<Result<{ id: string }>> {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = updateProjectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    assertCan(session.user.role, "project:edit");

    const project = await projectService.updateProject(id, session.user.organizationId, parsed.data);

    logger.info("Project updated", { orgId: session.user.organizationId, projectId: id });
    return { ok: true, data: { id: project.id } };
  } catch (error) {
    logger.error("Failed to update project", {
      orgId: session.user.organizationId,
      projectId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to update project" };
  }
}

/**
 * Delete a project.
 */
export async function deleteProject(id: string): Promise<Result<null>> {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    assertCan(session.user.role, "project:delete");

    await projectService.deleteProject(id, session.user.organizationId);

    logger.info("Project deleted", { orgId: session.user.organizationId, projectId: id });
    return { ok: true, data: null };
  } catch (error) {
    logger.error("Failed to delete project", {
      orgId: session.user.organizationId,
      projectId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to delete project" };
  }
}

/**
 * Get all projects for dropdowns.
 */
export async function getAllProjects() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized: No organization found");
  }

  try {
    const projects = await projectService.getAllProjects(session.user.organizationId);
    return projects;
  } catch (error) {
    logger.error("Failed to fetch all projects", {
      orgId: session.user.organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get project statistics for dashboard widgets.
 */
export async function getProjectStats() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized: No organization found");
  }

  try {
    const stats = await projectService.getProjectStats(session.user.organizationId);
    return stats;
  } catch (error) {
    logger.error("Failed to fetch project stats", {
      orgId: session.user.organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get recent project activity for dashboard.
 */
export async function getRecentProjectActivity(limit = 5) {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized: No organization found");
  }

  try {
    const activity = await projectService.getRecentProjectActivity(session.user.organizationId, limit);
    return activity;
  } catch (error) {
    logger.error("Failed to fetch recent project activity", {
      orgId: session.user.organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
