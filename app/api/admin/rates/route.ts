/**
 * app/api/admin/rates/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * ADMIN RATE OVERRIDE — Manual rate updates when all automated sources fail
 *
 * POST /api/admin/rates — Bulk upsert rates from admin dashboard
 * GET  /api/admin/rates — View all current DB rates + staleness info
 *
 * Auth: Admin session OR Bearer CRON_SECRET
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const CRON_SECRET = (process.env.CRON_SECRET ?? "sentil-cron-2026").trim();

// ── Auth check ──────────────────────────────────────────────────────────────
async function isAuthorized(req: NextRequest): Promise<boolean> {
  // Bearer token
  const authHeader = (req.headers.get("authorization") ?? "").trim();
  if (authHeader === `Bearer ${CRON_SECRET}`) return true;

  // Query param secret
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret === CRON_SECRET) return true;

  // Admin session cookie
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const token = cookieStore.get("session-token")?.value;
    if (token) {
      const { jwtVerify } = await import("jose");
      const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "sentil-jwt-secret-2026");
      const { payload } = await jwtVerify(token, secret);
      return payload.role === "ADMIN";
    }
  } catch {}

  return false;
}

// ── Hard-bounds validation — reject rates outside these ranges ───────────────
const BOUNDS: Record<string, [number, number]> = {
  CBK_RATE:      [5.0,  16.0],
  "91-TBILL":    [3.0,  20.0],
  "182-TBILL":   [3.0,  20.0],
  "364-TBILL":   [3.0,  20.0],
  "2YR-BOND":    [4.0,  20.0],
  "IFB1-2024":   [18.46, 18.46],
  "IFB2-2023":   [17.93, 17.93],
  // MMFs — wide range to avoid false rejections
  "ETCA":        [3.0, 25.0],
  "LOFTY-MMF":   [3.0, 25.0],
  "CYTONN-MMF":  [3.0, 25.0],
  "NCBA-MMF":    [3.0, 25.0],
  "KCB-MMF":     [3.0, 25.0],
  "BRITAM-MMF":  [3.0, 25.0],
  "SANLAM-MMF":  [3.0, 25.0],
  "CIC-MMF":     [3.0, 25.0],
  "OLDMUT-MMF":  [3.0, 25.0],
  "ABSA-MMF":    [3.0, 25.0],
  "ICEA-MMF":    [3.0, 25.0],
  "EQUITY-MMF":  [3.0, 25.0],
  "COOP-MMF":    [3.0, 25.0],
  // Forex
  "USD-KES":     [100.0, 200.0],
  "EUR-KES":     [100.0, 250.0],
  "GBP-KES":     [120.0, 280.0],
};

function validateRate(symbol: string, value: number): { valid: boolean; reason?: string } {
  if (isNaN(value) || !isFinite(value) || value <= 0) {
    return { valid: false, reason: "Invalid number" };
  }
  const bounds = BOUNDS[symbol];
  if (bounds && (value < bounds[0] || value > bounds[1])) {
    return { valid: false, reason: `Out of bounds [${bounds[0]}, ${bounds[1]}]` };
  }
  return { valid: true };
}

// ── GET: View all current rates ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rates = await prisma.marketRateCache.findMany({
      orderBy: { lastSyncedAt: "desc" },
    });

    const freshest = rates[0]?.lastSyncedAt;
    const staleHours = freshest ? (Date.now() - new Date(freshest).getTime()) / 3_600_000 : null;

    return NextResponse.json({
      success: true,
      count: rates.length,
      freshestSync: freshest?.toISOString() ?? null,
      staleHours: staleHours ? +staleHours.toFixed(1) : null,
      isStale: staleHours ? staleHours > 26 : true,
      rates: rates.map(r => ({
        symbol: r.symbol,
        price: r.price,
        source: r.source,
        lastSyncedAt: r.lastSyncedAt.toISOString(),
        ageHours: +((Date.now() - new Date(r.lastSyncedAt).getTime()) / 3_600_000).toFixed(1),
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── POST: Bulk upsert rates ─────────────────────────────────────────────────
// Body: { rates: { "ETCA": 12.01, "91-TBILL": 7.78, "USD-KES": 129.50, ... } }
export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const inputRates: Record<string, number> = body.rates ?? {};

    if (Object.keys(inputRates).length === 0) {
      return NextResponse.json({ error: "No rates provided. Send { rates: { SYMBOL: value, ... } }" }, { status: 400 });
    }

    const syncedAt = new Date();
    const accepted: Record<string, number> = {};
    const rejected: Record<string, { value: number; reason: string }> = {};
    let dbUpdates = 0;

    for (const [symbol, value] of Object.entries(inputRates)) {
      const numVal = Number(value);
      const validation = validateRate(symbol, numVal);

      if (!validation.valid) {
        rejected[symbol] = { value: numVal, reason: validation.reason! };
        continue;
      }

      try {
        await prisma.marketRateCache.upsert({
          where: { symbol },
          update: { price: numVal, source: "admin-override", lastSyncedAt: syncedAt },
          create: { symbol, price: numVal, source: "admin-override", lastSyncedAt: syncedAt },
        });
        accepted[symbol] = numVal;
        dbUpdates++;
      } catch (err: any) {
        rejected[symbol] = { value: numVal, reason: `DB error: ${err.message}` };
      }
    }

    // Also update Provider.currentYield for MMF symbols
    const MMF_PROVIDER_MAP: Record<string, string[]> = {
      "ETCA":        ["Etica", "Zidi"],
      "LOFTY-MMF":   ["Lofty"],
      "CYTONN-MMF":  ["Cytonn"],
      "NCBA-MMF":    ["NCBA"],
      "KCB-MMF":     ["KCB"],
      "BRITAM-MMF":  ["Britam"],
      "SANLAM-MMF":  ["Sanlam"],
      "CIC-MMF":     ["CIC"],
      "OLDMUT-MMF":  ["Old Mutual"],
      "ABSA-MMF":    ["Absa"],
      "ICEA-MMF":    ["ICEA"],
      "EQUITY-MMF":  ["Equity"],
      "COOP-MMF":    ["Co-op"],
    };

    let providerUpdates = 0;
    for (const [symbol, yield_] of Object.entries(accepted)) {
      const keywords = MMF_PROVIDER_MAP[symbol];
      if (!keywords) continue;
      for (const kw of keywords) {
        try {
          const result = await prisma.provider.updateMany({
            where: { name: { contains: kw, mode: "insensitive" }, type: "MONEY_MARKET" },
            data: { currentYield: yield_, updatedAt: syncedAt },
          });
          providerUpdates += result.count;
        } catch {}
      }
    }

    console.log(`[Admin Rates] ✅ ${dbUpdates} rates updated by admin at ${syncedAt.toISOString()}`);

    return NextResponse.json({
      success: true,
      syncedAt: syncedAt.toISOString(),
      dbUpdates,
      providerUpdates,
      accepted,
      rejected,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
