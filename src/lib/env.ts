import { z } from "zod";

/**
 * Server-only environment variables. Importing this file from a Client
 * Component will fail the build — that's intentional, it's the guardrail
 * that keeps secrets out of the client bundle.
 */
const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  AUTH_URL: z.string().url().optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AI_PROVIDER: z.enum(["mock", "openai", "anthropic"]).default("mock"),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
});

function loadServerEnv() {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid server environment variables:\n${parsed.error.issues
        .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
        .join("\n")}`,
    );
  }
  return parsed.data;
}

function loadClientEnv() {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  });
  if (!parsed.success) {
    throw new Error(
      `Invalid client environment variables:\n${parsed.error.issues
        .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
        .join("\n")}`,
    );
  }
  return parsed.data;
}

export const env = typeof window === "undefined" ? loadServerEnv() : ({} as never);
export const clientEnv = loadClientEnv();
