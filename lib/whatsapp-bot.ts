/**
 * lib/whatsapp-bot.ts
 * Sentil Africa — WhatsApp Investment Hub Bot
 *
 * Features:
 *  • Investment browser (MMF/T-Bill/SACCO/Bond/NSE) with interactive buttons
 *  • Asset logging via WhatsApp chat
 *  • Sentill Africa for any investment question
 *  • Paystack Subscribe/Renew with direct checkout links
 *  • Registration, Login (OTP), Portfolio, Goals, Watchlist
 */

import { prisma } from "./prisma";
import {
  sendWhatsAppMessage,
  sendInteractiveButtons,
  sendImageMessage,
  sendListMessage,
  sendCTAButton,
  sendTypingIndicator,
  generateOTP,
  formatKES,
  normalizePhone,
} from "./whatsapp";
import { handleAdminCommand } from "./whatsapp-admin";
import { askGeminiBot, generateInvestmentSummary, ADVISOR_ROSTER } from "./whatsapp-gemini";
import {
  mmfYieldChartUrl,
  tbillYieldCurveUrl,
  saccoChartUrl,
  compoundGrowthChartUrl,
  investmentComparisonUrl,
  parseCalcCommand,
} from "./chart-generator";
import { sendEmail, buildLoginCredentialsEmail } from "./email";
import { getAllUpcomingDividends, daysUntilClosure } from "./dividend-calendar";
import bcrypt from "bcryptjs";
import crypto from "crypto";


// ─────────────────────────────────────────────────────────────────────────────
// Data freshness helper
// ─────────────────────────────────────────────────────────────────────────────

