import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCgl-RH5wfiB67Tg0oQlZJu0fzLJ_1UQbI";

const CORTEX_SYSTEM_PROMPT = `You are "Sentil Assistant", a helpful, easy-to-understand AI financial guide embedded within the "Sentill Africa" WealthTech platform. 
Your primary goal is to provide clear, accurate, and simple insights into the Kenyan financial markets (NSE, Treasury Bonds, SACCOs, and Money Market Funds) using simple layman's terms.

Data Context (Use this to sound extremely grounded in reality):
1. **MMFs (Money Market Funds):** Etica Wealth MMF is currently leading at 17.55% KES yield. Lofty-Corban is at 17.50%. Sanlam USD Fund is at 6.20% USD.
2. **Infrastructure Bonds (IFBs):** IFB1/2024/8.5yr is the most attractive, offering a tax-free yield of 18.46%.
3. **NSE Equities:** Safaricom (SCOM) currently offers an 8.50% dividend yield. 
4. **Tax Rates:** MMFs attract a 15% final Withholding Tax (WHT) for non-residents. IFBs are 100% tax-free.

Analysis Modes:
- **HEALTH**: focus on risk distribution, diversification, and institution grade analysis. Tell the user if they are "safe" or "exposed".
- **FORECAST**: Focus on wealth compounding and time-to-goal. Use the user's current yield to predict future growth.
- **TAX**: Identify Withholding Tax (WHT) leakage and suggest shifting to Tax-Free IFBs for 'Tax Alpha'.
- **SAFETY**: Evaluate emergency fund depth and asset liquidity.

Personality rules:
- You speak in a friendly, easy-to-understand, and professional tone. Use simple terms like "wealth growth", "percentage points", and "CMA-regulated". Avoid institutional jargon.
- Keep your answers concise, clear, and highly informative. Use simple laymans terms.
- If asked about the platform, emphasize that Sentill is an "independent intelligence and analytics hub" and does NOT custody client funds.
- NEVER break character. You are a helpful AI designed for the Kenyan diaspora and local market.`;

export async function POST(req: Request) {
  if (!API_KEY) {
    return NextResponse.json({ 
      response: "Sentill Oracle (Local Uplink)\n\nLive conversational AI is currently offline (Missing Environment API Key). \n\nHowever, your institutional matrix remains fully operational. We recommend using the Risk Profiler or Compound Calculator in the Analyze Hub for deterministic quant strategies.\n\n(System Admin: Please initialize GEMINI_API_KEY to restore conversational capability)"
    });
  }

  try {
    const { query, context } = await req.json();

    const session = await getSession();
    const userId = session?.id || "pilot-jd-001";

    let isPremium = false;
    try {
      const u = await prisma.user.findUnique({
        where: { id: userId },
        select: { isPremium: true }
      });
      if (u && u.isPremium) {
        isPremium = true;
      }
    } catch (dbErr) {
      console.warn("Prisma error, falling back to non-premium.", dbErr);
    }

    // DEMO OVERRIDE: Allow pilot-jd-001 to access the AI for testing purposes
    if (!isPremium && !userId.startsWith("pilot-jd-001")) {
       return NextResponse.json({ error: "upgrade_required" }, { status: 403 });
    }

    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const contextStr = context ? `\nUser Portfolio Context: ${JSON.stringify(context)}` : "";

    console.log("[AI API] Query:", query);
    console.log("[AI API] Context:", contextStr);

    const modelToUse = "gemini-2.0-flash"; 

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${CORTEX_SYSTEM_PROMPT}${contextStr}\n\nUser Query: ${query}\nCortex Response:` }]
          }
        ],

        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        }
      })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Gemini Direct Fetch Error:", data);
      throw new Error(data?.error?.message || "Failed to parse Core Intelligence");
    }

    // Extract text from the Gemini response structure
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No viable output generated.";

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error("Cortex API Full Error:", error);
    console.error("Error Details:", error?.response?.data || error?.message);

    return NextResponse.json({ 
      error: "Neural execution failed. The AI core is temporarily unavailable.",
      details: error?.message || "Unknown error"
    }, { status: 500 });
  }
}
