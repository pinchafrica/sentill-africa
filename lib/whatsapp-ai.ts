/**
 * lib/whatsapp-ai.ts
 * Gemini-powered WhatsApp content generators for Sentil.
 * Used by the daily cron to produce personalized investment briefs.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "./prisma";
import { formatKES } from "./whatsapp";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

// ─────────────────────────────────────────────────────────────────────────────
// Daily brief for a single user
// ─────────────────────────────────────────────────────────────────────────────

interface PortfolioSummary {
  totalInvested: number;
  topProviders: string[];
  avgYield: number;
}

async function buildPortfolioSummary(userId: string): Promise<PortfolioSummary> {
  const assets = await prisma.portfolioAsset.findMany({
    where: { userId },
    include: { provider: true },
  });

  if (!assets.length) {
    return { totalInvested: 0, topProviders: [], avgYield: 0 };
  }

  const totalInvested = assets.reduce((s, a) => s + a.principal, 0);
  const avgYield =
    assets.reduce((s, a) => s + a.projectedYield * a.principal, 0) / totalInvested;
  const topProviders = assets
    .sort((a, b) => b.principal - a.principal)
    .slice(0, 3)
    .map((a) => a.provider.name);

  return { totalInvested, topProviders, avgYield };
}

export async function generateDailyBrief(
  userName: string,
  userId: string
): Promise<string> {
  const portfolio = await buildPortfolioSummary(userId);
  const today = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Get top market movers from cache
  const rates = await prisma.marketRateCache.findMany({
    orderBy: { lastSyncedAt: "desc" },
    take: 5,
  });

  const ratesSummary =
    rates.length > 0
      ? rates.map((r) => `${r.symbol}: ${r.price.toFixed(2)}%`).join(", ")
      : "91-Day T-Bill: 15.78%, CIC MMF: 13.4%, NSE 20: +0.3%";

  const prompt = `You are Sentil Oracle, an AI wealth intelligence assistant for Kenyan investors.
Generate a personalized WhatsApp morning brief for ${userName}.

Portfolio data:
- Total invested: KES ${portfolio.totalInvested.toLocaleString()}
- Average yield: ${portfolio.avgYield.toFixed(1)}% p.a.
- Top holdings: ${portfolio.topProviders.join(", ") || "No holdings yet"}
- Market rates today: ${ratesSummary}

Generate a brief (max 5 lines) with:
1. One personalized insight based on their portfolio
2. One actionable recommendation for today
3. Keep it concise and use emoji sparingly

Format: plain text, no markdown headers. Keep under 200 words.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error("[WhatsApp AI] Gemini error:", err);
    return `Your portfolio is earning at ${portfolio.avgYield.toFixed(1)}% p.a. Consider reviewing your allocations on the dashboard today.`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Full daily broadcast message builder
// ─────────────────────────────────────────────────────────────────────────────

export async function buildDailyWhatsAppBrief(
  userName: string,
  userId: string
): Promise<string> {
  const today = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const portfolio = await buildPortfolioSummary(userId);
  const aiInsight = await generateDailyBrief(userName, userId);

  // Market data
  const rates = await prisma.marketRateCache.findMany({
    orderBy: { lastSyncedAt: "desc" },
    take: 3,
  });

  let marketPulse = "";
  if (rates.length > 0) {
    rates.forEach((r) => {
      marketPulse += `• ${r.symbol}: ${r.price.toFixed(2)}%\n`;
    });
  } else {
    marketPulse = `• 91-Day T-Bill: 15.78%\n• CIC MMF: 13.40%\n• Sanlam MMF: 13.10%\n`;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentil.africa";

  const msg =
    `🌅 *Good morning, ${userName.split(" ")[0]}!*\n` +
    `📅 ${today}\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📊 *YOUR PORTFOLIO*\n` +
    `💰 Total Tracked: ${formatKES(portfolio.totalInvested)}\n` +
    `📈 Avg Return: ${portfolio.avgYield.toFixed(1)}% p.a.\n` +
    `_ℹ️ Your money stays with your providers._\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📰 *MARKET PULSE*\n` +
    marketPulse + `\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🧠 *ORACLE INSIGHT*\n` +
    aiInsight + `\n\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🔗 ${appUrl}/dashboard\n` +
    `_Sentil is an intelligence hub, not a fund manager._\n` +
    `_Reply MENU for quick actions_`;

  return msg;
}

// ─────────────────────────────────────────────────────────────────────────────
// Market pulse standalone (for MARKETS command enrichment)
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMarketPulse(): Promise<string> {
  const rates = await prisma.marketRateCache.findMany({
    orderBy: { price: "desc" },
    take: 5,
  });

  const rateText = rates.length
    ? rates.map((r) => `${r.symbol}: ${r.price.toFixed(2)}%`).join(", ")
    : "T-Bills ~15.78%, MMFs ~13.4%";

  const prompt = `Summarize current Kenyan investment market in 3 bullet points.
Market data: ${rateText}
Focus: MMFs, T-Bills, NSE. Be concise. Use emoji. Max 60 words total.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return "Markets are performing steadily today. T-Bills leading at ~15.78% with MMFs close behind.";
  }
}
