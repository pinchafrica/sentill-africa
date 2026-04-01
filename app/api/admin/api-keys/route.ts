/**
 * app/api/admin/api-keys/route.ts
 * Admin-only CRUD for encrypted API keys.
 * GET  → list all keys (masked)
 * POST → create or update a key (encrypts before storing)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptApiKey, decryptApiKey, maskApiKey } from "@/lib/crypto";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    orderBy: { service: "asc" },
  });

  // Return masked keys for display
  const masked = keys.map((k) => {
    let decrypted = "";
    try {
      decrypted = decryptApiKey(k.encryptedKey, k.iv, k.authTag);
    } catch {
      decrypted = "";
    }
    return {
      id: k.id,
      service: k.service,
      label: k.label,
      maskedKey: decrypted ? maskApiKey(decrypted) : "⚠️ Decryption failed",
      isActive: k.isActive,
      lastRotated: k.lastRotated,
      updatedAt: k.updatedAt,
    };
  });

  return NextResponse.json({ keys: masked });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { service, label, apiKey, isActive } = await req.json();

  if (!service || !apiKey) {
    return NextResponse.json(
      { error: "service and apiKey are required" },
      { status: 400 }
    );
  }

  // Encrypt the key
  const { encrypted, iv, authTag } = encryptApiKey(apiKey);

  // Upsert — update if service exists, create if not
  const result = await prisma.apiKey.upsert({
    where: { service: service.toUpperCase() },
    create: {
      service: service.toUpperCase(),
      label: label || service,
      encryptedKey: encrypted,
      iv,
      authTag,
      isActive: isActive ?? true,
      lastRotated: new Date(),
    },
    update: {
      label: label || undefined,
      encryptedKey: encrypted,
      iv,
      authTag,
      isActive: isActive ?? true,
      lastRotated: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    service: result.service,
    maskedKey: maskApiKey(apiKey),
    message: `${result.service} API key encrypted & stored securely.`,
  });
}
