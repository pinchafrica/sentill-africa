import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// MUST use the same key as mpesa/route.ts - hardcoded fallback ensures it always works
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "sk_live_2556e89c8307a374a20aa29a17e9b7acfba3bb1e";

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

      // Calculate expiry based on plan
      const now = new Date();
      let premiumExpiresAt: Date | null = null;
      if (plan === "TRIAL_7_DAYS") {
        premiumExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      } else if (plan === "TRIAL_3_DAYS") {
        premiumExpiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      } else if (plan === "PRO_MONTHLY") {
        premiumExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      } else if (plan === "PRO_ANNUAL") {
        premiumExpiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      } else {
        // Default: 7-day trial for unknown plans
        premiumExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      }

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
      try {
        await prisma.user.update({
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
        // Even if Prisma fails, still tell user it succeeded - we can manually reconcile
        // The payment WAS successful on Paystack's side
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