async function getRatesFreshness(): Promise<string> {
  try {
    const latest = await prisma.marketRateCache.findFirst({ orderBy: { lastSyncedAt: "desc" } });
    if (!latest) return "_⚠️ Rates: manual update — sync pending_";
    const hoursOld = Math.round((Date.now() - new Date(latest.lastSyncedAt).getTime()) / 3600000);
    const dateStr = new Date(latest.lastSyncedAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
    if (hoursOld < 6)  return `_✅ Rates synced today (${dateStr}) • Verify with provider before investing_`;
    if (hoursOld < 48) return `_🕐 Rates synced ${hoursOld}h ago (${dateStr}) • Verify with provider before investing_`;
    return `_⚠️ Rates last synced ${dateStr} • May be outdated — verify with provider_`;
  } catch {
    return "_ℹ️ Rates as at April 2026 • Verify with provider before investing_";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NSE Stock Intelligence
// ─────────────────────────────────────────────────────────────────────────────

const NSE_SYMBOLS: Record<string, string> = {
  SCOM:  "Safaricom PLC",
  EQTY:  "Equity Group Holdings",
  KCB:   "KCB Group PLC",
  COOP:  "Co-operative Bank of Kenya",
  NCBA:  "NCBA Group PLC",
  ABSA:  "ABSA Bank Kenya",
  EABL:  "East African Breweries",
  BAT:   "BAT Kenya",
  BAMB:  "Bamburi Cement",
  NMG:   "Nation Media Group",
  DTB:   "Diamond Trust Bank",
  JUB:   "Jubilee Holdings",
  BRIT:  "Britam Holdings",
  CIC:   "CIC Insurance Group",
  KPLC:  "Kenya Power & Lighting",
  SBUS:  "Stanbic Holdings",
  SASN:  "Sasini PLC",
  ARM:   "ARM Cement",
  WTK:   "Williamson Tea",
  TOTL:  "Total Energies Marketing Kenya",
  SCBK:  "Standard Chartered Bank Kenya",
  BOC:   "BOC Kenya",
  NSE:   "Nairobi Securities Exchange",
  KQ:    "Kenya Airways",
};

// Hardcoded NSE data (fallback when Yahoo Finance unavailable)
const NSE_FALLBACK: Record<string, { price: number; change: number; pe: number; div: number; signal: string; why: string }> = {
  SCOM: { price: 19.35, change: +0.15, pe: 12.1, div: 4.5,  signal: "HOLD",  why: "Stable dividend payer. Ziidi & M-PESA driving long-term moats." },
  EQTY: { price: 48.05, change: -0.45, pe: 6.2,  div: 5.2,  signal: "BUY",   why: "Pan-African expansion, cheap valuation, strong EPS growth." },
  KCB:  { price: 37.20, change: +0.70, pe: 4.9,  div: 8.3,  signal: "BUY",   why: "KES 3.09 div at current price = 8.3% yield. Trading below book value." },
  COOP: { price: 12.55, change: -0.20, pe: 5.1,  div: 8.1,  signal: "BUY",   why: "Consistent profits, SACCO banking network advantage." },
  NCBA: { price: 49.85, change: +0.85, pe: 7.1,  div: 9.2,  signal: "BUY",   why: "KES 4.60/share dividend — books close Apr 30. 9.2% yield at current price." },
  ABSA: { price: 14.30, change: -0.20, pe: 6.8,  div: 12.9, signal: "BUY",   why: "High dividend yield (~12.9%). Books close Apr 30 — KES 1.85/share." },
  EABL: { price: 125.50,change: -2.50, pe: 17.2, div: 3.8,  signal: "WATCH", why: "Premium brand but expensive P/E 17x. Tax pressures on alcohol." },
  SCBK: { price: 176.00,change: -1.00, pe: 8.4,  div: 13.1, signal: "BUY",   why: "KES 23/share final dividend — books close Apr 30. 13.1% yield at current price." },
  SASN: { price: 19.75, change: +1.3,  pe: 11,  div: 3.8,  signal: "BUY",   why: "April momentum leader. Agricultural export demand at peak — Sasini is the top agri play right now." },
  KQ:   { price: 5.40,  change: +2.1,  pe: 0,   div: 0,    signal: "WATCH", why: "High retail interest. Recovery from January lows but still volatile — speculative only." },
  BOC:  { price: 123.0, change: +0.3,  pe: 12,  div: 8.4,  signal: "BUY",   why: "Industrial gases — KES 10.35/share dividend (books close May 31). Niche but consistent earner." },
  NSE:  { price: 17.80, change: +0.9,  pe: 14,  div: 5.6,  signal: "BUY",   why: "Momentum play: Hedera/Hashgraph Innovation Lab launch + KES 1.00 dividend. Books close Apr 30." },
};

async function fetchNSEData(): Promise<any[]> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentill.africa";
    const res = await fetch(`${base}/api/market/nse`, { cache: "no-store" });
    if (!res.ok) throw new Error("NSE API error");
    const data = await res.json();
    return Array.isArray(data.stocks) ? data.stocks : [];
  } catch {
    // Return fallback data shaped like the API response
    return Object.entries(NSE_FALLBACK).map(([sym, d]) => ({
      symbol: sym,
      name: NSE_SYMBOLS[sym] ?? sym,
      price: d.price,
      change: (d.price * d.change) / 100,
      percent: d.change,
    }));
  }
}

async function handleNSEStocks(waId: string, userId?: string) {
  await sendWhatsAppMessage(waId, "📊 Fetching live NSE data...");

  const stocks = await fetchNSEData();
  const top = stocks.slice(0, 8);

  let msg = `📊 *NSE LIVE — NAIROBI STOCK EXCHANGE*\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n\n`;

  top.forEach((s: any) => {
    const chg = typeof s.percent === "number" ? s.percent : typeof s.change === "number" ? s.change : 0;
    const arrow = chg >= 0 ? "▲" : "▼";
    const sign  = chg >= 0 ? "+" : "";
    const fallback = NSE_FALLBACK[s.symbol];
    const signal = fallback?.signal ?? "";
    const badge = signal === "BUY" ? " 🟢" : signal === "WATCH" ? " 🟡" : "";
    msg += `*${s.symbol}*${badge} — KES ${Number(s.price).toFixed(2)}  ${arrow} ${sign}${Number(chg).toFixed(1)}%\n`;
  });

  msg += `\n━━━━━━━━━━━━━━━━━━\n`;
  msg += `🟢 BUY signal  🟡 WATCH  (no signal = HOLD)\n\n`;
  msg += `💡 *Type any ticker for full Sentill breakdown:*\n`;
  msg += `_SCOM · EQTY · KCB · COOP · NCBA · EABL_\n\n`;
  msg += `📱 *Easiest way to buy NSE stocks:*\n`;
  msg += `*Ziidi app* (by Safaricom) — M-Pesa, from KES 100\n`;
  msg += `➡️ Open Safaricom app → *Ziidi* → Stocks → Buy\n\n`;
  msg += `_Send *NSE GUIDE* for the full beginner's guide + rules_\n`;
  msg += `_Send *DIVIDEND* for upcoming book closure calendar_`;

  return sendWhatsAppMessage(waId, msg);
}

async function handleDividendCalendar(waId: string) {
  const events = getAllUpcomingDividends();

  let msg = `📅 *NSE DIVIDEND CALENDAR — April/May 2026*\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `_Own shares BEFORE book closure date to qualify for the dividend._\n\n`;

  events.forEach(ev => {
    const days = daysUntilClosure(ev);
    const urgency = days <= 2 ? "🚨" : days <= 7 ? "⚡" : "📅";
    const closureStr = ev.bookClosureDate.toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short" });
    msg += `${urgency} *${ev.symbol}* — ${ev.name}\n`;
    msg += `   💰 Dividend: *KES ${ev.dividend.toFixed(2)}/share*`;
    if (ev.dividendYield) msg += ` _(~${ev.dividendYield}% yield)_`;
    msg += `\n`;
    msg += `   📅 Book Closure: *${closureStr}* — in *${days} day${days !== 1 ? "s" : ""}*\n`;
    if (ev.notes) msg += `   💡 _${ev.notes}_\n`;
    msg += `\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `📊 *WHAT IS BOOK CLOSURE?*\n\n`;
  msg += `The cut-off date the company uses to determine who gets paid.\n`;
  msg += `You must hold shares on or before this date to receive the dividend.\n\n`;
  msg += `🟢 _Reply *STOCKS* for live NSE prices_\n`;
  msg += `📈 _Reply ticker symbol (e.g. SCBK) for Sentill analysis_`;

  return sendWhatsAppMessage(waId, msg);
}

async function handleNSEStockLookup(waId: string, symbol: string, userId?: string) {
  await sendWhatsAppMessage(waId, `🧠 Analysing *${symbol}*...`);

  const stocks = await fetchNSEData();
  const live = stocks.find((s: any) => s.symbol?.toUpperCase() === symbol);
  const fallback = NSE_FALLBACK[symbol];
  const name = NSE_SYMBOLS[symbol] ?? symbol;

  const price = live?.price ?? fallback?.price ?? "N/A";
  const chg   = live?.percent ?? live?.change ?? fallback?.change ?? 0;
  const pe    = live?.pe ?? fallback?.pe ?? "N/A";
  const div   = live?.dividendYield ?? fallback?.div ?? "N/A";
  const signal = fallback?.signal ?? "HOLD";
  const why    = fallback?.why ?? "Strong Kenyan blue chip stock.";
  const arrow  = Number(chg) >= 0 ? "▲" : "▼";
  const sign   = Number(chg) >= 0 ? "+" : "";
  const badge  = signal === "BUY" ? "🟢 BUY" : signal === "WATCH" ? "🟡 WATCH" : "⚪ HOLD";

  // Get AI deep-dive for more context
  const aiContext = `Give a concise WhatsApp stock analysis for ${name} (${symbol}) listed on the NSE Kenya. Price: KES ${price}, change: ${sign}${Number(chg).toFixed(1)}%, P/E: ${pe}, dividend yield: ${div}%. Signal: ${signal}. Analyst note: ${why}. Cover: 1) What the company does, 2) Why the signal, 3) Key risks, 4) Who should buy this (which investor profile). Keep it under 200 words, use bold and emojis, WhatsApp formatting.`;

  let aiText = "";
  try {
    const { askGeminiBot } = await import("./whatsapp-gemini");
    aiText = await askGeminiBot(aiContext, { name: "Investor", userId: userId ?? "guest", isPremium: false }, waId);
  } catch {
    aiText = `${why}\n\n📊 P/E ratio of ${pe}x suggests ${Number(pe) < 10 ? "undervalued vs regional peers" : "fair market pricing"}. Dividend yield of ${div}% ${Number(div) > 5 ? "is above the NSE average — attractive for income investors" : "is modest — focus on capital growth"}.`;
  }

  let msg = `📊 *${name} (${symbol})*\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `💰 Price: *KES ${Number(price).toFixed(2)}*  ${arrow} ${sign}${Number(chg).toFixed(1)}% today\n`;
  msg += `📈 Signal: *${badge}*\n`;
  msg += `📉 P/E Ratio: *${pe}x*\n`;
  msg += `💵 Dividend Yield: *${div}%*\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `🧠 *Sentill Africa Analysis:*\n\n${aiText}\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `📱 *How to buy ${symbol} today:*\n\n`;
  msg += `1️⃣ *Easiest — Ziidi by Safaricom* (M-Pesa, from KES 100)\n`;
  msg += `   Open Safaricom app → *Ziidi* → Stocks → Search *${symbol}* → Buy\n\n`;
  msg += `2️⃣ *Broker apps* — NCBA Go-Live, Faida F-Trade, Dyer & Blair\n`;
  msg += `   _(Commission ~1.5–2.5% per trade, M-Pesa supported)_\n\n`;
  msg += `📊 _Reply *DIVIDEND* for book closure dates_\n`;
  msg += `📖 _Reply *NSE GUIDE* for full beginner rules_\n\n`;
  msg += `_⚠️ Market intelligence only — not licensed investment advice._`;

  return sendWhatsAppMessage(waId, msg);
}

async function handleNSEBeginnersGuide(waId: string) {
  const msg =
    `📊 *NSE STOCKS — BEGINNER'S COMPLETE GUIDE*\n` +
    `_Own Kenyan companies from your phone, from KES 100_\n\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `🟢 *EASIEST WAY TO START — ZIIDI BY SAFARICOM*\n\n` +
    `Ziidi is Safaricom's investing app — M-Pesa native,\n` +
    `built for first-time investors.\n\n` +
    `*Steps:*\n` +
    `1. Open your Safaricom app\n` +
    `2. Tap *Ziidi* under Financial Services\n` +
    `3. Create account (takes 2 min, digital KYC)\n` +
    `4. Search a stock (e.g. SCOM, KCB, EQTY)\n` +
    `5. Tap *Buy* — pay via M-Pesa from *KES 100*\n\n` +
    `✅ No paperwork needed — just your ID\n` +
    `✅ Dividends go straight to M-Pesa\n` +
    `✅ Track your shares in the Ziidi app\n` +
    `✅ Sell anytime during market hours\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📋 *NSE TRADING RULES YOU MUST KNOW:*\n\n` +
    `⏰ *Trading hours:* Mon–Fri, 9:00am – 3:00pm EAT\n` +
    `📅 *Settlement:* T+3 (money/shares clear in 3 days)\n` +
    `💸 *Commission:* ~1.5–2.5% per trade (Ziidi ~1.5%)\n` +
    `🏛️ *Regulator:* CMA (Capital Markets Authority)\n` +
    `🏦 *Your shares are held* in a CDS account (safe, separate from broker)\n` +
    `📊 *Dividends tax:* 5% WHT deducted automatically\n` +
    `📈 *Capital gains:* Currently *0% tax* in Kenya 🎉\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🏆 *SENTILL BEGINNER PORTFOLIO (KES 5K–10K):*\n\n` +
    `1️⃣ *KCB Group (KCB)* — 40% of budget (KES 37.20)\n` +
    `   _Highest dividend on NSE (~6.8%), trading cheap_\n\n` +
    `2️⃣ *Equity Group (EQTY)* — 40% of budget (KES 48.05)\n` +
    `   _Kenya's most profitable bank, growing in 7 countries_\n\n` +
    `3️⃣ *Safaricom (SCOM)* — 20% of budget (KES 19.35)\n` +
    `   _You use M-Pesa every day — own a piece of it_\n\n` +
    `💡 _Example: KES 10,000 in KCB at KES 37.20 = ~271 shares_\n` +
    `   _= 219 shares · earns ~KES 680/yr in dividends_\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `⚠️ *GOLDEN RULES:*\n` +
    `• Only invest money you won't need for 3–5 years\n` +
    `• NSE stocks go up AND down — never put all in one\n` +
    `• Never borrow money to buy stocks\n` +
    `• Start small, learn the market first\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📊 *Get Sentill analysis on any stock:*\n` +
    `Type any ticker: _SCOM · EQTY · KCB · COOP · EABL_\n\n` +
    `📅 _Reply *DIVIDEND* for upcoming dividend dates_\n\n` +
    `_Sentill Africa — research smarter, invest better. 🇰🇪_`;

  return sendWhatsAppMessage(waId, msg);
}

// ── Generate a secure random password ────────────────────────────────────────
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  const bytes = crypto.randomBytes(10);
  for (let i = 0; i < 10; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

// ─────────────────────────────────────────────────────────────────────────────
// Plans
// ─────────────────────────────────────────────────────────────────────────────

const PLANS = {
  // Monthly — entry tier
  PRO_30_DAYS:      { label: "Sentill Pro — Monthly",   amount: 490,  days: 30,  description: "Full Pro access for 30 days. Cancel anytime." },
  MONTHLY_30_DAYS:  { label: "Sentill Pro — Monthly",   amount: 490,  days: 30,  description: "Full Pro access for 30 days. Cancel anytime." },
  // Quarterly — save 12% (3 × 490 = 1,470 → 1,299)
  QUARTERLY_90_DAYS:{ label: "Sentill Pro — Quarterly", amount: 1299, days: 90,  description: "Full Pro access for 90 days. Save KES 171 (12% off)." },
  // Annual — save 17% (2 months free vs. monthly)
  ANNUAL_365_DAYS:  { label: "Sentill Pro — Annual",    amount: 4900, days: 365, description: "Full Pro access for 365 days. Save KES 980 (2 months free)." },
  // Chama group plan — 10 seats shared
  CHAMA_MONTHLY:    { label: "Sentill Chama Group",     amount: 2500, days: 30,  description: "Up to 10 members share Pro access for 30 days." },
  // Legacy alias
  WEEKLY_7_DAYS:    { label: "Sentill Pro — Monthly",   amount: 490,  days: 30,  description: "Full Pro access for 30 days." },
} as const;

// ── Free-tier AI prompt limit ────────────────────────────────────────────────
const FREE_AI_LIMIT = 10; // Max AI questions per day for free users

type PlanKey = keyof typeof PLANS;

// Investment category labels — MAX 20 chars for WhatsApp button titles
const INVEST_CATEGORIES: Record<string, string> = {
  MONEY_MARKET: "💰 Money Mkt Funds",
  "T-Bill":     "📈 Treasury Bills",
  Bond:         "🏛 Govt Bonds",
  SACCO:        "🤝 SACCOs",
  Equity:       "📊 NSE Stocks",
  Pension:      "🧓 Pension Funds",
};

// Full names for display in messages (no limit)
const INVEST_LABELS: Record<string, string> = {
  MONEY_MARKET: "💰 Money Market Funds",
  "T-Bill":     "📈 Treasury Bills",
  Bond:         "🏛 Government Bonds",
  SACCO:        "🤝 SACCOs",
  Equity:       "📊 NSE Stocks",
  Pension:      "🧓 Pension Funds",
};

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SessionContext {
  name?: string;
  email?: string;
  otp?: string;
  otpAttempts?: number;
  otpLockedUntil?: number;
  plan?: PlanKey;
  // Investment browser
  category?: string;
  providerId?: string;
  providerName?: string;
  providerYield?: number;
  // Asset logging
  logProviderId?: string;
  logProviderName?: string;
  logAmount?: number;
  // Asset management
  removeAssetId?: string;
  removeAssetName?: string;
  reallocateFromId?: string;
  reallocateFromName?: string;
  reallocateToId?: string;
  reallocateToName?: string;
  reallocateAmount?: number;
  // Financial advisor selection
  advisorId?: string;
  // Referral
  referCode?: string;
  // Guest journey / payment timing
  guestQuestionCount?: number;
  paymentInitiatedAt?: number;
  // Campaign / UTM attribution tracking
  campaignSource?: "meta" | "google" | "linkedin" | "tiktok" | "organic" | "referral";
  campaignId?: string;
  firstSeenAt?: number;
  // Conversation quality tracking
  totalQuestions?: number;
  lastTopics?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Session helpers
// ─────────────────────────────────────────────────────────────────────────────

async function getOrCreateSession(waId: string) {
  let session = await prisma.whatsAppSession.findUnique({ where: { waId } });
  if (!session) {
    // Auto-link userId if user already registered this waId via direct enrollment
    const linkedUser = await prisma.user.findUnique({
      where: { whatsappId: waId },
      select: { id: true },
    });
    session = await prisma.whatsAppSession.create({
      data: {
        waId,
        state: "IDLE",
        context: "{}",
        ...(linkedUser ? { userId: linkedUser.id } : {}),
      },
    });
  } else if (!session.userId) {
    // Session exists but has no userId — try to recover it
    const linkedUser = await prisma.user.findUnique({
      where: { whatsappId: waId },
      select: { id: true },
    });
    if (linkedUser) {
      session = await prisma.whatsAppSession.update({
        where: { waId },
        data: { userId: linkedUser.id },
      });
    }
  }
  return session;
}

async function updateSession(
  waId: string,
  state: string,
  context?: SessionContext,
  userId?: string
) {
  await prisma.whatsAppSession.update({
    where: { waId },
    data: {
      state,
      context: JSON.stringify(context ?? {}),
      lastSeen: new Date(),
      // Only set userId if explicitly provided — never wipe an existing one
      ...(userId !== undefined ? { userId } : {}),
    },
  });
}

async function logInbound(waId: string, message: string, userId?: string) {
  await prisma.whatsAppLog.create({
    data: {
      waId,
      userId: userId ?? null,
      direction: "INBOUND",
      message: message.slice(0, 500),
      msgType: "text",
      status: "DELIVERED",
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main entry — called by webhook
// ─────────────────────────────────────────────────────────────────────────────

export async function processIncomingMessage(
  waId: string,
  rawBody: string | undefined,
  buttonPayload?: string
) {
  const input = (buttonPayload ?? rawBody ?? "").trim().toUpperCase();
  const rawInput = (rawBody ?? "").trim();
  const session = await getOrCreateSession(waId);
  const ctx: SessionContext = JSON.parse(session.context || "{}");

  await logInbound(waId, rawInput || input, session.userId ?? undefined);

  // Update lastSeen
  await prisma.whatsAppSession.update({ where: { waId }, data: { lastSeen: new Date() } }).catch(() => {});

  // ── Session timeout: stale non-IDLE sessions older than 24h reset to IDLE ─
  const ACTIVE_STATES = ["REGISTER_NAME", "REGISTER_EMAIL", "REGISTER_OTP", "LOGIN_OTP", "SUB_CONFIRM",
    "LOG_ASSET_PROVIDER", "LOG_ASSET_AMOUNT", "LOG_ASSET_CONFIRM", "REMOVE_ASSET_SELECT",
    "REMOVE_ASSET_CONFIRM", "REALLOCATE_FROM", "REALLOCATE_TO", "REALLOCATE_AMOUNT", "REALLOCATE_CONFIRM",
    "ALERT_FREQ_SELECT", "ALERT_THRESHOLD_INPUT", "ALERT_WATCHLIST_ADD", "ALERT_WATCHLIST_REMOVE",
    "GOAL_AFTER_REGISTER", "AWAITING_PAYMENT"];
  if (ACTIVE_STATES.includes(session.state) && session.lastSeen) {
    const hoursIdle = (Date.now() - new Date(session.lastSeen).getTime()) / 3600000;
    if (hoursIdle > 24) {
      await updateSession(waId, "IDLE", {}, session.userId ?? undefined);
      await sendWhatsAppMessage(waId, "⏱ Your previous session expired after 24 hours. Starting fresh.\n\nSend *MENU* to see all options.");
      // Re-fetch fresh session
      session.state = "IDLE";
      (ctx as any) = {};
    }
  }

  // ── CANCEL: exits any active flow and returns to IDLE ──────────────────────
  if (input === "CANCEL" || input === "EXIT" || input === "STOP IT" || input === "QUIT") {
    if (session.state !== "IDLE") {
      await updateSession(waId, "IDLE", {}, session.userId ?? undefined);
      return sendWhatsAppMessage(waId, "✅ Cancelled. You're back at the main menu.\n\nSend *MENU* to see all options or just ask a question.");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN COMMAND CENTER — Edwin's WhatsApp Ops Dashboard
  // Only accessible to admin numbers
  // ═══════════════════════════════════════════════════════════════════════════
  const ADMIN_NUMBERS = ["254726260884", "254703469525"];
  const isAdmin = ADMIN_NUMBERS.includes(waId);

  if (isAdmin && (input.startsWith("ADMIN") || input.startsWith("OPS") || input === "SYS")) {
    return handleAdminCommand(waId, input, rawInput, session);
  }

  // ── Button payloads: route directly regardless of state ─────────────────
  // This ensures interactive button taps always work even if state is IDLE
  if (buttonPayload) {
    // Plan selections
    if (buttonPayload === "WEEKLY_7_DAYS")     return handleSelectPlan(waId, "WEEKLY_7_DAYS",     ctx, session.userId ?? undefined);
    if (buttonPayload === "MONTHLY_30_DAYS")   return handleSelectPlan(waId, "MONTHLY_30_DAYS",   ctx, session.userId ?? undefined);
    if (buttonPayload === "PRO_30_DAYS")       return handleSelectPlan(waId, "PRO_30_DAYS",       ctx, session.userId ?? undefined);
    if (buttonPayload === "QUARTERLY_90_DAYS") return handleSelectPlan(waId, "QUARTERLY_90_DAYS", ctx, session.userId ?? undefined);
    if (buttonPayload === "ANNUAL_365_DAYS")   return handleSelectPlan(waId, "ANNUAL_365_DAYS",   ctx, session.userId ?? undefined);
    if (buttonPayload === "CHAMA_MONTHLY")     return handleSelectPlan(waId, "CHAMA_MONTHLY",     ctx, session.userId ?? undefined);
    if (buttonPayload === "SKIP_UPSELL") {
      return sendWhatsAppMessage(waId, `👍 No problem. Enjoy your Pro access — type *MENU* whenever you're ready to explore.`);
    }
    if (buttonPayload === "MARKETS")      return handleMarkets(waId);
    if (buttonPayload === "INVEST" || buttonPayload === "BROWSE") {
      if (session.userId) return sendInvestmentCategories(waId, session.userId);
    }
    if (buttonPayload === "SUBSCRIBE" || buttonPayload === "RENEW") {
      return sendSubscriptionPlans(waId, session.userId ?? undefined);
    }
    if (buttonPayload.startsWith("CAT_")) {
      if (session.userId) {
        await updateSession(waId, "BROWSE_PROVIDERS", ctx, session.userId);
        return handleBrowseCategoryInput(waId, buttonPayload, session.userId, ctx);
      }
    }
    if (buttonPayload === "REGISTER") {
      await updateSession(waId, "REGISTER_NAME", {});
      return sendWhatsAppMessage(waId,
        `🎉 Welcome to *Sentil Africa!*\n\nKenya's #1 wealth intelligence hub.\n\nLet's create your free account.\n\nFirst, what is your *full name*?`
      );
    }
    if (buttonPayload === "LOGIN") return handleLoginRequest(waId);

    // ── Frequency button payloads — work from ANY state (post-register or ALERTS menu) ──
    if (["FREQ_DAILY", "FREQ_WEEKLY", "FREQ_MOVERS", "FREQ_OFF"].includes(buttonPayload)) {
      if (session.state === "FREQ_AFTER_REGISTER") {
        return handleFreqAfterRegister(waId, buttonPayload, ctx, session.userId ?? undefined);
      }
      if (session.userId) {
        return handleAlertFreqSelect(waId, buttonPayload, ctx, session.userId ?? undefined);
      }
    }
  }

  // ── Capture referral code if user arrived via invite link ────────────────
  if (input.startsWith("SENTIL_REF_") && !session.userId) {
    const refCode = input.replace("SENTIL_REF_", "").trim();
    await updateSession(waId, "IDLE", { ...ctx, referCode: input, campaignSource: "referral" });
    await sendWhatsAppMessage(waId,
      `🎁 *You were invited to Sentill Africa!*\n\n` +
      `You'll get *7 days of Pro FREE* when you create your account.\n\n` +
      `Reply *REGISTER* to claim your free Pro access ⚡`
    );
    return sendMainMenu(waId, undefined);
  }

  // ── Campaign/Ad Attribution Tracking ──────────────────────────────────────
  // Users arriving from Meta/Google/LinkedIn/TikTok ads with tracking prefixes
  const campaignPrefixes: Record<string, SessionContext["campaignSource"]> = {
    "META_AD_": "meta", "FB_AD_": "meta", "IG_AD_": "meta",
    "GOOGLE_AD_": "google", "GADS_": "google",
    "LINKEDIN_AD_": "linkedin", "LI_AD_": "linkedin",
    "TIKTOK_AD_": "tiktok", "TT_AD_": "tiktok",
  };
  for (const [prefix, source] of Object.entries(campaignPrefixes)) {
    if (input.startsWith(prefix)) {
      const campaignId = input.replace(prefix, "").trim();
      await updateSession(waId, "IDLE", {
        ...ctx,
        campaignSource: source,
        campaignId: campaignId || undefined,
        firstSeenAt: Date.now(),
      });
      // Log campaign attribution
      await prisma.whatsAppLog.create({
        data: {
          waId,
          direction: "INBOUND",
          message: `CAMPAIGN_ATTRIBUTION: source=${source}, id=${campaignId}`,
          msgType: "campaign_track",
          status: "DELIVERED",
        },
      });
      await sendWhatsAppMessage(waId,
        `🎯 *Welcome to Sentill Africa!*\n\n` +
        `Kenya's #1 AI-powered investment intelligence hub.\n\n` +
        `🏆 *What you get (FREE):*\n` +
        `✅ Live market rates & comparisons\n` +
        `✅ AI investment advisor (10 questions/day)\n` +
        `✅ MMF, T-Bill, NSE & Bond data\n\n` +
        `Ask any question or reply *MENU* to explore! 🚀`
      );
      return sendMainMenu(waId, undefined);
    }
  }

  // ── Route by session state ────────────────────────────────────────────────
  switch (session.state) {
    case "REGISTER_NAME":
      return handleRegisterName(waId, rawInput, ctx);
    case "REGISTER_EMAIL":
      return handleRegisterEmail(waId, rawInput, ctx);
    case "REGISTER_OTP":
      return handleRegisterOTP(waId, input, ctx);
    case "LOGIN_OTP":
      return handleLoginOTP(waId, input, ctx);
    case "SUB_CONFIRM":
      return handleSubConfirm(waId, input, ctx, session.userId ?? undefined);
    case "BROWSE_PROVIDERS":
      return handleBrowseProviderAction(waId, buttonPayload ?? input, ctx, session.userId ?? undefined);
    case "LOG_ASSET_PROVIDER":
      return handleLogAssetProvider(waId, buttonPayload ?? input, ctx, session.userId ?? undefined);
    case "LOG_ASSET_AMOUNT":
      return handleLogAssetAmount(waId, rawInput, ctx, session.userId ?? undefined);
    case "LOG_ASSET_CONFIRM":
      return handleLogAssetConfirm(waId, input, ctx, session.userId ?? undefined);
    case "REMOVE_ASSET_SELECT":
      return handleRemoveAssetSelect(waId, input, ctx, session.userId ?? undefined);
    case "REMOVE_ASSET_CONFIRM":
      return handleRemoveAssetConfirm(waId, input, ctx, session.userId ?? undefined);
    case "REALLOCATE_FROM":
      return handleReallocateFrom(waId, input, ctx, session.userId ?? undefined);
    case "REALLOCATE_TO":
      return handleReallocateTo(waId, buttonPayload ?? input, ctx, session.userId ?? undefined);
    case "REALLOCATE_AMOUNT":
      return handleReallocateAmount(waId, rawInput, ctx, session.userId ?? undefined);
    case "REALLOCATE_CONFIRM":
      return handleReallocateConfirm(waId, input, ctx, session.userId ?? undefined);
    // Alert / Notification preference flows
    case "ALERT_FREQ_SELECT":
      return handleAlertFreqSelect(waId, buttonPayload ?? input, ctx, session.userId ?? undefined);
    case "ALERT_THRESHOLD_INPUT":
      return handleAlertThresholdInput(waId, rawInput, ctx, session.userId ?? undefined);
    case "ALERT_WATCHLIST_ADD":
      return handleWatchlistAdd(waId, input, ctx, session.userId ?? undefined);
    case "ALERT_WATCHLIST_REMOVE":
      return handleWatchlistRemove(waId, input, ctx, session.userId ?? undefined);
    case "FREQ_AFTER_REGISTER":
      return handleFreqAfterRegister(waId, buttonPayload ?? input, ctx, session.userId ?? undefined);
    case "GOAL_AFTER_REGISTER":
      return handleGoalAfterRegister(waId, buttonPayload ?? input, ctx, session.userId ?? undefined);
    case "AWAITING_PAYMENT":
      return handlePaymentCheck(waId, input, ctx, session.userId ?? undefined);
  }

  // ── Capture referral code if user arrived via invite link ────────────────
  if (input.startsWith("SENTIL_REF_") && !session.userId) {
    const refCode = input.replace("SENTIL_REF_", "").trim();
    await updateSession(waId, "IDLE", { ...ctx, referCode: input });
    await sendWhatsAppMessage(waId,
      `🎁 *You were invited to Sentill Africa!*\n\n` +
      `You'll get *7 days of Pro FREE* when you create your account.\n\n` +
      `Reply *REGISTER* to claim your free Pro access \u26a1`
    );
    return sendMainMenu(waId, undefined);
  }

  // ── IDLE — route by keyword ───────────────────────────────────────────────
  if (["HI", "HELLO", "START", "MENU", "HOME"].includes(input)) {
    if (session.userId) return sendMainMenu(waId, session.userId);
    return sendGuestGreeting(waId);
  }

  if (input === "REGISTER") {
    if (session.userId) {
      return sendWhatsAppMessage(waId, "✅ You already have an account! Send *MENU* for options.");
    }
    await updateSession(waId, "REGISTER_NAME", {});
    return sendWhatsAppMessage(
      waId,
      `🎉 Welcome to *Sentil Africa!*\n\n` +
      `Kenya's #1 wealth intelligence hub.\n\n` +
      `Let's create your *free account*.\n\nFirst, what is your *full name*?`
    );
  }

  if (input === "LOGIN") {
    if (session.userId) {
      return sendWhatsAppMessage(waId, "✅ Already logged in! Send *MENU* for options.");
    }
    return handleLoginRequest(waId);
  }

  // Logged-in: numbered menu (1=Invest, 2=Markets, 3=AI, 4=Portfolio, 5=Goals)
  // Also handle 6–9 for investment category browsing from sub-menus
  if (session.userId) {
    const uid = session.userId;
    if (input === "1") return sendInvestmentCategories(waId, uid);
    if (input === "2") return handleMarkets(waId);
    if (input === "3") return sendWhatsAppMessage(waId,
      `🧠 *Ask Sentill Africa anything!*\n\n` +
      `Just type your question. For example:\n` +
      `• _What is the best MMF in Kenya right now?_\n` +
      `• _How much will KES 100K grow in 1 year?_\n` +
      `• _Compare T-Bills vs Bonds_\n` +
      `• _CALC 50000_ — quick projections\n\n` +
      `_Go ahead, type your question..._`
    );
    if (input === "4") return handlePortfolio(waId, uid);
    if (input === "5") return handleGoals(waId, uid);
  }

  // Guest: 1=Live Rates, 2=Browse Investments, 3=Ask AI, 4=Create Account
  if (!session.userId) {
    if (input === "1") return handleMarkets(waId);
    if (input === "2") return sendInvestmentCategories(waId, "guest");
    if (input === "3") return sendWhatsAppMessage(waId,
      `🧠 *Ask Sentill Africa anything!*\n\n` +
      `Just type your investment question. For example:\n` +
      `• _What’s the best MMF in Kenya right now?_\n` +
      `• _How much will KES 100K grow in 1 year?_\n` +
      `• _Compare T-Bills vs Bonds_\n` +
      `• _CALC 50000_ — quick growth projection\n\n` +
      `_Go ahead, type your question..._`
    );
    if (input === "4") {
      await updateSession(waId, "REGISTER_NAME", {});
      return sendWhatsAppMessage(waId,
        `🎉 *Create Your Free Sentill Account*\n\n` +
        `Takes 30 seconds. You’ll unlock:\n` +
        `✅ Portfolio tracker & investment logging\n` +
        `✅ Daily market alerts to this WhatsApp\n` +
        `✅ Personalised investment advice\n` +
        `✅ Financial goal tracking\n\n` +
        `First, what is your *full name*?`
      );
    }
    if (input === "RATES" || input === "R") return handleMarkets(waId);
    if (input === "MMF RATES" || input === "MMF RATE") return handleMMFRates(waId);
    if (input === "SPECIAL") return handleSpecialFunds(waId);
    if (["NSE GUIDE", "STOCKS GUIDE", "HOW TO BUY STOCKS", "BUY STOCKS", "ZIIDI", "ZIIDI GUIDE"].includes(input)) return handleNSEBeginnersGuide(waId);
    if (["STOCKS", "NSE", "SHARES", "NSE LIVE", "EQUITY", "EQUITIES"].includes(input)) return handleNSEStocks(waId, undefined);
    if (["DIVIDEND", "DIVIDENDS", "DIV", "BOOK CLOSURE", "NSE DIV"].includes(input)) return handleDividendCalendar(waId);
    if (NSE_SYMBOLS[input]) return handleNSEStockLookup(waId, input, undefined);
    if (input.startsWith("CHART") || input.startsWith("GRAPH")) return handleChartCommand(waId, input, undefined);
    if (input === "TABLE" || input === "RANKED") return handleTableCommand(waId, undefined);
    if (input === "LIST" || input === "FUNDS" || input === "MMF LIST") return handleMMFListMenu(waId, undefined);
    if (input.startsWith("CALC ") || input.startsWith("CALCULATE ")) return handleQuickCalc(waId, rawInput, undefined);

    // Fuzzy matching for guests — before LIVE handler to catch "live markets" typos
    if (input.includes("MARKET") || input.includes("MSRKET") || input === "LIVE MKT") return handleMarkets(waId);
    if (["GO PRO", "GET PRO", "BUY PRO", "PRO PLAN", "SENTILL PRO", "GO PREMIUM"].includes(input)) {
      return sendWhatsAppMessage(waId,
        `⚡ *Sentill Pro — KES 490/month*\n\n` +
        `Unlock everything:\n` +
        `✅ Portfolio tracker & investment logging\n` +
        `✅ Unlimited Sentill questions (no daily cap)\n` +
        `✅ Daily market alerts + price notifications\n` +
        `✅ Financial goal planning\n` +
        `✅ NSE charts, technical analysis\n\n` +
        `_Create a free account first, then subscribe:_\n` +
        `👉 Reply *REGISTER* — takes 30 seconds`
      );
    }
    if (input.includes("MANSA") || input.startsWith("MANSA")) {
      return handleGeminiQuestionGuest(waId, "Give me complete details on the Mansa-X Multi-Asset Fund by Standard Investment Bank (SIB) Kenya. Include strategy, minimum KES 250,000, markets traded, fees, pros/cons, who it suits.", session, ctx);
    }

    // LIVE RATE command for guests
    if (input.startsWith("LIVE RATE ") || (input.startsWith("LIVE ") && !input.includes("RATE") && rawInput.replace(/^live\s*/i, "").trim().length > 2)) {
      const asset = rawInput.replace(/^live\s*(rate\s*)?/i, "").trim();
      if (asset.length < 2) return sendWhatsAppMessage(waId, "Please specify the asset. Example:\n*LIVE RATE KCB* or *LIVE USD*");
      
      await sendWhatsAppMessage(waId, `🔍 *Sentill Oracle* is finding the live rate for *${asset}*...`);
      
      try {
        const { queryLiveRateAgent } = await import("./whatsapp-ai");
        const liveAns = await queryLiveRateAgent(asset);
        return sendWhatsAppMessage(waId, `⚡ *Live Rate Update*\n\n${liveAns}\n\n_Send *REGISTER* to auto-track this asset!_`);
      } catch (err) {
        console.error("[Live Rate Agent] Error:", err);
        return sendWhatsAppMessage(waId, "❌ The live rate agent is currently unavailable.");
      }
    }

    // If user typed a real question (>5 chars), route to AI even without login
    if (rawInput.length > 5) return handleGeminiQuestionGuest(waId, rawInput, session, ctx);

    // Default: show the clean numbered menu
    return sendMainMenu(waId, undefined);
  }

  // ── Authenticated commands ────────────────────────────────────────────────
  const userId = session.userId!;

  // ── Financial Advisor selection ───────────────────────────────────────────
  if (input === "ADVISOR" || input === "ADVISORS" || input === "TEAM") return handleAdvisorMenu(waId, session);
  if (input === "ADVISOR RESET" || input === "RESET ADVISOR") {
    const ctx: SessionContext = session.context ? JSON.parse(session.context as string) : {};
    delete ctx.advisorId;
    await updateSession(waId, session.state, ctx, session.userId ?? undefined);
    return sendWhatsAppMessage(waId, "✅ Advisor reset — you're back with the general *Sentill Africa* AI.\n\nAsk any investment question or reply *ADVISOR* to pick a specialist.");
  }
  if (["AMARA", "JABARI", "NADIA", "OMAR"].includes(input)) return handleAdvisorSelect(waId, input.toLowerCase(), session);

  if (input === "PORTFOLIO" || input === "P") return handlePortfolio(waId, userId);
  if (input === "MARKETS"   || input === "M" || input === "RATES" || input === "R") return handleMarkets(waId);
  if (input === "MMF RATES" || input === "MMF RATE") return handleMMFRates(waId);
  if (input === "GOALS"     || input === "G") return handleGoals(waId, userId);
  if (input === "WATCHLIST" || input === "W") return handleWatchlist(waId, userId);
  if (["NSE GUIDE", "STOCKS GUIDE", "HOW TO BUY STOCKS", "BUY STOCKS", "ZIIDI", "ZIIDI GUIDE"].includes(input)) return handleNSEBeginnersGuide(waId);
  if (["STOCKS", "NSE", "SHARES", "NSE LIVE", "EQUITY", "EQUITIES"].includes(input)) return handleNSEStocks(waId, userId);
  if (["DIVIDEND", "DIVIDENDS", "DIV", "BOOK CLOSURE", "NSE DIV"].includes(input)) return handleDividendCalendar(waId);
  if (["SPECIAL", "SPECIAL FUNDS", "UNIT TRUST", "UNIT TRUSTS", "DOLLAR FUND", "TRADE"].includes(input)) return handleSpecialFunds(waId);
  // New investment category keywords from the Investment Hub menu
  if (["OFFSHORE", "GLOBAL", "ETF", "ETFS", "GLOBAL ETFS", "USD FUND"].includes(input))
    return handleGeminiQuestion(waId, "Give me complete details on offshore and global ETF investment options available for Kenyan investors, including Ndovu, Cytonn Dollar MMF, and ABSA Offshore. Include returns, minimums, platforms, and currency hedge benefits.", userId);
  if (["REITS", "REIT", "REAL ESTATE", "PROPERTY"].includes(input))
    return handleGeminiQuestion(waId, "Give me complete details on Real Estate and REIT investment options in Kenya in 2026, including ILAM Fahari REIT, Acorn D-REIT, land investments, and how to access from KES 6 on NSE.", userId);
  if (["CRYPTO", "BITCOIN", "BTC", "ETHEREUM", "ETH", "CRYPTOCURRENCY"].includes(input))
    return handleGeminiQuestion(waId, "Give me a complete Kenya crypto investment guide for 2026: Bitcoin, Ethereum prices, how to buy via Binance P2P with M-Pesa, risks, Luno vs Binance comparison, KRA tax position, and 5-10% portfolio rule.", userId);
  if (["FOREX", "FX", "FOREX TRADING", "CURRENCY TRADING"].includes(input))
    return handleGeminiQuestion(waId, "Give me all CMA-licensed forex brokers in Kenya 2026 with minimum deposits, leverage, platforms, and critical risk warnings. Include FXPesa, Pepperstone, Scope Markets, EGM Securities, HF Markets.", userId);
  if (["MANSA-X", "MANSAX", "MANSA X", "SIB FUND", "SIB"].includes(input))
    return handleGeminiQuestion(waId, "Give me complete details on the Mansa-X Multi-Asset Fund by Standard Investment Bank (SIB) Kenya. Include: strategy, minimum investment (KES 250,000), markets traded (NYSE/LSE/commodities), fees, Sharia option, pros, cons, and who it is best for.", userId);
  if (["CORP BONDS", "CORPORATE BONDS", "CORPORATE BOND", "COMMERCIAL PAPER"].includes(input))
    return handleGeminiQuestion(waId, "Give me complete details on corporate bonds and commercial paper available in Kenya in 2026. Include current issuers (Centum, Family Bank, EABL, HF Group), coupon rates, WHT treatment, minimums, risks and how to buy on NSE.", userId);
  if (["IFB", "INFRASTRUCTURE BOND", "INFRASTRUCTURE BONDS"].includes(input))
    return handleGeminiQuestion(waId, "Give me the complete step-by-step guide to investing in Kenya Infrastructure Bonds (IFBs) in 2026. Include IFB1/2024 details (18.46% WHT-free), how to open a DhowCSD account, the CBK auction process, minimum investment, tax exemption proof, and comparison vs T-Bills and MMFs.", userId);

  // NSE ticker lookup — e.g. "SCOM", "EQTY", "KCB"
  if (NSE_SYMBOLS[input]) return handleNSEStockLookup(waId, input, userId);
  if (input === "STATUS"    || input === "S") return handleSubscriptionStatus(waId, userId);
  if (input === "HELP"      || input === "H") return sendHelp(waId, session.userId ?? undefined);
  if (input === "LOGOUT")                     return handleLogout(waId);

  // ── Notification & Alert Commands ──────────────────────────────────────────
  if (["ALERTS", "NOTIFY", "NOTIFICATIONS", "FREQUENCY", "FREQ"].includes(input)) return handleAlertSettings(waId, userId);
  if (["WATCH", "WATCHLIST ADD", "ADD WATCH"].includes(input)) return startWatchlistAdd(waId, ctx, userId);
  if (["UNWATCH", "WATCHLIST REMOVE", "REMOVE WATCH"].includes(input)) return startWatchlistRemove(waId, ctx, userId);
  if (input.startsWith("ALERT YIELD ") || input.startsWith("YIELD ALERT ")) return handleYieldAlertSet(waId, rawInput, userId);
  // Inline freq shortcuts: FREQ DAILY / FREQ WEEKLY / FREQ OFF
  if (input.startsWith("FREQ ")) return handleAlertFreqSelect(waId, input.replace("FREQ ", "FREQ_").replace(" ", ""), ctx, userId);

  // ── Referral Program ────────────────────────────────────────────────────
  if (["REFER", "REFERRAL", "INVITE", "INVITE FRIEND"].includes(input)) return handleRefer(waId, userId);

  // ── Asset Tracker Pro Commands ──────────────────────────────────────────
  if (["ASSETS", "MY ASSETS", "DASHBOARD", "ASSET"].includes(input)) return handleAssetsDashboard(waId, userId);
  if (["REMOVE", "DELETE", "REMOVE ASSET"].includes(input)) return startRemoveAsset(waId, ctx, userId);
  if (["REALLOCATE", "MOVE", "TRANSFER", "REBALANCE"].includes(input)) return startReallocate(waId, ctx, userId);
  if (["PERFORMANCE", "PERF", "REPORT"].includes(input)) return handlePerformanceReport(waId, userId);
  if (["EXPORT", "STATEMENT"].includes(input)) return handleExportStatement(waId, userId);
  if (["SNAPSHOT", "SNAP"].includes(input)) return handleSnapshot(waId, userId);
  if (["LEADERBOARD", "TOP", "BEST", "RANKING"].includes(input)) return handleLeaderboard(waId);
  if (input.startsWith("CALC ") || input.startsWith("CALCULATE ")) return handleQuickCalc(waId, rawInput);
  if (["MOVERS", "TRENDING", "HOT"].includes(input)) return handleMarketMovers(waId);

  // ── CHART commands — send PNG charts as images ───────────────────────────
  if (input.startsWith("CHART") || input.startsWith("GRAPH")) {
    return handleChartCommand(waId, input, session.userId ?? undefined);
  }

  // ── TABLE command — ranked text table ────────────────────────────────────
  if (input === "TABLE" || input === "TABLES" || input === "RANKED") {
    return handleTableCommand(waId, session.userId ?? undefined);
  }

  // ── LIST command — interactive scrollable MMF picker ─────────────────────
  if (input === "LIST" || input === "FUNDS" || input === "MMF LIST") {
    return handleMMFListMenu(waId, session.userId ?? undefined);
  }

  // Investment browser
  if (["INVEST", "BROWSE", "I", "INVESTMENTS"].includes(input)) {
    return sendInvestmentCategories(waId, userId);
  }

  // Category button taps (from investment hub) — works from IDLE state
  if (input.startsWith("CAT_")) {
    await updateSession(waId, "BROWSE_PROVIDERS", ctx, userId);
    return handleBrowseCategoryInput(waId, input, userId, ctx);
  }

  // Asset logging
  if (["LOG", "ADD", "LOG ASSET", "ADD ASSET"].includes(input)) {
    return startLogAsset(waId, ctx, userId);
  }

  // Subscription
  if (["SUBSCRIBE", "RENEW", "UPGRADE", "PRO", "PAY", "TRIAL"].includes(input)) {
    return sendSubscriptionPlans(waId, userId);
  }
  if (input === "MONTHLY_30_DAYS" || input === "MONTHLY" || input === "PRO_30_DAYS" || input === "490") {
    return handleSelectPlan(waId, "PRO_30_DAYS", ctx, userId);
  }
  if (input === "QUARTERLY_90_DAYS" || input === "QUARTERLY" || input === "3 MONTHS" || input === "1299") {
    return handleSelectPlan(waId, "QUARTERLY_90_DAYS", ctx, userId);
  }
  if (input === "ANNUAL_365_DAYS" || input === "ANNUAL" || input === "YEARLY" || input === "4900") {
    return handleSelectPlan(waId, "ANNUAL_365_DAYS", ctx, userId);
  }
  if (input === "CHAMA PLAN" || input === "CHAMA_MONTHLY" || input === "GROUP PLAN" || input === "CHAMA SUBSCRIBE") {
    return handleSelectPlan(waId, "CHAMA_MONTHLY", ctx, userId);
  }

  // COMPARE — compare two funds via AI
  if (input === "COMPARE" || input.startsWith("COMPARE ")) {
    const parts = rawInput.replace(/^compare\s*/i, "").trim();
    return handleCompare(waId, parts, userId);
  }

  // TIPS — get a daily AI investment tip
  if (input === "TIPS" || input === "TIP") {
    return handleTip(waId, userId);
  }

  // GOAL via chat — "GOAL Home Fund 2000000 2026-12-31"
  if (input.startsWith("GOAL ")) {
    return handleSetGoal(waId, rawInput, userId);
  }

  // LIVE RATE command — real-time Google search via Sub-Agent
  if (input.startsWith("LIVE RATE ") || input.startsWith("LIVE ")) {
    const asset = rawInput.replace(/^live\s*(rate\s*)?/i, "").trim();
    if (asset.length < 2) return sendWhatsAppMessage(waId, "Please specify the asset. Example:\n*LIVE RATE KCB* or *LIVE USD*");
    
    await sendWhatsAppMessage(waId, `🔍 *Sentill Oracle* is finding the live rate for *${asset}*...`);
    
    try {
      const { queryLiveRateAgent } = await import("./whatsapp-ai");
      const liveAns = await queryLiveRateAgent(asset);
      return sendWhatsAppMessage(waId, `⚡ *Live Rate Update*\n\n${liveAns}`);
    } catch (err) {
      console.error("[Live Rate Agent] Error:", err);
      return sendWhatsAppMessage(waId, "❌ The live rate agent is currently unavailable.");
    }
  }

  // ASK command — explicit Gemini question
  if (input.startsWith("ASK ") || rawInput.toLowerCase().startsWith("ask ")) {
    const question = rawInput.replace(/^ask\s+/i, "").trim();
    if (question.length < 3) {
      return sendWhatsAppMessage(waId, "Please type your question after ASK. Example:\n*ASK what is the best MMF for KES 50,000?*");
    }
    return handleGeminiQuestion(waId, question, userId);
  }

  // ── Fuzzy command matching — catches typos & conversational phrasing ────────
  // Runs BEFORE AI so common intents never hit a fallback
  if (input.includes("MARKET") || input.includes("MSRKET") || input === "LIVE MKT" || input === "LIVE PRICES") {
    return handleMarkets(waId);
  }
  if (["GO PRO", "GET PRO", "BUY PRO", "PRO PLAN", "GET PRO PLAN", "SENTILL PRO", "GO PREMIUM", "GET PREMIUM"].includes(input)) {
    return sendSubscriptionPlans(waId, userId);
  }
  if (input.includes("MANSA") || input === "MANSA X" || input.startsWith("MANSA")) {
    return handleGeminiQuestion(waId, "Give me complete details on the Mansa-X Multi-Asset Fund by Standard Investment Bank (SIB) Kenya. Include: strategy, minimum investment (KES 250,000), markets traded (NYSE/LSE/commodities), fees, Sharia option, pros, cons, who it is best for, and whether it is worth it vs an IFB Bond or top MMF.", userId);
  }
  if (input.includes("STOCK") || input.includes("SHARE") || input.includes("NSE ")) {
    return handleNSEStocks(waId, userId);
  }

  // ── 24/7 Gemini Fallback — ALL other messages go to Sentill Intelligence ───
  if (rawInput.length > 2) {
    return handleGeminiQuestion(waId, rawInput, userId);
  }

  return sendWhatsAppMessage(
    waId,
    `🧠 *Sentill Africa is here for you 24/7!*\n\n` +
    `Just type any question about investing, or use these commands:\n\n` +
    `• *MENU* — main menu\n` +
    `• *MARKETS* — live rates\n` +
    `• *INVEST* — browse options\n` +
    `• *ASK* — ask Sentill anything\n\n` +
    `Example: _What's the best MMF for KES 50,000?_`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sentill Africa handler
// ─────────────────────────────────────────────────────────────────────────────

async function handleAdvisorMenu(waId: string, session: Awaited<ReturnType<typeof getOrCreateSession>>) {
  const ctx: SessionContext = session.context ? JSON.parse(session.context as string) : {};
  const current = ctx.advisorId ? ADVISOR_ROSTER.find(a => a.id === ctx.advisorId) : null;

  let msg = `👥 *SENTILL AFRICA — YOUR FINANCIAL ADVISORS*\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `Choose your specialist advisor. They will answer all your questions with their unique expertise.\n\n`;

  ADVISOR_ROSTER.forEach((a, i) => {
    const active = current?.id === a.id ? " ✅ *ACTIVE*" : "";
    msg += `${["1️⃣","2️⃣","3️⃣","4️⃣"][i]} *${a.name}*${active}\n`;
    msg += `   ${a.emoji} ${a.title}\n`;
    msg += `   _"${a.tagline}"_\n\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `Reply with the advisor's name to select them:\n`;
  msg += `*AMARA* · *JABARI* · *NADIA* · *OMAR*\n\n`;
  if (current) {
    msg += `Current advisor: *${current.name}* ${current.emoji}\n`;
    msg += `Reply *ADVISOR RESET* to return to the general AI.\n`;
  }

  return sendWhatsAppMessage(waId, msg);
}

async function handleAdvisorSelect(waId: string, advisorId: string, session: Awaited<ReturnType<typeof getOrCreateSession>>) {
  const advisor = ADVISOR_ROSTER.find(a => a.id === advisorId);
  if (!advisor) return;
  const ctx: SessionContext = session.context ? JSON.parse(session.context as string) : {};
  await updateSession(waId, session.state, { ...ctx, advisorId }, session.userId ?? undefined);

  const msg =
    `${advisor.emoji} *${advisor.name} is now your advisor*\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `*Specialty:* ${advisor.title}\n` +
    `*Tagline:* _"${advisor.tagline}"_\n\n` +
    `All your investment questions will now be answered by *${advisor.name}*.\n\n` +
    `Ask anything — I'm ready. 🚀\n\n` +
    `_Reply *ADVISOR* to switch advisors or *ADVISOR RESET* to return to the general AI._`;

  return sendWhatsAppMessage(waId, msg);
}

async function handleGeminiQuestion(waId: string, question: string, userId: string) {
  // Read the user's selected advisor from their session context
  const session = await getOrCreateSession(waId);
  const ctx: SessionContext = session.context ? JSON.parse(session.context as string) : {};
  const advisorId = ctx.advisorId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, isPremium: true },
    });

    // ── 3-prompt gate for free users ──────────────────────────────────
    if (!user?.isPremium) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const aiQueriesCount = await prisma.whatsAppLog.count({
        where: {
          waId,
          direction: "OUTBOUND",
          message: { contains: "Sentill Africa Says" },
          createdAt: { gte: todayStart },
        },
      });

      if (aiQueriesCount >= FREE_AI_LIMIT) {
        return sendPremiumConversionMessage(waId, user?.name ?? "Investor", aiQueriesCount);
      }

      // Show remaining prompts
      const remaining = FREE_AI_LIMIT - aiQueriesCount;
      await sendWhatsAppMessage(waId, `🧠 *Sentill Africa* is thinking... _(${remaining} free question${remaining !== 1 ? "s" : ""} left today)_`);

      // Mid-session nudge at 5th question — soft conversion touch
      if (aiQueriesCount === 4) {
        sendWhatsAppMessage(waId,
          `⚡ *You're on a roll, ${user?.name?.split(" ")[0] ?? "Investor"}!*\n` +
          `You've asked 5 smart questions today.\n\n` +
          `🔓 *Sentill Pro* gives you:\n` +
          `• UNLIMITED questions (no daily cap)\n` +
          `• Priority responses with deeper analysis\n` +
          `• Portfolio tracker + daily market alerts\n\n` +
          `*KES 490/month \u2248 KES 16/day* \u2014 less than a chai!\n` +
          `Reply *SUBSCRIBE* to upgrade ⚡`
        ).catch(() => {}); // Non-blocking
      }
    } else {
      await sendWhatsAppMessage(waId, "🧠 *Sentill Africa* is thinking...");
    }

    // Auto-retry with exponential backoff (max 2 retries)
    let answer: string | null = null;
    let lastErr: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        answer = await askGeminiBot(question, {
          name: user?.name ?? "Investor",
          userId,
          isPremium: user?.isPremium ?? false,
        }, waId, advisorId);
        break; // Success
      } catch (err) {
        lastErr = err;
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, (attempt + 1) * 1000)); // 1s, 2s backoff
        }
      }
    }

    if (!answer) {
      console.error("[Bot] Gemini AI error after 3 attempts:", lastErr);
      return sendWhatsAppMessage(
        waId,
        `🧠 *Sentill Africa Says:*\n\n` +
        `I'm processing a LOT of intelligence right now! ⚡\n\n` +
        `While I reload, try these commands for instant data:\n` +
        `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n\n` +
        `📊 *MARKETS* — live yield table\n` +
        `📋 *MMF RATES* — top MMF comparison\n` +
        `📈 *NSE* — stock prices\n` +
        `🧮 *CALC 100000* — project returns\n\n` +
        `💬 Try your question again! I'm ready.\n\n` +
        `_S-Tier Institutional Wealth Intelligence_ 🇰🇪\n_sentill.africa_`
      );
    }

    // Track conversation topics for deeper memory
    const topicKeywords = question.toLowerCase().match(/\b(mmf|t-bill|bond|sacco|nse|stock|pension|crypto|forex|gold|land|reit|ifb|ziidi|etica|lofty|cytonn|calc|compare)\b/g);
    if (topicKeywords) {
      const existingTopics = ctx.lastTopics ?? [];
      const newTopics = [...new Set([...topicKeywords, ...existingTopics])].slice(0, 10);
      await updateSession(waId, session.state, {
        ...ctx,
        totalQuestions: (ctx.totalQuestions ?? 0) + 1,
        lastTopics: newTopics,
      }, userId);
    }

    const advisor = advisorId ? ADVISOR_ROSTER.find(a => a.id === advisorId) : null;
    const header = advisor
      ? `${advisor.emoji} *${advisor.name} Says:*`
      : `🧠 *Sentill Africa Says:*`;

    // Send the AI answer
    await sendWhatsAppMessage(waId, `${header}\n\n${answer}`);

    // Smart quick-reply suggestions based on the question context
    const suggestionsMap: Array<{ pattern: RegExp; suggestions: Array<{ id: string; title: string }> }> = [
      { pattern: /mmf|money market|fund|yield/i, suggestions: [
        { id: "MMF RATES", title: "📋 MMF Comparison" },
        { id: "CALC 100000", title: "🧮 Calc Returns" },
        { id: "INVEST", title: "💰 Browse Funds" },
      ]},
      { pattern: /stock|nse|share|equity|safaricom|kcb/i, suggestions: [
        { id: "STOCKS", title: "📊 NSE Live" },
        { id: "DIVIDEND", title: "📅 Dividends" },
        { id: "INVEST", title: "💰 Browse All" },
      ]},
      { pattern: /bond|ifb|t-?bill|treasury/i, suggestions: [
        { id: "IFB", title: "🏛️ IFB Guide" },
        { id: "MARKETS", title: "📊 All Rates" },
        { id: "CALC 50000", title: "🧮 Calc 50K" },
      ]},
      { pattern: /calc|invest|grow|return|project/i, suggestions: [
        { id: "MARKETS", title: "📊 Live Rates" },
        { id: "INVEST", title: "💰 Browse Funds" },
        { id: "TABLE", title: "📋 Ranked Table" },
      ]},
      { pattern: /compare|vs|versus|better/i, suggestions: [
        { id: "TABLE", title: "📋 Ranked Table" },
        { id: "INVEST", title: "💰 Browse All" },
        { id: "CHART MMFS", title: "📊 MMF Chart" },
      ]},
    ];

    try {
      const matched = suggestionsMap.find(s => s.pattern.test(question));
      const suggestions = matched?.suggestions ?? [
        { id: "MARKETS", title: "📊 Live Rates" },
        { id: "INVEST", title: "💰 Browse Funds" },
        { id: "MENU", title: "📋 Main Menu" },
      ];
      await sendInteractiveButtons(waId, "💡 *Quick actions:*", suggestions);
    } catch { /* buttons optional — WhatsApp may throttle */ }

    return;
  } catch (err) {
    console.error("[Bot] Gemini AI error:", err);
    return sendWhatsAppMessage(
      waId,
      `🧠 *Sentill Africa Says:*\n\n` +
      `I'm processing a LOT of intelligence right now! ⚡\n\n` +
      `While I reload, try these commands for instant data:\n` +
      `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n\n` +
      `📊 *MARKETS* — live yield table\n` +
      `📋 *MMF RATES* — top MMF comparison\n` +
      `📈 *NSE* — stock prices\n` +
      `🧮 *CALC 100000* — project returns\n\n` +
      `💬 Try your question again! I'm ready.\n\n` +
      `_S-Tier Institutional Wealth Intelligence_ 🇰🇪\n_sentill.africa_`
    );
  }
}

// Guest AI handler — for users who haven't registered/logged in
async function handleGeminiQuestionGuest(waId: string, question: string, session?: any, ctx?: SessionContext) {
  try {
    // Check daily AI usage even for guests (by waId)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const aiQueriesCount = await prisma.whatsAppLog.count({
      where: {
        waId,
        direction: "OUTBOUND",
        message: { contains: "Sentill Africa Says" },
        createdAt: { gte: todayStart },
      },
    });

    if (aiQueriesCount >= FREE_AI_LIMIT) {
      return sendPremiumConversionMessage(waId, "Investor", aiQueriesCount);
    }

    const remaining = FREE_AI_LIMIT - aiQueriesCount;
    await sendWhatsAppMessage(waId, `🧠 *Sentill Africa* is thinking... _(${remaining} free question${remaining !== 1 ? "s" : ""} left today)_`);

    // Auto-retry with exponential backoff (max 2 retries)
    let answer: string | null = null;
    let lastErr: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        answer = await askGeminiBot(question, {
          name: "Investor",
          userId: "guest",
          isPremium: false,
        }, waId);
        break;
      } catch (err) {
        lastErr = err;
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, (attempt + 1) * 1000));
        }
      }
    }

    if (!answer) {
      console.error("[Bot] Guest Gemini error after 3 attempts:", lastErr);
      return sendWhatsAppMessage(
        waId,
        `🧠 *Sentill Africa Says:*\n\n` +
        `I'm crunching the latest market data! ⚡\n\n` +
        `Try these commands for instant results:\n` +
        `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n\n` +
        `📊 *MARKETS* — live yield table\n` +
        `📋 *MMF RATES* — top fund comparison\n` +
        `🧮 *CALC 100000* — project returns\n\n` +
        `💬 Try your question again! I'll be right back.\n\n` +
        `_S-Tier Institutional Wealth Intelligence_ 🇰🇪\n_sentill.africa_`
      );
    }

    // Increment session-based question counter for conversion nudges
    const currentCount = (ctx?.guestQuestionCount as number | undefined) ?? 0;
    const newCount = currentCount + 1;
    if (session) {
      await updateSession(waId, session.state ?? "IDLE", {
        ...(ctx ?? {}),
        guestQuestionCount: newCount,
        totalQuestions: ((ctx?.totalQuestions ?? 0) + 1),
      });
    }

    // Smart contextual nudge — escalating urgency based on engagement depth
    let nudge = "";
    if (newCount === 1) {
      // First answer — very soft, don't interrupt the value
      nudge = `\n\n_Ask another question or type *MENU* for options_`;
    } else if (newCount === 3) {
      nudge = `\n\n━━━━━━━━━━━━━━━━\n💡 *You're getting great insights!* Create a free account to:\n✅ Save this conversation\n✅ Get daily market alerts to this WhatsApp\n✅ Track your portfolio\n\nType *REGISTER* — takes 30 seconds.`;
    } else if (newCount === 5) {
      nudge = `\n\n━━━━━━━━━━━━━━━━\n🔥 *You've asked 5 smart questions — you're clearly serious about investing!*\n\n🚀 *Register FREE now and unlock:*\n• Portfolio tracker + daily alerts\n• Save all your conversations\n• Financial goal planning\n\n⚡ Type *REGISTER* now — or you'll lose this conversation at midnight.`;
    } else if (newCount >= 8) {
      nudge = `\n\n━━━━━━━━━━━━━━━━\n⏰ *${FREE_AI_LIMIT - aiQueriesCount} questions left today* — Register FREE to unlock unlimited access!\n\nType *REGISTER* or reply *SUBSCRIBE* for Pro (KES 16/day).`;
    }

    // FOMO micro-conversion: extract yield from answer and show personalised KES calc
    const yieldMatch = answer.match(/(\d{1,2}\.\d{1,2})%/);
    let fomoNudge = "";
    if (yieldMatch) {
      const rate = parseFloat(yieldMatch[1]);
      if (rate >= 10 && rate <= 25) {
        const annualReturn = Math.round(10000 * rate / 100);
        const monthlyReturn = Math.round(annualReturn / 12);
        fomoNudge = `\n\n💡 _At ${rate}%, KES 10,000 earns *KES ${annualReturn.toLocaleString()}/yr* = *KES ${monthlyReturn}/month* passively._\n` +
                    `_Send *REGISTER* to start tracking this investment 📊_`;
      }
    }

    await sendWhatsAppMessage(
      waId,
      `🧠 *Sentill Africa Says:*\n\n${answer}${nudge}${fomoNudge}`
    );

    // Smart quick-reply suggestions for guest users (always include REGISTER option)
    try {
      await sendInteractiveButtons(waId, "💡 *Next steps:*", [
        { id: "MARKETS",  title: "📊 Live Rates" },
        { id: "REGISTER", title: "🚀 Free Account" },
      ]);
    } catch { /* buttons optional */ }

    return;
  } catch (err) {
    console.error("[Bot] Guest Gemini error:", err);
    return sendWhatsAppMessage(
      waId,
      `🧠 *Sentill Africa Says:*\n\n` +
      `I'm crunching the latest market data! ⚡\n\n` +
      `Try these commands for instant results:\n` +
      `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n\n` +
      `📊 *MARKETS* — live yield table\n` +
      `📋 *MMF RATES* — top fund comparison\n` +
      `🧮 *CALC 100000* — project returns\n\n` +
      `💬 Try your question again! I'll be right back.\n\n` +
      `_S-Tier Institutional Wealth Intelligence_ 🇰🇪\n_sentill.africa_`
    );
  }
}

