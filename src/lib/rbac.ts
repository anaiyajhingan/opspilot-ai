import type { Role } from "@/types";

/**
 * Every capability the app gates by role. Keep this list flat and
 * exhaustive — it's the one place capability → role mapping is decided.
 * See docs/architecture.md section 12 (RBAC strategy).
 */
export type Action =
  | "org:manageBilling"
  | "org:delete"
  | "org:manageMembers"
  | "incident:create"
  | "incident:edit"
  | "incident:delete"
  | "incident:assign"
  | "incident:comment"
  | "alert:create"
  | "alert:edit"
  | "alert:delete"
  | "alert:assign"
  | "alert:acknowledge"
  | "alert:resolve"
  | "project:create"
  | "project:edit"
  | "project:delete"
  | "settings:manageOrganization"
  | "ai:chat"
  | "ai:delete";

const ROLE_RANK: Record<Role, number> = {
  Viewer: 0,
  Member: 1,
  Admin: 2,
  Owner: 3,
};

/**
 * Minimum role required for each action. `can()` checks the requester's
 * role rank against this table — the only place authorization rules live.
 */
const REQUIREMENTS: Record<Action, Role> = {
  "org:manageBilling": "Owner",
  "org:delete": "Owner",
  "org:manageMembers": "Admin",
  "incident:create": "Member",
  "incident:edit": "Member",
  "incident:delete": "Admin",
  "incident:assign": "Member",
  "incident:comment": "Member",
  "alert:create": "Member",
  "alert:edit": "Member",
  "alert:delete": "Admin",
  "alert:assign": "Member",
  "alert:acknowledge": "Member",
  "alert:resolve": "Member",
  "project:create": "Admin",
  "project:edit": "Admin",
  "project:delete": "Admin",
  "settings:manageOrganization": "Admin",
  "ai:chat": "Member",
  "ai:delete": "Member",
};

/**
 * Authoritative authorization check. Called both from UI (to hide actions)
 * and — the actual security boundary — from every server action and
 * repository mutation. Never trust a client-side-only check.
 */
export function can(role: Role, action: Action): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[REQUIREMENTS[action]];
}

/**
 * Throws if the role doesn't satisfy the action. Use in server actions to
 * fail fast with a consistent error before touching the database.
 */
export function assertCan(role: Role, action: Action): void {
  if (!can(role, action)) {
    throw new Error(`Forbidden: role "${role}" cannot perform "${action}".`);
  }
}

/** Maps the Prisma enum's UPPER_CASE role to the app-facing `Role` type. */
export function normalizeRole(prismaRole: string): Role {
  const map: Record<string, Role> = {
    OWNER: "Owner",
    ADMIN: "Admin",
    MEMBER: "Member",
    VIEWER: "Viewer",
  };
  return map[prismaRole] ?? "Viewer";
}

export function denormalizeRole(role: Role): "OWNER" | "ADMIN" | "MEMBER" | "VIEWER" {
  const map: Record<Role, "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"> = {
    Owner: "OWNER",
    Admin: "ADMIN",
    Member: "MEMBER",
    Viewer: "VIEWER",
  };
  return map[role];
}
