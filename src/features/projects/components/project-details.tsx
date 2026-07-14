"use client";

import { ArrowLeft, Edit, Trash2, AlertTriangle, CheckCircle, Clock, Calendar, Activity } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import type { ProjectWithStats } from "@/server/repositories/project.repository";

type ProjectDetailsProps = {
  project: ProjectWithStats;
  isLoading?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

/**
 * Project details component displaying project information with statistics.
 */
export function ProjectDetails({ project, isLoading, onEdit, onDelete }: ProjectDetailsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const health = calculateHealth(project.incidentStats);
  const progress = calculateProgress(project.incidentStats);
  const healthColor = getHealthColor(health);
  const healthIcon = getHealthIcon(health);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`flex items-center gap-1 text-xs font-medium ${healthColor}`}>
                {healthIcon}
                <span className="capitalize">{health}</span>
              </div>
            </div>
            <CardTitle className="text-xl">{project.name}</CardTitle>
          </div>
          <div className="flex gap-2">
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
        {project.description && (
          <div>
            <h4 className="text-sm font-medium text-[--muted-foreground] mb-2">Description</h4>
            <p className="text-sm text-[--foreground] whitespace-pre-wrap">{project.description}</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="size-4 text-[--muted-foreground]" />
              <span className="text-sm font-medium text-[--muted-foreground]">Total Incidents</span>
            </div>
            <p className="text-2xl font-semibold text-[--foreground]">{project.incidentStats.total}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="size-4 text-[--muted-foreground]" />
              <span className="text-sm font-medium text-[--muted-foreground]">Open Incidents</span>
            </div>
            <p className="text-2xl font-semibold text-[--foreground]">{project.incidentStats.open}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="size-4 text-[--muted-foreground]" />
              <span className="text-sm font-medium text-[--muted-foreground]">Critical Incidents</span>
            </div>
            <p className="text-2xl font-semibold text-[--sev-1]">{project.incidentStats.critical}</p>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[--muted-foreground]">Progress</span>
            <span className="text-sm font-semibold text-[--foreground]">{progress}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-[--border] overflow-hidden">
            <div
              className="h-full bg-[--accent] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-[--muted-foreground] mt-1">
            {project.incidentStats.resolved} of {project.incidentStats.total} incidents resolved
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-[--muted-foreground]" />
              <span className="text-[--muted-foreground]">Created at</span>
            </div>
            <span className="text-sm text-[--foreground]">{formatDate(project.createdAt)}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-[--muted-foreground]" />
              <span className="text-[--muted-foreground]">Last updated</span>
            </div>
            <span className="text-sm text-[--foreground]">{formatDate(project.updatedAt)}</span>
          </div>
        </div>

        {project.recentIncidents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-[--muted-foreground] mb-3">Recent Incidents</h4>
            <div className="space-y-2">
              {project.recentIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="flex items-center justify-between rounded-md border border-[--border] p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-[--foreground]">{incident.title}</p>
                    <p className="text-xs text-[--muted-foreground]">{formatDate(incident.createdAt)}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {incident.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
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

function getHealthIcon(health: string) {
  switch (health) {
    case "critical":
      return <AlertTriangle className="size-3" />;
    case "at-risk":
      return <Clock className="size-3" />;
    case "healthy":
      return <CheckCircle className="size-3" />;
    default:
      return null;
  }
}
