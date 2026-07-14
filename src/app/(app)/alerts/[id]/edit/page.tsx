"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AlertForm } from "@/features/alerts/components/alert-form";
import { useAlert, useUpdateAlert, useAlertIncidents, useAlertUsers } from "@/features/alerts/hooks/use-alerts";
import type { UpdateAlertInput } from "@/features/alerts/schemas";

export default function EditAlertPage() {
  const params = useParams();
  const router = useRouter();
  const alertId = params.id as string;

  const { data: alertData, isLoading } = useAlert(alertId);
  const { data: incidents } = useAlertIncidents();
  const { data: users } = useAlertUsers();
  const updateMutation = useUpdateAlert(alertId);

  const handleSubmit = async (data: UpdateAlertInput | any) => {
    const result = await updateMutation.mutateAsync(data as UpdateAlertInput);

    if (result && result.ok) {
      router.push(`/alerts/${alertId}` as any);
    } else {
      window.alert(result?.error || "Failed to update alert");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Alert
        </Button>
        <div className="rounded-[10px] border border-[--border] bg-[--surface] p-6">
          <p className="text-sm text-[--muted-foreground]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!alertData) {
    return (
      <div className="flex flex-col gap-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Alert
        </Button>
        <div className="rounded-[10px] border border-[--border] bg-[--surface] p-6">
          <p className="text-sm text-[--sev-1]">Alert not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 size-4" />
        Back to Alert
      </Button>

      <AlertForm
        mode="edit"
        defaultValues={{
          title: alertData.title,
          source: alertData.source,
          severity: alertData.severity,
          status: alertData.status,
          incidentId: alertData.incidentId || undefined,
          assignedUserId: alertData.assignedUserId || undefined,
        }}
        availableProjects={[{ id: alertData.project.id, name: alertData.project.name }]}
        availableIncidents={incidents || []}
        availableUsers={users || []}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
