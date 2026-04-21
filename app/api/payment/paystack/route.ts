import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? "";

const PLANS = {
  // Active plan — single KES 490/month offering
  MONTHLY_30_DAYS:   { amount: 49000,  label: "Sentill Pro – KES 490/month",   duration: 30  },
  // Legacy aliases kept for webhook backward-compat
  WEEKLY_7_DAYS:     { amount: 49000,  label: "Sentill Pro – KES 490/month",   duration: 30  },
  QUARTERLY_90_DAYS: { amount: 49000,  label: "Sentill Pro – KES 490/month",   duration: 30  },
  ANNUAL_365_DAYS:   { amount: 49000,  label: "Sentill Pro – KES 490/month",   duration: 30  },
  PRO_MONTHLY:       { amount: 49000,  label: "Sentill Pro – KES 490/month",   duration: 30  },
  PRO_ANNUAL:        { amount: 49000,  label: "Sentill Pro – KES 490/month",   duration: 30  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, plan, userId } = body;

    if (!PAYSTACK_SECRET) {
      return NextResponse.json({ error: "Payment service not configured" }, { status: 503 });
    }
    if (!email || !plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: "Invalid plan or email" }, { status: 400 });
    }

    const planDetails = PLANS[plan as keyof typeof PLANS];

    // Initialize Paystack transaction
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: planDetails.amount, // in kobo/cents
        currency: "KES",
        metadata: {
          userId,
          plan,
          custom_fields: [
            { display_name: "Plan", variable_name: "plan", value: plan },
            { display_name: "Platform", variable_name: "platform", value: "Sentill Africa" },
          ],
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/verify`,
      }),
    });

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json({ error: data.message || "Paystack initialization failed" }, { status: 500 });
    }

    // Create a pending payment record (best-effort — Payment table may not exist yet)
    try {
      await prisma.payment.create({
        data: {
          userId: userId || "demo-user",
          amount: planDetails.amount / 100,
          method: "PAYSTACK",
          reference: data.data.reference,
          status: "PENDING",
          plan,
          paystackRef: data.data.access_code,
        },
      });
    } catch (_) {
      // Payment table may not be migrated yet; not critical for checkout flow
    }

    return NextResponse.json({
      success: true,
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
