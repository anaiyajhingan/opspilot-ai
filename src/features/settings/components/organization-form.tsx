"use client";

import { useState } from "react";
import { Building2, Hash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { UpdateOrganizationInput } from "@/features/settings/schemas";

type OrganizationFormProps = {
  defaultValues?: {
    name?: string;
    slug?: string;
  };
  onSubmit: (data: UpdateOrganizationInput) => void;
  isLoading?: boolean;
  canManage?: boolean;
};

export function OrganizationForm({ defaultValues, onSubmit, isLoading, canManage = true }: OrganizationFormProps) {
  const [formData, setFormData] = useState({
    name: defaultValues?.name || "",
    slug: defaultValues?.slug || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[--muted-foreground]" />
              <Input
                id="orgName"
                className="pl-10"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading || !canManage}
                placeholder="Organization name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orgSlug">Organization Slug</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[--muted-foreground]" />
              <Input
                id="orgSlug"
                className="pl-10"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                disabled={isLoading || !canManage}
                placeholder="organization-slug"
              />
            </div>
            <p className="text-xs text-[--muted-foreground]">Only lowercase letters, numbers, and hyphens allowed</p>
          </div>

          {canManage && (
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export function OrganizationFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-10 w-24 ml-auto" />
      </CardContent>
    </Card>
  );
}
