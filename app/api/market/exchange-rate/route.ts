import { NextResponse } from "next/server";

// Free tier — no API key needed. Refreshes every 24h on their end.
const ER_API = "https://open.er-api.com/v6/latest/USD";

// Hard fallback in case the free API is down
const FALLBACK = {
  KES: 129.50,
  EUR: 0.92,
  GBP: 0.79,
  ZAR: 18.62,
  UGX: 3720,
  TZS: 2530,
};

let cache: { rates: Record<string, number>; ts: number } | null = null;
const CACHE_TTL = 3600_000; // 1 hour

export async function GET() {
  // Serve from memory cache if fresh
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json({ rates: cache.rates, source: "cache", ts: new Date(cache.ts).toISOString() });
  }

  try {
    const res = await fetch(ER_API, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();

    const rates: Record<string, number> = {};
    for (const [k, v] of Object.entries(FALLBACK)) {
      rates[k] = +(data.rates[k] ?? v).toFixed(4);
    }

    cache = { rates, ts: Date.now() };
    return NextResponse.json({ rates, source: "live", ts: new Date().toISOString(), base: "USD" });
  } catch (err: any) {
    console.warn("[ExchangeRate] Falling back to hardcoded rates:", err?.message);
    return NextResponse.json({ rates: FALLBACK, source: "fallback", ts: new Date().toISOString(), base: "USD" });
  }
}
