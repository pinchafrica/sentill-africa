/**
 * app/api/cron/whatsapp-daily/route.ts
 * Daily WhatsApp broadcast — fires at 07:00 EAT (04:00 UTC).
 * Sends personalized AI portfolio briefs to all opted-in users.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { buildDailyWhatsAppBrief } from "@/lib/whatsapp-ai";

// Vercel Cron or internal call — protected by CRON_SECRET
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET ?? "";

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[Cron] WhatsApp daily broadcast starting...");

  // Query users that have WhatsApp alerts enabled via raw join
  // (whatsappId and whatsappVerified are new fields pending migration)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users: any[] = await prisma.$queryRaw`
    SELECT u.id, u.name, u."whatsappId", u."whatsappVerified",
           a."whatsappEnabled", a."whatsappNumber"
    FROM "User" u
    JOIN "AlertPreference" a ON a."userId" = u.id
    WHERE a."whatsappEnabled" = true
      AND (u."whatsappId" IS NOT NULL OR a."whatsappNumber" IS NOT NULL)
      AND u."whatsappVerified" = true
  `;

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    const waId: string = user.whatsappId ?? user.whatsappNumber;
    if (!waId) continue;

    try {
      const brief = await buildDailyWhatsAppBrief(user.name, user.id);
      await sendWhatsAppMessage(waId, brief, user.id);
      sent++;
      // Rate limit: 60 msgs/min for Cloud API free tier
      await new Promise((r) => setTimeout(r, 1100));
    } catch (err) {
      console.error(`[Cron] Failed to send to ${waId}:`, err);
      failed++;
    }
  }

  console.log(`[Cron] WhatsApp broadcast complete: ${sent} sent, ${failed} failed`);

  return NextResponse.json({
    success: true,
    sent,
    failed,
    total: users.length,
    timestamp: new Date().toISOString(),
  });
}
