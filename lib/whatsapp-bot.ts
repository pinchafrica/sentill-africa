/**
 * lib/whatsapp-bot.ts
 * Core conversation router for Sentil WhatsApp Bot.
 *
 * IMPORTANT: Sentil Africa is a WEALTH INTELLIGENCE HUB — we do NOT hold money.
 * Payments via WhatsApp are for:
 *   1. New subscription (PRO_MONTHLY or PRO_ANNUAL)
 *   2. Subscription renewal (re-subscribing before or after expiry)
 *
 * Subscription plans:
 *   PRO_MONTHLY  → KES 499 / month
 *   PRO_ANNUAL   → KES 4,990 / year (save 2 months)
 *
 * Payment flow uses Paystack (M-Pesa via mobile_money channel).
 * We send user a checkout link — they pay directly to Paystack.
 * No money is ever held by Sentil.
 */

import { prisma } from "./prisma";
import {
  sendWhatsAppMessage,
  sendInteractiveButtons,
  generateOTP,
  formatKES,
  normalizePhone,
} from "./whatsapp";
import bcrypt from "bcryptjs";

// ─────────────────────────────────────────────────────────────────────────────
// Subscription Plans
// ─────────────────────────────────────────────────────────────────────────────

const PLANS = {
  TRIAL_7_DAYS: { label: "7-Day Trial",  amount: 100,  days: 7,   description: "Full Pro access for 7 days — try before you commit!" },
  PRO_MONTHLY:  { label: "Pro Monthly",  amount: 499,  days: 30,  description: "Full Pro access for 1 month" },
  PRO_ANNUAL:   { label: "Pro Annual",   amount: 4990, days: 365, description: "Full Pro access for 12 months — save 2 months!" },
} as const;

type PlanKey = keyof typeof PLANS;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SessionContext {
  name?: string;
  email?: string;
  otp?: string;
  plan?: PlanKey;
}

// ─────────────────────────────────────────────────────────────────────────────
// Session helpers
// ─────────────────────────────────────────────────────────────────────────────

async function getOrCreateSession(waId: string) {
  let session = await prisma.whatsAppSession.findUnique({ where: { waId } });
  if (!session) {
    session = await prisma.whatsAppSession.create({
      data: { waId, state: "IDLE", context: "{}" },
    });
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
      ...(userId ? { userId } : {}),
    },
  });
}

