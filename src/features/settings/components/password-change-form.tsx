"use client";

import { useState } from "react";
import { Lock, Key } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChangePasswordInput } from "@/features/settings/schemas";

type PasswordChangeFormProps = {
  onSubmit: (data: ChangePasswordInput) => void;
  isLoading?: boolean;
};

export function PasswordChangeForm({ onSubmit, isLoading }: PasswordChangeFormProps) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[--muted-foreground]" />
              <Input
                id="currentPassword"
                className="pl-10"
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                disabled={isLoading}
                placeholder="Enter current password"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[--muted-foreground]" />
              <Input
                id="newPassword"
                className="pl-10"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                disabled={isLoading}
                placeholder="Enter new password (min 8 characters)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[--muted-foreground]" />
              <Input
                id="confirmPassword"
                className="pl-10"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={isLoading}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
