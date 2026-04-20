/**
 * lib/dividend-calendar.ts
 * Authoritative NSE dividend & book-closure calendar for Kenya — April/May 2026.
 * Update this object each quarter as CBK/NSE data is published.
 */

export interface DividendEvent {
  symbol: string;
  name: string;
  dividend: number;        // KES per share
  bookClosureDate: Date;   // Last day to hold shares to qualify
  paymentDate?: Date;      // Expected payment date (if announced)
  dividendYield?: number;  // Approximate % yield at current price
  currentPrice?: number;   // KES
  notes?: string;
}

// ── April / May 2026 Book Closures ────────────────────────────────────────────
export const DIVIDEND_CALENDAR: DividendEvent[] = [
  {
    symbol: "SCBK",
    name: "Standard Chartered Bank Kenya",
    dividend: 23.00,
    bookClosureDate: new Date("2026-04-30"),
    dividendYield: 9.2,
    currentPrice: 250.00,
    notes: "Final dividend. One of the largest per-share payouts on NSE.",
  },
  {
    symbol: "NCBA",
    name: "NCBA Group",
    dividend: 4.60,
    bookClosureDate: new Date("2026-04-30"),
    dividendYield: 5.0,
    currentPrice: 91.25,
    notes: "Final dividend. Strong MMF benchmark comparison play.",
  },
  {
    symbol: "ABSA",
    name: "Absa Bank Kenya",
    dividend: 1.85,
    bookClosureDate: new Date("2026-04-30"),
    dividendYield: 11.2,
    currentPrice: 16.50,
    notes: "Final dividend. High yield relative to share price.",
  },
  {
    symbol: "BOC",
    name: "BOC Kenya",
    dividend: 10.35,
    bookClosureDate: new Date("2026-05-31"),
    dividendYield: 8.4,
    currentPrice: 123.00,
    notes: "Industrial gases firm — outlier dividend this cycle.",
  },
  {
    symbol: "NSE",
    name: "Nairobi Securities Exchange",
    dividend: 1.00,
    bookClosureDate: new Date("2026-04-30"),
    dividendYield: 5.6,
    currentPrice: 17.80,
    notes: "Trading on momentum with Hedera/Hashgraph Innovation Lab launch.",
  },
  {
    symbol: "SASN",
    name: "Sasini PLC",
    dividend: 0.75,
    bookClosureDate: new Date("2026-05-15"),
    dividendYield: 3.8,
    currentPrice: 19.75,
    notes: "Agri sector momentum leader April 2026. Export demand peak.",
  },
];

/**
 * Returns dividends with book closures within `days` calendar days from today.
 */
export function getUpcomingDividends(days: number = 7): DividendEvent[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return DIVIDEND_CALENDAR.filter(
    d => d.bookClosureDate >= now && d.bookClosureDate <= cutoff
  ).sort((a, b) => a.bookClosureDate.getTime() - b.bookClosureDate.getTime());
}

/**
 * Returns all dividends with book closures in the future (for full calendar view).
 */
export function getAllUpcomingDividends(): DividendEvent[] {
  const now = new Date();
  return DIVIDEND_CALENDAR.filter(d => d.bookClosureDate >= now)
    .sort((a, b) => a.bookClosureDate.getTime() - b.bookClosureDate.getTime());
}

export function daysUntilClosure(event: DividendEvent): number {
  return Math.ceil((event.bookClosureDate.getTime() - Date.now()) / 86_400_000);
}

export function formatDividendAlert(event: DividendEvent): string {
  const days = daysUntilClosure(event);
  const urgency = days <= 2 ? "🚨 URGENT" : days <= 5 ? "⚡ SOON" : "📅 UPCOMING";
  const closureStr = event.bookClosureDate.toLocaleDateString("en-KE", {
    weekday: "short", day: "numeric", month: "long",
  });
  return (
    `${urgency} — *${event.symbol}* (${event.name})\n` +
    `💰 Dividend: *KES ${event.dividend.toFixed(2)}/share*\n` +
    `📅 Book Closure: *${closureStr}* _(${days} day${days !== 1 ? "s" : ""} away)_\n` +
    (event.dividendYield ? `📈 Yield: ~*${event.dividendYield}%* at current price\n` : "") +
    (event.notes ? `💡 _${event.notes}_` : "")
  );
}
