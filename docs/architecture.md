# OpsPilot AI — Architecture & Design Document

---

## 1. Complete project architecture

Layered, feature-based Next.js 16 App Router monolith:

```
Presentation   → src/app/**, src/components/**, src/features/**/components
Application    → src/actions/** (server actions), src/hooks/**
Domain/Service → src/server/services/**, src/server/ai/**
Data Access    → src/server/repositories/**, prisma/**
Cross-cutting  → src/lib/** (auth, db client, logger, env, utils), src/types/**
```

Dependency rule: **presentation → application → service → repository → database.**
Nothing below a layer imports from above it. UI components never import Prisma directly — always through a repository or service called from a server action or RSC data-loader.

---

## 2. Folder structure

```
opspilot-ai/
├── .github/workflows/         # CI pipelines
├── .husky/                    # git hooks
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
├── src/
│   ├── app/
│   │   ├── (marketing)/       # public landing page
│   │   ├── (auth)/            # login, register, forgot-password
│   │   ├── (app)/             # protected app shell, all product screens
│   │   └── api/                # route handlers (auth, webhooks)
│   ├── components/
│   │   ├── ui/                 # shadcn primitives (button, card, dialog…)
│   │   ├── layout/              # sidebar, topbar, shell
│   │   └── shared/              # cross-feature composites (empty-state, data-table)
│   ├── features/
│   │   ├── incidents/
│   │   ├── alerts/
│   │   ├── analytics/
│   │   ├── ai-assistant/
│   │   └── settings/
│   │   (each: components/, hooks/, schemas.ts, types.ts)
│   ├── server/
│   │   ├── services/            # business logic, orchestration
│   │   ├── repositories/        # Prisma query layer, one per entity
│   │   └── ai/                  # provider interface + implementations
│   ├── actions/                 # "use server" mutation entry points
│   ├── lib/                      # auth.ts, db.ts, env.ts, logger.ts, utils.ts
│   ├── hooks/                    # use-media-query, use-debounce, etc.
│   └── types/                    # shared domain types
├── .env.example
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts / postcss.config.mjs
├── eslint.config.mjs
├── .prettierrc
├── package.json
└── README.md
```

---

## 3. Every file that will exist (Phase 0 scope)

```
.env.example
.eslintrc → eslint.config.mjs
.prettierrc
.prettierignore
.gitignore
.husky/pre-commit
.lintstagedrc.json
next.config.ts
tsconfig.json
tailwind.config.ts
postcss.config.mjs
components.json                      (shadcn config)
package.json
prisma/schema.prisma                 (datasource + generator only — models in Phase 1)
.github/workflows/ci.yml
src/app/layout.tsx
src/app/globals.css
src/app/(marketing)/layout.tsx
src/app/(marketing)/page.tsx         (placeholder — real landing in Phase 8)
src/app/(auth)/layout.tsx
src/app/(app)/layout.tsx             (sidebar + topbar shell)
src/app/(app)/dashboard/page.tsx     (placeholder — real dashboard in Phase 3)
src/app/not-found.tsx
src/app/error.tsx
src/components/layout/sidebar.tsx
src/components/layout/topbar.tsx
src/components/layout/app-shell.tsx
src/components/ui/button.tsx
src/components/ui/card.tsx
src/components/ui/badge.tsx
src/components/ui/skeleton.tsx
src/components/ui/avatar.tsx
src/components/ui/dropdown-menu.tsx
src/components/ui/tooltip.tsx
src/components/shared/empty-state.tsx
src/components/shared/theme-provider.tsx
src/components/shared/theme-toggle.tsx
src/lib/utils.ts
src/lib/fonts.ts
src/lib/env.ts
src/lib/constants.ts
src/types/index.ts
README.md
```

Every file above is generated in full in this phase — no stubs, no `// TODO`.

---

## 4. Routing architecture

Route groups keep URL structure clean while separating layouts:

| Group | Layout | Auth | Routes |
|---|---|---|---|
| `(marketing)` | Public nav/footer | none | `/` |
| `(auth)` | Centered card, no nav | must be signed **out** | `/login`, `/register`, `/forgot-password` |
| `(app)` | Sidebar + topbar shell | must be signed **in** | `/dashboard`, `/incidents`, `/incidents/[id]`, `/alerts`, `/analytics`, `/activity`, `/ai-assistant`, `/settings/*`, `/audit-logs` |
| `api` | — | varies | `/api/auth/[...nextauth]`, `/api/webhooks` |

Protection is enforced in `(app)/layout.tsx` via a server-side session check (redirect to `/login` if absent) — not client-side only. Middleware (`src/middleware.ts`, added Phase 2) handles the fast-path redirect before render.

---

## 5. Database ERD

```
Organization 1──* User
Organization 1──* Project
Organization 1──* AuditLog
Organization 1──* ApiKey
Project      1──* Incident
Project      1──* Alert
Incident     1──* IncidentComment
Incident     1──* IncidentTimelineEvent
Incident     1──* Attachment
Incident     1──* IncidentTag
Incident     1──1 AiAnalysis (0 or 1)
User         1──* Incident        (as assignee, nullable)
User         1──* Incident        (as creator)
User         1──* IncidentComment
```

Full field-level schema ships in **Phase 1**, alongside migrations and seed data. Phase 0 only initializes `prisma/schema.prisma` with the `datasource` and `generator` blocks so `prisma generate` and the build succeed with zero models.

---

## 6. Prisma schema (Phase 0 stub)

