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
  generateOTP,
  formatKES,
  normalizePhone,
} from "./whatsapp";
import { askGeminiBot, generateInvestmentSummary } from "./whatsapp-gemini";
import bcrypt from "bcryptjs";

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

  // Logged-in: numbers 1–6 navigate investment categories
  if (session.userId && /^[1-6]$/.test(input)) {
    await updateSession(waId, "BROWSE_PROVIDERS", ctx, session.userId);
    return handleBrowseCategoryInput(waId, input, session.userId, ctx);
  }

  // Logged-out: 1=Register, 2=Login shortcuts
  if (input === "1" && !session.userId) {
    await updateSession(waId, "REGISTER_NAME", {});
    return sendWhatsAppMessage(waId,
      `🎉 Welcome to *Sentil Africa!*\n\nLet's create your *free account*.\n\nFirst, what is your *full name*?`
    );
  }
  if (input === "2" && !session.userId) return handleLoginRequest(waId);

  if (!session.userId) {
    // If user typed a real question (>5 chars), route to AI even without login
    if (rawInput.length > 5) {
      return handleGeminiQuestionGuest(waId, rawInput);
    }
    return sendInteractiveButtons(
      waId,
      `👋 *Welcome to Sentil Africa!*\n\n` +
      `🌍 Kenya's premier wealth intelligence hub.\n\n` +
      `📊 Compare MMFs, T-Bills, Bonds, SACCOs\n` +
      `🧠 AI-powered investment insights — *available 24/7*\n` +
      `📱 Manage everything via WhatsApp\n\n` +
      `Get started:`,
      [
        { id: "REGISTER", title: "🆕 Create Account" },
        { id: "LOGIN",    title: "🔐 Login" },
      ]
    );
  }

  // ── Authenticated commands ────────────────────────────────────────────────
  const userId = session.userId!;

  if (input === "PORTFOLIO" || input === "P") return handlePortfolio(waId, userId);
  if (input === "MARKETS"   || input === "M") return handleMarkets(waId);
  if (input === "GOALS"     || input === "G") return handleGoals(waId, userId);
  if (input === "WATCHLIST" || input === "W") return handleWatchlist(waId, userId);
  if (input === "STATUS"    || input === "S") return handleSubscriptionStatus(waId, userId);
  if (input === "HELP"      || input === "H") return sendHelp(waId);
  if (input === "LOGOUT")                     return handleLogout(waId);

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

    return sendWhatsAppMessage(
      waId,
      `🧠 *Sentill Africa Says:*\n\n${answer}\n\n━━━━━━━━━━━━━━━━\n💡 *Register* for personalized insights!\nSend *REGISTER* to create your free account.`
    );
  } catch (err) {
    console.error("[Bot] Guest Gemini error:", err);
    return sendWhatsAppMessage(
      waId,
      `⚠️ *AI temporarily unavailable*. Send *MENU* for options.`
    );
  }
}

