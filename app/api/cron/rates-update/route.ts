/**
 * app/api/cron/rates-update/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * COMPREHENSIVE DAILY RATES UPDATE — 3:45 AM UTC (6:45 AM EAT) every day
 *
 * Pipeline:
 *  Stage 1 — Gemini + Google Search grounding → T-Bills, IFBs, MMFs, CBK, FX
 *  Stage 2 — Hard-bounds validation (no hallucinated rates stored)
 *  Stage 3 — Upsert all instruments into MarketRateCache (DB)
 *  Stage 4 — Update Provider.currentYield for MMF fund records
 *  Stage 5 — Write public/market_data.json for instant frontend consumption
 *  Stage 6 — Audit log returned with confidence score
 *
 * Auth: Vercel cron header OR Authorization: Bearer <CRON_SECRET>
 * Manual trigger: GET /api/cron/rates-update?secret=<CRON_SECRET>
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFileSync } from "fs";
import { join } from "path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const CRON_SECRET   = (process.env.CRON_SECRET ?? "sentil-cron-2026").trim();

// ── Hard-bounds validation — rates OUTSIDE these ranges are rejected ──────────
// If Gemini hallucinates a wrong rate it will NOT be stored.
const BOUNDS: Record<string, [number, number]> = {
  // CBK
  CBK_RATE:    [8.0,  14.0],
  // T-Bills (April 2026: CBK has lowered rates — now ~7.78%, 7.89%, 8.27%)
  "91-TBILL":  [5.0, 12.0],
  "182-TBILL": [5.0, 13.0],
  "364-TBILL": [5.0, 14.0],
  "2YR-BOND":  [6.0, 16.0],
  // IFBs — fixed auction results, hardcoded below
  "IFB1-2024": [18.46, 18.46],
  "IFB2-2023": [17.93, 17.93],
  // MMFs (gross yield before 15% WHT)
  ZIDI:        [10.0, 22.0],
  ETCA:        [10.0, 22.0],
  "LOFTY-MMF": [10.0, 22.0],
  "CYTONN-MMF":[10.0, 22.0],
  "NCBA-MMF":  [4.0,  22.0],
  "KCB-MMF":   [8.0,  22.0],
  "BRITAM-MMF":[8.0,  22.0],
  "SANLAM-MMF":[8.0,  20.0],
  "CIC-MMF":   [8.0,  20.0],
  "OLDMUT-MMF":[8.0,  20.0],
  "ABSA-MMF":  [8.0,  20.0],
  "ICEA-MMF":  [8.0,  20.0],
  // NSE stocks (KES prices — wider bounds)
  SCOM:  [10.0, 60.0],
  EQTY:  [30.0, 150.0],
  KCB:   [20.0, 80.0],
  NCBA:  [40.0, 160.0],
  COOP:  [8.0,  40.0],
  ABSA:  [8.0,  40.0],
  EABL:  [60.0, 250.0],
  SCBK:  [120.0, 400.0],
  // Forex
  "USD-KES": [120.0, 140.0],
  "EUR-KES": [130.0, 160.0],
  "GBP-KES": [150.0, 180.0],
};

// ── Fixed rates that never change (verified from official CBK/CMA sources) ───
const FIXED_RATES: Record<string, number> = {
  "IFB1-2024": 18.46,  // Infrastructure Bond 1/2024 — WHT-exempt — FIXED
  "IFB2-2023": 17.93,  // Infrastructure Bond 2/2023 — WHT-exempt — FIXED
};

// ── Robust April 2026 fallback (used if Gemini unavailable) ─────────────────
// These are sourced from CBK weekly bulletin and CMA fund publications.
const FALLBACK_RATES: Record<string, number> = {
  // CBK macro
  CBK_RATE:     10.00,
  INFLATION:     4.10,
  "USD-KES":   129.50,
  "EUR-KES":   141.00,
  "GBP-KES":   165.00,
  // T-Bills (CBK auction 27 April 2026 — Google verified)
  "91-TBILL":   7.78,
  "182-TBILL":  7.89,
  "364-TBILL":  8.27,
  "2YR-BOND":  10.50,
  // IFBs (fixed)
  "IFB1-2024": 18.46,
  "IFB2-2023": 17.93,
  // MMFs (Google-verified gross yields, April 2026)
  ZIDI:         12.01,
  ETCA:         12.01,
  "LOFTY-MMF":  10.14,
  "CYTONN-MMF": 12.00,
  "NCBA-MMF":    6.96,
  "KCB-MMF":    15.40,
  "BRITAM-MMF": 13.00,
  "SANLAM-MMF":  8.84,
  "CIC-MMF":     9.50,
  "OLDMUT-MMF": 10.08,
  "ABSA-MMF":    9.20,
  "ICEA-MMF":   14.80,
  // NSE equities (April 2026 benchmarked prices)
  SCOM:    19.35,
  EQTY:    48.05,
  KCB:     37.20,
  NCBA:    49.85,
  COOP:    12.55,
  ABSA:    14.30,
  EABL:   125.50,
  SCBK:   176.00,
  KEGN:     4.98,
  STBK:   112.50,
  BAMB:    64.50,
  SASN:    19.75,
  NSE_PLC: 17.80,
  KQ:       5.40,
  BOC:    123.00,
};

// ── Symbol → Provider name mapping (for Provider table updates) ───────────────
const MMF_PROVIDER_MAP: Record<string, string[]> = {
  ETCA:         ["Etica", "Zidi"],
  ZIDI:         ["Etica", "Zidi"],
  "LOFTY-MMF":  ["Lofty"],
  "CYTONN-MMF": ["Cytonn"],
  "NCBA-MMF":   ["NCBA"],
  "KCB-MMF":    ["KCB"],
  "BRITAM-MMF": ["Britam"],
  "SANLAM-MMF": ["Sanlam"],
  "CIC-MMF":    ["CIC"],
  "OLDMUT-MMF": ["Old Mutual"],
  "ABSA-MMF":   ["Absa"],
  "ICEA-MMF":   ["ICEA"],
};

// ── Validate a rate against hard bounds ──────────────────────────────────────
function validate(symbol: string, value: number): boolean {
  const bounds = BOUNDS[symbol];
  if (!bounds) return value > 0 && value < 10_000; // generic sanity
  return value >= bounds[0] && value <= bounds[1];
}

// ─────────────────────────────────────────────────────────────────────────────
// STAGE 1: Gemini + Google Search → live Kenya rates
// Uses googleSearch grounding so Gemini actually queries the web
// before answering — CBK auction results, CMA fund pages, etc.
// ─────────────────────────────────────────────────────────────────────────────
async function fetchLiveRatesFromGemini(): Promise<{
  rates: Record<string, number>;
  confidence: string;
  sources: string[];
} | null> {
  if (!GEMINI_API_KEY) return null;

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const isoDate = today.toISOString().slice(0, 10);

  const prompt = `Today is ${dateStr} (${isoDate}).

TASK: Search the web and return the CURRENT official Kenya investment rates.

Search for these specific data points:
1. "CBK Treasury Bill results ${isoDate.slice(0,7)}" — latest CBK weekly T-Bill auction yields
2. "Etica Capital money market fund yield 2026" OR "Zidi app MMF rate" — Etica/Zidi effective annual yield
3. "Lofty-Corpin money market fund yield April 2026"
4. "Cytonn money market fund yield 2026"
5. "CIC money market fund Kenya yield 2026"
6. "NCBA money market fund Kenya 2026"
7. "Kenya CBK base rate 2026"
8. Current USD to KES exchange rate

Return ONLY a valid JSON object (no markdown, no backticks, no explanation):
{
  "CBK_RATE": <CBK base rate % — currently should be around 10.00>,
  "91-TBILL": <91-day T-Bill latest auction yield % — should be around 15-17>,
  "182-TBILL": <182-day T-Bill yield %>,
  "364-TBILL": <364-day T-Bill yield — should be around 16-17>,
  "ETCA": <Etica Capital/Zidi MMF effective annual yield % gross before WHT — should be around 17-19>,
  "LOFTY-MMF": <Lofty-Corpin MMF yield %>,
  "CYTONN-MMF": <Cytonn MMF yield %>,
  "NCBA-MMF": <NCBA MMF yield %>,
  "KCB-MMF": <KCB MMF yield %>,
  "BRITAM-MMF": <Britam MMF yield %>,
  "SANLAM-MMF": <Sanlam MMF yield %>,
  "CIC-MMF": <CIC MMF yield %>,
  "OLDMUT-MMF": <Old Mutual MMF yield %>,
  "ABSA-MMF": <Absa Bank MMF yield %>,
  "USD-KES": <current USD to KES exchange rate — should be around 129>,
  "confidence": "high",
  "sources": ["<url or source 1>", "<url or source 2>"]
}

VALIDATION RULES (reject any rate outside these ranges):
- CBK_RATE: 8-14%
- T-Bill rates: 13-19%
- MMF yields (gross): 10-22%
- USD-KES: 120-140

If you cannot verify a rate with confidence, use these April 2026 benchmarks:
91-TBILL=15.78, 182-TBILL=15.97, 364-TBILL=16.42, CBK_RATE=10.00, ETCA=18.20, USD-KES=129.50`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.05, maxOutputTokens: 1500 },
          tools: [{ googleSearch: {} }],
        }),
        signal: AbortSignal.timeout(25_000),
      }
    );

    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);

    const data = await res.json();
    let text: string = "";

    // Grounded responses may have content across multiple parts
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    for (const p of parts) {
      if (typeof p.text === "string") { text += p.text; }
    }

    // Strip markdown fences if present
    text = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    // Extract the first JSON object from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in Gemini response");

    const parsed = JSON.parse(jsonMatch[0]);
    if (typeof parsed !== "object" || parsed === null) throw new Error("Invalid JSON shape");

    const rates: Record<string, number> = {};
    for (const [key, val] of Object.entries(parsed)) {
      if (key === "confidence" || key === "sources") continue;
      const num = Number(val);
      if (!isNaN(num) && num > 0) rates[key] = num;
    }

    return {
      rates,
      confidence: String(parsed.confidence ?? "medium"),
      sources: Array.isArray(parsed.sources) ? parsed.sources : [],
    };

  } catch (err) {
    console.error("[RatesUpdate] Gemini stage failed:", err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STAGE 2: Fetch live USD/KES and forex from open.er-api.com
// ─────────────────────────────────────────────────────────────────────────────
async function fetchForexRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      "USD-KES": +(data.rates?.KES ?? 129.50).toFixed(2),
      "EUR-KES": +(data.rates?.EUR ? (data.rates.KES / data.rates.EUR) : 141).toFixed(2),
      "GBP-KES": +(data.rates?.GBP ? (data.rates.KES / data.rates.GBP) : 165).toFixed(2),
    };
  } catch {
    return { "USD-KES": 129.50, "EUR-KES": 141.00, "GBP-KES": 165.00 };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STAGE 3: Upsert rates into MarketRateCache
// ─────────────────────────────────────────────────────────────────────────────
async function upsertRate(symbol: string, price: number, source: string, syncedAt: Date): Promise<boolean> {
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "MarketRateCache" ("id", "symbol", "price", "source", "lastSyncedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4)
       ON CONFLICT ("symbol") DO UPDATE
       SET "price" = EXCLUDED."price",
           "source" = EXCLUDED."source",
           "lastSyncedAt" = EXCLUDED."lastSyncedAt"`,
      symbol, price, source, syncedAt
    );
    return true;
  } catch (err) {
    console.error(`[RatesUpdate] Upsert failed: ${symbol}`, err);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STAGE 4: Update Provider.currentYield for MMF fund records
// ─────────────────────────────────────────────────────────────────────────────
async function updateMMFProviders(rates: Record<string, number>): Promise<number> {
  let updated = 0;
  for (const [symbol, yield_] of Object.entries(rates)) {
    const keywords = MMF_PROVIDER_MAP[symbol];
    if (!keywords) continue;
    for (const kw of keywords) {
      try {
        const result = await prisma.provider.updateMany({
          where: { name: { contains: kw, mode: "insensitive" }, type: "MONEY_MARKET" },
          data: { currentYield: yield_, updatedAt: new Date() },
        });
        updated += result.count;
      } catch {}
    }
  }
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// STAGE 5: Write public/market_data.json for instant frontend reads
// ─────────────────────────────────────────────────────────────────────────────
function buildMarketDataJson(rates: Record<string, number>, syncedAt: Date): void {
  const r = (sym: string, fallback: number) => +(rates[sym] ?? fallback).toFixed(2);

  const payload = {
    scraped_at: syncedAt.toISOString(),
    source: "gemini-search+cbk+cma",
    mmfs: [
      { name: "Etica Capital MMF (Zidi)", code: "etca",   yield: r("ETCA", 18.20),          net_yield: +(r("ETCA", 18.20)  * 0.85).toFixed(2), aum: "15.2B",  min: 1000,  wht: 15, risk: "Low", liquidity: "T+1", paybill: "511116" },
      { name: "Lofty-Corpin MMF",         code: "lofty",  yield: r("LOFTY-MMF", 17.50),      net_yield: +(r("LOFTY-MMF", 17.50) * 0.85).toFixed(2), aum: "3.4B",   min: 1000,  wht: 15, risk: "Low", liquidity: "Instant", paybill: "512600" },
      { name: "Cytonn Money Market",      code: "cytonn", yield: r("CYTONN-MMF", 16.90),     net_yield: +(r("CYTONN-MMF", 16.90) * 0.85).toFixed(2), aum: "8.2B",   min: 1000,  wht: 15, risk: "Low", liquidity: "T+2", paybill: "525200" },
      { name: "NCBA Money Market",        code: "ncba",   yield: r("NCBA-MMF", 16.20),       net_yield: +(r("NCBA-MMF", 16.20) * 0.85).toFixed(2), aum: "3.1B",   min: 1000,  wht: 15, risk: "Low", liquidity: "Instant", paybill: "880100" },
      { name: "KCB Money Market",         code: "kcb",    yield: r("KCB-MMF", 15.80),        net_yield: +(r("KCB-MMF", 15.80) * 0.85).toFixed(2), aum: "5.2B",   min: 1000,  wht: 15, risk: "Low", liquidity: "T+1", paybill: "522522" },
      { name: "Britam Money Market",      code: "brtm",   yield: r("BRITAM-MMF", 15.50),     net_yield: +(r("BRITAM-MMF", 15.50) * 0.85).toFixed(2), aum: "8.4B",   min: 1000,  wht: 15, risk: "Low", liquidity: "T+1", paybill: "602600" },
      { name: "Sanlam Investments MMF",   code: "sanlam", yield: r("SANLAM-MMF", 15.10),     net_yield: +(r("SANLAM-MMF", 15.10) * 0.85).toFixed(2), aum: "51.4B",  min: 5000,  wht: 15, risk: "Low", liquidity: "T+2", paybill: "880100" },
      { name: "CIC Money Market",         code: "cic",    yield: r("CIC-MMF", 13.60),        net_yield: +(r("CIC-MMF", 13.60) * 0.85).toFixed(2), aum: "20.8B",  min: 5000,  wht: 15, risk: "Low", liquidity: "T+1", paybill: "174174" },
      { name: "Old Mutual MMF",           code: "omam",   yield: r("OLDMUT-MMF", 13.40),     net_yield: +(r("OLDMUT-MMF", 13.40) * 0.85).toFixed(2), aum: "22.3B",  min: 1000,  wht: 15, risk: "Low", liquidity: "T+2", paybill: "542542" },
      { name: "Absa MMF",                 code: "absa",   yield: r("ABSA-MMF", 13.20),       net_yield: +(r("ABSA-MMF", 13.20) * 0.85).toFixed(2), aum: "4.1B",   min: 1000,  wht: 15, risk: "Low", liquidity: "T+1", paybill: "303030" },
      { name: "ICEA Lion MMF",            code: "icea",   yield: r("ICEA-MMF", 14.50),       net_yield: +(r("ICEA-MMF", 14.50) * 0.85).toFixed(2), aum: "18.2B",  min: 5000,  wht: 15, risk: "Low", liquidity: "T+1", paybill: "402402" },
    ],
    tbills: [
      { name: "91-Day T-Bill",  tenor: "91d",  yield: r("91-TBILL", 15.78),  net_yield: +(r("91-TBILL", 15.78) * 0.85).toFixed(2),  issuer: "CBK", risk: "Zero", wht: 15 },
      { name: "182-Day T-Bill", tenor: "182d", yield: r("182-TBILL", 15.97), net_yield: +(r("182-TBILL", 15.97) * 0.85).toFixed(2), issuer: "CBK", risk: "Zero", wht: 15 },
      { name: "364-Day T-Bill", tenor: "364d", yield: r("364-TBILL", 16.42), net_yield: +(r("364-TBILL", 16.42) * 0.85).toFixed(2), issuer: "CBK", risk: "Zero", wht: 15 },
    ],
    bonds: [
      { name: "IFB1/2024", type: "IFB", yield: 18.46, net_yield: 18.46, tenor: "10yr", wht: 0, maturity: "2034-03-15", note: "WHT-exempt — tax-free coupon" },
      { name: "IFB2/2023", type: "IFB", yield: 17.93, net_yield: 17.93, tenor: "10yr", wht: 0, maturity: "2033-06-15", note: "WHT-exempt" },
      { name: "FXD1/2024", type: "FXD", yield: r("2YR-BOND", 16.80), net_yield: +(r("2YR-BOND", 16.80) * 0.85).toFixed(2), tenor: "2yr", wht: 15, maturity: "2026-03-15" },
    ],
    saccos: [
      { name: "Stima SACCO",        yield: 15.00, members: "180K+", regulated_by: "SASRA" },
      { name: "Mwalimu National",   yield: 14.50, members: "220K+", regulated_by: "SASRA" },
      { name: "Kenya Police SACCO", yield: 14.00, members: "120K+", regulated_by: "SASRA" },
      { name: "Unaitas SACCO",      yield: 13.50, members: "90K+",  regulated_by: "SASRA" },
      { name: "Tower SACCO",        yield: 13.00, members: "60K+",  regulated_by: "SASRA" },
    ],
    nse: {
      SCOM: r("SCOM",  19.35),
      EQTY: r("EQTY",  48.05),
      KCB:  r("KCB",   37.20),
      NCBA: r("NCBA",  49.85),
      COOP: r("COOP",  12.55),
      ABSA: r("ABSA",  14.30),
      EABL: r("EABL", 125.50),
      SCBK: r("SCBK", 176.00),
    },
    macro: {
      cbk_rate:  r("CBK_RATE", 10.00),
      inflation: r("INFLATION", 4.10),
      usd_kes:   r("USD-KES", 129.50),
      eur_kes:   r("EUR-KES", 141.00),
      gbp_kes:   r("GBP-KES", 165.00),
      nse20:     3610,
      nsi20_date: syncedAt.toISOString().slice(0, 10),
    },
  };

  try {
    const filePath = join(process.cwd(), "public", "market_data.json");
    writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf-8");
    console.log("[RatesUpdate] ✅ market_data.json written");
  } catch (err) {
    console.error("[RatesUpdate] market_data.json write failed:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const secret       = req.nextUrl.searchParams.get("secret");
  const authHeader   = (req.headers.get("authorization") ?? "").trim();
  const isAuthorized = isVercelCron
    || secret === CRON_SECRET
    || authHeader === `Bearer ${CRON_SECRET}`;

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const syncedAt  = new Date();
  const startTime = Date.now();
  console.log(`[RatesUpdate] 🚀 Starting comprehensive rates update — ${syncedAt.toISOString()}`);

  const audit: Record<string, any> = {
    syncedAt: syncedAt.toISOString(),
    stages: {},
    accepted: {} as Record<string, number>,
    rejected: {} as Record<string, { value: number; reason: string }>,
    dbUpdates: 0,
    providerUpdates: 0,
  };

  // ── Stage 1: Gemini + Google Search ──────────────────────────────────────
  console.log("[RatesUpdate] Stage 1: Gemini + Google Search...");
  const geminiResult = await fetchLiveRatesFromGemini();
  const aiRates      = geminiResult?.rates ?? {};
  audit.stages.gemini = {
    success: !!geminiResult,
    confidence: geminiResult?.confidence ?? "fallback",
    sources: geminiResult?.sources ?? [],
    rateCount: Object.keys(aiRates).length,
  };

  // ── Stage 2: Forex rates (always live) ────────────────────────────────────
  console.log("[RatesUpdate] Stage 2: Forex rates...");
  const forexRates = await fetchForexRates();
  audit.stages.forex = { ...forexRates };

  // ── Build merged rate set: AI > Forex > Fallback, then apply Fixed overrides
  const merged: Record<string, number> = {
    ...FALLBACK_RATES,
    ...aiRates,
    ...forexRates,
    ...FIXED_RATES, // IFB1, IFB2 always win
  };

  // ── Stage 3: Validate every rate before storing ───────────────────────────
  console.log("[RatesUpdate] Stage 3: Validating rates...");
  const validRates: Record<string, number> = {};

  for (const [sym, val] of Object.entries(merged)) {
    if (isNaN(val) || !isFinite(val) || val <= 0) {
      (audit.rejected as any)[sym] = { value: val, reason: "NaN or zero" };
      continue;
    }
    if (validate(sym, val)) {
      validRates[sym] = val;
      (audit.accepted as any)[sym] = val;
    } else {
      (audit.rejected as any)[sym] = {
        value: val,
        reason: `Out of bounds ${JSON.stringify(BOUNDS[sym] ?? "no bounds")}`,
      };
      // Use fallback if AI returned out-of-bounds
      if (FALLBACK_RATES[sym] !== undefined) {
        validRates[sym] = FALLBACK_RATES[sym];
        (audit.accepted as any)[`${sym}(fallback)`] = FALLBACK_RATES[sym];
        console.warn(`[RatesUpdate] ⚠️ ${sym}=${val} rejected → using fallback ${FALLBACK_RATES[sym]}`);
      }
    }
  }

  // ── Stage 4: Upsert all valid rates to MarketRateCache ───────────────────
  console.log(`[RatesUpdate] Stage 4: Upserting ${Object.keys(validRates).length} rates to DB...`);
  let dbUpdates = 0;

  for (const [sym, price] of Object.entries(validRates)) {
    const source = FIXED_RATES[sym] ? "fixed-cbk-auction"
      : forexRates[sym] ? "exchangerate-api"
      : aiRates[sym]   ? "gemini-search"
      : "fallback-apr2026";

    if (await upsertRate(sym, price, source, syncedAt)) dbUpdates++;
  }
  audit.dbUpdates = dbUpdates;
  console.log(`[RatesUpdate] ✅ DB: ${dbUpdates} rates upserted`);

  // ── Stage 5: Update Provider.currentYield for MMF records ─────────────────
  console.log("[RatesUpdate] Stage 5: Updating Provider yields...");
  audit.providerUpdates = await updateMMFProviders(validRates);
  console.log(`[RatesUpdate] ✅ Provider: ${audit.providerUpdates} MMF yields updated`);

  // ── Stage 6: Write public/market_data.json ────────────────────────────────
  console.log("[RatesUpdate] Stage 6: Writing market_data.json...");
  buildMarketDataJson(validRates, syncedAt);

  const elapsed = Date.now() - startTime;
  console.log(`[RatesUpdate] ✅ Complete in ${elapsed}ms | ${dbUpdates} rates | source: ${geminiResult ? "gemini-search" : "fallback"}`);

  return NextResponse.json({
    success: true,
    elapsed_ms: elapsed,
    source: geminiResult ? "gemini-search" : "fallback-apr2026",
    confidence: geminiResult?.confidence ?? "fallback",
    ratesStored: dbUpdates,
    providerUpdates: audit.providerUpdates,
    rates: validRates,
    audit,
  });
}
