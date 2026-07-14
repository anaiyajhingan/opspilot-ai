"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction } from "@/features/auth/actions";
import {
  type ResetPasswordInput,
  resetPasswordSchema,
} from "@/features/auth/schemas";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  async function onSubmit(values: ResetPasswordInput) {
    setFormError(null);
    const result = await resetPasswordAction(values);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  if (!token) {
    return (
      <p className="text-sm text-[--sev-1]">
        This reset link is missing its token. Request a new one from the sign-in page.
      </p>
    );
  }

  if (success) {
    return (
      <p className="text-sm text-[--success]">
        Password updated. Redirecting you to sign in…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <input type="hidden" {...register("token")} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-xs text-[--sev-1]">{errors.password.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword ? (
          <p className="text-xs text-[--sev-1]">{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      {formError ? <p className="text-xs text-[--sev-1]">{formError}</p> : null}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
