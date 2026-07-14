"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProjectDetails } from "@/features/projects/components/project-details";
import { useProject } from "@/features/projects/hooks/use-projects";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { data: project, isLoading, error } = useProject(projectId);

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>
        <div className="rounded-[10px] border border-[--border] bg-[--surface] p-6">
          <p className="text-sm text-[--sev-1]">Failed to load project. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 size-4" />
        Back to Projects
      </Button>

      <ProjectDetails project={project!} isLoading={isLoading} />
    </div>
  );
}
