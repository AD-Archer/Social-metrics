import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from "crypto"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a secure token for calendar subscriptions.
 * Uses crypto.randomBytes for cryptographically strong random values.
 * @param userId - The user ID to associate with the token
 * @returns An object with the token and its expiration date (default: never expires)
 */
export function generateCalendarSubscriptionToken(userId: string) {
  // Generate a random token with 32 bytes of entropy (64 hex chars)
  const randomBytes = crypto.randomBytes(32).toString('hex');
  
  // Combine with user ID and timestamp for uniqueness
  const timestamp = Date.now();
  const rawToken = `${userId}:${timestamp}:${randomBytes}`;
  
  // Hash the token for additional security
  const hashedToken = crypto
    .createHash('sha256')
    .update(rawToken)
    .digest('hex');
  
  return {
    token: hashedToken,
    userId,
    createdAt: new Date().toISOString(),
    // No expiry by default, but could be added if needed
  };
}

/**
 * Validates a calendar subscription token format.
 * Note: This only validates the token format, not whether it exists in the database.
 * @param token - The token to validate
 * @returns Boolean indicating if the token has valid format
 */
export function isValidSubscriptionToken(token: string): boolean {
  // Check if it's a valid hex string with the expected length (SHA-256 produces 64 hex chars)
  return /^[a-f0-9]{64}$/i.test(token);
}
