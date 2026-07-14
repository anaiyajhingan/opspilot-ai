"use client";

import { useUserProfile, useMembers, useInviteMember, useRemoveMember, useUpdateMemberRole } from "@/features/settings/hooks/use-settings";
import { TeamManagement, TeamManagementSkeleton } from "@/features/settings/components/team-management";
import { can, normalizeRole } from "@/lib/rbac";
import type { InviteMemberInput } from "@/features/settings/schemas";

export default function TeamPage() {
  const { data: profile } = useUserProfile();
  const { data: members, isLoading, error } = useMembers();
  const inviteMember = useInviteMember();
  const removeMember = useRemoveMember();
  const updateMemberRole = useUpdateMemberRole();

  const canManageMembers = profile ? can(normalizeRole(profile.role), "org:manageMembers") : false;

  const handleInvite = async (email: string, role: string) => {
    const result = await inviteMember.mutateAsync({ email, role: role as any } as InviteMemberInput);
    if (result.ok) {
      alert("Member invited successfully");
    } else {
      alert(`Failed to invite member: ${result.error}`);
    }
  };

  const handleRemove = async (userId: string) => {
    const result = await removeMember.mutateAsync(userId);
    if (result.ok) {
      alert("Member removed successfully");
    } else {
      alert(`Failed to remove member: ${result.error}`);
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    const result = await updateMemberRole.mutateAsync({ userId, input: { role: role as any } });
    if (result.ok) {
      // Success - no alert needed as it's inline
    } else {
      alert(`Failed to update role: ${result.error}`);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-sm text-[--muted-foreground]">Manage your organization team</p>
        </div>
        <div className="rounded-[10px] border border-[--border] bg-[--surface] p-6">
          <p className="text-sm text-[--sev-1]">Failed to load team members. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="text-sm text-[--muted-foreground]">Manage your organization team</p>
      </div>

      {isLoading ? (
        <TeamManagementSkeleton />
      ) : (
        <TeamManagement
          members={members || undefined}
          currentUserId={profile?.id}
          currentUserRole={profile?.role}
          onInvite={handleInvite}
          onRemove={handleRemove}
          onUpdateRole={handleUpdateRole}
          isLoading={inviteMember.isPending || removeMember.isPending || updateMemberRole.isPending}
          canManageMembers={canManageMembers}
          timezone={profile?.timezone}
          dateFormat={profile?.dateFormat}
        />
      )}

      {!canManageMembers && (
        <div className="rounded-[10px] border border-[--border] bg-[--surface] p-4">
          <p className="text-sm text-[--muted-foreground]">
            You do not have permission to manage team members. Contact your organization administrator.
          </p>
        </div>
      )}
    </div>
  );
}
