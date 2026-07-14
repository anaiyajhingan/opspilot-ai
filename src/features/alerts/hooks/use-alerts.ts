"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAlerts,
  getAlert,
  createAlert,
  updateAlert,
  deleteAlert,
  acknowledgeAlert,
  resolveAlert,
  getAlertProjects,
  getAlertSources,
  getAlertIncidents,
  getAlertUsers,
} from "@/actions/alerts.actions";
import type {
  AlertFiltersInput,
  AlertSortInput,
  PaginationInput,
  CreateAlertInput,
  UpdateAlertInput,
} from "@/features/alerts/schemas";

/**
 * TanStack Query hook for fetching alerts with filtering, sorting, and pagination.
 */
export function useAlerts(
  filters: AlertFiltersInput = {},
  sort: AlertSortInput = { field: "createdAt", direction: "desc" },
  pagination: PaginationInput = { page: 1, pageSize: 20 },
) {
  return useQuery({
    queryKey: ["alerts", filters, sort, pagination],
    queryFn: () => getAlerts(filters, sort, pagination),
    staleTime: 30_000,
  });
}

/**
 * TanStack Query hook for fetching a single alert by ID.
 */
export function useAlert(id: string) {
  return useQuery({
    queryKey: ["alert", id],
    queryFn: () => getAlert(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

/**
 * TanStack Query mutation for creating an alert.
 */
export function useCreateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAlertInput) => createAlert(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

/**
 * TanStack Query mutation for updating an alert.
 */
export function useUpdateAlert(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAlertInput) => updateAlert(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alert", id] });
    },
  });
}

/**
 * TanStack Query mutation for deleting an alert.
 */
export function useDeleteAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

/**
 * TanStack Query mutation for acknowledging an alert.
 */
export function useAcknowledgeAlert(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => acknowledgeAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alert", id] });
    },
  });
}

/**
 * TanStack Query mutation for resolving an alert.
 */
export function useResolveAlert(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resolveAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alert", id] });
    },
  });
}

/**
 * TanStack Query hook for fetching projects for filtering.
 */
export function useAlertProjects() {
  return useQuery({
    queryKey: ["alert-projects"],
    queryFn: getAlertProjects,
    staleTime: 300_000, // 5 minutes
  });
}

/**
 * TanStack Query hook for fetching sources for filtering.
 */
export function useAlertSources() {
  return useQuery({
    queryKey: ["alert-sources"],
    queryFn: getAlertSources,
    staleTime: 300_000, // 5 minutes
  });
}

/**
 * TanStack Query hook for fetching incidents for linking.
 */
export function useAlertIncidents() {
  return useQuery({
    queryKey: ["alert-incidents"],
    queryFn: getAlertIncidents,
    staleTime: 300_000, // 5 minutes
  });
}

/**
 * TanStack Query hook for fetching users for assigning.
 */
export function useAlertUsers() {
  return useQuery({
    queryKey: ["alert-users"],
    queryFn: getAlertUsers,
    staleTime: 300_000, // 5 minutes
  });
}
