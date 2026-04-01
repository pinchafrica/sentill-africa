/**
 * lib/whatsapp-gemini.ts
 * Sentil AI conversational layer for the Sentil WhatsApp bot.
 * 24/7 AI-driven answers to any investment question using Gemini 2.0 Flash.
 * API key loaded from encrypted DB (admin dashboard) → env fallback.
 */

import { getGeminiApiKey } from "./api-keys";

const GEMINI_MODEL = "gemini-flash-latest";

function getGeminiUrl(apiKey: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
}

import { prisma } from "./prisma";

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

async function callGemini(prompt: string): Promise<string> {
  // Robust API key resolution with multiple fallbacks
  let apiKey: string | null = null;
  
  try {
    apiKey = await getGeminiApiKey();
  } catch (keyErr) {
    console.error("[Sentil AI] getGeminiApiKey failed:", keyErr);
  }
  
  // Fallback directly to env var if DB lookup failed
  if (!apiKey) {
    apiKey = process.env.GEMINI_API_KEY ?? null;
    if (apiKey) console.log("[Sentil AI] Using env GEMINI_API_KEY fallback");
  }
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured — add via Admin Dashboard or env");
  }

  const url = getGeminiUrl(apiKey);
  console.log("[Sentil AI] Calling Gemini...", url.substring(0, 80));

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.85,
        topK: 40,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[Sentil AI] Gemini HTTP error:", res.status, err.substring(0, 200));
    throw new Error(`Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    console.error("[Sentil AI] Empty Gemini response:", JSON.stringify(data).substring(0, 200));
    throw new Error("Empty Gemini response");
  }
  return text;
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
You are replying via WhatsApp — give *detailed, comprehensive answers* (up to 500 words). Use plain text.
Use bullet points (•) and bold (*word*) for WhatsApp formatting. No markdown headers (#).
Never mention Gemini, Google, or any AI provider name — you are simply "Sentil AI".
You are available 24 hours a day, 7 days a week to help with any investment question.

User: ${user.name} | Plan: ${user.isPremium ? "Pro" : "Free"}
Current market rates: ${marketCtx}
${user.isPremium ? portfolioCtx : ""}

IMPORTANT RULES:
1. Always be helpful, friendly, and thorough. Give detailed explanations.
2. Include specific numbers, rates, examples, and comparisons when relevant.
3. For investment products, explain: what it is, how it works, current returns, minimum investment, risk level, and who it's best for.
4. If the user greets you casually, respond warmly and offer investment help.
5. If the question is not about investments, politely redirect to finance/investing topics.
6. Always end with: "_Sentil is an information hub — invest directly with your chosen provider._"

Answer this question concisely:`;

  try {
    const text = await callGemini(`${systemPrompt}\n\n${question}`);
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
    return await callGemini(prompt);
  } catch {
    return `${providerName} offers ${currentYield}% p.a. with ${riskLevel.toLowerCase()} risk. Minimum investment: ${minimumInvest ?? "check provider"}.`;
  }
}
