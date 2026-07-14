import { db } from "@/lib/db";
import type { Incident, IncidentComment, IncidentTimelineEvent, Attachment, IncidentStatus, Severity, AttachmentKind } from "@prisma/client";

/**
 * Incident repository — data access layer for incident operations.
 * Handles CRUD, filtering, sorting, pagination, and related data.
 *
 * All queries are scoped to the user's organization via the organizationId
 * parameter — the caller (service layer) is responsible for resolving this
 * from the session.
 */

export type IncidentWithRelations = Incident & {
  project: { id: string; name: string };
  createdBy: { id: string; name: string; email: string };
  assignee: { id: string; name: string; email: string } | null;
  comments: (IncidentComment & { author: { id: string; name: string } })[];
  timelineEvents: (IncidentTimelineEvent & { actor: { id: string; name: string } | null })[];
  attachments: Attachment[];
  _count: { comments: number };
};

export type IncidentListItem = Pick<
  Incident,
  "id" | "title" | "status" | "severity" | "tags" | "createdAt" | "updatedAt" | "resolvedAt"
> & {
  projectName: string;
  assigneeName: string | null;
  assigneeEmail: string | null;
  createdBy: string;
  _count: { comments: number };
};

export type IncidentFilters = {
  status?: string[];
  severity?: string[];
  projectId?: string;
  assigneeId?: string;
  search?: string;
  tags?: string[];
};

export type IncidentSort = {
  field: "createdAt" | "updatedAt" | "severity" | "status" | "resolvedAt";
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

export class IncidentRepository {
  /**
   * Get incidents with filtering, sorting, and pagination.
   */
  async getIncidents(
    organizationId: string,
    filters: IncidentFilters = {},
    sort: IncidentSort = { field: "createdAt", direction: "desc" },
    pagination: PaginationParams = { page: 1, pageSize: 20 },
  ): Promise<PaginatedResult<IncidentListItem>> {
    const { status, severity, projectId, assigneeId, search, tags } = filters;
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

    if (assigneeId) {
      where.assigneeId = assigneeId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    const [items, total] = await Promise.all([
      db.incident.findMany({
        where,
        select: {
          id: true,
          title: true,
          status: true,
          severity: true,
          tags: true,
          createdAt: true,
          updatedAt: true,
          resolvedAt: true,
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true } },
          createdBy: { select: { name: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { [sort.field]: sort.direction },
        skip,
        take: pageSize,
      }),
      db.incident.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        severity: item.severity,
        tags: item.tags,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        resolvedAt: item.resolvedAt,
        projectName: item.project.name,
        assigneeName: item.assignee?.name ?? null,
        assigneeEmail: item.assignee?.email ?? null,
        createdBy: item.createdBy.name,
        _count: item._count,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get a single incident by ID with all relations.
   */
  async getIncidentById(id: string, organizationId: string): Promise<IncidentWithRelations | null> {
    const incident = await db.incident.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, organizationId: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        comments: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
        timelineEvents: {
          include: { actor: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
        attachments: true,
        _count: { select: { comments: true } },
      },
    });

    if (!incident || incident.project.organizationId !== organizationId) {
      return null;
    }

    return incident as IncidentWithRelations;
  }

  /**
   * Create a new incident.
   */
  async createIncident(
    data: {
      title: string;
      description: string;
      severity: Severity;
      status: IncidentStatus;
      tags: string[];
      projectId: string;
      createdById: string;
      assigneeId?: string;
    },
  ): Promise<Incident> {
    return db.incident.create({
      data,
    });
  }

  /**
   * Update an existing incident.
   */
  async updateIncident(
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: IncidentStatus;
      severity?: Severity;
      tags?: string[];
      assigneeId?: string;
      resolvedAt?: Date | null;
    },
  ): Promise<Incident> {
    const updateData: any = { ...data };
    if (data.assigneeId === null) {
      updateData.assigneeId = undefined;
    }
    return db.incident.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete an incident.
   */
  async deleteIncident(id: string): Promise<Incident> {
    return db.incident.delete({
      where: { id },
    });
  }

  /**
   * Add a comment to an incident.
   */
  async createComment(
    data: {
      body: string;
      incidentId: string;
      authorId: string;
    },
  ): Promise<IncidentComment> {
    return db.incidentComment.create({
      data,
    });
  }

  /**
   * Add a timeline event to an incident.
   */
  async createTimelineEvent(
    data: {
      incidentId: string;
      actorId?: string;
      label: string;
      detail?: string;
    },
  ): Promise<IncidentTimelineEvent> {
    return db.incidentTimelineEvent.create({
      data,
    });
  }

  /**
   * Add an attachment to an incident.
   */
  async createAttachment(
    data: {
      incidentId: string;
      fileName: string;
      url: string;
      kind: AttachmentKind;
      sizeBytes: number;
    },
  ): Promise<Attachment> {
    return db.attachment.create({
      data,
    });
  }

  /**
   * Delete an attachment.
   */
  async deleteAttachment(id: string): Promise<Attachment> {
    return db.attachment.delete({
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
   * Get users for the organization (for assignment).
   */
  async getUsers(organizationId: string) {
    return db.user.findMany({
      where: { organizationId },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Get all unique tags across incidents in the organization.
   */
  async getTags(organizationId: string): Promise<string[]> {
    const incidents = await db.incident.findMany({
      where: { project: { organizationId } },
      select: { tags: true },
    });

    const tagSet = new Set<string>();
    for (const incident of incidents) {
      for (const tag of incident.tags) {
        tagSet.add(tag);
      }
    }

    return Array.from(tagSet).sort();
  }
}

export const incidentRepository = new IncidentRepository();
