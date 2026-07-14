import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth.config";

/**
 * Deliberately built from `authConfig` alone (not `@/lib/auth`), which
 * would pull in Prisma and bcrypt — neither runs on the Edge runtime that
 * middleware executes in. Route protection logic lives in
 * `authConfig.callbacks.authorized`; the authoritative, non-bypassable
 * check still happens server-side in (app)/layout.tsx via the full
 * `auth()` from src/lib/auth.ts.
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
