"use client";

import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEVERITY_META, ALERT_STATUS_META } from "@/lib/constants";
import type { AlertFiltersInput } from "@/features/alerts/schemas";

type AlertFiltersProps = {
  filters: AlertFiltersInput;
  onFiltersChange: (filters: AlertFiltersInput) => void;
  availableProjects: { id: string; name: string }[];
  availableSources: string[];
};

const STATUS_OPTIONS = [
  { value: "FIRING", label: "Firing" },
  { value: "ACKNOWLEDGED", label: "Acknowledged" },
  { value: "RESOLVED", label: "Resolved" },
];

const SEVERITY_OPTIONS = [
  { value: "SEV1", label: "SEV1" },
  { value: "SEV2", label: "SEV2" },
  { value: "SEV3", label: "SEV3" },
  { value: "SEV4", label: "SEV4" },
];

/**
 * Alert filters component for filtering alerts by status, severity, project, source, and search.
 */
export function AlertFilters({
  filters,
  onFiltersChange,
  availableProjects,
  availableSources,
}: AlertFiltersProps) {
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

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.search ||
    filters.status?.length ||
    filters.severity?.length ||
    filters.projectId ||
    filters.source;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[--muted-foreground]" />
          <Input
            placeholder="Search alerts..."
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
          const statusMeta = ALERT_STATUS_META[option.value as keyof typeof ALERT_STATUS_META];
          return (
            <Badge
              key={option.value}
              variant={isActive ? statusMeta.token.replace("--", "") as any : "outline"}
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

      {availableSources.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-[--muted-foreground]">Source:</span>
          {availableSources.map((source) => {
            const isActive = filters.source === source;
            return (
              <Badge
                key={source}
                variant={isActive ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    source: isActive ? undefined : source,
                  })
                }
              >
                {source}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
