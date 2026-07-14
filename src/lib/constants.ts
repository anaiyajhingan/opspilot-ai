export const APP_NAME = "OpsPilot AI" as const;

export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Incidents", href: "/incidents", icon: "Siren" },
  { label: "Alerts", href: "/alerts", icon: "Bell" },
  { label: "Projects", href: "/projects", icon: "ScrollText" },
  { label: "AI Assistant", href: "/ai-assistant", icon: "Sparkles" },
] as const;

export const SETTINGS_NAV_ITEMS = [
  { label: "Profile", href: "/settings/profile" },
  { label: "Organization", href: "/settings/organization" },
  { label: "Team", href: "/settings/team" },
  { label: "Preferences", href: "/settings/preferences" },
  { label: "Security", href: "/settings/security" },
] as const;

/**
 * Severity metadata is the design system's signature system (see design
 * doc, section 9) — every screen that renders an incident pulls its color
 * and label from here, so the mapping only exists in one place.
 */
export const SEVERITY_META = {
  SEV1: { label: "SEV1 · Critical", token: "--sev-1" },
  SEV2: { label: "SEV2 · Major", token: "--sev-2" },
  SEV3: { label: "SEV3 · Minor", token: "--sev-3" },
  SEV4: { label: "SEV4 · Informational", token: "--sev-4" },
} as const;

export type Severity = keyof typeof SEVERITY_META;

/**
 * Alert status metadata — similar to severity, provides consistent
 * labeling and styling for alert statuses across the application.
 */
export const ALERT_STATUS_META = {
  FIRING: { label: "Firing", token: "--destructive" },
  ACKNOWLEDGED: { label: "Acknowledged", token: "--warning" },
  RESOLVED: { label: "Resolved", token: "--success" },
} as const;

export type AlertStatus = keyof typeof ALERT_STATUS_META;
