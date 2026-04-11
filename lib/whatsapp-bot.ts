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
  generateOTP,
  formatKES,
  normalizePhone,
} from "./whatsapp";
import { askGeminiBot, generateInvestmentSummary } from "./whatsapp-gemini";
import {
  mmfYieldChartUrl,
  tbillYieldCurveUrl,
  saccoChartUrl,
  compoundGrowthChartUrl,
  investmentComparisonUrl,
  parseCalcCommand,
} from "./chart-generator";
import { sendEmail, buildLoginCredentialsEmail } from "./email";
import bcrypt from "bcryptjs";
import crypto from "crypto";


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
};

// Hardcoded NSE data (fallback when Yahoo Finance unavailable)
const NSE_FALLBACK: Record<string, { price: number; change: number; pe: number; div: number; signal: string; why: string }> = {
  SCOM: { price: 30.60, change: -0.8,  pe: 14,  div: 4.5,  signal: "HOLD",  why: "Stable dividend payer. Ziidi & M-PESA driving long-term moats." },
  EQTY: { price: 77.00, change: +1.2,  pe: 6.8, div: 5.2,  signal: "BUY",   why: "Pan-African expansion, cheap valuation, strong EPS growth." },
  KCB:  { price: 45.50, change: +0.5,  pe: 5.2, div: 6.8,  signal: "BUY",   why: "Highest dividend yield on NSE, trading below book value." },
  COOP: { price: 18.50, change: -0.3,  pe: 6.1, div: 5.5,  signal: "BUY",   why: "Consistent profits, SACCO banking network advantage." },
  NCBA: { price: 91.25, change: +0.9,  pe: 8.2, div: 4.8,  signal: "HOLD",  why: "Post-merger benefits showing, watch for NIM expansion." },
  ABSA: { price: 16.50, change: +0.2,  pe: 7.4, div: 5.1,  signal: "HOLD",  why: "Global backing, improving ROE — good for long-term hold." },
  EABL: { price: 120.0, change: -1.5,  pe: 18,  div: 3.2,  signal: "WATCH", why: "Premium brand but expensive. Tax pressures on alcohol." },
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
  msg += `💡 *Type any ticker for deep AI analysis:*\n`;
  msg += `_SCOM · EQTY · KCB · COOP · NCBA · EABL_\n\n`;
  msg += `📱 *Trade on Ziidi Trader:*\n`;
  msg += `M-Pesa → Financial Services → Ziidi → Trade Shares\n\n`;
  msg += `_Send *ZIIDI* for the Ziidi Trader beginner's guide_`;

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
    aiText = await askGeminiBot(aiContext, { name: "Investor", userId: userId ?? "guest", isPremium: false });
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
  msg += `📱 *To buy ${symbol}:*\n`;
  msg += `M-Pesa → Ziidi → Trade Shares → Search *${symbol}* → Enter amount\n\n`;
  msg += `_⚠️ This is not financial advice. Invest responsibly._`;

  return sendWhatsAppMessage(waId, msg);
}

