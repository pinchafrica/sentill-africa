/**
 * lib/whatsapp-gemini.ts
 * Sentill Africa — WhatsApp AI engine powered by Gemini 2.0 Flash.
 * 
 * SYSTEM PROMPT v3 — Comprehensive Kenya market expert with:
 *  - Full authoritative dataset for 20+ Kenyan instruments
 *  - Structured WhatsApp output (bold, emoji, ranked tables)
 *  - Category-specific knowledge: MMF, T-Bill, Bond, SACCO, Pension, Unit Trust, Offshore
 *  - Comparison mode, calculation mode, deep-dive mode
 */

import { getGeminiApiKey } from "./api-keys";
import { prisma } from "./prisma";

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";


// ─── Authoritative Kenya Market Data (April 2026) ────────────────────────────
// These are GROUND TRUTH values — AI must use these, not hallucinate.

const KENYA_MARKET_KNOWLEDGE = `
=== KENYA INVESTMENT MARKET — AUTHORITATIVE DATA (April 2026) ===

━━ MONEY MARKET FUNDS (MMFs) ━━
All MMFs are CMA-regulated, T+1 liquidity (withdraw in 1 business day), ideal for liquid savings.

| Fund                         | Yield (p.a.) | Min      | Manager         | Special Note                                        |
|------------------------------|--------------|----------|-----------------|-----------------------------------------------------|
| Etica MMF (Zidi)             | 16–18%       | KES 100  | Etica Capital   | Download the "Zidi" app — T+1 to T+2 withdrawal    |
| Lofty Corpin MMF             | 17.50%       | KES 1000 | Lofty Corpin    | Strong growing boutique fund                        |
| Safaricom Ziidi              | 16.00-17.0%  | KES 100  | Safaricom/M-Pesa| Access via M-Pesa → Financial Services → Ziidi ★   |
| Cytonn Money Market Fund     | 16.90%       | KES 1000 | Cytonn          | Large AUM, stable, long track record                |
| NCBA Money Market Fund       | 16.20%       | KES 1000 | NCBA            | Bank-backed, very low credit risk                   |
| KCB Money Market Fund        | 15.80%       | KES 1000 | KCB             | Bank-backed, M-Pesa/KCB app integration             |
| Britam Money Market Fund     | 15.50%       | KES 1000 | Britam          | Insurance-backed, very stable                       |
| Sanlam Money Market Fund     | 15.10%       | KES 1000 | Sanlam          | Strong institutional management                     |
| Genghis Capital MMF          | 14.20%       | KES 1000 | Genghis Capital | NSE-linked manager                                  |
| CIC Money Market Fund        | 13.60%       | KES 1000 | CIC             | Largest AUM in Kenya — most stable                  |
| Old Mutual Money Market Fund | 13.40%       | KES 1000 | Old Mutual      | Conservative, longest track record                  |
| ABSA Shilling MMF            | 13.20%       | KES 5000 | ABSA            | Bank-backed, global standards                       |
| Stanbic MMF                  | 12.80%       | KES 5000 | Stanbic         | Corporate and institutional focus                   |

Etica Capital Zidi — DETAILED PROFILE (most asked about fund):
- Fund Manager: Etica Capital Limited — CMA-licensed fund manager, Nairobi Kenya
- Regulation: Fully regulated by Capital Markets Authority (CMA) of Kenya
- Safety: Funds held by an independent custodian bank (not by Etica) — protected by law
- Minimum: KES 100 (lowest entry in Kenya's MMF market)
- Yield: 16–18% p.a. gross — historically among Kenya's highest. Accrues DAILY, credited MONTHLY.
- WHT: 15% withheld on interest (standard for Kenyan MMFs)
- Net yield estimate: ~14–15% net after WHT
- Management fee: ~2% p.a. (deducted before yield is shown to you)
- Withdrawal: T+1 to T+2 — processed in 24–48 hours to M-Pesa or bank account
- How to invest: Download the ZIDI APP (Search "Zidi" on Play Store or App Store)
  Steps: 1. Download Zidi app  2. Register with your ID (digital KYC)  3. Top up via M-Pesa  4. Start earning daily
- Contact: +254 706 101 113 | Website: zidi.app or search "Zidi by Etica Capital"
- Best for: Emergency fund, liquid savings, daily accrual, low minimum, mobile-first investors

NOTE: "Zidi" and "Ziidi" are COMPLETELY DIFFERENT products — do not confuse them:
- *Zidi* (by Etica Capital) = A standalone CMA-licensed MMF. Min KES 100. Invest via the Zidi App.
  Yield ~16–18% p.a. Withdrawal in 24–48 hours.
- *Ziidi* (by Safaricom) = Safaricom's M-Pesa investment PLATFORM that gives access to multiple MMFs.
  Access via: M-Pesa → Financial Services → Ziidi → Invest/Save
  Ziidi = Safaricom's M-Pesa investing platform. Access via M-Pesa → Financial Services → Ziidi. Includes MMF investing and NSE stock trading from KES 100.

━━ GOVERNMENT SECURITIES (CBK) ━━
Zero credit risk — backed by the Kenyan government.

| Instrument          | Yield (p.a.) | Tenure     | WHT    | Auction Day  |
|---------------------|--------------|------------|--------|--------------|
| IFB1/2024 Bond      | 18.46%       | 6.5 years  | 0%     | Open tap sale|
| IFB2/2023 Bond      | 17.93%       | 8 years    | 0%     | Secondary mkt|
| 364-Day T-Bill      | 16.42%       | 1 year     | 15%    | Every Monday |
| 182-Day T-Bill      | 15.97%       | 6 months   | 15%    | Every Monday |
| 91-Day T-Bill       | 15.78%       | 3 months   | 15%    | Every Monday |
| 2-Year Bond (FXD)   | 16.80%       | 2 years    | 15%    | Monthly      |

IMPORTANT: Infrastructure Bonds (IFB) have 0% WHT — this is a ~3.5% tax advantage over regular bonds.
Net IFB yield = stated yield. Net T-Bill/Bond yield = yield × 0.85 (after 15% WHT).
Net 364-Day T-Bill: 16.42% × 0.85 = 13.96% effective.
Net IFB1: 18.46% (no deduction — WHT exempt by law).

━━ SACCOS ━━
Member-owned, pay dividends + interest on deposits. Higher yields but less liquid than MMFs.
Withdrawal usually requires notice (30-90 days). Must be a member of the SACCO's bond.

| SACCO                        | Dividend Rate | Min Shares | Sector      |
|------------------------------|---------------|------------|-------------|
| Stima SACCO                  | 14.5%         | KES 2,000  | Energy/Govt |
| Kenya Police SACCO           | 13.8%         | KES 1,000  | Police      |
| Wanandege SACCO              | 13.5%         | KES 2,000  | Aviation    |
| Mwalimu National             | 13.2%         | KES 2,000  | Teachers    |
| Harambee SACCO               | 12.8%         | KES 1,000  | Civil Serv. |
| Tower SACCO                  | 12.5%         | KES 500    | Open        |
| Kenya Commercial Bank SACCO  | 12.0%         | KES 2,000  | Banking     |

━━ UNIT TRUSTS (Equity & Balanced) ━━
Invest in NSE stocks or bonds. Higher growth potential, but value fluctuates.
Regulated by CMA. Ideal for 3–10 year horizons.

| Fund                          | 1-Year Return | Type      | Risk       |
|-------------------------------|---------------|-----------|------------|
| Cytonn High Yield Fund        | 18-20%        | Fixed Inc | Medium     |
| Britam Balanced Fund          | 14-16%        | Balanced  | Medium     |
| Old Mutual Balanced Fund      | 13-15%        | Balanced  | Medium     |
| Sanlam Equity Fund            | 12-18%        | Equity    | High       |
| CIC Equity Fund               | 11-17%        | Equity    | High       |
| Jubilee Equity Fund           | 10-15%        | Equity    | High       |

Note: Unit trust returns vary year to year. Past performance ≠ future returns.

━━ PENSION / RETIREMENT FUNDS ━━
Tax-deductible contributions (up to KES 30,000/month from taxable income).
Long-term wealth building. Withdraw at age 50+ without penalty.

| Scheme                        | Long-term Return | Type           | Min Monthly |
|-------------------------------|------------------|----------------|-------------|
| NSSF Tier 2 (voluntary)       | 9-11%            | Govt Pension   | KES 200     |
| Jubilee Pension Scheme        | 11-13%           | Personal Pension| KES 500    |
| ICEA Lion Retirement Fund     | 11-14%           | Personal Pension| KES 1,000  |
| Britam Pension Fund           | 10-13%           | Personal Pension| KES 500    |
| CIC Pension Plan              | 10-12%           | Personal Pension| KES 500    |

TAX ADVANTAGE: Pension contributions reduce your taxable income by up to KES 30,000/month.
If you're in the 30% tax bracket, KES 30K/month contribution saves you KES 9,000/month in taxes.

━━ OFFSHORE / DOLLAR FUNDS ━━
USD-denominated. Good for hedging against KES depreciation.

| Fund                          | USD Yield  | Currency Risk Note                    |
|-------------------------------|------------|---------------------------------------|
| Cytonn Dollar Money Market    | 5-7%       | USD returns + KES depreciation hedge  |
| Ndovu (ETF-linked)            | 8-15%      | Global ETFs (S&P 500, EM)             |
| Old Mutual International      | 5-8%       | Offshore bond exposure                |

━━ NSE STOCKS — DEEP FUNDAMENTALS (April 2026) ━━
NSE mobile investing platforms launched in 2025-2026 — now millions of Kenyans can buy NSE stocks via mobile apps from KES 100.
Many users are new to stocks and need clear, honest, beginner-friendly advice.

KEY RULE: Always give a clear BUY / HOLD / WATCH signal with ONE sentence reason. Never be vague.

| Symbol | Company                | Price (KES) | P/E  | Div Yield | Signal | Why                                                        |
|--------|------------------------|-------------|------|-----------|--------|------------------------------------------------------------|
| SCOM   | Safaricom PLC          | 30.60       | 14x  | 4.5%      | HOLD   | Ziidi/M-Pesa moat is strong, but growth is slowing. Hold for dividends. |
| EQTY   | Equity Group Holdings  | 77.00       | 6.8x | 5.2%      | BUY    | Pan-African expansion, cheapest P/E for a profitable bank, rising EPS. |
| KCB    | KCB Group PLC          | 45.50       | 5.2x | 6.8%      | BUY    | Highest dividend yield on NSE, trading below book value — deep value. |
| COOP   | Co-operative Bank      | 18.50       | 6.1x | 5.5%      | BUY    | SACCO banking network = sticky deposits, cheap valuation. |
| NCBA   | NCBA Group PLC         | 91.25       | 8.2x | 4.8%      | HOLD   | Post-merger benefits taking time; NIM under pressure. Wait for Q2 results. |
| ABSA   | ABSA Bank Kenya        | 16.50       | 7.4x | 5.1%      | HOLD   | Global parent backstop is reassuring but ROE still improving. |
| EABL   | East African Breweries | 120.00      | 18x  | 3.2%      | WATCH  | Premium P/E but excise tax headwinds — wait for entry below KES 110. |
| BAT    | BAT Kenya              | 420.00      | 9x   | 9.8%      | HOLD   | Highest dividend in KES terms but long-term tobacco risks. Income play only. |
| NMG    | Nation Media Group     | 10.50       | 7x   | 0%        | WATCH  | Turnaround story — wait to confirm profitability trend. |
| KPLC   | Kenya Power            | 3.80        | N/A  | 0%        | WATCH  | Cheap price but governance/debt concerns. Speculative only. |

BEGINNER NSE PORTFOLIO (for KES 5,000–20,000 first-time investors using any NSE broker):
- 40% KCB — highest dividend, deep value, safe blue chip
- 40% EQTY — Africa's best bank, growth + dividends
- 20% SCOM — you use M-Pesa every day, own a piece of it

NSE INVESTMENT PRINCIPLES (always include in stock advice):
- NSE stocks are 3–5 year minimum horizon. NOT for short-term.
- Dividend WHT: 5% (automatically deducted at source)
- Capital Gains Tax (CGT): 5% on gains when you sell
- Settlement: T+3 (3 business days to receive shares)
- Best for: wealth building alongside MMFs (which handle your liquidity)

COMPARISON — STOCKS vs MMFs (most common question):
| Feature          | NSE Stocks          | MMFs (e.g. Zidi)        |
|------------------|---------------------|-------------------------|
| Returns          | 8–25% p.a. (variable) | 13–17% p.a. (stable)  |
| Liquidity        | T+3 to sell         | T+1 to T+2 withdrawal   |
| Risk             | Market risk (can go down) | Very low (CMA regulated) |
| Best for         | 5+ year wealth building | Emergency fund / savings |
ANSWER: For most Kenyans, do BOTH. MMF for your emergency fund (3-6 months expenses), NSE stocks for long-term wealth. Start with MMF, add stocks when you have 6+ months saved.

NSE TRADING PLATFORMS:
- *NSE Mobile Brokers* — Several platforms now allow buying NSE stocks via M-Pesa from KES 100. Min investment varies. ~1.5–2% commission per trade.
- *Genghis Capital* — online broker, full NSE access. Min KES 1,000.
- *NCBA Securities* — bank-linked, good for NCBA customers.
- *AIB-AXYS Africa* — retail-friendly mobile app.
- *Dyer & Blair* — established broker, good for larger amounts.

How to buy NSE stocks via mobile (step by step):
1. Open M-Pesa app
2. Go to Financial Services → Ziidi → Trade Shares
3. Browse available NSE stocks
4. Select stock → enter amount (min KES 100)
5. Choose "USE BEST PRICE" for instant execution
6. Confirm with M-Pesa PIN
7. Shares settle in T+3 (3 business days)
8. Dividends paid directly to M-Pesa wallet

NSE mobile broker limitations to be honest about:
- Only NSE-listed stocks available (no global stocks)
- ~1.8% commission per trade (higher than full brokers)
- No advanced order types (limit orders not available yet)
- No research tools built-in — that's why users need Sentill Africa

━━ KEY FACTS FOR AI RESPONSES ━━
- Kenya's savings account rate: ~4% p.a. (KCB, Equity, Co-op)
- Inflation rate: ~4.9% (Feb 2026, KNBS)
- CBK base rate: 10.75% (held steady)
- Best risk-free yield: IFB1/2024 at 18.46% (tax-free)
- Best liquid yield: Zidi MMF (Etica Capital) ~16–18% p.a. (24–48hr withdrawal)

- MPESA rate: 0% (keep money in MMF, not MPESA wallet)
- USD/KES: ~129.50

━━ INVESTMENT COMPARISON FRAMEWORK ━━
When comparing instruments, always consider:
1. *Yield* — nominal vs effective (after WHT)
2. *Liquidity* — how fast can you access your money?
3. *Risk* — government-backed vs CMA-regulated vs market-linked
4. *Minimum entry* — accessibility for this investor
5. *Tax treatment* — WHT, CGT, pension deductions

━━ QUICK REFERENCE: BEST FOR EACH GOAL ━━
• Emergency fund (access in 1-2 days): → *Etica MMF (Zidi)* at *~17.5%* (download Zidi app)

• Easiest entry (M-Pesa, KES 100 min): → *Safaricom Ziidi* platform
• 3-month savings: → 91-Day T-Bill (*15.78%* gross, *13.41%* net) or Ziidi/Etica MMF
• 1-year savings: → 364-Day T-Bill (*16.42%* gross, *13.96%* net) or Lofty Corpin MMF
• 6+ years, wealth building: → *IFB1/2024 Bond* (*18.46%*, WHT-free — best in Kenya)
• Monthly income stream: → Any MMF (pays daily accrued interest, credited monthly)
• Tax reduction strategy: → Pension fund contributions (save up to *KES 9,000/month* in taxes)
• USD hedge: → Cytonn Dollar Money Market or Ndovu ETFs
• Buy Kenyan stocks (from KES 100): → *NSE mobile broker app* (many accept M-Pesa)
`;

