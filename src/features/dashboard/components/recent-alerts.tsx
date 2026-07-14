import { Bell } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SEVERITY_META } from "@/lib/constants";
import type { RecentAlert } from "@/server/repositories/dashboard.repository";

type RecentAlertsProps = {
  alerts: RecentAlert[];
  isLoading?: boolean;
};

/**
 * Recent alerts card showing the latest firing alerts in the organization.
 *
 * Displays alert title, source, severity, and project.
 * Links to the alerts page for full details.
 */
export function RecentAlerts({ alerts, isLoading }: RecentAlertsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[--muted-foreground]">No firing alerts.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => {
            const severityMeta = SEVERITY_META[alert.severity];
            return (
              <div key={alert.id} className="flex flex-col gap-2 border-l-2 border-[--border] pl-3 hover:border-[--accent] transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-[--foreground] line-clamp-1">{alert.title}</p>
                  <Badge variant="outline" className="shrink-0">
                    {alert.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-[--muted-foreground]">
                  <Badge variant={severityMeta.token.replace("--", "") as any} className="text-[10px]">
                    {severityMeta.label}
                  </Badge>
                  <span>·</span>
                  <span>{alert.source}</span>
                  <span>·</span>
                  <span>{alert.projectName}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
