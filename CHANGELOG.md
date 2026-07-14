# Changelog

All notable changes to OpsPilot AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Authentication Module
- Email/password authentication with bcrypt password hashing
- Google OAuth integration
- JWT session management with stateless tokens
- Custom Prisma adapter for automatic organization creation on signup
- Password reset flow with time-limited tokens
- Session management with secure cookies (httpOnly, secure, sameSite=lax)

#### User Management Module
- User profile management (name, email, avatar)
- Organization creation and management
- Role-based access control (RBAC) with four tiers: Owner, Admin, Member, Viewer
- Team member invitation and role assignment
- User preferences (theme, timezone, date format, notifications)
- Session management with device tracking
- "Logout all devices" functionality

#### Dashboard Module
- High-level incident overview with severity distribution
- Active incidents summary
- Recent activity feed
- Performance metrics (MTTR, incident volume trends)
- Quick actions for incident creation

#### Incidents Module
- Full incident lifecycle management (create, investigate, resolve, close)
- Incident severity classification (SEV1-SEV4)
- Incident status tracking (Open, Investigating, Identified, Monitoring, Resolved, Closed)
- Timeline events for incident history
- Comment system for collaboration
- Incident assignment and reassignment
- Project-based incident organization
- Incident filtering and search

#### Alerts Module
- Alert aggregation from multiple sources
- Alert severity tracking
- Alert status management (Firing, Acknowledged, Resolved)
- Alert-to-incident conversion
- Alert acknowledgment workflow
- Alert history and resolution tracking

#### Projects Module
- Project creation and management
- Project-based organization of incidents and alerts
- Project member assignment
- Project settings and configuration

#### AI Assistant Module
- AI-powered incident analysis
- Root cause detection and suggestion
- Chat interface for AI interaction
- Conversation history management
- AI provider abstraction (Mock, OpenAI, Anthropic)
- Context-aware AI responses
- Suggested actions from AI analysis

#### Analytics Module
- Performance metrics dashboard
- MTTR (Mean Time To Resolve) tracking
- Incident volume trends
- Severity distribution analysis
- Team performance metrics
- Time-based filtering and date ranges

#### Settings Module
- Profile settings (name, email, avatar)
- Organization settings (name, slug, billing)
- Team management (invite, remove, role assignment)
- Security settings (password change, session management, OAuth providers)
- User preferences (theme, timezone, date format, notifications)
- API key management (outbound capability)

#### Architecture & Infrastructure
- Repository → Service → Server Action pattern
- Prisma 7 with PostgreSQL driver adapter
- Custom PrismaClient configuration
- Database schema with comprehensive models
- Migration strategy for schema versioning
- Seed data for development
- Type-safe database access
- Comprehensive RBAC system with two-layer enforcement
- AI provider abstraction layer
- React Query integration for server state management
- Server Components by default with selective client components
- Feature-based folder organization
- Shared UI component library (shadcn/ui)
- Theme system with dark/light mode support
- Responsive design for desktop and tablet

### Changed

#### Settings Module Production Implementation
- Replaced placeholder password handling with proper bcrypt hashing and verification
- Replaced hardcoded RBAC flags with actual permission checks using `can()` and `assertCan()` helpers
- Integrated theme preference with global ThemeProvider for real-time theme switching
- Added timezone and date format preferences with `formatDateWithPreferences()` utility
- Applied user preferences to all date displays in Settings pages
- Updated "Logout all devices" to reflect JWT session strategy limitation
- Removed placeholder logic from inviteMember (documented as direct user creation for production)

### Security

- Password hashing with bcrypt (12 rounds)
- JWT session tokens with secure cookies
- RBAC enforcement at both UI and server layers
- Input validation with Zod schemas on all server actions
- SQL injection prevention via Prisma parameterized queries
- CSRF protection via Auth.js built-in mechanisms
- httpOnly, secure, sameSite=lax session cookies

### Performance

- Server Components for improved initial load performance
- React Query caching to prevent redundant data fetches
- Database indexes on foreign keys and composite queries
- Optimistic updates for instant UI feedback
- Code splitting via Next.js App Router
- Efficient Prisma queries with proper includes and selects

### Developer Experience

- TypeScript strict mode for type safety
- ESLint and Prettier configuration
- Husky pre-commit hooks with lint-staged
- Comprehensive architecture documentation
- Clear separation of concerns across layers
- Consistent patterns for features
- Shared utilities and components

## [0.1.0] - Initial Release

### Added

- Project foundation with Next.js 16, React 19, TypeScript
- Prisma 7 integration with PostgreSQL
- Auth.js v5 authentication setup
- shadcn/ui component library
- Tailwind CSS v4 styling
- TanStack Query for state management
- React Hook Form + Zod for form validation
- Basic project structure and configuration
- CI/CD pipeline with GitHub Actions
- Development tooling (Vitest, Playwright, ESLint, Prettier)
- Comprehensive documentation (README, Architecture, Case Study)

---

## Version History

| Version | Date | Notes |
|---------|------|-------|
| 0.1.0 | TBD | Initial release with core modules |
| Unreleased | TBD | Ongoing development and enhancements |

## Module Status

| Module | Status | Notes |
|--------|--------|-------|
| Authentication | ✅ Complete | Email/password + Google OAuth |
| User Management | ✅ Complete | RBAC, teams, preferences |
| Dashboard | ✅ Complete | Metrics, overview, quick actions |
| Incidents | ✅ Complete | Full lifecycle, timeline, comments |
| Alerts | ✅ Complete | Aggregation, status, acknowledgment |
| Projects | ✅ Complete | Organization, assignment, settings |
| AI Assistant | ✅ Complete | Analysis, chat, provider abstraction |
| Analytics | ✅ Complete | Metrics, MTTR, trends |
| Settings | ✅ Complete | Profile, org, team, security, preferences |

## Known Limitations

1. **JWT Session Preservation** - Due to stateless JWT strategy, "Logout all devices" cannot preserve the current session. Users must re-authenticate.
2. **Email Invitations** - Team member invitation creates users directly without email verification flow. Production deployment should implement proper email invitation system.
3. **Real-Time Updates** - Current implementation uses TanStack Query refetch-on-focus for near real-time updates. True real-time collaboration requires WebSocket integration.
4. **AI Provider** - Default mock provider returns canned responses. Production deployment requires OpenAI or Anthropic API keys.
5. **Database Migration** - Schema changes require manual migration execution. Automated migration deployment should be configured for production.

## Future Enhancements

- WebSocket integration for real-time collaboration
- Email invitation flow with verification
- Public REST/GraphQL API
- Advanced analytics with custom reports
- Mobile application (React Native)
- Integration with external monitoring tools (Datadog, PagerDuty, New Relic)
- Automated postmortem generation
- Incident response playbooks
- Slack/Teams integration for notifications
- Custom severity thresholds and escalation rules
