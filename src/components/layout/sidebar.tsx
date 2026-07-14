"use client";

import {
  Bell,
  LayoutDashboard,
  ScrollText,
  Siren,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Siren,
  Bell,
  ScrollText,
  Sparkles,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-[--border] bg-[--background] md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-[--border] px-4">
        <div className="flex size-6 items-center justify-center rounded-md bg-[--accent] text-xs font-bold text-white">
          O
        </div>
        <span className="text-sm font-semibold">OpsPilot AI</span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href as Route}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-[--muted-foreground] transition-colors duration-150",
                "hover:bg-[--surface-hover] hover:text-[--foreground]",
                "focus-visible:ring-2 focus-visible:ring-[--accent] focus-visible:outline-none",
                isActive && "bg-[--surface-hover] text-[--foreground]",
              )}
            >
              {Icon ? <Icon className="size-4 shrink-0" /> : null}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
