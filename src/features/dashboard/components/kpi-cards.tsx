import { AlertTriangle, CheckCircle, Clock, Siren } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardIncidentStats } from "@/server/repositories/dashboard.repository";

type KpiCardsProps = {
  stats: DashboardIncidentStats;
  severityBreakdown: { sev1: number; sev2: number; sev3: number; sev4: number };
  isLoading?: boolean;
};

/**
 * KPI cards showing incident statistics.
 *
 * Displays total incidents, open incidents, resolved incidents,
 * and critical incidents (SEV1) with appropriate icons and colors.
 */
export function KpiCards({ stats, severityBreakdown, isLoading }: KpiCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="size-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Incidents",
      value: stats.total,
      icon: Siren,
      color: "text-[--foreground]",
    },
    {
      title: "Open Incidents",
      value: stats.open + stats.investigating + stats.identified + stats.monitoring,
      icon: Clock,
      color: "text-[--accent]",
    },
    {
      title: "Resolved",
      value: stats.resolved + stats.closed,
      icon: CheckCircle,
      color: "text-[--success]",
    },
    {
      title: "Critical (SEV1)",
      value: severityBreakdown.sev1,
      icon: AlertTriangle,
      color: "text-[--sev-1]",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[--muted-foreground]">
                {kpi.title}
              </CardTitle>
              <Icon className={`size-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[--foreground]">{kpi.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
