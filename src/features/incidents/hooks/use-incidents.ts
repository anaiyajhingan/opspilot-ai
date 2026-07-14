"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getIncidents,
  getIncident,
  createIncident,
  updateIncident,
  deleteIncident,
  addComment,
  getProjects,
  getUsers,
  getTags,
} from "@/actions/incidents.actions";
import type {
  IncidentFiltersInput,
  IncidentSortInput,
  PaginationInput,
  CreateIncidentInput,
  UpdateIncidentInput,
  CommentInput,
} from "@/features/incidents/schemas";

/**
 * TanStack Query hook for fetching incidents with filtering, sorting, and pagination.
 */
export function useIncidents(
  filters: IncidentFiltersInput = {},
  sort: IncidentSortInput = { field: "createdAt", direction: "desc" },
  pagination: PaginationInput = { page: 1, pageSize: 20 },
) {
  return useQuery({
    queryKey: ["incidents", filters, sort, pagination],
    queryFn: () => getIncidents(filters, sort, pagination),
    staleTime: 30_000,
  });
}

/**
 * TanStack Query hook for fetching a single incident by ID.
 */
export function useIncident(id: string) {
  return useQuery({
    queryKey: ["incident", id],
    queryFn: () => getIncident(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

/**
 * TanStack Query mutation for creating an incident.
 */
export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateIncidentInput) => createIncident(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * TanStack Query mutation for updating an incident.
 */
export function useUpdateIncident(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateIncidentInput) => updateIncident(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incident", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * TanStack Query mutation for deleting an incident.
 */
export function useDeleteIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteIncident(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * TanStack Query mutation for adding a comment to an incident.
 */
export function useAddComment(incidentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CommentInput) => addComment(incidentId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incident", incidentId] });
    },
  });
}

/**
 * TanStack Query hook for fetching projects for filtering.
 */
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
    staleTime: 300_000, // 5 minutes
  });
}

/**
 * TanStack Query hook for fetching users for assignment.
 */
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    staleTime: 300_000, // 5 minutes
  });
}

/**
 * TanStack Query hook for fetching tags for filtering.
 */
export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
    staleTime: 300_000, // 5 minutes
  });
}
