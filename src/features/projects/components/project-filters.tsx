"use client";

import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProjectFiltersInput } from "@/features/projects/schemas";

type ProjectFiltersProps = {
  filters: ProjectFiltersInput;
  onFiltersChange: (filters: ProjectFiltersInput) => void;
};

/**
 * Project filters component for filtering projects by search and incident status.
 */
export function ProjectFilters({ filters, onFiltersChange }: ProjectFiltersProps) {
  const toggleHasIncidents = () => {
    onFiltersChange({
      ...filters,
      hasIncidents: filters.hasIncidents === true ? undefined : true,
    });
  };

  const toggleHasOpenIncidents = () => {
    onFiltersChange({
      ...filters,
      hasOpenIncidents: filters.hasOpenIncidents === true ? undefined : true,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.search || filters.hasIncidents || filters.hasOpenIncidents;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[--muted-foreground]" />
          <Input
            placeholder="Search projects..."
            value={filters.search || ""}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
            className="pl-9"
          />
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-[--muted-foreground]">Incidents:</span>
        <Badge
          variant={filters.hasIncidents ? "default" : "outline"}
          className="cursor-pointer"
          onClick={toggleHasIncidents}
        >
          Has incidents
        </Badge>
        <Badge
          variant={filters.hasOpenIncidents ? "default" : "outline"}
          className="cursor-pointer"
          onClick={toggleHasOpenIncidents}
        >
          Has open incidents
        </Badge>
      </div>
    </div>
  );
}
