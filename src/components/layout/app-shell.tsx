import type * as React from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar, type TopbarUser } from "@/components/layout/topbar";

export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: TopbarUser;
}) {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[--background] text-[--foreground]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
