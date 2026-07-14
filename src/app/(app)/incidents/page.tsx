"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { IncidentFilters } from "@/features/incidents/components/incident-filters";
import { IncidentList } from "@/features/incidents/components/incident-list";
import { IncidentPagination } from "@/features/incidents/components/incident-pagination";
import { useIncidents, useProjects, useUsers, useTags } from "@/features/incidents/hooks/use-incidents";
import type { IncidentFiltersInput, IncidentSortInput, PaginationInput } from "@/features/incidents/schemas";

export default function IncidentsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<IncidentFiltersInput>({});
  const [sort, setSort] = useState<IncidentSortInput>({ field: "createdAt", direction: "desc" });
  const [pagination, setPagination] = useState<PaginationInput>({ page: 1, pageSize: 20 });

  const { data: incidentsData, isLoading } = useIncidents(filters, sort, pagination);
  const { data: projects } = useProjects();
  const { data: users } = useUsers();
  const { data: tags } = useTags();

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
          <h1 className="text-xl font-semibold tracking-tight">Incidents</h1>
          <p className="text-sm text-[--muted-foreground]">Manage and track incidents across your organization.</p>
        </div>
        <Button onClick={() => router.push("/incidents/new" as any)}>
          <Plus className="mr-2 size-4" />
          New Incident
        </Button>
      </div>

      <IncidentFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableTags={tags || []}
        availableProjects={projects || []}
        availableUsers={users || []}
      />

      <IncidentList
        incidents={incidentsData?.items || []}
        isLoading={isLoading}
        onSort={handleSort}
        sortField={sort.field}
        sortDirection={sort.direction}
      />

      {incidentsData && incidentsData.totalPages > 1 && (
        <IncidentPagination
          currentPage={incidentsData.page}
          totalPages={incidentsData.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
