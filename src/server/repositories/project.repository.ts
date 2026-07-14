import { db } from "@/lib/db";
import type { Project, Incident, Alert } from "@prisma/client";

/**
 * Project repository — data access layer for project operations.
 * Handles CRUD, filtering, sorting, pagination, and related data.
 *
 * All queries are scoped to the user's organization via the organizationId
 * parameter — the caller (service layer) is responsible for resolving this
 * from the session.
 */

export type ProjectWithStats = Project & {
  _count: {
    incidents: number;
    alerts: number;
  };
  incidentStats: {
    total: number;
    open: number;
    resolved: number;
    critical: number;
  };
  recentIncidents: Array<{
    id: string;
    title: string;
    status: string;
    severity: string;
    createdAt: Date;
  }>;
};

export type ProjectListItem = Pick<Project, "id" | "name" | "description" | "createdAt" | "updatedAt"> & {
  _count: {
    incidents: number;
    alerts: number;
  };
  incidentStats: {
    total: number;
    open: number;
    resolved: number;
    critical: number;
  };
};

export type ProjectFilters = {
  search?: string;
  hasIncidents?: boolean;
  hasOpenIncidents?: boolean;
};

export type ProjectSort = {
  field: "name" | "createdAt" | "updatedAt" | "incidentCount";
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

export class ProjectRepository {
  /**
   * Get projects with filtering, sorting, and pagination.
   */
  async getProjects(
    organizationId: string,
    filters: ProjectFilters = {},
    sort: ProjectSort = { field: "createdAt", direction: "desc" },
    pagination: PaginationParams = { page: 1, pageSize: 20 },
  ): Promise<PaginatedResult<ProjectListItem>> {
    const { search, hasIncidents, hasOpenIncidents } = filters;
    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;

    const where: any = {
      organizationId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (hasIncidents !== undefined) {
      if (hasIncidents) {
        where.incidents = { some: {} };
      } else {
        where.incidents = { none: {} };
      }
    }

    if (hasOpenIncidents !== undefined) {
      if (hasOpenIncidents) {
        where.incidents = { some: { status: { in: ["OPEN", "INVESTIGATING", "IDENTIFIED", "MONITORING"] } } };
      } else {
        where.incidents = { every: { status: { in: ["RESOLVED", "CLOSED"] } } };
      }
    }

    const [projects, total] = await Promise.all([
      db.project.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              incidents: true,
              alerts: true,
            },
          },
        },
        orderBy: this.getOrderBy(sort),
        skip,
        take: pageSize,
      }),
      db.project.count({ where }),
    ]);

    // Calculate incident stats for each project
    const items = await Promise.all(
      projects.map(async (project) => {
        const incidentStats = await this.getProjectIncidentStats(project.id);
        return {
          ...project,
          incidentStats,
        };
      }),
    );

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get a single project by ID with full statistics.
   */
  async getProjectById(id: string, organizationId: string): Promise<ProjectWithStats | null> {
    const project = await db.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            incidents: true,
            alerts: true,
          },
        },
      },
    });

    if (!project || project.organizationId !== organizationId) {
      return null;
    }

    const incidentStats = await this.getProjectIncidentStats(id);
    const recentIncidents = await this.getRecentIncidents(id, 5);

    return {
      ...project,
      incidentStats,
      recentIncidents,
    } as ProjectWithStats;
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
  ): Promise<Project> {
    return db.project.create({
      data,
    });
  }

  /**
   * Update an existing project.
   */
  async updateProject(
    id: string,
    data: {
      name?: string;
      description?: string;
    },
  ): Promise<Project> {
    return db.project.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a project.
   */
  async deleteProject(id: string): Promise<Project> {
    return db.project.delete({
      where: { id },
    });
  }

  /**
   * Get incident statistics for a project.
   */
  async getProjectIncidentStats(projectId: string) {
    const incidents = await db.incident.findMany({
      where: { projectId },
      select: {
        status: true,
        severity: true,
      },
    });

    const stats = {
      total: incidents.length,
      open: 0,
      resolved: 0,
      critical: 0,
    };

    for (const incident of incidents) {
      if (["OPEN", "INVESTIGATING", "IDENTIFIED", "MONITORING"].includes(incident.status)) {
        stats.open++;
      }
      if (["RESOLVED", "CLOSED"].includes(incident.status)) {
        stats.resolved++;
      }
      if (incident.severity === "SEV1") {
        stats.critical++;
      }
    }

    return stats;
  }

  /**
   * Get recent incidents for a project.
   */
  async getRecentIncidents(projectId: string, limit = 5) {
    return db.incident.findMany({
      where: { projectId },
      select: {
        id: true,
        title: true,
        status: true,
        severity: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Get all projects for the organization (for dropdowns).
   */
  async getAllProjects(organizationId: string) {
    return db.project.findMany({
      where: { organizationId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Get project statistics for dashboard widgets.
   */
  async getProjectStats(organizationId: string) {
    const projects = await db.project.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: {
            incidents: true,
          },
        },
      },
    });

    const activeProjects = projects.filter((p) => p._count.incidents > 0);
    const delayedProjects = await this.getDelayedProjects(organizationId);
    const completedProjects = await this.getCompletedProjects(organizationId);

    return {
      total: projects.length,
      active: activeProjects.length,
      delayed: delayedProjects,
      completed: completedProjects,
    };
  }

  /**
   * Get projects with open critical incidents (delayed/at risk).
   */
  async getDelayedProjects(organizationId: string) {
    const projectsWithCritical = await db.project.findMany({
      where: {
        organizationId,
        incidents: {
          some: {
            severity: "SEV1",
            status: { in: ["OPEN", "INVESTIGATING", "IDENTIFIED", "MONITORING"] },
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return projectsWithCritical;
  }

  /**
   * Get projects with all incidents resolved (completed).
   */
  async getCompletedProjects(organizationId: string) {
    const projects = await db.project.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: { incidents: true },
        },
      },
    });

    const completed = await Promise.all(
      projects.map(async (project) => {
        const stats = await this.getProjectIncidentStats(project.id);
        return stats.total > 0 && stats.open === 0 ? project : null;
      }),
    );

    return completed.filter(Boolean);
  }

  /**
   * Get recent project activity for dashboard.
   */
  async getRecentProjectActivity(organizationId: string, limit = 5) {
    const recentIncidents = await db.incident.findMany({
      where: {
        project: { organizationId },
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return recentIncidents.map((incident) => ({
      id: incident.id,
      title: incident.title,
      createdAt: incident.createdAt,
      projectName: incident.project.name,
      projectId: incident.project.id,
    }));
  }

  private getOrderBy(sort: ProjectSort) {
    if (sort.field === "incidentCount") {
      return { incidents: { _count: sort.direction } } as any;
    }
    return { [sort.field]: sort.direction };
  }
}

export const projectRepository = new ProjectRepository();