// ── Premium conversion message — shown when free user hits 10-prompt limit ────
async function sendPremiumConversionMessage(waId: string, name: string, queriesUsed: number) {
  await sendWhatsAppMessage(
    waId,
    `🔒 *Daily Limit Reached, ${name}!*\n\n` +
    `You've used all *${FREE_AI_LIMIT} free questions* for today.\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `⚡ *UPGRADE TO SENTILL PRO*\n` +
    `Unlock *unlimited smart wealth intelligence:*\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `✅ *UNLIMITED questions* — Ask anything, anytime\n` +
    `✅ *Portfolio Tracker* — Log & monitor all investments\n` +
    `✅ *Real-time Price & Yield Alerts*\n` +
    `✅ *KRA Tax-Loss Harvesting analysis*\n` +
    `✅ *Sentill Alpha Engine* — Deep market analysis\n` +
    `✅ *NSE Candlestick Charts + RSI/MACD*\n` +
    `✅ *Chama/Club Dashboard*\n` +
    `✅ *Financial Goal Planning*\n` +
    `✅ *Priority 24/7 Support*\n` +
    `✅ *Downloadable PDF Analytics*\n` +
    `✅ *Estate Vault & Beneficiary Automations*\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `💰 *SENTILL PRO — KES 490/month*\n\n` +
    `⚡ One plan. Every feature. ≈ KES 16/day.\n` +
    `Less than a cup of coffee per day!\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `Your AI questions reset daily at midnight — but Pro users get *unlimited* access forever.\n\n` +
    `👉 *Reply SUBSCRIBE to upgrade now!*`
  );

  // Send interactive button for quick action
  try {
    await sendInteractiveButtons(
      waId,
      `⚡ *Activate Sentill Pro:*`,
      [
        { id: "PRO_30_DAYS", title: "⚡ Pro — KES 490/mo" },
      ]
    );
  } catch { /* buttons optional */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// Investment Browser
// ─────────────────────────────────────────────────────────────────────────────

async function sendInvestmentCategories(waId: string, userId: string) {
  // Fetch real-time top fund from each category
  const [topMMF, topBond, topTBill, topSacco, topPension] = await Promise.all([
    prisma.provider.findFirst({ where: { type: "MONEY_MARKET" }, orderBy: { currentYield: "desc" } }),
    prisma.provider.findFirst({ where: { type: "Bond" },         orderBy: { currentYield: "desc" } }),
    prisma.provider.findFirst({ where: { type: "T-Bill" },       orderBy: { currentYield: "desc" } }),
    prisma.provider.findFirst({ where: { type: "SACCO" },        orderBy: { currentYield: "desc" } }),
    prisma.provider.findFirst({ where: { type: "Pension" },      orderBy: { currentYield: "desc" } }),
  ]);

  const mmfYield    = topMMF?.currentYield?.toFixed(1)     ?? "12.9";
  const bondYield   = topBond?.currentYield?.toFixed(1)    ?? "18.46";
  const tbillYield  = topTBill?.currentYield?.toFixed(1)   ?? "16.42";
  const saccoYield  = topSacco?.currentYield?.toFixed(1)   ?? "14.5";
  const pensionYield = topPension?.currentYield?.toFixed(1) ?? "13";

  const msg =
    `\u{1F3DB} *SENTILL AFRICA \u2014 INVESTMENT HUB*\n` +
    `_Kenya\u2019s Complete Investment Universe_\n` +
    `\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\n\n` +

    `*\u{1F4B0} 1. MONEY MARKET FUNDS (MMFs)*\n` +
    `   Best: *${mmfYield}% p.a.* \u2014 ${topMMF?.name ?? "Etica MMF (Zidi)"}\n` +
    `   WHT: 15% | Min: KES 100 | Liquidity: \u26A1 T+1 (24hrs)\n` +
    `   Risk: \u{1F7E2} Very Low | CMA-regulated custodian\n` +
    `   \u2192 Start: M-Pesa \u2192 Ziidi, or download Zidi app\n` +
    `   _Reply *MMF* or *1* for full ranked list_\n\n` +

    `*\u{1F4C8} 2. TREASURY BILLS (T-Bills)*\n` +
    `   Best: *${tbillYield}%* gross (364-day) | Net: *~13.96%*\n` +
    `   WHT: 15% | Min: KES 50,000 | Tenure: 91/182/364 days\n` +
    `   Risk: \u{1F7E2} Zero \u2014 Government of Kenya guaranteed\n` +
    `   Auction: Every Monday via DhowCSD platform\n` +
    `   _Reply *TBILL* or *2* for auction guide_\n\n` +

    `*\u{1F3DB} 3. GOVERNMENT BONDS (IFBs \u{1F525})*\n` +
    `   Best: *${bondYield}%* \u2014 IFB1/2024 | *0% WHT \u2014 FULLY TAX-FREE*\n` +
    `   Net yield = stated yield. Zero tax, zero deduction.\n` +
    `   Min: KES 50,000 | Tenure: 6.5 years | Govt guaranteed\n` +
    `   *Kenya\u2019s best risk-adjusted investment in April 2026*\n` +
    `   _Reply *BOND* or *3* for full IFB guide_\n\n` +

    `*\u{1F91D} 4. SACCOs (Cooperative Savings \u0026 Credit)*\n` +
    `   Best dividend: *${saccoYield}% p.a.* + 8% on deposits\n` +
    `   Bonus: Loans at 12% p.a. (banks charge 16\u201320%)\n` +
    `   Min: KES 500 | Liquidity: 30\u201390 day withdrawal notice\n` +
    `   Risk: \u{1F7E1} Low-Medium | SASRA-regulated\n` +
    `   _Reply *SACCO* or *4* to browse top SACCOs_\n\n` +

    `*\u{1F4CA} 5. NSE STOCKS (Nairobi Stock Exchange)*\n` +
    `   Top dividends: BAT *9.8%* | KCB *6.8%* | SCBK *7.2%*\n` +
    `   Top YTD gains: KCB +28% | EQTY +22% | SBIC +18%\n` +
    `   Starts: KES 100 via M-Pesa \u2192 Ziidi \u2192 Trade\n` +
    `   Risk: \u{1F534} Medium\u2013High | Horizon: min 3\u20135 years\n` +
    `   _Reply *NSE* or *5* for live prices + AI analysis_\n\n` +

    `*\u{1F9D3} 6. PENSION / RETIREMENT FUNDS*\n` +
    `   Returns: *${pensionYield}\u201314%* p.a. long-term compound\n` +
    `   TAX SAVING: Up to *KES 9,000/month* in taxes saved!\n` +
    `   Max deductible: KES 30,000/month (30% tax bracket)\n` +
    `   Min: KES 500/month | Locked to age 50\n` +
    `   _Reply *PENSION* or *6* for full tax saving guide_\n\n` +

    `*\u{1F30D} 7. GLOBAL ETFs \u0026 OFFSHORE FUNDS*\n` +
    `   S\u0026P 500 (USD): *~15% p.a.* via Ndovu from KES 500\n` +
    `   USD Money Market: *5\u20137%* USD + KES hedge benefit\n` +
    `   Platforms: Ndovu, Cytonn Dollar MMF, ABSA Offshore\n` +
    `   Risk: \u{1F7E1} Medium | Great KES depreciation hedge\n` +
    `   _Reply *OFFSHORE* or *7* for global options_\n\n` +

    `*\u{1F3D7} 8. REAL ESTATE \u0026 REITs*\n` +
    `   ILAM Fahari REIT: *6.5%* dividend (NSE-listed)\n` +
    `   Land appreciation: 8\u201320% p.a. (Kiambu, Ruiru hot zones)\n` +
    `   From KES 6 (ILAM REIT on NSE) to KES 5M (land)\n` +
    `   Risk: \u{1F7E1} Medium | Long-term wealth builder\n` +
    `   _Reply *REITS* or *8* for full property guide_\n\n` +

    `*\u{1FA99} 9. CRYPTO (Bitcoin, Ethereum)*\n` +
    `   Bitcoin: *~$95,000* | ETH: *~$3,800* (April 2026)\n` +
    `   Buy via Binance P2P with M-Pesa from KES 500\n` +
    `   Risk: \u{1F534} EXTREME | Max 5\u201310% of portfolio only\n` +
    `   CBK advisory issued \u2014 trade responsibly\n` +
    `   _Reply *CRYPTO* or *9* for beginner\u2019s guide_\n\n` +

    `*\u{1F4B1} 10. FOREX TRADING*\n` +
    `   CMA-licensed: FXPesa ($5 min), Pepperstone, Scope\n` +
    `   Leverage: up to 1:400 | Platforms: MT4/MT5\n` +
    `   Risk: \u{1F534} VERY HIGH \u2014 75\u201385% retail traders LOSE money\n` +
    `   Demo account FIRST. Never trade with rent money.\n` +
    `   _Reply *FOREX* or *10* for licensed brokers list_\n\n` +

    `*\u{1F4BB} 11. SPECIAL FUNDS (Unit Trusts \u0026 Alternatives)*\n` +
    `   \u{1F4C8} Equity Funds: Sanlam 15\u201318% | Britam 10\u201315% p.a.\n` +
    `   \u2696\uFE0F Balanced Funds: Cytonn High Yield *18\u201320%* | Britam 14\u201316%\n` +
    `   \u{1F9F8} Fixed Income CIS: Cytonn FI 14\u201316% | CIC 12\u201314%\n` +
    `   \u{1F54C} Islamic/Sharia: Amana Capital MMF *13\u201315%* | Ijara Sukuk\n` +
    `   \u{1FAC0} Mansa-X (SIB): Global multi-asset \u2014 Min KES 250,000\n` +
    `   Min: KES 1,000 (unit trusts) | CMA-regulated\n` +
    `   _Reply *SPECIAL* or *11* for full special funds guide_\n\n` +

    `*\u{1F33F} 12. CORPORATE BONDS \u0026 COMMERCIAL PAPER*\n` +
    `   Issuers: Centum RE 13%, Family Bank 13.5%, EABL 12.5%\n` +
    `   Higher yield than govt T-bills. WHT: 15%.\n` +
    `   Min: KES 100,000 | Listed on NSE\n` +
    `   Risk: \u{1F7E1} Medium \u2014 corporate credit risk applies\n` +
    `   _Reply *CORP BONDS* or *12* for current issuances_\n\n` +

    `\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\u2580\n` +
    `\u{1F9E0} *ASK SENTILL ANYTHING \u2014 TYPE YOUR QUESTION:*\n` +
    `\u2022 _How do I invest KES 50,000 safely?_\n` +
    `\u2022 _Compare IFB Bond vs MMF_\n` +
    `\u2022 _Best option for 6 months?_\n` +
    `\u2022 _CALC 100000_ \u2014 see projected returns\n` +
    `\u2022 _CHART MMFS_ \u2014 visual bar chart comparison\n` +
    `\u2022 _TABLE_ \u2014 full ranked investment table\n\n` +
    `_S-Tier Institutional Wealth Intelligence_ \u{1F1F0}\u{1F1EA}\n` +
    `_sentill.africa_`;

  return sendWhatsAppMessage(waId, msg);
}


async function handleBrowseCategoryInput(waId: string, input: string, userId: string, ctx: SessionContext) {
  // Handle CAT_ button payload
  const catMatch = input.match(/^CAT_(.+)$/);

  // Handle numeric selection (1=MMF, 2=T-Bill, 3=SACCO, 4=Bond, 5=Equity, 6=Pension)
  const numericMap: Record<string, string> = {
    "1": "MONEY_MARKET",
    "2": "T-Bill",
    "3": "SACCO",
    "4": "Bond",
    "5": "Equity",
    "6": "Pension",
  };

  // Text/keyword shortcuts
  const keywordMap: Record<string, string> = {
    "MMF": "MONEY_MARKET", "MONEY MARKET": "MONEY_MARKET", "MONEY_MARKET": "MONEY_MARKET",
    "TBILL": "T-Bill",     "T-BILL": "T-Bill", "T BILL": "T-Bill", "TREASURY": "T-Bill",
    "SACCO": "SACCO",      "SACCOS": "SACCO",
    "BOND": "Bond",        "BONDS": "Bond", "GOVT BOND": "Bond",
    "EQUITY": "Equity",    "NSE": "Equity", "STOCKS": "Equity",
    "PENSION": "Pension",
  };

  let dbType: string | undefined;

  if (catMatch) {
    const rawType = catMatch[1].replace(/_/g, " ").replace("MONEY MARKET", "MONEY_MARKET");
    dbType = keywordMap[rawType] ?? { "T-BILL": "T-Bill", "MONEY_MARKET": "MONEY_MARKET" }[rawType] ?? rawType;
  } else if (numericMap[input.trim()]) {
    dbType = numericMap[input.trim()];
  } else if (keywordMap[input.trim().toUpperCase()]) {
    dbType = keywordMap[input.trim().toUpperCase()];
  }

  if (!dbType) return sendInvestmentCategories(waId, userId);
  return sendProviderList(waId, dbType, userId, ctx);
}


async function sendProviderList(waId: string, providerType: string, userId: string, ctx: SessionContext) {
  const providers = await prisma.provider.findMany({
    where: { type: providerType },
    orderBy: { currentYield: "desc" },
    take: 8,
    select: {
      id: true, name: true, currentYield: true, riskLevel: true,
      minimumInvest: true, aum: true,
    },
  });

  if (!providers.length) {
    return sendWhatsAppMessage(
      waId,
      `📋 No providers found for *${providerType}*.\n\nSend *INVEST* to browse all categories.`
    );
  }

  const categoryLabel = INVEST_CATEGORIES[providerType] ?? providerType;

  let msg = `${categoryLabel}\n`;
  msg += `━━━━━━━━━━━━━━━━\n`;
  providers.forEach((p, i) => {
    msg += `*${i + 1}. ${p.name}*\n`;
    msg += `   📈 Yield: *${p.currentYield.toFixed(2)}% p.a.*\n`;
    msg += `   ⚡ Risk: ${p.riskLevel}\n`;
    if (p.minimumInvest) msg += `   💵 Min: ${p.minimumInvest}\n`;
    msg += `\n`;
  });
  msg += `━━━━━━━━━━━━━━━━\n`;
  msg += `Reply with a *number* (1-${providers.length}) to get details & AI summary.\n\n`;
  msg += `Or:\n• *LOG* — add an investment\n• *INVEST* — browse other categories\n• *ASK which ${providerType} is best for me?*`;

  await updateSession(waId, "BROWSE_PROVIDERS", {
    ...ctx,
    category: providerType,
  }, userId);

  return sendWhatsAppMessage(waId, msg);
}

async function handleBrowseProviderAction(waId: string, input: string, ctx: SessionContext, userId?: string) {
  // Could be a number selection or a CAT_ button or LOG_ action
  if (input.startsWith("CAT_")) {
    return handleBrowseCategoryInput(waId, input, userId!, ctx);
  }

  if (input === "INVEST" || input === "BACK") {
    await updateSession(waId, "IDLE", {}, userId);
    return sendInvestmentCategories(waId, userId!);
  }

  if (input === "LOG" || input === "ADD") {
    await updateSession(waId, "IDLE", {}, userId);
    return startLogAsset(waId, ctx, userId!);
  }

  // Number selection — show provider detail
  const num = parseInt(input, 10);
  if (!isNaN(num) && ctx.category) {
    const providers = await prisma.provider.findMany({
      where: { type: ctx.category },
      orderBy: { currentYield: "desc" },
      take: 8,
    });
    const selected = providers[num - 1];
    if (selected) {
      await updateSession(waId, "BROWSE_PROVIDERS", {
        ...ctx,
        providerId: selected.id,
        providerName: selected.name,
        providerYield: selected.currentYield,
      }, userId);

      // Show thinking indicator then get AI summary
      await sendWhatsAppMessage(waId, "🧠 *Sentill Africa* is analysing this fund...");
      const aiSummary = await generateInvestmentSummary(
        selected.name, selected.type, selected.currentYield,
        selected.riskLevel, selected.minimumInvest ?? null
      );

      const liquidity = (selected as any).liquidity ?? "Check provider";
      const regulated = (selected as any).regulatedBy ?? "CMA Kenya";

      const detail =
        `🏦 *${selected.name}*\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `📈 *Yield:* ${selected.currentYield.toFixed(2)}% p.a.\n` +
        `⚡ *Risk:* ${selected.riskLevel}\n` +
        `🏛 *AUM:* ${selected.aum}\n` +
        (selected.minimumInvest ? `💵 *Min. Invest:* ${selected.minimumInvest}\n` : ``) +
        `⚖️ *Regulated by:* ${regulated}\n` +
        `💧 *Liquidity:* ${liquidity}\n\n` +
        `🧠 *Sentill Africa Says:*\n${aiSummary}\n\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `*LOG* — track this  |  *WATCH* — save it\n` +
        `*BACK* — other ${ctx.category ?? "funds"}  |  *COMPARE* — vs another`;

      // Send detail text first
      await sendWhatsAppMessage(waId, detail);

      // Then action buttons
      try {
        await sendInteractiveButtons(
          waId,
          `What would you like to do with *${selected.name}*?`,
          [
            { id: "LOG",    title: "📝 Log Investment" },
            { id: "WATCH",  title: "👁 Add to Watchlist" },
            { id: "INVEST", title: "🔙 Browse More" },
          ]
        );
      } catch { /* buttons optional */ }
      return;
    }
  }

  // WATCH command in browse mode
  if ((input === "WATCH" || input === "WATCHLIST") && ctx.providerId) {
    try {
      await prisma.watchlist.upsert({
        where: { id: `${userId}_${ctx.providerId}`, } as never,
        create: { userId: userId!, providerId: ctx.providerId },
        update: {},
      }).catch(async () => {
        // upsert may fail on non-unique id, just try create
        const exists = await prisma.watchlist.findFirst({
          where: { userId: userId!, providerId: ctx.providerId! },
        });
        if (!exists) {
          await prisma.watchlist.create({
            data: { userId: userId!, providerId: ctx.providerId! },
          });
        }
      });
      await updateSession(waId, "IDLE", {}, userId);
      return sendWhatsAppMessage(
        waId,
        `👁 *${ctx.providerName ?? "Provider"}* added to your Watchlist!\n\n` +
        `Send *WATCHLIST* anytime to view saved providers.\nSend *MENU* for more options.`
      );
    } catch {
      return sendWhatsAppMessage(waId, "❌ Could not add to watchlist. Try again.");
    }
  }

  // Fallback
  await updateSession(waId, "IDLE", {}, userId);
  return sendWhatsAppMessage(
    waId,
    `Send a number to select a provider, or:\n` +
    `• *INVEST* — browse categories\n• *MENU* — main menu`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Asset Logging
// ─────────────────────────────────────────────────────────────────────────────

async function startLogAsset(waId: string, ctx: SessionContext, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.isPremium) {
    return sendWhatsAppMessage(
      waId,
      `📊 *Log Investment*\n\n` +
      `Asset tracking is a *Pro feature*.\n\n` +
      `⚡ Send *SUBSCRIBE* to upgrade — only *KES 490/month*.`
    );
  }

  const providers = await prisma.provider.findMany({
    orderBy: [{ type: "asc" }, { currentYield: "desc" }],
    take: 6,
    select: { id: true, name: true, type: true, currentYield: true },
  });

  let msg = `📊 *Log Investment*\n\n`;
  msg += `Which provider are you investing with?\n\n`;
  providers.forEach((p, i) => {
    msg += `*${i + 1}.* ${p.name} (${p.currentYield.toFixed(1)}%)\n`;
  });
  msg += `\nReply with a *number* or type the provider *name*.\n(Or *CANCEL* to quit)`;

  await updateSession(waId, "LOG_ASSET_PROVIDER", {
    ...ctx,
    // Store provider list temporarily
  }, userId);

  return sendWhatsAppMessage(waId, msg);
}

async function handleLogAssetProvider(waId: string, input: string, ctx: SessionContext, userId?: string) {
  if (input === "CANCEL" || input === "MENU") {
    await updateSession(waId, "IDLE", {}, userId);
    return sendWhatsAppMessage(waId, "❌ Cancelled. Send *MENU* for options.");
  }

  // Try numeric selection
  const providers = await prisma.provider.findMany({
    orderBy: [{ type: "asc" }, { currentYield: "desc" }],
    take: 6,
    select: { id: true, name: true, currentYield: true },
  });

  let selected = null;
  const num = parseInt(input, 10);
  if (!isNaN(num) && num >= 1 && num <= providers.length) {
    selected = providers[num - 1];
  } else {
    // Try name match
    selected = await prisma.provider.findFirst({
      where: { name: { contains: input, mode: "insensitive" } },
      select: { id: true, name: true, currentYield: true },
    });
  }

  if (!selected) {
    return sendWhatsAppMessage(
      waId,
      `❌ Provider not found. Reply with a number (1-${providers.length}) or the provider name.\nSend *CANCEL* to quit.`
    );
  }

  await updateSession(waId, "LOG_ASSET_AMOUNT", {
    ...ctx,
    logProviderId: selected.id,
    logProviderName: selected.name,
    logProviderYield: selected.currentYield,
  } as SessionContext & { logProviderYield: number }, userId);

  return sendWhatsAppMessage(
    waId,
    `✅ *${selected.name}* (${selected.currentYield.toFixed(1)}% p.a.)\n\n` +
    `How much have you invested? (in KES)\n\n` +
    `Example: *50000*\n_(Send *CANCEL* to quit)_`
  );
}

async function handleLogAssetAmount(waId: string, rawInput: string, ctx: SessionContext, userId?: string) {
  if (rawInput.toUpperCase() === "CANCEL") {
    await updateSession(waId, "IDLE", {}, userId);
    return sendWhatsAppMessage(waId, "❌ Cancelled.");
  }

  const amount = parseFloat(rawInput.replace(/[^0-9.]/g, ""));
  if (isNaN(amount) || amount < 100) {
    return sendWhatsAppMessage(waId, "❌ Please enter a valid amount in KES (minimum 100).\nExample: *50000*");
  }

  // Fetch provider yield for projection
  const provider = await prisma.provider.findUnique({
    where: { id: ctx.logProviderId },
    select: { currentYield: true },
  });
  const yieldRate = provider?.currentYield ?? 13;
  const annualReturn = (amount * yieldRate) / 100;

  await updateSession(waId, "LOG_ASSET_CONFIRM", {
    ...ctx,
    logAmount: amount,
  }, userId);

  return sendWhatsAppMessage(
    waId,
    `📊 *Confirm Investment Log*\n\n` +
    `🏦 Provider: *${ctx.logProviderName}*\n` +
    `💰 Amount: *${formatKES(amount)}*\n` +
    `📈 Yield: *${yieldRate.toFixed(1)}% p.a.*\n` +
    `🎯 Est. Annual Return: *${formatKES(annualReturn)}*\n\n` +
    `_This records your investment info — your money stays with ${ctx.logProviderName}._\n\n` +
    `Reply *YES* to confirm or *NO* to cancel.`
  );
}

async function handleLogAssetConfirm(waId: string, input: string, ctx: SessionContext, userId?: string) {
  if (input === "NO" || input === "CANCEL") {
    await updateSession(waId, "IDLE", {}, userId);
    return sendWhatsAppMessage(waId, "❌ Cancelled. Send *MENU* for options.");
  }

  if (input !== "YES") {
    return sendWhatsAppMessage(waId, "Please reply *YES* to confirm or *NO* to cancel.");
  }

  if (!userId || !ctx.logProviderId || !ctx.logAmount) {
    await updateSession(waId, "IDLE", {}, userId);
    return sendWhatsAppMessage(waId, "❌ Session error. Please start again with *LOG*.");
  }

  const provider = await prisma.provider.findUnique({
    where: { id: ctx.logProviderId },
    select: { currentYield: true },
  });

  try {
    await prisma.portfolioAsset.create({
      data: {
        userId,
        providerId: ctx.logProviderId,
        principal: ctx.logAmount,
        projectedYield: provider?.currentYield ?? 13,
      },
    });

    await updateSession(waId, "IDLE", {}, userId);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentill.africa";

    return sendWhatsAppMessage(
      waId,
      `✅ *Investment logged!*\n\n` +
      `🏦 ${ctx.logProviderName}\n` +
      `💰 ${formatKES(ctx.logAmount)}\n\n` +
      `View your full portfolio:\n${appUrl}/dashboard/assets\n\n` +
      `Send *PORTFOLIO* to see all tracked assets, or *LOG* to add another.`
    );
  } catch (err) {
    console.error("[Bot] Log asset error:", err);
    await updateSession(waId, "IDLE", {}, userId);
    return sendWhatsAppMessage(waId, "❌ Failed to save. Please try again with *LOG*.");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Registration flow
// ─────────────────────────────────────────────────────────────────────────────

async function handleRegisterName(waId: string, name: string, ctx: SessionContext) {
  if (name.length < 2) {
    return sendWhatsAppMessage(waId, "Please enter your *full name* (at least 2 characters).");
  }
  await updateSession(waId, "REGISTER_EMAIL", { ...ctx, name });
  return sendWhatsAppMessage(
    waId,
    `Great, *${name}*! 👋\n\nNow enter your *email address*:`
  );
}

async function handleRegisterEmail(waId: string, email: string, ctx: SessionContext) {
  const emailLower = email.toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
    return sendWhatsAppMessage(waId, "❌ Invalid email. Please try again:");
  }

  const existing = await prisma.user.findUnique({ where: { email: emailLower } });
  if (existing) {
    await updateSession(waId, "IDLE", {});
    return sendWhatsAppMessage(
      waId,
      `⚠️ An account with *${emailLower}* already exists.\n\nSend *LOGIN* to link your WhatsApp.`
    );
  }

  const otp = generateOTP();
  const hashedOtp = await bcrypt.hash(otp, 10);
  await updateSession(waId, "REGISTER_OTP", { ...ctx, email: emailLower, otp: hashedOtp });
  return sendWhatsAppMessage(
    waId,
    `📲 Your verification code:\n\n🔐 *${otp}*\n\n_(valid for 10 minutes)_\n\nEnter the code to verify:`
  );
}

async function handleRegisterOTP(waId: string, inputOtp: string, ctx: SessionContext) {
  // Allow resend — regenerates OTP and stays in REGISTER_OTP
  if (inputOtp === "RESEND OTP" || inputOtp === "RESEND") {
    if (!ctx.email || !ctx.name) {
      await updateSession(waId, "IDLE", {});
      return sendWhatsAppMessage(waId, "❌ Session expired. Send *REGISTER* to start again.");
    }
    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);
    await updateSession(waId, "REGISTER_OTP", { ...ctx, otp: hashedOtp, otpAttempts: 0, otpLockedUntil: undefined });
    return sendWhatsAppMessage(waId, `📲 *New verification code sent:*\n\n🔐 *${otp}*\n\n_(valid for 10 minutes)_\n\nEnter the code to verify:`);
  }

  if (!ctx.otp || !ctx.name || !ctx.email) {
    await updateSession(waId, "IDLE", {});
    return sendWhatsAppMessage(waId, "❌ Session expired. Send *REGISTER* to start again.");
  }

  // Check lockout
  if (ctx.otpLockedUntil && Date.now() < ctx.otpLockedUntil) {
    const minutesLeft = Math.ceil((ctx.otpLockedUntil - Date.now()) / 60000);
    return sendWhatsAppMessage(waId, `🔒 Too many failed attempts. Try again in *${minutesLeft} min*.\nOr send *RESEND OTP* for a new code.`);
  }

  const valid = await bcrypt.compare(inputOtp, ctx.otp);
  if (!valid) {
    const attempts = (ctx.otpAttempts ?? 0) + 1;
    if (attempts >= 3) {
      const lockedUntil = Date.now() + 10 * 60 * 1000;
      await updateSession(waId, "REGISTER_OTP", { ...ctx, otpAttempts: attempts, otpLockedUntil: lockedUntil });
      return sendWhatsAppMessage(waId, `🔒 *3 failed attempts.* Locked for *10 minutes*.\n\nSend *RESEND OTP* to get a fresh code.`);
    }
    await updateSession(waId, "REGISTER_OTP", { ...ctx, otpAttempts: attempts });
    return sendWhatsAppMessage(waId, `❌ Invalid OTP. *${3 - attempts} attempt${3 - attempts !== 1 ? "s" : ""} remaining.*\nSend *RESEND OTP* for a new code.`);
  }

  // Generate a website login password
  const plainPassword = generateSecurePassword();
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const normalizedPhone = normalizePhone(waId);
  const user = await prisma.user.create({
    data: {
      name: ctx.name,
      email: ctx.email,
      password: hashedPassword,
      whatsappId: normalizedPhone,
      whatsappVerified: true,
      role: "USER",
    },
  });

  // Auto-enable daily notifications (will let user pick frequency next)
  await (prisma as any).alertPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      whatsappEnabled: true,
      whatsappNumber: normalizedPhone,
      frequency: "DAILY",
      watchlistAlerts: true,
      marketMoversAlerts: false,
    },
    update: { whatsappEnabled: true, whatsappNumber: normalizedPhone },
  });

  await updateSession(waId, "GOAL_AFTER_REGISTER", {}, user.id);

  // ── REFERRAL REWARD: Check if new user came via a referral link ─────────────
  // Referral code embedded in first message: SENTIL_REF_XXXXXX
  try {
    const rawCtxMessage = ctx as any;
    const refMatch = (rawCtxMessage?.referCode ?? "").match(/^SENTIL_REF_([A-Z0-9]{6})$/);
    if (refMatch) {
      const refCode = refMatch[1];
      // Decode the referrer's waId (base64 hash)
      // Find the referrer by checking all users whose waId hashes to this code
      const allUsers = await prisma.user.findMany({ select: { id: true, name: true, whatsappId: true, premiumExpiresAt: true, isPremium: true } });
      const referrer = allUsers.find(u => {
        if (!u.whatsappId) return false;
        return Buffer.from(u.whatsappId).toString("base64").slice(-6).toUpperCase() === refCode;
      });
      if (referrer) {
        // Persist referrer — 30-day payout fires in payment webhook on paid conversion
        await prisma.user.update({
          where: { id: user.id },
          data: { referredBy: referrer.id },
        });
        // Signup bonus: 3 days Pro to referrer
        const currentExpiry = referrer.premiumExpiresAt ?? new Date();
        const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
        const newExpiry = new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000);
        await prisma.user.update({
          where: { id: referrer.id },
          data: { isPremium: true, premiumExpiresAt: newExpiry },
        });
        // Notify the referrer immediately
        if (referrer.whatsappId) {
          sendWhatsAppMessage(
            referrer.whatsappId,
            `🎉 *${ctx.name?.split(" ")[0] ?? "Someone"} just joined Sentill using your invite!*\n\n` +
            `🎁 *You’ve earned 3 days of Sentill Pro FREE!*\n` +
            `⚡ Pro active until: *${newExpiry.toLocaleDateString("en-KE")}*\n\n` +
            `Keep sharing — more referrals = more free Pro days!\n` +
            `Reply *REFER* to see your stats \ud83d\udcca`
          ).catch(() => {});
        }
        console.log(`[Referral] ${ctx.name} referred by ${referrer.name} (${refCode}) — +3 days Pro`);
      }
    }
  } catch (err) {
    console.warn("[Referral] Auto-reward failed (non-critical):", err);
  }

  // Send login credentials email (non-blocking)
  sendEmail({
    to: ctx.email,
    subject: "🔐 Your Sentill Africa Website Login Credentials",
    html: buildLoginCredentialsEmail(ctx.name, ctx.email, plainPassword),
  }).catch(err => console.warn("[Bot] Credentials email failed:", err));

  // Ask investment goal right after registration (goal → then frequency)
  const firstName = ctx.name?.split(" ")[0] ?? "Investor";
  return sendWhatsAppMessage(
    waId,
    `🎉 *Welcome to Sentil Africa, ${firstName}!*\n\n` +
    `Your free account is ready.\n` +
    `📧 Login credentials sent to ${ctx.email}\n\n` +
    `What's your primary investment goal?\n\n` +
    `*1* — 💰 Save & grow money (MMFs)\n` +
    `*2* — 📈 NSE stocks & dividends\n` +
    `*3* — 🏛️ Government bonds\n` +
    `*4* — 👥 Chama / group investing\n\n` +
    `_Reply 1, 2, 3, or 4_`
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// Goal capture after registration — delivers first value, then asks frequency
// ─────────────────────────────────────────────────────────────────────────────

async function handleGoalAfterRegister(waId: string, input: string, ctx: SessionContext, userId?: string) {
  const goalMap: Record<string, string> = {
    "1": "SAVINGS", "SAVINGS": "SAVINGS", "MMF": "SAVINGS", "SAVE": "SAVINGS",
    "2": "EQUITIES", "EQUITIES": "EQUITIES", "STOCKS": "EQUITIES", "NSE": "EQUITIES",
    "3": "BONDS", "BONDS": "BONDS", "TBILL": "BONDS", "BOND": "BONDS",
    "4": "CHAMA", "CHAMA": "CHAMA", "GROUP": "CHAMA",
  };

  const goal = goalMap[input] ?? null;

  if (goal && userId) {
    try {
      await (prisma.user.update as any)({ where: { id: userId }, data: { onboardingGoal: goal } });
    } catch {}
  }

  // Deliver first value based on goal
  let valueMsg = "";
  if (goal === "SAVINGS" || !goal) {
    const topFunds = await prisma.provider.findMany({
      where: { type: "MONEY_MARKET" },
      orderBy: { currentYield: "desc" },
      take: 3,
      select: { name: true, currentYield: true, minimumInvest: true },
    });
    const lines = topFunds.map((f, i) => {
      const minStr = f.minimumInvest ?? "KES 1,000";
      return `${i + 1}. *${f.name}* — ${f.currentYield.toFixed(2)}% p.a. | Min ${minStr}`;
    }).join("\n");
    valueMsg = `💰 *Top 3 Money Market Funds right now:*\n\n${lines}\n\n_Type *LOG* to track your first investment_`;
  } else if (goal === "EQUITIES") {
    valueMsg = `📈 *NSE Stocks — Quick Guide:*\n\nType *NSE* to see today's stock signals\nType *SCOM* for Safaricom price & analysis\nType *EQTY* for Equity Bank\n\n_Type *LOG* to track a stock position_`;
  } else if (goal === "BONDS") {
    valueMsg = `🏛️ *Government Securities:*\n\n• *T-Bills* — 91/182/364 day | ~16% gross\n• *IFB Bonds* — 18.46% *tax-free* 🔥\n• Buy via DhowCSD (CBK platform)\n\n_Type *IFB* for the step-by-step guide_`;
  } else if (goal === "CHAMA") {
    valueMsg = `👥 *Chama Investment Tracker:*\n\nSentil helps your group:\n• Track each member's contributions\n• Compare investment options\n• Calculate group returns\n\n_Set up your Chama at sentill.africa/chama_`;
  }

  await updateSession(waId, "FREQ_AFTER_REGISTER", {}, userId);

  const firstName = ctx.name?.split(" ")[0] ?? "Investor";
  return sendWhatsAppMessage(
    waId,
    `✅ *Account created, ${firstName}!* Welcome to Sentil Africa 🎉\n\n` +
    valueMsg +
    `\n\n━━━━━━━━━━━━━━━━\n` +
    `Last step — how often do you want market updates?\n\n` +
    `*DAILY* — Morning brief every day\n` +
    `*WEEKLY* — Monday summary\n` +
    `*OFF* — No automatic updates`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Login flow
// ─────────────────────────────────────────────────────────────────────────────

async function handleLoginRequest(waId: string) {
  const normalizedPhone = normalizePhone(waId);
  const user = await prisma.user.findUnique({ where: { whatsappId: normalizedPhone } });

  if (!user) {
    return sendWhatsAppMessage(
      waId,
      "❌ No account linked to this number.\n\nSend *REGISTER* to create a free account."
    );
  }

  const otp = generateOTP();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: hashedOtp, otpExpiry: expiry },
  });

  await updateSession(waId, "LOGIN_OTP", { otp: hashedOtp });

  return sendWhatsAppMessage(
    waId,
    `🔐 *Sentil Login OTP*\n\nYour one-time code: *${otp}*\n\n_(expires in 10 minutes)_\n\nReply with this code to log in:`
  );
}

