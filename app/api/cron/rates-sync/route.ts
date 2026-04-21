/**
 * app/api/cron/rates-sync/route.ts
 * Comprehensive rate sync cron — runs every Monday after CBK T-Bill auction
 * and every Tuesday for MMF weekly yield updates.
 *
 * Updates:
 *  - marketRateCache: T-Bill / IFB rates from CBK auction results
 *  - provider.currentYield: MMF fund yields
 *
 * Called by Vercel cron (see vercel.json).
 * Can also be triggered manually: GET /api/cron/rates-sync?secret=CRON_SECRET
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const CRON_SECRET = process.env.CRON_SECRET ?? "";

// April 2026 fallback rates — CBK weekly bulletin + CMA fund publications
const FALLBACK_TBILL_RATES: Record<string, number> = {
  TBILL_91:  7.40,
  TBILL_182: 7.60,
  TBILL_364: 7.80,
  IFB1:      18.46, // WHT-exempt infrastructure bond — fixed
};

const FALLBACK_MMF_RATES: Array<{ name: string; symbol: string; yield: number }> = [
  { name: "Nabo Africa Money Market Fund", symbol: "NABO_MMF",  yield: 12.90 },
  { name: "Etica MMF (Zidi)",              symbol: "ETCA",      yield: 11.35 },
  { name: "Cytonn Money Market Fund",      symbol: "CYTO_MMF",  yield: 11.11 },
  { name: "Gulfcap Money Market Fund",     symbol: "GULF_MMF",  yield: 10.82 },
  { name: "Old Mutual Money Market Fund",  symbol: "OLMU_MMF",  yield: 10.07 },
  { name: "Britam Money Market Fund",      symbol: "BRIT",      yield: 9.90  },
  { name: "Sanlam Money Market Fund",      symbol: "SANL_MMF",  yield: 7.60  },
  { name: "NCBA Fixed Income Fund",        symbol: "NCBA_MMF",  yield: 6.96  },
  { name: "CIC Money Market Fund",         symbol: "CICM",      yield: 6.95  },
  { name: "Co-op Money Market Fund",       symbol: "COOP_MMF",  yield: 6.72  },
  { name: "Equity Money Market Fund",      symbol: "EQUI_MMF",  yield: 4.09  },
];

async function fetchRatesViaGemini(): Promise<{
  tbills: Record<string, number>;
  mmfs: Array<{ name: string; yield: number }>;
} | null> {
  if (!GEMINI_API_KEY) return null;

  const today = new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const prompt = `Today is ${today}. You are a Kenya financial data assistant with current market knowledge.

Return ONLY a valid JSON object (no markdown, no backticks, no explanation) with the latest known rates for Kenya:

{
  "tbills": {
    "TBILL_91":  <CBK 91-day T-Bill latest auction rate, % p.a.>,
    "TBILL_182": <CBK 182-day T-Bill latest auction rate, % p.a.>,
    "TBILL_364": <CBK 364-day T-Bill latest auction rate, % p.a.>,
    "IFB1":      18.46
  },
  "mmfs": [
    { "name": "Nabo Africa Money Market Fund", "yield": <latest effective annual yield %> },
    { "name": "Etica MMF (Zidi)", "yield": <latest> },
    { "name": "Cytonn Money Market Fund", "yield": <latest> },
    { "name": "Gulfcap Money Market Fund", "yield": <latest> },
    { "name": "Old Mutual Money Market Fund", "yield": <latest> },
    { "name": "Britam Money Market Fund", "yield": <latest> },
    { "name": "Sanlam Money Market Fund", "yield": <latest> },
    { "name": "NCBA Fixed Income Fund", "yield": <latest> },
    { "name": "CIC Money Market Fund", "yield": <latest> },
    { "name": "Co-op Money Market Fund", "yield": <latest> },
    { "name": "Equity Money Market Fund", "yield": <latest> }
  ]
}

Use the most recent CBK weekly T-Bill auction results (published every Monday).
Use the most recent effective annual yield (EAY) published by each fund manager.
All yields are gross before 15% WHT.
If unsure of an exact figure, use April 2026 actuals: CBK rate 10.75%, 91-day T-Bill ~15.78%, 182-day ~15.97%, 364-day ~16.42%. MMF range: 13-18.2%.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1000 },
          tools: [{ googleSearch: {} }],
        }),
      }
    );

    const data = await res.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(text);
    if (!parsed?.tbills || !Array.isArray(parsed?.mmfs)) return null;

    // Validate IFB1 is always 18.46 (WHT-exempt infrastructure bond — fixed)
    parsed.tbills.IFB1 = 18.46;

    return parsed;
  } catch (err) {
    console.error("[RatesSync] Gemini fetch failed:", err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const authHeader = req.headers.get("authorization");
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";

  if (!isVercelCron && secret !== CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[RatesSync] Starting rate sync job...");
  const syncedAt = new Date();
  const results: Record<string, any> = {};

  // ── 1. Fetch fresh rates (Gemini with Search grounding) ─────────────────────
  const fresh = await fetchRatesViaGemini();
  const tbillRates = fresh?.tbills ?? FALLBACK_TBILL_RATES;
  const mmfRates = fresh?.mmfs ?? FALLBACK_MMF_RATES.map(f => ({ name: f.name, yield: f.yield }));

  // ── 2. Upsert T-Bill / IFB rates into marketRateCache ───────────────────────
  let tbillUpdates = 0;
  for (const [symbol, price] of Object.entries(tbillRates)) {
    if (isNaN(Number(price)) || Number(price) <= 0) continue;
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "MarketRateCache" ("id", "symbol", "price", "source", "lastSyncedAt")
         VALUES (gen_random_uuid()::text, $1, $2, 'rates-sync-cron', $3)
         ON CONFLICT ("symbol") DO UPDATE SET "price" = EXCLUDED."price", "lastSyncedAt" = EXCLUDED."lastSyncedAt", "source" = EXCLUDED."source"`,
        symbol, Number(price), syncedAt
      );
      tbillUpdates++;
    } catch (err) {
      console.error(`[RatesSync] Failed to upsert ${symbol}:`, err);
    }
  }
  results.tbills = { updated: tbillUpdates, rates: tbillRates };

  // ── 3. Upsert MMF yields into provider table ─────────────────────────────────
  let mmfUpdates = 0;
  for (const mmf of mmfRates) {
    if (!mmf.name || isNaN(mmf.yield) || mmf.yield <= 0) continue;
    try {
      const existing = await prisma.provider.findFirst({
        where: { name: { contains: mmf.name.split(" ")[0], mode: "insensitive" }, type: "MONEY_MARKET" },
      });
      if (existing) {
        await prisma.provider.update({
          where: { id: existing.id },
          data: { currentYield: mmf.yield, updatedAt: syncedAt },
        });
        mmfUpdates++;
      }
    } catch (err) {
      console.error(`[RatesSync] Failed to update provider ${mmf.name}:`, err);
    }
  }
  results.mmfs = { updated: mmfUpdates, count: mmfRates.length };

  // ── 4. Also sync NSE prices via existing market-sync symbols ─────────────────
  // (SCOM, EQTY etc. already handled by the existing market-sync cron)

  console.log("[RatesSync] ✅ Complete:", results);
  return NextResponse.json({
    success: true,
    syncedAt: syncedAt.toISOString(),
    source: fresh ? "gemini-search" : "fallback-defaults",
    ...results,
  });
}
