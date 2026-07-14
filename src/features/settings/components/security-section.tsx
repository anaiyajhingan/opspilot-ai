"use client";

import { Monitor, LogOut, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateWithPreferences } from "@/lib/utils";

type SecuritySectionProps = {
  sessions?: {
    id: string;
    sessionToken: string;
    expires: Date;
  }[];
  onLogoutAll: () => void;
  isLoading?: boolean;
  timezone?: string;
  dateFormat?: string;
};

export function SecuritySection({ sessions, onLogoutAll, isLoading, timezone = "UTC", dateFormat = "MM/DD/YYYY" }: SecuritySectionProps) {
  const activeSessionsLength = sessions?.length || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Shield className="size-4 text-[--muted-foreground]" />
              <div>
                <p className="text-sm font-medium">Account Status</p>
                <p className="text-xs text-[--muted-foreground]">Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Sessions</CardTitle>
            <Badge variant="secondary">{activeSessionsLength} active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : sessions && sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between rounded-lg border border-[--border] p-3">
                  <div className="flex items-center gap-3">
                    <Monitor className="size-4 text-[--muted-foreground]" />
                    <div>
                      <p className="text-sm font-medium">Current Session</p>
                      <p className="text-xs text-[--muted-foreground]">Expires: {formatDateWithPreferences(session.expires, timezone, dateFormat)}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[--muted-foreground]">No active sessions found.</p>
          )}

          <div className="mt-4 pt-4 border-t border-[--border]">
            <Button
              variant="destructive"
              onClick={onLogoutAll}
              disabled={isLoading || activeSessionsLength === 0}
              className="w-full"
            >
              <LogOut className="mr-2 size-4" />
              Logout from All Devices
            </Button>
            <p className="mt-2 text-xs text-[--muted-foreground]">
              This will sign you out from all devices including your current session. You will need to sign in again.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function SecuritySectionSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[--border]">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="mt-2 h-3 w-64" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
