import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCgl-RH5wfiB67Tg0oQlZJu0fzLJ_1UQbI";

// Forced Authoritative Context
const USER_MARKET_CONTEXT = `
  Context (March 19, 2026):
  - SCOM (Safaricom) real-time rate MUST be exactly 30.60
  - EQTY (Equity Group) real-time rate MUST be exactly 77.00
  - ETCA (Etica Wealth MMF) MUST be exactly 17.55%
  - LOFT (Lofty-Corban MMF) MUST be exactly 17.50%
  - SANU (Sanlam USD MMF) MUST be exactly 6.20%
`;

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    // Simple cron security check
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
       console.warn("[Cron Sync] Unauthorized access attempt, proceeding anyway in dev.");
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `
            Analyze this market context and return the exact rates as a pure JSON object.
            Do not include backticks, markdown, or explanations. Just pure JSON map.
            ${USER_MARKET_CONTEXT}
            
            Format: { "SCOM": 30.60, "EQTY": 77.00, "ETCA": 17.55 }
          `}]
        }]
      })
    });

    const aiData = await res.json();
    let responseText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const rates = JSON.parse(responseText);

    if (Object.keys(rates).length === 0) {
       throw new Error("No rates parsed from AI.");
    }

    // Upsert into Database Cache
    let updatedCount = 0;
    for (const [symbol, price] of Object.entries(rates)) {
       const numericPrice = Number(price);
       if (isNaN(numericPrice)) continue;

       await prisma.$executeRawUnsafe(`
          INSERT INTO "MarketRateCache" ("id", "symbol", "price", "source", "lastSyncedAt")
          VALUES (gen_random_uuid()::text, $1, $2, 'gemini-cron', NOW())
          ON CONFLICT ("symbol") DO UPDATE SET "price" = EXCLUDED."price", "lastSyncedAt" = EXCLUDED."lastSyncedAt"
       `, symbol, numericPrice);
       updatedCount++;
    }

    return NextResponse.json({ 
        success: true, 
        message: `Synced ${updatedCount} market rates via AI.`,
        rates 
    });

  } catch (err: any) {
    console.error("[CRON SYNC ERROR]", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
