/**
 * lib/whatsapp-bot.ts
 * Sentil Africa — WhatsApp Investment Hub Bot
 *
 * Features:
 *  • Investment browser (MMF/T-Bill/SACCO/Bond/NSE) with interactive buttons
 *  • Asset logging via WhatsApp chat
 *  • Sentil AI for any investment question
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
  TRIAL_7_DAYS: { label: "7-Day Trial",  amount: 100,  days: 7,   description: "Full Pro for 7 days!" },
  PRO_MONTHLY:  { label: "Pro Monthly",  amount: 499,  days: 30,  description: "Full Pro for 1 month" },
  PRO_ANNUAL:   { label: "Pro Annual",   amount: 4990, days: 365, description: "Full Pro for 12 months — save 2 months!" },
} as const;

type PlanKey = keyof typeof PLANS;

// Investment category labels
const INVEST_CATEGORIES: Record<string, string> = {
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

  // ── Button payloads: route directly regardless of state ─────────────────
  // This ensures interactive button taps always work even if state is IDLE
  if (buttonPayload) {
    // Plan selections
    if (buttonPayload === "TRIAL_7_DAYS") return handleSelectPlan(waId, "TRIAL_7_DAYS", ctx, session.userId ?? undefined);
    if (buttonPayload === "PRO_MONTHLY")  return handleSelectPlan(waId, "PRO_MONTHLY",  ctx, session.userId ?? undefined);
    if (buttonPayload === "PRO_ANNUAL")   return handleSelectPlan(waId, "PRO_ANNUAL",   ctx, session.userId ?? undefined);
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

  if (input === "REGISTER" || input === "1") {
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

  if (input === "LOGIN" || input === "2") {
    if (session.userId) {
      return sendWhatsAppMessage(waId, "✅ Already logged in! Send *MENU* for options.");
    }
    return handleLoginRequest(waId);
  }

  if (!session.userId) {
    return sendInteractiveButtons(
      waId,
      `👋 *Welcome to Sentil Africa!*\n\n` +
      `🌍 Kenya's premier wealth intelligence hub.\n\n` +
      `📊 Compare MMFs, T-Bills, Bonds, SACCOs\n` +
      `🧠 AI-powered investment insights\n` +
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
  if (input === "TRIAL_7_DAYS" || input === "TRIAL7" || input === "100") {
    return handleSelectPlan(waId, "TRIAL_7_DAYS", ctx, userId);
  }
  if (input === "PRO_MONTHLY" || input === "MONTHLY" || input === "499") {
    return handleSelectPlan(waId, "PRO_MONTHLY", ctx, userId);
  }
  if (input === "PRO_ANNUAL" || input === "ANNUAL" || input === "4990") {
    return handleSelectPlan(waId, "PRO_ANNUAL", ctx, userId);
  }

  // ASK command — explicit Gemini question
  if (input.startsWith("ASK ") || rawInput.toLowerCase().startsWith("ask ")) {
    const question = rawInput.replace(/^ask\s+/i, "").trim();
    if (question.length < 3) {
      return sendWhatsAppMessage(waId, "Please type your question after ASK. Example:\n*ASK what is the best MMF for KES 50,000?*");
    }
    return handleGeminiQuestion(waId, question, userId);
  }

  // Smart fallback — route to Sentil AI for anything investment-related
  const investKeywords = ["what", "which", "how", "best", "compare", "rate", "invest", "return", "yield", "risk", "mmf", "tbill", "sacco", "explain", "difference", "recommend", "should", "advice"];
  const looksLikeQuestion = investKeywords.some((kw) => rawInput.toLowerCase().includes(kw)) || rawInput.includes("?");

  if (looksLikeQuestion && rawInput.length > 8) {
    return handleGeminiQuestion(waId, rawInput, userId);
  }

  return sendWhatsAppMessage(
    waId,
    `❓ I didn't get that. Send *MENU* to see all options, or ask me a question!\n\n` +
    `Example: _ASK what is the best investment for KES 10,000?_`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sentil AI handler
// ─────────────────────────────────────────────────────────────────────────────

async function handleGeminiQuestion(waId: string, question: string, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, isPremium: true },
  });

  await sendWhatsAppMessage(waId, "🧠 *Sentil AI* is thinking...");

  const answer = await askGeminiBot(question, {
    name: user?.name ?? "Investor",
    userId,
    isPremium: user?.isPremium ?? false,
  });

  return sendWhatsAppMessage(waId, `🧠 *Sentil AI Says:*\n\n${answer}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Investment Browser
// ─────────────────────────────────────────────────────────────────────────────

async function sendInvestmentCategories(waId: string, userId: string) {
  // Get available types from DB
  const types = await prisma.provider.groupBy({
    by: ["type"],
    _count: { id: true },
    orderBy: { type: "asc" },
  });

  const typeButtons = types
    .slice(0, 3)
    .map((t) => ({
      id: `CAT_${t.type.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`,
      title: INVEST_CATEGORIES[t.type] ?? `📊 ${t.type}`,
    }));

  await sendInteractiveButtons(
    waId,
    `🏦 *Sentil Investment Hub*\n\n` +
    `Browse and compare investment options across all categories.\n\n` +
    `📊 Tap a category to see live rates & options:\n` +
    `_(Tap any category to explore)_`,
    typeButtons.length > 0
      ? typeButtons
      : [
          { id: "CAT_MONEY_MARKET", title: "💰 Money Market Funds" },
          { id: "CAT_T-BILL",      title: "📈 Treasury Bills" },
          { id: "CAT_SACCO",       title: "🤝 SACCOs" },
        ]
  );

  // Also send more categories as text
  if (types.length > 3) {
    const moreTypes = types.slice(3).map((t) => `• *${INVEST_CATEGORIES[t.type] ?? t.type}* — reply _${t.type.toUpperCase()}_`).join("\n");
    return sendWhatsAppMessage(
      waId,
      `📌 *More categories:*\n${moreTypes}\n\n` +
      `Or ask me directly:\n_ASK best investment for KES 100,000?_`
    );
  }
}

async function handleBrowseCategoryInput(waId: string, input: string, userId: string, ctx: SessionContext) {
  // Detect CAT_ prefix from button payload
  const catMatch = input.match(/^CAT_(.+)$/);
  if (!catMatch) return sendInvestmentCategories(waId, userId);

  const rawType = catMatch[1].replace(/_/g, " ").replace("MONEY MARKET", "MONEY_MARKET");
  // Map common aliases
  const typeMap: Record<string, string> = {
    "MONEY_MARKET": "MONEY_MARKET",
    "T BILL": "T-Bill",
    "T-BILL": "T-Bill",
    "SACCO": "SACCO",
    "BOND": "Bond",
    "EQUITY": "Equity",
    "PENSION": "Pension",
  };
  const dbType = typeMap[rawType] ?? rawType;
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

      // Get AI summary
      await sendWhatsAppMessage(waId, "🤔 Getting AI summary...");
      const aiSummary = await generateInvestmentSummary(
        selected.name, selected.type, selected.currentYield,
        selected.riskLevel, selected.minimumInvest ?? null
      );

      const msg =
        `🏦 *${selected.name}*\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `📈 Yield: *${selected.currentYield.toFixed(2)}% p.a.*\n` +
        `⚡ Risk: ${selected.riskLevel}\n` +
        `🏛 AUM: ${selected.aum}\n` +
        (selected.minimumInvest ? `💵 Minimum: ${selected.minimumInvest}\n` : ``) +
        `━━━━━━━━━━━━━━━━\n` +
        `🧠 *Oracle Says:*\n${aiSummary}\n\n` +
        `━━━━━━━━━━━━━━━━\n` +
        `What would you like to do?\n` +
        `• Reply *LOG* to track this investment\n` +
        `• Reply *WATCH* to add to watchlist\n` +
        `• Reply *BACK* to see all ${ctx.category} funds\n` +
        `• Reply *ASK* + your question about this fund`;

      return sendWhatsAppMessage(waId, msg);
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
      `⚡ Send *SUBSCRIBE* to start your 7-day trial (KES 100) or go Pro.`
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
      `⚡ Send *SUBSCRIBE* to upgrade — starting at *KES 100 for 7 days*.`
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
  const rates = await prisma.marketRateCache.findMany({
    orderBy: { lastSyncedAt: "desc" },
    take: 8,
  });

  let msg = `📈 *Live Market Rates — Kenya*\n\n`;
  if (rates.length) {
    rates.forEach((r) => {
      msg += `• *${r.symbol}:* ${r.price.toFixed(2)}%\n`;
    });
  } else {
    msg += `• 91-Day T-Bill: 15.78%\n• CIC MMF: 13.40%\n• Sanlam MMF: 13.10%\n• Zimele MMF: 13.05%\n`;
  }
  msg += `\n_Updated: ${new Date().toLocaleDateString("en-KE", { day: "numeric", month: "short" })}_\n`;
  msg += `_ℹ️ Rates for information only._\n\n`;
  msg += `• *INVEST* — browse providers\n• *ASK* which fund is best for me?`;

  return sendWhatsAppMessage(waId, msg);
}

async function handleGoals(waId: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user?.isPremium) {
    return sendWhatsAppMessage(
      waId,
      `🎯 *Financial Goals*\n\nGoal planning is a *Pro feature*.\n\n` +
      `Send *SUBSCRIBE* to unlock.`
    );
  }

  const goals = await prisma.userGoal.findMany({ where: { userId } });

  if (!goals.length) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentill.africa";
    return sendWhatsAppMessage(
      waId,
      `🎯 *Your Goals*\n\nNo goals set yet.\n\nSet your first goal:\n${appUrl}/dashboard`
    );
  }

  let msg = `🎯 *Your Financial Goals*\n\n`;
  goals.forEach((g) => {
    const deadline = new Date(g.deadline).toLocaleDateString("en-KE");
    msg += `• *${g.name}* (${g.category})\n  Target: ${formatKES(g.target)} by ${deadline}\n\n`;
  });
  msg += `Send *PORTFOLIO* to review your investments.`;

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
      `✅ Portfolio Tracker\n✅ AI Oracle\n✅ Goal Planning\n✅ Daily Intelligence\n\n`;

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
    `✅ Live market rates\n✅ Investment browser\n✅ AI Q&A\n✅ Daily WhatsApp brief\n` +
    `❌ Portfolio tracker\n❌ AI Oracle\n❌ Goal planning\n\n` +
    `⚡ *Upgrade to Pro:*\n` +
    `• Trial (7 days) — *KES 100*\n` +
    `• Monthly — *KES 499/month*\n` +
    `• Annual — *KES 4,990/year*\n\n` +
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

  const hadTrial = await prisma.payment.findFirst({
    where: { userId, plan: "TRIAL_7_DAYS", status: "SUCCESS" },
  });

  await sendInteractiveButtons(
    waId,
    `⚡ *${action} Sentil Pro*\n\n` +
    `Unlock full intelligence:\n` +
    `📊 Portfolio tracking\n🧠 AI Oracle deep insights\n🎯 Goal planning\n\n` +
    (!hadTrial ? `🆓 *Trial:* KES 100 / 7 days\n` : ``) +
    `📱 *Monthly:* KES 499/month\n` +
    `📅 *Annual:* KES 4,990/year _(save 2 months!)_\n\n` +
    `Choose a plan:`,
    [
      ...(hadTrial ? [] : [{ id: "TRIAL_7_DAYS", title: "🆓 Trial — KES 100" }]),
      { id: "PRO_MONTHLY", title: "📱 Monthly — KES 499" },
      { id: "PRO_ANNUAL",  title: "📅 Annual — KES 4,990" },
    ].slice(0, 3),
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

  const isTrial = plan === "TRIAL_7_DAYS";
  return sendWhatsAppMessage(
    waId,
    `${isTrial ? "🆓" : "⚡"} *Confirm ${isTrial ? "Trial" : "Subscription"}*\n\n` +
    `Plan: *${planInfo.label}*\n` +
    `Duration: *${planInfo.days} day${planInfo.days > 1 ? "s" : ""}*\n` +
    `Amount: *${formatKES(planInfo.amount)}*\n` +
    `${planInfo.description}\n\n` +
    `💳 Payment via *Paystack* (M-Pesa / Card).\n` +
    `_Sentil does not hold your money._\n\n` +
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

    await sendInteractiveButtons(
      waId,
      `👋 *Hello, ${name}!*\n\n` +
      `📱 *Sentil Africa — Wealth Intelligence Hub*\n` +
      (isPro ? `⚡ Pro Member` : `🔓 Free Plan`) +
      expiryWarning +
      `\n\nWhat would you like today?`,
      [
        { id: "INVEST",    title: "🏦 Browse Investments" },
        { id: "MARKETS",   title: "📈 Live Rates" },
        { id: "SUBSCRIBE", title: isPro ? "🔄 Renew Pro" : "⚡ Upgrade to Pro" },
      ],
      userId
    );

    return sendWhatsAppMessage(
      waId,
      `📌 *All commands:*\n` +
      `*INVEST* — browse all investment options\n` +
      `*MARKETS* — live NSE/MMF/T-Bill rates\n` +
      `*ASK* — ask AI any investment question\n` +
      (isPro ? `*PORTFOLIO* — your tracked assets\n*GOALS* — financial goals\n*LOG* — add investment\n` : ``) +
      `*WATCHLIST* — saved providers\n` +
      `*STATUS* — subscription details\n` +
      `*SUBSCRIBE* | *RENEW* — upgrade/renew\n` +
      `*HELP* — full command list`,
      userId
    );
  }

  return sendInteractiveButtons(
    waId,
    `👋 *Welcome to Sentil Africa!*\n\n` +
    `🌍 Kenya's premier wealth intelligence hub.\n\n` +
    `📊 Browse MMFs, T-Bills, Bonds, SACCOs\n` +
    `🧠 AI-powered investment insights\n` +
    `📱 Everything via WhatsApp\n\n` +
    `Get started:`,
    [
      { id: "REGISTER", title: "🆕 Create Account" },
      { id: "LOGIN",    title: "🔐 Login" },
    ]
  );
}

async function sendHelp(waId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentill.africa";
  return sendWhatsAppMessage(
    waId,
    `🆘 *Sentil WhatsApp Help*\n\n` +
    `*── Investment Hub ──*\n` +
    `*INVEST* (I) — browse all categories\n` +
    `*MARKETS* (M) — live rates\n` +
    `*ASK <question>* — AI investment advice\n\n` +
    `*── Portfolio (Pro) ──*\n` +
    `*PORTFOLIO* (P) — tracked assets\n` +
    `*LOG* — add investment\n` +
    `*GOALS* (G) — financial goals\n\n` +
    `*── Subscription ──*\n` +
    `*SUBSCRIBE* — view & purchase Pro\n` +
    `*RENEW* — renew Pro\n` +
    `*STATUS* (S) — subscription details\n\n` +
    `*── Plans ──*\n` +
    `• Trial: *KES 100 / 7 days*\n` +
    `• Monthly: *KES 499/month*\n` +
    `• Annual: *KES 4,990/year*\n\n` +
    `*── Account ──*\n` +
    `*MENU* — main menu\n` +
    `*LOGOUT* — disconnect\n\n` +
    `_ℹ️ Sentil tracks info only — your money stays with providers._\n\n` +
    `🌐 ${appUrl}`
  );
}