Phase 0 ships:
```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client-js"
}
```
Models arrive in Phase 1. This keeps `npx prisma generate` and `npm run build` green from commit one, per the "must compile before moving on" rule.

> **Prisma 7 note:** the connection URL is deliberately *not* in this
> block. Prisma 7 reads it from `prisma.config.ts` (CLI operations —
> migrate/studio/db pull) and the app builds its own `PrismaClient` with a
> driver adapter in `src/lib/db.ts` (runtime queries). See both files.

---

## 7. Feature boundaries

Each folder in `src/features/<name>/` owns:
- `components/` — feature-specific UI, never imported by other features
- `hooks/` — feature-local TanStack Query hooks
- `schemas.ts` — Zod schemas (shared between client form validation and server actions)
- `types.ts` — feature-local types not needed elsewhere

Cross-feature sharing only happens through `src/components/shared`, `src/hooks`, or `src/types` — never by importing one feature's internals from another. This is what keeps files under the 300-line ceiling and prevents circular imports as the app grows.

---

## 8. Component hierarchy

```
RootLayout (fonts, ThemeProvider, Toaster)
 └─ (app)/layout.tsx → AppShell
     ├─ Sidebar (nav items, org switcher, collapse state)
     ├─ Topbar (search, notifications, user menu, theme toggle)
     └─ page content
         └─ feature page (e.g. Incidents)
             ├─ PageHeader (title, actions)
             ├─ Filters bar
             ├─ DataTable / CardGrid  ← shared component, feature passes columns/data
             │    ├─ LoadingSkeleton state
             │    ├─ EmptyState state
             │    └─ ErrorState state
             └─ Pagination
```

`shared/` components are generic and prop-driven (e.g. `<DataTable columns={} data={} isLoading={} />`); they carry zero business logic, satisfying "never place business logic inside UI components."

---

## 9. Design system

Rejecting the generic "cream + terracotta" and "flat dark + neon" AI-default looks in favor of something grounded in the actual subject: **incident severity is the one piece of information this product needs you to see instantly, everywhere.** So severity color-coding is the signature system, not a decoration — it appears consistently in nav badges, cards, charts and timelines.

**Palette** (dark-mode-first; light mode is a token swap, not a redesign):
| Token | Hex | Use |
|---|---|---|
| `--background` | `#0B0D12` | app background (near-black, blue-shifted, not pure black) |
| `--surface` | `#12151C` | cards, panels |
| `--surface-hover` | `#181C25` | hover state |
| `--border` | `#22262F` | hairline dividers |
| `--foreground` | `#E7E9ED` | primary text |
| `--muted-foreground` | `#8B909C` | secondary text |
| `--accent` | `#5B8DEF` | primary actions, links, focus ring (cool blue — deliberately not Claude's terracotta) |
| `--sev-1` | `#F04848` | SEV1 — critical |
| `--sev-2` | `#F0A048` | SEV2 — major |
| `--sev-3` | `#F0D848` | SEV3 — minor |
| `--sev-4` | `#5B8DEF` | SEV4 — informational |
| `--success` | `#3DD68C` | resolved / healthy |

**Type**: Geist Sans for UI text, Geist Mono for incident IDs, timestamps, and log/code content — the monospace becomes a functional signal ("this is machine-generated data") rather than a decorative choice.

**Layout**: 8px base spacing scale (`4/8/12/16/24/32/48/64`), 6px radius on controls / 10px on cards (rounded but not pill-shaped — matches Linear/Stripe restraint), 1px hairline borders instead of shadows for elevation, shadows reserved only for floating layers (dropdowns, dialogs).

**Motion**: 150ms ease-out for hover/press states, 200ms for panel/dialog transitions, `prefers-reduced-motion` respected globally via a CSS media query wrapper — no motion library needed for these; Framer Motion is reserved for the landing page's orchestrated reveal (Phase 8) and any list reordering/optimistic-update transitions in the app.

**Signature element**: a live severity-colored left-border rail on incident rows/cards, plus a matching thin colored underline in the sidebar's incident-count badge — the one visual thread that ties dashboard, list, and detail views together.

---

## 10. State management strategy

- **Server state** (incidents, alerts, analytics data): TanStack Query, hydrated from RSC initial data where possible (`prefetchQuery` + `HydrationBoundary`) to avoid loading spinners on first paint.
- **Mutations**: Server Actions, called via TanStack Query's `useMutation` for optimistic updates + rollback, not raw `useState` + manual fetch.
- **Client/UI state** (sidebar collapsed, active filters, dialog open): local `useState`/`useReducer`, or `nuqs` for filter state that should live in the URL (shareable, back-button-safe).
- **Global app state** (current org, theme): React Context providers set once in `RootLayout`/`AppShell`, not a global store — the app doesn't need Redux/Zustand at this scope, and adding one would be over-engineering for a 14-module CRUD-plus-AI app.
- **Form state**: React Hook Form + Zod resolver, schema shared with the server action for a single source of truth on validation rules.

---

## 11. Authentication flow

1. User hits a protected `(app)` route → server checks session via `auth()` helper → no session → redirect `/login`.
2. `/login`: email/password (credentials provider, hashed with bcrypt) or "Continue with Google" (OAuth).
3. On success, Auth.js issues a JWT session (stateless, scalable) containing `userId`, `orgId`, `role`.
4. `/register`: creates `User` + `Organization` (if first user) in one transaction, auto-signs-in.
5. `/forgot-password`: emails a signed, time-boxed reset token (email delivery pluggable — stub logs to console in dev, real provider wired at deploy time).
6. Session refreshed on each request; `middleware.ts` (Phase 2) does the fast unauthenticated-redirect before a full render is attempted.

---

## 12. RBAC strategy

Four roles, enforced at **two layers** (never trust the client alone):
- **UI layer**: role gates hide actions the user can't perform (e.g. non-Admins don't see "Delete organization").
- **Server layer**: every server action and repository mutation re-checks role server-side against the session — the actual authorization boundary.