async function handleZiidiTraderGuide(waId: string) {
  const msg =
    `📱 *ZIIDI TRADER — BEGINNER'S GUIDE*\n` +
    `_Buy NSE stocks directly from M-Pesa_\n\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `*How to access:*\n` +
    `M-Pesa → Financial Services → Ziidi → Trade Shares\n\n` +
    `✅ No broker account needed\n` +
    `✅ Minimum investment: *KES 100*\n` +
    `✅ Uses your M-Pesa balance directly\n` +
    `✅ Dividends paid to M-Pesa\n` +
    `✅ Commission: ~1.8% per trade\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🏆 *Beginner's Starter Portfolio:*\n` +
    `_(for someone starting with KES 5,000–10,000)_\n\n` +
    `1️⃣ *KCB Group (KCB)* — 40% of budget\n` +
    `   _Cheapest big bank, highest dividend on NSE (~6.8%)_\n\n` +
    `2️⃣ *Equity Group (EQTY)* — 40% of budget\n` +
    `   _Kenya's most profitable bank, pan-Africa growth_\n\n` +
    `3️⃣ *Safaricom (SCOM)* — 20% of budget\n` +
    `   _Monopoly on M-Pesa, you already use their product_\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `⚠️ *Key rules for beginners:*\n` +
    `• Don't invest money you need in the next 12 months\n` +
    `• NSE stocks are for 3–5 year+ horizons\n` +
    `• Dividends are taxed 5% (WHT) automatically\n` +
    `• Settlement takes T+3 (3 business days)\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `💡 *Get AI analysis on any NSE stock:*\n` +
    `Just type the ticker: _SCOM · EQTY · KCB · COOP · EABL_\n\n` +
    `_Sentill advises. Ziidi Trader executes. 🚀_`;

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
  WEEKLY_7_DAYS:    { label: "1 Week Pro",     amount: 99,   days: 7,   description: "Full Pro access for 7 days!" },
  MONTHLY_30_DAYS:  { label: "1 Month Pro",    amount: 349,  days: 30,  description: "Full Pro for 1 month — save 12%!" },
  QUARTERLY_90_DAYS:{ label: "3 Months Pro",   amount: 999,  days: 90,  description: "Full Pro for 3 months — save 24%!" },
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

  // ── Button payloads: route directly regardless of state ─────────────────
  // This ensures interactive button taps always work even if state is IDLE
  if (buttonPayload) {
    // Plan selections
    if (buttonPayload === "WEEKLY_7_DAYS")     return handleSelectPlan(waId, "WEEKLY_7_DAYS",     ctx, session.userId ?? undefined);
    if (buttonPayload === "MONTHLY_30_DAYS")   return handleSelectPlan(waId, "MONTHLY_30_DAYS",   ctx, session.userId ?? undefined);
    if (buttonPayload === "QUARTERLY_90_DAYS") return handleSelectPlan(waId, "QUARTERLY_90_DAYS", ctx, session.userId ?? undefined);
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
  }

  // ── IDLE — route by keyword ───────────────────────────────────────────────
  if (["HI", "HELLO", "START", "MENU", "HOME"].includes(input)) {
    return sendMainMenu(waId, session.userId ?? undefined);
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
    if (input === "SPECIAL") return handleSpecialFunds(waId);
    if (["ZIIDI", "ZIIDI TRADER", "ZIIDI GUIDE", "ZIIDITRADER"].includes(input)) return handleZiidiTraderGuide(waId);
    if (["STOCKS", "NSE", "SHARES", "NSE LIVE", "EQUITY", "EQUITIES"].includes(input)) return handleNSEStocks(waId, undefined);
    if (NSE_SYMBOLS[input]) return handleNSEStockLookup(waId, input, undefined);
    if (input.startsWith("CHART") || input.startsWith("GRAPH")) return handleChartCommand(waId, input, undefined);
    if (input === "TABLE" || input === "RANKED") return handleTableCommand(waId, undefined);
    if (input === "LIST" || input === "FUNDS" || input === "MMF LIST") return handleMMFListMenu(waId, undefined);
    if (input.startsWith("CALC ") || input.startsWith("CALCULATE ")) return handleQuickCalc(waId, rawInput, undefined);

    // If user typed a real question (>5 chars), route to AI even without login
    if (rawInput.length > 5) return handleGeminiQuestionGuest(waId, rawInput);

    // Default: show the clean numbered menu
    return sendMainMenu(waId, undefined);
  }

  // ── Authenticated commands ────────────────────────────────────────────────
  const userId = session.userId!;

  if (input === "PORTFOLIO" || input === "P") return handlePortfolio(waId, userId);
  if (input === "MARKETS"   || input === "M" || input === "RATES" || input === "R") return handleMarkets(waId);
  if (input === "GOALS"     || input === "G") return handleGoals(waId, userId);
  if (input === "WATCHLIST" || input === "W") return handleWatchlist(waId, userId);
  if (["ZIIDI", "ZIIDI TRADER", "ZIIDI GUIDE", "ZIIDITRADER"].includes(input)) return handleZiidiTraderGuide(waId);
  if (["STOCKS", "NSE", "SHARES", "NSE LIVE", "EQUITY", "EQUITIES"].includes(input)) return handleNSEStocks(waId, userId);
  if (["SPECIAL", "SPECIAL FUNDS", "UNIT TRUST", "PENSION", "OFFSHORE", "DOLLAR FUND", "TRADE"].includes(input)) return handleSpecialFunds(waId);
  // NSE ticker lookup — e.g. "SCOM", "EQTY", "KCB"
  if (NSE_SYMBOLS[input]) return handleNSEStockLookup(waId, input, userId);
  if (input === "STATUS"    || input === "S") return handleSubscriptionStatus(waId, userId);
  if (input === "HELP"      || input === "H") return sendHelp(waId);
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
  if (input === "WEEKLY_7_DAYS" || input === "WEEKLY" || input === "99") {
    return handleSelectPlan(waId, "WEEKLY_7_DAYS", ctx, userId);
  }
  if (input === "MONTHLY_30_DAYS" || input === "MONTHLY" || input === "349") {
    return handleSelectPlan(waId, "MONTHLY_30_DAYS", ctx, userId);
  }
  if (input === "QUARTERLY_90_DAYS" || input === "QUARTERLY" || input === "999") {
    return handleSelectPlan(waId, "QUARTERLY_90_DAYS", ctx, userId);
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

  // ASK command — explicit Gemini question
  if (input.startsWith("ASK ") || rawInput.toLowerCase().startsWith("ask ")) {
    const question = rawInput.replace(/^ask\s+/i, "").trim();
    if (question.length < 3) {
      return sendWhatsAppMessage(waId, "Please type your question after ASK. Example:\n*ASK what is the best MMF for KES 50,000?*");
    }
    return handleGeminiQuestion(waId, question, userId);
  }

  // ── 24/7 AI Fallback — ALL unrecognized messages go to Gemini ─────────────
  // Instead of showing "I didn't get that", we route everything to AI.
  // This ensures the bot is always helpful, any time of day or night.
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
    `• *ASK* — ask AI anything\n\n` +
    `Example: _What's the best MMF for KES 50,000?_`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sentill Africa handler
// ─────────────────────────────────────────────────────────────────────────────

async function handleGeminiQuestion(waId: string, question: string, userId: string) {
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
    } else {
      await sendWhatsAppMessage(waId, "🧠 *Sentill Africa* is thinking...");
    }

    const answer = await askGeminiBot(question, {
      name: user?.name ?? "Investor",
      userId,
      isPremium: user?.isPremium ?? false,
    });

    return sendWhatsAppMessage(waId, `🧠 *Sentill Africa Says:*\n\n${answer}`);
  } catch (err) {
    console.error("[Bot] Gemini AI error:", err);
    return sendWhatsAppMessage(
      waId,
      `⚠️ *AI temporarily unavailable*.\n\nPlease try again in a moment, or use:\n• *MENU* — main menu\n• *MARKETS* — live rates\n• *INVEST* — browse investments`
    );
  }
}

