"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { AlertFilters } from "@/features/alerts/components/alert-filters";
import { AlertList } from "@/features/alerts/components/alert-list";
import { AlertPagination } from "@/features/alerts/components/alert-pagination";
import { useAlerts, useAlertProjects, useAlertSources } from "@/features/alerts/hooks/use-alerts";
import type { AlertFiltersInput, AlertSortInput, PaginationInput } from "@/features/alerts/schemas";

export default function AlertsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<AlertFiltersInput>({});
  const [sort, setSort] = useState<AlertSortInput>({ field: "createdAt", direction: "desc" });
  const [pagination, setPagination] = useState<PaginationInput>({ page: 1, pageSize: 20 });

  const { data: alertsData, isLoading } = useAlerts(filters, sort, pagination);
  const { data: projects } = useAlertProjects();
  const { data: sources } = useAlertSources();

  const handleSort = (field: string, direction: "asc" | "desc") => {
    setSort({ field: field as any, direction });
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Alerts</h1>
          <p className="text-sm text-[--muted-foreground]">Manage and track alerts across your organization.</p>
        </div>
        <Button onClick={() => router.push("/alerts/new" as any)}>
          <Plus className="mr-2 size-4" />
          New Alert
        </Button>
      </div>

      <AlertFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableProjects={projects || []}
        availableSources={sources || []}
      />

      <AlertList
        alerts={alertsData?.items || []}
        isLoading={isLoading}
        onSort={handleSort}
        sortField={sort.field}
        sortDirection={sort.direction}
      />

      {alertsData && alertsData.totalPages > 1 && (
        <AlertPagination
          currentPage={alertsData.page}
          totalPages={alertsData.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