| Capability | Owner | Admin | Member | Viewer |
|---|---|---|---|---|
| Manage billing / delete org | ✓ | | | |
| Manage members & roles | ✓ | ✓ | | |
| Create/edit/resolve incidents | ✓ | ✓ | ✓ | |
| Comment on incidents | ✓ | ✓ | ✓ | |
| View everything | ✓ | ✓ | ✓ | ✓ |

Implemented as a single `can(action, role)` policy function in `src/lib/rbac.ts` (Phase 2) — one source of truth, not scattered `if (role === 'Admin')` checks.

---

## 13. API architecture

- **Server Actions** are the default for all mutations from within the app (create incident, add comment, update settings) — colocated, type-safe end-to-end, no separate REST client needed.
- **Route Handlers** (`src/app/api/**`) are reserved for things Server Actions can't do: Auth.js's own callback routes, and inbound webhooks (e.g. a future alerting integration posting into `/api/webhooks`).
- **No public REST/GraphQL API surface in v1** — the "API Keys" settings screen is scoped as an *outbound* capability (customers generating keys for a future public API) rather than a fully built public API, which is out of scope for this trial; documented explicitly so it isn't mistaken for an oversight.

---

## 14. Error handling strategy

- **Server actions/services**: typed `Result<T>`-style returns (`{ ok: true, data } | { ok: false, error }`) rather than throwing across the server/client boundary — lets the UI render a precise inline error instead of a generic crash.
- **Unexpected exceptions**: caught by Next's `error.tsx` boundaries at route-group level, rendering a branded error state with a retry action, not a stack trace.
- **404s**: custom `not-found.tsx`.
- **Form validation errors**: surfaced inline per-field via React Hook Form + Zod, never as a single opaque toast.
- **Mutation failures**: toast notification with the specific message from the `Result` error, plus optimistic-update rollback.

---

## 15. Logging strategy

- `src/lib/logger.ts`: a thin structured-logging wrapper (JSON in production, pretty-printed in dev) around `console`, so it can be swapped for Sentry/Axiom/Datadog later by changing one file — same pluggability principle as the AI provider.
- Every server action and service call logs `{ level, action, orgId, userId, durationMs, outcome }` — enough to reconstruct "who did what" without a dedicated APM tool wired up yet.
- Client-side errors caught by `error.tsx` are also reported through the same logger via a server action, so they land in one place.

---

## 16. Testing strategy

- **Unit** (Vitest): services, repositories (against a test DB), RBAC policy function, Zod schemas, AI provider mock — Phase 9.
- **Component** (Vitest + Testing Library): shared components (`DataTable`, `EmptyState`) and feature forms in isolation.
- **E2E** (Playwright): a focused smoke suite — sign up → create org → create incident → comment → resolve; and a separate AI-assistant flow (paste log → get mock analysis) — not exhaustive per-screen coverage, which is out of scope for a trial-sized build (see Plan doc, section 4, for that call explicitly flagged).
- Test DB via a disposable Postgres (Docker in CI, same schema via `prisma migrate deploy`).

---

## 17. CI/CD architecture

`.github/workflows/ci.yml`, on every PR and push to `main`:
```
install (npm ci, cached)
 → lint (eslint)
 → typecheck (tsc --noEmit)
 → prisma generate
 → unit + component tests (vitest)
 → build (next build)
 → e2e (playwright, against a Postgres service container) — Phase 9 once tests exist
```
Fails fast: lint/typecheck before the expensive build step. Husky + lint-staged mirror the fast checks locally pre-commit so CI red is rare, not the first line of defense.

---

## 18. Deployment strategy

- **Target**: Vercel (matches the Next.js App Router runtime model, zero-config edge/serverless split).
- **Database**: Supabase Postgres, connected via `DATABASE_URL`; migrations run via `prisma migrate deploy` as a release step (GitHub Actions job gated on CI passing), not applied ad hoc from a developer machine.
- **Environments**: `preview` deployments per PR (Vercel default) against a separate Supabase branch/DB where possible; `production` on `main` merge.
- **Secrets**: all in Vercel's environment variable store, never committed; `.env.example` documents every required key with no real values.

---

## 19. Security checklist

- [ ] All mutations re-validate authorization server-side (never trust client role checks)
- [ ] Zod validation on every server action input boundary
- [ ] Passwords hashed with bcrypt, never logged
- [ ] Session cookies `httpOnly`, `secure`, `sameSite=lax`
- [ ] CSRF handled by Auth.js's built-in protections for credential flows
- [ ] Rate limiting on `/login`, `/register`, `/forgot-password` (Phase 2)
- [ ] API keys stored hashed, never returned after creation
- [ ] SQL injection: not applicable via Prisma's parameterized queries; no raw SQL without explicit review
- [ ] Dependabot/`npm audit` in CI
- [ ] No secrets in client bundles — `src/lib/env.ts` validates and separates server-only vs public env vars at build time

---

## 20. Performance checklist