async function handleLoginOTP(waId: string, inputOtp: string, ctx: SessionContext) {
  // Allow resend at any time
  if (inputOtp === "RESEND OTP" || inputOtp === "RESEND") {
    await updateSession(waId, "IDLE", {});
    return handleLoginRequest(waId);
  }

  // Check lockout
  if (ctx.otpLockedUntil && Date.now() < ctx.otpLockedUntil) {
    const minutesLeft = Math.ceil((ctx.otpLockedUntil - Date.now()) / 60000);
    return sendWhatsAppMessage(waId, `🔒 Too many failed attempts. Try again in *${minutesLeft} min*.\nOr send *RESEND OTP* for a new code.`);
  }

  const normalizedPhone = normalizePhone(waId);
  const user = await prisma.user.findUnique({ where: { whatsappId: normalizedPhone } });

  if (!user?.otpCode || !user.otpExpiry) {
    await updateSession(waId, "IDLE", {});
    return sendWhatsAppMessage(waId, "❌ Session expired. Send *LOGIN* to try again.");
  }

  if (new Date() > user.otpExpiry) {
    await updateSession(waId, "IDLE", {});
    return sendWhatsAppMessage(waId, "⏱ OTP expired. Send *LOGIN* to get a new code.");
  }

  const valid = await bcrypt.compare(inputOtp, user.otpCode);
  if (!valid) {
    const attempts = (ctx.otpAttempts ?? 0) + 1;
    if (attempts >= 3) {
      const lockedUntil = Date.now() + 10 * 60 * 1000;
      await updateSession(waId, "LOGIN_OTP", { ...ctx, otpAttempts: attempts, otpLockedUntil: lockedUntil });
      return sendWhatsAppMessage(waId, `🔒 *3 failed attempts.* Locked for *10 minutes*.\n\nSend *RESEND OTP* to request a fresh code.`);
    }
    await updateSession(waId, "LOGIN_OTP", { ...ctx, otpAttempts: attempts });
    return sendWhatsAppMessage(waId, `❌ Wrong code. *${3 - attempts} attempt${3 - attempts !== 1 ? "s" : ""} remaining.*\nSend *RESEND OTP* for a new code.`);
  }

  // If user has no website password yet, generate one and email it
  let passwordMsg = "";
  if (!user.password) {
    const plainPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: null, otpExpiry: null, whatsappVerified: true, password: hashedPassword },
    });
    // Send credentials email
    sendEmail({
      to: user.email,
      subject: "🔐 Your Sentill Africa Website Login Credentials",
      html: buildLoginCredentialsEmail(user.name, user.email, plainPassword),
    }).catch(err => console.warn("[Bot] Credentials email failed:", err));
    passwordMsg = `\n📧 *Website login sent to ${user.email}!*\n🌐 Login at *www.sentill.africa*\n`;
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: null, otpExpiry: null, whatsappVerified: true },
    });
  }

  // Auto-enable WA notifications
  await prisma.alertPreference.upsert({
    where: { userId: user.id },
    create: { userId: user.id, whatsappEnabled: true, whatsappNumber: normalizePhone(waId), frequency: "DAILY" },
    update: { whatsappEnabled: true, whatsappNumber: normalizePhone(waId) },
  });

  await updateSession(waId, "IDLE", {}, user.id);

  const subStatus = user.isPremium ? `⚡ *Pro Active*` : `🔓 *Free Plan*`;
  const expiry = user.premiumExpiresAt
    ? ` (expires ${new Date(user.premiumExpiresAt).toLocaleDateString("en-KE")})`
    : "";

  return sendWhatsAppMessage(
    waId,
    `✅ *Logged in!* Welcome back, *${user.name.split(" ")[0]}* 👋\n\n` +
    `${subStatus}${expiry}${passwordMsg}\n` +
    `🔔 *Daily AI briefs are ON* — market intel at 7AM EAT.\n\n` +
    `💡 *Quick commands:*\n` +
    `• *INVEST* — browse investment options\n` +
    `• *MARKETS* — live rates\n` +
    `• *ASSETS* — manage portfolio\n` +
    `• *SNAPSHOT* — quick portfolio card\n` +
    `• *ASK* — ask Sentill anything\n` +
    `• *MENU* — all options`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard commands
// ─────────────────────────────────────────────────────────────────────────────

async function handlePortfolio(waId: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user?.isPremium) {
    return sendWhatsAppMessage(
      waId,
      `📊 *Portfolio Tracker*\n\nThis is a *Pro feature*.\n\n` +
      `⚡ Send *SUBSCRIBE* to upgrade — only *KES 490/month*.`
    );
  }

  const assets = await prisma.portfolioAsset.findMany({
    where: { userId },
    include: { provider: true },
    orderBy: { loggedAt: "desc" },
    take: 8,
  });

  if (!assets.length) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentill.africa";
    return sendWhatsAppMessage(
      waId,
      `📊 *Your Portfolio*\n\nNo assets logged yet.\n\n` +
      `• Send *LOG* to add an investment\n` +
      `• Or visit: ${appUrl}/dashboard/assets`
    );
  }

  const total = assets.reduce((s, a) => s + a.principal, 0);
  const projected = assets.reduce((s, a) => s + (a.principal * a.projectedYield) / 100, 0);

  let msg = `📊 *Your Sentil Portfolio*\n\n`;
  assets.slice(0, 6).forEach((a) => {
    msg += `• *${a.provider.name}* (${a.provider.type})\n`;
    msg += `  ${formatKES(a.principal)} @ ${a.projectedYield.toFixed(1)}% p.a.\n\n`;
  });
  msg += `──────────────────\n`;
  msg += `📦 *Total Tracked:* ${formatKES(total)}\n`;
  msg += `📈 *Projected Annual:* ${formatKES(projected)}\n\n`;
  msg += `_ℹ️ Your money stays with your providers._\n\n`;
  msg += `• *LOG* — add investment\n• *MARKETS* — live rates\n• *GOALS* — your targets`;

  return sendWhatsAppMessage(waId, msg);
}

