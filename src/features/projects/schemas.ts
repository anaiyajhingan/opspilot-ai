import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().trim().max(10000).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(10000).optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const projectFiltersSchema = z.object({
  search: z.string().optional(),
  hasIncidents: z.boolean().optional(),
  hasOpenIncidents: z.boolean().optional(),
});

export type ProjectFiltersInput = z.infer<typeof projectFiltersSchema>;

export const projectSortSchema = z.object({
  field: z.enum(["name", "createdAt", "updatedAt", "incidentCount"]),
  direction: z.enum(["asc", "desc"]),
});

export type ProjectSortInput = z.infer<typeof projectSortSchema>;

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
