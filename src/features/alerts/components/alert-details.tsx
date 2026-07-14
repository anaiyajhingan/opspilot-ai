"use client";

import { Edit, Trash2, Calendar, AlertTriangle, Link as LinkIcon, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SEVERITY_META, ALERT_STATUS_META } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { AlertWithRelations } from "@/server/repositories/alert.repository";

type AlertDetailsProps = {
  alert: AlertWithRelations;
  isLoading?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onAcknowledge?: () => void;
  onResolve?: () => void;
};

/**
 * Alert details component displaying alert information.
 */
export function AlertDetails({ alert, isLoading, onEdit, onDelete, onAcknowledge, onResolve }: AlertDetailsProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const severityMeta = SEVERITY_META[alert.severity];
  const statusMeta = ALERT_STATUS_META[alert.status];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={severityMeta.token.replace("--", "") as any} className="text-xs">
                {severityMeta.label}
              </Badge>
              <Badge variant={statusMeta.token.replace("--", "") as any} className="text-xs">
                {statusMeta.label}
              </Badge>
            </div>
            <CardTitle className="text-xl">{alert.title}</CardTitle>
          </div>
          <div className="flex gap-2">
            {onAcknowledge && alert.status !== "ACKNOWLEDGED" && alert.status !== "RESOLVED" && (
              <Button variant="ghost" size="sm" onClick={onAcknowledge}>
                Acknowledge
              </Button>
            )}
            {onResolve && alert.status !== "RESOLVED" && (
              <Button variant="ghost" size="sm" onClick={onResolve}>
                Resolve
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="size-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="size-4 text-[--muted-foreground]" />
              <span className="text-[--muted-foreground]">Source</span>
            </div>
            <span className="text-sm text-[--foreground]">{alert.source}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="size-4 text-[--muted-foreground]" />
              <span className="text-[--muted-foreground]">Project</span>
            </div>
            <span className="text-sm text-[--foreground]">{alert.project.name}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <LinkIcon className="size-4 text-[--muted-foreground]" />
              <span className="text-[--muted-foreground]">Incident</span>
            </div>
            {alert.incident ? (
              <button
                onClick={() => router.push(`/incidents/${alert.incident?.id}`)}
                className="text-sm text-[--accent] hover:underline"
              >
                {alert.incident.title}
              </button>
            ) : (
              <span className="text-sm text-[--muted-foreground]">Not linked</span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="size-4 text-[--muted-foreground]" />
              <span className="text-[--muted-foreground]">Assigned to</span>
            </div>
            {alert.assignedUser ? (
              <span className="text-sm text-[--foreground]">{alert.assignedUser.name}</span>
            ) : (
              <span className="text-sm text-[--muted-foreground]">Unassigned</span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-[--muted-foreground]" />
              <span className="text-[--muted-foreground]">Created at</span>
            </div>
            <span className="text-sm text-[--foreground]">{formatDate(alert.createdAt)}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-[--muted-foreground]" />
              <span className="text-[--muted-foreground]">Updated at</span>
            </div>
            <span className="text-sm text-[--foreground]">{formatDate(alert.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
