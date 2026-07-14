"use client";

import { useState, useEffect } from "react";
import { Palette, Clock, Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/components/shared/theme-provider";
import type { UpdatePreferencesInput } from "@/features/settings/schemas";

type PreferencesFormProps = {
  defaultValues?: {
    theme?: "light" | "dark" | "system";
    timezone?: string;
    dateFormat?: string;
    notificationPrefs?: {
      email?: boolean;
      inApp?: boolean;
    };
  };
  onSubmit: (data: UpdatePreferencesInput) => void;
  isLoading?: boolean;
};

export function PreferencesForm({ defaultValues, onSubmit, isLoading }: PreferencesFormProps) {
  const { setTheme } = useTheme();
  
  const [formData, setFormData] = useState({
    theme: (defaultValues?.theme ?? "system") as "light" | "dark" | "system",
    timezone: defaultValues?.timezone ?? "UTC",
    dateFormat: defaultValues?.dateFormat ?? "MM/DD/YYYY",
    notificationPrefs: {
      email: defaultValues?.notificationPrefs?.email ?? true,
      inApp: defaultValues?.notificationPrefs?.inApp ?? true,
    },
  });

  // Apply theme preference when it changes
  useEffect(() => {
    if (formData.theme === "system") {
      // For system preference, we could detect system preference
      // For now, default to dark as per app default
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    } else {
      setTheme(formData.theme);
    }
  }, [formData.theme, setTheme]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <div className="relative">
              <Palette className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[--muted-foreground]" />
              <select
                id="theme"
                className="flex h-10 w-full rounded-md border border-[--border] bg-[--surface] px-3 py-2 pl-10 text-sm text-[--foreground] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent] disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value as any })}
                disabled={isLoading}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[--muted-foreground]" />
              <select
                id="timezone"
                className="flex h-10 w-full rounded-md border border-[--border] bg-[--surface] px-3 py-2 pl-10 text-sm text-[--foreground] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent] disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                disabled={isLoading}
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateFormat">Date Format</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[--muted-foreground]" />
              <select
                id="dateFormat"
                className="flex h-10 w-full rounded-md border border-[--border] bg-[--surface] px-3 py-2 pl-10 text-sm text-[--foreground] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent] disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.dateFormat}
                onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                disabled={isLoading}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Notifications</Label>
            <div className="flex items-center justify-between rounded-lg border_border-[--border] p-3">
              <div className="flex items-center gap-3">
                <Bell className="size-4 text-[--muted-foreground]" />
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-[--muted-foreground]">Receive alerts via email</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.notificationPrefs.email}
                onChange={(e) => setFormData({
                  ...formData,
                  notificationPrefs: { ...formData.notificationPrefs, email: e.target.checked }
                })}
                disabled={isLoading}
                className="size-4 rounded border-[--border] text-[--accent] focus:ring-2 focus:ring-[--accent]"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-[--border] p-3">
              <div className="flex items-center gap-3">
                <Bell className="size-4 text-[--muted-foreground]" />
                <div>
                  <p className="text-sm font-medium">In-App Notifications</p>
                  <p className="text-xs text-[--muted-foreground]">Show notifications in the app</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.notificationPrefs.inApp}
                onChange={(e) => setFormData({
                  ...formData,
                  notificationPrefs: { ...formData.notificationPrefs, inApp: e.target.checked }
                })}
                disabled={isLoading}
                className="size-4 rounded border-[--border] text-[--accent] focus:ring-2 focus:ring-[--accent]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function PreferencesFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-10 w-28 ml-auto" />
      </CardContent>
    </Card>
  );
}