async function logInbound(waId: string, message: string, userId?: string) {
  await prisma.whatsAppLog.create({
    data: {
      waId,
      userId: userId ?? null,
      direction: "INBOUND",
      message,
      msgType: "text",
      status: "DELIVERED",
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main entry point — called by webhook
// ─────────────────────────────────────────────────────────────────────────────

export async function processIncomingMessage(
  waId: string,
  rawBody: string | undefined,
  buttonPayload?: string
) {
  const input = (buttonPayload ?? rawBody ?? "").trim().toUpperCase();
  const session = await getOrCreateSession(waId);
  const ctx: SessionContext = JSON.parse(session.context || "{}");

  await logInbound(waId, input, session.userId ?? undefined);

  // ── Route by session state first ──────────────────────────────────────────
  switch (session.state) {
    case "REGISTER_NAME":
      return handleRegisterName(waId, rawBody ?? "", ctx);
    case "REGISTER_EMAIL":
      return handleRegisterEmail(waId, rawBody ?? "", ctx);
    case "REGISTER_OTP":
      return handleRegisterOTP(waId, input, ctx);
    case "LOGIN_OTP":
      return handleLoginOTP(waId, input, ctx);
    case "SUB_CONFIRM":
      return handleSubConfirm(waId, input, ctx, session.userId ?? undefined);
  }

  // ── IDLE — route by keyword ───────────────────────────────────────────────
  if (["HI", "HELLO", "START", "MENU", "HOME"].includes(input)) {
    return sendMainMenu(waId, session.userId ?? undefined);
  }

  if (input === "REGISTER" || input === "1") {
    if (session.userId) {
      return sendWhatsAppMessage(waId, "✅ You already have an account! Send *MENU* to see your options.");
    }
    await updateSession(waId, "REGISTER_NAME", {});
    return sendWhatsAppMessage(
      waId,
      "🎉 Welcome to *Sentil Africa!*\n\n" +
      "Kenya's #1 wealth intelligence hub.\n\n" +
      "Let's create your *free account*.\n\nFirst, what is your *full name*?"
    );
  }

  if (input === "LOGIN" || input === "2") {
    if (session.userId) {
      return sendWhatsAppMessage(waId, "✅ You are already logged in! Send *MENU* to see your options.");
    }
    return handleLoginRequest(waId);
  }

  if (!session.userId) {
    return sendWhatsAppMessage(
      waId,
      "👋 Welcome to *Sentil Africa*!\n\n" +
      "I don't recognize this number yet.\n\n" +
      "📝 Send *REGISTER* to create a free account\n" +
      "🔐 Send *LOGIN* to link your existing account"
    );
  }

  // ── Authenticated commands ────────────────────────────────────────────────
  if (input === "PORTFOLIO" || input === "P") return handlePortfolio(waId, session.userId);
  if (input === "MARKETS"   || input === "M") return handleMarkets(waId);
  if (input === "GOALS"     || input === "G") return handleGoals(waId, session.userId);
  if (input === "WATCHLIST" || input === "W") return handleWatchlist(waId, session.userId);
  if (input === "STATUS"    || input === "S") return handleSubscriptionStatus(waId, session.userId);
  if (input === "HELP"      || input === "H") return sendHelp(waId);

  // ── Subscription commands ─────────────────────────────────────────────────
  if (["SUBSCRIBE", "RENEW", "UPGRADE", "PRO", "PAY", "TRIAL"].includes(input)) {
    return sendSubscriptionPlans(waId, session.userId);
  }
  if (input === "TRIAL_7_DAYS" || input === "TRIAL7" || input === "100") {
    return handleSelectPlan(waId, "TRIAL_7_DAYS", ctx, session.userId);
  }
  if (input === "PRO_MONTHLY" || input === "MONTHLY" || input === "499") {
    return handleSelectPlan(waId, "PRO_MONTHLY", ctx, session.userId);
  }
  if (input === "PRO_ANNUAL" || input === "ANNUAL" || input === "4990") {
    return handleSelectPlan(waId, "PRO_ANNUAL", ctx, session.userId);
  }

  if (input === "LOGOUT") {
    await updateSession(waId, "IDLE", {});
    await prisma.whatsAppSession.update({ where: { waId }, data: { userId: null } });
    return sendWhatsAppMessage(waId, "👋 You have been logged out. Send *LOGIN* to reconnect.");
  }

  return sendWhatsAppMessage(
    waId,
    "❓ I don't understand that command. Send *MENU* to see all options."
  );
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
    `Great, *${name}*! 👋\n\nNow enter your *email address* to complete registration:`
  );
}

async function handleRegisterEmail(waId: string, email: string, ctx: SessionContext) {
  const emailLower = email.toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
    return sendWhatsAppMessage(waId, "❌ That doesn't look like a valid email. Please try again:");
  }

  const existing = await prisma.user.findUnique({ where: { email: emailLower } });
  if (existing) {
    await updateSession(waId, "IDLE", {});
    return sendWhatsAppMessage(
      waId,
      `⚠️ An account with *${emailLower}* already exists.\n\nSend *LOGIN* to link your WhatsApp to that account.`
    );
  }

  const otp = generateOTP();
  const hashedOtp = await bcrypt.hash(otp, 10);
  await updateSession(waId, "REGISTER_OTP", { ...ctx, email: emailLower, otp: hashedOtp });
  return sendWhatsAppMessage(
    waId,
    `📲 Your verification code:\n\n🔐 *${otp}*\n\n_(valid for 10 minutes)_\n\nEnter the code to verify your account:`
  );
}

async function handleRegisterOTP(waId: string, inputOtp: string, ctx: SessionContext) {
  if (!ctx.otp || !ctx.name || !ctx.email) {
    await updateSession(waId, "IDLE", {});
    return sendWhatsAppMessage(waId, "❌ Session expired. Please send *REGISTER* to start again.");
  }

  const valid = await bcrypt.compare(inputOtp, ctx.otp);
  if (!valid) {
    return sendWhatsAppMessage(waId, "❌ Invalid OTP. Please check the code and try again:");
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

  // Auto-enable WhatsApp daily notifications for all WA registrations
  await prisma.alertPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      whatsappEnabled: true,
      whatsappNumber: normalizedPhone,
      frequency: "DAILY",
    },
    update: {
      whatsappEnabled: true,
      whatsappNumber: normalizedPhone,
      frequency: "DAILY",
    },
  });

  await updateSession(waId, "IDLE", {}, user.id);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentil.africa";
  return sendWhatsAppMessage(
    waId,
    `✅ *Welcome to Sentil Africa, ${ctx.name}!*\n\n` +
    `Your free account is ready. 🎉\n\n` +
    `📊 *Free features:* Market rates, provider comparisons & daily briefings\n\n` +
    `⚡ *Upgrade to Pro* for portfolio tracking, AI Oracle & goal planning.\n\n` +
    `🌐 Dashboard: ${appUrl}/dashboard\n\n` +
    `Send *SUBSCRIBE* to upgrade, or *MENU* to explore.`
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
      "❌ No account linked to this number.\n\nSend *REGISTER* to create your free account."
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
    return sendWhatsAppMessage(waId, "❌ Session expired. Please send *LOGIN* to try again.");
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

  // Auto-enable WA notifications for ALL users who log in via WhatsApp
  await prisma.alertPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      whatsappEnabled: true,
      whatsappNumber: normalizePhone(waId),
      frequency: "DAILY",
    },
    update: {
      whatsappEnabled: true,
      whatsappNumber: normalizePhone(waId),
    },
  });

  await updateSession(waId, "IDLE", {}, user.id);

  // Show subscription status on login
  const subStatus = user.isPremium ? `⚡ *Pro Active*` : `🔓 *Free Plan*`;
  const expiry = user.premiumExpiresAt
    ? ` (expires ${new Date(user.premiumExpiresAt).toLocaleDateString("en-KE")})`
    : "";

  return sendWhatsAppMessage(
    waId,
    `✅ *Logged in!* Welcome back, *${user.name.split(" ")[0]}* 👋\n\n` +
    `${subStatus}${expiry}\n\n` +
    `🔔 *Daily AI briefs are ON* — you'll get market intel at 7AM EAT.\n\n` +
    `Send *MENU* to see your options.`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard commands
// ─────────────────────────────────────────────────────────────────────────────

async function handlePortfolio(waId: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  // Portfolio tracking is a Pro feature
  if (!user?.isPremium) {
    return sendWhatsAppMessage(
      waId,
      `📊 *Portfolio Tracker*\n\n` +
      `This is a *Pro feature*.\n\n` +
      `⚡ Upgrade to track your investments, log assets, and get AI-powered portfolio insights.\n\n` +
      `Send *SUBSCRIBE* to see plans — starting at *KES 499/month*.`
    );
  }

  const assets = await prisma.portfolioAsset.findMany({
    where: { userId },
    include: { provider: true },
    orderBy: { loggedAt: "desc" },
    take: 8,
  });

  if (!assets.length) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentil.africa";
    return sendWhatsAppMessage(
      waId,
      `📊 *Your Portfolio*\n\n` +
      `No assets logged yet.\n\n` +
      `🌐 Add your investments via the dashboard:\n${appUrl}/dashboard/assets`
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
  msg += `📈 *Projected Annual Return:* ${formatKES(projected)}\n\n`;
  msg += `_Sentil tracks your data — money stays in your accounts._\n\n`;
  msg += `Send *MARKETS* for live rates or *GOALS* for progress.`;

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
  msg += `\n_Last updated: ${new Date().toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}_\n\n`;
  msg += `_ℹ️ Sentil provides information only — invest directly through your chosen provider._\n\n`;
  msg += `Send *PORTFOLIO* to track your holdings or *SUBSCRIBE* to unlock Pro insights.`;

  return sendWhatsAppMessage(waId, msg);
}

async function handleGoals(waId: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user?.isPremium) {
    return sendWhatsAppMessage(
      waId,
      `🎯 *Financial Goals*\n\n` +
      `Goal planning is a *Pro feature*.\n\n` +
      `⚡ Send *SUBSCRIBE* to unlock goal setting, portfolio tracking & AI recommendations.`
    );
  }

  const goals = await prisma.userGoal.findMany({ where: { userId } });

  if (!goals.length) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentil.africa";
    return sendWhatsAppMessage(
      waId,
      `🎯 *Your Goals*\n\nNo goals set yet.\n\n` +
      `Set your first goal on the dashboard:\n${appUrl}/dashboard`
    );
  }

  let msg = `🎯 *Your Financial Goals*\n\n`;
  goals.forEach((g) => {
    const deadline = new Date(g.deadline).toLocaleDateString("en-KE");
    msg += `• *${g.name}* (${g.category})\n  Target: ${formatKES(g.target)} by ${deadline}\n\n`;
  });
  msg += `Send *PORTFOLIO* to review your tracked investments.`;

  return sendWhatsAppMessage(waId, msg);
}

