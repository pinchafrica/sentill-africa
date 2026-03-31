/**
 * lib/whatsapp-gemini.ts
 * Sentil AI conversational layer for the Sentil WhatsApp bot.
 * Answers investment questions with user-specific context.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "./prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

interface UserContext {
  name: string;
  userId: string;
  isPremium: boolean;
}

async function getPortfolioContext(userId: string): Promise<string> {
  try {
    const assets = await prisma.portfolioAsset.findMany({
      where: { userId },
      include: { provider: { select: { name: true, type: true } } },
      take: 5,
    });
    if (!assets.length) return "No portfolio tracked yet.";
    const total = assets.reduce((s, a) => s + a.principal, 0);
    const lines = assets.map(
      (a) => `${a.provider.name} (${a.provider.type}): KES ${a.principal.toLocaleString()} @ ${a.projectedYield}%`
    );
    return `Portfolio: KES ${total.toLocaleString()} total\n${lines.join("\n")}`;
  } catch {
    return "Portfolio unavailable.";
  }
}

async function getMarketContext(): Promise<string> {
  try {
    const rates = await prisma.marketRateCache.findMany({
      orderBy: { lastSyncedAt: "desc" },
      take: 6,
    });
    if (!rates.length) return "91-Day T-Bill: ~15.78%, MMFs: ~13-14%";
    return rates.map((r) => `${r.symbol}: ${r.price.toFixed(2)}%`).join(", ");
  } catch {
    return "91-Day T-Bill: ~15.78%, MMFs: ~13-14%";
  }
}

export async function askGeminiBot(
  question: string,
  user: UserContext
): Promise<string> {
  const [portfolioCtx, marketCtx] = await Promise.all([
    getPortfolioContext(user.userId),
    getMarketContext(),
  ]);

  const systemPrompt = `You are Sentil AI, an expert wealth intelligence assistant for Kenyan investors.
You are replying via WhatsApp — keep answers SHORT (max 150 words), plain text, no markdown headers.
Use bullet points (•) and bold (*word*) for WhatsApp formatting.
Never mention Gemini, Google, or any AI provider name — you are simply "Sentil AI".

User: ${user.name} | Plan: ${user.isPremium ? "Pro" : "Free"}
Current market rates: ${marketCtx}
${user.isPremium ? portfolioCtx : ""}

IMPORTANT DISCLAIMER: Always end with: "_Sentil is an information hub — invest directly with your chosen provider._"

Answer this investment question concisely:`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`${systemPrompt}\n\n${question}`);
    const text = result.response.text().trim();
    // Ensure disclaimer is present
    if (!text.includes("information hub")) {
      return text + "\n\n_Sentil is an information hub — invest directly with your chosen provider._";
    }
    return text;
  } catch (err) {
    console.error("[Sentil AI] Error:", err);
    return (
      `🤖 Sentil AI is temporarily unavailable. Try:\n\n` +
      `• *MARKETS* — live rates\n` +
      `• *PORTFOLIO* — your assets\n` +
      `• *INVEST* — browse options\n\n` +
      `_Sentil is an information hub — invest directly with your chosen provider._`
    );
  }
}

export async function generateInvestmentSummary(
  providerName: string,
  providerType: string,
  currentYield: number,
  riskLevel: string,
  minimumInvest: string | null
): Promise<string> {
  const prompt = `In 2 sentences max, explain the investment option for a Kenyan investor via WhatsApp.
Provider: ${providerName} | Type: ${providerType} | Yield: ${currentYield}% | Risk: ${riskLevel} | Min: ${minimumInvest ?? "N/A"}
Be specific, conversational. No markdown. End with one actionable tip.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return `${providerName} offers ${currentYield}% p.a. with ${riskLevel.toLowerCase()} risk. Minimum investment: ${minimumInvest ?? "check provider"}.`;
  }
}
