"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Route } from "next";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resendVerificationAction } from "@/features/auth/actions";
import { type LoginInput, loginSchema } from "@/features/auth/schemas";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [formError, setFormError] = React.useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = React.useState(false);
  const [resendState, setResendState] = React.useState<"idle" | "sending" | "sent">(
    "idle",
  );

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    setNeedsVerification(false);

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "email_not_verified") {
        setNeedsVerification(true);
        setFormError("Verify your email address before signing in.");
        return;
      }
      setFormError("Incorrect email or password.");
      return;
    }

    router.push(callbackUrl as Route);
    router.refresh();
  }

  async function handleResend() {
    setResendState("sending");
    await resendVerificationAction(getValues("email"));
    setResendState("sent");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-xs text-[--sev-1]">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="/forgot-password" className="text-xs text-[--accent] hover:underline">
            Forgot password?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-xs text-[--sev-1]">{errors.password.message}</p>
        ) : null}
      </div>

      {formError ? (
        <div className="flex flex-col gap-2 rounded-md border border-[--sev-1]/40 bg-[--sev-1]/10 p-3">
          <p className="text-xs text-[--sev-1]">{formError}</p>
          {needsVerification ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={resendState !== "idle"}
              onClick={handleResend}
            >
              {resendState === "sent" ? "Verification email sent" : "Resend verification email"}
            </Button>
          ) : null}
        </div>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
