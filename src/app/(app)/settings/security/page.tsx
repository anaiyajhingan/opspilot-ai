"use client";

import { useSessions, useLogoutAllDevices, useUserProfile } from "@/features/settings/hooks/use-settings";
import { SecuritySection, SecuritySectionSkeleton } from "@/features/settings/components/security-section";

export default function SecurityPage() {
  const { data: sessions, isLoading, error } = useSessions();
  const { data: profile } = useUserProfile();
  const logoutAllDevices = useLogoutAllDevices();

  const handleLogoutAll = async () => {
    if (!confirm("Are you sure you want to logout from all devices?")) {
      return;
    }

    const result = await logoutAllDevices.mutateAsync();
    if (result.ok) {
      alert("Logged out from all devices successfully");
    } else {
      alert(`Failed to logout from all devices: ${result.error}`);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Security</h1>
          <p className="text-sm text-[--muted-foreground]">Manage your account security</p>
        </div>
        <div className="rounded-[10px] border border-[--border] bg-[--surface] p-6">
          <p className="text-sm text-[--sev-1]">Failed to load security information. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Security</h1>
        <p className="text-sm text-[--muted-foreground]">Manage your account security</p>
      </div>

      {isLoading ? (
        <SecuritySectionSkeleton />
      ) : (
        <SecuritySection
          sessions={sessions || undefined}
          onLogoutAll={handleLogoutAll}
          isLoading={logoutAllDevices.isPending}
          timezone={profile?.timezone}
          dateFormat={profile?.dateFormat}
        />
      )}
    </div>
  );
}
