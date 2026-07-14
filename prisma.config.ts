import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 moved CLI-side configuration (connection URL, migrations path,
 * seed command) out of schema.prisma and package.json#prisma into this
 * file. It is only consumed by the Prisma CLI (generate/migrate/studio) —
 * the running app never imports this file; it builds its own PrismaClient
 * with a driver adapter in src/lib/db.ts.
 *
 * `url` here prefers DIRECT_URL: Supabase's pooled connection
 * (DATABASE_URL, via pgbouncer) doesn't support the prepared statements
 * and advisory locks Prisma Migrate needs. Falls back to DATABASE_URL so
 * a plain local Postgres setup (no pooler, no separate direct URL) still
 * works out of the box. The app's runtime queries always use the pooled
 * DATABASE_URL regardless (see src/lib/db.ts).
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});

