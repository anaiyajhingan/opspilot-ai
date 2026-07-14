"use server";

import { auth } from "@/lib/auth";
import { loggerApi as logger } from "@/lib/logger";
import { assertCan, denormalizeRole } from "@/lib/rbac";
import type { Result } from "@/types";
import { settingsService } from "@/server/services/settings.service";
import {
  type UpdateProfileInput,
  type ChangePasswordInput,
  type UpdateOrganizationInput,
  type UpdatePreferencesInput,
  type UpdateMemberRoleInput,
  type InviteMemberInput,
  updateProfileSchema,
  changePasswordSchema,
  updateOrganizationSchema,
  updatePreferencesSchema,
  updateMemberRoleSchema,
  inviteMemberSchema,
} from "@/features/settings/schemas";

/**
 * Server actions for settings operations.
 *
 * These actions are the entry points for client-side mutations and queries.
 * They handle authentication, authorization, and error handling.
 */

/**
 * Get user profile with organization.
 */
export async function getUserProfile() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized: No user found");
  }

  try {
    const profile = await settingsService.getUserProfile(session.user.id);
    logger.info("User profile fetched", { userId: session.user.id });
    return profile;
  } catch (error) {
    logger.error("Failed to fetch user profile", {
      userId: session.user.id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Update user profile.
 */
export async function updateProfile(input: UpdateProfileInput): Promise<Result<{ id: string }>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const profile = await settingsService.updateProfile(session.user.id, parsed.data);

    logger.info("User profile updated", { userId: session.user.id });
    return { ok: true, data: { id: profile.id } };
  } catch (error) {
    logger.error("Failed to update user profile", {
      userId: session.user.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to update profile" };
  }
}

/**
 * Change user password.
 */
export async function changePassword(input: ChangePasswordInput): Promise<Result<null>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await settingsService.changePassword(
      session.user.id,
      parsed.data.currentPassword,
      parsed.data.newPassword,
    );

    logger.info("User password changed", { userId: session.user.id });
    return { ok: true, data: null };
  } catch (error) {
    logger.error("Failed to change password", {
      userId: session.user.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to change password" };
  }
}

/**
 * Get OAuth providers for user.
 */
export async function getOAuthProviders() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized: No user found");
  }

  try {
    const providers = await settingsService.getOAuthProviders(session.user.id);
    logger.info("OAuth providers fetched", { userId: session.user.id });
    return providers;
  } catch (error) {
    logger.error("Failed to fetch OAuth providers", {
      userId: session.user.id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get organization details.
 */
export async function getOrganization() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized: No organization found");
  }

  try {
    const organization = await settingsService.getOrganization(session.user.organizationId);
    logger.info("Organization fetched", { orgId: session.user.organizationId });
    return organization;
  } catch (error) {
    logger.error("Failed to fetch organization", {
      orgId: session.user.organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Update organization.
 */
export async function updateOrganization(input: UpdateOrganizationInput): Promise<Result<{ id: string }>> {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = updateOrganizationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    assertCan(session.user.role, "settings:manageOrganization");

    const organization = await settingsService.updateOrganization(session.user.organizationId, parsed.data);

    logger.info("Organization updated", { orgId: session.user.organizationId });
    return { ok: true, data: { id: organization.id } };
  } catch (error) {
    logger.error("Failed to update organization", {
      orgId: session.user.organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to update organization" };
  }
}

/**
 * Update user preferences.
 */
export async function updatePreferences(input: UpdatePreferencesInput): Promise<Result<null>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = updatePreferencesSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await settingsService.updatePreferences(session.user.id, parsed.data);

    logger.info("User preferences updated", { userId: session.user.id });
    return { ok: true, data: null };
  } catch (error) {
    logger.error("Failed to update preferences", {
      userId: session.user.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to update preferences" };
  }
}

/**
 * Get organization members.
 */
export async function getMembers() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized: No organization found");
  }

  try {
    const members = await settingsService.getMembers(session.user.organizationId);
    logger.info("Organization members fetched", { orgId: session.user.organizationId });
    return members;
  } catch (error) {
    logger.error("Failed to fetch members", {
      orgId: session.user.organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Update member role.
 */
export async function updateMemberRole(userId: string, input: UpdateMemberRoleInput): Promise<Result<null>> {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = updateMemberRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    assertCan(session.user.role, "org:manageMembers");

    await settingsService.updateMemberRole(userId, parsed.data.role as any, session.user.organizationId);

    logger.info("Member role updated", { orgId: session.user.organizationId, userId });
    return { ok: true, data: null };
  } catch (error) {
    logger.error("Failed to update member role", {
      orgId: session.user.organizationId,
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to update member role" };
  }
}

/**
 * Remove member from organization.
 */
export async function removeMember(userId: string): Promise<Result<null>> {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  if (userId === session.user.id) {
    return { ok: false, error: "Cannot remove yourself from the organization" };
  }

  try {
    assertCan(session.user.role, "org:manageMembers");

    await settingsService.removeMember(userId, session.user.organizationId);

    logger.info("Member removed", { orgId: session.user.organizationId, userId });
    return { ok: true, data: null };
  } catch (error) {
    logger.error("Failed to remove member", {
      orgId: session.user.organizationId,
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to remove member" };
  }
}

/**
 * Invite member to organization.
 */
export async function inviteMember(input: InviteMemberInput): Promise<Result<null>> {
  const session = await auth();

  if (!session?.user?.organizationId) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = inviteMemberSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    assertCan(session.user.role, "org:manageMembers");

    await settingsService.inviteMember(parsed.data.email, parsed.data.role as any, session.user.organizationId);

    logger.info("Member invited", { orgId: session.user.organizationId, email: parsed.data.email });
    return { ok: true, data: null };
  } catch (error) {
    logger.error("Failed to invite member", {
      orgId: session.user.organizationId,
      email: parsed.data.email,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to invite member" };
  }
}

/**
 * Get user sessions.
 */
export async function getSessions() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized: No user found");
  }

  try {
    const sessions = await settingsService.getSessions(session.user.id);
    logger.info("User sessions fetched", { userId: session.user.id });
    return sessions;
  } catch (error) {
    logger.error("Failed to fetch sessions", {
      userId: session.user.id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Logout all devices.
 */
export async function logoutAllDevices(): Promise<Result<null>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    // Get the current session token to preserve this session
    // Note: sessionToken is available in the JWT but not in the default session object
    // For JWT strategy, we need to extract it from the request headers or use a different approach
    // Since we're using JWT strategy, the session is stateless, so we'll delete all sessions
    // and the user will need to re-authenticate. This is the expected behavior for JWT.
    await settingsService.logoutAllDevices(session.user.id);

    logger.info("Logged out all devices", { userId: session.user.id });
    return { ok: true, data: null };
  } catch (error) {
    logger.error("Failed to logout all devices", {
      userId: session.user.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to logout all devices" };
  }
}
