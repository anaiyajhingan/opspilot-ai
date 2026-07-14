"use client";

import { Folder, Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { useRecentProjectActivity } from "@/features/projects/hooks/use-projects";

/**
 * Recent project activity component displaying recent incidents across projects.
 */
export function RecentProjectActivity() {
  const { data: activities, isLoading } = useRecentProjectActivity(5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Project Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[--surface]">
                  <Folder className="size-4 text-[--muted-foreground]" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-[--foreground] line-clamp-1">{activity.title}</p>
                  <div className="flex items-center gap-2 text-xs text-[--muted-foreground]">
                    <span>{activity.projectName}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="size-3" />
                      <span>{formatDate(activity.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[--muted-foreground]">No recent activity.</p>
        )}
      </CardContent>
    </Card>
  );
}
