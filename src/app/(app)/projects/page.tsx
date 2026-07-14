"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ProjectFilters } from "@/features/projects/components/project-filters";
import { ProjectList } from "@/features/projects/components/project-list";
import { ProjectPagination } from "@/features/projects/components/project-pagination";
import { useProjects } from "@/features/projects/hooks/use-projects";
import type { ProjectFiltersInput, ProjectSortInput, PaginationInput } from "@/features/projects/schemas";

export default function ProjectsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ProjectFiltersInput>({});
  const [sort, setSort] = useState<ProjectSortInput>({ field: "createdAt", direction: "desc" });
  const [pagination, setPagination] = useState<PaginationInput>({ page: 1, pageSize: 20 });

  const { data: projectsData, isLoading } = useProjects(filters, sort, pagination);

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
          <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-[--muted-foreground]">Manage and track projects across your organization.</p>
        </div>
        <Button onClick={() => router.push("/projects/new" as any)}>
          <Plus className="mr-2 size-4" />
          New Project
        </Button>
      </div>

      <ProjectFilters filters={filters} onFiltersChange={setFilters} />

      <ProjectList
        projects={projectsData?.items || []}
        isLoading={isLoading}
        onSort={handleSort}
        sortField={sort.field}
        sortDirection={sort.direction}
      />

      {projectsData && projectsData.totalPages > 1 && (
        <ProjectPagination
          currentPage={projectsData.page}
          totalPages={projectsData.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
