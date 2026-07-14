"use client";

import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEVERITY_META } from "@/lib/constants";
import type { IncidentFiltersInput } from "@/features/incidents/schemas";

type IncidentFiltersProps = {
  filters: IncidentFiltersInput;
  onFiltersChange: (filters: IncidentFiltersInput) => void;
  availableTags: string[];
  availableProjects: { id: string; name: string }[];
  availableUsers: { id: string; name: string }[];
};

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "INVESTIGATING", label: "Investigating" },
  { value: "IDENTIFIED", label: "Identified" },
  { value: "MONITORING", label: "Monitoring" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const SEVERITY_OPTIONS = [
  { value: "SEV1", label: "SEV1" },
  { value: "SEV2", label: "SEV2" },
  { value: "SEV3", label: "SEV3" },
  { value: "SEV4", label: "SEV4" },
];

/**
 * Incident filters component for filtering incidents by status, severity, project, assignee, tags, and search.
 */
export function IncidentFilters({
  filters,
  onFiltersChange,
  availableTags,
  availableProjects,
  availableUsers,
}: IncidentFiltersProps) {
  const toggleStatus = (status: string) => {
    const current = filters.status || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    onFiltersChange({ ...filters, status: updated.length > 0 ? updated : undefined });
  };

  const toggleSeverity = (severity: string) => {
    const current = filters.severity || [];
    const updated = current.includes(severity)
      ? current.filter((s) => s !== severity)
      : [...current, severity];
    onFiltersChange({ ...filters, severity: updated.length > 0 ? updated : undefined });
  };

  const toggleTag = (tag: string) => {
    const current = filters.tags || [];
    const updated = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
    onFiltersChange({ ...filters, tags: updated.length > 0 ? updated : undefined });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.search ||
    filters.status?.length ||
    filters.severity?.length ||
    filters.projectId ||
    filters.assigneeId ||
    filters.tags?.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[--muted-foreground]" />
          <Input
            placeholder="Search incidents..."
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
        <span className="text-sm font-medium text-[--muted-foreground]">Status:</span>
        {STATUS_OPTIONS.map((option) => {
          const isActive = filters.status?.includes(option.value);
          return (
            <Badge
              key={option.value}
              variant={isActive ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleStatus(option.value)}
            >
              {option.label}
            </Badge>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-[--muted-foreground]">Severity:</span>
        {SEVERITY_OPTIONS.map((option) => {
          const isActive = filters.severity?.includes(option.value);
          const severityMeta = SEVERITY_META[option.value as keyof typeof SEVERITY_META];
          return (
            <Badge
              key={option.value}
              variant={isActive ? severityMeta.token.replace("--", "") as any : "outline"}
              className="cursor-pointer"
              onClick={() => toggleSeverity(option.value)}
            >
              {option.label}
            </Badge>
          );
        })}
      </div>

      {availableProjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-[--muted-foreground]">Project:</span>
          {availableProjects.map((project) => {
            const isActive = filters.projectId === project.id;
            return (
              <Badge
                key={project.id}
                variant={isActive ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    projectId: isActive ? undefined : project.id,
                  })
                }
              >
                {project.name}
              </Badge>
            );
          })}
        </div>
      )}

      {availableUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-[--muted-foreground]">Assignee:</span>
          {availableUsers.map((user) => {
            const isActive = filters.assigneeId === user.id;
            return (
              <Badge
                key={user.id}
                variant={isActive ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    assigneeId: isActive ? undefined : user.id,
                  })
                }
              >
                {user.name}
              </Badge>
            );
          })}
        </div>
      )}

      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-[--muted-foreground]">Tags:</span>
          {availableTags.map((tag) => {
            const isActive = filters.tags?.includes(tag);
            return (
              <Badge
                key={tag}
                variant={isActive ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
