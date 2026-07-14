"use client";

import { Clock } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type { IncidentWithRelations } from "@/server/repositories/incident.repository";

type IncidentTimelineProps = {
  incident: IncidentWithRelations;
  isLoading?: boolean;
};

/**
 * Incident timeline component displaying timeline events and comments.
 */
export function IncidentTimeline({ incident, isLoading }: IncidentTimelineProps) {
  if (isLoading) {
    return (
      <Card>
        <div className="space-y-4 p-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const timelineItems = [
    ...incident.timelineEvents.map((event) => ({
      type: "event" as const,
      data: event,
      createdAt: event.createdAt,
    })),
    ...incident.comments.map((comment) => ({
      type: "comment" as const,
      data: comment,
      createdAt: comment.createdAt,
    })),
  ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  return (
    <Card>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-[--muted-foreground]" />
          <h3 className="text-sm font-medium">Timeline</h3>
        </div>

        {timelineItems.length === 0 ? (
          <p className="text-sm text-[--muted-foreground]">No activity yet.</p>
        ) : (
          <div className="space-y-4">
            {timelineItems.map((item, index) => (
              <div key={index} className="flex gap-3">
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs">
                    {item.type === "event"
                      ? getInitials(item.data.actor?.name || "System")
                      : getInitials(item.data.author.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-[--foreground]">
                    <span className="font-medium">
                      {item.type === "event"
                        ? item.data.actor?.name || "System"
                        : item.data.author.name}
                    </span>{" "}
                    {item.type === "event" ? item.data.label.toLowerCase() : "commented"}
                  </p>
                  {item.type === "event" && item.data.detail && (
                    <p className="text-sm text-[--muted-foreground]">{item.data.detail}</p>
                  )}
                  {item.type === "comment" && (
                    <p className="text-sm text-[--foreground]">{item.data.body}</p>
                  )}
                  <p className="text-xs text-[--muted-foreground]">{formatDate(item.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
