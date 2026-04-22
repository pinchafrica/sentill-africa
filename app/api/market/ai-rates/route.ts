/**
 * app/api/market/ai-rates/route.ts
 * Returns current Kenya market rates.
 *
 * Source priority:
 *  1. MarketRateCache (DB) — written daily at 6:45 AM EAT by /api/cron/rates-update
 *  2. AUTHORITATIVE_RATES — April 2026 verified fallback (used if DB empty or stale)
 *
 * The old pattern of calling Gemini on every GET request is removed —
 * rates are now fetched once daily in the cron and cached in the DB.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── Authoritative fallback — April 2026, verified from CBK/CMA sources ────────
// Only used when DB is empty or the cron hasn't run yet.
const AUTHORITATIVE_RATES: Record<string, number> = {
  // Money Market Funds (gross yield % p.a. before 15% WHT)
  "ZIDI":         18.20,
  "ETCA":         18.20,
  "LOFTY-MMF":    17.50,
  "CYTONN-MMF":   16.90,
  "NCBA-MMF":     16.20,
  "KCB-MMF":      15.80,
  "BRITAM-MMF":   15.50,
  "SANLAM-MMF":   15.10,
  "CIC-MMF":      13.60,
  "OLDMUT-MMF":   13.40,
  "ABSA-MMF":     13.20,
  "ICEA-MMF":     14.50,
  // Government Securities
  "IFB1-2024":    18.46,  // WHT-exempt
  "IFB2-2023":    17.93,  // WHT-exempt
  "364-TBILL":    16.42,
  "182-TBILL":    15.97,
  "91-TBILL":     15.78,
  "2YR-BOND":     16.80,
  // NSE Stocks (KES price) — benchmarked April 2026
  "SCOM":         19.35,
  "EQTY":         48.05,
  "KCB":          37.20,
  "NCBA":         49.85,
  "COOP":         12.55,
  "ABSA":         14.30,
  "EABL":        125.50,
  "SCBK":        176.00,
  "KEGN":          4.98,
  "STBK":        112.50,
  "BAMB":         64.50,
  "KNRE":          2.38,
  "KPLC":          2.35,
  "BRIT":          6.80,
  // Macro
  "USD-KES":     129.50,
  "CBK_RATE":     10.00,
  "INFLATION":     4.10,
};

// Legacy aliases kept for backward-compat with homepage chart code
const LEGACY_ALIASES: Record<string, string> = {
  "LOFTY":    "LOFTY-MMF",
  "IFB-2024": "IFB1-2024",
};

export async function GET() {
  let dbRates: Record<string, number> = {};
  let lastSynced: string | null = null;
  let dbSource = "empty";

  // ── 1. Read from MarketRateCache (DB) ──────────────────────────────────────
  try {
    const cached = await prisma.marketRateCache.findMany({
      orderBy: { lastSyncedAt: "desc" },
    });

    if (cached.length > 0) {
      for (const row of cached) {
        dbRates[row.symbol] = row.price;
      }
      lastSynced = cached[0].lastSyncedAt.toISOString();

      // Check freshness — warn if DB is stale (>26 hours)
      const ageHours = (Date.now() - cached[0].lastSyncedAt.getTime()) / 3_600_000;
      dbSource = ageHours < 26 ? "db-fresh" : "db-stale";
      if (ageHours >= 26) {
        console.warn(`[AI Rates] DB rates are ${ageHours.toFixed(1)}h old — cron may have missed`);
      }
    }
  } catch (err) {
    console.error("[AI Rates] DB read failed:", err);
  }

  // ── 2. Merge: DB rates override AUTHORITATIVE, then apply fixed IFB values ──
  const rates: Record<string, number> = {
    ...AUTHORITATIVE_RATES,
    ...dbRates,
    // IFB bonds are fixed — always override regardless of DB
    "IFB1-2024": 18.46,
    "IFB2-2023": 17.93,
  };

  // ── 3. Apply legacy aliases ────────────────────────────────────────────────
  for (const [alias, canonical] of Object.entries(LEGACY_ALIASES)) {
    if (rates[canonical] && !rates[alias]) {
      rates[alias] = rates[canonical];
    }
  }

  const source = Object.keys(dbRates).length > 0
    ? dbSource
    : "authoritative-fallback";

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    lastSynced,
    source,
    rateCount: Object.keys(rates).length,
    rates,
  });
}
