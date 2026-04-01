/**
 * app/api/admin/diagnose/route.ts
 * FULL END-TO-END diagnostic for the WhatsApp AI bot.
 * Tests: DB, Gemini API, WhatsApp sending, session state, webhook config.
 * GET /api/admin/diagnose?secret=sentil-cron-2026
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { askGeminiBot } from "@/lib/whatsapp-gemini";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== "sentil-cron-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, unknown> = {};
  const testPhone = req.nextUrl.searchParams.get("phone") || "254726260884"; // Edwin

  // ── 1. DATABASE CONNECTION ──────────────────────────────────────────────────
  try {
    const userCount = await prisma.user.count();
    const sessionCount = await prisma.whatsAppSession.count();
    results["1_database"] = { status: "✅ OK", users: userCount, sessions: sessionCount };
  } catch (err) {
    results["1_database"] = { status: "❌ FAILED", error: String(err) };
  }

  // ── 2. EDWIN'S SESSION STATE ────────────────────────────────────────────────
  try {
    const session = await prisma.whatsAppSession.findUnique({
      where: { waId: testPhone },
    });
    if (session) {
      results["2_session"] = {
        status: "✅ Found",
        waId: session.waId,
        state: session.state,
        userId: session.userId,
        context: session.context,
        lastSeen: session.lastSeen,
      };
    } else {
      results["2_session"] = { status: "⚠️ No session — user hasn't messaged bot yet" };
    }
  } catch (err) {
    results["2_session"] = { status: "❌ FAILED", error: String(err) };
  }

  // ── 3. EDWIN'S USER RECORD ──────────────────────────────────────────────────
  try {
    const user = await prisma.user.findUnique({
      where: { whatsappId: testPhone },
      select: { id: true, name: true, email: true, whatsappVerified: true, isPremium: true },
    });
    if (user) {
      results["3_user"] = { status: "✅ Found", ...user };
    } else {
      // Try finding by partial match
      const users = await prisma.user.findMany({
        where: { OR: [
          { email: { contains: "edwin", mode: "insensitive" } },
          { name: { contains: "edwin", mode: "insensitive" } },
        ]},
        select: { id: true, name: true, email: true, whatsappId: true, whatsappVerified: true },
      });
      results["3_user"] = { status: "⚠️ No user with whatsappId=" + testPhone, possibleMatches: users };
    }
  } catch (err) {
    results["3_user"] = { status: "❌ FAILED", error: String(err) };
  }

  // ── 4. GEMINI API ──────────────────────────────────────────────────────────
  try {
    const start = Date.now();
    const answer312 = await askGeminiBot("What is 2+2? Reply with just the number.", {
      name: "Test", userId: "test", isPremium: false,
    });
    const duration = Date.now() - start;
    results["4_gemini"] = { status: "✅ OK", answer: answer312.slice(0, 100), durationMs: duration };
  } catch (err) {
    results["4_gemini"] = { status: "❌ FAILED", error: String(err) };
  }

  // ── 5. WHATSAPP SEND TEST the bot ──────────────────────────────────────────
  const shouldSend = req.nextUrl.searchParams.get("send") === "true";
  if (shouldSend) {
    try {
      await sendWhatsAppMessage(testPhone,
        `✅ *Sentil Diagnostic Test*\n\nThis message confirms the bot is working.\nTimestamp: ${new Date().toISOString()}\n\nTry sending:\n• *MENU* — main menu\n• *ASK what is best MMF?* — AI question\n• Any text — AI will answer`
      );
      results["5_whatsapp_send"] = { status: "✅ sent to " + testPhone };
    } catch (err) {
      results["5_whatsapp_send"] = { status: "❌ FAILED", error: String(err) };
    }
  } else {
    results["5_whatsapp_send"] = { status: "⏭ Skipped — add &send=true to test" };
  }

  // ── 6. ENV VARS CHECK ─────────────────────────────────────────────────────
  results["6_env"] = {
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID ? "✅ Set" : "❌ Missing",
    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN ? `✅ Set (${process.env.WHATSAPP_ACCESS_TOKEN.slice(0, 10)}...)` : "❌ Missing",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? `✅ Set (${process.env.GEMINI_API_KEY.slice(0, 10)}...)` : "❌ Missing",
    WHATSAPP_APP_SECRET: process.env.WHATSAPP_APP_SECRET ? "✅ Set" : "⚠️ Empty (signatures not verified)",
    DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
    JWT_SECRET: process.env.JWT_SECRET ? "✅ Set" : "❌ Missing",
    NODE_ENV: process.env.NODE_ENV,
  };

  // ── 7. RECENT WHATSAPP LOGS ────────────────────────────────────────────────
  try {
    const logs = await prisma.whatsAppLog.findMany({
      where: { waId: testPhone },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { direction: true, message: true, status: true, createdAt: true },
    });
    results["7_recent_logs"] = { count: logs.length, logs: logs.map(l => ({
      dir: l.direction,
      msg: l.message.slice(0, 80),
      status: l.status,
      at: l.createdAt,
    }))};
  } catch (err) {
    results["7_recent_logs"] = { status: "❌ FAILED", error: String(err) };
  }

  return NextResponse.json(results, { status: 200 });
}