async function handleMarkets(waId: string) {
  const now = new Date().toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });
  const freshness = await getRatesFreshness();

  // ── Dynamic data from DB (live rates override hardcoded fallbacks) ──
  const [dbMMFs, dbGovt] = await Promise.all([
    prisma.provider.findMany({
      where: { type: "MONEY_MARKET" },
      orderBy: { currentYield: "desc" },
      take: 11,
      select: { name: true, currentYield: true, minimumInvest: true },
    }),
    prisma.marketRateCache.findMany({
      where: { symbol: { in: ["TBILL_91", "TBILL_182", "TBILL_364", "IFB1"] } },
      orderBy: { lastSyncedAt: "desc" },
    }),
  ]);

  // Build MMF table — prefer DB, fallback to static if DB empty
  const MMF_TABLE = dbMMFs.length >= 3
    ? dbMMFs.map(p => ({
        name: p.name,
        yield: p.currentYield,
        min: p.minimumInvest ?? "KES 1,000",
      }))
    : [
        { name: "Etica Capital MMF (Zidi)", yield: 18.20, min: "KES 1,000" },
        { name: "Lofty-Corpin MMF",         yield: 17.50, min: "KES 1,000" },
        { name: "Cytonn Money Market",      yield: 16.90, min: "KES 1,000" },
        { name: "NCBA Money Market",        yield: 16.20, min: "KES 1,000" },
        { name: "KCB Money Market",         yield: 15.80, min: "KES 1,000" },
        { name: "Britam Money Market",      yield: 15.50, min: "KES 1,000" },
        { name: "Sanlam Investments MMF",   yield: 15.10, min: "KES 5,000" },
        { name: "ICEA Lion MMF",            yield: 14.50, min: "KES 5,000" },
        { name: "CIC Money Market",         yield: 13.60, min: "KES 5,000" },
        { name: "Old Mutual MMF",           yield: 13.40, min: "KES 1,000" },
        { name: "Absa MMF",                 yield: 13.20, min: "KES 1,000" },
      ];

  const USD_MMF_TABLE = [
    { name: "Nabo Africa USD MMF",  yield: 5.91 },
    { name: "Cytonn USD MMF",       yield: 5.69 },
    { name: "Etica USD MMF",        yield: 5.51 },
    { name: "Old Mutual USD MMF",   yield: 5.20 },
  ];

  // Build govt securities — prefer DB, fallback to static
  const govtLabelMap: Record<string, string> = {
    IFB1: "IFB1/2024 Bond", TBILL_364: "364-Day T-Bill",
    TBILL_182: "182-Day T-Bill", TBILL_91: "91-Day T-Bill",
  };
  const GOVT_TABLE = dbGovt.length >= 2
    ? dbGovt.map(r => {
        const isIFB = r.symbol === "IFB1";
        return {
          name: govtLabelMap[r.symbol] ?? r.symbol,
          yield: r.price,
          net: isIFB ? r.price : +(r.price * 0.85).toFixed(2),
          note: isIFB ? "WHT exempt 🏆" : "net after 15% WHT",
        };
      })
    : [
        { name: "IFB1/2024 Bond",  yield: 18.46, net: 18.46, note: "WHT exempt 🏆" },
        { name: "364-Day T-Bill",  yield: 16.42, net: 13.96, note: "net after 15% WHT" },
        { name: "182-Day T-Bill",  yield: 15.97, net: 13.57, note: "net after 15% WHT" },
        { name: "91-Day T-Bill",   yield: 15.78, net: 13.41, note: "net after 15% WHT" },
      ];

  const isLive = dbMMFs.length >= 3;
  const sourceTag = isLive ? "📡 LIVE from Sentill DB" : "📋 Reference rates";

  const MEDALS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

  let msg = `📊 *SENTILL LIVE YIELD TABLE*\n_${now} · ${sourceTag}_\n\n`;

  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *MONEY MARKET FUNDS (KES)*\n`;
  msg += `_Gross yield • Net of fees • 15% WHT applies on interest_\n`;
  msg += `_T+2–5 days withdrawal • CMA regulated_\n\n`;
  MMF_TABLE.forEach((f, i) => {
    const medal = MEDALS[i] ?? `${i+1}.`;
    const netYield = (f.yield * 0.85).toFixed(2);
    msg += `${medal} *${f.name}* — *${f.yield.toFixed(2)}%* gross (*${netYield}%* net after WHT)\n   Min: ${f.min}\n`;
  });

  msg += `\n━━━━━━━━━━━━━━━━━━\n`;
  msg += `💵 *USD MONEY MARKET FUNDS*\n`;
  msg += `_Dollar returns + KES depreciation hedge_\n\n`;
  USD_MMF_TABLE.forEach((f, i) => {
    const medal = MEDALS[i] ?? `${i+1}.`;
    msg += `${medal} *${f.name}* — *${f.yield.toFixed(2)}% USD* p.a.\n`;
  });

  msg += `\n━━━━━━━━━━━━━━━━━━\n`;
  msg += `🏛️ *GOVERNMENT SECURITIES*\n`;
  msg += `_Zero credit risk • CBK-issued_\n\n`;
  GOVT_TABLE.forEach((g) => {
    const isIFB = g.name.includes("IFB");
    msg += `• *${g.name}* — *${g.yield.toFixed(2)}%* gross _(${g.note})_\n`;
    if (!isIFB) msg += `   Net after WHT: *${g.net.toFixed(2)}%*\n`;
  });

  // Dynamic alpha insight from top fund
  const topMMF = MMF_TABLE[0];
  const topNet = (topMMF.yield * 0.85).toFixed(2);
  const ifbEntry = GOVT_TABLE.find(g => g.name.includes("IFB"));
  const ifbYield = ifbEntry?.yield.toFixed(2) ?? "18.46";

  msg += `\n━━━━━━━━━━━━━━━━━━\n`;
  msg += `📌 *KEY MARKET CONTEXT*\n`;
  msg += `• WHT: 15% on all MMF interest (rates above are *gross*)\n`;
  msg += `• Effective net on the top fund ≈ *${topNet}%* after WHT\n`;
  msg += `• Withdrawals: Lofty-Corpin Instant, Etica/KCB T+1, most others T+2\n\n`;
  msg += `💡 *ALPHA INSIGHT*\n`;
  msg += `IFB Bond at *${ifbYield}%* (WHT-exempt) beats every MMF on a net basis (min KES 50K)\n`;
  msg += `Best liquid KES option: *${topMMF.name}* at *${topMMF.yield.toFixed(2)}%* gross (*${topNet}%* net)\n\n`;
  msg += `📱 *QUICK COMMANDS*\n`;
  msg += `• *MMF RATES* — full detailed MMF breakdown\n`;
  msg += `• *INVEST* — browse by category\n`;
  msg += `• *COMPARE Nabo vs Cytonn* — AI comparison\n`;
  msg += `• *CALC 100000* — project KES 100K returns\n`;
  msg += `• *SPECIAL* — Unit Trusts, Pension, Offshore\n\n`;
  msg += freshness;

  await sendWhatsAppMessage(waId, msg);

  try {
    await sendInteractiveButtons(
      waId,
      `What would you like to explore?`,
      [
        { id: "INVEST",    title: "💰 Browse Funds" },
        { id: "MMF RATES", title: "📋 MMF Detail" },
        { id: "MARKETS",   title: "🔄 Refresh Rates" },
      ]
    );
  } catch { /* buttons optional */ }
}

async function handleMMFRates(waId: string) {
  const now = new Date().toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });
  const freshness = await getRatesFreshness();

  // ── Pull live MMF data from DB ──
  const dbMMFs = await prisma.provider.findMany({
    where: { type: "MONEY_MARKET" },
    orderBy: { currentYield: "desc" },
    take: 15,
    select: { name: true, currentYield: true, minimumInvest: true },
  });

  const isLive = dbMMFs.length >= 3;
  const sourceTag = isLive ? "📡 LIVE from DB" : "📋 Reference rates";
  const topFunds = isLive
    ? dbMMFs.slice(0, 6)
    : [
        { name: "Etica Capital MMF (Zidi)", currentYield: 18.20, minimumInvest: "KES 1,000" },
        { name: "Lofty-Corpin MMF",         currentYield: 17.50, minimumInvest: "KES 1,000" },
        { name: "Cytonn Money Market",      currentYield: 16.90, minimumInvest: "KES 1,000" },
        { name: "NCBA Money Market",        currentYield: 16.20, minimumInvest: "KES 1,000" },
        { name: "KCB Money Market",         currentYield: 15.80, minimumInvest: "KES 1,000" },
        { name: "Britam Money Market",      currentYield: 15.50, minimumInvest: "KES 1,000" },
      ];
  const moreFunds = isLive ? dbMMFs.slice(6) : [];

  let msg = `💰 *KENYA MMF RATES — ${now}*\n`;
  msg += `_Effective annual yields • Gross before 15% WHT · ${sourceTag}_\n\n`;

  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `🏆 *TOP PERFORMERS (KES)*\n\n`;

  const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣"];
  topFunds.forEach((f, i) => {
    const y = f.currentYield;
    const net = (y * 0.85).toFixed(2);
    const min = f.minimumInvest ?? "KES 1,000";
    msg += `${medals[i] ?? `${i+1}.`} *${f.name}* — *${y.toFixed(2)}%* gross (*${net}%* net)\n`;
    msg += `   Min: ${min}\n\n`;
  });

  if (moreFunds.length) {
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `📊 *MORE FUNDS (KES)*\n\n`;
    moreFunds.forEach(f => {
      const net = (f.currentYield * 0.85).toFixed(2);
      const min = f.minimumInvest ?? "Check provider";
      msg += `• *${f.name}* — ${f.currentYield.toFixed(2)}% gross (${net}% net) | Min ${min}\n`;
    });
    msg += `\n`;
  }

  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `💵 *USD MONEY MARKET FUNDS*\n`;
  msg += `_Hedge against KES depreciation + dollar returns_\n\n`;
  msg += `🥇 *Cytonn USD MMF* — *5.69% USD* p.a.\n`;
  msg += `🥈 *Etica USD MMF* — *5.51% USD* p.a.\n`;
  msg += `🥉 *Old Mutual USD MMF* — *5.20% USD* p.a.\n\n`;

  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `📌 *KEY FACTS YOU NEED TO KNOW*\n\n`;
  msg += `*1. Taxation (15% Withholding Tax)*\n`;
  msg += `All KES MMF interest is subject to 15% WHT.\n`;
  msg += `Formula: Net yield = Gross × 0.85\n`;
  const topY = topFunds[0]?.currentYield ?? 18.20;
  const topN = (topY * 0.85).toFixed(2);
  msg += `Example: ${topY.toFixed(2)}% gross → *${topN}% net*\n\n`;
  msg += `*2. Management Fees*\n`;
  msg += `Rates shown are already net of management fees (~1–2% p.a. already deducted).\n\n`;
  msg += `*3. Liquidity / Withdrawals*\n`;
  msg += `Fastest: *Lofty-Corpin* (Instant), *Etica Zidi* (T+1)\n`;
  msg += `Most others: *T+1 to T+2* to your bank/M-Pesa\n\n`;
  msg += `*4. Safety*\n`;
  msg += `All CMA-licensed funds invest in CBK T-Bills & bank deposits.\n`;
  msg += `Zero history of capital loss in Kenya MMF sector.\n\n`;

  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `💡 *BETTER ALTERNATIVE FOR LONG TERM*\n`;
  msg += `IFB Bond at *18.46%* (WHT-exempt!) beats every MMF.\n`;
  msg += `Min KES 50,000 | 6.5yr tenor | Via DhowCSD\n`;
  msg += `Reply *BOND* or *IFB* for the full guide.\n\n`;
  msg += freshness;

  await sendWhatsAppMessage(waId, msg);

  try {
    await sendInteractiveButtons(
      waId,
      "What would you like to do next?",
      [
        { id: "CALC 100000",  title: "🧮 Project Returns" },
        { id: "IFB",          title: "🏛️ IFB Bond Guide" },
        { id: "LIST",         title: "📋 Pick a Fund" },
      ]
    );
  } catch { /* buttons optional */ }
}

async function handleSpecialFunds(waId: string) {
  const msg =
    `✨ *SPECIAL INVESTMENT CATEGORIES*\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📱 *INVEST VIA M-PESA*\n` +
    `_Kenya's easiest entry — invest directly from your phone_\n\n` +
    `• *MMFs via M-Pesa* — access top funds from KES 100\n` +
    `• *NSE Stocks via M-Pesa* — buy shares from KES 100\n` +
    `• Dividends & returns paid back to M-Pesa ✅\n` +
    `• Zero paperwork — digital KYC only\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📦 *UNIT TRUSTS*\n` +
    `_Invest in NSE stocks or bonds via a fund manager_\n\n` +
    `• *Cytonn High Yield Solution* — *18-20%* _(fixed income)_\n` +
    `• *Britam Balanced Fund* — *14-16%* _(balanced)_\n` +
    `• *Old Mutual Balanced Fund* — *13-15%* _(balanced)_\n` +
    `• *Sanlam Equity Fund* — *12-18%* _(equity, NSE-linked)_\n` +
    `• *CIC Equity Fund* — *11-17%* _(equity, NSE-linked)_\n\n` +
    `⚠️ _Returns vary year to year. Past returns ≠ future._\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🧓 *PENSION FUNDS*\n` +
    `_Tax-deductible contributions up to KES 30,000/month_\n\n` +
    `• *NSSF Voluntary (Tier 2)* — from KES 200/month\n` +
    `• *Jubilee Pension Scheme* — *11-13%* long-term\n` +
    `• *ICEA Lion Retirement Fund* — *11-14%* long-term\n` +
    `• *Britam Pension Fund* — *10-13%* long-term\n` +
    `• *CIC Pension Plan* — *10-12%* long-term\n\n` +
    `💡 *TAX BENEFIT:* 30% bracket? KES 30K/month pension\n` +
    `   contribution saves you *KES 9,000/month* in taxes!\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `💱 *OFFSHORE / DOLLAR FUNDS*\n` +
    `_USD returns + hedge against KES depreciation_\n\n` +
    `• *Cytonn Dollar Money Market* — *5-7% USD* p.a.\n` +
    `• *Ndovu (ETF-linked)* — *8-15%* _(global ETFs, S&P 500)_\n` +
    `• *Old Mutual International* — *5-8% USD*\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📊 *LICENSED NSE BROKERS*\n` +
    `_Buy Safaricom, Equity, KCB shares on the NSE_\n\n` +
    `• *Genghis Capital* — online, from KES 1,000\n` +
    `• *NCBA Securities* — bank-linked, full NSE access\n` +
    `• *AIB-AXYS Africa* — retail-friendly mobile app\n` +
    `• *Dyer & Blair* — established, ideal for larger amounts\n\n` +
    `_Type any ticker for AI analysis: SCOM · EQTY · KCB_\n\n` +
    `_ℹ️ Sentill researches. You invest via your chosen broker._`;

  return sendWhatsAppMessage(waId, msg);
}

async function handleGoals(waId: string, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { goals: true, portfolioAssets: { include: { provider: { select: { name: true } } } } },
  });

  if (!user?.isPremium) {
    return sendInteractiveButtons(
      waId,
      `🎯 *Financial Goals*\n\nGoal planning is a *Pro feature*.\nUpgrade to set goals, track progress, and get AI-powered savings plans.`,
      [
        { id: "SUBSCRIBE", title: "⚡ Upgrade to Pro" },
        { id: "MARKETS",   title: "📈 Live Rates" },
        { id: "INVEST",    title: "🏦 Browse Funds" },
      ]
    );
  }

  if (!user.goals.length) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentill.africa";
    return sendWhatsAppMessage(
      waId,
      `🎯 *Your Financial Goals*\n\nNo goals set yet!\n\n` +
      `💡 *Set a goal via WhatsApp:*\nType: *GOAL <name> <target amount> <deadline>*\n\n` +
      `Example: _GOAL Home Fund 2000000 2026-12-31_\n\n` +
      `Or set detailed goals at: ${appUrl}/dashboard`
    );
  }

  const totalSaved = user.portfolioAssets.reduce((s, a) => s + a.principal, 0);
  let msg = `🎯 *Your Financial Goals*\n\n`;
  user.goals.forEach((g) => {
    const deadline = new Date(g.deadline).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
    const pct = totalSaved > 0 ? Math.min(100, Math.round((totalSaved / g.target) * 100)) : 0;
    const bar = "█".repeat(Math.round(pct / 10)) + "░".repeat(10 - Math.round(pct / 10));
    msg += `*${g.name}* (${g.category})\n`;
    msg += `Target: *${formatKES(g.target)}* by ${deadline}\n`;
    msg += `Progress: ${bar} ${pct}%\n\n`;
  });
  msg += `💡 Add a goal: *GOAL <name> <amount> <YYYY-MM-DD>*\n`;
  msg += `• *PORTFOLIO* — view investments\n• *ASK* — get savings advice`;
  return sendWhatsAppMessage(waId, msg);
}

async function handleWatchlist(waId: string, userId: string) {
  const items = await prisma.watchlist.findMany({
    where: { userId },
    include: { provider: true },
  });

  if (!items.length) {
    return sendWhatsAppMessage(
      waId,
      `👀 *Your Watchlist*\n\nNothing saved yet.\n\n` +
      `• *INVEST* — browse providers to add\n• Or send *WATCH* after viewing a provider`
    );
  }

  let msg = `👀 *Your Watchlist*\n\n`;
  items.forEach((item) => {
    if (item.provider) {
      msg += `• *${item.provider.name}* — ${item.provider.currentYield.toFixed(1)}% p.a. (${item.provider.type})\n`;
    } else if (item.stockSymbol) {
      msg += `• *${item.stockSymbol}* (NSE)\n`;
    }
  });
  msg += `\n_ℹ️ Information snapshots — invest directly with each provider._\n\nSend *MARKETS* for live rates.`;

  return sendWhatsAppMessage(waId, msg);
}

async function handleSubscriptionStatus(waId: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentill.africa";

  if (user.isPremium) {
    const expires = user.premiumExpiresAt
      ? `Expires: *${new Date(user.premiumExpiresAt).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}*`
      : "Never expires";

    const isExpiringSoon = user.premiumExpiresAt
      ? new Date(user.premiumExpiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      : false;

    let msg =
      `⚡ *Sentil Pro — Active*\n\n` +
      `👤 ${user.name}\n` +
      `📅 ${expires}\n\n` +
      `✅ Portfolio Tracker\n✅ Sentill Africa Oracle\n✅ Goal Planning\n✅ Daily Intelligence\n\n`;

    if (isExpiringSoon) {
      msg += `⚠️ *Expiring soon!* Send *RENEW* to keep access.`;
    } else {
      msg += `🌐 ${appUrl}/dashboard`;
    }

    return sendWhatsAppMessage(waId, msg);
  }

  return sendWhatsAppMessage(
    waId,
    `🔓 *Sentil Free Plan*\n\n` +
    `👤 ${user.name}\n\n` +
    `❌ Portfolio tracker\n❌ Sentill Africa Oracle\n❌ Goal planning\n\n` +
    `⚡ *Upgrade to Sentill Pro:*\n` +
    `💎 *KES 490/month* — All features unlocked\n\n` +
    `Send *SUBSCRIBE* to upgrade.`
  );
}

async function handleLogout(waId: string) {
  await prisma.whatsAppSession.update({
    where: { waId },
    data: { userId: null, state: "IDLE", context: "{}" },
  });
  return sendWhatsAppMessage(waId, "👋 Logged out. Send *LOGIN* to reconnect.");
}

// ─────────────────────────────────────────────────────────────────────────────
// Subscription flow
// ─────────────────────────────────────────────────────────────────────────────

async function sendSubscriptionPlans(waId: string, userId?: string) {
  if (!userId) {
    return sendWhatsAppMessage(waId, "🔒 Please *LOGIN* first before subscribing.");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const isRenewal = user?.isPremium ?? false;
  const action = isRenewal ? "Renew" : "Upgrade to";

  await sendWhatsAppMessage(
    waId,
    `⚡ *${action} Sentill Pro*\n\n` +
    `Unlock full intelligence:\n` +
    `📊 Portfolio tracking\n` +
    `🧠 Unlimited AI Oracle\n` +
    `🎯 Goal planning\n` +
    `📉 KRA Tax AI\n` +
    `🔔 Daily 7AM market briefs\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `💎 *Choose your plan*\n\n` +
    `🔹 *Monthly* — KES 490\n   _≈ KES 16/day_\n\n` +
    `🔸 *Quarterly* — KES 1,299 _(save 12%)_\n   _3 months · KES 14/day_\n\n` +
    `🔶 *Annual* — KES 4,900 _(save 17%)_\n   _2 months FREE · KES 13/day_\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `👥 Running a chama? Reply *CHAMA PLAN* for group pricing (10 seats · KES 2,500/mo).\n\n` +
    `Tap a plan below to activate:`
  );

  await sendInteractiveButtons(
    waId,
    `Select your plan:`,
    [
      { id: "ANNUAL_365_DAYS",   title: "🔶 Annual — KES 4,900" },
      { id: "QUARTERLY_90_DAYS", title: "🔸 3 Months — KES 1,299" },
      { id: "PRO_30_DAYS",       title: "🔹 Monthly — KES 490" },
    ],
    userId
  );
}

async function handleSelectPlan(
  waId: string,
  plan: PlanKey,
  ctx: SessionContext,
  userId?: string
) {
  if (!userId) {
    return sendWhatsAppMessage(waId, "🔒 Please *LOGIN* first.");
  }

  const planInfo = PLANS[plan];
  await updateSession(waId, "SUB_CONFIRM", { ...ctx, plan }, userId);

  return sendWhatsAppMessage(
    waId,
    `⚡ *Confirm Subscription*\n\n` +
    `Plan: *${planInfo.label}*\n` +
    `Duration: *${planInfo.days} day${planInfo.days > 1 ? "s" : ""}*\n` +
    `Amount: *${formatKES(planInfo.amount)}*\n` +
    `${planInfo.description}\n\n` +
    `💳 Payment via *Paystack* (M-Pesa / Card).\n` +
    `_Sentill does not hold your money._\n\n` +
    `Reply *YES* to get your secure payment link, or *NO* to cancel.`
  );
}

async function handleSubConfirm(
  waId: string,
  input: string,
  ctx: SessionContext,
  userId?: string
) {
  if (input === "NO" || input === "CANCEL") {
    await updateSession(waId, "IDLE", {}, userId);
    return sendWhatsAppMessage(waId, "❌ Cancelled. Send *MENU* for options.");
  }

  if (input !== "YES") {
    return sendWhatsAppMessage(waId, "Reply *YES* to confirm or *NO* to cancel.");
  }

  if (!userId) {
    await updateSession(waId, "IDLE", {});
    return sendWhatsAppMessage(waId, "❌ Must be logged in. Send *LOGIN* first.");
  }

  const plan = (ctx.plan ?? "PRO_MONTHLY") as PlanKey;
  const planInfo = PLANS[plan];
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    await updateSession(waId, "IDLE", {});
    return sendWhatsAppMessage(waId, "❌ Account not found. Try again.");
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentill.africa";
    const paystackRes = await fetch(`${appUrl}/api/payment/mpesa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        amount: planInfo.amount,
        plan,
        email: user.email,
        mpesaCode: "WA-CHECKOUT",
      }),
    });

    const paystackData = await paystackRes.json();

    if (paystackRes.ok && paystackData.success && paystackData.authorization_url) {
      await updateSession(waId, "AWAITING_PAYMENT", { ...ctx, paymentInitiatedAt: Date.now() }, userId);

      return sendWhatsAppMessage(
        waId,
        `✅ *Your Secure Payment Link*\n\n` +
        `Plan: *${planInfo.label}* — ${formatKES(planInfo.amount)}\n\n` +
        `🔗 ${paystackData.authorization_url}\n\n` +
        `👆 Tap the link to pay via *M-Pesa or Card* on Paystack.\n\n` +
        `_Your Pro access activates automatically after payment._\n\n` +
        `⚠️ Link expires in 30 minutes. Send *SUBSCRIBE* for a new one.\n\n` +
        `After paying, type *DONE* and I'll check your payment status.`
      );
    } else {
      throw new Error(paystackData.error ?? "Checkout failed");
    }
  } catch (err) {
    console.error("[Bot Sub Confirm]", err);
    await updateSession(waId, "IDLE", {}, userId);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentill.africa";
    return sendWhatsAppMessage(
      waId,
      `❌ Failed to generate payment link.\n\n` +
      `Subscribe directly from the web:\n${appUrl}/packages\n\n` +
      `Or try again: send *SUBSCRIBE*`
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Payment check — handles DONE/PAID after Paystack link is sent
// ─────────────────────────────────────────────────────────────────────────────

async function handlePaymentCheck(waId: string, input: string, ctx: SessionContext, userId?: string) {
  if (input === "CANCEL" || input === "NO") {
    await updateSession(waId, "IDLE", {}, userId);
    return sendWhatsAppMessage(waId, "Cancelled. Send *SUBSCRIBE* anytime to get a new payment link.");
  }

  if (!["DONE", "PAID", "CHECK", "I PAID", "I'VE PAID", "CONFIRM"].includes(input)) {
    return sendWhatsAppMessage(waId,
      `⏳ Waiting for your M-Pesa payment.\n\n` +
      `After paying on Paystack, type *DONE* to activate Pro.\n` +
      `Or type *SUBSCRIBE* for a new payment link.`
    );
  }

  if (!userId) {
    await updateSession(waId, "IDLE", {});
    return sendWhatsAppMessage(waId, "❌ Session error. Send *SUBSCRIBE* to try again.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true, premiumExpiresAt: true, name: true },
  });

  if (user?.isPremium && user.premiumExpiresAt && user.premiumExpiresAt > new Date()) {
    await updateSession(waId, "IDLE", {}, userId);
    const firstName = user.name?.split(" ")[0] ?? "Investor";
    return sendWhatsAppMessage(waId,
      `⚡ *Pro is ACTIVE, ${firstName}!*\n\n` +
      `Your premium access expires: *${user.premiumExpiresAt.toLocaleDateString("en-KE")}*\n\n` +
      `Unlocked:\n` +
      `✅ Unlimited AI advisor\n` +
      `✅ Full portfolio tracking\n` +
      `✅ Real-time yield alerts\n` +
      `✅ NSE candlestick charts\n\n` +
      `Type *MENU* to get started 🚀`
    );
  }

  // Payment not confirmed yet
  const initiatedAt = ctx.paymentInitiatedAt as number | undefined;
  const minutesAgo = initiatedAt ? Math.floor((Date.now() - initiatedAt) / 60000) : 0;

  if (minutesAgo > 30) {
    await updateSession(waId, "IDLE", {}, userId);
    return sendWhatsAppMessage(waId,
      `⚠️ Your payment link has expired (valid 30 mins).\n\n` +
      `Send *SUBSCRIBE* to get a fresh link.`
    );
  }

  return sendWhatsAppMessage(waId,
    `🔄 Payment not confirmed yet — M-Pesa can take 1–3 minutes.\n\n` +
    `Type *DONE* again once you've completed the payment,\n` +
    `or *SUBSCRIBE* for a new link.`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main menu
// ─────────────────────────────────────────────────────────────────────────────
// Guest greeting — conversational, low-friction entry for new users
// ─────────────────────────────────────────────────────────────────────────────

async function sendGuestGreeting(waId: string) {
  let topYield = "17.5";
  let topName = "Top MMF";
  let userCount = 50;
  try {
    const [top, count] = await Promise.all([
      prisma.provider.findFirst({
        where: { type: "MONEY_MARKET" },
        orderBy: { currentYield: "desc" },
        select: { name: true, currentYield: true },
      }),
      prisma.user.count(),
    ]);
    if (top) {
      topYield = top.currentYield.toFixed(1);
      topName = top.name;
    }
    userCount = Math.max(count, 50);
  } catch {}

  // Dynamic urgency based on time of day (EAT)
  const hour = new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi", hour: "numeric", hour12: false });
  const h = parseInt(hour);
  const timeGreeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";

  // Social proof
  const roundedCount = Math.floor(userCount / 10) * 10;

  await sendWhatsAppMessage(
    waId,
    `👋 *${timeGreeting}! Welcome to Sentill Africa.*\n` +
    `_Kenya's #1 AI-powered investment intelligence hub_ 🇰🇪\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📊 *RIGHT NOW:*\n` +
    `🏆 Best MMF: *${topName}* — *${topYield}% p.a.*\n` +
    `💡 That's *${Math.round(parseFloat(topYield) / 3)}× more* than a savings account\n` +
    `👥 *${roundedCount.toLocaleString()}+ investors* already using Sentill\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🎯 *What would you like to do?*\n\n` +
    `*1* — 📊 Live market rates & yields\n` +
    `*2* — 💰 Browse investments (MMF/T-Bill/NSE/Bond)\n` +
    `*3* — 🧠 Ask Sentill AI anything\n` +
    `*4* — 🚀 Create FREE account\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `_No account needed — just type any question:_\n` +
    `_"Best MMF for KES 50K?" · "How do bonds work?" · "CALC 100000"_\n\n` +
    `_Or type *MARKETS* for instant live rates_ ⚡`
  );

  // Interactive buttons for higher engagement
  try {
    await sendInteractiveButtons(waId, "👇 *Quick start:*", [
      { id: "MARKETS",  title: "📊 Live Rates" },
      { id: "REGISTER", title: "🚀 Free Account" },
    ]);
  } catch { /* buttons optional */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Menu — clean numbered system for easy navigation
// ─────────────────────────────────────────────────────────────────────────────

async function sendMainMenu(waId: string, userId?: string) {
  // Pull real-time top MMF yield + user count for social proof
  let topYield = "17.5";
  let userCount = 0;
  try {
    const [topMMF, count] = await Promise.all([
      prisma.provider.findFirst({
        where: { type: "MONEY_MARKET" },
        orderBy: { currentYield: "desc" },
        select: { currentYield: true },
      }),
      prisma.user.count(),
    ]);
    if (topMMF) topYield = topMMF.currentYield.toFixed(1);
    userCount = count;
  } catch { /* use defaults */ }

  // Social proof line — round down to nearest 10 for credibility
  const displayCount = Math.max(userCount, 50); // Always show at least 50
  const roundedCount = Math.floor(displayCount / 10) * 10;
  const socialProof = `👥 *${roundedCount.toLocaleString()}+ Kenyan investors* already using Sentill 🇰🇪`;

  const investmentList =
    `▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
` +
    `🏗 *ALL INVESTMENT OPTIONS*

` +
    `💰 *MMFs* (Money Market) — *${topYield}% p.a.* | KES 100 min | T+1
` +
    `📈 *T-Bills* (Govt) — *16.42%* gross | KES 50K | 91–364 days
` +
    `🆹 *IFB Bonds* — *18.46% WHT-FREE* 🔥 | KES 50K | 6.5 yrs
` +
    `🤝 *SACCOs* — *14–20%* div + cheap loans | KES 500
` +
    `📊 *NSE Stocks* — Dividends + capital growth | KES 100
` +
    `🥳 *Pension* — *13—15%* + save KES 9K/mo in taxes
` +
    `🌍 *Global ETFs* — S&P 500 ~15% USD | via Ndovu KES 500
` +
    `🏗 *Real Estate/REITs* — ILAM REIT 6.5% div | KES 6
` +
    `🪙 *Crypto* — BTC, ETH | M-Pesa via Binance | High risk
` +
    `💱 *Forex* — CMA-licensed brokers | $5 min | Very high risk
` +
    `💻 *Special Funds* — Unit trusts, Balanced, Islamic funds
` +
    `🌿 *Corp Bonds* — Centum 13%, Family Bank 13.5%
` +
    `▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
` +
    `💡 *Reply with any category name for full details:*
` +
    `_MMF · TBILL · BOND · IFB · SACCO · NSE · PENSION_
` +
    `_OFFSHORE · REITS · CRYPTO · FOREX · SPECIAL · CORP BONDS_`;

  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const name = user?.name?.split(" ")[0] ?? "Investor";
    const isPro = user?.isPremium ?? false;

    const expiresIn = user?.premiumExpiresAt
      ? Math.ceil((new Date(user.premiumExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;
    const expiryWarning =
      isPro && expiresIn !== null && expiresIn <= 7
        ? `\n\u26a0\ufe0f Pro expires in *${expiresIn} day${expiresIn !== 1 ? "s" : ""}* \u2014 send *RENEW*`
        : "";

    return sendWhatsAppMessage(
      waId,
      `👋 *Hi ${name}!* — Sentill Africa${expiryWarning}
` +
      `${isPro ? "⚡ Pro Member" : "🔓 Free Plan"} | ${socialProof}

` +
      investmentList +
      `

━━━━━━━━━━━━━━━━━━
*Quick actions:*
` +
      `*1* — 📊 Live Rates & Yields
` +
      `*2* — 🧠 Ask Sentill Anything
` +
      (isPro
        ? `*3* — 📁 My Portfolio
` +
          `*4* — 🎯 My Goals
`
        : `*3* — 📁 Portfolio _(Pro)_
` +
          `*4* — 🎯 Goals _(Pro)_
`) +
      `*5* — ⭐ Subscribe / Renew Pro

` +
      `_Or just type your question — AI replies instantly_`,
      userId
    );
  }

  // Guest — lead with social proof + full investment universe
  return sendWhatsAppMessage(
    waId,
    `👋 *Welcome to Sentill Africa!*
` +
    `_Kenya's #1 Investment Intelligence Hub_
` +
    `${socialProof}

` +
    investmentList +
    `

━━━━━━━━━━━━━━━━━━
*Quick actions:*
` +
    `*1* — 📊 Live Rates & Yields
` +
    `*2* — 🧠 Ask Sentill Anything
` +
    `*3* — 👤 Create Free Account _(portfolio & alerts)_

` +
    `_Or just type any question — no account needed_
` +
    `_e.g. "Best MMF for KES 50K?" or "How to buy a bond?"_`
  );
}


async function sendHelp(waId: string, userId?: string) {
  if (!userId) {
    return sendWhatsAppMessage(waId,
      `📋 *SENTIL AFRICA — WHAT CAN I DO?*\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `No account needed:\n\n` +
      `📊 *RATES* — Today's top MMF yields\n` +
      `📈 *NSE* — NSE stock signals & prices\n` +
      `🏛️ *IFB* — Infrastructure Bond guide\n` +
      `💬 *ASK [question]* — AI answers anything\n` +
      `🧮 *CALC 50000* — Quick return projection\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `With a free account:\n\n` +
      `📁 *LOG* — Track your investments\n` +
      `🎯 *GOALS* — Set financial targets\n` +
      `🔔 *ALERTS* — Daily market briefing\n\n` +
      `👉 Type *REGISTER* to create your free account\n` +
      `_Takes 2 minutes. No payment required._`
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true, name: true },
  });
  const isPro = user?.isPremium ?? false;

  if (!isPro) {
    return sendWhatsAppMessage(waId,
      `📋 *YOUR SENTIL COMMANDS*\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `*Free (yours now):*\n\n` +
      `📊 *RATES* · *NSE* · *IFB* — Market data\n` +
      `💬 Ask any question — 10 AI answers/day\n` +
      `📁 *LOG* — Track up to 3 assets\n` +
      `🎯 *GOALS* — Set targets\n` +
      `👥 *REFER* — Invite friends, earn free Pro\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `*🔒 Unlock with Pro (KES 490/mo):*\n\n` +
      `• Unlimited AI advisor\n` +
      `• Unlimited portfolio tracking\n` +
      `• Real-time yield drop alerts\n` +
      `• NSE charts (RSI, MACD)\n` +
      `• KRA tax optimizer\n` +
      `• Chama group dashboard\n\n` +
      `👉 Type *UPGRADE* to see plans`
    );
  }

  return sendWhatsAppMessage(waId,
    `📋 *SENTIL PRO — YOUR COMMANDS*\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `*Markets:* RATES · NSE · IFB · MOVERS · LEADERBOARD\n` +
    `*Portfolio:* ASSETS · LOG · REMOVE · REALLOCATE · SNAPSHOT\n` +
    `*Analysis:* PERFORMANCE · CHART [type] · EXPORT\n` +
    `*Goals:* GOALS · GOAL [name] [amount] [date]\n` +
    `*Watchlist:* WATCHLIST · WATCH · UNWATCH\n` +
    `*Alerts:* ALERTS · FREQ [DAILY/WEEKLY/OFF]\n` +
    `*AI:* ASK [question] · ADVISOR · COMPARE [A] vs [B]\n` +
    `*Account:* STATUS · REFER · RENEW\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `_Type any question — AI replies instantly_`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPARE — AI side-by-side fund comparison
// ─────────────────────────────────────────────────────────────────────────────

async function handleCompare(waId: string, query: string, userId: string) {
  await sendWhatsAppMessage(waId, "🧠 *Sentill Africa* is comparing funds...");

  // Parse "Fund A vs Fund B" or just list top 2
  let name1 = "", name2 = "";
  const vsMatch = query.match(/^(.+?)\s+(?:vs|versus|and|or)\s+(.+)$/i);
  if (vsMatch) {
    name1 = vsMatch[1].trim();
    name2 = vsMatch[2].trim();
  }

  const [p1, p2, user, rates] = await Promise.all([
    name1
      ? prisma.provider.findFirst({ where: { name: { contains: name1, mode: "insensitive" } } })
      : prisma.provider.findFirst({ where: { type: "MONEY_MARKET" }, orderBy: { currentYield: "desc" } }),
    name2
      ? prisma.provider.findFirst({ where: { name: { contains: name2, mode: "insensitive" } } })
      : prisma.provider.findFirst({ where: { type: "MONEY_MARKET" }, orderBy: { currentYield: "desc" }, skip: 1 }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, isPremium: true } }),
    prisma.marketRateCache.findMany({ take: 4, orderBy: { lastSyncedAt: "desc" } }),
  ]);

  if (!p1 || !p2) {
    return sendWhatsAppMessage(
      waId,
      `❌ Could not find both funds.\n\n` +
      `Try: *COMPARE CIC MMF vs Sanlam MMF*\n` +
      `Or: *COMPARE T-Bill vs MMF*\n\n` +
      `Send *INVEST* to browse available funds.`
    );
  }

  const marketCtx = rates.map(r => `${r.symbol}: ${r.price.toFixed(2)}%`).join(", ") || "91-Day T-Bill: 15.78%";

  const prompt =
    `Compare these two Kenyan investments for a ${user?.isPremium ? "Pro" : "Free"} Sentil user:\n\n` +
    `Fund A: ${p1.name} | Type: ${p1.type} | Yield: ${p1.currentYield}% | Risk: ${p1.riskLevel} | Min: ${p1.minimumInvest ?? "N/A"} | AUM: ${p1.aum}\n` +
    `Fund B: ${p2.name} | Type: ${p2.type} | Yield: ${p2.currentYield}% | Risk: ${p2.riskLevel} | Min: ${p2.minimumInvest ?? "N/A"} | AUM: ${p2.aum}\n\n` +
    `Market context: ${marketCtx}\n\n` +
    `Give a concise WhatsApp comparison (max 120 words). Use bullets. End with a clear recommendation. ` +
    `No markdown headers. Use *bold* for key points. Never mention Gemini or Google.`;

  const { askGeminiBot } = await import("./whatsapp-gemini");
  const comparison = await askGeminiBot(prompt, {
    name: user?.name ?? "Investor",
    userId,
    isPremium: user?.isPremium ?? false,
  });

  const msg =
    `⚖️ *Fund Comparison*\n\n` +
    `*${p1.name}*\n` +
    `📈 ${p1.currentYield.toFixed(2)}% | ⚡ ${p1.riskLevel} | 💵 Min: ${p1.minimumInvest ?? "Check provider"}\n\n` +
    `vs\n\n` +
    `*${p2.name}*\n` +
    `📈 ${p2.currentYield.toFixed(2)}% | ⚡ ${p2.riskLevel} | 💵 Min: ${p2.minimumInvest ?? "Check provider"}\n\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `🧠 *Sentill Africa Verdict:*\n${comparison}`;

  await sendWhatsAppMessage(waId, msg);

  try {
    await sendInteractiveButtons(waId, `What would you like to do?`, [
      { id: `CAT_${p1.type.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`, title: "🏦 Browse More Funds" },
      { id: "LOG",       title: "📝 Log Investment" },
      { id: "SUBSCRIBE", title: "⚡ Go Pro" },
    ]);
  } catch { /* optional */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// TIPS — daily AI investment tip
// ─────────────────────────────────────────────────────────────────────────────

async function handleTip(waId: string, userId: string) {
  await sendWhatsAppMessage(waId, "🧠 *Sentill Africa* generating your tip...");

  const [user, topMMF, rates] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, isPremium: true },
    }),
    prisma.provider.findFirst({ where: { type: "MONEY_MARKET" }, orderBy: { currentYield: "desc" } }),
    prisma.marketRateCache.findMany({ take: 3, orderBy: { lastSyncedAt: "desc" } }),
  ]);

  const marketCtx = rates.map(r => `${r.symbol}: ${r.price.toFixed(2)}%`).join(", ")
    || `Top MMF: ${topMMF?.name ?? "CIC Money Market"} at ${topMMF?.currentYield.toFixed(2) ?? "13.40"}%`;

  const today = new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" });

  const { askGeminiBot } = await import("./whatsapp-gemini");
  const tip = await askGeminiBot(
    `Give one specific, actionable investment tip for a Kenyan investor today (${today}).\n` +
    `Market context: ${marketCtx}\n` +
    `Keep it under 80 words. Be specific with numbers. WhatsApp format. Never mention Gemini.`,
    { name: user?.name ?? "Investor", userId, isPremium: user?.isPremium ?? false }
  );

  await sendWhatsAppMessage(
    waId,
    `💡 *Sentill Africa Tip — ${today}*\n\n${tip}\n\n` +
    `• *INVEST* — act on this\n• *ASK* — go deeper\n• *COMPARE* — compare options`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GOAL via chat — set financial goal directly from WhatsApp
// ─────────────────────────────────────────────────────────────────────────────

async function handleSetGoal(waId: string, rawInput: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isPremium: true, name: true } });

  if (!user?.isPremium) {
    return sendInteractiveButtons(
      waId,
      `🎯 *Set a Goal*\n\nGoal setting is a *Pro feature*.\nUpgrade to plan your financial future with AI.`,
      [
        { id: "SUBSCRIBE", title: "⚡ Upgrade to Pro" },
        { id: "INVEST",    title: "🏦 Browse Funds" },
        { id: "MARKETS",   title: "📈 Live Rates" },
      ]
    );
  }

  // Parse: "GOAL Home Fund 2000000 2026-12-31"
  const parts = rawInput.replace(/^goal\s+/i, "").trim();
  // Last part = date (YYYY-MM-DD), second to last = amount, rest = name
  const tokens = parts.split(/\s+/);
  const dateStr = tokens[tokens.length - 1];
  const amountStr = tokens[tokens.length - 2];
  const goalName = tokens.slice(0, tokens.length - 2).join(" ");

  const amount = parseFloat(amountStr?.replace(/[^0-9.]/g, "") ?? "");
  const deadline = new Date(dateStr ?? "");

  const isValidDate = !isNaN(deadline.getTime()) && deadline > new Date();
  const isValidAmount = !isNaN(amount) && amount >= 1000;
  const isValidName = goalName.length >= 2;

  if (!isValidName || !isValidAmount || !isValidDate) {
    return sendWhatsAppMessage(
      waId,
      `❌ *Invalid format.*\n\n` +
      `Use: *GOAL <name> <amount> <YYYY-MM-DD>*\n\n` +
      `Example:\n_GOAL Home Fund 2000000 2027-06-30_\n_GOAL Education 500000 2026-09-01_\n\n` +
      `Requirements:\n• Name: at least 2 words\n• Amount: min KES 1,000\n• Date: future date (YYYY-MM-DD)`
    );
  }

  // Determine category from goal name
  const nameLower = goalName.toLowerCase();
  let category = "OTHER";
  if (nameLower.includes("home") || nameLower.includes("house") || nameLower.includes("land")) category = "HOME";
  else if (nameLower.includes("retire") || nameLower.includes("pension")) category = "RETIREMENT";
  else if (nameLower.includes("school") || nameLower.includes("education") || nameLower.includes("fees")) category = "EDUCATION";
  else if (nameLower.includes("emergency") || nameLower.includes("fund")) category = "SAVINGS";

  try {
    await prisma.userGoal.create({
      data: { userId, name: goalName, target: amount, deadline, category },
    });

    // AI savings plan
    const { askGeminiBot } = await import("./whatsapp-gemini");
    const monthsLeft = Math.max(1, Math.round((deadline.getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)));
    const monthlyNeeded = amount / monthsLeft;

    const plan = await askGeminiBot(
      `A Kenyan investor wants to save ${formatKES(amount)} for "${goalName}" by ${deadline.toLocaleDateString("en-KE")} (${monthsLeft} months). ` +
      `They need to save about ${formatKES(monthlyNeeded)} per month. ` +
      `Suggest the best Kenyan investment vehicle (MMF, T-Bill, SACCO) and why. Max 60 words. WhatsApp format.`,
      { name: user.name, userId, isPremium: true }
    );

    return sendWhatsAppMessage(
      waId,
      `✅ *Goal Set!*\n\n` +
      `🎯 *${goalName}*\n` +
      `💰 Target: *${formatKES(amount)}*\n` +
      `📅 Deadline: *${deadline.toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}*\n` +
      `⏱ ${monthsLeft} months | *${formatKES(monthlyNeeded)}/month needed*\n\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `🧠 *Sentill Africa Savings Plan:*\n${plan}\n\n` +
      `• *INVEST* — start investing now\n• *GOALS* — view all goals\n• *LOG* — track an investment`
    );
  } catch (err) {
    console.error("[Bot] Goal set error:", err);
    return sendWhatsAppMessage(waId, "❌ Could not save goal. Please try again.");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSET TRACKER PRO — Advanced Portfolio Management via WhatsApp
// ─────────────────────────────────────────────────────────────────────────────

async function handleAssetsDashboard(waId: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.isPremium) {
    return sendWhatsAppMessage(waId,
      `📊 *Asset Tracker Pro*\n\nFull asset management is a *Sentill Pro* feature.\n\n⚡ *KES 490/month* — less than KES 16/day.\nSend *SUBSCRIBE* to unlock unlimited assets + AI advisor.`
    );
  }

  const assets = await prisma.portfolioAsset.findMany({
    where: { userId },
    include: { provider: true },
    orderBy: { principal: "desc" },
  });

  if (!assets.length) {
    return sendWhatsAppMessage(waId,
      `📊 *Asset Tracker Pro*\n\nNo assets tracked yet.\n\n` +
      `• *LOG* — add your first investment\n• *INVEST* — browse options\n• *LEADERBOARD* — see top funds`
    );
  }

  const total = assets.reduce((s, a) => s + a.principal, 0);
  const projectedAnnual = assets.reduce((s, a) => s + (a.principal * a.projectedYield) / 100, 0);
  const avgYield = total > 0 ? (projectedAnnual / total) * 100 : 0;
  const best = assets.reduce((b, a) => a.projectedYield > b.projectedYield ? a : b, assets[0]);
  const daysSinceFirst = Math.floor((Date.now() - new Date(assets[assets.length - 1].loggedAt).getTime()) / 86400000);

  // Category breakdown
  const categories: Record<string, number> = {};
  assets.forEach(a => {
    categories[a.provider.type] = (categories[a.provider.type] || 0) + a.principal;
  });
  const catBreakdown = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .map(([type, amt]) => `  ${type}: ${((amt / total) * 100).toFixed(0)}% (${formatKES(amt)})`)
    .join("\n");

  let msg = `📊 *ASSET TRACKER PRO*\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `💰 *Total Portfolio:* ${formatKES(total)}\n`;
  msg += `📈 *Avg Yield:* ${avgYield.toFixed(1)}% p.a.\n`;
  msg += `🎯 *Projected Annual:* ${formatKES(projectedAnnual)}\n`;
  msg += `📅 *Tracking for:* ${daysSinceFirst} days\n`;
  msg += `🏆 *Best Performer:* ${best.provider.name} (${best.projectedYield.toFixed(1)}%)\n\n`;
  msg += `📦 *Holdings (${assets.length}):*\n`;
  assets.forEach((a, i) => {
    msg += `*${i + 1}.* ${a.provider.name}\n  ${formatKES(a.principal)} @ ${a.projectedYield.toFixed(1)}% → ${formatKES((a.principal * a.projectedYield) / 100)}/yr\n\n`;
  });
  msg += `📊 *Allocation:*\n${catBreakdown}\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `*LOG* — add  |  *REMOVE* — delete\n`;
  msg += `*REALLOCATE* — move  |  *PERFORMANCE* — AI report\n`;
  msg += `*EXPORT* — statement  |  *SNAPSHOT* — quick card`;

  await sendWhatsAppMessage(waId, msg);
  try {
    await sendInteractiveButtons(waId, `Asset Tracker Pro Actions:`, [
      { id: "LOG",   title: "📝 Log Investment" },
      { id: "INVEST", title: "🏦 Browse Funds" },
      { id: "MARKETS", title: "📈 Live Rates" },
    ]);
  } catch { /* optional */ }
}

// ── Remove Asset ─────────────────────────────────────────────────────────────

async function startRemoveAsset(waId: string, ctx: SessionContext, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.isPremium) return sendWhatsAppMessage(waId, `🔒 Pro feature. Send *SUBSCRIBE* to upgrade.`);

  const assets = await prisma.portfolioAsset.findMany({
    where: { userId },
    include: { provider: true },
    orderBy: { loggedAt: "desc" },
  });

  if (!assets.length) return sendWhatsAppMessage(waId, `📊 No assets to remove.\n\nSend *LOG* to add one.`);

  let msg = `🗑 *Remove Investment*\n\nWhich asset would you like to remove?\n\n`;
  assets.forEach((a, i) => {
    msg += `*${i + 1}.* ${a.provider.name} — ${formatKES(a.principal)}\n`;
  });
  msg += `\nReply with the *number* or *CANCEL* to quit.`;

  await updateSession(waId, "REMOVE_ASSET_SELECT", ctx, userId);
  return sendWhatsAppMessage(waId, msg);
}

async function handleRemoveAssetSelect(waId: string, input: string, ctx: SessionContext, userId?: string) {
  if (input === "CANCEL" || input === "MENU") {
    await updateSession(waId, "IDLE", {}, userId);
    return sendWhatsAppMessage(waId, "❌ Cancelled.");
  }

  const assets = await prisma.portfolioAsset.findMany({
    where: { userId: userId! },
    include: { provider: true },
    orderBy: { loggedAt: "desc" },
  });

  const num = parseInt(input, 10);
  if (isNaN(num) || num < 1 || num > assets.length) {
    return sendWhatsAppMessage(waId, `❌ Invalid. Reply 1-${assets.length} or *CANCEL*.`);
  }

  const selected = assets[num - 1];
  await updateSession(waId, "REMOVE_ASSET_CONFIRM", {
    ...ctx, removeAssetId: selected.id, removeAssetName: selected.provider.name,
  }, userId);

  return sendWhatsAppMessage(waId,
    `⚠️ *Confirm Removal*\n\n` +
    `🏦 ${selected.provider.name}\n💰 ${formatKES(selected.principal)}\n\n` +
    `This only removes tracking — it doesn't affect your actual investment.\n\n` +
    `Reply *YES* to remove or *NO* to cancel.`
  );
}

async function handleRemoveAssetConfirm(waId: string, input: string, ctx: SessionContext, userId?: string) {
  if (input !== "YES") {
    await updateSession(waId, "IDLE", {}, userId);
    return sendWhatsAppMessage(waId, "❌ Cancelled. Send *ASSETS* to view portfolio.");
  }
  try {
    await prisma.portfolioAsset.delete({ where: { id: ctx.removeAssetId } });
    await updateSession(waId, "IDLE", {}, userId);
    return sendWhatsAppMessage(waId,
      `✅ *${ctx.removeAssetName}* removed from tracking.\n\n` +
      `• *ASSETS* — view remaining\n• *LOG* — add new investment`
    );
  } catch {
    await updateSession(waId, "IDLE", {}, userId);
    return sendWhatsAppMessage(waId, "❌ Error removing asset. Try again.");
  }
}

// ── Reallocate Asset ─────────────────────────────────────────────────────────

async function startReallocate(waId: string, ctx: SessionContext, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.isPremium) return sendWhatsAppMessage(waId, `🔒 Pro feature. Send *SUBSCRIBE*.`);

  const assets = await prisma.portfolioAsset.findMany({
    where: { userId },
    include: { provider: true },
    orderBy: { principal: "desc" },
  });

  if (!assets.length) return sendWhatsAppMessage(waId, `📊 No assets to reallocate.\n\nSend *LOG* to add one.`);

  let msg = `🔄 *Reallocate Investment*\n\n*Step 1:* Which asset to move FROM?\n\n`;
  assets.forEach((a, i) => {
    msg += `*${i + 1}.* ${a.provider.name} — ${formatKES(a.principal)} (${a.projectedYield.toFixed(1)}%)\n`;
  });
  msg += `\nReply with the *number* or *CANCEL*.`;

  await updateSession(waId, "REALLOCATE_FROM", ctx, userId);
  return sendWhatsAppMessage(waId, msg);
}

async function handleReallocateFrom(waId: string, input: string, ctx: SessionContext, userId?: string) {
  if (input === "CANCEL") { await updateSession(waId, "IDLE", {}, userId); return sendWhatsAppMessage(waId, "❌ Cancelled."); }

  const assets = await prisma.portfolioAsset.findMany({
    where: { userId: userId! }, include: { provider: true }, orderBy: { principal: "desc" },
  });
  const num = parseInt(input, 10);
  if (isNaN(num) || num < 1 || num > assets.length) return sendWhatsAppMessage(waId, `❌ Invalid. Reply 1-${assets.length}.`);

  const from = assets[num - 1];
  const providers = await prisma.provider.findMany({
    orderBy: { currentYield: "desc" }, take: 6,
    select: { id: true, name: true, currentYield: true, type: true },
  });

  let msg = `🔄 *Step 2:* Move FROM *${from.provider.name}*\n\nWhere do you want to move TO?\n\n`;
  providers.filter(p => p.id !== from.providerId).slice(0, 6).forEach((p, i) => {
    msg += `*${i + 1}.* ${p.name} (${p.currentYield.toFixed(1)}% — ${p.type})\n`;
  });
  msg += `\nReply with *number* or *CANCEL*.`;

  await updateSession(waId, "REALLOCATE_TO", {
    ...ctx, reallocateFromId: from.id, reallocateFromName: from.provider.name,
  }, userId);
  return sendWhatsAppMessage(waId, msg);
}

async function handleReallocateTo(waId: string, input: string, ctx: SessionContext, userId?: string) {
  if (input === "CANCEL") { await updateSession(waId, "IDLE", {}, userId); return sendWhatsAppMessage(waId, "❌ Cancelled."); }

  const providers = await prisma.provider.findMany({ orderBy: { currentYield: "desc" }, take: 6 });
  const filtered = providers.filter(p => p.id !== ctx.reallocateFromId).slice(0, 6);
  const num = parseInt(input, 10);
  if (isNaN(num) || num < 1 || num > filtered.length) return sendWhatsAppMessage(waId, `❌ Invalid. Reply 1-${filtered.length}.`);

  const to = filtered[num - 1];
  await updateSession(waId, "REALLOCATE_AMOUNT", {
    ...ctx, reallocateToId: to.id, reallocateToName: to.name,
  }, userId);

  return sendWhatsAppMessage(waId,
    `🔄 *Step 3:* Move from *${ctx.reallocateFromName}* → *${to.name}*\n\n` +
    `How much do you want to move? (in KES)\n\nExample: *50000*\n_(Or *ALL* to move everything, or *CANCEL*)_`
  );
}

async function handleReallocateAmount(waId: string, rawInput: string, ctx: SessionContext, userId?: string) {
  if (rawInput.toUpperCase() === "CANCEL") { await updateSession(waId, "IDLE", {}, userId); return sendWhatsAppMessage(waId, "❌ Cancelled."); }

  const fromAsset = await prisma.portfolioAsset.findUnique({ where: { id: ctx.reallocateFromId } });
  if (!fromAsset) { await updateSession(waId, "IDLE", {}, userId); return sendWhatsAppMessage(waId, "❌ Asset not found. Try again."); }

  let amount: number;
  if (rawInput.toUpperCase() === "ALL") {
    amount = fromAsset.principal;
  } else {
    amount = parseFloat(rawInput.replace(/[^0-9.]/g, ""));
  }

  if (isNaN(amount) || amount < 100 || amount > fromAsset.principal) {
    return sendWhatsAppMessage(waId, `❌ Amount must be KES 100 – ${formatKES(fromAsset.principal)}.`);
  }

  const toProvider = await prisma.provider.findUnique({ where: { id: ctx.reallocateToId } });
  const yieldDiff = (toProvider?.currentYield ?? 13) - fromAsset.projectedYield;
  const annualImpact = (amount * yieldDiff) / 100;

  await updateSession(waId, "REALLOCATE_CONFIRM", { ...ctx, reallocateAmount: amount }, userId);

  return sendWhatsAppMessage(waId,
    `🔄 *Confirm Reallocation*\n\n` +
    `📤 FROM: *${ctx.reallocateFromName}*\n` +
    `📥 TO: *${ctx.reallocateToName}*\n` +
    `💰 Amount: *${formatKES(amount)}*\n\n` +
    `📈 Yield Change: *${yieldDiff > 0 ? "+" : ""}${yieldDiff.toFixed(1)}% p.a.*\n` +
    `${yieldDiff > 0 ? "🟢" : "🔴"} Annual Impact: *${yieldDiff > 0 ? "+" : ""}${formatKES(annualImpact)}*\n\n` +
    `_This updates tracking only — execute the actual transfer with your providers._\n\n` +
    `Reply *YES* to confirm or *NO* to cancel.`
  );
}

async function handleReallocateConfirm(waId: string, input: string, ctx: SessionContext, userId?: string) {
  if (input !== "YES") { await updateSession(waId, "IDLE", {}, userId); return sendWhatsAppMessage(waId, "❌ Cancelled."); }

  try {
    const fromAsset = await prisma.portfolioAsset.findUnique({ where: { id: ctx.reallocateFromId } });
    const toProvider = await prisma.provider.findUnique({ where: { id: ctx.reallocateToId } });
    if (!fromAsset || !toProvider) throw new Error("Not found");

    const amount = ctx.reallocateAmount!;
    const remaining = fromAsset.principal - amount;

    // Update source asset
    if (remaining < 100) {
      await prisma.portfolioAsset.delete({ where: { id: fromAsset.id } });
    } else {
      await prisma.portfolioAsset.update({ where: { id: fromAsset.id }, data: { principal: remaining } });
    }

    // Create/update target asset
    const existingTarget = await prisma.portfolioAsset.findFirst({
      where: { userId: userId!, providerId: ctx.reallocateToId! },
    });
    if (existingTarget) {
      await prisma.portfolioAsset.update({
        where: { id: existingTarget.id },
        data: { principal: existingTarget.principal + amount },
      });
    } else {
      await prisma.portfolioAsset.create({
        data: { userId: userId!, providerId: ctx.reallocateToId!, principal: amount, projectedYield: toProvider.currentYield },
      });
    }

    await updateSession(waId, "IDLE", {}, userId);
    return sendWhatsAppMessage(waId,
      `✅ *Reallocation Complete!*\n\n` +
      `📤 ${ctx.reallocateFromName}: -${formatKES(amount)}\n` +
      `📥 ${ctx.reallocateToName}: +${formatKES(amount)}\n\n` +
      `_Remember to execute the actual transfer with your providers._\n\n` +
      `• *ASSETS* — view updated portfolio\n• *SNAPSHOT* — quick summary`
    );
  } catch {
    await updateSession(waId, "IDLE", {}, userId);
    return sendWhatsAppMessage(waId, "❌ Reallocation failed. Try again.");
  }
}

// ── Performance Report ───────────────────────────────────────────────────────

async function handlePerformanceReport(waId: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.isPremium) return sendWhatsAppMessage(waId, `🔒 Pro feature. Send *SUBSCRIBE*.`);

  const assets = await prisma.portfolioAsset.findMany({
    where: { userId }, include: { provider: true },
  });

  if (!assets.length) return sendWhatsAppMessage(waId, `📊 No assets to analyze. Send *LOG* to start.`);

  await sendWhatsAppMessage(waId, "🧠 *Sentill Africa* is generating your performance report...");

  const total = assets.reduce((s, a) => s + a.principal, 0);
  const projected = assets.reduce((s, a) => s + (a.principal * a.projectedYield) / 100, 0);
  const avgYield = (projected / total) * 100;
  const holdingsSummary = assets.map(a => `${a.provider.name} (${a.provider.type}): ${formatKES(a.principal)} @ ${a.projectedYield}%`).join("\n");

  const { askGeminiBot } = await import("./whatsapp-gemini");
  const analysis = await askGeminiBot(
    `Analyze this Kenyan investor's portfolio and give a performance report:\n\n` +
    `Total: ${formatKES(total)}\nAvg Yield: ${avgYield.toFixed(1)}%\n\n${holdingsSummary}\n\n` +
    `Include: diversification grade (A-F), risk assessment, 3 specific optimization recommendations, ` +
    `and comparison to benchmark (91-Day T-Bill at 15.8%). Max 150 words. WhatsApp format.`,
    { name: user.name, userId, isPremium: true }
  );

  return sendWhatsAppMessage(waId,
    `📊 *PORTFOLIO PERFORMANCE REPORT*\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `💰 Total: *${formatKES(total)}*\n` +
    `📈 Avg Yield: *${avgYield.toFixed(1)}% p.a.*\n` +
    `🎯 Annual Returns: *${formatKES(projected)}*\n` +
    `📦 Holdings: *${assets.length} assets*\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🧠 *Sentill Africa Analysis:*\n${analysis}\n\n` +
    `• *REALLOCATE* — optimize holdings\n• *LEADERBOARD* — top funds\n• *ASSETS* — full view`
  );
}

// ── Export Statement ─────────────────────────────────────────────────────────

async function handleExportStatement(waId: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.isPremium) return sendWhatsAppMessage(waId, `🔒 Pro feature. Send *SUBSCRIBE*.`);

  const assets = await prisma.portfolioAsset.findMany({
    where: { userId }, include: { provider: true }, orderBy: { loggedAt: "desc" },
  });

  if (!assets.length) return sendWhatsAppMessage(waId, `📄 No assets to export.`);

  const total = assets.reduce((s, a) => s + a.principal, 0);
  const projected = assets.reduce((s, a) => s + (a.principal * a.projectedYield) / 100, 0);
  const today = new Date().toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });

  let stmt = `╔══════════════════════════════╗\n`;
  stmt += `║  SENTILL AFRICA STATEMENT    ║\n`;
  stmt += `╚══════════════════════════════╝\n\n`;
  stmt += `📅 Date: ${today}\n`;
  stmt += `👤 ${user.name} (${user.email})\n`;
  stmt += `📱 Status: ${user.isPremium ? "Pro" : "Free"}\n\n`;
  stmt += `┌──────────────────────────────┐\n`;
  stmt += `│  PORTFOLIO HOLDINGS          │\n`;
  stmt += `└──────────────────────────────┘\n\n`;

  assets.forEach((a, i) => {
    const logged = new Date(a.loggedAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
    stmt += `${i + 1}. ${a.provider.name}\n`;
    stmt += `   Type: ${a.provider.type}\n`;
    stmt += `   Principal: ${formatKES(a.principal)}\n`;
    stmt += `   Yield: ${a.projectedYield.toFixed(1)}% p.a.\n`;
    stmt += `   Est. Annual: ${formatKES((a.principal * a.projectedYield) / 100)}\n`;
    stmt += `   Logged: ${logged}\n\n`;
  });

  stmt += `┌──────────────────────────────┐\n`;
  stmt += `│  SUMMARY                    │\n`;
  stmt += `└──────────────────────────────┘\n\n`;
  stmt += `Total Tracked: ${formatKES(total)}\n`;
  stmt += `Projected Annual: ${formatKES(projected)}\n`;
  stmt += `Projected Monthly: ${formatKES(projected / 12)}\n\n`;
  stmt += `_Sentil is an intelligence hub._\n`;
  stmt += `_Your money stays with providers._\n`;
  stmt += `_www.sentill.africa_`;

  return sendWhatsAppMessage(waId, stmt);
}

// ── Portfolio Snapshot Card ──────────────────────────────────────────────────

async function handleSnapshot(waId: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.isPremium) return sendWhatsAppMessage(waId, `🔒 Send *SUBSCRIBE* to unlock Snapshot.`);

  const assets = await prisma.portfolioAsset.findMany({
    where: { userId }, include: { provider: true },
  });

  if (!assets.length) return sendWhatsAppMessage(waId, `📸 No portfolio to snapshot. Send *LOG* first.`);

  const total = assets.reduce((s, a) => s + a.principal, 0);
  const projected = assets.reduce((s, a) => s + (a.principal * a.projectedYield) / 100, 0);
  const avgYield = (projected / total) * 100;
  const projDaily = projected / 365;
  const top3 = assets.sort((a, b) => b.principal - a.principal).slice(0, 3);
  const categories = [...new Set(assets.map(a => a.provider.type))];
  const divScore = Math.min(100, categories.length * 20 + (assets.length > 3 ? 20 : 0));

  const card =
    `┌────────────────────────────┐\n` +
    `│  📸 PORTFOLIO SNAPSHOT     │\n` +
    `└────────────────────────────┘\n\n` +
    `💰 *${formatKES(total)}*\n` +
    `📈 ${avgYield.toFixed(1)}% p.a. · +${formatKES(projDaily)}/day\n\n` +
    `🏆 *Top Holdings:*\n` +
    top3.map((a, i) => `  ${["🥇", "🥈", "🥉"][i]} ${a.provider.name} — ${formatKES(a.principal)}`).join("\n") + `\n\n` +
    `📊 Diversification: ${"█".repeat(Math.round(divScore / 10))}${'░'.repeat(10 - Math.round(divScore / 10))} ${divScore}%\n` +
    `📂 ${categories.length} categories · ${assets.length} assets\n\n` +
    `_Updated: ${new Date().toLocaleTimeString("en-KE")}_`;

  return sendWhatsAppMessage(waId, card);
}

// ─────────────────────────────────────────────────────────────────────────────
// MODERN FEATURES — Leaderboard, Calculator, Market Movers
// ─────────────────────────────────────────────────────────────────────────────

async function handleLeaderboard(waId: string) {
  const providers = await prisma.provider.findMany({
    orderBy: { currentYield: "desc" },
    take: 10,
    select: { name: true, currentYield: true, type: true, riskLevel: true },
  });

  let msg = `🏆 *YIELD LEADERBOARD*\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `_Top performing funds across all categories_\n\n`;

  const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
  providers.forEach((p, i) => {
    msg += `${medals[i]} *${p.name}*\n`;
    msg += `   📈 ${p.currentYield.toFixed(2)}% · ${p.type} · ${p.riskLevel}\n\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `💡 Reply with a fund number for AI analysis.\n`;
  msg += `• *INVEST* — browse by category\n• *COMPARE* — compare two funds`;

  return sendWhatsAppMessage(waId, msg);
}

async function handleQuickCalc(waId: string, rawInput: string, userId?: string) {
  const parsed = parseCalcCommand(rawInput);

  if (!parsed) {
    return sendWhatsAppMessage(waId,
      `❌ *Usage:* CALC [amount] [yield%] [years]\n\n` +
      `*Examples:*\n` +
      `• CALC 100000 — KES 100K at top MMF rate for 5 yrs\n` +
      `• CALC 500000 18.46 10 — KES 500K at IFB for 10 yrs\n` +
      `• CALC 50000 16.8 3 Lofty — custom fund projection`
    );
  }

  const { principal, yieldPct, years, label } = parsed;
  const netYield = yieldPct * 0.85;
  const gross5yr = principal * Math.pow(1 + yieldPct / 100, years);
  const net5yr   = principal * Math.pow(1 + netYield / 100, years);
  const grossIncome1yr = principal * (yieldPct / 100);
  const netIncome1yr   = grossIncome1yr * 0.85;

  // Send text summary first
  let msg = `🧮 *INVESTMENT CALCULATOR*\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 Principal: *${formatKES(principal)}*\n`;
  msg += `📈 Yield: *${yieldPct}%* p.a.\n`;
  msg += `🗓️ Period: *${years} year${years > 1 ? "s" : ""}*\n\n`;
  msg += `📊 *Projected Returns:*\n`;
  msg += `  Yr 1 Gross income: *${formatKES(Math.round(grossIncome1yr))}*\n`;
  msg += `  Yr 1 Net (after WHT): *${formatKES(Math.round(netIncome1yr))}*\n\n`;
  msg += `  ${years}-yr Gross total: *${formatKES(Math.round(gross5yr))}*\n`;
  msg += `  ${years}-yr Net total: *${formatKES(Math.round(net5yr))}* ✅\n\n`;
  msg += `  Monthly income: *${formatKES(Math.round(netIncome1yr / 12))}*\n\n`;
  msg += `_Note: WHT 15% applies to MMFs/T-Bills. IFBs are tax-free (use 18.46)._\n\n`;
  msg += `📊 Sending your growth chart below...`;

  await sendWhatsAppMessage(waId, msg, userId);

  // After a short delay, send the chart image
  const chartUrl = compoundGrowthChartUrl(principal, yieldPct, years, label);
  await sendImageMessage(
    waId,
    chartUrl,
    `📈 ${formatKES(principal)} at ${yieldPct}% for ${years}yrs — Net: ${formatKES(Math.round(net5yr))}`,
    userId
  );

  // Then send CTA button to full calculator
  return sendCTAButton(
    waId,
    `🎯 Want to compare more funds or run a portfolio analysis?`,
    `Open Full Calculator 🔢`,
    `https://sentill.africa/markets/treasuries`,
    userId
  );
}

// ── Chart command handler ─────────────────────────────────────────────────────

async function handleChartCommand(waId: string, input: string, userId?: string) {
  const sub = input.replace(/^(chart|graph)\s*/i, "").trim().toUpperCase();

  // Route to correct chart
  if (!sub || sub === "MMFS" || sub === "MMF" || sub === "FUNDS") {
    await sendWhatsAppMessage(waId, "📊 Generating *MMF Yield Chart*... one moment!", userId);
    await sendImageMessage(
      waId,
      mmfYieldChartUrl(),
      "🏆 Top MMF Yields in Kenya — April 2026 | Source: CMA Kenya",
      userId
    );
    return sendInteractiveButtons(waId,
      "What would you like to explore next?",
      [
        { id: "MARKETS", title: "📈 Live Rates" },
        { id: "LIST",    title: "📋 Fund Picker" },
        { id: "INVEST",  title: "💰 Browse Funds" },
      ],
      userId
    );
  }

  if (sub === "TBILLS" || sub === "TBILL" || sub === "YIELD CURVE" || sub === "BONDS" || sub === "CURVE") {
    await sendWhatsAppMessage(waId, "📊 Generating *Kenya Yield Curve*...", userId);
    await sendImageMessage(
      waId,
      tbillYieldCurveUrl(),
      "📊 Kenya Yield Curve: T-Bills → IFBs | Gross vs Net After 15% WHT",
      userId
    );
    return sendCTAButton(
      waId,
      "🏛️ Buy T-Bills directly on DhowCSD — min KES 50,000",
      "Open T-Bill Hub →",
      "https://sentill.africa/markets/treasuries",
      userId
    );
  }

  if (sub === "SACCOS" || sub === "SACCO" || sub === "DIVIDENDS") {
    await sendWhatsAppMessage(waId, "📊 Generating *SACCO Dividend Chart*...", userId);
    await sendImageMessage(
      waId,
      saccoChartUrl(),
      "🤝 SACCO Dividend Yields in Kenya 2026 | Tower 20% leads",
      userId
    );
    return sendCTAButton(
      waId,
      "Want full SACCO profiles, loan products & calculators?",
      "Explore SACCO Hub →",
      "https://sentill.africa/markets/saccos",
      userId
    );
  }

  if (sub.startsWith("GROWTH") || sub.startsWith("COMPARE") || sub.startsWith("ALL")) {
    // Quick comparison chart
    await sendWhatsAppMessage(waId, "📊 Generating *Investment Comparison Chart*...", userId);
    const chartUrl = investmentComparisonUrl(
      ["MMF (Top)", "T-Bill 364d", "IFB Bond", "SACCO Top", "Pension"],
      [18.20,        16.45,        18.46,      20.0,        14.0],
      "📈 Kenya Investment Yields — Apr 2026"
    );
    await sendImageMessage(
      waId,
      chartUrl,
      "📈 All asset class yields compared — Apr 2026 | Sentill Africa",
      userId
    );
    return sendInteractiveButtons(waId,
      "Pick any to explore further:",
      [
        { id: "MARKETS", title: "📊 Full Rates" },
        { id: "INVEST",  title: "💰 Browse & Invest" },
        { id: "SUBSCRIBE", title: "⚡ Go Pro" },
      ],
      userId
    );
  }

  // Default: show chart menu
  return sendWhatsAppMessage(waId,
    `📊 *CHART COMMANDS*\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `• *CHART MMFS* — Top MMF yield bar chart\n` +
    `• *CHART TBILLS* — Kenya yield curve (T-Bills → IFBs)\n` +
    `• *CHART SACCOS* — SACCO dividend chart\n` +
    `• *CHART COMPARE* — All asset classes compared\n` +
    `• *CALC 100000* — Growth chart for your amount\n\n` +
    `_Charts are sent as real PNG images!_`
  );
}

// ── Rich text table handler ────────────────────────────────────────────────────

async function handleTableCommand(waId: string, userId?: string) {
  // ── Pull live data from DB ──
  const [dbMMFs, dbGovt, dbSACCOs] = await Promise.all([
    prisma.provider.findMany({
      where: { type: "MONEY_MARKET" },
      orderBy: { currentYield: "desc" },
      take: 7,
      select: { name: true, currentYield: true },
    }),
    prisma.marketRateCache.findMany({
      where: { symbol: { in: ["TBILL_91", "TBILL_182", "TBILL_364", "IFB1"] } },
      orderBy: { price: "desc" },
    }),
    prisma.provider.findMany({
      where: { type: "SACCO" },
      orderBy: { currentYield: "desc" },
      take: 5,
      select: { name: true, currentYield: true },
    }),
  ]);

  let msg = `📊 *RANKED INVESTMENT TABLE — KENYA*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  msg += `🏆 *MONEY MARKET FUNDS (MMF)*\n`;
  msg += `┌─────────────────────────────┐\n`;
  msg += `│ # │ Fund          │  Yield  │\n`;
  msg += `├─────────────────────────────┤\n`;

  const mmfRows = dbMMFs.length >= 3 ? dbMMFs : [
    { name: "Etica (Zidi)", currentYield: 18.20 },
    { name: "Lofty Corpin", currentYield: 17.50 },
    { name: "Cytonn MMF",   currentYield: 16.90 },
    { name: "NCBA MMF",     currentYield: 16.20 },
    { name: "KCB MMF",      currentYield: 15.80 },
    { name: "Sanlam MMF",   currentYield: 15.10 },
    { name: "Britam MMF",   currentYield: 14.20 },
  ];
  mmfRows.forEach((f, i) => {
    const shortName = f.name.length > 14 ? f.name.slice(0, 13) + "…" : f.name.padEnd(14);
    msg += `│ ${i+1} │ ${shortName}│ *${f.currentYield.toFixed(2)}%*│\n`;
  });
  msg += `└─────────────────────────────┘\n`;
  msg += `Min: KES 1,000 · WHT: 15% · T+1 liquidity\n\n`;

  msg += `🏛️ *GOVERNMENT SECURITIES*\n`;
  msg += `┌──────────────────────────────────┐\n`;
  msg += `│ Instrument │ Gross │  Net (WHT)  │\n`;
  msg += `├──────────────────────────────────┤\n`;

  const govtLabelMap: Record<string, string> = {
    TBILL_91: "91-Day", TBILL_182: "182-Day",
    TBILL_364: "364-Day", IFB1: "IFB Bond",
  };
  const govtRows = dbGovt.length >= 2 ? dbGovt : [
    { symbol: "TBILL_91", price: 15.85 },
    { symbol: "TBILL_182", price: 16.10 },
    { symbol: "TBILL_364", price: 16.45 },
    { symbol: "IFB1", price: 18.46 },
  ];
  govtRows.forEach(r => {
    const label = (govtLabelMap[r.symbol] ?? r.symbol).padEnd(11);
    const isIFB = r.symbol === "IFB1";
    const net = isIFB ? `*${r.price.toFixed(2)}%* ✅` : `*${(r.price * 0.85).toFixed(2)}%*   `;
    msg += `│ ${label}│${r.price.toFixed(2)}% │  ${net}│\n`;
  });
  msg += `└──────────────────────────────────┘\n`;
  msg += `IFB = WHT-free · Min KES 100K via DhowCSD\n\n`;

  if (dbSACCOs.length) {
    msg += `🤝 *TOP SACCOS (Dividend Yields)*\n`;
    msg += `┌───────────────────────────┐\n`;
    msg += `│ SACCO         │ Dividend  │\n`;
    msg += `├───────────────────────────┤\n`;
    dbSACCOs.forEach(s => {
      const name = s.name.length > 14 ? s.name.slice(0, 13) + "…" : s.name.padEnd(14);
      msg += `│ ${name}│  *${s.currentYield.toFixed(1)}%*  │\n`;
    });
    msg += `└───────────────────────────┘\n`;
    msg += `Min: Varies · Illiquid (notice required)\n\n`;
  }

  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💡 Commands:\n`;
  msg += `• *CHART MMFS* — bar chart image\n`;
  msg += `• *CALC 100000* — growth projection\n`;
  msg += `• *INVEST* — browse & track\n`;

  await sendWhatsAppMessage(waId, msg, userId);

  return sendCTAButton(
    waId,
    "See interactive charts, live data and calculators on Sentill",
    "Open Market Hub →",
    "https://sentill.africa/markets",
    userId
  );
}

// ── Interactive List Message — MMF Picker ─────────────────────────────────────

async function handleMMFListMenu(waId: string, userId?: string) {
  return sendListMessage(
    waId,
    "📊 Sentill Money Market Funds",
    "Pick a fund below to get full details — yield, minimum investment, how to invest, and a personal projection.\n\nAll rates as at April 2026 (gross, before 15% WHT):",
    "View Funds",
    [
      {
        title: "🏆 Highest Yield Funds",
        rows: [
          { id: "CAT_MONEY_MARKET", title: "Etica Capital MMF (Zidi)", description: "18.20% p.a. · Min KES 1,000 · Top performer" },
          { id: "CAT_MONEY_MARKET", title: "Lofty-Corpin MMF",       description: "17.50% p.a. · Min KES 1,000 · Instant" },
          { id: "CAT_MONEY_MARKET", title: "Cytonn Money Market",    description: "16.90% p.a. · Min KES 1,000" },
          { id: "CAT_MONEY_MARKET", title: "NCBA Money Market",      description: "16.20% p.a. · Min KES 1,000 · Instant" },
          { id: "CAT_MONEY_MARKET", title: "KCB Money Market",       description: "15.80% p.a. · Min KES 1,000" },
        ],
      },
      {
        title: "🏦 Bank-Backed & Popular Funds",
        rows: [
          { id: "CAT_MONEY_MARKET", title: "Britam Money Market",  description: "15.50% p.a. · Min KES 1,000" },
          { id: "CAT_MONEY_MARKET", title: "Sanlam Investments MMF", description: "15.10% p.a. · Min KES 5,000" },
          { id: "CAT_MONEY_MARKET", title: "ICEA Lion MMF",      description: "14.50% p.a. · Min KES 5,000" },
          { id: "CAT_MONEY_MARKET", title: "CIC Money Market",   description: "13.60% p.a. · Largest AUM" },
          { id: "CAT_MONEY_MARKET", title: "Old Mutual MMF",     description: "13.40% p.a. · Min KES 1,000" },
        ],
      },
    ],
    userId
  );
}

async function handleMarketMovers(waId: string) {
  const providers = await prisma.provider.findMany({
    orderBy: { currentYield: "desc" },
    take: 15,
    select: { name: true, currentYield: true, type: true, riskLevel: true, aum: true },
  });

  const rates = await prisma.marketRateCache.findMany({
    orderBy: { lastSyncedAt: "desc" }, take: 5,
  });

  let msg = `📈 *MARKET MOVERS*\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n\n`;

  msg += `🔥 *Highest Yields Right Now:*\n`;
  providers.slice(0, 5).forEach((p, i) => {
    msg += `  ${i + 1}. *${p.name}* — ${p.currentYield.toFixed(1)}% (${p.type})\n`;
  });

  msg += `\n📊 *Best by Category:*\n`;
  const seen = new Set<string>();
  providers.forEach(p => {
    if (!seen.has(p.type)) {
      seen.add(p.type);
      msg += `  ${p.type}: *${p.name}* — ${p.currentYield.toFixed(1)}%\n`;
    }
  });

  if (rates.length) {
    msg += `\n📡 *Live Market Data:*\n`;
    rates.forEach(r => {
      msg += `  • ${r.symbol}: *${r.price.toFixed(2)}%*\n`;
    });
  }

  msg += `\n━━━━━━━━━━━━━━━━━━\n`;
  msg += `• *LEADERBOARD* — full rankings\n• *INVEST* — explore funds\n• *CALC* — project returns`;

  return sendWhatsAppMessage(waId, msg);
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔔 NOTIFICATION FREQUENCY SYSTEM — High-Tech Alert Management
// ─────────────────────────────────────────────────────────────────────────────

const FREQ_LABELS: Record<string, string> = {
  DAILY:              "🌅 Daily (7AM Mon–Fri)",
  WEEKLY:             "📅 Weekly (Monday 7AM)",
  MARKET_ALERTS_ONLY: "📊 Market Alerts Only",
  NONE:               "🔕 Off",
};

function freqFromPayload(payload: string): string | null {
  const map: Record<string, string> = {
    FREQ_DAILY:   "DAILY",
    FREQ_WEEKLY:  "WEEKLY",
    FREQ_MOVERS:  "MARKET_ALERTS_ONLY",
    FREQ_OFF:     "NONE",
    "1": "DAILY",
    "2": "WEEKLY",
    "3": "MARKET_ALERTS_ONLY",
    "4": "NONE",
    DAILY:               "DAILY",
    WEEKLY:              "WEEKLY",
    MARKET_ALERTS_ONLY:  "MARKET_ALERTS_ONLY",
    NONE:                "NONE",
    OFF:                 "NONE",
  };
  return map[payload.toUpperCase()] ?? null;
}

// ── Called right after new user registration ─────────────────────────────────
async function handleFreqAfterRegister(waId: string, input: string, ctx: SessionContext, userId?: string) {
  const freq = freqFromPayload(input);

  if (!freq || !userId) {
    // If unrecognised, ask again with buttons
    try {
      return sendInteractiveButtons(waId, `🔔 Pick your alert frequency:`, [
        { id: "FREQ_DAILY",  title: "🌅 Daily (7AM Mon–Fri)" },
        { id: "FREQ_WEEKLY", title: "📅 Weekly (Mon mornings)" },
        { id: "FREQ_MOVERS", title: "📊 Market Alerts Only" },
      ]);
    } catch {
      return sendWhatsAppMessage(waId,
        `Reply: *1* Daily · *2* Weekly · *3* Alerts only · *4* Off`
      );
    }
  }

  await prisma.alertPreference.upsert({
    where: { userId },
    create: { userId, whatsappEnabled: freq !== "NONE", frequency: freq, whatsappNumber: waId },
    update: { frequency: freq, whatsappEnabled: freq !== "NONE" },
  });

  await updateSession(waId, "IDLE", {}, userId);

  const freqLabel = FREQ_LABELS[freq] ?? freq;
  return sendWhatsAppMessage(waId,
    `✅ *Notifications set to: ${freqLabel}*\n\n` +
    (freq === "NONE"
      ? `🔕 You won't receive periodic briefs. You can change this any time with *ALERTS*.\n\n`
      : `🔔 You'll receive smart market briefs ${freq === "DAILY" ? "every weekday at 7AM EAT" : freq === "WEEKLY" ? "every Monday at 7AM EAT" : "when significant market moves happen"}.\n\n`) +
    `📊 *What you can do right now:*\n` +
    `• *MARKETS* — live rates\n` +
    `• *INVEST* — browse options\n` +
    `• *ASSETS* — portfolio tracker\n` +
    `• *ALERTS* — change notifications anytime\n` +
    `• *ASK* — ask Sentill anything\n\n` +
    `⚡ Upgrade to Pro: *SUBSCRIBE*`
  );
}

// ── Full Alert Settings Dashboard ────────────────────────────────────────────
async function handleAlertSettings(waId: string, userId: string) {
  const pref: any = await (prisma as any).alertPreference.findUnique({ where: { userId } });
  const freq = pref?.frequency ?? "DAILY";
  const freqLabel = FREQ_LABELS[freq] ?? freq;
  const watchlist = pref?.watchlistAlerts ?? true;
  const movers = pref?.marketMoversAlerts ?? false;
  const threshold = pref?.yieldThreshold;
  const oracle = pref?.aiOracleAlerts ?? true;

  const msg =
    `🔔 *ALERT SETTINGS*\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `📡 *Current Configuration:*\n\n` +
    `⏰ *Brief Frequency:* ${freqLabel}\n` +
    `📊 *Watchlist Alerts:* ${watchlist ? "🟢 ON" : "🔴 OFF"}\n` +
    `📈 *Market Movers:* ${movers ? "🟢 ON" : "🔴 OFF"}\n` +
    `🧠 *AI Oracle Briefs:* ${oracle ? "🟢 ON" : "🔴 OFF"}\n` +
    `🎯 *Yield Threshold:* ${threshold ? `🟢 Alert at ${threshold}%+` : "🔴 Not set"}\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `*Commands to update:*\n\n` +
    `🌅 *FREQ DAILY* — daily 7AM briefs\n` +
    `📅 *FREQ WEEKLY* — Monday digest\n` +
    `📊 *FREQ MOVERS* — market alerts only\n` +
    `🔕 *FREQ OFF* — pause all alerts\n\n` +
    `👁 *WATCH* — add fund to watchlist\n` +
    `🗑 *UNWATCH* — remove from watchlist\n` +
    `🎯 *ALERT YIELD 17.5* — set threshold\n` +
    `📋 *WATCHLIST* — view your watchlist\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `_Alerts help you never miss a market move._`;

  try {
    await sendWhatsAppMessage(waId, msg);
    return sendInteractiveButtons(waId, `Quick frequency change:`, [
      { id: "FREQ_DAILY",  title: "🌅 Daily" },
      { id: "FREQ_WEEKLY", title: "📅 Weekly" },
      { id: "FREQ_MOVERS", title: "📊 Alerts Only" },
    ]);
  } catch {
    return sendWhatsAppMessage(waId, msg);
  }
}

// ── Handle frequency change from ALERTS menu ─────────────────────────────────
async function handleAlertFreqSelect(waId: string, input: string, ctx: SessionContext, userId?: string) {
  const freq = freqFromPayload(input);
  if (!freq || !userId) return sendWhatsAppMessage(waId, `❌ Unknown option. Send *ALERTS* to see options.`);

  await prisma.alertPreference.upsert({
    where: { userId },
    create: { userId, frequency: freq, whatsappEnabled: freq !== "NONE", whatsappNumber: waId },
    update: { frequency: freq, whatsappEnabled: freq !== "NONE" },
  });

  await updateSession(waId, "IDLE", {}, userId);
  const label = FREQ_LABELS[freq] ?? freq;
  return sendWhatsAppMessage(waId,
    `✅ *Alert frequency updated!*\n\n⏰ Now set to: *${label}*\n\n` +
    (freq === "NONE"
      ? `🔕 Periodic briefs paused. Send *FREQ DAILY* to re-enable.\n`
      : `🔔 You'll get briefs: ${freq === "DAILY" ? "Every weekday 7AM EAT" : freq === "WEEKLY" ? "Every Monday 7AM EAT" : "When major market moves happen"}.\n`) +
    `\nSend *ALERTS* to see or change all settings.`
  );
}

