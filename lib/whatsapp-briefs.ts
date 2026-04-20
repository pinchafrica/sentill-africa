/**
 * lib/whatsapp-briefs.ts
 * Premium WhatsApp notification templates for Sentill Africa.
 * All templates use full WhatsApp formatting:
 *   *bold*  _italic_  ~strikethrough~  ```monospace```
 * 
 * Template types:
 *   - DAILY_MORNING     → 7:00 AM comprehensive daily digest
 *   - MIDDAY_PULSE      → 12:00 PM quick market check-in
 *   - EVENING_WRAP      → 6:00 PM portfolio performance wrap
 *   - WEEKLY_INTELLIGENCE → Monday 7:30 AM deep weekly analysis
 *   - INSTANT_ALERT     → Triggered by threshold breach
 */

import { prisma } from "./prisma";
import { formatKES } from "./whatsapp";
import { getGeminiApiKey } from "./api-keys";

const GEMINI_MODEL = "gemini-2.0-flash";

async function callGemini(prompt: string, maxTokens = 400): Promise<string> {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) throw new Error("No Gemini API key");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.75, topP: 0.9, maxOutputTokens: maxTokens },
      }),
    }
  );
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
}

// ─── Market data helpers ──────────────────────────────────────────────────────

interface MarketData {
  topMMF: { symbol: string; yield: number } | null;
  tBill91: number;
  tBill364: number;
  allRates: { symbol: string; price: number }[];
}

async function getMarketData(): Promise<MarketData> {
  const rates = await prisma.marketRateCache.findMany({ orderBy: { price: "desc" }, take: 10 });
  const tBill91 = rates.find(r => r.symbol.includes("91"))?.price ?? 15.78;
  const tBill364 = rates.find(r => r.symbol.includes("364"))?.price ?? 16.42;
  const mmfRates = rates.filter(r => r.symbol.toLowerCase().includes("mmf") || r.symbol.includes("ETCA") || r.symbol.includes("CIC") || r.symbol.includes("SNLM"));
  const topMMF = mmfRates[0] ? { symbol: mmfRates[0].symbol, yield: mmfRates[0].price } : { symbol: "Zidi MMF", yield: 18.2 };
  return { topMMF, tBill91, tBill364, allRates: rates };
}

interface Portfolio {
  totalInvested: number;
  avgYield: number;
  topProviders: { name: string; principal: number; yield: number }[];
  projectedAnnual: number;
  projectedMonthly: number;
}

async function getPortfolio(userId: string): Promise<Portfolio> {
  if (userId === "guest") return { totalInvested: 0, avgYield: 0, topProviders: [], projectedAnnual: 0, projectedMonthly: 0 };
  try {
    const assets = await prisma.portfolioAsset.findMany({ where: { userId }, include: { provider: true } });
    if (!assets.length) return { totalInvested: 0, avgYield: 0, topProviders: [], projectedAnnual: 0, projectedMonthly: 0 };
    const totalInvested = assets.reduce((s, a) => s + a.principal, 0);
    const avgYield = assets.reduce((s, a) => s + a.projectedYield * a.principal, 0) / totalInvested;
    const projectedAnnual = totalInvested * (avgYield / 100);
    const projectedMonthly = projectedAnnual / 12;
    const topProviders = assets
      .sort((a, b) => b.principal - a.principal).slice(0, 4)
      .map(a => ({ name: a.provider.name, principal: a.principal, yield: a.projectedYield }));
    return { totalInvested, avgYield, topProviders, projectedAnnual, projectedMonthly };
  } catch { return { totalInvested: 0, avgYield: 0, topProviders: [], projectedAnnual: 0, projectedMonthly: 0 }; }
}

function gradeYield(y: number): string {
  if (y >= 18) return "🏆 *Exceptional*";
  if (y >= 16) return "🥇 *Excellent*";
  if (y >= 14) return "🥈 *Strong*";
  if (y >= 12) return "🥉 *Competitive*";
  return "📊 *Moderate*";
}

