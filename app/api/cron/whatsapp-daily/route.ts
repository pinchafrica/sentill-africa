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
 * Also runs:
 *   ✅ Expiry notifications + auto-expiry cleanup
 *   🔥 IFB/T-Bill Monday auction campaign blast
 *   💡 Cross-sell nudge: MMF holders → upgrade to IFB (Wednesdays)
 *   🔁 Win-back: re-engage users silent 7d+ (evenings)
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
import { getUpcomingDividends, formatDividendAlert, daysUntilClosure } from "@/lib/dividend-calendar";

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

type Slot = "MORNING" | "MIDDAY" | "EVENING" | "WEEKLY" | "NSE_CLOSE";

function detectSlot(req: Request): Slot {
  const url = new URL(req.url);
  const manual = url.searchParams.get("slot")?.toUpperCase() as Slot | undefined;
  if (manual && ["MORNING", "MIDDAY", "EVENING", "WEEKLY", "NSE_CLOSE"].includes(manual)) return manual;

  const nowUTC = new Date();
  const hourUTC = nowUTC.getUTCHours();
  const minuteUTC = nowUTC.getUTCMinutes();
  const dayOfWeek = nowUTC.getUTCDay();

  if (hourUTC === 4 && minuteUTC >= 30 && dayOfWeek === 1) return "WEEKLY";
  if (hourUTC === 4) return "MORNING";
  if (hourUTC === 9) return "MIDDAY";
  if (hourUTC === 12) return "NSE_CLOSE";
  if (hourUTC === 15) return "EVENING";

  return "MORNING";
}

function shouldReceiveSlot(frequency: string, slot: Slot): boolean {
  switch (slot) {
    case "MORNING":    return ["DAILY", "TWICE_DAILY", "THREE_DAILY"].includes(frequency);
    case "MIDDAY":     return frequency === "THREE_DAILY";
    case "EVENING":    return ["TWICE_DAILY", "THREE_DAILY"].includes(frequency);
    case "WEEKLY":     return frequency === "WEEKLY";
    case "NSE_CLOSE":  return ["TWICE_DAILY", "THREE_DAILY"].includes(frequency);
    default:           return false;
  }
}

