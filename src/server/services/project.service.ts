import { projectRepository, type ProjectWithStats, type ProjectListItem, type ProjectFilters, type ProjectSort, type PaginationParams, type PaginatedResult } from "@/server/repositories/project.repository";

/**
 * Project service — business logic layer for project operations.
 * Orchestrates repository calls and applies business rules.
 *
 * This layer is responsible for:
 * - Coordinating multiple repository calls
 * - Applying business logic (e.g., health indicators, progress calculation)
 * - Returning structured data to the action layer
 */

export class ProjectService {
  /**
   * Get projects with filtering, sorting, and pagination.
   */
  async getProjects(
    organizationId: string,
    filters: ProjectFilters = {},
    sort: ProjectSort = { field: "createdAt", direction: "desc" },
    pagination: PaginationParams = { page: 1, pageSize: 20 },
  ): Promise<PaginatedResult<ProjectListItem>> {
    return projectRepository.getProjects(organizationId, filters, sort, pagination);
  }

  /**
   * Get a single project by ID with full statistics.
   */
  async getProjectById(id: string, organizationId: string): Promise<ProjectWithStats | null> {
    return projectRepository.getProjectById(id, organizationId);
  }

  /**
   * Create a new project.
   */
  async createProject(
    data: {
      name: string;
      description?: string;
      organizationId: string;
    },
  ): Promise<ProjectWithStats> {
    const project = await projectRepository.createProject(data);

    // Fetch the complete project with stats
    const fullProject = await projectRepository.getProjectById(project.id, data.organizationId);
    return fullProject as ProjectWithStats;
  }

  /**
   * Update an existing project.
   */
  async updateProject(
    id: string,
    organizationId: string,
    data: {
      name?: string;
      description?: string;
    },
  ): Promise<ProjectWithStats> {
    const project = await projectRepository.updateProject(id, data);

    // Fetch the complete project with stats
    const fullProject = await projectRepository.getProjectById(id, organizationId);
    return fullProject as ProjectWithStats;
  }

  /**
   * Delete a project.
   */
  async deleteProject(id: string, organizationId: string): Promise<void> {
    // Verify the project belongs to the organization
    const project = await projectRepository.getProjectById(id, organizationId);
    if (!project) {
      throw new Error("Project not found");
    }

    await projectRepository.deleteProject(id);
  }

  /**
   * Get all projects for dropdowns.
   */
  async getAllProjects(organizationId: string) {
    return projectRepository.getAllProjects(organizationId);
  }

  /**
   * Get project statistics for dashboard widgets.
   */
  async getProjectStats(organizationId: string) {
    return projectRepository.getProjectStats(organizationId);
  }

  /**
   * Get recent project activity for dashboard.
   */
  async getRecentProjectActivity(organizationId: string, limit = 5) {
    return projectRepository.getRecentProjectActivity(organizationId, limit);
  }

  /**
   * Calculate project health indicator based on incident stats.
   */
  calculateProjectHealth(incidentStats: { total: number; open: number; critical: number }): "healthy" | "at-risk" | "critical" {
    if (incidentStats.critical > 0) return "critical";
    if (incidentStats.open > 5) return "at-risk";
    return "healthy";
  }

  /**
   * Calculate project progress based on resolved incidents.
   */
  calculateProgress(incidentStats: { total: number; resolved: number }): number {
    if (incidentStats.total === 0) return 0;
    return Math.round((incidentStats.resolved / incidentStats.total) * 100);
  }
}

export const projectService = new ProjectService();
