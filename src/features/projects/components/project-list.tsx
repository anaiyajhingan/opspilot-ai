"use client";

import { ArrowUpDown, AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import type { ProjectListItem } from "@/server/repositories/project.repository";

type ProjectListProps = {
  projects: ProjectListItem[];
  isLoading?: boolean;
  onSort?: (field: string, direction: "asc" | "desc") => void;
  sortField?: string;
  sortDirection?: "asc" | "desc";
};

/**
 * Project list component displaying projects in a table-like format.
 */
export function ProjectList({ projects, isLoading, onSort, sortField, sortDirection }: ProjectListProps) {
  if (isLoading) {
    return (
      <Card>
        <div className="space-y-4 p-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-sm text-[--muted-foreground]">No projects found.</p>
        </div>
      </Card>
    );
  }

  const handleSort = (field: string) => {
    const direction = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    onSort?.(field, direction);
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[--border]">
              <th className="px-6 py-3 text-left text-xs font-medium text-[--muted-foreground] uppercase tracking-wider">
                <button onClick={() => handleSort("name")} className="flex items-center gap-1 hover:text-[--foreground]">
                  Name
                  {sortField === "name" && <ArrowUpDown className="size-3" />}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[--muted-foreground] uppercase tracking-wider">
                Health
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[--muted-foreground] uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[--muted-foreground] uppercase tracking-wider">
                <button onClick={() => handleSort("incidentCount")} className="flex items-center gap-1 hover:text-[--foreground]">
                  Incidents
                  {sortField === "incidentCount" && <ArrowUpDown className="size-3" />}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[--muted-foreground] uppercase tracking-wider">
                <button onClick={() => handleSort("createdAt")} className="flex items-center gap-1 hover:text-[--foreground]">
                  Created
                  {sortField === "createdAt" && <ArrowUpDown className="size-3" />}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[--border]">
            {projects.map((project) => {
              const health = calculateHealth(project.incidentStats);
              const progress = calculateProgress(project.incidentStats);
              const healthColor = getHealthColor(health);

              return (
                <tr key={project.id} className="hover:bg-[--surface-hover] transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-[--foreground]">{project.name}</p>
                      {project.description && (
                        <p className="text-xs text-[--muted-foreground] line-clamp-1 mt-1">{project.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1 text-xs font-medium ${healthColor}`}>
                      {health === "critical" && <AlertTriangle className="size-3" />}
                      <span className="capitalize">{health}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-[--border] overflow-hidden">
                        <div
                          className="h-full bg-[--accent] transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-[--muted-foreground]">{progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {project.incidentStats.total}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {project.incidentStats.open} open
                      </Badge>
                      {project.incidentStats.critical > 0 && (
                        <Badge variant="sev1" className="text-xs">
                          {project.incidentStats.critical} critical
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[--muted-foreground]">{formatDate(project.createdAt)}</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function calculateHealth(stats: { total: number; open: number; critical: number }): "healthy" | "at-risk" | "critical" {
  if (stats.critical > 0) return "critical";
  if (stats.open > 5) return "at-risk";
  return "healthy";
}

function calculateProgress(stats: { total: number; resolved: number }): number {
  if (stats.total === 0) return 0;
  return Math.round((stats.resolved / stats.total) * 100);
}

function getHealthColor(health: string): string {
  switch (health) {
    case "critical":
      return "text-[--sev-1]";
    case "at-risk":
      return "text-[--sev-2]";
    case "healthy":
      return "text-[--success]";
    default:
      return "text-[--muted-foreground]";
  }
}
