/**
 * app/api/webhooks/paystack/route.ts
 * Paystack webhook handler — processes payment events and auto-activates Pro.
 * Sends WhatsApp confirmation on successful payment.
 */

import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

const PAYSTACK_SECRET =
  process.env.PAYSTACK_SECRET_KEY ||
  "sk_live_2556e89c8307a374a20aa29a17e9b7acfba3bb1e";

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 401 });
    }

    const bodyText = await req.text();

    const expectedSignature = crypto
      .createHmac("sha512", PAYSTACK_SECRET)
      .update(bodyText)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("[Paystack Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(bodyText);
    console.log(`[Paystack Webhook] Event: ${event.event}`);

    switch (event.event) {
      case "charge.success": {
        const email = event.data.customer?.email;
        const meta = event.data.metadata || {};
        const userId = meta.userId;
        const plan = meta.plan || "PRO_MONTHLY";
        const amount = (event.data.amount || 0) / 100; // Convert from kobo/cents

        console.log(`[Paystack Webhook] Payment SUCCESS: ${email} | Plan: ${plan} | KES ${amount}`);

        // Calculate expiry
        const now = new Date();
        const PLAN_DAYS: Record<string, number> = {
          TRIAL_7_DAYS: 7,
          PRO_MONTHLY: 30,
          PRO_ANNUAL: 365,
        };
        const days = PLAN_DAYS[plan] || 30;
        const premiumExpiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        // Upgrade user
        const updateFilter = userId ? { id: userId } : { email };
        const user = await prisma.user.update({
          where: updateFilter,
          data: {
            isPremium: true,
            premiumActivatedAt: now,
            premiumExpiresAt,
          },
        });

        console.log(`[Paystack Webhook] User ${user.name} upgraded to Pro until ${premiumExpiresAt.toISOString()}`);

        // Update payment record
        const ref = event.data.reference;
        if (ref) {
          try {
            await prisma.payment.updateMany({
              where: { reference: ref },
              data: { status: "SUCCESS" },
            });
          } catch {}
        }

        // Send WhatsApp confirmation
        if (user.whatsappId) {
          try {
            const expiryDate = premiumExpiresAt.toLocaleDateString("en-KE", {
              day: "numeric", month: "long", year: "numeric",
            });
            await sendWhatsAppMessage(
              user.whatsappId,
              `🎉 *Payment Confirmed!*\n\n` +
              `⚡ *Sentil Pro is now ACTIVE!*\n\n` +
              `✅ Plan: *${plan.replace(/_/g, " ")}*\n` +
              `💰 Amount: *KES ${amount.toLocaleString()}*\n` +
              `📅 Expires: *${expiryDate}*\n\n` +
              `You now have full access to:\n` +
              `📊 Portfolio Tracker\n` +
              `🧠 AI Investment Oracle (unlimited)\n` +
              `🎯 Smart Goal Planning\n` +
              `📈 Live Market Alerts\n\n` +
              `🌐 Dashboard: https://sentill.africa/dashboard\n\n` +
              `Send *MENU* to get started!`,
              user.id
            );
          } catch (waErr) {
            console.error("[Paystack Webhook] WA notification failed:", waErr);
          }
        }
        break;
      }

      case "subscription.disable":
      case "charge.failed": {
        const email = event.data.customer?.email;
        console.log(`[Paystack Webhook] ${event.event} for ${email}`);
        await prisma.user.updateMany({
          where: { email },
          data: { isPremium: false },
        });

        // Notify user via WhatsApp
        const failedUser = await prisma.user.findUnique({ where: { email } });
        if (failedUser?.whatsappId) {
          try {
            await sendWhatsAppMessage(
              failedUser.whatsappId,
              `⚠️ *Payment Issue*\n\n` +
              `Your payment could not be processed.\n\n` +
              `Send *SUBSCRIBE* to try again or visit:\nhttps://sentill.africa/packages`,
              failedUser.id
            );
          } catch {}
        }
        break;
      }

      default:
        console.log(`[Paystack Webhook] Unhandled: ${event.event}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Paystack Webhook Error]:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
