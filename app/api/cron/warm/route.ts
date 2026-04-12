/**
 * app/api/cron/warm/route.ts
 * Pre-warm the WhatsApp webhook serverless function every 5 minutes
 * to eliminate cold start lag (1-3s delay on first message).
 */
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const startMs = Date.now();

  // Touch the webhook handler to keep it warm in memory
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.sentill.africa";

  try {
    // Ping the two most-used endpoints to pre-warm their module cache
    await Promise.allSettled([
      fetch(`${base}/api/whatsapp/webhook`, { method: "GET" }),   // GET = verify endpoint (cheap)
      fetch(`${base}/api/market/nse`, { cache: "no-store" }),     // NSE data refresh
    ]);
  } catch {
    // Ignore — the goal is just to trigger the Lambda, not parse the response
  }

  const elapsedMs = Date.now() - startMs;
  const timestamp = new Date().toISOString();

  console.log(`[Warm][${timestamp}] Pre-warm ping completed in ${elapsedMs}ms`);

  return NextResponse.json({
    ok: true,
    message: "Functions warmed",
    elapsedMs,
    timestamp,
  });
}
