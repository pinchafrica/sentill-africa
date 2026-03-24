import { NextResponse } from "next/server";
import crypto from 'crypto';
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret || !signature) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read the raw body as text for signature verification
    const bodyText = await req.text();

    const expectedSignature = crypto
      .createHmac("sha512", secret)
      .update(bodyText)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(bodyText);

    // Handle different Paystack events
    switch (event.event) {
      case "charge.success":
        console.log(`[Webhook] Payment Success for ${event.data.customer.email}`);
        // Mark user as premium
        await prisma.user.updateMany({
          where: { email: event.data.customer.email },
          data: { isPremium: true }
        });
        break;

      case "subscription.disable":
      case "charge.failed":
        console.log(`[Webhook] Subscription Failed/Ended for ${event.data.customer.email}`);
        // Downgrade user
        await prisma.user.updateMany({
          where: { email: event.data.customer.email },
          data: { isPremium: false }
        });
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.event}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("[Paystack Webhook Error]:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