- [ ] Server Components by default; `"use client"` only where interactivity requires it
- [ ] RSC data-fetching + streaming (`loading.tsx` skeletons) over client-side waterfalls
- [ ] TanStack Query cache prevents redundant refetches across navigation
- [ ] Images via `next/image`; fonts via `next/font` (self-hosted Geist, zero layout shift)
- [ ] Route-level code splitting is automatic via App Router; heavy chart/PDF libs dynamically imported (`next/dynamic`) so they don't bloat the initial bundle
- [ ] Database: indexes on every FK and on the dashboard's hot-path composite query (Phase 1 schema)
- [ ] Pagination (cursor-based) on all list views — never unbounded `findMany`
- [ ] Lighthouse CI budget as a follow-up once the dashboard exists (Phase 3+)

---

*End of Phase 0 design document. Proceeding to generate the project foundation described in sections 1–3.*

---

## 21. Repository → Service → Server Action Pattern

OpsPilot AI implements a strict three-layer pattern for all data operations:

### Repository Layer (`src/server/repositories/`)

**Purpose:** Direct database access using Prisma. Each repository handles CRUD operations for a single entity.

**Responsibilities:**
- Execute Prisma queries (findUnique, findMany, create, update, delete)
- Handle database-specific logic (joins, where clauses, ordering)
- Return typed data using Prisma-generated types
- No business logic or validation

**Example:**
```typescript
// src/server/repositories/incident.repository.ts
export class IncidentRepository {
  async findById(id: string): Promise<Incident | null> {
    return db.incident.findUnique({
      where: { id },
      include: { project: true, createdBy: true, assignee: true },
    });
  }

  async findByProject(projectId: string, filters: IncidentFilters): Promise<Incident[]> {
    return db.incident.findMany({
      where: { projectId, ...filters },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateIncidentData): Promise<Incident> {
    return db.incident.create({ data });
  }
}
```

**Key Principles:**
- One repository per entity (IncidentRepository, AlertRepository, UserRepository)
- Methods are thin wrappers around Prisma operations
- No authorization checks (handled in service layer)
- No business rules (handled in service layer)

### Service Layer (`src/server/services/`)

**Purpose:** Business logic orchestration. Services coordinate multiple repository calls and apply business rules.

**Responsibilities:**
- Orchestrate multiple repository calls
- Apply business logic and validation
- Handle authorization checks
- Transform data for presentation
- Manage transactions when needed

**Example:**
```typescript
// src/server/services/incident.service.ts
export class IncidentService {
  async createIncident(userId: string, data: CreateIncidentInput): Promise<Incident> {
    // Business rule: User must have permission to create incidents
    const user = await this.userRepository.findById(userId);
    if (!can(user.role, 'incident:create')) {
      throw new Error('Forbidden: cannot create incidents');
    }

    // Business rule: Auto-assign based on severity
    const assigneeId = data.severity === 'SEV1' 
      ? await this.findOnCallEngineer(data.projectId)
      : null;

    // Transaction: Create incident + timeline event
    return db.$transaction(async (tx) => {
      const incident = await this.incidentRepository.create({
        ...data,
        createdById: userId,
        assigneeId,
      });

      await this.timelineRepository.create({
        incidentId: incident.id,
        label: 'Incident created',
        detail: `Severity: ${data.severity}`,
      });

      return incident;
    });
  }

  async resolveIncident(incidentId: string, userId: string): Promise<Incident> {
    const incident = await this.incidentRepository.findById(incidentId);
    
    // Business rule: Only assignee or Admin can resolve
    if (incident.assigneeId !== userId && !can(user.role, 'incident:resolve')) {
      throw new Error('Forbidden: cannot resolve this incident');
    }

    return this.incidentRepository.update(incidentId, {
      status: 'RESOLVED',
      resolvedAt: new Date(),
    });
  }
}
```

**Key Principles:**
- One service per domain (IncidentService, AlertService, AuthService)
- Methods contain business rules and validation
- Authorization checks using RBAC helpers
- Can use transactions for multi-step operations
- Returns domain objects, not Prisma types

### Server Action Layer (`src/actions/`)

**Purpose:** Entry points for client-side mutations. Server actions expose service methods to the UI with authentication and error handling.

**Responsibilities:**
- Authenticate requests using `auth()` helper
- Parse and validate input using Zod schemas
- Call service methods
- Handle errors and return typed results
- Log operations for audit trail

**Example:**
```typescript
// src/actions/incident.actions.ts
"use server";

import { auth } from "@/lib/auth";
import { incidentService } from "@/server/services/incident.service";
import { createIncidentSchema } from "@/features/incidents/schemas";
import type { Result } from "@/types";

export async function createIncident(input: CreateIncidentInput): Promise<Result<Incident>> {
  const session = await auth();

  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = createIncidentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const incident = await incidentService.createIncident(session.user.id, parsed.data);
    return { ok: true, data: incident };
  } catch (error) {
    logger.error("Failed to create incident", {
      userId: session.user.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: error instanceof Error ? error.message : "Failed to create incident" };
  }
}
```

**Key Principles:**
- All server actions use `"use server"` directive
- Authentication check at the start of every action
- Input validation using shared Zod schemas
- Typed `Result<T>` return type for error handling
- Consistent error logging
- No business logic (delegates to service layer)

### Data Flow Example

```
User clicks "Create Incident" button
  ↓
Component calls createIncident() server action
  ↓
Server action authenticates session
  ↓
Server action validates input with Zod
  ↓
Server action calls incidentService.createIncident()
  ↓
Service checks user permissions (RBAC)
  ↓
Service calls incidentRepository.create()
  ↓
Repository executes Prisma query
  ↓
Repository returns Incident entity
  ↓
Service returns Incident entity
  ↓
Server action returns Result<Incident>
  ↓
Component receives result and updates UI
```

