"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * QueryProvider component that wraps the application with TanStack Query's QueryClientProvider.
 * 
 * This component:
 * - Creates a single QueryClient instance using React state to avoid recreation on every render
 * - Preserves SSR compatibility by avoiding hydration mismatches
 * - Provides query caching and state management to all child components
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a single QueryClient instance using React state
  // This ensures the client is not recreated on every render
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default stale time for all queries
            staleTime: 60 * 1000,
            // Retry failed queries once
            retry: 1,
            // Refetch on window focus (can be disabled per query)
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
