/**
 * app/api/cron/whatsapp-daily/route.ts
 * Daily WhatsApp broadcast — fires at 07:00 EAT (04:00 UTC).
 * Sends personalized AI portfolio briefs to:
 *  1. All opted-in verified users in the database
 *  2. VIP recipients (guaranteed daily delivery regardless of DB status)
 *
 * Auth strategy:
 *  - Vercel Cron: sends `x-vercel-cron: 1` header automatically — allowed.
 *  - Manual trigger: must supply `Authorization: Bearer <CRON_SECRET>`.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { buildDailyWhatsAppBrief } from "@/lib/whatsapp-ai";

// ── VIP Recipients ──────────────────────────────────────────────────────────
// These people ALWAYS receive daily briefs, even if not registered in the app.
// Format: { name, waId (phone number without +) }
const VIP_RECIPIENTS = [
  { name: "Edwin",  waId: "254726260884" },
  { name: "Robin",  waId: "254703469525" },
  { name: "Winnie", waId: "254712345678" },
];

export async function GET(req: Request) {
  // ── Auth: allow Vercel Cron OR manual call with correct secret ─────────────
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const authHeader   = (req.headers.get("authorization") ?? "").trim();
  const cronSecret   = (process.env.CRON_SECRET ?? "").trim();
  // Hardcoded fallback for when env var has encoding issues
  const FALLBACK_SECRET = "sentil-cron-2026";
  const isManualAuth = (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
                       authHeader === `Bearer ${FALLBACK_SECRET}`;

  if (!isVercelCron && !isManualAuth) {
    console.warn("[Cron] Unauthorized — header:", authHeader?.slice(0, 20), "env:", cronSecret?.slice(0, 10));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authMethod = isVercelCron ? "vercel-cron" : "manual-secret";
  console.log(`[Cron] WhatsApp daily broadcast starting... (auth: ${authMethod})`);

  // ── 1. Fetch opted-in users from DB ─────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let dbUsers: any[] = [];
  try {
    dbUsers = await prisma.$queryRaw`
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
    // Don't abort — still send to VIP recipients
  }

  // ── 2. Build combined recipient list (deduped by waId) ─────────────────────
  const recipientMap = new Map<string, { name: string; userId?: string }>();

  // Add VIP recipients first (guaranteed)
  for (const vip of VIP_RECIPIENTS) {
    recipientMap.set(vip.waId, { name: vip.name });
  }

  // Add DB users (may override VIP entries with userId for portfolio context)
  for (const user of dbUsers) {
    const waId: string = user.whatsappId ?? user.resolvedWaId;
    if (waId) {
      recipientMap.set(waId, { name: user.name ?? "Investor", userId: user.id });
    }
  }

  const recipients = Array.from(recipientMap.entries());
  console.log(`[Cron] Total recipients: ${recipients.length} (${VIP_RECIPIENTS.length} VIP + ${dbUsers.length} DB users, deduped)`);

  // ── 3. Send briefs ────────────────────────────────────────────────────────────
  let sent = 0;
  let failed = 0;

  for (const [waId, { name, userId }] of recipients) {
    try {
      const brief = await buildDailyWhatsAppBrief(name, userId ?? "guest");
      await sendWhatsAppMessage(waId, brief, userId);
      console.log(`[Cron] ✅ Sent to ${name} (${waId})`);
      sent++;
      // Rate limit: 60 msgs/min for Cloud API free tier
      await new Promise((r) => setTimeout(r, 1100));
    } catch (err) {
      console.error(`[Cron] ❌ Failed to send to ${name} (${waId}):`, err);
      failed++;
    }
  }

  console.log(`[Cron] WhatsApp broadcast complete: ${sent} sent, ${failed} failed out of ${recipients.length} total`);

  return NextResponse.json({
    success: true,
    sent,
    failed,
    total: recipients.length,
    vipCount: VIP_RECIPIENTS.length,
    dbUserCount: dbUsers.length,
    authMethod,
    timestamp: new Date().toISOString(),
  });
}
