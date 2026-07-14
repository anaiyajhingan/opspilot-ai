"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IncidentForm } from "@/features/incidents/components/incident-form";
import { useCreateIncident, useProjects, useUsers } from "@/features/incidents/hooks/use-incidents";
import type { CreateIncidentInput } from "@/features/incidents/schemas";

export default function NewIncidentPage() {
  const router = useRouter();
  const { data: projects } = useProjects();
  const { data: users } = useUsers();
  const createMutation = useCreateIncident();

  const handleSubmit = async (data: CreateIncidentInput | any) => {
    const result = await createMutation.mutateAsync(data as CreateIncidentInput);

    if (result.ok) {
      router.push(`/incidents/${result.data.id}` as any);
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 size-4" />
        Back to Incidents
      </Button>

      <IncidentForm
        mode="create"
        availableProjects={projects || []}
        availableUsers={users || []}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
