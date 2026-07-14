"use client";

import { useState } from "react";
import { User, Mail, Camera } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { UpdateProfileInput } from "@/features/settings/schemas";

type ProfileFormProps = {
  defaultValues?: {
    name?: string;
    email?: string;
    image?: string;
  };
  onSubmit: (data: UpdateProfileInput) => void;
  isLoading?: boolean;
};

export function ProfileForm({ defaultValues, onSubmit, isLoading }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: defaultValues?.name || "",
    email: defaultValues?.email || "",
    image: defaultValues?.image || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="size-20">
              <AvatarImage src={defaultValues?.image} />
              <AvatarFallback className="text-lg">
                {defaultValues?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button type="button" variant="secondary" size="sm" disabled>
                <Camera className="mr-2 size-4" />
                Change Avatar
              </Button>
              <p className="mt-1 text-xs text-[--muted-foreground]">Avatar upload not yet supported</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[--muted-foreground]" />
              <Input
                id="name"
                className="pl-10"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
                placeholder="Your name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[--muted-foreground]" />
              <Input
                id="email"
                className="pl-10"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function ProfileFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <Skeleton className="size-20 rounded-full" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-24 ml-auto" />
      </CardContent>
    </Card>
  );
}