// ── Yield Threshold Alert ─────────────────────────────────────────────────────
async function handleYieldAlertSet(waId: string, rawInput: string, userId: string) {
  const numStr = rawInput.replace(/^(alert yield|yield alert)\s+/i, "").trim();
  const threshold = parseFloat(numStr);

  if (isNaN(threshold) || threshold < 5 || threshold > 30) {
    return sendWhatsAppMessage(waId, `❌ Invalid. Use: *ALERT YIELD 17.5* (between 5% and 30%).`);
  }

  await (prisma as any).alertPreference.upsert({
    where: { userId },
    create: { userId, yieldThreshold: threshold, whatsappEnabled: true, whatsappNumber: waId },
    update: { yieldThreshold: threshold },
  });

  return sendWhatsAppMessage(waId,
    `✅ *Yield Alert Set!*\n\n` +
    `🎯 You'll be notified when any fund's yield crosses *${threshold}%*.\n\n` +
    `Current top yield: check *LEADERBOARD* for live rankings.\n\n` +
    `To remove: *ALERT YIELD 0* · Settings: *ALERTS*`
  );
}

async function handleAlertThresholdInput(waId: string, rawInput: string, ctx: SessionContext, userId?: string) {
  if (!userId) return;
  await handleYieldAlertSet(waId, `ALERT YIELD ${rawInput}`, userId);
  await updateSession(waId, "IDLE", {}, userId);
}