async function handleWatchlist(waId: string, userId: string) {
  const items = await prisma.watchlist.findMany({
    where: { userId },
    include: { provider: true },
  });

  if (!items.length) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentil.africa";
    return sendWhatsAppMessage(
      waId,
      `👀 *Your Watchlist*\n\nNothing saved yet.\n\n` +
      `Browse providers on the platform:\n${appUrl}/dashboard`
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
  msg += `\n_ℹ️ These are information snapshots — invest directly with each provider._\n\nSend *MARKETS* for current rates.`;

  return sendWhatsAppMessage(waId, msg);
}

async function handleSubscriptionStatus(waId: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentil.africa";

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
      msg +=
        `⚠️ *Expiring soon!* Renew now to keep uninterrupted access.\n\n` +
        `Send *RENEW* to choose a plan.`;
    } else {
      msg += `🌐 ${appUrl}/dashboard`;
    }

    return sendWhatsAppMessage(waId, msg);
  }

  // Free user
  return sendWhatsAppMessage(
    waId,
    `🔓 *Sentil Free Plan*\n\n` +
    `👤 ${user.name}\n\n` +
    `✅ Live market rates\n✅ Provider comparisons\n✅ Daily WhatsApp briefing\n` +
    `❌ Portfolio tracker\n❌ AI Oracle\n❌ Goal planning\n\n` +
    `⚡ *Upgrade to Pro:*\n` +
    `• Monthly — *KES 499/month*\n` +
    `• Annual — *KES 4,990/year* (save 2 months!)\n\n` +
    `Send *SUBSCRIBE* to upgrade or *RENEW* to reactivate.`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Subscription flow — plans menu and confirmation
// ─────────────────────────────────────────────────────────────────────────────

async function sendSubscriptionPlans(waId: string, userId?: string) {
  if (!userId) {
    return sendWhatsAppMessage(waId, "🔒 Please *LOGIN* first before subscribing.");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const isRenewal = user?.isPremium ?? false;
  const action = isRenewal ? "Renew" : "Upgrade to";

  // Check if user has ever had a trial (prevent double-trial)
  const hadTrial = await prisma.payment.findFirst({
    where: { userId, plan: "TRIAL_7_DAYS", status: "SUCCESS" },
  });

  await sendInteractiveButtons(
    waId,
    `⚡ *${action} Sentil Pro*\n\n` +
    `Sentil is a *wealth intelligence hub* — we help you make smarter investment decisions.\n\n` +
    (!hadTrial
      ? `🆓 *7-Day Trial*\n   KES 100 — try everything free for a week!\n\n`
      : "") +
    `📱 *Monthly Plan*\n   KES 499/month — full Pro access\n\n` +
    `📅 *Annual Plan*\n   KES 4,990/year — save 2 months!\n\n` +
    `Choose your plan:`,
    [
      ...(hadTrial ? [] : [{ id: "TRIAL_7_DAYS", title: "🆓 Trial — KES 100 / 7 days" }]),
      { id: "PRO_MONTHLY", title: "📱 Monthly — KES 499" },
      { id: "PRO_ANNUAL",  title: "📅 Annual — KES 4,990" },
    ].slice(0, 3), // Meta limit: 3 buttons max
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
    return sendWhatsAppMessage(waId, "🔒 Please *LOGIN* first before subscribing.");
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
    return sendWhatsAppMessage(waId, "❌ Subscription cancelled. Send *MENU* for options.");
  }

  if (input !== "YES") {
    return sendWhatsAppMessage(waId, "Please reply *YES* to confirm or *NO* to cancel.");
  }

  if (!userId) {
    await updateSession(waId, "IDLE", {});
    return sendWhatsAppMessage(waId, "❌ You must be logged in. Send *LOGIN* first.");
  }

  const plan = (ctx.plan ?? "PRO_MONTHLY") as PlanKey;
  const planInfo = PLANS[plan];
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    await updateSession(waId, "IDLE", {});
    return sendWhatsAppMessage(waId, "❌ Account not found. Please try again.");
  }

  try {
    // Initialize Paystack checkout (existing mpesa/paystack route)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentil.africa";
    const paystackRes = await fetch(`${appUrl}/api/payment/mpesa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        amount: planInfo.amount,
        plan,
        email: user.email,
        mpesaCode: "WA-CHECKOUT", // triggers Paystack init flow
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
        `👆 Tap the link above to pay via *M-Pesa or Card* on the Paystack secure page.\n\n` +
        `_Your premium access will activate automatically after payment._\n\n` +
        `⚠️ Link expires in 30 minutes. Send *SUBSCRIBE* to get a new one if needed.`
      );
    } else {
      throw new Error(paystackData.error ?? "Checkout initialization failed");
    }
  } catch (err) {
    console.error("[WhatsApp Sub Confirm]", err);
    await updateSession(waId, "IDLE", {}, userId);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentil.africa";
    return sendWhatsAppMessage(
      waId,
      `❌ Failed to generate payment link.\n\n` +
      `Please subscribe directly from the web:\n${appUrl}/packages\n\n` +
      `Or try again by sending *SUBSCRIBE*.`
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Menus
// ─────────────────────────────────────────────────────────────────────────────

async function sendMainMenu(waId: string, userId?: string) {
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const name = user?.name?.split(" ")[0] ?? "Investor";
    const isPro = user?.isPremium ?? false;

    // Check expiry warning
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
      (isPro ? `⚡ Pro Member` : `🔓 Free Plan — Send *SUBSCRIBE* to upgrade`) +
      expiryWarning +
      `\n\nWhat would you like to do?`,
      [
        { id: "MARKETS",   title: "📈 Markets" },
        { id: "STATUS",    title: isPro ? "⚡ My Subscription" : "🔓 My Plan" },
        { id: "SUBSCRIBE", title: isPro ? "🔄 Renew Pro" : "⚡ Upgrade to Pro" },
      ],
      userId
    );

    return sendWhatsAppMessage(
      waId,
      `📌 *Commands:*\n` +
      `*MARKETS* — Live NSE/MMF/T-Bill rates\n` +
      (isPro
        ? `*PORTFOLIO* — Your tracked assets\n*GOALS* — Financial goals\n`
        : ``) +
      `*WATCHLIST* — Saved providers\n` +
      `*STATUS* — Subscription details\n` +
      `*SUBSCRIBE* | *RENEW* — Upgrade/Renew Pro\n` +
      `*HELP* — Full command list`,
      userId
    );
  }

  // Guest menu
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

async function sendHelp(waId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentil.africa";
  return sendWhatsAppMessage(
    waId,
    `🆘 *Sentil WhatsApp Help*\n\n` +
    `*── Information (Free) ──*\n` +
    `*MARKETS* (M) — Live market rates\n` +
    `*WATCHLIST* (W) — Your saved providers\n\n` +
    `*── Pro Features ──*\n` +
    `*PORTFOLIO* (P) — Tracked assets & returns\n` +
    `*GOALS* (G) — Financial goal progress\n\n` +
    `*── Subscription ──*\n` +
    `*SUBSCRIBE* — View & purchase Pro plans\n` +
    `*RENEW* — Renew your Pro subscription\n` +
    `*STATUS* (S) — Check subscription status\n\n` +
    `*── Account ──*\n` +
    `*MENU* — Main menu\n` +
    `*LOGOUT* — Disconnect WhatsApp\n\n` +
    `*── Plans ──*\n` +
    `• Trial:   *KES 100 / 7 days* — try Pro free!\n` +
    `• Monthly: *KES 499/month*\n` +
    `• Annual:  *KES 4,990/year* (save 2 months!)\n\n` +
    `_ℹ️ Sentil is an intelligence hub. We do not hold or manage your funds._\n\n` +
    `🌐 ${appUrl}`
  );
}