// ── Premium conversion message — shown when free user hits 3-prompt limit ────
async function sendPremiumConversionMessage(waId: string, name: string, queriesUsed: number) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentill.africa";

  await sendWhatsAppMessage(
    waId,
    `🔒 *Daily AI Limit Reached, ${name}!*\n\n` +
    `You've used all *${FREE_AI_LIMIT} free AI questions* for today.\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `⚡ *UPGRADE TO SENTILL PRO*\n` +
    `Unlock *unlimited AI-powered* wealth intelligence:\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `✅ *UNLIMITED Sentill Africa AI* — Ask anything, anytime\n` +
    `✅ *Portfolio Tracker* — Log & monitor all investments\n` +
    `✅ *Real-time Price & Yield Alerts*\n` +
    `✅ *KRA Tax-Loss Harvesting AI*\n` +
    `✅ *Sentill Alpha AI Engine* — Deep market analysis\n` +
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
    `🌐 Subscribe: ${appUrl}/packages`
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
  const types = await prisma.provider.groupBy({
    by: ["type"],
    _count: { id: true },
    orderBy: { type: "asc" },
  });

  // Build numbered text list as primary flow (always works, no char limits)
  const header =
    `🏦 *Sentil Investment Hub*\n\n` +
    `Kenya's top investment options — all in one place.\n\n` +
    `📊 *Browse by Category:*\n`;

  let categoryList = "";
  const typesList = types.length > 0 ? types : [
    { type: "MONEY_MARKET" }, { type: "T-Bill" }, { type: "SACCO" },
  ];

  typesList.forEach((t, i) => {
    categoryList += `*${i + 1}.* ${INVEST_LABELS[t.type] ?? t.type}\n`;
  });

  const footer =
    `\nReply with a *number* (1-${typesList.length}) to explore.\n` +
    `Or ask: _ASK best investment for KES 100K?_`;

  // Try interactive buttons (max 3, titles ≤20 chars)
  const buttonTypes = typesList.slice(0, 3);
  let buttonsSent = false;
  try {
    await sendInteractiveButtons(
      waId,
      header + categoryList + `\nOr tap a category:`,
      buttonTypes.map((t) => ({
        id: `CAT_${t.type.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`,
        title: INVEST_CATEGORIES[t.type] ?? t.type.slice(0, 20),
      }))
    );
    buttonsSent = true;
  } catch (e) {
    console.error("[Bot] Interactive buttons failed, using text fallback:", e);
  }

  // Always send the text list as well — ensures user can always navigate
  if (!buttonsSent) {
    await sendWhatsAppMessage(waId, header + categoryList + footer);
  } else if (typesList.length > 3) {
    // Show extra categories as text below buttons
    const extras = typesList.slice(3).map((t, i) => `*${i + 4}.* ${INVEST_LABELS[t.type] ?? t.type}`).join("\n");
    await sendWhatsAppMessage(waId, `📌 *More options:*\n${extras}\n\n${footer}`);
  }
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

  const normalizedPhone = normalizePhone(waId);
  const user = await prisma.user.create({
    data: {
      name: ctx.name,
      email: ctx.email,
      whatsappId: normalizedPhone,
      whatsappVerified: true,
      role: "USER",
    },
  });

  // Auto-enable daily notifications
  await prisma.alertPreference.upsert({
    where: { userId: user.id },
    create: { userId: user.id, whatsappEnabled: true, whatsappNumber: normalizedPhone, frequency: "DAILY" },
    update: { whatsappEnabled: true, whatsappNumber: normalizedPhone, frequency: "DAILY" },
  });

  await updateSession(waId, "IDLE", {}, user.id);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentill.africa";
  return sendWhatsAppMessage(
    waId,
    `✅ *Welcome to Sentil Africa, ${ctx.name}!* 🎉\n\n` +
    `Your account is ready!\n\n` +
    `📊 *What you can do via WhatsApp:*\n` +
    `• *MARKETS* — live MMF/T-Bill rates\n` +
    `• *INVEST* — browse all investment options\n` +
    `• *ASK* — ask AI any investment question\n` +
    `• *STATUS* — your subscription details\n\n` +
    `🔔 You're enrolled for *daily AI briefs* at 7AM EAT!\n\n` +
    `⚡ Upgrade to Pro: *SUBSCRIBE*\n` +
    `🌐 Dashboard: ${appUrl}/dashboard`
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

  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: null, otpExpiry: null, whatsappVerified: true },
  });

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
    `${subStatus}${expiry}\n\n` +
    `🔔 *Daily AI briefs are ON* — market intel at 7AM EAT.\n\n` +
    `💡 *Quick commands:*\n` +
    `• *INVEST* — browse investment options\n` +
    `• *MARKETS* — live rates\n` +
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
  const [rates, topMMF, topBond] = await Promise.all([
    prisma.marketRateCache.findMany({ orderBy: { lastSyncedAt: "desc" }, take: 8 }),
    prisma.provider.findFirst({ where: { type: "MONEY_MARKET" }, orderBy: { currentYield: "desc" }, select: { name: true, currentYield: true } }),
    prisma.provider.findFirst({ where: { type: { in: ["T-Bill", "Bond"] } }, orderBy: { currentYield: "desc" }, select: { name: true, currentYield: true, type: true } }),
  ]);

  const now = new Date().toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

  let msg = `📊 *Sentil Market Snapshot*\n_${now}_\n\n`;

  msg += `🏦 *Money Market Funds (MMFs):*\n`;
  if (topMMF) msg += `⭐ Best: *${topMMF.name}* — ${topMMF.currentYield.toFixed(2)}% p.a.\n`;

  if (rates.length) {
    const mmfRates = rates.filter(r => r.symbol.includes("MMF") || r.symbol.includes("CIC") || r.symbol.includes("Sanlam"));
    const otherRates = rates.filter(r => !mmfRates.includes(r));
    mmfRates.slice(0, 3).forEach(r => { msg += `• ${r.symbol}: *${r.price.toFixed(2)}%*\n`; });
    if (otherRates.length) {
      msg += `\n📈 *Treasury & Bonds:*\n`;
      otherRates.slice(0, 3).forEach(r => { msg += `• ${r.symbol}: *${r.price.toFixed(2)}%*\n`; });
    }
  } else {
    msg += `• 91-Day T-Bill: *15.78%*\n• CIC MMF: *13.40%*\n• Sanlam MMF: *13.10%*\n`;
    if (topBond) msg += `\n📈 *${topBond.type}:*\n• ${topBond.name}: *${topBond.currentYield.toFixed(2)}%*\n`;
  }

  msg += `\n🔔 *Daily AI brief hits your WhatsApp at 7AM EAT*\n`;
  msg += `\n_ℹ️ Rates are informational — invest via your chosen provider._\n\n`;
  msg += `• *INVEST* — browse all options\n• *COMPARE* — compare two funds\n• *ASK* — get AI advice`;

  await sendWhatsAppMessage(waId, msg);

  // Add quick action buttons
  try {
    await sendInteractiveButtons(
      waId,
      `What next?`,
      [
        { id: "INVEST",  title: "🏦 Browse Funds" },
        { id: "CAT_T-BILL", title: "📈 T-Bills" },
        { id: "SUBSCRIBE", title: "⚡ Go Pro" },
      ]
    );
  } catch { /* optional */ }
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

    return sendWhatsAppMessage(
      waId,
      `👋 *Hello, ${name}!*\n\n` +
      `📱 *Sentill Africa — Wealth Intelligence Hub*\n` +
      (isPro ? `⚡ Pro Member` : `🔓 Free Plan (${FREE_AI_LIMIT} AI questions/day)`) +
      expiryWarning +
      `\n\n🧠 *Just type any question and Sentill Africa will answer instantly!*\n\n` +
      `Try asking:\n` +
      `• _"What is the best MMF in Kenya?"_\n` +
      `• _"Compare Cytonn vs Sanlam MMF"_\n` +
      `• _"How do T-Bills work?"_\n` +
      `• _"Best investment for KES 50,000?"_\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📌 *Quick Commands:*\n` +
      `*INVEST* — browse all investment options\n` +
      `*MARKETS* — live NSE/MMF/T-Bill rates\n` +
      (isPro ? `*PORTFOLIO* — your tracked assets\n*GOALS* — financial goals\n*LOG* — add investment\n` : ``) +
      `*SUBSCRIBE* — upgrade to Pro\n` +
      `*STATUS* — subscription details\n` +
      `*HELP* — full command list\n\n` +
      `💡 _Or just type any question — Sentill Africa is always here!_`,
      userId
    );
  }

  // Guest (not logged in) — also AI-first
  return sendWhatsAppMessage(
    waId,
    `👋 *Welcome to Sentill Africa!*\n\n` +
    `🌍 Kenya's premier wealth intelligence hub.\n\n` +
    `🧠 *Just type any investment question and get instant answers!*\n\n` +
    `Try asking:\n` +
    `• _"What are the best MMFs in Kenya?"_\n` +
    `• _"How do I invest KES 10,000?"_\n` +
    `• _"T-Bill rates today?"_\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📌 *Commands:*\n` +
    `*REGISTER* — create free account\n` +
    `*LOGIN* — access your account\n` +
    `*INVEST* — browse investments\n` +
    `*MARKETS* — live market rates\n\n` +
    `💡 _${FREE_AI_LIMIT} free AI questions per day — upgrade for unlimited!_`
  );
}

