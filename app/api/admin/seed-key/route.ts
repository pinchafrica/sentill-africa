/**
 * app/api/admin/seed-key/route.ts
 * One-shot endpoint to seed the Gemini API key into the encrypted vault.
 * Call this once from the live server: POST /api/admin/seed-key
 * The key is encrypted using the production JWT_SECRET on the server itself.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptApiKey, maskApiKey } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Seed keys from environment variables into the encrypted vault
  const results: string[] = [];

  // 1. Gemini API Key
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    const { encrypted, iv, authTag } = encryptApiKey(geminiKey);
    await prisma.apiKey.upsert({
      where: { service: "GEMINI" },
      create: {
        service: "GEMINI",
        label: "Gemini AI (24/7 Bot)",
        encryptedKey: encrypted,
        iv,
        authTag,
        isActive: true,
      },
      update: {
        encryptedKey: encrypted,
        iv,
        authTag,
        isActive: true,
        lastRotated: new Date(),
      },
    });
    results.push(`GEMINI: ${maskApiKey(geminiKey)} ✅`);
  }

  // 2. WhatsApp Access Token
  const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (waToken) {
    const { encrypted, iv, authTag } = encryptApiKey(waToken);
    await prisma.apiKey.upsert({
      where: { service: "WHATSAPP_TOKEN" },
      create: {
        service: "WHATSAPP_TOKEN",
        label: "WhatsApp Cloud API Token",
        encryptedKey: encrypted,
        iv,
        authTag,
        isActive: true,
      },
      update: {
        encryptedKey: encrypted,
        iv,
        authTag,
        isActive: true,
        lastRotated: new Date(),
      },
    });
    results.push(`WHATSAPP_TOKEN: ${maskApiKey(waToken)} ✅`);
  }

  // 3. Paystack Secret Key
  const paystackKey = process.env.PAYSTACK_SECRET_KEY;
  if (paystackKey) {
    const { encrypted, iv, authTag } = encryptApiKey(paystackKey);
    await prisma.apiKey.upsert({
      where: { service: "PAYSTACK" },
      create: {
        service: "PAYSTACK",
        label: "Paystack Secret Key",
        encryptedKey: encrypted,
        iv,
        authTag,
        isActive: true,
      },
      update: {
        encryptedKey: encrypted,
        iv,
        authTag,
        isActive: true,
        lastRotated: new Date(),
      },
    });
    results.push(`PAYSTACK: ${maskApiKey(paystackKey)} ✅`);
  }

  return NextResponse.json({
    success: true,
    message: "API keys encrypted and stored in vault",
    seeded: results,
  });
}
