import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker") || "SCOM.NR";
  const period = searchParams.get("period") || "1y"; // 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y

  const periodMap: Record<string, string> = {
    "1d": "1d", "1w": "5d", "1M": "1mo", "3M": "3mo", "1Y": "1y", "5Y": "5y",
  };
  const interval = period === "1d" ? "5m" : period === "1w" ? "1h" : "1d";
  const range = periodMap[period] || "1y";

  try {
    const yahooFinance = (await import("yahoo-finance2")).default;
    const result = await yahooFinance.historical(ticker, {
      period1: getStartDate(range),
      interval: interval as any,
    }, { validateResult: false });

    const candles = ((result as any[]) || []).map((d: any) => ({
      time: new Date(d.date).toISOString().split("T")[0],
      open:  +(d.open  ?? 0).toFixed(2),
      high:  +(d.high  ?? 0).toFixed(2),
      low:   +(d.low   ?? 0).toFixed(2),
      close: +(d.close ?? 0).toFixed(2),
      volume: d.volume || 0,
    }));

    return NextResponse.json({ ticker, period, candles, count: candles.length, source: "yahoo" });
  } catch (err: any) {
    console.warn("[NSE History] Yahoo Finance error:", err?.message);
    return NextResponse.json({ ticker, period, candles: [], count: 0, source: "error", error: err?.message }, { status: 502 });
  }
}

function getStartDate(range: string): Date {
  const d = new Date();
  const map: Record<string, () => void> = {
    "1d":  () => d.setDate(d.getDate() - 1),
    "5d":  () => d.setDate(d.getDate() - 5),
    "1mo": () => d.setMonth(d.getMonth() - 1),
    "3mo": () => d.setMonth(d.getMonth() - 3),
    "6mo": () => d.setMonth(d.getMonth() - 6),
    "1y":  () => d.setFullYear(d.getFullYear() - 1),
    "5y":  () => d.setFullYear(d.getFullYear() - 5),
  };
  (map[range] || map["1y"])();
  return d;
}