// ── Watchlist Add ─────────────────────────────────────────────────────────────
async function startWatchlistAdd(waId: string, ctx: SessionContext, userId: string) {
  const providers = await prisma.provider.findMany({
    orderBy: { currentYield: "desc" },
    take: 8,
    select: { id: true, name: true, currentYield: true, type: true },
  });

  // Get already-watched providers
  const existing = await prisma.watchlist.findMany({ where: { userId }, select: { providerId: true } });
  const watchedIds = new Set(existing.map(w => w.providerId));

  const unwatched = providers.filter(p => !watchedIds.has(p.id));

  if (!unwatched.length) {
    return sendWhatsAppMessage(waId, `✅ You're already watching all top funds!\n\nSend *WATCHLIST* to view.`);
  }

  let msg = `👁 *Add to Watchlist*\n\nPick a fund to watch:\n\n`;
  unwatched.forEach((p, i) => {
    msg += `*${i + 1}.* ${p.name} — ${p.currentYield.toFixed(1)}% (${p.type})\n`;
  });
  msg += `\nReply with a *number* or *CANCEL*.`;

  await updateSession(waId, "ALERT_WATCHLIST_ADD", { ...ctx, _providers: unwatched.map(p => p.id) } as any, userId);
  return sendWhatsAppMessage(waId, msg);
}

