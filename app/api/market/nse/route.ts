import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── Yahoo Finance ticker mapping (NSE Kenya uses .NR suffix) ─────────────────
const NSE_TICKERS: Record<string, { name: string; sector: string; pe: number; divYield: number; cap: string; high52: number; low52: number }> = {
  "SCOM.NR":  { name: "Safaricom PLC",             sector: "Telecoms",      pe: 14.2, divYield: 7.8,  cap: "775B", high52: 22.50, low52: 14.50 },
  "EQTY.NR":  { name: "Equity Group Holdings",     sector: "Banking",       pe: 7.1,  divYield: 5.2,  cap: "181B", high52: 52.00, low52: 34.00 },
  "KCB.NR":   { name: "KCB Group PLC",             sector: "Banking",       pe: 5.8,  divYield: 8.1,  cap: "119B", high52: 40.00, low52: 26.00 },
  "EABL.NR":  { name: "East African Breweries",    sector: "Manufacturing", pe: 22.3, divYield: 3.8,  cap: "100B", high52: 165.00, low52: 118.00 },
  "COOP.NR":  { name: "Co-operative Bank",         sector: "Banking",       pe: 4.9,  divYield: 9.3,  cap: "74B",  high52: 15.00, low52: 10.00 },
  "ABSA.NR":  { name: "Absa Bank Kenya",           sector: "Banking",       pe: 6.2,  divYield: 7.5,  cap: "78B",  high52: 17.50, low52: 11.50 },
  "NCBA.NR":  { name: "NCBA Group",                sector: "Banking",       pe: 5.4,  divYield: 6.8,  cap: "46B",  high52: 52.00, low52: 34.00 },
  "BAT.NR":   { name: "BAT Kenya",                 sector: "Manufacturing", pe: 11.5, divYield: 12.4, cap: "43B",  high52: 500.00, low52: 390.00 },
  "SCBK.NR":  { name: "Standard Chartered Kenya",  sector: "Banking",       pe: 9.8,  divYield: 6.1,  cap: "46B",  high52: 220.00, low52: 152.00 },
  "KEGN.NR":  { name: "KenGen PLC",               sector: "Energy",        pe: 18.2, divYield: 4.5,  cap: "32B",  high52: 6.50,  low52: 3.80 },
  "STBK.NR":  { name: "Stanbic Holdings",          sector: "Banking",       pe: 7.3,  divYield: 5.9,  cap: "44B",  high52: 130.00, low52: 88.00 },
  "BAMB.NR":  { name: "Bamburi Cement",            sector: "Manufacturing", pe: 13.7, divYield: 4.2,  cap: "15B",  high52: 65.00,  low52: 41.25 },
  "KNRE.NR":  { name: "Kenya Reinsurance",         sector: "Insurance",     pe: 8.4,  divYield: 11.2, cap: "5B",   high52: 3.00,  low52: 1.80 },
  "KPLC.NR":  { name: "Kenya Power & Lighting",   sector: "Energy",        pe: 32.1, divYield: 0.0,  cap: "4B",   high52: 4.00,  low52: 1.80 },
  "BRIT.NR":  { name: "Britam Holdings",           sector: "Insurance",     pe: 16.3, divYield: 2.8,  cap: "18B",  high52: 9.50,  low52: 5.50 },
};

// ── Authoritative fallback data (benchmarked from NSE, March 2026) ────────────
const FALLBACK: Record<string, { price: number; change: number; percent: number; volume: string }> = {
  "SCOM.NR":  { price: 19.35, change: 0.35,  percent: 1.84,  volume: "48.2M" },
  "EQTY.NR":  { price: 48.05, change: -0.45, percent: -0.93, volume: "12.4M" },
  "KCB.NR":   { price: 37.20, change: 0.70,  percent: 1.92,  volume: "9.8M"  },
  "EABL.NR":  { price: 125.50,change: -2.50, percent: -1.95, volume: "1.2M"  },
  "COOP.NR":  { price: 12.55, change: 0.15,  percent: 1.21,  volume: "6.7M"  },
  "ABSA.NR":  { price: 14.30, change: -0.20, percent: -1.38, volume: "3.4M"  },
  "NCBA.NR":  { price: 49.85, change: 0.85,  percent: 1.73,  volume: "4.1M"  },
  "BAT.NR":   { price: 430.00,change: 5.00,  percent: 1.18,  volume: "180K"  },
  "SCBK.NR":  { price: 176.00,change: -1.00, percent: -0.56, volume: "420K"  },
  "KEGN.NR":  { price: 4.98,  change: 0.08,  percent: 1.63,  volume: "14.3M" },
  "STBK.NR":  { price: 112.50,change: -3.50, percent: -3.02, volume: "880K"  },
  "BAMB.NR":  { price: 64.50, change: 1.25,  percent: 1.97,  volume: "2.1M"  },
  "KNRE.NR":  { price: 2.38,  change: 0.03,  percent: 1.28,  volume: "5.6M"  },
  "KPLC.NR":  { price: 2.35,  change: -0.05, percent: -2.08, volume: "18.7M" },
  "BRIT.NR":  { price: 6.80,  change: 0.20,  percent: 3.03,  volume: "8.9M"  },
};

