"use client";

import { AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import type { ProjectListItem } from "@/server/repositories/project.repository";

type ProjectCardProps = {
  project: ProjectListItem;
  isLoading?: boolean;
  onClick?: () => void;
};

/**
 * Project card component displaying project information with health indicator.
 */
export function ProjectCard({ project, isLoading, onClick }: ProjectCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const health = calculateHealth(project.incidentStats);
  const progress = calculateProgress(project.incidentStats);
  const healthColor = getHealthColor(health);

  return (
    <Card className="cursor-pointer hover:border-[--accent] transition-colors" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
          <div className={`flex items-center gap-1 text-xs font-medium ${healthColor}`}>
            {health === "critical" && <AlertTriangle className="size-3" />}
            {health === "at-risk" && <Clock className="size-3" />}
            {health === "healthy" && <CheckCircle className="size-3" />}
            <span className="capitalize">{health}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.description && (
          <p className="text-sm text-[--muted-foreground] line-clamp-2">{project.description}</p>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[--muted-foreground]">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[--border] overflow-hidden">
            <div
              className="h-full bg-[--accent] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {project.incidentStats.total} incidents
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

        <div className="text-xs text-[--muted-foreground]">
          Updated {formatDate(project.updatedAt)}
        </div>
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
