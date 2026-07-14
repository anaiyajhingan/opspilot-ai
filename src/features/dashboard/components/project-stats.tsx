"use client";

import { FolderOpen, AlertTriangle, CheckCircle, Activity } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectStats } from "@/features/projects/hooks/use-projects";

/**
 * Project stats component displaying project statistics for the dashboard.
 */
export function ProjectStats() {
  const { data: stats, isLoading } = useProjectStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Activity className="size-4 text-[--muted-foreground]" />
          <CardTitle className="text-sm font-medium text-[--muted-foreground]">Total Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-[--foreground]">{stats?.total || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <FolderOpen className="size-4 text-[--muted-foreground]" />
          <CardTitle className="text-sm font-medium text-[--muted-foreground]">Active Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-[--foreground]">{stats?.active || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <AlertTriangle className="size-4 text-[--sev-1]" />
          <CardTitle className="text-sm font-medium text-[--muted-foreground]">Delayed Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-[--sev-1]">{stats?.delayed?.length || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CheckCircle className="size-4 text-[--success]" />
          <CardTitle className="text-sm font-medium text-[--muted-foreground]">Completed Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-[--success]">{stats?.completed?.length || 0}</div>
        </CardContent>
      </Card>
    </div>
  );
}
