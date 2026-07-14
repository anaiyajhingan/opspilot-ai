"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/actions/dashboard.actions";

/**
 * TanStack Query hook for fetching dashboard data.
 *
 * This hook provides:
 * - Automatic caching and refetching
 * - Loading and error states
 * - Type-safe data access
 *
 * The query key is stable and includes no dependencies since the data
 * is scoped to the current user's organization via the server action.
 */
export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // Refetch every minute
  });
}
