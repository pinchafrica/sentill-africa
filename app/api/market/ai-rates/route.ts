import { NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY;

// ── Authoritative Kenya Market Data — April 2026 ─────────────────────────────
// These values are ground truth used as base/override for AI outputs.
const AUTHORITATIVE_RATES: Record<string, number> = {
  // Money Market Funds (yields in % p.a.)
  "ZIDI":        18.20,
  "ETCA":        17.55, // Etica Capital MMF
  "LOFTY":       17.50, // Lofty-Corpin MMF
  "CYTONN-MMF":  16.90,
  "NCBA-MMF":    16.20,
  "KCB-MMF":     15.80,
  "BRITAM-MMF":  15.50,
  "SANLAM-MMF":  15.10,
  "CIC-MMF":     13.60,
  "OLDMUT-MMF":  13.40,
  "ABSA-MMF":    13.20,
  // Government Securities
  "IFB1-2024":   18.46, // Infrastructure Bond — WHT exempt
  "IFB2-2023":   17.93,
  "364-TBILL":   16.42,
  "182-TBILL":   15.97,
  "91-TBILL":    15.78,
  "2YR-BOND":    16.80,
  // NSE Stocks (price, KES)
  "SCOM":        30.60,
  "EQTY":        77.00,
  "KCB":         45.50,
  "NCBA":        91.25,
  "COOP":        18.50,
  "ABSA":        16.50,
  // Forex
  "USD-KES":     129.50,
};

// Legacy-compatible aliases (for existing homepage chart code)
const LEGACY_ALIASES: Record<string, string> = {
  "IFB-2024": "IFB1-2024",
  "ETCA":     "ETCA",
  "LOFTY":    "LOFTY",
};

const MARKET_CONTEXT = `
Kenya Investment Market — April 2026:
- CBK base rate: 10.75% (held steady)
- Inflation: ~4.9% (KNBS Feb 2026)
- Top MMF: Zidi at 18.20%, Etica at 17.55%, Lofty at 17.50%
- Best T-Bill: 364-Day at 16.42% (net 13.96% after 15% WHT)
- Best Bond: IFB1/2024 at 18.46% — WHT exempt (tax-free)
- USD/KES: 129.50
- NSE NASI: ~211 level (stable)
- Safaricom: KES 30.60 | Equity Group: KES 77.00 | NCBA: KES 91.25
`;

export async function GET() {
  try {
    let aiRates: Record<string, number> = {};

    if (API_KEY) {
      try {
        const prompt = `You are the Sentill Market Intelligence Hub for Kenya.
Based on this context: ${MARKET_CONTEXT}

Output ONLY a raw JSON object with current market rates. Keys = instrument IDs, values = numbers.
Include: SCOM, EQTY, KCB, NCBA, COOP, ABSA, USD-KES, ZIDI, ETCA, IFB1-2024, 91-TBILL, 364-TBILL
Example format: { "SCOM": 30.60, "ZIDI": 18.20, "IFB1-2024": 18.46 }
Output ONLY JSON, no explanation.`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            signal: AbortSignal.timeout(6000),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[0]);
              Object.entries(parsed).forEach(([k, v]) => {
                aiRates[k.toUpperCase().replace(/_/g, "-")] = v as number;
              });
            } catch {}
          }
        }
      } catch (aiErr) {
        console.warn("[AI RATES] Gemini call failed, using authoritative data:", aiErr);
      }
    }

    // Authoritative data always wins (override any AI hallucination)
    const rates = { ...aiRates, ...AUTHORITATIVE_RATES };

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      source: Object.keys(aiRates).length > 0 ? "Gemini + Authoritative" : "Authoritative",
      rates,
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      source: "Authoritative Fallback",
      rates: AUTHORITATIVE_RATES,
    });
  }
}
