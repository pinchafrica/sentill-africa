import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
if (!PAYSTACK_SECRET) throw new Error("PAYSTACK_SECRET_KEY is not set in environment variables");

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");
  const isJsonRequest = searchParams.get("json") === "true";

  console.log("[Verify] Incoming verification request. Reference:", reference);

  if (!reference) {
    console.error("[Verify] No reference provided");
    if (isJsonRequest) {
      return NextResponse.json({ success: false, error: "No reference provided" }, { status: 400 });
    }
    return NextResponse.redirect(new URL("/payment/callback?payment=failed&reason=no_reference", req.url));
  }

  try {
    // Verify with Paystack
    console.log("[Verify] Calling Paystack API to verify reference:", reference);
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });
    const data = await response.json();
    console.log("[Verify] Paystack response status:", data.status, "| Transaction status:", data.data?.status);

    if (data.status && data.data.status === "success") {
      const meta = data.data.metadata;
      const userId = meta?.userId;
      const plan = meta?.plan;

      console.log("[Verify] Payment SUCCESS. UserId:", userId, "| Plan:", plan);

      if (!userId) {
        console.error("[Verify] No userId in metadata - cannot upgrade");
        if (isJsonRequest) {
          return NextResponse.json({ success: false, error: "No user ID in payment metadata" }, { status: 400 });
        }
        return NextResponse.redirect(new URL("/payment/callback?payment=failed&reason=no_user_id", req.url));
      }

      // Calculate expiry based on plan — duration matches PLANS config
      const now = new Date();
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
      const days = PLAN_DAYS[plan ?? ""] || 30;
      // Extend from current expiry if still active, so renewal stacks correctly
      const existing = await prisma.user.findUnique({ where: { id: userId }, select: { premiumExpiresAt: true } });
      const baseDate = existing?.premiumExpiresAt && existing.premiumExpiresAt > now
        ? existing.premiumExpiresAt
        : now;
      const premiumExpiresAt = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

      // Update payment record (best-effort)
      try {
        await prisma.payment.updateMany({
          where: { reference },
          data: { status: "SUCCESS" },
        });
        console.log("[Verify] Payment record updated to SUCCESS");
      } catch (payErr: any) {
        console.error("[Verify] Failed to update payment record:", payErr.message);
      }

      // Upgrade user to premium
      let upgradedUser = null;
      try {
        upgradedUser = await prisma.user.update({
          where: { id: userId },
          data: { 
            isPremium: true, 
            premiumActivatedAt: now,
            premiumExpiresAt: premiumExpiresAt
          },
        });
        console.log("[Verify] User upgraded to premium successfully. Expires:", premiumExpiresAt);
      } catch (userErr: any) {
        console.error("[Verify] CRITICAL: Failed to upgrade user:", userErr.message);
      }

      // Notify via WhatsApp if they have a linked number
      if (upgradedUser?.whatsappId && upgradedUser.whatsappVerified) {
        try {
          const { sendWhatsAppMessage } = await import("@/lib/whatsapp");
          const expiryDate = premiumExpiresAt
            ? new Date(premiumExpiresAt).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })
            : "N/A";
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentill.africa";
          await sendWhatsAppMessage(
            upgradedUser.whatsappId,
            `🎉 *Payment Confirmed!*\n\n` +
            `⚡ *Sentil Pro is now ACTIVE!*\n\n` +
            `✅ Plan: ${plan ?? "Pro"}\n` +
            `📅 Expires: ${expiryDate}\n\n` +
            `You now have access to:\n` +
            `📊 Portfolio Tracker\n` +
            `🧠 Sentill Africa Oracle\n` +
            `🎯 Goal Planning\n\n` +
            `🌐 Dashboard: ${appUrl}/dashboard\n\n` +
            `Send *MENU* to get started!`,
            userId
          );
        } catch (waErr) {
          console.error("[Verify] WA notification failed:", waErr);
        }
      }

      if (isJsonRequest) {
        return NextResponse.json({ success: true, plan, message: "Payment verified and account upgraded." });
      }
      return NextResponse.redirect(new URL("/payment/callback?payment=success&plan=" + (plan || "TRIAL_3_DAYS"), req.url));
    } else {
      const txnStatus = data.data?.status || "unknown";
      console.error("[Verify] Payment NOT successful. Status:", txnStatus, "| Full response:", JSON.stringify(data));
      
      // Update payment record
      try {
        await prisma.payment.updateMany({
          where: { reference },
          data: { status: "FAILED" },
        });
      } catch (_) {}

      if (isJsonRequest) {
        return NextResponse.json({ success: false, error: "Payment was not successful. Status: " + txnStatus });
      }
      return NextResponse.redirect(new URL("/payment/callback?payment=failed&reason=txn_" + txnStatus, req.url));
    }
  } catch (error: any) {
    console.error("[Verify] EXCEPTION:", error?.message, error?.stack);
    if (isJsonRequest) {
      return NextResponse.json({ success: false, error: "Verification error: " + error.message }, { status: 500 });
    }
    return NextResponse.redirect(new URL("/payment/callback?payment=failed&reason=exception", req.url));
  }
}
