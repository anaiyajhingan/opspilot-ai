"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEVERITY_META } from "@/lib/constants";
import type { CreateIncidentInput, UpdateIncidentInput } from "@/features/incidents/schemas";
import { createIncidentSchema, updateIncidentSchema } from "@/features/incidents/schemas";

type IncidentFormProps = {
  mode: "create" | "edit";
  defaultValues?: Partial<CreateIncidentInput | UpdateIncidentInput>;
  availableProjects: { id: string; name: string }[];
  availableUsers: { id: string; name: string }[];
  onSubmit: (data: CreateIncidentInput | UpdateIncidentInput) => void;
  isLoading?: boolean;
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
  { value: "SEV1", label: "SEV1 - Critical" },
  { value: "SEV2", label: "SEV2 - Major" },
  { value: "SEV3", label: "SEV3 - Minor" },
  { value: "SEV4", label: "SEV4 - Informational" },
];

/**
 * Incident form component for creating and editing incidents.
 */
export function IncidentForm({
  mode,
  defaultValues,
  availableProjects,
  availableUsers,
  onSubmit,
  isLoading,
}: IncidentFormProps) {
  const schema = mode === "create" ? createIncidentSchema : updateIncidentSchema;
  
  // Local state for tags input (comma-separated string)
  const [tagsInput, setTagsInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateIncidentInput | UpdateIncidentInput>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      severity: "SEV3",
      status: "OPEN",
      tags: [],
    },
  });

  // Convert array to comma-separated string when editing
  useEffect(() => {
    if (defaultValues?.tags && Array.isArray(defaultValues.tags)) {
      setTagsInput(defaultValues.tags.join(", "));
    }
  }, [defaultValues?.tags, mode]);

  const handleFormSubmit = (data: CreateIncidentInput | UpdateIncidentInput) => {
    // Convert comma-separated string to array
    const tagsArray = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    
    // Override the tags field with the converted array
    onSubmit({
      ...data,
      tags: tagsArray,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Incident" : "Edit Incident"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Brief description of the incident"
              {...register("title")}
              disabled={isLoading}
            />
            {errors.title && <p className="text-sm text-[--sev-1]">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              placeholder="Detailed description of the incident"
              className="flex min-h-[120px] w-full rounded-md border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--foreground] placeholder:text-[--muted-foreground] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("description")}
              disabled={isLoading}
            />
            {errors.description && <p className="text-sm text-[--sev-1]">{errors.description.message}</p>}
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
            <div className="grid gap-4 md:grid-cols-2">
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

              <div className="space-y-2">
                <Label htmlFor="assigneeId">Assignee</Label>
                <select
                  id="assigneeId"
                  className="flex h-10 w-full rounded-md border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--foreground] placeholder:text-[--muted-foreground] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("assigneeId")}
                  disabled={isLoading}
                >
                  <option value="">Unassigned</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                {errors.assigneeId && <p className="text-sm text-[--sev-1]">{errors.assigneeId.message}</p>}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="e.g. database, api, urgent"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              disabled={isLoading}
            />
            {errors.tags && <p className="text-sm text-[--sev-1]">{errors.tags.message}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => window.history.back()} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : mode === "create" ? "Create Incident" : "Update Incident"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
