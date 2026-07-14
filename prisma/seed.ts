/**
 * Database seed script — creates one demo Organization with an Owner,
 * Admin, and Member user (all pre-verified so `npm run dev` + `db:seed`
 * gives you a working sign-in immediately) plus a sample Project.
 *
 * Run with: npm run db:seed
 * Demo credentials (all users): password "password123"
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash("password123", 12);

  const organization = await prisma.organization.upsert({
    where: { slug: "demo-org" },
    update: {},
    create: { name: "Demo Org", slug: "demo-org" },
  });

  const [owner, , member] = await Promise.all([
    prisma.user.upsert({
      where: { email: "owner@opspilot.ai" },
      update: {},
      create: {
        name: "Owner Demo",
        email: "owner@opspilot.ai",
        passwordHash,
        role: "OWNER",
        emailVerified: new Date(),
        organizationId: organization.id,
      },
    }),
    prisma.user.upsert({
      where: { email: "admin@opspilot.ai" },
      update: {},
      create: {
        name: "Admin Demo",
        email: "admin@opspilot.ai",
        passwordHash,
        role: "ADMIN",
        emailVerified: new Date(),
        organizationId: organization.id,
      },
    }),
    prisma.user.upsert({
      where: { email: "member@opspilot.ai" },
      update: {},
      create: {
        name: "Member Demo",
        email: "member@opspilot.ai",
        passwordHash,
        role: "MEMBER",
        emailVerified: new Date(),
        organizationId: organization.id,
      },
    }),
  ]);

  await prisma.project.upsert({
    where: { id: "demo-project-seed-id" },
    update: {},
    create: {
      id: "demo-project-seed-id",
      name: "Core Platform",
      description: "Primary production services.",
      organizationId: organization.id,
    },
  });

  console.warn(
    `[seed] Ready. Sign in as owner@opspilot.ai / admin@opspilot.ai / member@opspilot.ai (password: password123), org "${organization.name}", created by ${owner.name} and ${member.name}.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("[seed] failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
