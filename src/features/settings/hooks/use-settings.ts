"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserProfile,
  updateProfile,
  changePassword,
  getOAuthProviders,
  getOrganization,
  updateOrganization,
  updatePreferences,
  getMembers,
  updateMemberRole,
  removeMember,
  inviteMember,
  getSessions,
  logoutAllDevices,
} from "@/actions/settings.actions";
import type {
  UpdateProfileInput,
  ChangePasswordInput,
  UpdateOrganizationInput,
  UpdatePreferencesInput,
  UpdateMemberRoleInput,
  InviteMemberInput,
} from "@/features/settings/schemas";

/**
 * TanStack Query hook for fetching user profile.
 */
export function useUserProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
    staleTime: 60_000,
  });
}

/**
 * TanStack Query mutation for updating user profile.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

/**
 * TanStack Query mutation for changing password.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => changePassword(input),
  });
}

/**
 * TanStack Query hook for fetching OAuth providers.
 */
export function useOAuthProviders() {
  return useQuery({
    queryKey: ["oauth-providers"],
    queryFn: getOAuthProviders,
    staleTime: 300_000,
  });
}

/**
 * TanStack Query hook for fetching organization.
 */
export function useOrganization() {
  return useQuery({
    queryKey: ["organization"],
    queryFn: getOrganization,
    staleTime: 60_000,
  });
}

/**
 * TanStack Query mutation for updating organization.
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateOrganizationInput) => updateOrganization(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

/**
 * TanStack Query mutation for updating preferences.
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePreferencesInput) => updatePreferences(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

/**
 * TanStack Query hook for fetching organization members.
 */
export function useMembers() {
  return useQuery({
    queryKey: ["members"],
    queryFn: getMembers,
    staleTime: 60_000,
  });
}

/**
 * TanStack Query mutation for updating member role.
 */
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: UpdateMemberRoleInput }) =>
      updateMemberRole(userId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

/**
 * TanStack Query mutation for removing member.
 */
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => removeMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

/**
 * TanStack Query mutation for inviting member.
 */
export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InviteMemberInput) => inviteMember(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

/**
 * TanStack Query hook for fetching user sessions.
 */
export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: getSessions,
    staleTime: 30_000,
  });
}

/**
 * TanStack Query mutation for logging out all devices.
 */
export function useLogoutAllDevices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutAllDevices(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}
