import { createHash, randomBytes } from "node:crypto";

/**
 * Generates a URL-safe random token and its SHA-256 hash.
 *
 * The raw token is emailed to the user and never stored; only the hash is
 * persisted, so a leaked database can't be used to forge valid reset/verify
 * links (same principle as password hashing, just with a fast hash since
 * the token itself already has 256 bits of entropy — no need for bcrypt's
 * deliberate slowness here).
 */
export function generateSecureToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("base64url");
  const hash = hashToken(raw);
  return { raw, hash };
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
export const EMAIL_VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
