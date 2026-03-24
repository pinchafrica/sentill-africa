import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── Config ──────────────────────────────────────────────────────────────────
const WA_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const WA_ACCESS_TOKEN    = process.env.WHATSAPP_ACCESS_TOKEN!;
const CRON_SECRET        = process.env.CRON_SECRET || "sentil-cron-2025";

// ── Recipient numbers (international format, no '+') ─────────────────────────
// Admin number: +254706206160
const ADMIN_RECIPIENTS = ["254706206160"];

// ── Market snapshot data (in production, pull from your DB / live API) ────────
async function getMarketSnapshot() {
  // Top MMFs
  const topMMFs = [
    { name: "Zidi High Yield MMF",  yield: 18.20 },
    { name: "Etica Wealth MMF",     yield: 17.55 },
    { name: "Lofty Corban MMF",     yield: 16.80 },
  ];

  // Top T-Bill
  const tBill = { name: "364-Day T-Bill", grossYield: 16.45, netYield: 13.98 };

  // Top IFB
  const ifb = { name: "IFB1/2024", yield: 18.46, wht: "0%" };

  // Top NSE movers — in prod, replace with live NSE API call
  const nseMovers = [
    { ticker: "SCOM", price: 14.85, change: +2.1 },
    { ticker: "EQTY", price: 42.50, change: +1.4 },
    { ticker: "KCB",  price: 32.20, change: -0.8 },
  ];

  // Total active premium users
  let premiumUsers = 0;
  let totalPortfolioValue = 0;
  try {
    premiumUsers = await prisma.user.count({ where: { isPremium: true } });
    // Sum all portfolio asset values if your schema supports it
    // const assets = await prisma.portfolioAsset.aggregate({ _sum: { currentValue: true } });
    // totalPortfolioValue = assets._sum.currentValue ?? 0;
    totalPortfolioValue = premiumUsers * 125000; // estimated avg
  } catch (_) {
    premiumUsers = 0;
  }

  return { topMMFs, tBill, ifb, nseMovers, premiumUsers, totalPortfolioValue };
}

// ── Build WhatsApp message text ───────────────────────────────────────────────
function buildMessage(data: Awaited<ReturnType<typeof getMarketSnapshot>>) {
  const now  = new Date();
  const date = now.toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const time = now.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi" });

  return `
🦅 *SENTIL — Daily Market Intelligence*
_${date} · ${time} EAT_
━━━━━━━━━━━━━━━━━━━━

💰 *TOP MMF YIELDS TODAY*
${data.topMMFs.map((f, i) => `${i + 1}. ${f.name}: *${f.yield}%* p.a.`).join("\n")}

🏛️ *SOVEREIGN DEBT HIGHLIGHTS*
• 364-Day T-Bill: Gross *${data.tBill.grossYield}%* | Net *${data.tBill.netYield}%*
• ${data.ifb.name}: *${data.ifb.yield}%* (${data.ifb.wht} WHT – TAX FREE)

📈 *NSE TOP MOVERS*
${data.nseMovers.map(s => `• ${s.ticker}: KES ${s.price} (${s.change > 0 ? "▲" : "▼"}${Math.abs(s.change)}%)`).join("\n")}

👥 *PLATFORM STATS*
• Active Premium Users: *${data.premiumUsers}*
• Est. Managed Value: *KES ${(data.totalPortfolioValue / 1_000_000).toFixed(1)}M*

━━━━━━━━━━━━━━━━━━━━
🔗 sentil.africa/dashboard
_Sentil · AI-Powered Wealth Intelligence_
  `.trim();
}

// ── Send via Meta WhatsApp Cloud API ─────────────────────────────────────────
async function sendWhatsApp(to: string, text: string) {
  const url = `https://graph.facebook.com/v19.0/${WA_PHONE_NUMBER_ID}/messages`;

  const res = await fetch(url, {
    method:  "POST",
    headers: {
      Authorization: `Bearer ${WA_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type:    "individual",
      to,
      type:              "text",
      text:              { preview_url: false, body: text },
    }),
  });

  const json = await res.json();
  return { ok: res.ok, status: res.status, data: json };
}

// ── GET  (called by cron / Vercel Cron job) ───────────────────────────────────
export async function GET(req: NextRequest) {
  // Secure with a secret header or query param
  const secret = req.headers.get("x-cron-secret") || req.nextUrl.searchParams.get("secret");
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!WA_PHONE_NUMBER_ID || !WA_ACCESS_TOKEN) {
    return NextResponse.json({
      error: "WhatsApp env vars not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in .env.local",
    }, { status: 500 });
  }

  try {
    const snapshot = await getMarketSnapshot();
    const message  = buildMessage(snapshot);

    const results = await Promise.all(
      ADMIN_RECIPIENTS.map(num => sendWhatsApp(num, message))
    );

    const allOk = results.every(r => r.ok);

    return NextResponse.json({
      success: allOk,
      sentAt:  new Date().toISOString(),
      recipients: ADMIN_RECIPIENTS.length,
      results,
      preview: message,
    });

  } catch (err: any) {
    console.error("[WhatsApp Daily Cron] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── POST  (manual trigger from admin dashboard) ───────────────────────────────
export async function POST(req: NextRequest) {
  return GET(req);
}
