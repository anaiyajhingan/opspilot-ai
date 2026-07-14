"use client";

import { useState } from "react";
import { Users, Mail, Shield, Trash2, Crown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateWithPreferences } from "@/lib/utils";
import type { MemberListItem } from "@/server/repositories/settings.repository";
import type { UpdateMemberRoleInput } from "@/features/settings/schemas";

type TeamManagementProps = {
  members?: MemberListItem[];
  currentUserId?: string;
  currentUserRole?: string;
  onInvite: (email: string, role: string) => void;
  onRemove: (userId: string) => void;
  onUpdateRole: (userId: string, role: string) => void;
  isLoading?: boolean;
  canManageMembers?: boolean;
  timezone?: string;
  dateFormat?: string;
};

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
};

const ROLE_COLORS: Record<string, string> = {
  OWNER: "default",
  ADMIN: "secondary",
  MEMBER: "outline",
  VIEWER: "outline",
};

export function TeamManagement({
  members,
  currentUserId,
  currentUserRole,
  onInvite,
  onRemove,
  onUpdateRole,
  isLoading,
  canManageMembers = false,
  timezone = "UTC",
  dateFormat = "MM/DD/YYYY",
}: TeamManagementProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    onInvite(inviteEmail, inviteRole);
    setInviteEmail("");
  };

  return (
    <div className="space-y-6">
      {canManageMembers && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[--muted-foreground]" />
                    <Input
                      id="inviteEmail"
                      className="pl-10"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      disabled={isLoading}
                      placeholder="member@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteRole">Role</Label>
                  <select
                    id="inviteRole"
                    className="flex h-10 w-full rounded-md border border-[--border] bg-[--surface] px-3 py-2 text-sm text-[--foreground] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent] disabled:cursor-not-allowed disabled:opacity-50"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="VIEWER">Viewer</option>
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <Button type="submit" disabled={isLoading || !inviteEmail}>
                {isLoading ? "Inviting..." : "Send Invitation"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Team Members</CardTitle>
            <Badge variant="secondary" className="gap-1">
              <Users className="size-3" />
              {members?.length || 0}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : members && members.length > 0 ? (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-[--border] p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-[--surface]">
                      <Users className="size-4 text-[--muted-foreground]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{member.name}</p>
                        {member.id === currentUserId && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <p className="text-xs text-[--muted-foreground]">{member.email}</p>
                      <p className="text-xs text-[--muted-foreground]">Joined {formatDateWithPreferences(member.createdAt, timezone, dateFormat)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={ROLE_COLORS[member.role] as any} className="gap-1">
                      {member.role === "OWNER" && <Crown className="size-3" />}
                      {ROLE_LABELS[member.role]}
                    </Badge>
                    {canManageMembers && member.id !== currentUserId && (
                      <div className="flex items-center gap-1">
                        <select
                          className="h-8 rounded border border-[--border] bg-[--surface] px-2 text-xs text-[--foreground] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent]"
                          value={member.role}
                          onChange={(e) => onUpdateRole(member.id, e.target.value)}
                          disabled={isLoading}
                        >
                          <option value="VIEWER">Viewer</option>
                          <option value="MEMBER">Member</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Remove ${member.name} from the organization?`)) {
                              onRemove(member.id);
                            }
                          }}
                          disabled={isLoading}
                        >
                          <Trash2 className="size-4 text-[--sev-1]" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="mb-2 size-8 text-[--muted-foreground]" />
              <p className="text-sm text-[--muted-foreground]">No members in the organization yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function TeamManagementSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-32 mt-4" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
