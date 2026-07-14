# OpsPilot AI

AI-powered incident management platform for modern engineering teams — monitor alerts, collaborate during outages, and generate root-cause analysis and postmortems automatically.

## Project Overview

OpsPilot AI is a full-stack incident management platform that combines traditional alert monitoring with AI-powered analysis. It helps engineering teams:

- **Monitor alerts** from multiple sources in a unified dashboard
- **Collaborate during outages** with real-time incident management
- **Generate AI analysis** including root cause detection, suggested fixes, and automated postmortems
- **Track team performance** with analytics on MTTR, incident volume, and resolution trends

Built with modern web technologies and designed for scalability, OpsPilot AI follows a clean architecture pattern that separates concerns across presentation, application, service, and data access layers.

## Features

### Core Modules

- **Dashboard** - High-level overview of incident volume, severity distribution, and team performance metrics
- **Incidents** - Full incident lifecycle management (create, investigate, resolve, comment, timeline)
- **Alerts** - Alert aggregation and management with severity-based prioritization
- **Projects** - Organize incidents and alerts by project/service boundaries
- **AI Assistant** - AI-powered incident analysis with root cause detection and suggested fixes
- **Analytics** - Performance metrics, MTTR tracking, and trend analysis
- **Settings** - User preferences, organization management, team roles, and security settings

### Key Capabilities

- **Role-Based Access Control (RBAC)** - Four-tier permission system (Owner, Admin, Member, Viewer)
- **Multi-tenant Architecture** - Organization-based isolation with team collaboration
- **Real-time Collaboration** - Comments, timeline events, and assignment workflows
- **AI Provider Abstraction** - Swappable AI backends (OpenAI, Anthropic, or mock for development)
- **Theme System** - Dark-mode-first design with light mode support
- **Responsive Design** - Works across desktop and tablet viewports

## Tech Stack

### Frontend
- **Next.js 16** - App Router, Server Components, Turbopack
- **React 19** - Latest React with concurrent features
- **TypeScript** - Strict type checking across the codebase
- **Tailwind CSS v4** - Utility-first styling with custom design tokens
- **shadcn/ui** - High-quality, accessible component primitives
- **TanStack Query** - Server state management and caching
- **React Hook Form + Zod** - Form validation with shared schemas
- **Recharts** - Data visualization and analytics charts
- **Framer Motion** - Smooth animations and transitions

### Backend
- **Prisma 7** - Type-safe ORM with PostgreSQL driver adapter
- **Auth.js v5** - Authentication with JWT sessions and OAuth providers
- **bcryptjs** - Secure password hashing
- **Server Actions** - Type-safe mutations with Next.js

### Database
- **PostgreSQL** - Primary database (Supabase recommended)
- **Prisma Migrate** - Schema versioning and migrations

### Development Tools
- **Vitest** - Unit and component testing
- **Playwright** - End-to-end testing
- **ESLint + Prettier** - Code quality and formatting
- **Husky + lint-staged** - Git hooks and pre-commit checks
- **TypeScript Compiler** - Static type checking

## Architecture

OpsPilot AI follows a layered architecture with strict dependency rules:

```
Presentation   → src/app/**, src/components/**, src/features/**/components
Application    → src/actions/** (server actions), src/hooks/**
Domain/Service → src/server/services/**, src/server/ai/**
Data Access    → src/server/repositories/**, prisma/**
Cross-cutting  → src/lib/** (auth, db client, logger, env, utils), src/types/**
```

**Dependency rule:** Presentation → Application → Service → Repository → Database. Nothing below a layer imports from above it.

### Key Patterns

- **Repository → Service → Server Action** - Data access flows through repositories, business logic in services, exposed via server actions
- **Feature-Based Organization** - Each feature owns its components, hooks, schemas, and types
- **Server Components by Default** - Client components only where interactivity requires it
- **Shared UI Components** - Generic, prop-driven components in `src/components/shared`
- **RBAC Enforcement** - Two-layer authorization (UI gates + server-side checks)

For detailed architecture documentation, see [`docs/architecture.md`](./docs/architecture.md).

## Installation

### Prerequisites

