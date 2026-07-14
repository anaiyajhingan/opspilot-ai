"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { AlertDetails } from "@/features/alerts/components/alert-details";
import { useAlert, useUpdateAlert, useDeleteAlert, useAcknowledgeAlert, useResolveAlert } from "@/features/alerts/hooks/use-alerts";
import type { UpdateAlertInput } from "@/features/alerts/schemas";

export default function AlertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const alertId = params.id as string;
  const [isEditing, setIsEditing] = useState(false);

  const { data: alertData, isLoading, error } = useAlert(alertId);
  const updateMutation = useUpdateAlert(alertId);
  const deleteMutation = useDeleteAlert();
  const acknowledgeAlertMutation = useAcknowledgeAlert(alertId);
  const resolveAlertMutation = useResolveAlert(alertId);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this alert?")) return;

    const result = await deleteMutation.mutateAsync(alertId);
    if (result.ok) {
      router.push("/alerts" as any);
    } else {
      window.alert(result.error);
    }
  };

  const handleAcknowledge = async () => {
    const result = await acknowledgeAlertMutation.mutateAsync();
    if (result && !result.ok) {
      window.alert(result.error);
    }
  };

  const handleResolve = async () => {
    const result = await resolveAlertMutation.mutateAsync();
    if (result && !result.ok) {
      window.alert(result.error);
    }
  };

  const handleEdit = () => {
    router.push(`/alerts/${alertId}/edit` as any);
  };

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 size-4" />
          Back
        </Button>
        <div className="rounded-[10px] border border-[--border] bg-[--surface] p-6">
          <p className="text-sm text-[--sev-1]">Failed to load alert. Please try again.</p>
          <Button variant="link" onClick={() => router.push("/alerts" as any)} className="mt-2">
            Return to Alerts List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 size-4" />
        Back to Alerts
      </Button>

      <AlertDetails
        alert={alertData!}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
      />
    </div>
  );
}