// Guest AI handler — for users who haven't registered/logged in
async function handleGeminiQuestionGuest(waId: string, question: string) {
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

    const answer = await askGeminiBot(question, {
      name: "Investor",
      userId: "guest",
      isPremium: false,
    });

    // Smart contextual nudge based on how many questions they've already asked
    const usedSoFar = aiQueriesCount + 1; // +1 for this answer
    let nudge = "";
    if (usedSoFar === 1) {
      // First answer — very soft, don't interrupt the value
      nudge = `\n\n_Ask another question or type *MENU* for options_`;
    } else if (usedSoFar === 3) {
      // 3rd question — introduce the benefit of registering
      nudge = `\n\n━━━━━━━━━━━━━━━━\n📲 *Get daily alerts for these rates* — send *REGISTER* (free, 30 sec)`;
    } else if (usedSoFar >= 5) {
      // 5th+ question — stronger nudge, they're engaged
      nudge = `\n\n━━━━━━━━━━━━━━━━\n💡 *Save this to your portfolio & get daily alerts*\nSend *REGISTER* — free account, takes 30 seconds`;
    }

    return sendWhatsAppMessage(
      waId,
      `🧠 *Sentill Africa Says:*\n\n${answer}${nudge}`
    );
  } catch (err) {
    console.error("[Bot] Guest Gemini error:", err);
    return sendWhatsAppMessage(
      waId,
      `⚠️ *AI temporarily unavailable*. Send *MENU* for options.`
    );
  }
}

