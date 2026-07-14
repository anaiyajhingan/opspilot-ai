import { z } from "zod";

export const createAlertSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  source: z.string().trim().min(1, "Source is required").max(100),
  severity: z.enum(["SEV1", "SEV2", "SEV3", "SEV4"]),
  status: z.enum(["FIRING", "ACKNOWLEDGED", "RESOLVED"]).default("FIRING"),
  projectId: z.string().min(1, "Project is required"),
  incidentId: z.string().optional(),
  assignedUserId: z.string().optional(),
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;

export const updateAlertSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  source: z.string().trim().min(1).max(100).optional(),
  severity: z.enum(["SEV1", "SEV2", "SEV3", "SEV4"]).optional(),
  status: z.enum(["FIRING", "ACKNOWLEDGED", "RESOLVED"]).optional(),
  incidentId: z.string().optional(),
  assignedUserId: z.string().optional(),
});

export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;

export const alertFiltersSchema = z.object({
  status: z.array(z.string()).optional(),
  severity: z.array(z.string()).optional(),
  projectId: z.string().optional(),
  source: z.string().optional(),
  search: z.string().optional(),
});

export type AlertFiltersInput = z.infer<typeof alertFiltersSchema>;

export const alertSortSchema = z.object({
  field: z.enum(["createdAt", "updatedAt", "severity", "status", "source"]),
  direction: z.enum(["asc", "desc"]),
});

export type AlertSortInput = z.infer<typeof alertSortSchema>;

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
