"use client";

import { useOrganization, useUpdateOrganization } from "@/features/settings/hooks/use-settings";
import { OrganizationForm, OrganizationFormSkeleton } from "@/features/settings/components/organization-form";
import { assertCan } from "@/lib/rbac";
import type { UpdateOrganizationInput } from "@/features/settings/schemas";

export default function OrganizationPage() {
  const { data: organization, isLoading, error } = useOrganization();
  const updateOrganization = useUpdateOrganization();

  const canManage = true; // TODO: Check user role against RBAC

  const handleOrganizationUpdate = async (data: UpdateOrganizationInput) => {
    const result = await updateOrganization.mutateAsync(data);
    if (result.ok) {
      alert("Organization updated successfully");
    } else {
      alert(`Failed to update organization: ${result.error}`);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Organization</h1>
          <p className="text-sm text-[--muted-foreground]">Manage your organization settings</p>
        </div>
        <div className="rounded-[10px] border border-[--border] bg-[--surface] p-6">
          <p className="text-sm text-[--sev-1]">Failed to load organization. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Organization</h1>
        <p className="text-sm text-[--muted-foreground]">Manage your organization settings</p>
      </div>

      {isLoading ? (
        <OrganizationFormSkeleton />
      ) : (
        <OrganizationForm
          defaultValues={{
            name: organization?.name,
            slug: organization?.slug,
          }}
          onSubmit={handleOrganizationUpdate}
          isLoading={updateOrganization.isPending}
          canManage={canManage}
        />
      )}

      {!canManage && (
        <div className="rounded-[10px] border border-[--border] bg-[--surface] p-4">
          <p className="text-sm text-[--muted-foreground]">
            You do not have permission to modify organization settings. Contact your organization administrator.
          </p>
        </div>
      )}
    </div>
  );
}