// ─── Context builders ─────────────────────────────────────────────────────────

async function getPortfolioContext(userId: string): Promise<string> {
  if (userId === "guest") return "";
  try {
    const assets = await prisma.portfolioAsset.findMany({
      where: { userId },
      include: { provider: { select: { name: true, type: true } } },
      take: 6,
    });
    if (!assets.length) return "No portfolio tracked yet — user hasn't logged any investments.";
    const total = assets.reduce((s, a) => s + a.principal, 0);
    const avgYield = assets.reduce((s, a) => s + a.projectedYield * a.principal, 0) / total;
    const lines = assets.map(a =>
      `  • ${a.provider.name} (${a.provider.type}): KES ${a.principal.toLocaleString()} @ ${a.projectedYield}% p.a.`
    );
    return `USER PORTFOLIO (tracked on Sentill):\n  Total: KES ${total.toLocaleString()} | Avg yield: ${avgYield.toFixed(1)}%\n${lines.join("\n")}`;
  } catch {
    return "Portfolio data unavailable.";
  }
}

async function getLiveRatesContext(): Promise<string> {
  try {
    const rates = await prisma.marketRateCache.findMany({
      orderBy: { price: "desc" },
      take: 8,
    });
    if (rates.length < 2) return ""; // Fall back to hardcoded if DB is thin
    return "LIVE DB RATES (supplement the hardcoded data above):\n" +
      rates.map(r => `  • ${r.symbol}: ${r.price.toFixed(2)}%`).join("\n");
  } catch {
    return "";
  }
}

