import { redirect } from "next/navigation";
import type * as React from "react";

import { AppShell } from "@/components/layout/app-shell";
import { QueryProvider } from "@/components/shared/query-provider";
import { auth } from "@/lib/auth";

/**
 * Authoritative session check — see docs/architecture.md section 4
 * (Routing architecture) and section 11 (Authentication flow). Middleware
 * (src/middleware.ts) handles the fast unauthenticated-redirect before a
 * full render is attempted; this server-side check is the real boundary
 * and can't be bypassed even if middleware is ever misconfigured.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <QueryProvider>
      <AppShell user={session.user}>{children}</AppShell>
    </QueryProvider>
  );
}
