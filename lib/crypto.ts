/**
 * lib/crypto.ts
 * AES-256-GCM encryption/decryption for API keys.
 * Uses JWT_SECRET as the master encryption key derivation source.
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getDerivedKey(): Buffer {
  // Derive a 32-byte key from JWT_SECRET using SHA-256
  const secret = process.env.JWT_SECRET || "sentil-fallback-key-2026";
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptApiKey(plainText: string): {
  encrypted: string;
  iv: string;
  authTag: string;
} {
  const key = getDerivedKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return {
    encrypted,
    iv: iv.toString("hex"),
    authTag,
  };
}

export function decryptApiKey(
  encrypted: string,
  iv: string,
  authTag: string
): string {
  const key = getDerivedKey();
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Mask an API key for display: show first 8 and last 4 chars
 */
export function maskApiKey(key: string): string {
  if (key.length <= 12) return "••••••••";
  return key.slice(0, 8) + "••••••••" + key.slice(-4);
}