### Benefits of This Pattern

1. **Separation of Concerns** - Each layer has a single responsibility
2. **Testability** - Each layer can be tested independently
3. **Reusability** - Services can be called from multiple actions
4. **Type Safety** - End-to-end type safety from database to UI
5. **Maintainability** - Clear boundaries make code easier to understand
6. **Scalability** - Easy to add new features without affecting existing code

---

## 22. Prisma Layer

### Schema Organization

The Prisma schema (`prisma/schema.prisma`) is organized into logical sections:

```prisma
// Enums
enum Role { OWNER, ADMIN, MEMBER, VIEWER }
enum IncidentStatus { OPEN, INVESTIGATING, IDENTIFIED, MONITORING, RESOLVED, CLOSED }
enum Severity { SEV1, SEV2, SEV3, SEV4 }
enum AlertStatus { FIRING, ACKNOWLEDGED, RESOLVED }

// Auth models (Auth.js integration)
model Organization { ... }
model User { ... }
model Account { ... }
model Session { ... }
model VerificationToken { ... }

// Domain models
model Project { ... }
model Incident { ... }
model Alert { ... }
model IncidentComment { ... }
model IncidentTimelineEvent { ... }
model Attachment { ... }
model AiAnalysis { ... }
model Notification { ... }
model ApiKey { ... }

// AI models
model AiConversation { ... }
model AiMessage { ... }
```

### Database Configuration

**Prisma 7 Configuration:**
- Connection URL in `prisma.config.ts` (CLI operations)
- Custom PrismaClient in `src/lib/db.ts` (runtime queries)
- Driver adapter for PostgreSQL (`@prisma/adapter-pg`)

**Connection Strategy:**
- `DATABASE_URL` - Pooled connection for runtime (Supabase pooler)
- `DIRECT_URL` - Non-pooled connection for Prisma CLI (migrations, studio)

### Repository Pattern Implementation

Each repository follows a consistent pattern:

```typescript
export class EntityRepository {
  async findById(id: string): Promise<Entity | null> {
    return db.entity.findUnique({ where: { id } });
  }

  async findMany(filters: EntityFilters): Promise<Entity[]> {
    return db.entity.findMany({ where: filters });
  }

  async create(data: CreateEntityData): Promise<Entity> {
    return db.entity.create({ data });
  }

  async update(id: string, data: UpdateEntityData): Promise<Entity> {
    return db.entity.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Entity> {
    return db.entity.delete({ where: { id } });
  }
}
```

### Indexing Strategy

Indexes are added to optimize common queries:

```prisma
model Incident {
  // ... fields
  
  @@index([projectId])
  @@index([assigneeId])
  @@index([status])
  @@index([severity])
  @@index([projectId, status, severity]) // Composite for dashboard
}
```

### Migration Strategy

**Development:**
```bash
npm run db:migrate  # Creates migration and applies locally
```

**Production:**
```bash
npm run db:deploy  # Applies migrations without creating new ones
```

**Seed Data:**
- `prisma/seed.ts` - Development seed data
- Creates sample organizations, users, incidents, alerts
- Useful for testing and development

### Type Safety

Prisma generates TypeScript types that are used throughout the codebase:

```typescript
import type { Incident, User, Organization } from '@prisma/client';

// Repository methods return Prisma types
async findById(id: string): Promise<Incident | null>

// Services can extend Prisma types with computed fields
type IncidentWithRelations = Incident & {
  project: Project;
  createdBy: User;
  assignee?: User;
  comments: IncidentComment[];
};
```

---

## 23. Authentication

### Auth.js Configuration

OpsPilot AI uses Auth.js v5 for authentication with the following configuration:

**File:** `src/lib/auth.ts`

```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: buildAdapter(), // Custom Prisma adapter
  session: { strategy: "jwt" }, // Stateless JWT sessions
  providers: [
    Google({ /* OAuth configuration */ }),
    Credentials({ /* Email/password */ }),
  ],
  callbacks: {
    // Embed role, orgId in JWT token
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.organizationId = user.organizationId;
      }
      return token;
    },
    // Add role, orgId to session object
    async session({ session, token }) {
      session.user.role = normalizeRole(token.role);
      session.user.organizationId = token.organizationId;
      return session;
    },
  },
});
```

### Custom Adapter

The Prisma adapter is customized to handle organization creation:

