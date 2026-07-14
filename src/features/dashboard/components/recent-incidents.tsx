import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SEVERITY_META } from "@/lib/constants";
import type { RecentIncident } from "@/server/repositories/dashboard.repository";

type RecentIncidentsProps = {
  incidents: RecentIncident[];
  isLoading?: boolean;
};

/**
 * Recent incidents card showing the latest incidents in the organization.
 *
 * Displays incident title, status, severity, project, and assignee.
 * Links to the incidents page for full details.
 */
export function RecentIncidents({ incidents, isLoading }: RecentIncidentsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
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

  if (incidents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[--muted-foreground]">No incidents yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Recent Incidents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {incidents.map((incident) => {
            const severityMeta = SEVERITY_META[incident.severity];
            return (
              <div key={incident.id} className="flex flex-col gap-2 border-l-2 border-[--border] pl-3 hover:border-[--accent] transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-[--foreground] line-clamp-1">{incident.title}</p>
                  <Badge variant="outline" className="shrink-0">
                    {incident.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-[--muted-foreground]">
                  <Badge variant={severityMeta.token.replace("--", "") as any} className="text-[10px]">
                    {severityMeta.label}
                  </Badge>
                  <span>·</span>
                  <span>{incident.projectName}</span>
                  {incident.assigneeName && (
                    <>
                      <span>·</span>
                      <span>{incident.assigneeName}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