function yieldDelta(y: number): string {
  const savingsAcct = 4.0;
  const alpha = y - savingsAcct;
  return `+${alpha.toFixed(1)}%`;
}

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "🌅 Good morning";
  if (h < 17) return "☀️ Good afternoon";
  return "🌙 Good evening";
}

function getMarketEmoji(symbol: string): string {
  if (symbol.toLowerCase().includes("bond") || symbol.includes("IFB")) return "🏛️";
  if (symbol.toLowerCase().includes("t-bill") || symbol.includes("91D")) return "🏦";
  if (symbol.toLowerCase().includes("mmf") || ["ETCA","CIC","SNLM","BRTM"].some(c => symbol.includes(c))) return "💰";
  if (symbol.toLowerCase().includes("nse") || symbol.toLowerCase().includes("equity")) return "📊";
  return "📈";
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 1: DAILY MORNING BRIEF (7:00 AM)
// The flagship — comprehensive, beautiful, personalized
// ─────────────────────────────────────────────────────────────────────────────

export async function buildDailyMorningBrief(userName: string, userId: string, isPremium: boolean): Promise<string> {
  const [market, portfolio] = await Promise.all([getMarketData(), getPortfolio(userId)]);
  const firstName = userName.split(" ")[0];
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentill.africa";

  // AI insight — personalized
  let aiInsight = "";
  try {
    const portfolioContext = portfolio.totalInvested > 0
      ? `Portfolio: KES ${portfolio.totalInvested.toLocaleString()} invested across ${portfolio.topProviders.map(p => p.name).join(", ")}, avg yield ${portfolio.avgYield.toFixed(1)}%.`
      : "No portfolio tracked yet.";
    const prompt = `You are Sentill Oracle, Africa's sharpest AI wealth strategist for Kenyan investors.
${portfolioContext}
Market today: Top MMF ${market.topMMF?.symbol ?? "Zidi"} at ${market.topMMF?.yield ?? 18.2}%, 91-Day T-Bill at ${market.tBill91}%.

Write ONE crisp, highly specific investment insight for ${firstName} (2-3 sentences max).
Rules:
- Start with a hook emoji
- Reference a specific Kenyan instrument (CIC MMF, IFB1/2024, 91-Day T-Bill, etc.)
- Give ONE specific, actionable recommendation with numbers if possible
- WhatsApp plain text only — no markdown, no headers
- Sound like a sharp Nairobi fund manager talking to a friend`;
    aiInsight = await callGemini(prompt, 200);
  } catch {
    aiInsight = `💡 With the 91-Day T-Bill at ${market.tBill91}% and top MMFs crossing 18%, your idle cash in a savings account is losing ground daily. Move it now.`;
  }

  // Build market pulse section (top 4 rates)
  const defaultRates = [
    { symbol: "Zidi MMF", price: 18.2 },
    { symbol: "91-Day T-Bill", price: 15.78 },
    { symbol: "IFB1/2024 Bond", price: 18.46 },
    { symbol: "CIC MMF", price: 13.6 },
  ];
  const displayRates = market.allRates.length >= 3 ? market.allRates.slice(0, 4) : defaultRates;

  let marketLines = "";
  displayRates.forEach((r, i) => {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "  ";
    const isIFB = r.symbol.toLowerCase().includes("bond") || r.symbol.includes("IFB");
    const tag = isIFB ? " _(tax-free)_" : "";
    marketLines += `${medal} *${r.symbol}* — *${r.price.toFixed(2)}%*${tag}\n`;
  });

  // Portfolio section
  let portfolioSection = "";
  if (portfolio.totalInvested > 0) {
    portfolioSection =
      `━━━━━━━━━━━━━━━━━━\n` +
      `📁 *YOUR PORTFOLIO TODAY*\n\n` +
      `💼 *Invested:* ${formatKES(portfolio.totalInvested)}\n` +
      `📈 *Blended Yield:* ${portfolio.avgYield.toFixed(2)}% p.a.  ${gradeYield(portfolio.avgYield)}\n` +
      `💸 *Monthly Earnings:* ~${formatKES(Math.round(portfolio.projectedMonthly))}\n` +
      `🎯 *Annual Projection:* ~${formatKES(Math.round(portfolio.projectedAnnual))}\n` +
      `🏦 *vs Savings Account:* ${yieldDelta(portfolio.avgYield)} alpha per year\n\n`;

    if (portfolio.topProviders.length > 0) {
      portfolioSection += `*Top Allocations:*\n`;
      portfolio.topProviders.forEach(p => {
        portfolioSection += `  › ${p.name}: ${formatKES(p.principal)} @ *${p.yield.toFixed(1)}%*\n`;
      });
      portfolioSection += "\n";
    }
  } else {
    portfolioSection =
      `━━━━━━━━━━━━━━━━━━\n` +
      `📁 *PORTFOLIO STATUS*\n\n` +
      `_No holdings tracked yet._\n` +
      `Track your investments → ${appUrl}/dashboard/assets\n\n`;
  }

  // Premium exclusive tip
  let premiumTip = "";
  if (isPremium) {
    try {
      const tipPrompt = `Give a very specific, expert-level Kenyan investor tip for today ${dateStr}.
Focus on: Treasury bill strategy, infrastructure bond positioning, MMF cash management, or SACCO optimization.
2 sentences max. Start with 🔐 and be highly specific (mention exact names/rates).
WhatsApp plain text only.`;
      premiumTip =
        `━━━━━━━━━━━━━━━━━━\n` +
        `🔐 *PRO INTEL — EXCLUSIVE*\n\n` +
        `${await callGemini(tipPrompt, 150)}\n\n`;
    } catch { premiumTip = ""; }
  }

  // Assemble full message
  const msg =
    `${getTimeGreeting()}, *${firstName}* 👋\n` +
    `_Your Daily Financial Edge_ | 📅 _${dateStr}_\n` +
    `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
    `               *SENTILL.AFRICA*               \n` +
    `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n\n` +
    `📊 *KENYA MARKET PULSE*\n` +
    `_The smartest money is here today:_\n\n` +
    marketLines + `\n` +
    `💡 *Market Alpha:* vs savings baseline of 4.0%\n\n` +
    portfolioSection +
    `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
    `🧠 *AI ORACLE INSIGHT*\n\n` +
    `${aiInsight}\n\n` +
    premiumTip +
    `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
    `⚡ *COMMAND CENTER*\n\n` +
    `› Reply *RATES* — Full market table\n` +
    `› Reply *CALC 100000* — Instant projection\n` +
    `› Reply *STOCKS* — NSE Gainers & Losers\n` +
    `› Reply *MENU* — Main options\n\n` +
    `_${appUrl}_\n` +
    `_S-Tier Institutional Wealth Intelligence_ 🇰🇪`;

  return msg;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 2: MIDDAY MARKET PULSE (12:00 PM) — Quick, punchy check-in
// ─────────────────────────────────────────────────────────────────────────────

export async function buildMiddayPulse(userName: string, userId: string): Promise<string> {
  const [market, portfolio] = await Promise.all([getMarketData(), getPortfolio(userId)]);
  const firstName = userName.split(" ")[0];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentill.africa";

  let aiNugget = "";
  try {
    const prompt = `You are Sentill Oracle. Give ONE sharp midday market insight for a Kenyan investor.
Market: Top MMF ${market.topMMF?.yield ?? 18.2}%, T-Bill ${market.tBill91}%.
${portfolio.totalInvested > 0 ? `Investor has KES ${portfolio.totalInvested.toLocaleString()} earning ${portfolio.avgYield.toFixed(1)}%.` : ""}
One sentence. Start with an emoji. Be specific and actionable. WhatsApp plain text.`;
    aiNugget = await callGemini(prompt, 100);
  } catch {
    aiNugget = `🎯 Midday check: T-Bills still leading sovereign plays at ${market.tBill91}% — consider rolling short-term cash here before end of month.`;
  }

  const msg =
    `☀️ *Midday Market Check* — ${firstName}\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📊 *LIVE YIELD SNAPSHOT*\n\n` +
    `🏆 *Highest MMF:* ${market.topMMF?.symbol ?? "Zidi MMF"} @ *${(market.topMMF?.yield ?? 18.2).toFixed(2)}%*\n` +
    `🏦 *91-Day T-Bill:* *${market.tBill91.toFixed(2)}%* _(CBK auction)_\n` +
    `🏛️ *IFB1/2024:* *18.46%* _(tax-free)_\n\n` +
    (portfolio.totalInvested > 0
      ? `💼 *Your portfolio:* ${formatKES(portfolio.totalInvested)} @ *${portfolio.avgYield.toFixed(1)}%*\n`
        + `📅 *Running annual:* ~${formatKES(Math.round(portfolio.projectedAnnual))}\n\n`
      : `_Start tracking your portfolio → ${appUrl}/dashboard\n\n`
    ) +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🧠 *ORACLE MINUTE*\n\n` +
    `${aiNugget}\n\n` +
    `╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌\n` +
    `_Reply *RATES* for full market data_`;

  return msg;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 3: EVENING PERFORMANCE WRAP (6:00 PM)
// ─────────────────────────────────────────────────────────────────────────────

export async function buildEveningWrap(userName: string, userId: string, isPremium: boolean): Promise<string> {
  const [market, portfolio] = await Promise.all([getMarketData(), getPortfolio(userId)]);
  const firstName = userName.split(" ")[0];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentill.africa";

  let eveningInsight = "";
  try {
    const prompt = `You are Sentill Oracle. End-of-day investment wisdom for ${firstName}, a Kenyan investor.
${portfolio.totalInvested > 0 ? `Portfolio: ${formatKES(portfolio.totalInvested)} @ ${portfolio.avgYield.toFixed(1)}%.` : "No tracked portfolio."}
Top market today: ${market.topMMF?.symbol} at ${market.topMMF?.yield}%, T-Bill at ${market.tBill91}%.
Give ONE specific action to do tomorrow morning (2 sentences max). Start with 🌙. WhatsApp plain text.`;
    eveningInsight = await callGemini(prompt, 150);
  } catch {
    eveningInsight = `🌙 Before the market opens tomorrow — check if your MMF yield has moved. The best rate today is ${market.topMMF?.yield ?? 18.2}% and you should be benchmarking against it monthly.`;
  }

  // Today's earnings estimate
  const dailyEarnings = portfolio.totalInvested > 0
    ? portfolio.totalInvested * (portfolio.avgYield / 100) / 365 : 0;

  const msg =
    `🌆 *Evening Wrap-Up*\n` +
    `_${new Date().toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" })}_\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📊 *TODAY'S MARKET CLOSE*\n\n` +
    `🏆 *Best yield available:* *${(market.topMMF?.yield ?? 18.2).toFixed(2)}%* (${market.topMMF?.symbol ?? "Zidi MMF"})\n` +
    `🏦 *T-Bill opportunity:* *${market.tBill91.toFixed(2)}%* avg\n` +
    `🏛️ *IFB1 Bond:* *18.46% net* _(WHT exempt)_\n\n` +
    (portfolio.totalInvested > 0
      ? `━━━━━━━━━━━━━━━━━━\n` +
        `💼 *YOUR DAY IN NUMBERS*\n\n` +
        `📈 *Estimated today's earnings:* ${formatKES(Math.round(dailyEarnings))}\n` +
        `💰 *Portfolio value:* ${formatKES(portfolio.totalInvested)}\n` +
        `🎯 *Yield grade:* ${gradeYield(portfolio.avgYield)}\n\n`
      : ""
    ) +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🌙 *TONIGHT'S ORACLE*\n\n` +
    `${eveningInsight}\n\n` +
    (isPremium
      ? `🔐 *Your Pro digest awaits:*\n${appUrl}/dashboard\n\n`
      : `⚡ _Upgrade to Pro to unlock full daily analytics._\n_Reply *SUBSCRIBE* to get started._\n\n`
    ) +
    `╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌\n` +
    `_Reply *MENU* anytime for quick commands_\n` +
    `_sentill.africa_ 🇰🇪`;

  return msg;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 4: WEEKLY DEEP INTELLIGENCE (Monday 7:30 AM)
// Most detailed — reserve for WEEKLY subscribers
// ─────────────────────────────────────────────────────────────────────────────

export async function buildWeeklyIntelligence(userName: string, userId: string, isPremium: boolean): Promise<string> {
  const [market, portfolio] = await Promise.all([getMarketData(), getPortfolio(userId)]);
  const firstName = userName.split(" ")[0];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentill.africa";
  const weekStr = `Week of ${new Date().toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}`;

  let weeklyAnalysis = "";
  try {
    const prompt = `You are Sentill Oracle — Africa's sharpest AI wealth strategist.
Write a weekly investment intelligence brief for a Kenyan investor named ${firstName}.
${portfolio.totalInvested > 0
    ? `Their portfolio: KES ${portfolio.totalInvested.toLocaleString()} across ${portfolio.topProviders.map((p: any) => p.name).join(", ")} with ${portfolio.avgYield.toFixed(1)}% blended yield.`
    : "No portfolio tracked."}
Current market: ${market.topMMF?.symbol} at ${market.topMMF?.yield}%, 91-Day T-Bill at ${market.tBill91}%, IFB1/2024 at 18.46% tax-free.

Write 3 distinct weekly insights:
1. 📈 ONE trend happening this week in Kenya's capital markets
2. 🎯 ONE specific action item for this week (with exact amounts/instruments)
3. 💡 ONE "did-you-know" alpha edge (lesser-known Kenyan investor strategy)

Each point = 2 sentences. WhatsApp plain text only. No bullet points — use line breaks.`;
    weeklyAnalysis = await callGemini(prompt, 400);
  } catch {
    weeklyAnalysis = `📈 Kenyan MMFs are seeing sustained high yields as CBK holds rates steady — ideal time to ladder positions across 3-month intervals.\n\n🎯 This week's action: If you have idle cash above KES 50,000, split it 60% into the top MMF and 40% into the next 91-Day T-Bill auction happening Monday.\n\n💡 Did you know? Infrastructure Bonds pay you the same rate as other bonds but with ZERO Withholding Tax — effectively giving you a 3.5% tax advantage over regular bonds.`;
  }

  // Full market league table
  const defaultLeague = [
    { symbol: "IFB1/2024 Bond", price: 18.46, note: "tax-free" },
    { symbol: "Zidi MMF", price: 18.2, note: "" },
    { symbol: "Etica Capital MMF (Zidi)", price: 18.20, note: "" },
    { symbol: "364-Day T-Bill", price: 16.42, note: "CBK" },
    { symbol: "91-Day T-Bill", price: 15.78, note: "CBK" },
    { symbol: "CIC MMF", price: 13.6, note: "" },
  ];
  const leagueData = market.allRates.length >= 4 ? market.allRates.slice(0, 6) : defaultLeague;

  let leagueTable = "";
  leagueData.forEach((r: any, i: number) => {
    const rank = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣"][i] ?? `${i+1}.`;
    const note = r.note ? ` _(${r.note})_` : "";
    leagueTable += `${rank} *${r.symbol}* — *${r.price.toFixed(2)}%*${note}\n`;
  });

  const msg =
    `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
    `         *WEEKLY INTELLIGENCE*        \n` +
    `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
    `_${weekStr}_\n\n` +
    `👋 Hey *${firstName}* — here's your advanced\nweekly market intelligence report:\n\n` +
    `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
    `🏆 *WEEKLY YIELD LEAGUE*\n` +
    `_Kenya's top instruments this week:_\n\n` +
    leagueTable + `\n` +
    (portfolio.totalInvested > 0
      ? `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
        `📁 *YOUR PORTFOLIO WEEK*\n\n` +
        `💼 *Holdings:* ${formatKES(portfolio.totalInvested)}\n` +
        `📈 *Blended yield:* *${portfolio.avgYield.toFixed(2)}%* — ${gradeYield(portfolio.avgYield)}\n` +
        `💸 *Weekly earnings:* ~${formatKES(Math.round(portfolio.projectedAnnual / 52))}\n` +
        `🔋 *Annual projection:* ~${formatKES(Math.round(portfolio.projectedAnnual))}\n` +
        `🏦 *Your yield vs savings:* *${yieldDelta(portfolio.avgYield)} alpha*\n\n`
      : `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
        `📁 *PORTFOLIO:* _Nothing tracked yet._\n` +
        `_Add your investments → ${appUrl}/dashboard/assets_\n\n`
    ) +
    `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
    `🧠 *ORACLE WEEKLY ANALYSIS*\n\n` +
    `${weeklyAnalysis}\n\n` +
    `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
    `⚡ *COMMAND CENTER*\n\n` +
    `› Reply *RATES* — Full market table\n` +
    `› Reply *CALC 100000* — Instant projection\n` +
    `› Reply *STOCKS* — NSE Gainers & Losers\n` +
    `› Reply *MENU* — Main options\n\n` +
    (isPremium
      ? `🔐 *Pro Dashboard:* ${appUrl}/dashboard\n\n`
      : `💡 _Upgrade to Pro for unlimited AI + portfolio tracking._\n_Reply *SUBSCRIBE* — KES 490/month._\n\n`
    ) +
    `_S-Tier Institutional Wealth Intelligence_ 🇰🇪\n` +
    `_sentill.africa_`;

  return msg;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 5: INSTANT THRESHOLD ALERT (triggered by market event)
// ─────────────────────────────────────────────────────────────────────────────

export async function buildThresholdAlert(
  userName: string,
  instrument: string,
  currentYield: number,
  userThreshold: number
): Promise<string> {
  const firstName = userName.split(" ")[0];
  const direction = currentYield >= userThreshold ? "crossed your target 🎯" : "dropped below threshold ⚠️";
  const emoji = currentYield >= userThreshold ? "🚨🎯" : "⚠️📉";

  return (
    `${emoji} *SENTILL ALERT — ${firstName}!*\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📊 *${instrument}* has ${direction}\n\n` +
    `🎯 *Your alert level:* *${userThreshold.toFixed(2)}%*\n` +
    `📈 *Current yield:* *${currentYield.toFixed(2)}%*\n` +
    `📊 *Delta:* ${currentYield >= userThreshold ? "+" : ""}${(currentYield - userThreshold).toFixed(2)}%\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `⚡ *Reply *INVEST* to act on this now*\n` +
    `_Or visit sentill.africa/markets_\n\n` +
    `_This is an automated Sentill alert._\n` +
    `_Reply *ALERTS OFF* to pause notifications._`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main dispatcher — picks correct template by type + user prefs
// ─────────────────────────────────────────────────────────────────────────────

export type BriefType = "DAILY_MORNING" | "MIDDAY_PULSE" | "EVENING_WRAP" | "WEEKLY_INTELLIGENCE";

export async function buildBrief(
  type: BriefType,
  userName: string,
  userId: string,
  isPremium = false
): Promise<string> {
  switch (type) {
    case "MIDDAY_PULSE":
      return buildMiddayPulse(userName, userId);
    case "EVENING_WRAP":
      return buildEveningWrap(userName, userId, isPremium);
    case "WEEKLY_INTELLIGENCE":
      return buildWeeklyIntelligence(userName, userId, isPremium);
    default:
      return buildDailyMorningBrief(userName, userId, isPremium);
  }
}

// Legacy compat — used by old cron
export async function buildDailyWhatsAppBrief(userName: string, userId: string): Promise<string> {
  return buildDailyMorningBrief(userName, userId, false);
}
