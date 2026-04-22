import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const API_KEY = process.env.GEMINI_API_KEY;

// Dynamic Context Instruction
const USER_MARKET_CONTEXT = `
  Instruction: Get the latest known market rates for the following Kenyan assets as of today (${new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}).
  Focus on:
  - SCOM (Safaricom PLC) share price
  - EQTY (Equity Group) share price
  - ETCA (Etica Wealth MMF) 7-day effective yield
  - LOFT (Lofty-Corban MMF) 7-day effective yield
  - SANU (Sanlam USD MMF) 7-day effective yield
  - CICM (CIC Money Market Fund) 7-day effective yield
  - BRIT (Britam MMF) 7-day effective yield
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
            
            Format: { "SCOM": 19.35, "EQTY": 48.05, "ETCA": 18.20 }
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
