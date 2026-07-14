"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction } from "@/features/auth/actions";
import { type RegisterInput, registerSchema } from "@/features/auth/schemas";

export function RegisterForm() {
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    setFormError(null);
    const result = await registerAction(values);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setSubmittedEmail(result.data.email);
  }

  if (submittedEmail) {
    return (
      <div className="flex flex-col gap-2 text-sm text-[--muted-foreground]">
        <p className="text-[--foreground]">Check your email to finish setting up your account.</p>
        <p>
          We sent a verification link to <span className="text-[--foreground]">{submittedEmail}</span>.
          Click it, then come back and sign in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Your name</Label>
        <Input
          id="name"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name ? <p className="text-xs text-[--sev-1]">{errors.name.message}</p> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="organizationName">Organization name</Label>
        <Input
          id="organizationName"
          autoComplete="organization"
          aria-invalid={Boolean(errors.organizationName)}
          {...register("organizationName")}
        />
        {errors.organizationName ? (
          <p className="text-xs text-[--sev-1]">{errors.organizationName.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email ? <p className="text-xs text-[--sev-1]">{errors.email.message}</p> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
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
        <p className="text-xs text-[--muted-foreground]">At least 8 characters.</p>
      </div>

      {formError ? <p className="text-xs text-[--sev-1]">{formError}</p> : null}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
