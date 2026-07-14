"use client";

import { useUserProfile, useUpdateProfile, useChangePassword, useOAuthProviders } from "@/features/settings/hooks/use-settings";
import { ProfileForm, ProfileFormSkeleton } from "@/features/settings/components/profile-form";
import { PasswordChangeForm } from "@/features/settings/components/password-change-form";
import { OAuthProviders } from "@/features/settings/components/oauth-providers";
import type { UpdateProfileInput, ChangePasswordInput } from "@/features/settings/schemas";

export default function ProfilePage() {
  const { data: profile, isLoading, error } = useUserProfile();
  const { data: oauthProviders } = useOAuthProviders();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const handleProfileUpdate = async (data: UpdateProfileInput) => {
    const result = await updateProfile.mutateAsync(data);
    if (result.ok) {
      alert("Profile updated successfully");
    } else {
      alert(`Failed to update profile: ${result.error}`);
    }
  };

  const handlePasswordChange = async (data: ChangePasswordInput) => {
    const result = await changePassword.mutateAsync(data);
    if (result.ok) {
      alert("Password changed successfully");
    } else {
      alert(`Failed to change password: ${result.error}`);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-[--muted-foreground]">Manage your profile settings</p>
        </div>
        <div className="rounded-[10px] border border-[--border] bg-[--surface] p-6">
          <p className="text-sm text-[--sev-1]">Failed to load profile. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-[--muted-foreground]">Manage your profile settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {isLoading ? (
            <ProfileFormSkeleton />
          ) : (
            <ProfileForm
              defaultValues={{
                name: profile?.name,
                email: profile?.email,
                image: profile?.image || undefined,
              }}
              onSubmit={handleProfileUpdate}
              isLoading={updateProfile.isPending}
            />
          )}

          <PasswordChangeForm
            onSubmit={handlePasswordChange}
            isLoading={changePassword.isPending}
          />
        </div>

        <div>
          <OAuthProviders providers={oauthProviders || []} />
        </div>
      </div>
    </div>
  );
}
