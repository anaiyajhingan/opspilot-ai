"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProjectForm } from "@/features/projects/components/project-form";
import { useCreateProject } from "@/features/projects/hooks/use-projects";
import type { CreateProjectInput } from "@/features/projects/schemas";

export default function NewProjectPage() {
  const router = useRouter();
  const createMutation = useCreateProject();

  const handleSubmit = async (data: CreateProjectInput | any) => {
    const result = await createMutation.mutateAsync(data as CreateProjectInput);

    if (result.ok) {
      router.push(`/projects/${result.data.id}` as any);
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 size-4" />
        Back to Projects
      </Button>

      <ProjectForm
        mode="create"
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
