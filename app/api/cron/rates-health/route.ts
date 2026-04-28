/**
 * app/api/cron/rates-health/route.ts
 * Daily staleness check for the rate-sync pipeline.
 *
 * Reads the freshest MarketRateCache row. If lastSyncedAt is older than
 * the threshold (default 36h), sends an alert email so we know the
 * scheduled rates-update / rates-sync / market-sync crons silently
 * stopped firing — otherwise stale rates would quietly leak to users.
 *
 * Triggered by Vercel cron. Manual: GET /api/cron/rates-health?secret=CRON_SECRET
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const CRON_SECRET = process.env.CRON_SECRET ?? "";
const STALENESS_HOURS = Number(process.env.RATE_STALENESS_HOURS ?? 36);

function alertRecipient(): string | null {
  return (
    process.env.ALERT_EMAIL ||
    process.env.ADMIN_EMAIL ||
    process.env.EMAIL_FROM ||
    process.env.SMTP_USER ||
    null
  );
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const isVercelCron = req.headers.get("user-agent")?.includes("vercel-cron");
  if (!isVercelCron && secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const latest = await prisma.marketRateCache.findFirst({
    orderBy: { lastSyncedAt: "desc" },
    select: { symbol: true, lastSyncedAt: true, source: true },
  });

  if (!latest) {
    return await alert("Rate sync NEVER ran — MarketRateCache is empty.", {
      hoursStale: null,
      lastSymbol: null,
      lastSyncedAt: null,
    });
  }

  const hoursStale = (Date.now() - new Date(latest.lastSyncedAt).getTime()) / 3_600_000;

  if (hoursStale > STALENESS_HOURS) {
    return await alert(
      `Rate sync is ${hoursStale.toFixed(1)}h stale (threshold ${STALENESS_HOURS}h).`,
      {
        hoursStale: Number(hoursStale.toFixed(1)),
        lastSymbol: latest.symbol,
        lastSyncedAt: latest.lastSyncedAt.toISOString(),
        source: latest.source,
      }
    );
  }

  return NextResponse.json({
    ok: true,
    fresh: true,
    hoursStale: Number(hoursStale.toFixed(1)),
    threshold: STALENESS_HOURS,
    lastSymbol: latest.symbol,
    lastSyncedAt: latest.lastSyncedAt.toISOString(),
  });
}

async function alert(reason: string, ctx: Record<string, unknown>) {
  const to = alertRecipient();
  console.warn("[rates-health] STALE", reason, ctx);

  if (!to) {
    return NextResponse.json(
      { ok: false, alerted: false, reason, ctx, error: "No alert recipient configured (set ALERT_EMAIL)." },
      { status: 200 }
    );
  }

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0f172a;color:#e2e8f0;border-radius:16px;">
      <h2 style="color:#f87171;margin:0 0 12px;font-size:20px;">⚠️ Rate Sync Stale</h2>
      <p style="margin:0 0 16px;line-height:1.5;">${reason}</p>
      <pre style="background:#020617;color:#a5b4fc;padding:12px;border-radius:8px;font-size:12px;overflow:auto;">${JSON.stringify(ctx, null, 2)}</pre>
      <p style="margin:16px 0 0;color:#94a3b8;font-size:12px;">Check Vercel cron logs for /api/cron/rates-update, /api/cron/market-sync, /api/cron/rates-sync.</p>
    </div>
  `;

  const sent = await sendEmail({
    to,
    subject: "🚨 Sentil — Market rates are stale",
    html,
  });

  return NextResponse.json({ ok: false, alerted: sent, recipient: to, reason, ctx });
}
