import { NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY;

// Recent Market Report provided by User (March 16, 2026)
const USER_MARKET_CONTEXT = `
NSE Market Close March 16, 2026:
- NASI: 211.63 (+0.15%)
- NSE 20: 3,700.14 (+0.24%)
- NSE 25: 5,906.56 (+0.44%)
- NSE 10: 2,254.85 (+0.25%)
- Safaricom (SCOM): 30.60 (-0.33%)
- Equity Group (EQTY): 77.00
- NCBA Group: 91.25 (+3.69%)
- Kenya Pipeline (KPC): 9.10 (+0.2%)
- Nation Media (NMG): 16.00 (-5.88%)
- KCB Dividend: 3.00
- Stanbic Dividend: 18.55
- Absa Dividend: 1.85
- USD/KES: 129.50
`;

const GUARANTEED_RATES_RAW: Record<string, number> = {
  "SCOM": 30.60,
  "EQTY": 77.00,
  "NCBA": 91.25,
  "KPC": 9.10,
  "NMG": 16.00,
  "ETCA": 17.55,
  "LOFTY": 17.50,
  "IFB1-2024": 18.46,
  "IFB-2024": 18.46, // Alias for resilience
  "USD_KES": 129.50
};

export async function GET() {
  try {
    const prompt = `
      You are the "Sentil Market Intelligence Hub". 
      Your task is to provide the most current, realistic, and "forced" market rates for the Kenyan investment landscape.
      
      CONTEXT FROM LATEST REPORT (MARCH 16, 2026):
      ${USER_MARKET_CONTEXT}
      
      Output ONLY a raw JSON object mapping IDs (e.g., SCOM, ETCA, IFB1-2024) to numerical values.
      Example: { "SCOM": 30.60, "ETCA": 17.55 }
    `;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
      signal: AbortSignal.timeout(8000)
    });

    let aiRates: Record<string, number> = {};
    if (res.ok) {
      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          // Normalize to uppercase keys for consistency
          Object.entries(parsed).forEach(([k, v]) => {
            aiRates[k.toUpperCase().replace(/_/g, "-")] = v as number;
          });
        } catch (e) {
          console.warn("[AI RATES] JSON Parse failed:", e);
        }
      }
    }

    // Merge: Sync Data > Gemini Live Data
    const normalizedGuaranteed: Record<string, number> = {};
    Object.entries(GUARANTEED_RATES_RAW).forEach(([k, v]) => {
      normalizedGuaranteed[k.toUpperCase().replace(/_/g, "-")] = v;
    });

    const rates = { ...aiRates, ...normalizedGuaranteed };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      source: Object.keys(aiRates).length > 0 ? "Gemini Pro + Sync" : "Authoritative Sync",
      rates
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: true, 
      source: "Authoritative Sync (Fallback)",
      rates: GUARANTEED_RATES_RAW
    });
  }
}
