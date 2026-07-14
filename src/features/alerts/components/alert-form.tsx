"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEVERITY_META, ALERT_STATUS_META } from "@/lib/constants";
import type { CreateAlertInput, UpdateAlertInput } from "@/features/alerts/schemas";
import { createAlertSchema, updateAlertSchema } from "@/features/alerts/schemas";

type AlertFormProps = {
  mode: "create" | "edit";
  defaultValues?: Partial<CreateAlertInput | UpdateAlertInput>;
  availableProjects: { id: string; name: string }[];
  availableIncidents?: { id: string; title: string }[];
  availableUsers?: { id: string; name: string }[];
  onSubmit: (data: CreateAlertInput | UpdateAlertInput) => void;
  isLoading?: boolean;
};

const STATUS_OPTIONS = [
  { value: "FIRING", label: "Firing" },
  { value: "ACKNOWLEDGED", label: "Acknowledged" },
  { value: "RESOLVED", label: "Resolved" },
];

const SEVERITY_OPTIONS = [
  { value: "SEV1", label: "SEV1 - Critical" },
  { value: "SEV2", label: "SEV2 - Major" },
  { value: "SEV3", label: "SEV3 - Minor" },
  { value: "SEV4", label: "SEV4 - Informational" },
];

/**
 * Alert form component for creating and editing alerts.
 */
export function AlertForm({
  mode,
  defaultValues,
  availableProjects,
  availableIncidents = [],
  availableUsers = [],
  onSubmit,
  isLoading,
}: AlertFormProps) {
  const schema = mode === "create" ? createAlertSchema : updateAlertSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAlertInput | UpdateAlertInput>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      severity: "SEV3",
      status: "FIRING",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Alert" : "Edit Alert"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Brief description of the alert"
              {...register("title")}
              disabled={isLoading}
            />
            {errors.title && <p className="text-sm text-[--sev-1]">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source *</Label>
            <Input
              id="source"
              placeholder="e.g. Prometheus, Datadog, PagerDuty"
              {...register("source")}
              disabled={isLoading}
            />
            {errors.source && <p className="text-sm text-[--sev-1]">{errors.source.message}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="severity">Severity *</Label>
              <select
                id="severity"
                className="flex h-10 w-full rounded-md border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--foreground] placeholder:text-[--muted-foreground] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("severity")}
                disabled={isLoading}
              >
                {SEVERITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.severity && <p className="text-sm text-[--sev-1]">{errors.severity.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--foreground] placeholder:text-[--muted-foreground] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("status")}
                disabled={isLoading}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.status && <p className="text-sm text-[--sev-1]">{errors.status.message}</p>}
            </div>
          </div>

          {mode === "create" && (
            <div className="space-y-2">
              <Label htmlFor="projectId">Project *</Label>
              <select
                id="projectId"
                className="flex h-10 w-full rounded-md border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--foreground] placeholder:text-[--muted-foreground] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("projectId" as any)}
                disabled={isLoading}
              >
                <option value="">Select a project</option>
                {availableProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {(errors as any).projectId && <p className="text-sm text-[--sev-1]">{(errors as any).projectId.message}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="incidentId">Incident</Label>
            <select
              id="incidentId"
              className="flex h-10 w-full rounded-md border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--foreground] placeholder:text-[--muted-foreground] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("incidentId")}
              disabled={isLoading}
            >
              <option value="">No incident</option>
              {availableIncidents.map((incident) => (
                <option key={incident.id} value={incident.id}>
                  {incident.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedUserId">Assigned to</Label>
            <select
              id="assignedUserId"
              className="flex h-10 w-full rounded-md border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--foreground] placeholder:text-[--muted-foreground] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("assignedUserId")}
              disabled={isLoading}
            >
              <option value="">Unassigned</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => window.history.back()} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : mode === "create" ? "Create Alert" : "Update Alert"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
