"use client";

import { ArrowLeft, Edit, Trash2, User, Calendar, Tag, AlertTriangle } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SEVERITY_META } from "@/lib/constants";
import { formatDate, getInitials } from "@/lib/utils";
import type { IncidentWithRelations } from "@/server/repositories/incident.repository";

type IncidentDetailsProps = {
  incident: IncidentWithRelations;
  isLoading?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

/**
 * Incident details component displaying incident information.
 */
export function IncidentDetails({ incident, isLoading, onEdit, onDelete }: IncidentDetailsProps) {
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

  const severityMeta = SEVERITY_META[incident.severity];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={severityMeta.token.replace("--", "") as any} className="text-xs">
                {severityMeta.label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {incident.status}
              </Badge>
            </div>
            <CardTitle className="text-xl">{incident.title}</CardTitle>
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
        <div>
          <h4 className="text-sm font-medium text-[--muted-foreground] mb-2">Description</h4>
          <p className="text-sm text-[--foreground] whitespace-pre-wrap">{incident.description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="size-4 text-[--muted-foreground]" />
              <span className="text-[--muted-foreground]">Created by</span>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarFallback className="text-xs">{getInitials(incident.createdBy.name)}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-[--foreground]">{incident.createdBy.name}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="size-4 text-[--muted-foreground]" />
              <span className="text-[--muted-foreground]">Created at</span>
            </div>
            <span className="text-sm text-[--foreground]">{formatDate(incident.createdAt)}</span>
          </div>

          {incident.assignee && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="size-4 text-[--muted-foreground]" />
                <span className="text-[--muted-foreground]">Assigned to</span>
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="size-6">
                  <AvatarFallback className="text-xs">{getInitials(incident.assignee.name)}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-[--foreground]">{incident.assignee.name}</span>
              </div>
            </div>
          )}

          {incident.resolvedAt && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 text-[--muted-foreground]" />
                <span className="text-[--muted-foreground]">Resolved at</span>
              </div>
              <span className="text-sm text-[--foreground]">{formatDate(incident.resolvedAt)}</span>
            </div>
          )}
        </div>

        {incident.tags.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm mb-2">
              <Tag className="size-4 text-[--muted-foreground]" />
              <span className="text-[--muted-foreground]">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {incident.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {incident.attachments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm mb-2">
              <AlertTriangle className="size-4 text-[--muted-foreground]" />
              <span className="text-[--muted-foreground]">Attachments</span>
            </div>
            <div className="space-y-2">
              {incident.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between rounded-md border border-[--border] p-2">
                  <span className="text-sm text-[--foreground]">{attachment.fileName}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