function formatVolume(n: number | undefined): string {
  if (!n) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

export async function GET(req: Request) {
  const source = { type: "live", ts: new Date().toISOString() };

  const buildFallbackStocks = (aiRatesRecord: Record<string, number> = {}) =>
    Object.entries(NSE_TICKERS).map(([ticker, meta]) => {
      const sym = ticker.replace(".NR", "");
      const symUpper = sym.toUpperCase();
      const fb = FALLBACK[ticker] || {};
      const price = aiRatesRecord[symUpper] || fb.price || 0;
      return {
        symbol: sym,
        ticker,
        name: meta.name,
        ...fb,
        price,
        high52: meta.high52,
        low52: meta.low52,
        pe: meta.pe,
        divYield: meta.divYield,
        cap: meta.cap,
        sector: meta.sector,
        source: aiRatesRecord[symUpper] ? "gemini-forced" : "fallback",
      };
    });

  let aiRates: Record<string, number> = {};

  try {
    // ── 1. Fetch live rates from the Background Cron Cache ────────────
    try {
      const cached = await prisma.$queryRawUnsafe<any[]>(`SELECT "symbol", "price" FROM "MarketRateCache"`);
      for (const row of cached) {
         aiRates[row.symbol.toUpperCase()] = row.price;
      }
    } catch (e) {
      console.warn("[NSE API] Database Cache fetch failed.");
    }

    const yahooFinance = (await import("yahoo-finance2")).default;
    const tickers = Object.keys(NSE_TICKERS);
    const quotes = await yahooFinance.quote(tickers, {}, { validateResult: false });
    const quoteArray = Array.isArray(quotes) ? quotes : [quotes];

    const stocks = quoteArray
      .filter((q: any) => q && q.regularMarketPrice)
      .map((q: any) => {
        const ticker = q.symbol as string;
        const sym = ticker.replace(".NR", "");
        const meta = NSE_TICKERS[ticker] || {};
        const fb = FALLBACK[ticker] || {};
        
        // Priority: AI Cache DB > Yahoo Price > Fallback
        const symUpper = sym.toUpperCase();
        const livePrice = aiRates[symUpper] || q.regularMarketPrice || fb.price || 0;

        return {
          symbol: sym,
          ticker,
          name: q.longName || q.shortName || meta.name,
          price: +livePrice.toFixed(2),
          change: +(q.regularMarketChange ?? fb.change ?? 0).toFixed(2),
          percent: +(q.regularMarketChangePercent ?? fb.percent ?? 0).toFixed(2),
          volume: formatVolume(q.regularMarketVolume),
          high52: +(q.fiftyTwoWeekHigh ?? meta.high52 ?? 0).toFixed(2),
          low52: +(q.fiftyTwoWeekLow ?? meta.low52 ?? 0).toFixed(2),
          pe: +(q.trailingPE ?? meta.pe ?? 0).toFixed(1),
          divYield: +(((q.trailingAnnualDividendYield ?? 0) * 100) || meta.divYield || 0).toFixed(1),
          cap: meta.cap,
          sector: meta.sector,
          source: aiRates[symUpper] ? "gemini-cron" : "yahoo",
        };
      });

    // Pad any missing tickers with fallback
    const returned = new Set(stocks.map((s: any) => s.ticker));
    for (const [ticker, meta] of Object.entries(NSE_TICKERS)) {
      if (!returned.has(ticker)) {
        const fb = FALLBACK[ticker] || {};
        const symUpper = ticker.replace(".NR", "").toUpperCase();
        const livePrice = aiRates[symUpper] || fb.price || 0;
        
        stocks.push({
          symbol: ticker.replace(".NR", ""),
          ticker,
          name: meta.name,
          ...fb,
          price: livePrice,
          high52: meta.high52,
          low52: meta.low52,
          pe: meta.pe,
          divYield: meta.divYield,
          cap: meta.cap,
          sector: meta.sector,
          source: aiRates[symUpper] ? "gemini-cron" : "fallback",
        });
      }
    }

    const finalSource = Object.keys(aiRates).length > 0 ? "gemini-cron" : "live";
    return NextResponse.json({ stocks, source: { type: finalSource, ts: source.ts }, count: stocks.length });

  } catch (err: any) {
    console.warn("[NSE API] Yahoo Finance error — using authoritative fallback:", err?.message);
    const stocks = buildFallbackStocks(aiRates || {});
    return NextResponse.json({ stocks, source: { type: "fallback", ts: source.ts, reason: err?.message }, count: stocks.length });
  }
}