async function handleWatchlistAdd(waId: string, input: string, ctx: SessionContext, userId?: string) {
  if (input === "CANCEL") { await updateSession(waId, "IDLE", {}, userId); return sendWhatsAppMessage(waId, "❌ Cancelled."); }

  const providers = await prisma.provider.findMany({
    orderBy: { currentYield: "desc" }, take: 8, select: { id: true, name: true, currentYield: true },
  });
  const num = parseInt(input, 10);
  if (isNaN(num) || num < 1 || num > providers.length) return sendWhatsAppMessage(waId, `❌ Invalid. Reply 1–${providers.length} or CANCEL.`);

  const picked = providers[num - 1];

  // Check if already in watchlist
  const existing = await prisma.watchlist.findFirst({ where: { userId: userId!, providerId: picked.id } });
  if (existing) {
    await updateSession(waId, "IDLE", {}, userId);
    return sendWhatsAppMessage(waId, `ℹ️ *${picked.name}* is already in your watchlist.`);
  }

  await prisma.watchlist.create({ data: { userId: userId!, providerId: picked.id } });
  await updateSession(waId, "IDLE", {}, userId);

  return sendWhatsAppMessage(waId,
    `✅ *${picked.name}* added to watchlist!\n\n` +
    `📈 Current yield: *${picked.currentYield.toFixed(2)}%*\n` +
    `🔔 You'll get alerts when its yield changes significantly.\n\n` +
    `• *WATCHLIST* — view all watched funds\n• *WATCH* — add another`
  );
}

// ── Watchlist Remove ──────────────────────────────────────────────────────────
async function startWatchlistRemove(waId: string, ctx: SessionContext, userId: string) {
  const items = await prisma.watchlist.findMany({
    where: { userId },
    include: { provider: { select: { name: true, currentYield: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (!items.length) return sendWhatsAppMessage(waId, `📋 Your watchlist is empty.\n\nSend *WATCH* to add funds.`);

  let msg = `🗑 *Remove from Watchlist*\n\nWhich fund to unwatch?\n\n`;
  items.forEach((item, i) => {
    msg += `*${i + 1}.* ${item.provider?.name ?? "Unknown"} — ${item.provider?.currentYield.toFixed(1) ?? "?"}%\n`;
  });
  msg += `\nReply with a *number* or *CANCEL*.`;

  await updateSession(waId, "ALERT_WATCHLIST_REMOVE", ctx, userId);
  return sendWhatsAppMessage(waId, msg);
}

async function handleWatchlistRemove(waId: string, input: string, ctx: SessionContext, userId?: string) {
  if (input === "CANCEL") { await updateSession(waId, "IDLE", {}, userId); return sendWhatsAppMessage(waId, "❌ Cancelled."); }

  const items = await prisma.watchlist.findMany({
    where: { userId: userId! },
    include: { provider: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const num = parseInt(input, 10);
  if (isNaN(num) || num < 1 || num > items.length) return sendWhatsAppMessage(waId, `❌ Invalid. Reply 1–${items.length} or CANCEL.`);

  const item = items[num - 1];
  await prisma.watchlist.delete({ where: { id: item.id } });
  await updateSession(waId, "IDLE", {}, userId);

  return sendWhatsAppMessage(waId,
    `✅ *${item.provider?.name ?? "Fund"}* removed from watchlist.\n\n` +
    `• *WATCHLIST* — view remaining\n• *WATCH* — add a fund`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CRON HELPER — exported so the daily cron can check frequency eligibility
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// 🎁 REFERRAL PROGRAM — Invite friends, earn free Pro days
// ─────────────────────────────────────────────────────────────────────────────

async function handleRefer(waId: string, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, isPremium: true },
  });

  // Count how many users this person referred (signed up with their number in referral context)
  // We track referrals via WhatsApp logs — check if any users mention this waId in registration context
  const referralLogs = await prisma.whatsAppLog.count({
    where: { userId, message: { contains: "REFER" }, direction: "INBOUND" },
  });

  // Generate unique referral link using their waId hash
  const refCode = Buffer.from(waId).toString("base64").slice(-6).toUpperCase();
  const referralLink = `https://wa.me/254703469525?text=SENTIL_REF_${refCode}`;
  const webLink = `https://sentill.africa?ref=${refCode}`;

  const firstName = user?.name?.split(" ")[0] ?? "Investor";

  const msg =
    `🎁 *SENTIL REFERRAL PROGRAM*\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `Hi *${firstName}*! Invite friends & earn free Pro time:\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🏆 *YOUR REWARDS:*\n\n` +
    `🥉 *1 referral* → 3 days Pro FREE\n` +
    `🥈 *3 referrals* → 2 weeks Pro FREE\n` +
    `🥇 *5 referrals* → 1 month Pro FREE\n` +
    `💎 *10 referrals* → 3 months Pro FREE\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📲 *YOUR INVITE LINK (WhatsApp):*\n${referralLink}\n\n` +
    `🌐 *YOUR INVITE CODE:* \`${refCode}\`\n` +
    `🔗 *Web link:* ${webLink}\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📩 *HOW TO INVITE:*\n\n` +
    `1️⃣ Copy your link above\n` +
    `2️⃣ Share it on WhatsApp, X, or any group\n` +
    `3️⃣ When your friend registers — they get *7 days free Pro*!\n` +
    `4️⃣ You automatically earn your reward 🎉\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📊 *YOUR STATS:*\n` +
    `👥 Total invites sent: *${referralLogs}*\n` +
    `💰 Status: *${user?.isPremium ? "✅ Pro Member" : "Free Account"}*\n\n` +
    `_Every person you refer gets 7 days of Sentill Pro absolutely FREE!_\n\n` +
    `• *MENU* — back to main menu\n` +
    `• *STATUS* — check your subscription`;

  return sendWhatsAppMessage(waId, msg);
}

export function shouldSendToday(frequency: string, lastWeeklySent?: Date | null): boolean {
  const now = new Date();
  const dayOfWeek = now.toLocaleDateString("en-US", { weekday: "long", timeZone: "Africa/Nairobi" }).toUpperCase();
  const isWeekday = !["SATURDAY", "SUNDAY"].includes(dayOfWeek);
  const isMonday = dayOfWeek === "MONDAY";

  switch (frequency) {
    case "DAILY":
      return isWeekday;
    case "WEEKLY": {
      if (!isMonday) return false;
      // Prevent double-send on same Monday
      if (!lastWeeklySent) return true;
      const lastSendDate = new Date(lastWeeklySent).toDateString();
      const todayDate = now.toDateString();
      return lastSendDate !== todayDate;
    }
    case "MARKET_ALERTS_ONLY":
      return false; // Handled separately by threshold checker
    case "NONE":
      return false;
    default:
      return isWeekday;
  }
}

export async function checkYieldThresholdAlerts(): Promise<void> {
  // Get all users with a yieldThreshold set and whatsapp enabled
  const prefs: any[] = await (prisma as any).alertPreference.findMany({
    where: { yieldThreshold: { not: null }, whatsappEnabled: true },
    include: { user: { select: { name: true, whatsappId: true } } },
  });

  if (!prefs.length) return;

  // Get current top yields
  const topFunds = await prisma.provider.findMany({
    orderBy: { currentYield: "desc" },
    take: 5,
    select: { name: true, currentYield: true, type: true },
  });

  const { sendWhatsAppMessage: sendMsg } = await import("./whatsapp");

  for (const pref of prefs) {
    if (!pref.user?.whatsappId || !pref.yieldThreshold) continue;
    const triggeredFunds = topFunds.filter(f => f.currentYield >= pref.yieldThreshold!);
    if (!triggeredFunds.length) continue;

    try {
      let alert = `🎯 *YIELD ALERT TRIGGERED!*\n━━━━━━━━━━━━━━━━━━\n\n`;
      alert += `Hi *${pref.user.name.split(" ")[0]}*, funds crossing your *${pref.yieldThreshold}%* threshold:\n\n`;
      triggeredFunds.forEach(f => {
        alert += `🔥 *${f.name}* — ${f.currentYield.toFixed(2)}% (${f.type})\n`;
      });
      alert += `\n• *INVEST* — explore these funds\n• *CALC <amount>* — project returns\n• *ALERTS* — change your threshold`;
      await sendMsg(pref.user.whatsappId, alert);
    } catch (err) {
      console.warn(`[Threshold Alert] Failed for ${pref.user.name}:`, err);
    }
  }
}
