import { settingsRepository, type UserWithOrganization, type MemberListItem, type OAuthProvider } from "@/server/repositories/settings.repository";
import type { Role } from "@prisma/client";
import { hashPassword, verifyPassword } from "@/lib/password";

/**
 * Settings service — business logic layer for settings operations.
 * Orchestrates repository calls and applies business rules.
 *
 * This layer is responsible for:
 * - Coordinating multiple repository calls
 * - Applying business logic (e.g., role restrictions, validation)
 * - Returning structured data to the action layer
 */

export class SettingsService {
  /**
   * Get user profile with organization.
   */
  async getUserProfile(userId: string): Promise<UserWithOrganization | null> {
    return settingsRepository.getUserById(userId);
  }

  /**
   * Update user profile.
   */
  async updateProfile(userId: string, data: {
    name?: string;
    email?: string;
    image?: string;
  }): Promise<UserWithOrganization> {
    await settingsRepository.updateUser(userId, data);
    const user = await settingsRepository.getUserById(userId);
    return user as UserWithOrganization;
  }

  /**
   * Change user password.
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await settingsRepository.getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.passwordHash) {
      throw new Error("User does not have a password set (OAuth user)");
    }

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error("Current password is incorrect");
    }

    const newPasswordHash = await hashPassword(newPassword);
    await settingsRepository.updateUserPassword(userId, newPasswordHash);
  }

  /**
   * Get OAuth providers for user.
   */
  async getOAuthProviders(userId: string): Promise<OAuthProvider[]> {
    return settingsRepository.getUserOAuthProviders(userId);
  }

  /**
   * Get organization details.
   */
  async getOrganization(organizationId: string) {
    return settingsRepository.getOrganizationById(organizationId);
  }

  /**
   * Update organization.
   */
  async updateOrganization(organizationId: string, data: {
    name?: string;
    slug?: string;
  }) {
    return settingsRepository.updateOrganization(organizationId, data);
  }

  /**
   * Update user preferences.
   */
  async updatePreferences(userId: string, data: {
    theme?: string;
    timezone?: string;
    dateFormat?: string;
    notificationPrefs?: any;
  }) {
    return settingsRepository.updateUserPreferences(userId, data);
  }

  /**
   * Get organization members.
   */
  async getMembers(organizationId: string): Promise<MemberListItem[]> {
    return settingsRepository.getOrganizationMembers(organizationId);
  }

  /**
   * Update member role.
   */
  async updateMemberRole(userId: string, role: Role, organizationId: string): Promise<void> {
    const user = await settingsRepository.getUserById(userId);
    if (!user || user.organizationId !== organizationId) {
      throw new Error("User not found in organization");
    }

    await settingsRepository.updateMemberRole(userId, role);
  }

  /**
   * Remove member from organization.
   */
  async removeMember(userId: string, organizationId: string): Promise<void> {
    const user = await settingsRepository.getUserById(userId);
    if (!user || user.organizationId !== organizationId) {
      throw new Error("User not found in organization");
    }

    await settingsRepository.removeMember(userId);
  }

  /**
   * Invite a new member to the organization.
   */
  async inviteMember(email: string, role: Role, organizationId: string): Promise<void> {
    await settingsRepository.inviteMember(email, role, organizationId);
  }

  /**
   * Get user sessions.
   */
  async getSessions(userId: string) {
    return settingsRepository.getUserSessions(userId);
  }

  /**
   * Logout all devices except current.
   */
  async logoutAllDevices(userId: string, exceptSessionToken?: string): Promise<void> {
    await settingsRepository.deleteUserSessions(userId, exceptSessionToken);
  }

  /**
   * Delete a specific session.
   */
  async deleteSession(sessionToken: string): Promise<void> {
    await settingsRepository.deleteSession(sessionToken);
  }
}

export const settingsService = new SettingsService();
