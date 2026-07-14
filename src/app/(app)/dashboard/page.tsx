"use client";

import { KpiCards } from "@/features/dashboard/components/kpi-cards";
import { RecentAlerts } from "@/features/dashboard/components/recent-alerts";
import { RecentIncidents } from "@/features/dashboard/components/recent-incidents";
import { SeverityBreakdown } from "@/features/dashboard/components/severity-breakdown";
import { useDashboardData } from "@/features/dashboard/hooks/use-dashboard-data";

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboardData();

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-[--muted-foreground]">Overview of incidents, alerts, and activity.</p>
        </div>
        <div className="rounded-[10px] border border-[--border] bg-[--surface] p-6">
          <p className="text-sm text-[--sev-1]">Failed to load dashboard data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-[--muted-foreground]">Overview of incidents, alerts, and activity.</p>
      </div>

      <KpiCards
        stats={data?.incidentStats || { total: 0, open: 0, investigating: 0, identified: 0, monitoring: 0, resolved: 0, closed: 0 }}
        severityBreakdown={data?.severityBreakdown || { sev1: 0, sev2: 0, sev3: 0, sev4: 0 }}
        isLoading={isLoading}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SeverityBreakdown breakdown={data?.severityBreakdown || { sev1: 0, sev2: 0, sev3: 0, sev4: 0 }} isLoading={isLoading} />
        <RecentIncidents incidents={data?.recentIncidents || []} isLoading={isLoading} />
      </div>

      <RecentAlerts alerts={data?.recentAlerts || []} isLoading={isLoading} />
    </div>
  );
}
