/**
 * lib/api-keys.ts
 * Retrieves decrypted API keys from the database.
 * Falls back to environment variables if DB key not found.
 * This bridges the admin dashboard key management with the runtime.
 */

import { prisma } from "./prisma";
import { decryptApiKey } from "./crypto";

// In-memory cache with TTL to avoid hitting DB on every request
const cache = new Map<string, { value: string; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get an API key by service name.
 * Priority: DB encrypted key → environment variable → null
 */
export async function getApiKey(
  service: string,
  envFallback?: string
): Promise<string | null> {
  const cacheKey = service.toUpperCase();

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  // Try database
  try {
    const dbKey = await prisma.apiKey.findUnique({
      where: { service: cacheKey },
    });

    if (dbKey && dbKey.isActive) {
      const decrypted = decryptApiKey(dbKey.encryptedKey, dbKey.iv, dbKey.authTag);
      if (decrypted) {
        cache.set(cacheKey, {
          value: decrypted,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });
        return decrypted;
      }
    }
  } catch (err) {
    console.warn(`[API Keys] Failed to fetch ${service} from DB:`, err);
  }

  // Fallback to environment variable
  const envValue = envFallback || null;
  if (envValue) {
    cache.set(cacheKey, {
      value: envValue,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  }
  return envValue;
}

/**
 * Convenience: Get Gemini API key
 */
export async function getGeminiApiKey(): Promise<string | null> {
  return getApiKey("GEMINI", process.env.GEMINI_API_KEY);
}

/**
 * Clear cache for a specific service (called after key rotation)
 */
export function clearApiKeyCache(service?: string) {
  if (service) {
    cache.delete(service.toUpperCase());
  } else {
    cache.clear();
  }
}
