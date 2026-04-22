/**
 * app/api/payment/webhook/route.ts
 * Paystack server-to-server webhook — receives charge.success events.
 * Grants Pro automatically without requiring user to complete browser redirect.
 * Validates HMAC-SHA512 signature so only real Paystack events are processed.
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

function verifyPaystackSignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !PAYSTACK_SECRET) return false;
  const hash = crypto.createHmac("sha512", PAYSTACK_SECRET).update(rawBody).digest("hex");
  return hash === signature;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    console.warn("[PaystackWebhook] Invalid signature — rejected");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  // Only handle successful charges
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const data = event.data;
  const reference = data?.reference;
  const meta = data?.metadata;
  const userId = meta?.userId;
  const plan = meta?.plan ?? "PRO_MONTHLY";
  const amountPaid = Math.round((data?.amount ?? 0) / 100); // Paystack returns kobo

  console.log(`[PaystackWebhook] charge.success | ref: ${reference} | userId: ${userId} | plan: ${plan} | KES ${amountPaid}`);

  if (!userId) {
    console.error("[PaystackWebhook] No userId in metadata — cannot grant Pro");
    return NextResponse.json({ received: true });
  }

  // Plan-aware duration — honors what the user actually paid for
  const PLAN_DAYS: Record<string, number> = {
    PRO_30_DAYS: 30,
    MONTHLY_30_DAYS: 30,
    WEEKLY_7_DAYS: 30,
    QUARTERLY_90_DAYS: 90,
    ANNUAL_365_DAYS: 365,
    CHAMA_MONTHLY: 30,
    PRO_MONTHLY: 30,
    PRO_ANNUAL: 365,
  };
  const days = PLAN_DAYS[plan] || 30;

  const now = new Date();
  // Stack renewals — extend from current expiry if still active
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { premiumExpiresAt: true, referredBy: true },
  });
  const baseDate = existing?.premiumExpiresAt && existing.premiumExpiresAt > now
    ? existing.premiumExpiresAt
    : now;
  const premiumExpiresAt = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

  // Update payment record
  try {
    await prisma.payment.updateMany({
      where: { reference },
      data: { status: "SUCCESS" },
    });
  } catch (err) {
    console.warn("[PaystackWebhook] Payment record update failed (non-critical):", err);
  }

  // Grant Pro
  let upgradedUser = null;
  try {
    upgradedUser = await prisma.user.update({
      where: { id: userId },
      data: { isPremium: true, premiumActivatedAt: now, premiumExpiresAt },
    });
    console.log(`[PaystackWebhook] ✅ Pro granted to ${userId} until ${premiumExpiresAt.toISOString()}`);
  } catch (err) {
    console.error("[PaystackWebhook] ❌ Failed to upgrade user:", err);
    return NextResponse.json({ received: true });
  }

  // Send WhatsApp confirmation
  if (upgradedUser?.whatsappId && upgradedUser.whatsappVerified) {
    try {
      const { sendWhatsAppMessage, sendInteractiveButtons } = await import("@/lib/whatsapp");
      const expiryDate = premiumExpiresAt.toLocaleDateString("en-KE", {
        day: "numeric", month: "long", year: "numeric",
      });
      const planLabel = plan === "ANNUAL_365_DAYS"   ? "Annual (365 days)"
                      : plan === "QUARTERLY_90_DAYS" ? "Quarterly (90 days)"
                      : plan === "CHAMA_MONTHLY"     ? "Chama Group (30 days · 10 seats)"
                      :                                "Monthly (30 days)";

      await sendWhatsAppMessage(
        upgradedUser.whatsappId,
        `🎉 *Payment Confirmed — Sentill Pro is ACTIVE!*\n\n` +
        `✅ *${planLabel}* · KES ${amountPaid.toLocaleString()}\n` +
        `📅 Pro valid until: *${expiryDate}*\n\n` +
        `You now have full access to:\n` +
        `📊 *PORTFOLIO* — track all your investments\n` +
        `🧠 *Unlimited AI* questions — no daily cap\n` +
        `🎯 *GOALS* — set & track financial goals\n` +
        `📈 *ASSETS* — full asset dashboard\n` +
        `🔔 *Daily AI briefs* — 7AM market intelligence\n\n` +
        `💡 *Quick start:*\n` +
        `• Type *INVEST* to browse funds\n` +
        `• Type *RATES* for live market rates\n` +
        `• Type *PORTFOLIO* to track your investments\n\n` +
        `_Welcome to Pro — Kenya's sharpest investment intelligence_ 🇰🇪`
      );

      // ── Post-payment upsell: Monthly → Quarterly ─────────────────────────
      // Only nudge Monthly plan subscribers. Quarterly/Annual already optimized.
      if (plan === "PRO_30_DAYS" || plan === "MONTHLY_30_DAYS" || plan === "PRO_MONTHLY") {
        setTimeout(async () => {
          try {
            await sendWhatsAppMessage(
              upgradedUser!.whatsappId!,
              `💡 *One more thing, ${upgradedUser!.name?.split(" ")[0] ?? "Investor"}…*\n\n` +
              `Lock in *3 months for KES 1,299* (save KES 171) or *1 year for KES 4,900* (save KES 980 — 2 months FREE).\n\n` +
              `Pay once, stay focused on growing your wealth — not renewals.`
            );
            await sendInteractiveButtons(
              upgradedUser!.whatsappId!,
              `Tap to upgrade your current plan:`,
              [
                { id: "ANNUAL_365_DAYS",   title: "🔶 Annual — save 17%" },
                { id: "QUARTERLY_90_DAYS", title: "🔸 3 Months — save 12%" },
                { id: "SKIP_UPSELL",       title: "Not now" },
              ],
              userId
            );
          } catch (upsellErr) {
            console.error("[PaystackWebhook] Upsell send failed:", upsellErr);
          }
        }, 15000); // 15s delay — let the confirmation land first
      }
    } catch (waErr) {
      console.error("[PaystackWebhook] WhatsApp notification failed:", waErr);
    }
  }

  // ── Referral payout: Reward referrer with 30 days Pro when referee converts ─
  if (existing?.referredBy) {
    try {
      const referrer = await prisma.user.findUnique({
        where: { id: existing.referredBy },
        select: { id: true, name: true, whatsappId: true, premiumExpiresAt: true, whatsappVerified: true },
      });
      if (referrer) {
        const refBase = referrer.premiumExpiresAt && referrer.premiumExpiresAt > now
          ? referrer.premiumExpiresAt
          : now;
        const refNewExpiry = new Date(refBase.getTime() + 30 * 24 * 60 * 60 * 1000);
        await prisma.user.update({
          where: { id: referrer.id },
          data: { isPremium: true, premiumExpiresAt: refNewExpiry },
        });
        if (referrer.whatsappId && referrer.whatsappVerified) {
          try {
            const { sendWhatsAppMessage } = await import("@/lib/whatsapp");
            await sendWhatsAppMessage(
              referrer.whatsappId,
              `🎁 *Your friend just upgraded to Sentill Pro!*\n\n` +
              `⚡ You've earned *30 days of Pro access FREE*.\n` +
              `📅 Your Pro now runs until: *${refNewExpiry.toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}*\n\n` +
              `Keep referring — every paid referral = *1 month free*.\n` +
              `Reply *REFER* to get your invite link.`
            );
          } catch {}
        }
        console.log(`[PaystackWebhook] 🎁 Referrer ${referrer.id} earned 30 days Pro (referee ${userId} paid)`);
      }
    } catch (refErr) {
      console.warn("[PaystackWebhook] Referral payout failed (non-critical):", refErr);
    }
  }

  return NextResponse.json({ received: true });
}
