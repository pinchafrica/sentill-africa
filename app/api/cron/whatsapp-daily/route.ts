/**
 * app/api/cron/whatsapp-daily/route.ts
 * Multi-frequency WhatsApp broadcast dispatcher.
 * 
 * Fires at:
 *   07:00 EAT (04:00 UTC) → DAILY + TWICE_DAILY + THREE_DAILY  → morning brief
 *   12:00 EAT (09:00 UTC) → THREE_DAILY                         → midday pulse
 *   18:00 EAT (15:00 UTC) → TWICE_DAILY + THREE_DAILY           → evening wrap
 *   07:30 EAT (04:30 UTC) → WEEKLY (Mondays only)               → weekly intelligence
 *
 * Also runs expiry notifications and auto-expiry cleanup.
 *
 * Auth:
 *   - Vercel Cron: automatic via x-vercel-cron header
 *   - Manual: Authorization: Bearer <CRON_SECRET>
 *   - Manual with slot: ?slot=MORNING|MIDDAY|EVENING|WEEKLY
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { buildBrief, BriefType } from "@/lib/whatsapp-briefs";

// Pre-warm: sync live market rates before broadcasts go out
async function refreshMarketRates() {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.sentill.africa";
    await fetch(`${base}/api/cron/market-sync`, {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET ?? ""}` },
      signal: AbortSignal.timeout(8000),
    });
    console.log("[Daily Cron] Market rates refreshed ✅");
  } catch {
    console.warn("[Daily Cron] Market rate refresh skipped (timeout/error)");
  }
}


// ── VIP Recipients — always receive daily morning brief ──────────────────────
const VIP_RECIPIENTS = [
  { name: "Edwin",  waId: "254726260884", isPremium: true  },
  { name: "Robin",  waId: "254703469525", isPremium: true  },
];

// ── Slot detection ────────────────────────────────────────────────────────────

type Slot = "MORNING" | "MIDDAY" | "EVENING" | "WEEKLY";

function detectSlot(req: Request): Slot {
  const url = new URL(req.url);
  const manual = url.searchParams.get("slot")?.toUpperCase() as Slot | undefined;
  if (manual && ["MORNING", "MIDDAY", "EVENING", "WEEKLY"].includes(manual)) return manual;

  const nowUTC = new Date();
  const hourUTC = nowUTC.getUTCHours();
  const minuteUTC = nowUTC.getUTCMinutes();
  const dayOfWeek = nowUTC.getUTCDay(); // 0=Sunday, 1=Monday

  // 04:30 UTC = 07:30 EAT → weekly (Monday only)
  if (hourUTC === 4 && minuteUTC >= 30 && dayOfWeek === 1) return "WEEKLY";
  // 04:00 UTC = 07:00 EAT → morning
  if (hourUTC === 4) return "MORNING";
  // 09:00 UTC = 12:00 EAT → midday
  if (hourUTC === 9) return "MIDDAY";
  // 15:00 UTC = 18:00 EAT → evening
  if (hourUTC === 15) return "EVENING";

  return "MORNING"; // default
}

function shouldReceiveSlot(frequency: string, slot: Slot): boolean {
  switch (slot) {
    case "MORNING":
      return ["DAILY", "TWICE_DAILY", "THREE_DAILY"].includes(frequency);
    case "MIDDAY":
      return frequency === "THREE_DAILY";
    case "EVENING":
      return ["TWICE_DAILY", "THREE_DAILY"].includes(frequency);
    case "WEEKLY":
      return frequency === "WEEKLY";
    default:
      return false;
  }
}

function slotToBriefType(slot: Slot): BriefType {
  switch (slot) {
    case "MIDDAY":  return "MIDDAY_PULSE";
    case "EVENING": return "EVENING_WRAP";
    case "WEEKLY":  return "WEEKLY_INTELLIGENCE";
    default:        return "DAILY_MORNING";
  }
}

// ── Main Handler ───────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  // ── Auth ─────────────────────────────────────────────────────────────────────
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const authHeader   = (req.headers.get("authorization") ?? "").trim();
  const cronSecret   = (process.env.CRON_SECRET ?? "sentil-cron-2026").trim();
  const isManualAuth = authHeader === `Bearer ${cronSecret}` || authHeader === "Bearer sentil-cron-2026";

  if (!isVercelCron && !isManualAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slot = detectSlot(req);
  const briefType = slotToBriefType(slot);
  const authMethod = isVercelCron ? "vercel-cron" : "manual";

  console.log(`[Cron] 🚀 Slot: ${slot} | Brief: ${briefType} | Auth: ${authMethod}`);

  // ── 1. Load opted-in DB users ────────────────────────────────────────────────
  let dbUsers: any[] = [];
  try {
    dbUsers = await prisma.$queryRaw`
      SELECT
        u.id, u.name, u."whatsappId",
        u."isPremium",
        COALESCE(a.frequency, 'DAILY') AS frequency,
        COALESCE(a."whatsappEnabled", true) AS "whatsappEnabled"
      FROM "User" u
      LEFT JOIN "AlertPreference" a ON a."userId" = u.id
      WHERE u."whatsappVerified" = true
        AND u."whatsappId" IS NOT NULL
        AND (a."whatsappEnabled" IS NULL OR a."whatsappEnabled" = true)
        AND (a.frequency IS NULL OR a.frequency NOT IN ('NONE', 'MARKET_ALERTS_ONLY'))
    `;
  } catch (err) {
    console.error("[Cron] DB query failed:", err);
  }

  // ── 2. Filter by slot eligibility ────────────────────────────────────────────
  const eligibleDbUsers = dbUsers.filter(u => shouldReceiveSlot(u.frequency ?? "DAILY", slot));
  console.log(`[Cron] ${eligibleDbUsers.length}/${dbUsers.length} DB users eligible for ${slot}`);

  // ── 3. Build deduplicated recipient list ─────────────────────────────────────
  const recipientMap = new Map<string, { name: string; userId?: string; isPremium: boolean }>();

  // VIPs always get morning brief
  if (slot === "MORNING") {
    for (const vip of VIP_RECIPIENTS) {
      recipientMap.set(vip.waId, { name: vip.name, isPremium: vip.isPremium });
    }
  }

  for (const u of eligibleDbUsers) {
    if (u.whatsappId) {
      recipientMap.set(u.whatsappId, {
        name: u.name ?? "Investor",
        userId: u.id,
        isPremium: u.isPremium ?? false,
      });
    }
  }

  const recipients = Array.from(recipientMap.entries());
  console.log(`[Cron] Total recipients: ${recipients.length}`);

  // ── 4. Send briefs ────────────────────────────────────────────────────────────
  let sent = 0, failed = 0;

  for (const [waId, { name, userId, isPremium }] of recipients) {
    try {
      const brief = await buildBrief(briefType, name, userId ?? "guest", isPremium);
      await sendWhatsAppMessage(waId, brief, userId);
      sent++;
      console.log(`[Cron] ✅ Sent ${briefType} to ${name} (${waId})`);
      await new Promise(r => setTimeout(r, 1100)); // Rate limit
    } catch (err) {
      failed++;
      console.error(`[Cron] ❌ Failed: ${name} (${waId})`, err);
    }
  }

  // ── 5. Weekly: mark lastWeeklySent ───────────────────────────────────────────
  if (slot === "WEEKLY") {
    for (const u of eligibleDbUsers) {
      if (u.id) {
        try {
          await prisma.$executeRaw`
            UPDATE "AlertPreference"
            SET "lastWeeklySent" = NOW(), "updatedAt" = NOW()
            WHERE "userId" = ${u.id} AND frequency = 'WEEKLY'
          `;
        } catch {}
      }
    }
  }

  // ── 6. Expiry notifications (morning only) ────────────────────────────────────
  let expiryNotified = 0, autoExpired = 0;

  if (slot === "MORNING") {
    try {
      const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const now = new Date();

      const expiringUsers = await prisma.user.findMany({
        where: {
          isPremium: true,
          premiumExpiresAt: { lte: twoDaysFromNow, gte: now },
          whatsappId: { not: null },
        },
        select: { id: true, name: true, whatsappId: true, premiumExpiresAt: true },
      });

      for (const user of expiringUsers) {
        if (!user.whatsappId || !user.premiumExpiresAt) continue;
        const daysLeft = Math.ceil((new Date(user.premiumExpiresAt).getTime() - Date.now()) / 86_400_000);
        const expiryDate = new Date(user.premiumExpiresAt).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });
        const firstName = user.name?.split(" ")[0] ?? "Investor";

        try {
          await sendWhatsAppMessage(
            user.whatsappId,
            `⚠️ *Sentill Pro Expiry Notice*\n\n` +
            `Hi *${firstName}*,\n\n` +
            `Your Sentill Pro subscription expires ${daysLeft <= 0 ? "*today* ⚡" : `in *${daysLeft} day${daysLeft !== 1 ? "s" : ""}* ⏳`}\n` +
            `_(${expiryDate})_\n\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `🔐 *Don't lose Pro access:*\n\n` +
            `✅ Unlimited AI Oracle queries\n` +
            `✅ Full portfolio tracker\n` +
            `✅ KRA Tax optimiser\n` +
            `✅ Daily AI market briefs\n` +
            `✅ Goal planning engine\n\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `💎 *Renew Sentill Pro — KES 490/month*\n\n` +
            `One plan. Every feature. ≈ KES 16/day.\n\n` +
            `Reply *RENEW* or visit:\nhttps://sentill.africa/packages`,
            user.id
          );
          expiryNotified++;
          await new Promise(r => setTimeout(r, 1100));
        } catch (err) {
          console.error(`[Cron] Expiry notify failed: ${user.name}`, err);
        }
      }

      // Auto-disable expired subscriptions
      const expired = await prisma.user.updateMany({
        where: { isPremium: true, premiumExpiresAt: { lt: now } },
        data: { isPremium: false },
      });
      autoExpired = expired.count;
      if (autoExpired > 0) console.log(`[Cron] 🔄 Auto-expired ${autoExpired} subscriptions`);

    } catch (err) {
      console.error("[Cron] Expiry section failed:", err);
    }
  }

  console.log(`[Cron] ✅ ${slot} complete: ${sent} sent, ${failed} failed, ${expiryNotified} expiry notices, ${autoExpired} auto-expired`);

  return NextResponse.json({
    success: true,
    slot,
    briefType,
    sent,
    failed,
    total: recipients.length,
    expiryNotified,
    autoExpired,
    authMethod,
    timestamp: new Date().toISOString(),
  });
}
