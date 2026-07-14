import { PrismaAdapter } from "@auth/prisma-adapter";
import { CredentialsSignin, default as NextAuth } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

import { authConfig } from "@/lib/auth.config";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { verifyPassword } from "@/lib/password";
import { normalizeRole } from "@/lib/rbac";
import { slugify } from "@/lib/utils";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * Auth.js swallows arbitrary `Error` messages thrown from `authorize()`
 * and collapses them to a generic "CredentialsSignin" code by design (to
 * avoid leaking account-enumeration info). Subclassing `CredentialsSignin`
 * with a custom `code` is the supported way to surface a *specific*,
 * intentional error (email-not-verified) to the client without weakening
 * that default behavior for anything else (bad password still returns the
 * generic code below).
 */
export class EmailNotVerifiedError extends CredentialsSignin {
  override code = "email_not_verified";
}

/**
 * PrismaAdapter's default `createUser` only knows the standard Auth.js
 * user shape (name/email/image/emailVerified) — it has no idea our `User`
 * model *requires* an `organizationId`. Wrap it so a brand-new Google
 * sign-in (someone who never went through /register) gets a personal
 * Organization created in the same transaction as their User row, exactly
 * like registerAction does for credentials sign-up.
 */
function buildAdapter(): Adapter {
  const base = PrismaAdapter(db);
  return {
    ...base,
    async createUser(user) {
      const displayName = user.name ?? user.email ?? "New user";
      const created = await db.$transaction(async (tx) => {
        const organization = await tx.organization.create({
          data: { name: `${displayName}'s Workspace`, slug: slugify(displayName) },
        });
        return tx.user.create({
          data: {
            name: displayName,
            email: user.email,
            image: user.image,
            emailVerified: user.emailVerified,
            role: "OWNER",
            organizationId: organization.id,
          },
        });
      });
      return { ...created, email: created.email };
    },
  };
}

/**
 * Auth.js v5 configuration. See docs/architecture.md section 11
 * (Authentication flow) and section 19 (Security checklist).
 *
 * - PrismaAdapter persists Users/Accounts so Google OAuth sign-ins link to
 *   the same domain User model as credentials sign-ins.
 * - Session strategy is JWT (stateless, scalable) even though the adapter
 *   is present — Auth.js explicitly supports this combination; the adapter
 *   is only used for account linking + user persistence, not session
 *   lookup.
 * - The JWT/session callbacks embed `role`, `organizationId`, and
 *   `emailVerified` so every server component/action can authorize without
 *   an extra database round trip per request.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: buildAdapter(),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID ?? "",
      clientSecret: env.AUTH_GOOGLE_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await db.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) return null;

        if (!user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          organizationId: user.organizationId,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // Google sign-ins bypass our email-verification gate — an OAuth
      // provider verifying the address is itself proof of ownership.
      if (account?.provider === "google" && user.email) {
        await db.user.updateMany({
          where: { email: user.email, emailVerified: null },
          data: { emailVerified: new Date() },
        });
      }

      return true;
    },
    async jwt({ token, user}) {
      // Initial sign-in: set token from user object
      if (user) {
        token.role = (user as { role?: string }).role;
        token.organizationId = (user as { organizationId?: string }).organizationId;
        token.sub = (user as { id?: string }).id;
      }

      // Always refresh organizationId and role from the database to ensure
      // the session reflects the current user state, not stale JWT data.
      // This handles cases where the user's organization was changed in the DB
      // but their JWT still contains the old organizationId.
      if (token.email && token.sub) {
        const dbUser = await db.user.findUnique({ 
          where: { id: token.sub as string },
          select: { role: true, organizationId: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.organizationId = dbUser.organizationId;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        // token.role comes from JWT which stores the Prisma enum (UPPER_CASE)
        // Normalize to app-facing Role type (TitleCase)
        const prismaRole = (token.role as string) ?? "MEMBER";
        session.user.role = normalizeRole(prismaRole);
        session.user.organizationId = (token.organizationId as string) ?? "";
      }
      return session;
    },
  },
});
