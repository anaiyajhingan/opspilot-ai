"use server";

import { signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  passwordResetEmailHtml,
  sendEmail,
  verificationEmailHtml,
} from "@/lib/email";
import { clientEnv } from "@/lib/env";
import { hashPassword } from "@/lib/password";
import {
  EMAIL_VERIFICATION_TOKEN_TTL_MS,
  PASSWORD_RESET_TOKEN_TTL_MS,
  generateSecureToken,
  hashToken,
} from "@/lib/tokens";
import { slugify } from "@/lib/utils";
import type { Result } from "@/types";

import {
  type ForgotPasswordInput,
  type RegisterInput,
  type ResetPasswordInput,
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
} from "./schemas";

const APP_URL = clientEnv.NEXT_PUBLIC_APP_URL;

/**
 * Creates a new Organization + owning User in one transaction, then sends
 * an email verification link. Deliberately does NOT auto-sign-in: the
 * Credentials provider rejects unverified accounts (see src/lib/auth.ts),
 * so the user lands on a "check your email" screen instead.
 */
export async function registerAction(input: RegisterInput): Promise<Result<{ email: string }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, organizationName, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An account with that email already exists." };
  }

  const passwordHash = await hashPassword(password);
  const { raw, hash } = generateSecureToken();

  const result = await db.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name: organizationName, slug: slugify(organizationName) },
    });

    const user = await tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "OWNER",
        organizationId: organization.id,
      },
    });

    await tx.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hash,
        expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS),
      },
    });

    return { userId: user.id, organizationId: organization.id };
  });

  const verifyUrl = `${APP_URL}/verify-email?token=${raw}`;
  await sendEmail({
    to: email,
    subject: "Verify your OpsPilot AI account",
    html: verificationEmailHtml(verifyUrl),
  });

  return { ok: true, data: { email } };
}

/**
 * Always returns success regardless of whether the email exists, to avoid
 * leaking which addresses have accounts (see docs/architecture.md section
 * 19, Security checklist).
 */
export async function forgotPasswordAction(
  input: ForgotPasswordInput,
): Promise<Result<null>> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });

  if (user?.passwordHash) {
    const { raw, hash } = generateSecureToken();
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hash,
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
      },
    });

    const resetUrl = `${APP_URL}/reset-password?token=${raw}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your OpsPilot AI password",
      html: passwordResetEmailHtml(resetUrl),
    });
  }

  return { ok: true, data: null };
}

export async function resetPasswordAction(
  input: ResetPasswordInput,
): Promise<Result<null>> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { token, password } = parsed.data;

  const record = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false, error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await hashPassword(password);

  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    db.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { ok: true, data: null };
}

export async function verifyEmailAction(token: string): Promise<Result<null>> {
  if (!token) return { ok: false, error: "Missing verification token." };

  const record = await db.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false, error: "This verification link is invalid or has expired." };
  }

  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    db.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { ok: true, data: null };
}

export async function resendVerificationAction(email: string): Promise<Result<null>> {
  const user = await db.user.findUnique({ where: { email } });

  // Same "always succeed" shape as forgotPasswordAction to avoid leaking
  // account existence.
  if (user && !user.emailVerified) {
    const { raw, hash } = generateSecureToken();
    await db.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hash,
        expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS),
      },
    });

    const verifyUrl = `${APP_URL}/verify-email?token=${raw}`;
    await sendEmail({
      to: user.email,
      subject: "Verify your OpsPilot AI account",
      html: verificationEmailHtml(verifyUrl),
    });
  }

  return { ok: true, data: null };
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
