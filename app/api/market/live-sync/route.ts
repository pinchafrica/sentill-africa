import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * app/api/market/live-sync/route.ts
 * 
 * Handles real-time Forex Agent for instant rates on the website.
 * Runs instantly without requiring full Gemini scraping.
 */
export async function GET() {
  try {
    // 1. Forex Direct Agent - Get live market pulse instantly
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: AbortSignal.timeout(5_000),
      cache: "no-store",
    });
    
    if (!res.ok) throw new Error("Forex Agent Error");
    
    const data = await res.json();
    const usdToKes = data.rates?.KES ?? 129.50;
    const eurToKes = data.rates?.EUR ? (usdToKes / data.rates.EUR) : 141.00;
    const gbpToKes = data.rates?.GBP ? (usdToKes / data.rates.GBP) : 165.00;

    const liveRates = {
      "USD-KES": +(usdToKes).toFixed(2),
      "EUR-KES": +(eurToKes).toFixed(2),
      "GBP-KES": +(gbpToKes).toFixed(2),
      timestamp: new Date().toISOString()
    };

    // Fast async upsert for caching
    const syncedAt = new Date();
    const updates = [
      prisma.marketRateCache.upsert({
        where: { symbol: "USD-KES" },
        update: { price: liveRates["USD-KES"], lastSyncedAt: syncedAt, source: "live-forex-agent" },
        create: { symbol: "USD-KES", price: liveRates["USD-KES"], lastSyncedAt: syncedAt, source: "live-forex-agent" }
      }),
      prisma.marketRateCache.upsert({
        where: { symbol: "EUR-KES" },
        update: { price: liveRates["EUR-KES"], lastSyncedAt: syncedAt, source: "live-forex-agent" },
        create: { symbol: "EUR-KES", price: liveRates["EUR-KES"], lastSyncedAt: syncedAt, source: "live-forex-agent" }
      }),
      prisma.marketRateCache.upsert({
        where: { symbol: "GBP-KES" },
        update: { price: liveRates["GBP-KES"], lastSyncedAt: syncedAt, source: "live-forex-agent" },
        create: { symbol: "GBP-KES", price: liveRates["GBP-KES"], lastSyncedAt: syncedAt, source: "live-forex-agent" }
      })
    ];

    // Background push so we don't block response
    Promise.allSettled(updates).catch(e => console.error("[Forex Agent] DB Cache failed", e));

    return NextResponse.json({
      success: true,
      agent: "Fast Forex Pulse",
      rates: liveRates
    });

  } catch (error) {
    console.error("[Live Forex Agent] Failed:", error);
    return NextResponse.json({ success: false, error: "Forex agent timeout" }, { status: 500 });
  }
}
