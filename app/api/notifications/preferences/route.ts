/**
 * app/api/notifications/preferences/route.ts
 * GET  → fetch current alert preferences for authenticated user
 * POST → save/update preferences
 * Uses raw SQL to avoid Prisma client type cache issues.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rows: any[] = await prisma.$queryRaw`
      SELECT
        "whatsappEnabled",
        "frequency",
        COALESCE("watchlistAlerts", true)     AS "watchlistAlerts",
        COALESCE("marketMoversAlerts", false)  AS "marketMoversAlerts",
        COALESCE("aiOracleAlerts", true)       AS "aiOracleAlerts",
        COALESCE("yieldThreshold", 18.0)       AS "yieldThreshold"
      FROM "AlertPreference"
      WHERE "userId" = ${session.id}
      LIMIT 1
    `;

    return NextResponse.json({ prefs: rows[0] ?? null });
  } catch {
    return NextResponse.json({ prefs: null });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    whatsappEnabled = true,
    frequency = "DAILY",
    watchlistAlerts = true,
    marketMoversAlerts = false,
    aiOracleAlerts = true,
    yieldThreshold = null,
  } = body;

  const VALID_FREQS = ["DAILY", "TWICE_DAILY", "THREE_DAILY", "WEEKLY", "MARKET_ALERTS_ONLY", "NONE"];
  if (!VALID_FREQS.includes(frequency)) {
    return NextResponse.json({ error: "Invalid frequency" }, { status: 400 });
  }

  // Gate THREE_DAILY behind premium
  if (frequency === "THREE_DAILY") {
    const user = await prisma.user.findUnique({ where: { id: session.id }, select: { isPremium: true } });
    if (!user?.isPremium) {
      return NextResponse.json({ error: "THREE_DAILY requires Pro subscription" }, { status: 403 });
    }
  }

  try {
    const threshold = yieldThreshold ? parseFloat(yieldThreshold) : null;

    // Check if record exists
    const existing: any[] = await prisma.$queryRaw`
      SELECT id FROM "AlertPreference" WHERE "userId" = ${session.id} LIMIT 1
    `;

    if (existing.length > 0) {
      await prisma.$executeRaw`
        UPDATE "AlertPreference"
        SET
          "whatsappEnabled"    = ${whatsappEnabled},
          "frequency"          = ${frequency},
          "watchlistAlerts"    = ${watchlistAlerts},
          "marketMoversAlerts" = ${marketMoversAlerts},
          "aiOracleAlerts"     = ${aiOracleAlerts},
          "yieldThreshold"     = ${threshold},
          "updatedAt"          = NOW()
        WHERE "userId" = ${session.id}
      `;
    } else {
      await prisma.$executeRaw`
        INSERT INTO "AlertPreference"
          (id, "userId", "emailEnabled", "whatsappEnabled", "frequency",
           "watchlistAlerts", "marketMoversAlerts", "aiOracleAlerts",
           "yieldThreshold", "createdAt", "updatedAt")
        VALUES
          (gen_random_uuid(), ${session.id}, false, ${whatsappEnabled}, ${frequency},
           ${watchlistAlerts}, ${marketMoversAlerts}, ${aiOracleAlerts},
           ${threshold}, NOW(), NOW())
      `;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Preferences] Save error:", err);
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
}
