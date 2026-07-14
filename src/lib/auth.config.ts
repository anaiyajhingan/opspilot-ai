import type { NextAuthConfig } from "next-auth";

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];
const PUBLIC_ROUTES = ["/", "/verify-email"];

/**
 * Edge-compatible slice of the Auth.js config. Middleware runs on the Edge
 * runtime, which can't load Prisma or bcrypt — so this file (imported by
 * both middleware.ts and the full auth.ts) must never import `@/lib/db`,
 * `bcryptjs`, or the provider list. The `authorized` callback here only
 * inspects the already-decoded JWT (`auth`), which is edge-safe.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isSignedIn = Boolean(auth?.user);

      const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
      const isPublicRoute = PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
      );
      const isApiRoute = pathname.startsWith("/api");

      if (isSignedIn && isAuthRoute) {
        return Response.redirect(new URL("/dashboard", request.url));
      }

      if (!isSignedIn && !isAuthRoute && !isPublicRoute && !isApiRoute) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return Response.redirect(loginUrl);
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
