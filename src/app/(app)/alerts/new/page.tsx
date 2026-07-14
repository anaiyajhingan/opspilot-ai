"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AlertForm } from "@/features/alerts/components/alert-form";
import { useCreateAlert, useAlertProjects, useAlertIncidents, useAlertUsers } from "@/features/alerts/hooks/use-alerts";
import type { CreateAlertInput } from "@/features/alerts/schemas";

export default function NewAlertPage() {
  const router = useRouter();
  const { data: projects } = useAlertProjects();
  const { data: incidents } = useAlertIncidents();
  const { data: users } = useAlertUsers();
  const createMutation = useCreateAlert();

  const handleSubmit = async (data: CreateAlertInput | any) => {
    const result = await createMutation.mutateAsync(data as CreateAlertInput);

    if (result.ok) {
      router.push(`/alerts/${result.data.id}` as any);
    } else {
      alert(`Failed to create alert: ${result.error}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 size-4" />
        Back to Alerts
      </Button>

      <AlertForm
        mode="create"
        availableProjects={projects || []}
        availableIncidents={incidents || []}
        availableUsers={users || []}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
