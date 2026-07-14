import type { Severity } from "@/lib/constants";

/**
 * Standard return shape for server actions and service calls. Preferred
 * over throwing across the server/client boundary — see design doc,
 * section 14 (Error handling strategy).
 */
export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export type Role = "Owner" | "Admin" | "Member" | "Viewer";

export type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export type { Severity };
