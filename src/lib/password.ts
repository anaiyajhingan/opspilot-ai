import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password for storage. Never log or return the input.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a stored bcrypt hash.
 */
export async function verifyPassword(
  plaintext: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

/**
 * Minimum password policy, enforced both client-side (Zod schema) and here
 * as a defense-in-depth check before hashing.
 */
export function isPasswordStrongEnough(plaintext: string): boolean {
  return plaintext.length >= 8;
}
