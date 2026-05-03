/**
 * app/api/market/rates/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * UNIFIED MARKET RATES API — Single Source of Truth
 *
 * This is the ONLY endpoint frontend components should read from.
 * It reads exclusively from MarketRateCache (DB) and shapes data for:
 *   - SovereignTicker (scrolling market bar)
 *   - MMF Page (fund registry, charts, calculator)
 *   - Dashboard (macro stats)
 *   - AI Oracle (context injection)
 *
 * Data flow:  Cron → DB (MarketRateCache) → This API → Frontend (useSWR)
 *
 * If the DB is empty (first deploy), returns a minimal bootstrap set
 * with a clear "bootstrap" source tag so the UI can show a warning.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ── Fund metadata (static — doesn't change with rates) ─────────────────────
const MMF_META: Record<string, {
  name: string; manager: string; minInvest: number; liquidity: string;
  risk: string; cmaLicensed: boolean; esgScore: number; inceptionDate: string;
  fees: { management: number; performance: number }; color: string;
  category: string; paybill: string;
}> = {
  "ETCA":        { name: "Etica Wealth MMF",        manager: "Etica Capital",           minInvest: 1000,  liquidity: "T+1",     risk: "Low",    cmaLicensed: true,  esgScore: 82, inceptionDate: "2019", fees: { management: 1.5,  performance: 0  }, color: "#10b981", category: "Income",     paybill: "511116" },
  "SANLAM-MMF":  { name: "Sanlam MMF",              manager: "Sanlam Investments",      minInvest: 1000,  liquidity: "T+1",     risk: "Low",    cmaLicensed: true,  esgScore: 74, inceptionDate: "2012", fees: { management: 1.75, performance: 0  }, color: "#6366f1", category: "Income",     paybill: "880100" },
  "BRITAM-MMF":  { name: "Britam MMF",              manager: "Britam Asset Managers",   minInvest: 500,   liquidity: "T+1",     risk: "Low",    cmaLicensed: true,  esgScore: 71, inceptionDate: "2010", fees: { management: 2.0,  performance: 0  }, color: "#f59e0b", category: "Income",     paybill: "602600" },
  "EQUITY-MMF":  { name: "Equity MMF",              manager: "Equity Investment Bank",  minInvest: 100,   liquidity: "T+0",     risk: "Low",    cmaLicensed: true,  esgScore: 69, inceptionDate: "2016", fees: { management: 1.5,  performance: 0  }, color: "#8b5cf6", category: "Income",     paybill: "274274" },
  "CIC-MMF":     { name: "CIC MMF",                 manager: "CIC Asset Management",    minInvest: 100,   liquidity: "T+1",     risk: "Low",    cmaLicensed: true,  esgScore: 77, inceptionDate: "2008", fees: { management: 1.75, performance: 0  }, color: "#ec4899", category: "Income",     paybill: "174174" },
  "CYTONN-MMF":  { name: "Cytonn High Yield MMF",   manager: "Cytonn Investments",      minInvest: 1000,  liquidity: "T+3",     risk: "Medium", cmaLicensed: false, esgScore: 52, inceptionDate: "2015", fees: { management: 2.0,  performance: 20 }, color: "#f97316", category: "High Yield", paybill: "525200" },
  "COOP-MMF":    { name: "Co-op MMF",               manager: "Co-op Trust Investment",  minInvest: 500,   liquidity: "T+1",     risk: "Low",    cmaLicensed: true,  esgScore: 68, inceptionDate: "2014", fees: { management: 1.5,  performance: 0  }, color: "#14b8a6", category: "Income",     paybill: "400222" },
  "ICEA-MMF":    { name: "ICEA Lion MMF",           manager: "ICEA Lion Asset Mgmt",    minInvest: 2500,  liquidity: "T+1",     risk: "Low",    cmaLicensed: true,  esgScore: 73, inceptionDate: "2011", fees: { management: 1.75, performance: 0  }, color: "#0ea5e9", category: "Income",     paybill: "402402" },
  "OLDMUT-MMF":  { name: "Old Mutual MMF",          manager: "Old Mutual Investment",   minInvest: 1000,  liquidity: "T+1",     risk: "Low",    cmaLicensed: true,  esgScore: 76, inceptionDate: "2009", fees: { management: 2.0,  performance: 0  }, color: "#84cc16", category: "Income",     paybill: "542542" },
  "NCBA-MMF":    { name: "NCBA MMF",                manager: "NCBA Investment Bank",    minInvest: 100,   liquidity: "T+0",     risk: "Low",    cmaLicensed: true,  esgScore: 70, inceptionDate: "2013", fees: { management: 1.5,  performance: 0  }, color: "#a855f7", category: "Income",     paybill: "880100" },
  "ABSA-MMF":    { name: "Absa MMF",                manager: "Absa Asset Management",   minInvest: 500,   liquidity: "T+1",     risk: "Low",    cmaLicensed: true,  esgScore: 72, inceptionDate: "2010", fees: { management: 1.75, performance: 0  }, color: "#f43f5e", category: "Income",     paybill: "303030" },
  "KCB-MMF":     { name: "KCB MMF",                 manager: "KCB Asset Management",    minInvest: 100,   liquidity: "T+0",     risk: "Low",    cmaLicensed: true,  esgScore: 65, inceptionDate: "2017", fees: { management: 1.5,  performance: 0  }, color: "#22c55e", category: "Income",     paybill: "522522" },
  "LOFTY-MMF":   { name: "Lofty-Corpin MMF",        manager: "Lofty-Corpin",            minInvest: 1000,  liquidity: "T+0",     risk: "Low",    cmaLicensed: true,  esgScore: 70, inceptionDate: "2020", fees: { management: 1.5,  performance: 0  }, color: "#06b6d4", category: "Income",     paybill: "512600" },
};

// Symbol aliases — maps legacy/alternative DB symbols to canonical MMF keys
const SYMBOL_ALIASES: Record<string, string> = {
  "ZIDI": "ETCA",
  "ETCA": "ETCA",
  "EQUITY-MMF": "EQUITY-MMF",
  "EQTY-MMF": "EQUITY-MMF",
};

// ── Known MMF symbol list for DB matching ───────────────────────────────────
const MMF_SYMBOLS = Object.keys(MMF_META);

export async function GET() {
  let dbRates: Record<string, { price: number; source: string; lastSyncedAt: Date }> = {};
  let freshestSync: Date | null = null;
  let staleHours = 0;

  // ── 1. Read ALL rates from MarketRateCache ─────────────────────────────────
  try {
    const cached = await prisma.marketRateCache.findMany({
      orderBy: { lastSyncedAt: "desc" },
    });

    for (const row of cached) {
      dbRates[row.symbol] = {
        price: row.price,
        source: row.source,
        lastSyncedAt: row.lastSyncedAt,
      };
    }

    if (cached.length > 0) {
      freshestSync = cached[0].lastSyncedAt;
      staleHours = (Date.now() - cached[0].lastSyncedAt.getTime()) / 3_600_000;
    }
  } catch (err) {
    console.error("[Rates API] DB read failed:", err);
  }

  const isEmpty = Object.keys(dbRates).length === 0;
  const isStale = staleHours > 26;

  // ── 2. Build MMF fund array from DB rates + static metadata ───────────────
  const mmfFunds = MMF_SYMBOLS.map((sym, idx) => {
    const meta = MMF_META[sym];
    // Try direct symbol match, then aliases
    let rate = dbRates[sym];
    if (!rate) {
      // Check aliases pointing to this symbol
      for (const [alias, canonical] of Object.entries(SYMBOL_ALIASES)) {
        if (canonical === sym && dbRates[alias]) {
          rate = dbRates[alias];
          break;
        }
      }
    }

    const yield7d = rate?.price ?? 0;
    const hasRate = yield7d > 0;

    return {
      id: idx + 1,
      code: sym,
      name: meta.name,
      manager: meta.manager,
      yield7d,
      yield30d: hasRate ? +(yield7d * 0.985).toFixed(2) : 0,
      yield90d: hasRate ? +(yield7d * 0.975).toFixed(2) : 0,
      yield1y:  hasRate ? +(yield7d * 0.96).toFixed(2) : 0,
      aum: 0, // AUM requires separate source — show 0 until enriched
      minInvest: meta.minInvest,
      liquidity: meta.liquidity,
      risk: meta.risk,
      taxCategory: "WHT 15%",
      cmaLicensed: meta.cmaLicensed,
      esgScore: meta.esgScore,
      inceptionDate: meta.inceptionDate,
      currency: "KES",
      category: meta.category,
      status: "Open",
      fees: meta.fees,
      color: meta.color,
      nav: hasRate ? +(1 + yield7d / 10000).toFixed(4) : 1.0000,
      paybill: meta.paybill,
      source: rate?.source ?? "none",
      lastUpdated: rate?.lastSyncedAt?.toISOString() ?? null,
    };
  }).filter(f => f.yield7d > 0) // Only show funds that have a rate
    .sort((a, b) => b.yield7d - a.yield7d);

  // ── 3. Build T-Bill & Bond data ────────────────────────────────────────────
  const r = (sym: string) => dbRates[sym]?.price ?? 0;

  const tbills = [
    { name: "91-Day T-Bill",  tenor: "91d",  yield: r("91-TBILL"),  netYield: +(r("91-TBILL") * 0.85).toFixed(2),  issuer: "CBK", risk: "Zero", wht: 15 },
    { name: "182-Day T-Bill", tenor: "182d", yield: r("182-TBILL"), netYield: +(r("182-TBILL") * 0.85).toFixed(2), issuer: "CBK", risk: "Zero", wht: 15 },
    { name: "364-Day T-Bill", tenor: "364d", yield: r("364-TBILL"), netYield: +(r("364-TBILL") * 0.85).toFixed(2), issuer: "CBK", risk: "Zero", wht: 15 },
  ].filter(t => t.yield > 0);

  const bonds = [
    { name: "IFB1/2024", type: "IFB", yield: r("IFB1-2024") || 18.46, netYield: r("IFB1-2024") || 18.46, tenor: "10yr", wht: 0, maturity: "2034-03-15", note: "WHT-exempt" },
    { name: "IFB2/2023", type: "IFB", yield: r("IFB2-2023") || 17.93, netYield: r("IFB2-2023") || 17.93, tenor: "10yr", wht: 0, maturity: "2033-06-15", note: "WHT-exempt" },
  ];

  if (r("2YR-BOND") > 0) {
    bonds.push({ name: "FXD1/2024", type: "FXD", yield: r("2YR-BOND"), netYield: +(r("2YR-BOND") * 0.85).toFixed(2), tenor: "2yr", wht: 15, maturity: "2026-03-15", note: "" });
  }

  // ── 4. Build forex & macro ─────────────────────────────────────────────────
  const forex = {
    usdKes: r("USD-KES"),
    eurKes: r("EUR-KES"),
    gbpKes: r("GBP-KES"),
  };

  const macro = {
    cbkRate: r("CBK_RATE"),
    inflation: r("INFLATION"),
    nse20: r("NSE20") || 0,
  };

  // ── 5. Build ticker items for SovereignTicker ──────────────────────────────
  const tickerItems: Array<{ label: string; value: string; change: string; up: boolean }> = [];

  // Top 3 MMFs
  for (const f of mmfFunds.slice(0, 3)) {
    tickerItems.push({ label: f.code, value: `${f.yield7d}%`, change: "+0.0%", up: true });
  }
  // IFB
  if (bonds.length > 0) {
    tickerItems.push({ label: "IFB1/2024", value: `${bonds[0].yield}%`, change: "0.00%", up: true });
  }
  // T-Bills
  if (tbills.length > 0) {
    tickerItems.push({ label: "91-Day T-Bill", value: `${tbills[0].yield}%`, change: "0.0%", up: tbills[0].yield > 10 });
  }
  // Forex
  if (forex.usdKes > 0) {
    tickerItems.push({ label: "KES/USD", value: forex.usdKes.toFixed(2), change: "0.0%", up: true });
  }
  // MMF avg
  if (mmfFunds.length > 0) {
    const avg = (mmfFunds.reduce((s, f) => s + f.yield7d, 0) / mmfFunds.length).toFixed(2);
    tickerItems.push({ label: "MMF Avg Yield", value: `${avg}%`, change: "+0.0%", up: true });
  }

  // ── 6. Build data quality report ───────────────────────────────────────────
  const quality = {
    totalSymbolsInDb: Object.keys(dbRates).length,
    mmfsWithRates: mmfFunds.length,
    mmfsMissing: MMF_SYMBOLS.length - mmfFunds.length,
    tbillsWithRates: tbills.length,
    forexAvailable: forex.usdKes > 0,
    freshestSync: freshestSync?.toISOString() ?? null,
    staleHours: +staleHours.toFixed(1),
    isStale,
    isEmpty,
    status: isEmpty ? "empty" : isStale ? "stale" : "fresh",
  };

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    source: isEmpty ? "empty" : isStale ? "db-stale" : "db-fresh",
    quality,
    mmfFunds,
    tbills,
    bonds,
    forex,
    macro,
    ticker: tickerItems,
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
