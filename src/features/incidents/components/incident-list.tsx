"use client";

import { ArrowUpDown, MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SEVERITY_META } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { IncidentListItem } from "@/server/repositories/incident.repository";

type IncidentListProps = {
  incidents: IncidentListItem[];
  isLoading?: boolean;
  onSort?: (field: string, direction: "asc" | "desc") => void;
  sortField?: string;
  sortDirection?: "asc" | "desc";
};

/**
 * Incident list component displaying incidents in a table-like format.
 */
export function IncidentList({ incidents, isLoading, onSort, sortField, sortDirection }: IncidentListProps) {
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

  if (incidents.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-sm text-[--muted-foreground]">No incidents found.</p>
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
                <button onClick={() => handleSort("title")} className="flex items-center gap-1 hover:text-[--foreground]">
                  Title
                  {sortField === "title" && <ArrowUpDown className="size-3" />}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[--muted-foreground] uppercase tracking-wider">
                <button onClick={() => handleSort("status")} className="flex items-center gap-1 hover:text-[--foreground]">
                  Status
                  {sortField === "status" && <ArrowUpDown className="size-3" />}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[--muted-foreground] uppercase tracking-wider">
                <button onClick={() => handleSort("severity")} className="flex items-center gap-1 hover:text-[--foreground]">
                  Severity
                  {sortField === "severity" && <ArrowUpDown className="size-3" />}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[--muted-foreground] uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[--muted-foreground] uppercase tracking-wider">
                Assignee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[--muted-foreground] uppercase tracking-wider">
                <button onClick={() => handleSort("createdAt")} className="flex items-center gap-1 hover:text-[--foreground]">
                  Created
                  {sortField === "createdAt" && <ArrowUpDown className="size-3" />}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[--muted-foreground] uppercase tracking-wider">
                Comments
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[--border]">
            {incidents.map((incident) => {
              const severityMeta = SEVERITY_META[incident.severity];
              return (
                <tr key={incident.id} className="hover:bg-[--surface-hover] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-[--accent]" />
                      <div className="max-w-md">
                        <p className="text-sm font-medium text-[--foreground] line-clamp-1">{incident.title}</p>
                        {incident.tags.length > 0 && (
                          <div className="mt-1 flex gap-1">
                            {incident.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-[10px]">
                                {tag}
                              </Badge>
                            ))}
                            {incident.tags.length > 2 && (
                              <Badge variant="outline" className="text-[10px]">
                                +{incident.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="text-xs">
                      {incident.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={severityMeta.token.replace("--", "") as any} className="text-xs">
                      {severityMeta.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[--foreground]">{incident.projectName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[--foreground]">{incident.assigneeName || "Unassigned"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[--muted-foreground]">{formatDate(incident.createdAt)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-[--muted-foreground]">
                      <MessageSquare className="size-3" />
                      <span>{incident._count.comments}</span>
                    </div>
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
