/**
 * app/api/cron/whatsapp-daily/route.ts
 * Daily WhatsApp broadcast — fires at 07:00 EAT (04:00 UTC).
 * Sends personalized AI portfolio briefs to all opted-in users.
 *
 * Auth strategy:
 *  - Vercel Cron: sends `x-vercel-cron: 1` header automatically — allowed.
 *  - Manual trigger: must supply `Authorization: Bearer <CRON_SECRET>`.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { buildDailyWhatsAppBrief } from "@/lib/whatsapp-ai";

export async function GET(req: Request) {
  // ── Auth: allow Vercel Cron OR manual call with correct secret ─────────────
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const authHeader   = req.headers.get("authorization");
  const cronSecret   = process.env.CRON_SECRET ?? "";
  const isManualAuth = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isVercelCron && !isManualAuth) {
    console.warn("[Cron] Unauthorized call — missing Vercel cron header and wrong/missing secret.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authMethod = isVercelCron ? "vercel-cron" : "manual-secret";
  console.log(`[Cron] WhatsApp daily broadcast starting... (auth: ${authMethod})`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let users: any[] = [];
  try {
    // LEFT JOIN so users without AlertPreference still receive briefs.
    // Any user with a verified WhatsApp number gets the daily message.
    users = await prisma.$queryRaw`
      SELECT u.id, u.name, u."whatsappId",
             COALESCE(a."whatsappNumber", u."whatsappId") AS "resolvedWaId"
      FROM "User" u
      LEFT JOIN "AlertPreference" a ON a."userId" = u.id
      WHERE u."whatsappVerified" = true
        AND u."whatsappId" IS NOT NULL
        AND (a."whatsappEnabled" IS NULL OR a."whatsappEnabled" = true)
    `;
  } catch (dbErr) {
    console.error("[Cron] DB error fetching opted-in users:", dbErr);
    return NextResponse.json(
      { success: false, error: "DB unreachable", sent: 0, failed: 0, total: 0 },
      { status: 500 }
    );
  }

  console.log(`[Cron] Found ${users.length} opted-in WhatsApp users`);

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    const waId: string = user.whatsappId ?? user.resolvedWaId;
    if (!waId) { failed++; continue; }

    try {
      const brief = await buildDailyWhatsAppBrief(user.name ?? "Investor", user.id);
      await sendWhatsAppMessage(waId, brief, user.id);
      console.log(`[Cron] ✅ Sent to ${waId}`);
      sent++;
      // Rate limit: 60 msgs/min for Cloud API free tier
      await new Promise((r) => setTimeout(r, 1100));
    } catch (err) {
      console.error(`[Cron] ❌ Failed to send to ${waId}:`, err);
      failed++;
    }
  }

  console.log(`[Cron] WhatsApp broadcast complete: ${sent} sent, ${failed} failed out of ${users.length} total`);

  return NextResponse.json({
    success: true,
    sent,
    failed,
    total: users.length,
    authMethod,
    timestamp: new Date().toISOString(),
  });
}
