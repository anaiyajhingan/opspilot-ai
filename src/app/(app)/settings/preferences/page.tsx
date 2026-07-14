"use client";

import { useUserProfile, useUpdatePreferences } from "@/features/settings/hooks/use-settings";
import { PreferencesForm, PreferencesFormSkeleton } from "@/features/settings/components/preferences-form";
import type { UpdatePreferencesInput } from "@/features/settings/schemas";

export default function PreferencesPage() {
  const { data: profile, isLoading, error } = useUserProfile();
  const updatePreferences = useUpdatePreferences();

  const handlePreferencesUpdate = async (data: UpdatePreferencesInput) => {
    const result = await updatePreferences.mutateAsync(data);
    if (result.ok) {
      alert("Preferences updated successfully");
    } else {
      alert(`Failed to update preferences: ${result.error}`);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Preferences</h1>
          <p className="text-sm text-[--muted-foreground]">Manage your app preferences</p>
        </div>
        <div className="rounded-[10px] border border-[--border] bg-[--surface] p-6">
          <p className="text-sm text-[--sev-1]">Failed to load preferences. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Preferences</h1>
        <p className="text-sm text-[--muted-foreground]">Manage your app preferences</p>
      </div>

      {isLoading ? (
        <PreferencesFormSkeleton />
      ) : (
        <PreferencesForm
          defaultValues={{
            theme: profile?.theme as any,
            timezone: profile?.timezone,
            dateFormat: profile?.dateFormat,
            notificationPrefs: profile?.notificationPrefs as any,
          }}
          onSubmit={handlePreferencesUpdate}
          isLoading={updatePreferences.isPending}
        />
      )}
    </div>
  );
}
