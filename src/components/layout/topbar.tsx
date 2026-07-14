import { Bell, Search } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { signOutAction } from "@/features/auth/actions";
import { getInitials } from "@/lib/utils";

export type TopbarUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function Topbar({ user }: { user: TopbarUser }) {
  const displayName = user.name ?? user.email ?? "Account";
  const initials = getInitials(displayName || "?");
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-[--border] px-4 md:px-6">
      <div className="flex flex-1 items-center gap-2 rounded-md border border-[--border] bg-[--surface] px-3 py-1.5 md:max-w-sm">
        <Search className="size-4 text-[--muted-foreground]" />
        <input
          type="search"
          placeholder="Search incidents, alerts…"
          aria-label="Search"
          className="w-full bg-transparent text-sm text-[--foreground] placeholder:text-[--muted-foreground] focus:outline-none"
        />
        <kbd className="hidden rounded border border-[--border] px-1.5 py-0.5 text-[10px] text-[--muted-foreground] md:inline-block">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="ml-1 rounded-full focus-visible:ring-2 focus-visible:ring-[--accent] focus-visible:outline-none"
              aria-label="Open user menu"
            >
              <Avatar>
                {user.image ? <AvatarImage src={user.image} alt={displayName} /> : null}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled className="flex flex-col items-start gap-0.5">
              <span className="font-medium text-[--foreground]">{displayName}</span>
              {user.email ? (
                <span className="text-xs text-[--muted-foreground]">{user.email}</span>
              ) : null}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/settings/profile">Settings</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />

<form action={signOutAction}>
  <button
    type="submit"
    className="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
  >
    Sign out
  </button>
</form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
