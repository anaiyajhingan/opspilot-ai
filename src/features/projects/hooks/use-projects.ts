"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getAllProjects,
  getProjectStats,
  getRecentProjectActivity,
} from "@/actions/projects.actions";
import type {
  ProjectFiltersInput,
  ProjectSortInput,
  PaginationInput,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/features/projects/schemas";

/**
 * TanStack Query hook for fetching projects with filtering, sorting, and pagination.
 */
export function useProjects(
  filters: ProjectFiltersInput = {},
  sort: ProjectSortInput = { field: "createdAt", direction: "desc" },
  pagination: PaginationInput = { page: 1, pageSize: 20 },
) {
  return useQuery({
    queryKey: ["projects", filters, sort, pagination],
    queryFn: () => getProjects(filters, sort, pagination),
    staleTime: 30_000,
  });
}

/**
 * TanStack Query hook for fetching a single project by ID.
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => getProject(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

/**
 * TanStack Query mutation for creating a project.
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projectStats"] });
    },
  });
}

/**
 * TanStack Query mutation for updating a project.
 */
export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProjectInput) => updateProject(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      queryClient.invalidateQueries({ queryKey: ["projectStats"] });
    },
  });
}

/**
 * TanStack Query mutation for deleting a project.
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["projectStats"] });
    },
  });
}

/**
 * TanStack Query hook for fetching all projects for dropdowns.
 */
export function useAllProjects() {
  return useQuery({
    queryKey: ["allProjects"],
    queryFn: getAllProjects,
    staleTime: 300_000, // 5 minutes
  });
}

/**
 * TanStack Query hook for fetching project statistics for dashboard.
 */
export function useProjectStats() {
  return useQuery({
    queryKey: ["projectStats"],
    queryFn: getProjectStats,
    staleTime: 60_000, // 1 minute
  });
}

/**
 * TanStack Query hook for fetching recent project activity for dashboard.
 */
export function useRecentProjectActivity(limit = 5) {
  return useQuery({
    queryKey: ["recentProjectActivity", limit],
    queryFn: () => getRecentProjectActivity(limit),
    staleTime: 60_000, // 1 minute
  });
}
