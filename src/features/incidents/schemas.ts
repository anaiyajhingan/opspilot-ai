import { z } from "zod";

export const createIncidentSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().min(1, "Description is required").max(10000),
  severity: z.enum(["SEV1", "SEV2", "SEV3", "SEV4"]),
  status: z.enum(["OPEN", "INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED", "CLOSED"]),
  tags: z.array(z.string().trim()).default([]),
  projectId: z.string().min(1, "Project is required"),
  assigneeId: z.string().optional(),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;

export const updateIncidentSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().min(1).max(10000).optional(),
  severity: z.enum(["SEV1", "SEV2", "SEV3", "SEV4"]).optional(),
  status: z.enum(["OPEN", "INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED", "CLOSED"]).optional(),
  tags: z.array(z.string().trim()).optional(),
  assigneeId: z.string().optional(),
  resolvedAt: z.date().optional(),
});

export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;

export const commentSchema = z.object({
  body: z.string().trim().min(1, "Comment cannot be empty").max(5000),
});

export type CommentInput = z.infer<typeof commentSchema>;

export const incidentFiltersSchema = z.object({
  status: z.array(z.string()).optional(),
  severity: z.array(z.string()).optional(),
  projectId: z.string().optional(),
  assigneeId: z.string().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type IncidentFiltersInput = z.infer<typeof incidentFiltersSchema>;

export const incidentSortSchema = z.object({
  field: z.enum(["createdAt", "updatedAt", "severity", "status", "resolvedAt"]),
  direction: z.enum(["asc", "desc"]),
});

export type IncidentSortInput = z.infer<typeof incidentSortSchema>;

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
