import { z } from "zod";

// Profile schemas
export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  image: z.string().url("Invalid image URL").optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Organization schemas
export const updateOrganizationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  slug: z.string().trim().min(1, "Slug is required").max(50).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

// Preferences schemas
export const updatePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  notificationPrefs: z.object({
    email: z.boolean().optional(),
    inApp: z.boolean().optional(),
  }).optional(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

// Team schemas
export const inviteMemberSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  role: z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"]),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const updateMemberRoleSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"]),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