// ─── Gemini caller ────────────────────────────────────────────────────────────

async function callGemini(prompt: string, maxTokens = 700): Promise<string> {
  let apiKey: string | null = null;
  try { apiKey = await getGeminiApiKey(); } catch (e) {
    console.error("[Gemini] Key fetch error:", e);
  }
  if (!apiKey) apiKey = process.env.GEMINI_API_KEY ?? null;
  if (!apiKey) throw new Error("No Gemini API key available");

  const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.65,
        topP: 0.88,
        maxOutputTokens: maxTokens,
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error(`[Gemini] HTTP ${res.status} error:`, errBody.slice(0, 500));
    throw new Error(`Gemini HTTP ${res.status}: ${errBody.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    console.error("[Gemini] Empty response. Full data:", JSON.stringify(data).slice(0, 500));
    throw new Error("Empty Gemini response");
  }
  return text;
}

// ─── Smart fallback — answers from hardcoded knowledge base when Gemini is down ─

function getSmartFallback(question: string): string {
  const q = question.toLowerCase();

  // MMF questions
  if (q.includes("mmf") || q.includes("money market") || q.includes("best fund") || q.includes("liquid") || q.includes("chart") || q.includes("graph")) {
    return (
      `🏆 *Best MMFs in Kenya — April 2026*\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `1️⃣ *Etica MMF (Zidi)* — *~17.5%* p.a.\n` +

      `   Min: KES 100 · Via M-Pesa (Zidi app)\n\n` +
      `2️⃣ *Lofty Corpin MMF* — *17.50%* p.a.\n` +
      `   Min: KES 1,000 · Strong boutique fund\n\n` +
      `3️⃣ *Safaricom Ziidi* — *16.0–17.0%* p.a.\n` +
      `   Min: KES 100 · M-Pesa → Ziidi → Invest\n\n` +
      `4️⃣ *Cytonn MMF* — *16.90%* p.a.\n` +
      `   Min: KES 1,000 · Large AUM, stable\n\n` +
      `5️⃣ *CIC Money Market* — *13.60%* p.a.\n` +
      `   Min: KES 1,000 · Kenya's largest MMF\n\n` +
      `💡 All MMFs: T+1 liquidity · CMA regulated · WHT 15%\n` +
      `📊 Send *CHART MMFS* for a visual bar chart!\n` +
      `🧮 Send *CALC 100000* for your personal projection.\n\n` +
      `_ℹ️ Sentill is an intelligence hub — invest directly with your provider._`
    );
  }

  // T-Bill questions
  if (q.includes("t-bill") || q.includes("tbill") || q.includes("treasury bill") || q.includes("dhow") || q.includes("cbk")) {
    return (
      `🏛️ *Kenya Treasury Bills — April 2026*\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `• *91-Day T-Bill* — *15.85%* gross · *13.47%* net\n` +
      `• *182-Day T-Bill* — *16.10%* gross · *13.69%* net\n` +
      `• *364-Day T-Bill* — *16.45%* gross · *13.98%* net\n\n` +
      `🏆 *IFB Bond (IFB1/2024)* — *18.46%* WHT-FREE ✅\n` +
      `   (Infrastructure Bond — tax-free interest!)\n\n` +
      `📋 *How to buy:*\n` +
      `1. Visit dhowcsd.centralbank.go.ke\n` +
      `2. Register with your ID + bank account\n` +
      `3. Minimum: KES 50,000\n` +
      `4. Auction every Monday (CBK)\n\n` +
      `📊 Send *CHART TBILLS* for the yield curve!\n\n` +
      `_ℹ️ Sentill is an intelligence hub — invest directly with your provider._`
    );
  }

  // SACCO questions
  if (q.includes("sacco") || q.includes("dividend") || q.includes("cooperative")) {
    return (
      `🤝 *Top SACCOs Kenya 2026 — Dividend Yields*\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `1️⃣ *Tower SACCO* — *20.0%* dividend\n` +
      `2️⃣ *Police SACCO* — *17.0%* dividend\n` +
      `3️⃣ *Stima SACCO* — *15.0%* dividend\n` +
      `4️⃣ *Wanandege SACCO* — *15.0%* dividend\n` +
      `5️⃣ *Safaricom SACCO* — *13.0%* dividend\n` +
      `6️⃣ *Mwalimu SACCO* — *11.2%* dividend\n\n` +
      `⚠️ *Key facts:*\n` +
      `• Illiquid — 30-90 day withdrawal notice\n` +
      `• Deposits earn stable dividends annually\n` +
      `• Loans available at 12–14% p.a. (member only)\n\n` +
      `📊 Send *CHART SACCOS* for a visual comparison!\n\n` +
      `_ℹ️ Sentill is an intelligence hub — invest directly with your provider._`
    );
  }

  // Comparison questions
  if (q.includes("compare") || q.includes("vs") || q.includes("better") || q.includes("which")) {
    return (
      `📊 *Kenya Investment Yields — Quick Compare*\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `🏆 IFB Bond — *18.46%* WHT-free (best overall)\n` +
      `💰 Etica MMF (Zidi) — *~17.5%* liquid (best MMF)\n` +

      `🏦 Tower SACCO — *20.0%* dividend (illiquid)\n` +
      `📈 364-Day T-Bill — *16.45%* gross / *13.98%* net\n` +
      `🏛️ Fixed Coupon Bond — *14-16%* gross (long-term)\n\n` +
      `💡 *Best picks by goal:*\n` +
      `• Emergency fund → Etica MMF (withdraw in 1 day)\n` +
      `• Wealth building → IFB Bond (tax-free, 6+ yrs)\n` +
      `• Steady dividends → Tower SACCO\n` +
      `• Capital safety → 91-Day T-Bill (CBK backed)\n\n` +
      `📊 Send *CHART COMPARE* for a visual bar chart!\n\n` +
      `_ℹ️ Sentill is an intelligence hub — invest directly with your provider._`
    );
  }

  // Calculation questions
  if (q.includes("calc") || q.includes("how much") || q.includes("project") || q.includes("grow") || q.includes("return") || q.includes("invest")) {
    return (
      `🧮 *Quick Investment Guide*\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `Send *CALC [amount]* for your personal projection!\n\n` +
      `*Example projections (KES 100,000):*\n` +
      `• Etica MMF / Zidi (~17.5%) → KES 117,500/yr gross\n` +

      `• IFB Bond (18.46%) → KES 118,460/yr tax-free ✅\n` +
      `• T-Bill 364d (16.45%) → KES 113,983/yr net\n` +
      `• Tower SACCO (20%) → KES 120,000/yr (illiquid)\n\n` +
      `📊 You'll also get a growth chart image!\n` +
      `Try: *CALC 100000* or *CALC 500000 18.46 10*\n\n` +
      `_ℹ️ Sentill is an intelligence hub — invest directly with your provider._`
    );
  }

  // Generic fallback
  return (
    `🧠 *Sentill Africa — Kenya Investment Intelligence*\n` +
    `━━━━━━━━━━━━━━━━━━\n\n` +
    `🏆 *Top returns right now:*\n` +
    `• IFB Bond — *18.46%* WHT-free\n` +
    `• Etica MMF (Zidi) — *~17.5%* p.a. (download Zidi app)\n` +

    `• Lofty Corpin MMF — *17.50%* liquid\n\n` +
    `📊 *Quick commands:*\n` +
    `• *CHART MMFS* — bar chart of all MMF yields\n` +
    `• *CHART TBILLS* — Kenya yield curve\n` +
    `• *TABLE* — ranked investment table\n` +
    `• *CALC 100000* — your projection + chart\n` +
    `• *RATES* — live market rates\n` +
    `• *INVEST* — browse all funds\n\n` +
    `_ℹ️ Sentill is an intelligence hub — invest directly with your provider._`
  );
}