// ── Premium conversion message — shown when free user hits 10-prompt limit ────
async function sendPremiumConversionMessage(waId: string, name: string, queriesUsed: number) {
  await sendWhatsAppMessage(
    waId,
    `🔒 *Daily AI Limit Reached, ${name}!*\n\n` +
    `You've used all *${FREE_AI_LIMIT} free AI questions* for today.\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `⚡ *UPGRADE TO SENTILL PRO*\n` +
    `Unlock *unlimited AI-powered* wealth intelligence:\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `✅ *UNLIMITED Sentill Africa* — Ask anything, anytime\n` +
    `✅ *Portfolio Tracker* — Log & monitor all investments\n` +
    `✅ *Real-time Price & Yield Alerts*\n` +
    `✅ *KRA Tax-Loss Harvesting AI*\n` +
    `✅ *Sentill Alpha Engine* — Deep market analysis\n` +
    `✅ *NSE Candlestick Charts + RSI/MACD*\n` +
    `✅ *Chama/Club Dashboard*\n` +
    `✅ *Financial Goal Planning*\n` +
    `✅ *Priority 24/7 Support*\n` +
    `✅ *Downloadable PDF Analytics*\n` +
    `✅ *Estate Vault & Beneficiary Automations*\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `💰 *PRICING — Cheapest in Kenya:*\n\n` +
    `📱 *1 Week*  — KES 99  _(≈ KES 14/day)_\n` +
    `📅 *1 Month* — KES 349 _(≈ KES 12/day — Save 12%)_\n` +
    `🏆 *3 Months* — KES 999 _(≈ KES 11/day — Save 24%)_\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🎯 *Less than a cup of coffee per day* for institutional-grade wealth intelligence.\n\n` +
    `Your AI questions reset daily at midnight — but Pro users get *unlimited* access forever.\n\n` +
    `👉 *Reply SUBSCRIBE to upgrade now!*`
  );

  // Send interactive buttons for quick action
  try {
    await sendInteractiveButtons(
      waId,
      `⚡ *Choose your Pro plan:*`,
      [
        { id: "WEEKLY_7_DAYS",     title: "📱 1 Week — KES 99" },
        { id: "MONTHLY_30_DAYS",   title: "📅 1 Month — KES 349" },
        { id: "QUARTERLY_90_DAYS", title: "🏆 3 Months — KES 999" },
      ]
    );
  } catch { /* buttons optional */ }
}

// ─────────────────────────────────────────────────────────────────────────────
// Investment Browser
// ─────────────────────────────────────────────────────────────────────────────

async function sendInvestmentCategories(waId: string, userId: string) {
  // Fetch top fund from each category
  const [topMMF, topBond, topTBill, topSacco, topPension] = await Promise.all([
    prisma.provider.findFirst({ where: { type: "MONEY_MARKET" }, orderBy: { currentYield: "desc" } }),
    prisma.provider.findFirst({ where: { type: "Bond" },         orderBy: { currentYield: "desc" } }),
    prisma.provider.findFirst({ where: { type: "T-Bill" },       orderBy: { currentYield: "desc" } }),
    prisma.provider.findFirst({ where: { type: "SACCO" },        orderBy: { currentYield: "desc" } }),
    prisma.provider.findFirst({ where: { type: "Pension" },      orderBy: { currentYield: "desc" } }),
  ]);

  const line = (label: string, p: { name: string; currentYield: number } | null) =>
    p ? `${label} *${p.name}* — ${p.currentYield.toFixed(1)}% p.a.\n` : "";

  const msg =
    `📊 *TODAY'S BEST RATES*\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    line("💰 MMF     |", topMMF) +
    line("📈 T-Bill  |", topTBill) +
    line("🏛 Bond    |", topBond) +
    line("🤝 SACCO   |", topSacco) +
    line("🧓 Pension |", topPension) +
    `\n━━━━━━━━━━━━━━━━━━\n` +
    `🧠 *Ask me anything:*\n\n` +
    `• _What's the best MMF right now?_\n` +
    `• _Compare T-Bills vs Bonds_\n` +
    `• _How do I invest KES 50,000?_\n` +
    `• _CALC 100000_ — see projections\n\n` +
    `Or specify a type:\n` +
    `*MMF · T-BILL · BOND · SACCO · PENSION*`;

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
      `⚡ Send *SUBSCRIBE* to upgrade — starting at *KES 99 for 7 days*.`
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
  if (!ctx.otp || !ctx.name || !ctx.email) {
    await updateSession(waId, "IDLE", {});
    return sendWhatsAppMessage(waId, "❌ Session expired. Send *REGISTER* to start again.");
  }

  const valid = await bcrypt.compare(inputOtp, ctx.otp);
  if (!valid) {
    return sendWhatsAppMessage(waId, "❌ Invalid OTP. Try again:");
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

  await updateSession(waId, "FREQ_AFTER_REGISTER", {}, user.id);

  // Send login credentials email (non-blocking)
  sendEmail({
    to: ctx.email,
    subject: "🔐 Your Sentill Africa Website Login Credentials",
    html: buildLoginCredentialsEmail(ctx.name, ctx.email, plainPassword),
  }).catch(err => console.warn("[Bot] Credentials email failed:", err));

  // Ask frequency preference right after registration
  try {
    await sendWhatsAppMessage(
      waId,
      `✅ *Welcome to Sentil Africa, ${ctx.name}!* 🎉\n\n` +
      `Your account is ready!\n\n` +
      `📧 *Login credentials sent to ${ctx.email}*\n🌐 Visit *www.sentill.africa* to access the dashboard.\n\n` +
      `🔔 *How often would you like to receive market alerts & AI briefs?*`
    );
    return sendInteractiveButtons(waId, `Choose your notification frequency:`, [
      { id: "FREQ_DAILY",   title: "🌅 Daily (7AM Mon–Fri)" },
      { id: "FREQ_WEEKLY",  title: "📅 Weekly (Mon mornings)" },
      { id: "FREQ_MOVERS", title: "📊 Market Alerts Only" },
    ]);
  } catch {
    // Fallback if buttons fail
    return sendWhatsAppMessage(waId,
      `🔔 *Set alert frequency:*\n\n1️⃣ *DAILY* — 7AM Mon–Fri\n2️⃣ *WEEKLY* — Monday morning\n3️⃣ *MOVERS* — Market alerts only\n4️⃣ *OFF* — No alerts\n\nReply with number or keyword.`
    );
  }
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
    return sendWhatsAppMessage(waId, "❌ Wrong code. Please try again:");
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
    `• *ASK* — ask AI anything\n` +
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
      `⚡ Send *SUBSCRIBE* to upgrade — starting at *KES 99 for 7 days*.`
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

  // Authoritative April 2026 rates — always shown, never stale
  const MMF_TABLE = [
    { name: "Etica MMF (Zidi)",       yield: 17.50, min: "KES 100",   note: "Download Zidi App — T+1/T+2 withdrawal" },

    { name: "Lofty Corpin MMF",       yield: 17.50, min: "KES 1,000", note: "" },
    { name: "Safaricom Ziidi",        yield: 16.80, min: "KES 100",   note: "via M-Pesa Ziidi menu" },
    { name: "Cytonn MMF",             yield: 16.90, min: "KES 1,000", note: "" },
    { name: "NCBA MMF",               yield: 16.20, min: "KES 1,000", note: "bank-backed" },
    { name: "KCB Money Market Fund",  yield: 15.80, min: "KES 1,000", note: "bank-backed" },
    { name: "Britam MMF",             yield: 15.50, min: "KES 1,000", note: "" },
    { name: "Sanlam MMF",             yield: 15.10, min: "KES 1,000", note: "" },
    { name: "Genghis Capital MMF",    yield: 14.20, min: "KES 1,000", note: "" },
    { name: "CIC Money Market Fund",  yield: 13.60, min: "KES 1,000", note: "largest AUM" },
    { name: "Old Mutual MMF",         yield: 13.40, min: "KES 1,000", note: "" },
  ];

  const GOVT_TABLE = [
    { name: "IFB1/2024 Bond",  yield: 18.46, net: 18.46, note: "WHT exempt 🏆" },
    { name: "364-Day T-Bill",  yield: 16.42, net: 13.96, note: "net after 15% WHT" },
    { name: "182-Day T-Bill",  yield: 15.97, net: 13.57, note: "net after 15% WHT" },
    { name: "91-Day T-Bill",   yield: 15.78, net: 13.41, note: "net after 15% WHT" },
  ];

  const MEDALS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"];

  let msg = `📊 *SENTILL LIVE YIELD TABLE*\n_${now}_\n\n`;

  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *MONEY MARKET FUNDS*\n`;
  msg += `_T+1 liquidity • CMA regulated • Monthly interest_\n\n`;
  MMF_TABLE.forEach((f, i) => {
    const medal = MEDALS[i] ?? `${i+1}.`;
    const note = f.note ? ` _(${f.note})_` : "";
    msg += `${medal} *${f.name}* — *${f.yield.toFixed(2)}%*${note}\n   Min: ${f.min}\n`;
  });

  msg += `\n━━━━━━━━━━━━━━━━━━\n`;
  msg += `🏛️ *GOVERNMENT SECURITIES*\n`;
  msg += `_Zero credit risk • CBK-issued • WHT applies_\n\n`;
  GOVT_TABLE.forEach((g) => {
    const isIFB = g.name.includes("IFB");
    msg += `• *${g.name}* — *${g.yield.toFixed(2)}%* _(${g.note})_\n`;
    if (!isIFB) msg += `   Effective net: *${g.net.toFixed(2)}%* after WHT\n`;
  });

  msg += `\n━━━━━━━━━━━━━━━━━━\n`;
  msg += `💡 *ALPHA INSIGHT*\n`;
  msg += `IFB Bond beats T-Bills on net yield AND is WHT-exempt.\n`;
  msg += `Best liquid option: *Etica (Zidi)* at *~17.5%* (withdraw in 1–2 business days)\n`;

  msg += `Easiest entry: *Safaricom Ziidi* — invest from M-Pesa with KES 100!\n\n`;
  msg += `📱 *QUICK COMMANDS*\n`;
  msg += `• *INVEST* — browse by category\n`;
  msg += `• *COMPARE CIC vs Cytonn* — AI comparison\n`;
  msg += `• *CALC 100000* — project KES 100K returns\n`;
  msg += `• *SPECIAL* — Unit Trusts, Pension, Offshore, Stocks\n\n`;
  msg += `_ℹ️ Rates updated April 2026 • Invest via each provider directly_`;

  await sendWhatsAppMessage(waId, msg);

  try {
    await sendInteractiveButtons(
      waId,
      `What would you like to explore?`,
      [
        { id: "INVEST",    title: "💰 Browse Funds" },
        { id: "SUBSCRIBE", title: "⚡ Go Pro" },
        { id: "MARKETS",   title: "🔄 Refresh Rates" },
      ]
    );
  } catch { /* buttons optional */ }
}

async function handleSpecialFunds(waId: string) {
  const msg =
    `✨ *SPECIAL INVESTMENT CATEGORIES*\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📱 *SAFARICOM ZIIDI*\n` +
    `_Kenya's simplest way to invest via M-Pesa_\n\n` +
    `• *Ziidi Invest* — access top MMFs from KES 100\n` +
    `• *Ziidi Trader* — buy NSE stocks from KES 100\n` +
    `• Access: M-Pesa → Financial Services → Ziidi\n` +
    `• Dividends & returns go back to M-Pesa ✅\n\n` +
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
    `📊 *NSE STOCK BROKERS*\n` +
    `_Buy Safaricom, Equity, KCB shares on the NSE_\n\n` +
    `• *Safaricom Ziidi Trader* — from KES 100, via M-Pesa\n` +
    `• *Genghis Capital* — online broker, from KES 1,000\n` +
    `• *NCBA Securities* — bank-linked, full NSE access\n` +
    `• *AIB-AXYS Africa* — retail-friendly mobile app\n\n` +
    `Ask any question:\n` +
    `_e.g. *ASK how does Ziidi Trader work?*_\n\n` +
    `_ℹ️ Sentill is an intelligence hub — invest via your provider._`;

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
    `⚡ *Upgrade to Pro:*\n` +
    `• 1 Week — *KES 99*\n` +
    `• 1 Month — *KES 349*\n` +
    `• 3 Months — *KES 999*\n\n` +
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

  await sendInteractiveButtons(
    waId,
    `⚡ *${action} Sentill Pro*\n\n` +
    `Unlock full intelligence:\n` +
    `📊 Portfolio tracking\n🧠 Unlimited Sentill AI Oracle\n🎯 Goal planning\n📉 KRA Tax AI\n\n` +
    `💰 *Pricing:*\n` +
    `📱 *1 Week* — KES 99 _(KES 14/day)_\n` +
    `📅 *1 Month* — KES 349 _(KES 12/day — Save 12%)_\n` +
    `🏆 *3 Months* — KES 999 _(KES 11/day — Save 24%)_\n\n` +
    `Choose a plan:`,
    [
      { id: "WEEKLY_7_DAYS",     title: "📱 1 Week — KES 99" },
      { id: "MONTHLY_30_DAYS",   title: "📅 1 Month — KES 349" },
      { id: "QUARTERLY_90_DAYS", title: "🏆 3 Months — KES 999" },
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
      await updateSession(waId, "IDLE", {}, userId);

      return sendWhatsAppMessage(
        waId,
        `✅ *Your Secure Payment Link*\n\n` +
        `Plan: *${planInfo.label}* — ${formatKES(planInfo.amount)}\n\n` +
        `🔗 ${paystackData.authorization_url}\n\n` +
        `👆 Tap the link to pay via *M-Pesa or Card* on Paystack.\n\n` +
        `_Your Pro access activates automatically after payment._\n\n` +
        `⚠️ Link expires in 30 minutes. Send *SUBSCRIBE* for a new one.`
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
// Main menu
// ─────────────────────────────────────────────────────────────────────────────
// Main Menu — clean numbered system for easy navigation
// ─────────────────────────────────────────────────────────────────────────────

async function sendMainMenu(waId: string, userId?: string) {
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const name = user?.name?.split(" ")[0] ?? "Investor";
    const isPro = user?.isPremium ?? false;

    const expiresIn = user?.premiumExpiresAt
      ? Math.ceil((new Date(user.premiumExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;
    const expiryWarning =
      isPro && expiresIn !== null && expiresIn <= 7
        ? `\n⚠️ Pro expires in *${expiresIn} day${expiresIn !== 1 ? "s" : ""}* — send *RENEW*`
        : "";

    // Clean, numbered menu — easy to navigate
    return sendWhatsAppMessage(
      waId,
      `👋 *Hi ${name}!* — Sentill Africa${expiryWarning}\n` +
      `${isPro ? "⚡ Pro Member" : "🔓 Free Plan"}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `*What would you like to do?*\n\n` +
      `💰 *1. Invest* — Compare MMFs, Bonds, T-Bills, SACCOs\n` +
      `📊 *2. Live Rates* — See what's paying the most right now\n` +
      `🧠 *3. Ask AI* — Get instant investment advice\n` +
      (isPro
        ? `📁 *4. My Portfolio* — View & track your investments\n` +
          `🎯 *5. My Goals* — Financial goals & progress\n`
        : `📁 *4. Portfolio* — Track investments _(Pro only)_\n` +
          `🎯 *5. Financial Goals* — Set targets _(Pro only)_\n`) +
      `\n━━━━━━━━━━━━━━━━━━\n` +
      `*Reply with a number (1–5)*\n\n` +
      `_More: ALERTS · STATUS · REFER · HELP_`,
      userId
    );
  }

  // Guest (not logged in) — lead with value, registration is optional step
  return sendWhatsAppMessage(
    waId,
    `👋 *Welcome to Sentill Africa!*\n` +
    `_Kenya's #1 Investment Intelligence Hub_\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `💬 *Just type any question to get started:*\n\n` +
    `_"What's the best MMF right now?"_\n` +
    `_"How much will KES 50K grow in 1 year?"_\n` +
    `_"Compare T-Bills vs Bonds"_\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `*Or choose:*\n\n` +
    `*1* — 📊 Live Market Rates\n` +
    `*2* — 💰 Browse Investments\n` +
    `*3* — 🧠 Ask AI Anything\n` +
    `*4* — 👤 Create Free Account _(unlock portfolio & alerts)_\n\n` +
    `_Reply with a number or just type your question_`
  );
}

async function sendHelp(waId: string) {
  return sendWhatsAppMessage(
    waId,
    `📋 *SENTILL AFRICA — HELP*\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `*1️⃣ BROWSE INVESTMENTS*\n` +
    `• *INVEST* — browse all options (MMF, T-Bills, Bonds, SACCOs)\n` +
    `• *MARKETS* — live rates right now\n` +
    `• *MOVERS* — top performing funds today\n` +
    `• *LEADERBOARD* — best yields ranked\n\n` +
    `*2️⃣ GET AI ADVICE*\n` +
    `• Just *type any question* — e.g. _best MMF for KES 50K?_\n` +
    `• *COMPARE CIC vs Sanlam* — side-by-side analysis\n` +
    `• *TIPS* — get today's investment tip\n` +
    `• *CALC 50000* — quick return projections\n\n` +
    `*3️⃣ MY PORTFOLIO (Pro)*\n` +
    `• *ASSETS* — view tracked investments\n` +
    `• *LOG* — add a new investment\n` +
    `• *SNAPSHOT* — quick portfolio card\n` +
    `• *PERFORMANCE* — AI portfolio review\n\n` +
    `*4️⃣ GOALS & WATCHLIST (Pro)*\n` +
    `• *GOALS* — your financial goals\n` +
    `• *WATCHLIST* — saved funds\n` +
    `• *WATCH* — add fund to watchlist\n\n` +
    `*5️⃣ ACCOUNT & ALERTS*\n` +
    `• *STATUS* — subscription info\n` +
    `• *ALERTS* — set notification frequency\n` +
    `• *REFER* — invite friends, earn free Pro\n` +
    `• *SUBSCRIBE* / *RENEW* — upgrade\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `_Reply *MENU* anytime to return here._`
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
      `📊 *Asset Tracker Pro*\n\nFull asset management is a *Pro feature*.\n\n⚡ Send *SUBSCRIBE* to upgrade — starting at *KES 99*.`
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
  let msg = `📊 *RANKED INVESTMENT TABLE — KENYA APR 2026*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  msg += `🏆 *MONEY MARKET FUNDS (MMF)*\n`;
  msg += `┌─────────────────────────────┐\n`;
  msg += `│ # │ Fund          │  Yield  │\n`;
  msg += `├─────────────────────────────┤\n`;
  msg += `│ 1 │ Etica (Zidi)  │ *~17.5%*│\n`;

  msg += `│ 2 │ Lofty Corpin  │ *16.80%*│\n`;
  msg += `│ 3 │ Kuza MMF      │ *16.50%*│\n`;
  msg += `│ 4 │ GenCap Hela   │ *16.20%*│\n`;
  msg += `│ 5 │ CIC MMF       │ *15.90%*│\n`;
  msg += `│ 6 │ Sanlam Pesa   │ *14.78%*│\n`;
  msg += `│ 7 │ Britam MMF    │ *14.20%*│\n`;
  msg += `└─────────────────────────────┘\n`;
  msg += `Min: KES 1,000 · WHT: 15% · T+1 liquidity\n\n`;

  msg += `🏛️ *GOVERNMENT SECURITIES*\n`;
  msg += `┌──────────────────────────────────┐\n`;
  msg += `│ Instrument │ Gross │  Net (WHT)  │\n`;
  msg += `├──────────────────────────────────┤\n`;
  msg += `│ 91-Day     │15.85% │  *13.47%*   │\n`;
  msg += `│ 182-Day    │16.10% │  *13.69%*   │\n`;
  msg += `│ 364-Day    │16.45% │  *13.98%*   │\n`;
  msg += `│ IFB Bond   │18.46% │  *18.46%* ✅│\n`;
  msg += `└──────────────────────────────────┘\n`;
  msg += `IFB = WHT-free · Min KES 100K via DhowCSD\n\n`;

  msg += `🤝 *TOP SACCOS (Dividend Yields)*\n`;
  msg += `┌───────────────────────────┐\n`;
  msg += `│ SACCO         │ Dividend  │\n`;
  msg += `├───────────────────────────┤\n`;
  msg += `│ Tower SACCO   │  *20.0%*  │\n`;
  msg += `│ Police SACCO  │  *17.0%*  │\n`;
  msg += `│ Stima SACCO   │  *15.0%*  │\n`;
  msg += `│ Wanandege     │  *15.0%*  │\n`;
  msg += `│ Safaricom SACCO│  *13.0%*  │\n`;
  msg += `└───────────────────────────┘\n`;
  msg += `Min: Varies · Illiquid (notice required)\n\n`;

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
    "Pick a fund below to get full details — yield, minimum investment, how to invest, and a personal projection.\n\nAll rates as at April 2026:",
    "View Funds",
    [
      {
        title: "🏆 Highest Yield Funds",
        rows: [
          { id: "CAT_MONEY_MARKET", title: "Etica MMF (Zidi)", description: "~17.5% p.a. · Min KES 100 · Download Zidi App" },

          { id: "CAT_MONEY_MARKET", title: "Lofty Corpin MMF",  description: "16.80% p.a. · Min KES 1,000" },
          { id: "CAT_MONEY_MARKET", title: "Kuza MMF",          description: "16.50% p.a. · Min KES 1,000" },
          { id: "CAT_MONEY_MARKET", title: "GenCap Hela MMF",   description: "16.20% p.a. · Min KES 1,000" },
          { id: "CAT_MONEY_MARKET", title: "CIC Money Market",  description: "15.90% p.a. · Kenya's Largest" },
        ],
      },
      {
        title: "🏦 Bank-Backed Funds",
        rows: [
          { id: "CAT_MONEY_MARKET", title: "NCBA Loop MMF",     description: "12.10% p.a. · Instant Liquidity" },
          { id: "CAT_MONEY_MARKET", title: "KCB Wealth MMF",    description: "11.40% p.a. · Tier 1 Bank" },
          { id: "CAT_MONEY_MARKET", title: "Co-op Trust MMF",   description: "13.20% p.a. · Co-op Stability" },
          { id: "CAT_MONEY_MARKET", title: "Absa Asset Capital", description: "12.50% p.a. · Global Standards" },
          { id: "CAT_MONEY_MARKET", title: "Sanlam Pesa MMF",   description: "14.78% p.a. · Institutional" },
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
    `• *ASK* — ask AI anything\n\n` +
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
