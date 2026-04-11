/**
 * app/api/restore/route.ts
 * Emergency data restoration endpoint.
 * Seeds: admin user, VIP WhatsApp users, API keys, and alert preferences.
 * Protected by CRON_SECRET or hardcoded fallback.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const FALLBACK_SECRET = "sentil-cron-2026";

export async function GET(req: NextRequest) {
  // Auth check
  const authHeader = (req.headers.get("authorization") ?? "").trim();
  const cronSecret = (process.env.CRON_SECRET ?? "").trim();
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  const jwtSecret = process.env.JWT_SECRET ?? "";

  const isAuth =
    authHeader === `Bearer ${cronSecret}` ||
    authHeader === `Bearer ${FALLBACK_SECRET}` ||
    secret === FALLBACK_SECRET ||
    (jwtSecret && secret === jwtSecret);

  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  try {
    // ── 1. Admin User ──────────────────────────────────────────────────────────
    const adminPassword = await bcrypt.hash("Admin@2019", 10);
    await prisma.user.upsert({
      where: { email: "admin@sentill.africa" },
      update: { password: adminPassword, role: "ADMIN" },
      create: {
        email: "admin@sentill.africa",
        password: adminPassword,
        name: "System Admin",
        role: "ADMIN",
      },
    });
    results.push("Admin user restored");

    // ── 2. Intel User ─────────────────────────────────────────────────────────
    await prisma.user.upsert({
      where: { email: "intel@sentill.africa" },
      update: { password: adminPassword },
      create: {
        email: "intel@sentill.africa",
        password: adminPassword,
        name: "Sentill Intelligence",
        role: "USER",
      },
    });
    results.push("Intel user restored");

    // ── 3. Pilot User ─────────────────────────────────────────────────────────
    await prisma.user.upsert({
      where: { email: "pilot@sentill.africa" },
      update: {},
      create: {
        name: "Executive Pilot JD-001",
        email: "pilot@sentill.africa",
        isPremium: true,
        role: "USER",
      },
    });
    results.push("Pilot user restored");

    // ── 4. VIP WhatsApp Users (Edwin, Robin, Winnie) ──────────────────────────
    const vipUsers = [
      { name: "Edwin",  email: "edwin@sentill.africa",  phone: "254726260884" },
      { name: "Robin",  email: "robin@sentill.africa",  phone: "254703469525" },
      { name: "Winnie", email: "winnie@sentill.africa", phone: "254712345678" },
    ];

    for (const vip of vipUsers) {
      try {
        const hashedPw = await bcrypt.hash(`Sentil@${vip.name}2026`, 10);
        const user = await prisma.user.upsert({
          where: { email: vip.email },
          update: {
            whatsappId: vip.phone,
            whatsappVerified: true,
          },
          create: {
            name: vip.name,
            email: vip.email,
            password: hashedPw,
            whatsappId: vip.phone,
            whatsappVerified: true,
            isPremium: true,
            role: "USER",
          },
        });

        // Create WhatsApp session (context is String, not Json)
        await prisma.whatsAppSession.upsert({
          where: { waId: vip.phone },
          update: { userId: user.id, lastSeen: new Date() },
          create: {
            waId: vip.phone,
            state: "IDLE",
            context: "{}",
            userId: user.id,
            lastSeen: new Date(),
          },
        });

        // Create alert preference
        await prisma.alertPreference.upsert({
          where: { userId: user.id },
          update: {
            whatsappEnabled: true,
            whatsappNumber: vip.phone,
            frequency: "DAILY",
          },
          create: {
            userId: user.id,
            whatsappEnabled: true,
            whatsappNumber: vip.phone,
            frequency: "DAILY",
            watchlistAlerts: true,
            marketMoversAlerts: false,
          },
        });

        results.push(`VIP ${vip.name} restored (${vip.phone})`);
      } catch (vipErr: any) {
        results.push(`VIP ${vip.name} FAILED: ${vipErr.message}`);
      }
    }

    // ── 5. Seed API Keys from env if available ───────────────────────────────
    try {
      const { encryptApiKey } = await import("@/lib/crypto");

      const keys: Record<string, { envVar: string; label: string }> = {
        GEMINI: { envVar: "GEMINI_API_KEY", label: "Gemini AI (24/7 Bot)" },
        WHATSAPP_TOKEN: { envVar: "WHATSAPP_ACCESS_TOKEN", label: "WhatsApp Cloud API Token" },
        PAYSTACK: { envVar: "PAYSTACK_SECRET_KEY", label: "Paystack Secret Key" },
      };

      for (const [service, { envVar, label }] of Object.entries(keys)) {
        const key = process.env[envVar];
        if (key) {
          const { encrypted, iv, authTag } = encryptApiKey(key);
          await prisma.apiKey.upsert({
            where: { service },
            create: { service, label, encryptedKey: encrypted, iv, authTag, isActive: true },
            update: { encryptedKey: encrypted, iv, authTag, isActive: true, lastRotated: new Date() },
          });
          results.push(`${service} key stored`);
        }
      }
    } catch (keyErr: any) {
      results.push(`API keys error: ${keyErr.message}`);
    }

    // ── 6. Summary ──────────────────────────────────────────────────────────
    const [userCount, providerCount, sessionCount, alertCount] = await Promise.all([
      prisma.user.count(),
      prisma.provider.count(),
      prisma.whatsAppSession.count(),
      prisma.alertPreference.count(),
    ]);

    return NextResponse.json({
      success: true,
      results,
      stats: { users: userCount, providers: providerCount, sessions: sessionCount, alerts: alertCount },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message, results },
      { status: 500 }
    );
  }
}