// ─── Main AI bot ──────────────────────────────────────────────────────────────

interface UserContext {
  name: string;
  userId: string;
  isPremium: boolean;
}

export async function askGeminiBot(question: string, user: UserContext): Promise<string> {
  const [portfolioCtx, liveRates] = await Promise.all([
    getPortfolioContext(user.userId),
    getLiveRatesContext(),
  ]);

  const systemPrompt = `You are *Sentill Africa* — Kenya's sharpest AI wealth intelligence assistant, delivered via WhatsApp.
You are an expert on ALL Kenyan investment instruments. You always give comprehensive, specific, actionable answers.

${KENYA_MARKET_KNOWLEDGE}

${liveRates}
${portfolioCtx ? `\n${portfolioCtx}` : ""}

USER: ${user.name} | Plan: ${user.isPremium ? "Pro ⚡" : "Free (10 AI questions/day)"}

━━ YOUR RESPONSE RULES ━━

FORMAT (WhatsApp-native — ALWAYS follow this):
• Use *bold* for fund names, yields, key numbers e.g. *Etica MMF (Zidi)* — *~17.5%*

• Use emoji section headers: 🏆 📊 💰 🎯 💡 ⚠️ 🔐 ✅
• Use • for bullet points, NEVER markdown headers (#)
• Numbered rankings: 1. 2. 3. with *bold* yields
• Keep paragraphs 2 lines max. WhatsApp users SCROLL FAST.
• NEVER use markdown tables — they break in WhatsApp. Use • bullet lists instead.
• End EVERY response with one line: _ℹ️ Sentill is an intelligence hub — invest directly with your provider._

RESPONSE LENGTH:
• Simple question ("what's the best MMF?") → 5-8 lines MAX. Rank top 3, done.
• Comparison ("CIC vs Cytonn") → 6-10 lines. Side-by-side bullet format.
• How-to question ("how to buy T-Bill") → 6-8 numbered steps, brief each.
• Complex strategy question → max 15 lines, then cut off.
• DO NOT pad with generic advice or disclaimers beyond the closing ℹ️ line.

CONTENT RULES:
1. Always give SPECIFIC numbers. Never be vague. "High yield" alone is not acceptable — say *~17.5%* for Zidi, or the current exact rate you have.

2. For MMF questions → rank top 3 by yield with exact % and KES minimum
3. For T-Bill/Bond questions → always show: gross yield, WHT deducted, net yield
4. For SACCO questions → mention dividend rates AND illiquidity (30-90 day notice)
5. For pension questions → LEAD with the tax saving (KES 9,000/month saved at 30% bracket!)
6. For comparison questions → do side-by-side: yield, liquidity, risk, minimum investment
7. For calculation questions → show real KES: "KES 100K × 18.2% = *KES 18,200/year* = *KES 1,517/month*"
8. For M-Pesa investing questions → explain how to access MMFs and NSE stocks via mobile platforms. Recommend licensed brokers generically.
9. If user has a portfolio → reference their specific holdings and compare to current best
10. NEVER say "I don't have enough data" — you have the most comprehensive Kenya dataset
11. Never mention Gemini, Google, or Claude. You are *Sentill Africa*, period.
12. Non-finance question? Redirect warmly: "I'm built for Kenya investment intelligence! Try asking..."

TONE: Sharp. Direct. Like the best fund manager at a Nairobi investment forum — confident, warm, specific. No corporate fluff.`;

  try {
    const answer = await callGemini(`${systemPrompt}\n\n━━ USER QUESTION ━━\n${question}`);
    if (!answer.includes("Sentill is an intelligence hub")) {
      return answer + "\n\n_ℹ️ Sentill is an intelligence hub — invest directly with your provider._";
    }
    return answer;
  } catch (err) {
    console.error("[Sentill Africa AI] Gemini call failed:", err);
    // Smart fallback — answer from hardcoded knowledge base
    return getSmartFallback(question);
  }
}

// ─── Investment summary (2-line) for provider detail views ────────────────────

export async function generateInvestmentSummary(
  providerName: string,
  providerType: string,
  currentYield: number,
  riskLevel: string,
  minimumInvest: string | null
): Promise<string> {
  const prompt = `You are Sentill Africa, a Kenyan investment expert replying via WhatsApp (2 sentences max).
Explain this investment in a compelling, specific way for a Kenyan investor.
Provider: ${providerName} | Type: ${providerType} | Yield: ${currentYield}% p.a. | Risk: ${riskLevel} | Min: ${minimumInvest ?? "check provider"}
Rules: Use *bold* for key numbers. Start with the yield. End with one specific use case (emergency fund, long-term savings etc). No markdown.`;

  try {
    return await callGemini(prompt, 150);
  } catch {
    return `*${providerName}* offers *${currentYield}% p.a.* with ${riskLevel.toLowerCase()} risk. Minimum investment: ${minimumInvest ?? "check provider"} — suitable for ${currentYield > 16 ? "maximising returns on liquid savings" : "stable, low-risk capital preservation"}.`;
  }
}
