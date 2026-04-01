/**
 * scripts/seed-gemini-key.ts
 * One-time script to seed the Gemini API key into the encrypted vault.
 * Run: npx tsx scripts/seed-gemini-key.ts
 */

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

const ALGORITHM = "aes-256-gcm";

function getDerivedKey(): Buffer {
  const secret = process.env.JWT_SECRET || "sentil-fallback-key-2026";
  return crypto.createHash("sha256").update(secret).digest();
}

function encryptApiKey(plainText: string) {
  const key = getDerivedKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return { encrypted, iv: iv.toString("hex"), authTag };
}

async function main() {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    console.error("❌ GEMINI_API_KEY env var not set");
    process.exit(1);
  }

  console.log("🔐 Encrypting Gemini API key with AES-256-GCM...");
  const { encrypted, iv, authTag } = encryptApiKey(geminiKey);

  const result = await prisma.apiKey.upsert({
    where: { service: "GEMINI" },
    create: {
      service: "GEMINI",
      label: "Gemini AI (24/7 Bot)",
      encryptedKey: encrypted,
      iv,
      authTag,
      isActive: true,
      lastRotated: new Date(),
    },
    update: {
      encryptedKey: encrypted,
      iv,
      authTag,
      isActive: true,
      lastRotated: new Date(),
    },
  });

  console.log(`✅ Gemini API key stored in vault: ${result.id}`);
  console.log(`   Service: ${result.service}`);
  console.log(`   Encrypted length: ${encrypted.length} chars`);
  console.log(`   IV: ${iv.slice(0, 8)}...`);
  
  await prisma.$disconnect();
}

main().catch(console.error);
