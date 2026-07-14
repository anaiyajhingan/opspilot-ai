"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction } from "@/features/auth/actions";
import {
  type ForgotPasswordInput,
  forgotPasswordSchema,
} from "@/features/auth/schemas";

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordInput) {
    await forgotPasswordAction(values);
    // Always show the same success state, whether or not the email
    // exists — see forgotPasswordAction's comment on user enumeration.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="text-sm text-[--muted-foreground]">
        If an account exists for that email, we&apos;ve sent a link to reset your
        password.
      </p>
    );
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
        {errors.email ? <p className="text-xs text-[--sev-1]">{errors.email.message}</p> : null}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
