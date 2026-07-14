import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class names, resolving conflicts (e.g. "p-2 p-4" -> "p-4").
 * Used by every UI component that accepts a `className` override prop.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date consistently across the app (server and client render the
 * same string, avoiding hydration mismatches from locale-dependent formatting).
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/**
 * Formats a date based on user preferences (timezone and date format).
 * Used in Settings pages to respect user's display preferences.
 */
export function formatDateWithPreferences(
  date: Date | string,
  timezone: string = "UTC",
  dateFormat: string = "MM/DD/YYYY"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  // Map dateFormat to Intl.DateTimeFormat options
  const formatMap: Record<string, Intl.DateTimeFormatOptions> = {
    "MM/DD/YYYY": { month: "numeric", day: "numeric", year: "numeric" },
    "DD/MM/YYYY": { day: "numeric", month: "numeric", year: "numeric" },
    "YYYY-MM-DD": { year: "numeric", month: "numeric", day: "numeric" },
  };
  
  const options = formatMap[dateFormat] || formatMap["MM/DD/YYYY"];
  
  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: timezone,
  }).format(d);
}

/**
 * Formats a duration in minutes as a compact human string (e.g. "2h 14m"),
 * used for MTTR and incident-duration displays.
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = Math.round(minutes % 60);
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

/**
 * Converts a display name into a URL-safe slug, with a short random
 * suffix to avoid collisions (e.g. two orgs both named "Acme").
 */
export function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "org"}-${suffix}`;
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
