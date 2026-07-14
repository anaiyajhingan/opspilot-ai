"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CreateProjectInput, UpdateProjectInput } from "@/features/projects/schemas";
import { createProjectSchema, updateProjectSchema } from "@/features/projects/schemas";

type ProjectFormProps = {
  mode: "create" | "edit";
  defaultValues?: Partial<CreateProjectInput | UpdateProjectInput>;
  onSubmit: (data: CreateProjectInput | UpdateProjectInput) => void;
  isLoading?: boolean;
};

/**
 * Project form component for creating and editing projects.
 */
export function ProjectForm({ mode, defaultValues, onSubmit, isLoading }: ProjectFormProps) {
  const schema = mode === "create" ? createProjectSchema : updateProjectSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProjectInput | UpdateProjectInput>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {},
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Project" : "Edit Project"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Project name"
              {...register("name")}
              disabled={isLoading}
            />
            {errors.name && <p className="text-sm text-[--sev-1]">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              placeholder="Project description"
              className="flex min-h-[120px] w-full rounded-md border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--foreground] placeholder:text-[--muted-foreground] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("description")}
              disabled={isLoading}
            />
            {errors.description && <p className="text-sm text-[--sev-1]">{errors.description.message}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => window.history.back()} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : mode === "create" ? "Create Project" : "Update Project"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
