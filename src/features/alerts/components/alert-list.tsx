"use client";

import { ArrowUpDown, Link as LinkIcon, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SEVERITY_META, ALERT_STATUS_META } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { AlertListItem } from "@/server/repositories/alert.repository";

type AlertListProps = {
  alerts: AlertListItem[];
  isLoading?: boolean;
  onSort?: (field: string, direction: "asc" | "desc") => void;
  sortField?: string;
  sortDirection?: "asc" | "desc";
};

/**
 * Alert list component displaying alerts in a table-like format.
 */
export function AlertList({ alerts, isLoading, onSort, sortField, sortDirection }: AlertListProps) {
  const router = useRouter();

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

  if (alerts.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-sm text-[--muted-foreground]">No alerts found.</p>
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
                <button onClick={() => handleSort("source")} className="flex items-center gap-1 hover:text-[--foreground]">
                  Source
                  {sortField === "source" && <ArrowUpDown className="size-3" />}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[--muted-foreground] uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[--muted-foreground] uppercase tracking-wider">
                Incident
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[--muted-foreground] uppercase tracking-wider">
                Assigned
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
            {alerts.map((alert) => {
              const severityMeta = SEVERITY_META[alert.severity];
              const statusMeta = ALERT_STATUS_META[alert.status];
              return (
                <tr
                  key={alert.id}
                  className="hover:bg-[--surface-hover] transition-colors cursor-pointer"
                  onClick={() => router.push(`/alerts/${alert.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-[--accent]" />
                      <p className="text-sm font-medium text-[--foreground] line-clamp-1">{alert.title}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={statusMeta.token.replace("--", "") as any} className="text-xs">
                      {statusMeta.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={severityMeta.token.replace("--", "") as any} className="text-xs">
                      {severityMeta.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[--foreground]">{alert.source}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[--foreground]">{alert.projectName}</p>
                  </td>
                  <td className="px-6 py-4">
                    {alert.incidentId ? (
                      <div className="flex items-center gap-1">
                        <LinkIcon className="size-3 text-[--muted-foreground]" />
                        <p className="text-sm text-[--foreground] line-clamp-1">{alert.incidentTitle}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-[--muted-foreground]">—</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {alert.assignedUserId ? (
                      <div className="flex items-center gap-1">
                        <User className="size-3 text-[--muted-foreground]" />
                        <p className="text-sm text-[--foreground]">{alert.assignedUserName}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-[--muted-foreground]">—</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[--muted-foreground]">{formatDate(alert.createdAt)}</p>
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