```typescript
function buildAdapter(): Adapter {
  const base = PrismaAdapter(db);
  return {
    ...base,
    async createUser(user) {
      // Create organization and user in one transaction
      return db.$transaction(async (tx) => {
        const organization = await tx.organization.create({
          data: { name: `${user.name}'s Workspace`, slug: slugify(user.name) },
        });
        return tx.user.create({
          data: {
            ...user,
            role: "OWNER",
            organizationId: organization.id,
          },
        });
      });
    },
  };
}
```

### Session Strategy

**JWT Sessions:**
- Stateless and scalable
- No database lookup per request
- Session data embedded in token (userId, role, organizationId)
- Short expiration with automatic refresh

**Session Cookies:**
- `httpOnly` - Prevents XSS attacks
- `secure` - Only sent over HTTPS
- `sameSite=lax` - CSRF protection

### Authentication Flow

1. **User visits protected route**
   - Middleware checks session via `auth()`
   - No session → redirect to `/login`

2. **User logs in**
   - Credentials provider: Verify password hash with bcrypt
   - Google provider: OAuth flow with email verification
   - On success: Create JWT token with user data

3. **Session validation**
   - Each request validates JWT signature
   - Token contains userId, role, organizationId
   - Server actions use `auth()` to get session

4. **Session refresh**
   - Automatic on each request
   - Token refreshed if expired but within grace period

### Password Security

**Hashing:**
- bcrypt with 12 salt rounds
- Implemented in `src/lib/password.ts`
- Never log or return plain text passwords

**Verification:**
```typescript
const isValid = await verifyPassword(plainPassword, hashedPassword);
```

**Password Reset:**
- Time-limited reset tokens
- Secure token generation
- Email delivery (pluggable provider)

---

## 24. RBAC (Role-Based Access Control)

### Role Hierarchy

Four roles with hierarchical permissions:

```
Owner (highest)
  ↓
Admin
  ↓
Member
  ↓
Viewer (lowest)
```

### Permission Model

**File:** `src/lib/rbac.ts`

```typescript
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
```

### Authorization Functions

**Check Permission:**
```typescript
export function can(role: Role, action: Action): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[REQUIREMENTS[action]];
}
```

**Assert Permission (throws if not allowed):**
```typescript
export function assertCan(role: Role, action: Action): void {
  if (!can(role, action)) {
    throw new Error(`Forbidden: role "${role}" cannot perform "${action}".`);
  }
}
```

### Role Normalization

Prisma uses uppercase enums (`OWNER`, `ADMIN`), app uses PascalCase (`Owner`, `Admin`):

```typescript
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
```

### Two-Layer Enforcement

**UI Layer (Client):**
```typescript
const canManageMembers = profile ? can(normalizeRole(profile.role), "org:manageMembers") : false;

{canManageMembers && (
  <Button onClick={handleInvite}>Invite Member</Button>
)}
```

**Server Layer (Server Action):**
```typescript
export async function inviteMember(input: InviteMemberInput): Promise<Result<null>> {
  const session = await auth();
  
  assertCan(session.user.role, "org:manageMembers"); // Throws if not allowed
  
  await settingsService.inviteMember(input.email, input.role, session.user.organizationId);
  return { ok: true, data: null };
}
```

### Permission Matrix

| Action | Owner | Admin | Member | Viewer |
|--------|-------|-------|--------|--------|
| Manage billing | ✓ | ✗ | ✗ | ✗ |
| Delete org | ✓ | ✗ | ✗ | ✗ |
| Manage members | ✓ | ✓ | ✗ | ✗ |
| Create incidents | ✓ | ✓ | ✓ | ✗ |
| Edit incidents | ✓ | ✓ | ✓ | ✗ |
| Delete incidents | ✓ | ✓ | ✗ | ✗ |
| Comment on incidents | ✓ | ✓ | ✓ | ✗ |
| Create alerts | ✓ | ✓ | ✓ | ✗ |
| Edit alerts | ✓ | ✓ | ✓ | ✗ |
| Delete alerts | ✓ | ✓ | ✗ | ✗ |
| Manage projects | ✓ | ✓ | ✗ | ✗ |
| AI chat | ✓ | ✓ | ✓ | ✗ |
| View all data | ✓ | ✓ | ✓ | ✓ |

---

## 25. AI Provider Abstraction

### Provider Interface

**File:** `src/server/ai/provider.interface.ts`

```typescript
export interface AIProvider {
  /**
   * Analyze incident logs and generate analysis
   */
  analyzeIncident(params: {
    incidentTitle: string;
    incidentDescription: string;
    logs: string;
    context?: string;
  }): Promise<{
    summary: string;
    rootCause: string;
    suggestedFixes: string[];
    riskAnalysis: string;
  }>;

  /**
   * Generate postmortem from incident data
   */
  generatePostmortem(params: {
    incident: IncidentData;
    timeline: TimelineEvent[];
    comments: Comment[];
  }): Promise<{
    executiveSummary: string;
    timeline: string;
    rootCause: string;
    resolution: string;
    followUpActions: string[];
  }>;

  /**
   * Chat with AI assistant
   */
  chat(params: {
    conversationHistory: Message[];
    newMessage: string;
    context?: string;
  }): Promise<{
    response: string;
    suggestedActions?: string[];
  }>;
}
```

### Provider Implementations

**Mock Provider (Development):**
```typescript
export class MockAIProvider implements AIProvider {
  async analyzeIncident(params: any) {
    return {
      summary: "Mock analysis summary",
      rootCause: "Mock root cause",
      suggestedFixes: ["Fix 1", "Fix 2"],
      riskAnalysis: "Mock risk analysis",
    };
  }
  // ... other methods
}
```

**OpenAI Provider:**
```typescript
export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async analyzeIncident(params: any) {
    const response = await this.client.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an incident analysis expert..." },
        { role: "user", content: this.buildPrompt(params) },
      ],
    });
    return this.parseResponse(response.choices[0].message.content);
  }
  // ... other methods
}
```

**Anthropic Provider:**
```typescript
export class AnthropicProvider implements AIProvider {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async analyzeIncident(params: any) {
    const response = await this.client.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4096,
      messages: [{ role: "user", content: this.buildPrompt(params) }],
    });
    return this.parseResponse(response.content[0].text);
  }
  // ... other methods
}
```

### Provider Factory

**File:** `src/server/ai/provider.factory.ts`

```typescript
export function createAIProvider(): AIProvider {
  const provider = env.AI_PROVIDER || "mock";

  switch (provider) {
    case "openai":
      if (!env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is required for OpenAI provider");
      }
      return new OpenAIProvider(env.OPENAI_API_KEY);

    case "anthropic":
      if (!env.ANTHROPIC_API_KEY) {
        throw new Error("ANTHROPIC_API_KEY is required for Anthropic provider");
      }
      return new AnthropicProvider(env.ANTHROPIC_API_KEY);

    case "mock":
    default:
      return new MockAIProvider();
  }
}