- Node.js >= 20.9.0
- PostgreSQL database (Supabase recommended)
- Git

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd opspilot-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration (see [Environment Variables](#environment-variables) below).

4. **Generate Prisma client**
```bash
npx prisma generate
```

5. **Run database migrations**
```bash
npm run db:migrate
```

6. **Seed the database (optional)**
```bash
npm run db:seed
```

7. **Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Required variables are documented in [`.env.example`](./.env.example):

### Database
- `DATABASE_URL` - PostgreSQL connection URL (pooled connection for runtime)
- `DIRECT_URL` - PostgreSQL connection URL (non-pooled for Prisma CLI operations)

### Authentication
- `AUTH_SECRET` - Secret key for JWT token signing
- `AUTH_GOOGLE_ID` - Google OAuth client ID (optional)
- `AUTH_GOOGLE_SECRET` - Google OAuth client secret (optional)

### AI Provider
- `AI_PROVIDER` - AI provider to use: `mock` (default), `openai`, or `anthropic`
- `OPENAI_API_KEY` - OpenAI API key (if using OpenAI provider)
- `ANTHROPIC_API_KEY` - Anthropic API key (if using Anthropic provider)

### Application
- `NEXT_PUBLIC_APP_URL` - Public URL of the application (for OAuth callbacks)

## Database Setup

### PostgreSQL Configuration

The application uses PostgreSQL with Prisma ORM. Recommended setup:

1. **Create a Supabase project** (recommended) or set up a local PostgreSQL instance
2. **Add connection strings** to `.env`:
   - `DATABASE_URL` - Use the pooled connection string from Supabase
   - `DIRECT_URL` - Use the direct connection string (non-pooled) for migrations

### Running Migrations

```bash
# Development migration
npm run db:migrate

# Production deployment
npm run db:deploy
```

### Database Studio

```bash
npm run db:studio
```

Opens Prisma Studio for visual database inspection.

## Authentication Setup

### Supported Providers

1. **Credentials (Email/Password)** - Built-in with bcrypt password hashing
2. **Google OAuth** - Optional, requires Google OAuth credentials

### Configuration

For email/password authentication (default):
- No additional configuration needed
- Passwords are hashed with bcrypt (12 rounds)
- Email verification flow included

For Google OAuth:
1. Create OAuth 2.0 credentials in Google Cloud Console
2. Add authorized redirect URI: `https://your-domain.com/api/auth/callback/google`
3. Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in environment

### Session Strategy

- **JWT sessions** - Stateless, scalable session tokens
- **Session cookies** - httpOnly, secure, sameSite=lax
- **Token refresh** - Automatic on each request

## AI Provider Configuration

### Provider Options

The AI Assistant supports multiple providers via a unified interface:

#### Mock Provider (Default)
- No API key required
- Returns canned responses for development
- Set `AI_PROVIDER=mock` (or omit, it's the default)

#### OpenAI
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```
- Supports GPT-4 and GPT-3.5 models
- Requires valid OpenAI API key

#### Anthropic
```env
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```
- Supports Claude models
- Requires valid Anthropic API key

### Provider Interface

The AI provider is abstracted behind `src/server/ai/provider.interface.ts`, allowing:
- Easy switching between providers via environment variable
- Consistent API regardless of backend
- Future provider additions without code changes

## Folder Structure

```
opspilot-ai/
├── .github/workflows/         # CI pipelines
├── .husky/                    # Git hooks
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Seed data
│   └── migrations/            # Database migrations
├── public/                    # Static assets
├── src/
│   ├── app/
│   │   ├── (marketing)/       # Public landing page
│   │   ├── (auth)/            # Login, register, forgot-password
│   │   ├── (app)/             # Protected app shell
│   │   │   ├── dashboard/     # Dashboard module
│   │   │   ├── incidents/     # Incident management
│   │   │   ├── alerts/        # Alert management
│   │   │   ├── projects/      # Project management
│   │   │   ├── ai-assistant/  # AI chat interface
│   │   │   ├── analytics/     # Analytics and reports
│   │   │   └── settings/      # User/org settings
│   │   ├── api/               # API route handlers
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives
│   │   ├── layout/            # Sidebar, topbar, shell
│   │   └── shared/            # Cross-feature components
│   ├── features/
│   │   ├── incidents/         # Incident feature module
│   │   ├── alerts/            # Alert feature module
│   │   ├── projects/          # Project feature module
│   │   ├── ai-conversation/   # AI conversation module
│   │   └── settings/          # Settings feature module
│   ├── server/
│   │   ├── services/          # Business logic layer
│   │   ├── repositories/      # Data access layer
│   │   └── ai/                # AI provider implementations
│   ├── actions/               # Server actions
│   ├── lib/                   # Utilities (auth, db, logger, etc.)
│   ├── hooks/                 # Shared React hooks
│   └── types/                 # Shared TypeScript types
├── docs/
│   ├── architecture.md        # Architecture documentation
│   └── case-study.md          # Case study
├── .env.example              # Environment variable template
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── eslint.config.mjs          # ESLint configuration
├── prisma.config.ts           # Prisma CLI configuration
└── package.json               # Dependencies and scripts
```

## Deployment Instructions

### Vercel (Recommended)

1. **Push code to GitHub**
2. **Import project in Vercel**
3. **Configure environment variables** in Vercel dashboard
4. **Deploy** - Vercel handles build and deployment automatically

### Environment Setup for Production

1. **Database**
   - Use Supabase or managed PostgreSQL
   - Run migrations: `npm run db:deploy`
   - Set `DATABASE_URL` and `DIRECT_URL`

2. **Authentication**
   - Generate secure `AUTH_SECRET` (use `openssl rand -base64 32`)
   - Configure OAuth providers if needed

3. **AI Provider**
   - Set `AI_PROVIDER` to desired backend
   - Add API keys for OpenAI or Anthropic

### Build Process

```bash
# Production build
npm run build

# Start production server
npm start
```

### CI/CD

The project includes GitHub Actions workflow (`.github/workflows/ci.yml`) that:
- Runs linting and type checking
- Executes unit and E2E tests
- Builds the application
- Deploys on successful CI

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Production build with Prisma generation |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run typecheck` | Run TypeScript compiler check |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm test` | Run unit tests with Vitest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run E2E tests with Playwright |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run development migrations |
| `npm run db:deploy` | Run production migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |

## Screenshots

*[Screenshot placeholders will be added in future documentation updates]*

- Dashboard overview with incident metrics
- Incident detail view with timeline
- Alert management interface
- AI Assistant chat interface
- Analytics dashboard with charts
- Settings pages

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for contribution guidelines.

## License

MIT — see [`LICENSE`](./LICENSE).

## Documentation

- [`docs/architecture.md`](./docs/architecture.md) - Detailed architecture documentation
- [`docs/case-study.md`](./docs/case-study.md) - Project case study
- [`CHANGELOG.md`](./CHANGELOG.md) - Version history and changes
