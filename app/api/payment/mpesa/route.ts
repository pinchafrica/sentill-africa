import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "sk_live_2556e89c8307a374a20aa29a17e9b7acfba3bb1e";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amount, mpesaCode, plan, email = "edwinmule@yahoo.com" } = body;

    if (!mpesaCode || !userId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify minimum amount
    const MIN_AMOUNTS: Record<string, number> = {
      WEEKLY_7_DAYS: 99,
      MONTHLY_30_DAYS: 349,
      QUARTERLY_90_DAYS: 999,
      ANNUAL_365_DAYS: 2999,
      // Legacy plans (backwards compat)
      PRO_MONTHLY: 349,
      PRO_ANNUAL: 999,
    };

    if (plan && amount < MIN_AMOUNTS[plan]) {
      return NextResponse.json({
        error: `Minimum amount for ${plan} is KES ${MIN_AMOUNTS[plan]}`
      }, { status: 400 });
    }

    // 1. Initialize Paystack Transaction
    // amount in Kobo/Cents (amount * 100)
    const origin = req.headers.get("origin") || "https://www.sentill.africa";
    const payload = {
      email: email,
      amount: amount * 100, 
      currency: "KES",
      callback_url: `${origin}/api/payment/verify`, 
      channels: ["mobile_money", "card"], // Let Paystack handle the UI for disabled APIs
      metadata: { userId, plan }
    };

    console.log("[Paystack] Initializing Checkout for:", email);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeout);

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      console.error("[Paystack Error]:", paystackData);
      return NextResponse.json({ 
        error: paystackData.message || "Failed to initialize Paystack checkout." 
      }, { status: 502 });
    }

    const authUrl = paystackData.data?.authorization_url;
    const ref = paystackData.data?.reference || `MPESA-INIT-${Date.now()}`;

    // 3. Log Payment to DB (Pending status awaiting webhook)
    try {
      await prisma.payment.create({
        data: {
          userId,
          amount,
          method: "MPESA_PAYSTACK",
          reference: ref,
          status: "PENDING", 
          plan: plan || "PRO_MONTHLY",
          mpesaRef: "paystack-redirect",
          paystackRef: ref
        },
      });
    } catch (dbError: any) {
      console.error("[Paystack DB Error] Failed to log pending transaction:", dbError.message);
      // We don't fail the checkout if DB logging fails, but we must log the error so we can manually reconcile.
    }

    return NextResponse.json({
      success: true,
      message: "Checkout initialized. Redirecting...",
      authorization_url: authUrl,
      reference: ref,
    });

  } catch (error: any) {
    console.error("[Paystack Exception]:", error?.message);
    return NextResponse.json({ success: false, error: "Internal Gateway Error" }, { status: 500 });
  }
}