export const aiProvider = createAIProvider();
```

### AI Service

**File:** `src/server/services/ai.service.ts`

```typescript
export class AIService {
  async analyzeIncident(incidentId: string): Promise<AiAnalysis> {
    const incident = await this.incidentRepository.findById(incidentId);
    const logs = await this.logService.getIncidentLogs(incidentId);

    const analysis = await aiProvider.analyzeIncident({
      logs,
      incidentTitle: incident.title,
      incidentDescription: incident.description,
    });

    return this.aiAnalysisRepository.create({
      incidentId,
      ...analysis,
    });
  }

  async chat(conversationId: string, message: string): Promise<string> {
    const conversation = await this.conversationRepository.findById(conversationId);
    const messages = await this.messageRepository.findByConversation(conversationId);

    const response = await aiProvider.chat({
      conversationHistory: messages,
      newMessage: message,
      context: conversation.context,
    });

    await this.messageRepository.create({
      conversationId,
      role: "assistant",
      content: response.response,
    });

    return response.response;
  }
}
```

### Benefits of Abstraction

1. **Easy Provider Switching** - Change environment variable to switch providers
2. **Development Friendly** - Mock provider requires no API keys
3. **Cost Control** - Use mock for development, real AI for production
4. **Future-Proof** - Easy to add new providers (Gemini, Claude, etc.)
5. **Testing** - Mock provider enables reliable unit tests

---

## 26. React Query Data Flow

### Query Hooks

**File:** `src/features/incidents/hooks/use-incidents.ts`

```typescript
export function useIncidents(filters: IncidentFilters) {
  return useQuery({
    queryKey: ["incidents", filters],
    queryFn: () => getIncidents(filters),
    staleTime: 60_000, // 1 minute
  });
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: ["incident", id],
    queryFn: () => getIncident(id),
    enabled: !!id,
  });
}
```

### Mutation Hooks

```typescript
export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateIncidentInput) => createIncident(input),
    onSuccess: () => {
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
```

### Server-Side Hydration

**File:** `src/app/(app)/incidents/page.tsx`

```typescript
export default async function IncidentsPage() {
  // Prefetch data on server
  const queryClient = await getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["incidents"],
    queryFn: getIncidents,
  });

  // Hydrate client with server data
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <IncidentsList />
    </HydrationBoundary>
  );
}
```

### Optimistic Updates

```typescript
export function useUpdateIncidentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: IncidentStatus }) =>
      updateIncidentStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["incident", id] });

      // Snapshot previous value
      const previousIncident = queryClient.getQueryData(["incident", id]);

      // Optimistically update
      queryClient.setQueryData(["incident", id], (old: Incident) => ({
        ...old,
        status,
      }));

      return { previousIncident };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(["incident", variables.id], context.previousIncident);
    },
    onSettled: () => {
      // Refetch on success or error
      queryClient.invalidateQueries({ queryKey: ["incident", variables.id] });
    },
  });
}
```

### Data Flow Diagram

```
Component mounts
  ↓
useQuery hook checks cache
  ↓
Cache miss → fetch from server action
  ↓
Server action calls service
  ↓
Service calls repository
  ↓
Repository queries database
  ↓
Data flows back through layers
  ↓
React Query caches result
  ↓
Component renders with data
```

### Cache Invalidation Strategy

**Manual Invalidation:**
```typescript
queryClient.invalidateQueries({ queryKey: ["incidents"] });
```

**Automatic Invalidation:**
```typescript
// Invalidate after mutation
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["incidents"] });
}
```

**Stale Time:**
- Lists: 60 seconds
- Details: 5 minutes
- Dashboard: 30 seconds

### Benefits

1. **Automatic Caching** - No manual cache management
2. **Optimistic Updates** - Instant UI feedback
3. **Background Refetching** - Data stays fresh
4. **Loading States** - Built-in loading/error states
5. **Deduplication** - Prevents duplicate requests
6. **Pagination** - Built-in pagination support

---

## 27. Folder Structure Deep Dive

### `src/app/` - Routing Layer

```
src/app/
├── (marketing)/           # Public pages
│   ├── layout.tsx         # Public layout (nav, footer)
│   └── page.tsx           # Landing page
├── (auth)/                # Authentication pages
│   ├── layout.tsx         # Centered card layout
│   ├── login/
│   │   └── page.tsx       # Login page
│   ├── register/
│   │   └── page.tsx       # Registration page
│   └── forgot-password/
│       └── page.tsx       # Password reset
├── (app)/                 # Protected application
│   ├── layout.tsx         # App shell (sidebar, topbar)
│   ├── dashboard/
│   │   └── page.tsx       # Dashboard
│   ├── incidents/
│   │   ├── page.tsx       # Incident list
│   │   └── [id]/
│   │       └── page.tsx   # Incident detail
│   ├── alerts/
│   │   └── page.tsx       # Alert list
│   ├── projects/
│   │   ├── page.tsx       # Project list
│   │   └── [id]/
│   │       └── page.tsx   # Project detail
│   ├── ai-assistant/
│   │   └── page.tsx       # AI chat
│   ├── analytics/
│   │   └── page.tsx       # Analytics
│   └── settings/
│       ├── profile/
│       ├── organization/
│       ├── team/
│       ├── security/
│       └── preferences/
├── api/                   # API routes
│   └── auth/
│       └── [...nextauth]  # Auth.js callbacks
├── layout.tsx             # Root layout
├── globals.css            # Global styles
├── error.tsx              # Error boundary
└── not-found.tsx          # 404 page
```

**Purpose:**
- Route organization using Next.js App Router
- Route groups for layout separation
- Server Components by default
- Client components marked with `"use client"`

### `src/components/` - Reusable UI

```
src/components/
├── ui/                    # shadcn/ui primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ... (20+ components)
├── layout/                # Layout components
│   ├── sidebar.tsx
│   ├── topbar.tsx
│   └── app-shell.tsx
└── shared/                # Cross-feature components
    ├── empty-state.tsx
    ├── data-table.tsx
    ├── loading-skeleton.tsx
    ├── theme-provider.tsx
    └── theme-toggle.tsx