async function sendHelp(waId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentill.africa";
  return sendWhatsAppMessage(
    waId,
    `🆘 *Sentil WhatsApp Commands*\n\n` +
    `*── Investments ──*\n` +
    `*INVEST* — browse MMFs, T-Bills, Bonds, SACCOs\n` +
    `*MARKETS* — live market rates\n` +
    `*COMPARE <fund1> vs <fund2>* — AI comparison\n` +
    `*TIPS* — get today's AI investment tip\n\n` +
    `*── AI ──*\n` +
    `*ASK <question>* — ask Sentill Africa anything\n` +
    `_Example: ASK best fund for KES 50,000?_\n\n` +
    `*── Portfolio (Pro) ──*\n` +
    `*PORTFOLIO* — your tracked assets\n` +
    `*LOG* — add an investment\n` +
    `*GOALS* — view financial goals\n` +
    `*GOAL <name> <amount> <date>* — set a goal\n` +
    `*WATCHLIST* — saved providers\n\n` +
    `*── Account ──*\n` +
    `*STATUS* — subscription info\n` +
    `*SUBSCRIBE* / *RENEW* — upgrade to Pro\n` +
    `*MENU* — main menu  |  *LOGOUT* — disconnect\n\n` +
    `_ℹ️ Sentil tracks info only — your money stays with providers._\n` +
    `🌐 ${appUrl}`
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

