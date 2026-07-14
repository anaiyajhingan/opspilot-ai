import { db } from "@/lib/db";
import type { User, Organization, Account, Role } from "@prisma/client";

/**
 * Settings repository — data access layer for settings operations.
 * Handles profile, organization, preferences, and team management.
 *
 * All queries are scoped to the user's organization via the organizationId
 * parameter — the caller (service layer) is responsible for resolving this
 * from the session.
 */

export type UserWithOrganization = User & {
  organization: Organization;
  theme?: string;
  timezone?: string;
  dateFormat?: string;
};

export type MemberListItem = Pick<
  User,
  "id" | "name" | "email" | "role" | "createdAt"
>;

export type OAuthProvider = {
  provider: string;
  providerAccountId: string;
};

export class SettingsRepository {
  /**
   * Get user with organization by ID.
   */
  async getUserById(id: string): Promise<UserWithOrganization | null> {
    return db.user.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    }) as Promise<UserWithOrganization | null>;
  }

  /**
   * Get organization by ID.
   */
  async getOrganizationById(id: string): Promise<Organization | null> {
    return db.organization.findUnique({
      where: { id },
    });
  }

  /**
   * Update user profile.
   */
  async updateUser(id: string, data: {
    name?: string;
    email?: string;
    image?: string;
  }): Promise<User> {
    return db.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Update user password.
   */
  async updateUserPassword(id: string, passwordHash: string): Promise<User> {
    return db.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  /**
   * Update user preferences.
   */
  async updateUserPreferences(id: string, data: {
    theme?: string;
    timezone?: string;
    dateFormat?: string;
    notificationPrefs?: any;
  }): Promise<User> {
    return db.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Update organization.
   */
  async updateOrganization(id: string, data: {
    name?: string;
    slug?: string;
  }): Promise<Organization> {
    return db.organization.update({
      where: { id },
      data,
    });
  }

  /**
   * Get OAuth providers for a user.
   */
  async getUserOAuthProviders(userId: string): Promise<OAuthProvider[]> {
    const accounts = await db.account.findMany({
      where: { userId },
      select: {
        provider: true,
        providerAccountId: true,
      },
    });
    return accounts;
  }

  /**
   * Get all members of an organization.
   */
  async getOrganizationMembers(organizationId: string): Promise<MemberListItem[]> {
    return db.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Update member role.
   */
  async updateMemberRole(userId: string, role: Role): Promise<User> {
    return db.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  /**
   * Remove member from organization.
   */
  async removeMember(userId: string): Promise<User> {
    return db.user.delete({
      where: { id: userId },
    });
  }

  /**
   * Invite a new member to the organization.
   * Creates a user record with the provided email and role.
   * Note: In a production system, this would send an invitation email
   * and create a pending invitation record instead of a direct user.
   */
  async inviteMember(email: string, role: Role, organizationId: string): Promise<User> {
    return db.user.create({
      data: {
        email,
        name: email.split("@")[0] || email,
        role,
        organizationId,
      },
    });
  }

  /**
   * Get user sessions.
   */
  async getUserSessions(userId: string) {
    return db.session.findMany({
      where: { userId },
      select: {
        id: true,
        sessionToken: true,
        expires: true,
      },
      orderBy: { expires: "desc" },
    });
  }

  /**
   * Delete all sessions for a user except current.
   */
  async deleteUserSessions(userId: string, exceptSessionToken?: string) {
    return db.session.deleteMany({
      where: {
        userId,
        ...(exceptSessionToken && { sessionToken: { not: exceptSessionToken } }),
      },
    });
  }

  /**
   * Delete a specific session.
   */
  async deleteSession(sessionToken: string) {
    return db.session.delete({
      where: { sessionToken },
    });
  }
}

export const settingsRepository = new SettingsRepository();