```

**Purpose:**
- Dumb, reusable UI components
- No business logic
- Prop-driven behavior
- Shared across features

### `src/features/` - Feature Modules

```
src/features/
├── incidents/
│   ├── components/
│   │   ├── incident-list.tsx
│   │   ├── incident-card.tsx
│   │   ├── incident-form.tsx
│   │   ├── incident-detail.tsx
│   │   └── incident-timeline.tsx
│   ├── hooks/
│   │   └── use-incidents.ts
│   └── schemas.ts
├── alerts/
│   ├── components/
│   │   ├── alert-list.tsx
│   │   ├── alert-card.tsx
│   │   └── alert-detail.tsx
│   ├── hooks/
│   │   └── use-alerts.ts
│   └── schemas.ts
├── projects/
│   ├── components/
│   │   ├── project-list.tsx
│   │   ├── project-card.tsx
│   │   └── project-form.tsx
│   ├── hooks/
│   │   └── use-projects.ts
│   └── schemas.ts
├── ai-conversation/
│   ├── components/
│   │   ├── chat-interface.tsx
│   │   └── message-bubble.tsx
│   ├── hooks/
│   │   └── use-ai-chat.ts
│   └── schemas.ts
└── settings/
    ├── components/
    │   ├── profile-form.tsx
    │   ├── organization-form.tsx
    │   ├── team-management.tsx
    │   ├── security-section.tsx
    │   └── preferences-form.tsx
    ├── hooks/
    │   └── use-settings.ts
    └── schemas.ts
```

**Purpose:**
- Feature-specific UI and logic
- Self-contained modules
- Components not shared across features
- Hooks for data fetching and mutations
- Zod schemas for validation

### `src/server/` - Backend Logic

```
src/server/
├── services/
│   ├── incident.service.ts
│   ├── alert.service.ts
│   ├── project.service.ts
│   ├── ai.service.ts
│   ├── auth.service.ts
│   └── settings.service.ts
├── repositories/
│   ├── incident.repository.ts
│   ├── alert.repository.ts
│   ├── project.repository.ts
│   ├── user.repository.ts
│   └── settings.repository.ts
└── ai/
    ├── provider.interface.ts
    ├── provider.factory.ts
    ├── mock-provider.ts
    ├── openai-provider.ts
    └── anthropic-provider.ts
```

**Purpose:**
- Business logic (services)
- Data access (repositories)
- AI provider implementations
- No UI code
- Testable in isolation

### `src/actions/` - Server Actions

```
src/actions/
├── incident.actions.ts
├── alert.actions.ts
├── project.actions.ts
├── ai-conversation.actions.ts
├── auth.actions.ts
└── settings.actions.ts
```

**Purpose:**
- Entry points for client mutations
- Authentication and authorization
- Input validation
- Error handling
- Logging

### `src/lib/` - Utilities

```
src/lib/
├── auth.ts                # Auth.js configuration
├── auth.config.ts         # Auth.js config
├── db.ts                  # Prisma client
├── password.ts           # Password hashing
├── rbac.ts               # Authorization logic
├── logger.ts             # Logging utility
├── env.ts                # Environment variables
├── constants.ts          # App constants
├── utils.ts              # Utility functions
├── tokens.ts             # Token utilities
└── fonts.ts              # Font configuration
```

**Purpose:**
- Cross-cutting concerns
- Shared utilities
- Configuration
- No feature-specific code

### `src/hooks/` - Shared Hooks

```
src/hooks/
├── use-media-query.ts
├── use-debounce.ts
└── use-local-storage.ts
```

**Purpose:**
- Generic React hooks
- Shared across features
- Not tied to specific data

### `src/types/` - Shared Types

```
src/types/
└── index.ts
```

**Purpose:**
- Shared TypeScript types
- Used across multiple features
- Domain types not in Prisma

---

## 28. Summary

OpsPilot AI's architecture is designed for:

- **Maintainability** - Clear layer separation and consistent patterns
- **Scalability** - Feature-based organization and modular design
- **Type Safety** - End-to-end TypeScript with Prisma
- **Performance** - Server Components, caching, and efficient queries
- **Security** - RBAC, authentication, and authorization at every layer
- **Developer Experience** - Modern tooling and clear documentation

The architecture supports the current feature set while providing a solid foundation for future enhancements.
