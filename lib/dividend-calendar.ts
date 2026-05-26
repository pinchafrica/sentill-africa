/**
 * lib/dividend-calendar.ts
 * Authoritative NSE dividend & book-closure calendar for Kenya — May/June/July 2026.
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

// ── May / June / July 2026 Book Closures ────────────────────────────────────
export const DIVIDEND_CALENDAR: DividendEvent[] = [
  {
    symbol: "BOC",
    name: "BOC Kenya",
    dividend: 10.35,
    bookClosureDate: new Date("2026-05-31"),
    dividendYield: 8.4,
    currentPrice: 123.00,
    notes: "Industrial gases firm — consistent high dividend. Own before May 31 to qualify.",
  },
  {
    symbol: "KCB",
    name: "KCB Group PLC",
    dividend: 3.09,
    bookClosureDate: new Date("2026-06-30"),
    dividendYield: 8.3,
    currentPrice: 37.20,
    notes: "Interim FY2026 dividend expected. Highest dividend yield in banking sector.",
  },
  {
    symbol: "COOP",
    name: "Co-operative Bank of Kenya",
    dividend: 1.00,
    bookClosureDate: new Date("2026-06-30"),
    dividendYield: 8.1,
    currentPrice: 12.55,
    notes: "Interim 2026 dividend. SACCO banking network provides strong deposit base.",
  },
  {
    symbol: "EQTY",
    name: "Equity Group Holdings",
    dividend: 2.50,
    bookClosureDate: new Date("2026-07-15"),
    dividendYield: 5.2,
    currentPrice: 48.05,
    notes: "Interim dividend — Pan-African banking growth driving consistent payouts.",
  },
  {
    symbol: "SCOM",
    name: "Safaricom PLC",
    dividend: 0.87,
    bookClosureDate: new Date("2026-07-31"),
    dividendYield: 4.5,
    currentPrice: 19.35,
    notes: "Interim dividend. M-Pesa and Ziidi platform driving steady income growth.",
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