function slotToBriefType(slot: Slot): BriefType {
  switch (slot) {
    case "MIDDAY":     return "MIDDAY_PULSE";
    case "EVENING":    return "EVENING_WRAP";
    case "WEEKLY":     return "WEEKLY_INTELLIGENCE";
    case "NSE_CLOSE":  return "NSE_CLOSE_MOVERS";
    default:           return "DAILY_MORNING";
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

  // Refresh market rates before any broadcasts
  await refreshMarketRates();

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
      await new Promise(r => setTimeout(r, 1100));
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
            `Hi *${firstName}*, your Pro expires ${daysLeft <= 0 ? "*today* ⚡" : `in *${daysLeft} day${daysLeft !== 1 ? "s" : ""}* ⏳`}\n` +
            `_(${expiryDate})_\n\n` +
            `🔐 *Don't lose Pro access:*\n` +
            `✅ Unlimited AI queries | ✅ Portfolio tracker | ✅ Daily briefs\n\n` +
            `💎 *KES 490/month ≈ KES 16/day*\n\n` +
            `Reply *RENEW* or visit: https://sentill.africa/packages`,
            user.id
          );
          expiryNotified++;
          await new Promise(r => setTimeout(r, 1100));
        } catch (err) {
          console.error(`[Cron] Expiry notify failed: ${user.name}`, err);
        }
      }

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

  // ── 7. 🔥 IFB/T-Bill Monday Auction Campaign ─────────────────────────────────
  // CBK auctions happen EVERY Monday. We blast ALL opted-in users with
  // a time-sensitive, urgency-driven campaign message regardless of frequency pref.
  let ifbCampaignSent = 0;
  if (slot === "MORNING") {
    try {
      const isMonday = new Date().getUTCDay() === 1;
      if (isMonday) {
        console.log("[Cron] 🔥 Monday IFB/T-Bill Auction Campaign firing...");

        const allOptedIn: any[] = await prisma.$queryRaw`
          SELECT u.id, u.name, u."whatsappId", u."isPremium"
          FROM "User" u
          LEFT JOIN "AlertPreference" a ON a."userId" = u.id
          WHERE u."whatsappVerified" = true
            AND u."whatsappId" IS NOT NULL
            AND (a."whatsappEnabled" IS NULL OR a."whatsappEnabled" = true)
            AND (a.frequency IS NULL OR a.frequency != 'NONE')
        `;

        for (const user of allOptedIn) {
          if (!user.whatsappId) continue;
          const firstName = (user.name as string)?.split(" ")[0] ?? "Investor";
          try {
            await sendWhatsAppMessage(
              user.whatsappId,
              `🔥 *CBK AUCTION OPEN TODAY — Monday*\n` +
              `━━━━━━━━━━━━━━━━━━\n\n` +
              `Hi *${firstName}*! The Central Bank of Kenya opens T-Bill bidding every Monday.\n\n` +
              `📈 *This week's government rates:*\n` +
              `• 91-Day T-Bill — *15.78%* p.a.\n` +
              `• 182-Day T-Bill — *15.97%* p.a.\n` +
              `• 364-Day T-Bill — *16.42%* p.a. ⭐\n\n` +
              `🏛 *Infrastructure Bond (IFB1/2024):*\n` +
              `• *18.46% p.a.* — and ZERO withholding tax 🔥\n` +
              `• Government-backed. Zero default risk.\n\n` +
              `━━━━━━━━━━━━━━━━━━\n` +
              `🎯 *How to invest from your phone:*\n` +
              `1. Download *DhowCSD* app (CBK's official platform)\n` +
              `2. Register (takes 10 min, national ID + bank)\n` +
              `3. Bid from *KES 50,000* before Thursday 2PM\n` +
              `4. Results announced Friday — money works immediately\n\n` +
              `💡 _Reply *IFB* for the full step-by-step guide_\n` +
              `💡 _Reply *TBILL* for T-Bill buying guide_\n\n` +
              `_S-Tier Institutional Wealth Intelligence 🇰🇪_\n_sentill.africa_`,
              user.id
            );
            ifbCampaignSent++;
            await new Promise(r => setTimeout(r, 1100));
          } catch (err) {
            console.error(`[Cron] IFB campaign failed for ${user.name}:`, err);
          }
        }
        console.log(`[Cron] 🔥 IFB campaign: ${ifbCampaignSent} sent`);
      }
    } catch (err) {
      console.error("[Cron] IFB campaign failed:", err);
    }
  }

  // ── 8. 💡 Cross-sell Nudge — MMF holders → upgrade to IFB (Wednesdays) ───────
  // Personalised: "You hold Etica MMF at 17.5% — IFBs give 18.46% tax-free = more money"
  let crossSellSent = 0;
  if (slot === "MORNING") {
    try {
      const isWednesday = new Date().getUTCDay() === 3;
      if (isWednesday) {
        const mmfHolders: any[] = await prisma.$queryRaw`
          SELECT DISTINCT ON (u.id)
            u.id, u.name, u."whatsappId",
            p.name AS "providerName", p."currentYield"
          FROM "User" u
          JOIN "InvestmentAsset" ia ON ia."userId" = u.id
          JOIN "Provider" p ON p.id = ia."providerId"
          WHERE u."whatsappVerified" = true
            AND u."whatsappId" IS NOT NULL
            AND p.type = 'MONEY_MARKET'
            AND u.id NOT IN (
              SELECT DISTINCT ia2."userId"
              FROM "InvestmentAsset" ia2
              JOIN "Provider" p2 ON p2.id = ia2."providerId"
              WHERE p2.type IN ('BOND', 'TREASURY_BILL')
            )
          LIMIT 25
        `;

        console.log(`[Cron] 💡 Cross-sell: ${mmfHolders.length} MMF-only holders to nudge`);

        for (const user of mmfHolders) {
          if (!user.whatsappId) continue;
          const firstName = (user.name as string)?.split(" ")[0] ?? "Investor";
          const fundYield  = Number(user.currentYield ?? 17.5);
          const fundName   = (user.providerName as string) ?? "your MMF";
          const extra      = (18.46 - fundYield).toFixed(2);
          const mmfNet     = Math.round(100000 * fundYield / 100 * 0.85).toLocaleString();
          const ifbReturn  = Math.round(100000 * 18.46 / 100).toLocaleString();

          try {
            await sendWhatsAppMessage(
              user.whatsappId,
              `💡 *Portfolio Upgrade for ${firstName}*\n` +
              `━━━━━━━━━━━━━━━━━━\n\n` +
              `You're in *${fundName}* earning *${fundYield}%* p.a. ✅ Great start!\n\n` +
              `📈 *Here's what you might be missing:*\n\n` +
              `Kenya's *IFB Infrastructure Bond* gives:\n` +
              `• *18.46% p.a.* — *+${extra}% more* than your MMF\n` +
              `• *ZERO withholding tax* 🔥 (MMFs deduct 15% WHT)\n` +
              `• Government-backed — same safety as T-Bills\n\n` +
              `💰 *On KES 100,000:*\n` +
              `• ${fundName} (after WHT): ~KES ${mmfNet}/yr\n` +
              `• IFB Bond (WHT-free): *KES ${ifbReturn}/yr* ✅\n\n` +
              `━━━━━━━━━━━━━━━━━━\n` +
              `*Min: KES 50,000 | Next auction: Monday*\n\n` +
              `Reply *IFB* for the complete guide 📊`,
              user.id
            );
            crossSellSent++;
            await new Promise(r => setTimeout(r, 1100));
          } catch (err) {
            console.error(`[Cron] Cross-sell failed for ${user.name}:`, err);
          }
        }
        console.log(`[Cron] 💡 Cross-sell: ${crossSellSent} sent`);
      }
    } catch (err) {
      console.error("[Cron] Cross-sell section failed:", err);
    }
  }

  // ── 9. 🔁 Win-back Sequence — re-engage users silent 7d+ ─────────────────────
  // Fires on EVENING slot — finds registered users with no inbound message in 7 days
  let winbackSent = 0;
  if (slot === "EVENING") {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const silentUsers: any[] = await prisma.$queryRaw`
        SELECT u.id, u.name, u."whatsappId", u."isPremium"
        FROM "User" u
        WHERE u."whatsappVerified" = true
          AND u."whatsappId" IS NOT NULL
          AND u."createdAt" < ${sevenDaysAgo}
          AND u.id NOT IN (
            SELECT DISTINCT l."userId"
            FROM "WhatsAppLog" l
            WHERE l.direction = 'INBOUND'
              AND l."userId" IS NOT NULL
              AND l."createdAt" >= ${sevenDaysAgo}
          )
        LIMIT 20
      `;

      if (silentUsers.length > 0) {
        console.log(`[Cron] 🔁 Win-back: ${silentUsers.length} silent users`);

        // 5 rotating hooks — different each day of the week
        const hooks = [
          { emoji: "📈", headline: "T-Bill rates are at 16.42% this week", cta: "Reply *TBILL* to see how to invest in under 5 minutes." },
          { emoji: "🔥", headline: "IFBs — 18.46% p.a. with ZERO withholding tax", cta: "Reply *IFB* for the full step-by-step guide." },
          { emoji: "💰", headline: "Etica Zidi MMF is yielding 17.5% p.a. right now", cta: "Reply *MMF* to see the top-ranked funds." },
          { emoji: "📊", headline: "NSE: Equity Group is one of Africa's fastest-growing banks", cta: "Reply *NSE* for live prices and AI stock analysis." },
          { emoji: "🎯", headline: "Your money is doing nothing. Let's change that.", cta: "Reply *MENU* to see all 12 investment options available to you." },
        ];
        const hook = hooks[new Date().getUTCDay() % hooks.length];

        for (const user of silentUsers) {
          if (!user.whatsappId) continue;
          const firstName = (user.name as string)?.split(" ")[0] ?? "Investor";
          try {
            await sendWhatsAppMessage(
              user.whatsappId,
              `${hook.emoji} *Hey ${firstName} — we miss you!*\n\n` +
              `*${hook.headline}.*\n\n` +
              `${hook.cta}\n\n` +
              `━━━━━━━━━━━━━━━━━━\n` +
              `_Your money should be working, even when you're not. 💪_\n` +
              `_Reply *MENU* anytime to see all 12 investment options._\n\n` +
              `_sentill.africa_`,
              user.id
            );
            winbackSent++;
            await new Promise(r => setTimeout(r, 1100));
          } catch (err) {
            console.error(`[Cron] Win-back failed for ${user.name}:`, err);
          }
        }
        console.log(`[Cron] 🔁 Win-back: ${winbackSent} sent`);
      }
    } catch (err) {
      console.error("[Cron] Win-back section failed:", err);
    }
  }

  // ── 10. 📅 Dividend Countdown — alert NSE subscribers 7 days before book closure ──
  let dividendAlertSent = 0;
  if (slot === "MORNING") {
    try {
      const upcoming = getUpcomingDividends(7);
      if (upcoming.length > 0) {
        // Target users who have marketMoversAlerts ON or are TWICE_DAILY/THREE_DAILY
        const nseSubscribers: any[] = await prisma.$queryRaw`
          SELECT u.id, u.name, u."whatsappId", u."isPremium"
          FROM "User" u
          LEFT JOIN "AlertPreference" a ON a."userId" = u.id
          WHERE u."whatsappVerified" = true
            AND u."whatsappId" IS NOT NULL
            AND (
              a."marketMoversAlerts" = true
              OR a.frequency IN ('TWICE_DAILY', 'THREE_DAILY')
            )
        `;

        const alertLines = upcoming.map(ev => formatDividendAlert(ev)).join("\n\n");
        const soonest = upcoming[0];
        const soonestDays = daysUntilClosure(soonest);
        const urgencyHeader = soonestDays <= 3 ? "🚨 *URGENT — BOOK CLOSURES THIS WEEK*" : "📅 *DIVIDEND COUNTDOWN ALERT*";

        for (const user of nseSubscribers) {
          if (!user.whatsappId) continue;
          const firstName = (user.name as string)?.split(" ")[0] ?? "Investor";
          try {
            await sendWhatsAppMessage(
              user.whatsappId,
              `${urgencyHeader}\n` +
              `━━━━━━━━━━━━━━━━━━\n\n` +
              `Hi *${firstName}* — these NSE stocks close their dividend books soon.\n` +
              `_You must own shares BEFORE book closure to qualify for the dividend._\n\n` +
              alertLines + `\n\n` +
              `━━━━━━━━━━━━━━━━━━\n` +
              `📱 Reply *DIVIDEND* for the full dividend calendar\n` +
              `📊 Reply *STOCKS* for live NSE prices\n` +
              `_sentill.africa_ 🇰🇪`,
              user.id
            );
            dividendAlertSent++;
            await new Promise(r => setTimeout(r, 1100));
          } catch (err) {
            console.error(`[Cron] Dividend alert failed for ${user.name}:`, err);
          }
        }
        console.log(`[Cron] 📅 Dividend alerts: ${dividendAlertSent} sent for ${upcoming.length} upcoming closures`);
      }
    } catch (err) {
      console.error("[Cron] Dividend countdown section failed:", err);
    }
  }

  console.log(`[Cron] ✅ ${slot} done — briefs:${sent} expiry:${expiryNotified} ifb:${ifbCampaignSent} cross-sell:${crossSellSent} winback:${winbackSent} dividend:${dividendAlertSent} expired:${autoExpired}`);

  return NextResponse.json({
    success: true,
    slot,
    briefType,
    sent,
    failed,
    total: recipients.length,
    expiryNotified,
    autoExpired,
    ifbCampaignSent,
    crossSellSent,
    winbackSent,
    dividendAlertSent,
    authMethod,
    timestamp: new Date().toISOString(),
  });
}
