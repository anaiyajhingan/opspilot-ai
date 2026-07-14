import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { env } from "@/lib/env";

/**
 * Prisma 7 requires a driver adapter for every connection — there's no
 * more built-in Rust query engine. `@prisma/adapter-pg` + `pg` is the
 * standard combo for Postgres (see docs/architecture.md section 5).
 *
 * Uses DATABASE_URL (the pooled/pgbouncer connection) — the CLI's own
 * connection for migrations is configured separately in
 * prisma.config.ts and prefers DIRECT_URL instead.
 */
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

/**
 * Prisma client singleton. In dev, Next.js hot-reloads modules, which would
 * otherwise spawn a new PrismaClient (and a new connection pool) on every
 * edit — stash the instance on `globalThis` so it survives HMR.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
