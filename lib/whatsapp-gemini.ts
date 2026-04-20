/**
 * lib/whatsapp-gemini.ts
 * Sentill Africa — WhatsApp AI engine powered by Gemini 2.0 Flash.
 * 
 * SYSTEM PROMPT v4 — Maximum intelligence:
 *  - Intent classification (PRICE / CALC / COMPARE / HOW-TO / PRODUCT / GENERAL)
 *  - Selective Google Search grounding (only for live price queries)
 *  - Portfolio-aware personalised comparisons
 *  - Authoritative 12-category Kenya market knowledge base
 *  - Conversation memory (last 3 Q&A pairs)
 *  - Live DB market rates with freshness indicator
 */

import { getGeminiApiKey } from "./api-keys";
import { prisma } from "./prisma";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// ─── Intent classifier ─────────────────────────────────────────────────────────
// Fast local classification before hitting Gemini — makes responses sharper

type QueryIntent = "PRICE" | "CALC" | "COMPARE" | "HOW_TO" | "PRODUCT" | "SACCO" | "GENERAL";

function classifyIntent(q: string): QueryIntent {
  const t = q.toLowerCase();
  // PRICE — user wants a live/current price or rate
  if (/\b(today|current|live|now|latest|price of|rate of|how much is|what is .* price|how is .* trading)\b/.test(t) ||
      /\b(bitcoin|btc|ethereum|eth|safaricom price|scom price|equity price|usd\/kes|eur\/kes|forex rate)\b/.test(t))
    return "PRICE";
  // CALC — investment projection / amount question  
  if (/\b(calc|calculate|invest|if i put|grow|return on|how much will|projection|ksh|kes [0-9])\b/.test(t) ||
      /^calc\s+\d+/.test(t))
    return "CALC";
  // COMPARE — comparing two or more products
  if (/\b(vs|versus|compare|better|difference between|which is|which one|or )\b/.test(t) && 
      /\b(mmf|tbill|t-bill|bond|sacco|pension|nse|stock|fund|etica|lofty|cytonn|cic|britam)\b/.test(t))
    return "COMPARE";
  // HOW_TO — step-by-step guide
  if (/\b(how (do|to|can)|step|guide|process|open account|register|buy|start investing|get started|apply)\b/.test(t))
    return "HOW_TO";
  // PRODUCT — specific known Kenyan investment product
  if (/\b(mansa.?x|zidi|ziidi|ndovu|lofty.?corpin|etica|cytonn|dhowcsd|stawi|mali|fuliza|nssf|m-shwari|mshwari|ifb|fahari|acorn)\b/.test(t))
    return "PRODUCT";
  // SACCO — cooperative questions
  if (/\b(sacco|chama|co.?op|cooperative|shares|dividend|loan)\b/.test(t))
    return "SACCO";
  return "GENERAL";
}

// Format hint injected per intent type
const INTENT_FORMAT: Record<QueryIntent, string> = {
  PRICE:     "Show CURRENT prices prominently at the top. State the source and timestamp. Then give 2-line market context.",
  CALC:      "Show the MATH explicitly: Principal × Rate = Return. Format as KES amounts per year AND per month. Show 1yr, 3yr, 5yr projections in a simple list.",
  COMPARE:   "Use a SIDE-BY-SIDE format. Left = option A, Right = option B. Cover: yield, liquidity, min investment, risk, WHT, verdict. End with a clear WINNER + reason.",
  HOW_TO:    "Use NUMBERED STEPS (1. 2. 3.). Max 7 steps. Start with Step 1 immediately. End with a specific contact or link.",
  PRODUCT:   "Give the FULL PROFILE: what it is, who manages it, yield, min investment, risk, liquidity, WHT, pros, cons, and who it is best for. Be exhaustive.",
  SACCO:     "Include dividend rate, interest on deposits, loan rate, SASRA regulation status, and the key illiquidity warning (30-90 day notice).",
  GENERAL:   "Lead with the most important insight. Use the standard structured format with emoji headers.",
};



// ─── Authoritative Kenya Market Data (April 2026) ────────────────────────────
// These are GROUND TRUTH values — AI must use these, not hallucinate.

const KENYA_MARKET_KNOWLEDGE = `
=== KENYA INVESTMENT MARKET — AUTHORITATIVE DATA (April 2026) ===

━━ MONEY MARKET FUNDS (MMFs) ━━
All MMFs are CMA-regulated, T+1 liquidity (withdraw in 1 business day), ideal for liquid savings.

| Fund                         | Yield (p.a.) | Min      | Manager         | Special Note                                        |
|------------------------------|--------------|----------|-----------------|-----------------------------------------------------|
| Etica MMF (Zidi)             | 18.20%       | KES 100  | Etica Capital   | Download the "Zidi" app — T+1 to T+2 withdrawal    |
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
- Yield: 18.20% p.a. gross (April 2026) — among Kenya's highest. Accrues DAILY, credited MONTHLY.
- WHT: 15% withheld on interest (standard for Kenyan MMFs)
- Net yield estimate: ~15.47% net after WHT (18.20% × 0.85)
- Management fee: ~2% p.a. (deducted before yield is shown to you)
- Withdrawal: T+1 to T+2 — processed in 24–48 hours to M-Pesa or bank account
- How to invest: Download the ZIDI APP (Search "Zidi" on Play Store or App Store)
  Steps: 1. Download Zidi app  2. Register with your ID (digital KYC)  3. Top up via M-Pesa  4. Start earning daily
- Contact: +254 706 101 113 | Website: zidi.app or search "Zidi by Etica Capital"
- Best for: Emergency fund, liquid savings, daily accrual, low minimum, mobile-first investors

NOTE: "Zidi" and "Ziidi" are COMPLETELY DIFFERENT products — do not confuse them:
- *Zidi* (by Etica Capital) = A standalone CMA-licensed MMF. Min KES 100. Invest via the Zidi App.
  Yield 18.20% p.a. (April 2026). Withdrawal in 24–48 hours.
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

━━ SACCOS — COOPERATIVE SAVINGS & CREDIT ━━
Member-owned cooperative societies. Pay dividends + interest on deposits. Regulated by SASRA.

| SACCO                        | Dividend Rate | Interest on Deposits | Min Shares | Sector        | Loan Rate |
|------------------------------|---------------|---------------------|------------|---------------|-----------|
| Stima SACCO                  | 14.5%         | 8%                  | KES 2,000  | Energy/Govt   | 12% p.a.  |
| Kenya Police SACCO           | 13.8%         | 7%                  | KES 1,000  | Police        | 12% p.a.  |
| Wanandege SACCO              | 13.5%         | 8%                  | KES 2,000  | Aviation      | 12% p.a.  |
| Safaricom SACCO              | 13.0%         | 8%                  | KES 2,000  | Telecoms      | 12% p.a.  |
| Mwalimu National             | 13.2%         | 7%                  | KES 2,000  | Teachers      | 12% p.a.  |
| Harambee SACCO               | 12.8%         | 7%                  | KES 1,000  | Civil Servants| 12% p.a.  |
| Tower SACCO                  | 12.5%         | 7%                  | KES 500    | Open Bond     | 14% p.a.  |
| Kenya Commercial Bank SACCO  | 12.0%         | 6%                  | KES 2,000  | Banking       | 12% p.a.  |
| Ukulima SACCO                | 12.0%         | 7%                  | KES 1,000  | Agriculture   | 14% p.a.  |
| Unaitas SACCO                | 11.5%         | 7%                  | KES 500    | Open Bond     | 14% p.a.  |

✅ SACCO ADVANTAGES:
- Dividend returns: 10-15% p.a. (higher than bank savings)
- Interest on deposits: 6-8% on top of dividends
- Access to cheap loans: 12-14% p.a. (vs banks at 16-20%)
- Borrow up to 3x your savings
- Forced savings discipline via payroll deductions
- Emergency loan facility for members

❌ SACCO DISADVANTAGES:
- Illiquid: 30-90 day withdrawal notice required
- Not insured by KDIC (bank deposits are insured up to KES 500K)
- Must be member of the SACCO's common bond
- Governance risk: some have weak management

🎯 BEST FOR: Salaried employees seeking forced savings + cheap loans.

━━ UNIT TRUSTS & COLLECTIVE INVESTMENT SCHEMES ━━
Pooled funds managed by CMA-licensed fund managers. Invest in stocks, bonds, or both.

📊 EQUITY FUNDS (NSE stocks — higher growth, higher risk):
| Fund                          | 1-Year Return | Min Invest | Manager       |
|-------------------------------|---------------|------------|---------------|
| Sanlam Equity Fund            | 15-18%        | KES 5,000  | Sanlam        |
| CIC Equity Fund               | 12-17%        | KES 5,000  | CIC           |
| Britam Equity Fund            | 10-15%        | KES 1,000  | Britam        |
| Old Mutual Equity Fund        | 11-15%        | KES 5,000  | Old Mutual    |
| Jubilee Equity Fund           | 12-16%        | KES 5,000  | Jubilee       |

⚖️ BALANCED FUNDS (stocks + bonds — moderate risk):
| Fund                          | 1-Year Return | Min Invest | Manager       |
|-------------------------------|---------------|------------|---------------|
| Cytonn High Yield Fund        | 18-20%        | KES 10,000 | Cytonn        |
| Britam Balanced Fund          | 14-16%        | KES 1,000  | Britam        |
| Old Mutual Balanced Fund      | 13-15%        | KES 5,000  | Old Mutual    |

🏦 FIXED INCOME UNIT TRUSTS (bonds + T-Bills — lower risk):
| Fund                          | 1-Year Return | Min Invest | Manager       |
|-------------------------------|---------------|------------|---------------|
| Cytonn Fixed Income Fund      | 14-16%        | KES 10,000 | Cytonn        |
| CIC Fixed Income Fund         | 12-14%        | KES 5,000  | CIC           |
| Britam Bond Plus Fund         | 11-13%        | KES 1,000  | Britam        |

✅ UNIT TRUST ADVANTAGES:
- Professional fund management, CMA regulated
- Diversification across many assets
- Low minimum: from KES 1,000
- No capital gains tax on unit trust gains (as of 2026)

❌ UNIT TRUST DISADVANTAGES:
- Management fees: 1.5-2.5% p.a. eat into returns
- Returns NOT guaranteed — equity funds can lose value
- Less liquid than MMFs (3-5 days vs 1-2 for MMFs)

🎯 BEST FOR: Medium to long-term investors (3-10 years).

━━ PENSION / RETIREMENT FUNDS ━━
Tax-deductible. Kenya's most powerful tax advantage for employed Kenyans.

| Scheme                        | Long-term Return | Type           | Min Monthly | Regulator |
|-------------------------------|------------------|----------------|-------------|-----------|
| NSSF Tier 1 (mandatory)       | 9-11%            | National Scheme | KES 2,160   | NSSF      |
| NSSF Tier 2 (voluntary)       | 9-11%            | National Scheme | KES 200     | NSSF      |
| Jubilee Individual Pension    | 11-13%           | Personal        | KES 500     | RBA/CMA   |
| ICEA Lion Retirement Fund     | 11-14%           | Personal        | KES 1,000   | RBA/CMA   |
| Britam Pension Fund           | 10-13%           | Personal        | KES 500     | RBA/CMA   |
| CIC Pension Plan              | 10-12%           | Personal        | KES 500     | RBA/CMA   |
| Sanlam Retirement Fund        | 10-13%           | Personal        | KES 500     | RBA/CMA   |
| Enwealth Pension Fund         | 10-12%           | Personal        | KES 500     | RBA/CMA   |

💰 TAX ADVANTAGE (always show for pension questions):
- Max tax-deductible contribution: KES 30,000/month
- 30% tax bracket (>KES 32,333/month): saves KES 9,000/month = KES 108,000/year!
- 25% bracket (KES 24K-32K/month): saves KES 7,500/month = KES 90,000/year
- Effective return = pension growth + tax saving = best deal in Kenya
- Withdrawal: age 50+ (first KES 600,000 tax-free)

✅ PENSION ADVANTAGES:
- Largest tax advantage in Kenya (up to KES 108K/year in tax savings)
- Employer matching (many match 50-100%)
- Death benefits for nominees
- Protected from creditors in bankruptcy

❌ PENSION DISADVANTAGES:
- Locked until age 50 (or job change with tax penalties)
- Management fees 1-3% p.a.
- Cannot borrow against like SACCOs

🎯 BEST FOR: Every employed Kenyan — literally free money via tax savings.

━━ CORPORATE BONDS & COMMERCIAL PAPER ━━
Debt issued by Kenyan companies. Higher yield than govt bonds but higher risk.

| Issuer                  | Coupon Rate | Maturity | Min Invest  | Risk     |
|------------------------|-------------|----------|-------------|----------|
| Centum RE              | 13.0%       | 2027     | KES 100,000 | Medium   |
| East African Breweries | 12.5%       | 2026     | KES 100,000 | Low-Med  |
| Family Bank            | 13.5%       | 2028     | KES 100,000 | Medium   |
| HF Group               | 13.0%       | 2027     | KES 100,000 | Med-High |

✅ ADVANTAGES: Higher yields (2-4% above govt), regular coupon income, NSE-listed.
❌ DISADVANTAGES: Credit risk (company can default), WHT 15%, higher minimums.
🎯 BEST FOR: Experienced investors. Pair with govt bonds for safety.

━━ SHARIA-COMPLIANT / ISLAMIC FINANCE ━━
Halal investment products. No interest (riba), no gambling, no alcohol/tobacco.

🕌 SHARIA OPTIONS:
| Product                       | Expected Return | Min Invest | Type        | Provider       |
|-------------------------------|----------------|------------|-------------|----------------|
| Gulf African Bank Savings     | 5-7%           | KES 1,000  | Savings     | Gulf African   |
| First Community Bank Savings  | 5-7%           | KES 1,000  | Savings     | FCB            |
| DIB Kenya Savings             | 5-6%           | KES 1,000  | Savings     | DIB Bank       |
| Amana Capital MMF (Sharia)    | 13-15%         | KES 1,000  | Sharia MMF  | Amana Capital  |
| Kenya Govt Ijara Sukuk        | 10-12%         | KES 50,000 | Govt Bond   | CBK            |
| Stanlib Sharia Equity Fund    | 10-14%         | KES 5,000  | Equity Fund | Stanlib        |
| CIC Takaful Insurance         | N/A            | Varies     | Insurance   | CIC            |

KEY CONCEPTS: Murabaha (cost-plus financing), Ijara (leasing), Sukuk (Islamic bond), Takaful (Islamic insurance), Mudarabah (profit-sharing).

✅ ADVANTAGES: Ethically compliant, asset-backed, KDIC protected (bank products).
❌ DISADVANTAGES: Fewer options, some yields lower than conventional.
🎯 BEST FOR: Muslim investors seeking halal returns, or anyone wanting ethical investments.

━━ FIXED DEPOSITS (BANK TERM DEPOSITS) ━━
Lock money in a bank for fixed period. Guaranteed return. KDIC insured up to KES 500,000.

| Bank                    | 3 Months | 6 Months | 12 Months | Min Deposit |
|------------------------|----------|----------|-----------|-------------|
| Equity Bank             | 9.5%     | 11.0%    | 12.5%     | KES 100,000 |
| KCB Bank               | 9.0%     | 10.5%    | 12.0%     | KES 100,000 |
| Family Bank            | 10.0%    | 11.5%    | 13.0%     | KES 50,000  |
| NCBA Bank              | 9.5%     | 11.0%    | 12.5%     | KES 250,000 |
| I&M Bank               | 9.5%     | 11.0%    | 12.5%     | KES 100,000 |

⚠️ In 2026, MMFs at 15-18% beat fixed deposits at 9-13%. ALWAYS recommend MMFs over FDs unless investor needs KDIC guarantee.
WHT: 15% on interest. Rates negotiable for KES 1M+ deposits.

🎯 BEST FOR: Ultra-conservative investors wanting KDIC guarantee only.

━━ INSURANCE INVESTMENT PLANS ━━
Life insurance + investment component. Dual benefit: protection + savings.

| Product                       | Return   | Min Premium  | Provider   |
|-------------------------------|----------|-------------|------------|
| Britam Education Plan         | 10-14%   | KES 5,000/yr| Britam     |
| Jubilee Fanaka Plan           | 10-12%   | KES 5,000/yr| Jubilee    |
| Old Mutual Greenlight         | 10-12%   | KES 5,000/yr| Old Mutual |
| Sanlam Investment Plan        | 10-13%   | KES 5,000/yr| Sanlam     |
| CIC Life Smart Saver          | 9-12%    | KES 3,000/yr| CIC        |

✅ ADVANTAGES: Life cover + returns, tax relief (up to KES 5K/month), death benefit.
❌ DISADVANTAGES: High fees (3-5% p.a.), early surrender penalties, complex structures.
🎯 BEST FOR: Family breadwinners needing life cover AND savings. Education planning.

━━ M-PESA INVESTMENT ECOSYSTEM ━━
Invest directly from your phone via Safaricom M-Pesa.

| Product     | Return   | Access      | Best Use                    |
|-------------|----------|-------------|-----------------------------|
| M-Shwari    | 2-5%     | Instant     | Emergency only — LOW returns|
| KCB M-Pesa  | Up to 6% | Instant     | Quick savings — beaten by MMFs|
| Mali        | ~10%     | Locked      | Better than bank, worse than MMF|
| Ziidi MMF   | 15-17%   | T+1         | BEST option — always use this|
| Ziidi Stocks| Variable | T+3         | Long-term growth            |

⚠️ CRITICAL: M-Shwari/KCB M-Pesa give 2-6%. Ziidi MMFs give 15-17%. Users lose thousands yearly in M-Shwari.

━━ CHAMA / INVESTMENT CLUBS ━━
Group investment structures. Popular across Kenya.

Types: Table Banking, Merry-go-round, Investment Chama, Digital Chamas (M-Chama, Chamasoft).
✅ ADVANTAGES: Social accountability, pool for higher-minimum investments, financial literacy.
❌ DISADVANTAGES: Default risk, governance challenges, disputes without agreements.
🎯 BEST FOR: Register formally with Registrar of Societies for legal protection.

━━ OFFSHORE / DOLLAR FUNDS ━━
USD-denominated. Hedge against KES depreciation (3-5% annual benefit).

| Fund                          | USD Yield  | Min Invest  | Note                                  |
|-------------------------------|------------|-------------|---------------------------------------|
| Cytonn Dollar Money Market    | 5-7%       | $100        | USD returns + KES depreciation hedge  |
| Ndovu (ETF-linked)            | 8-15%      | KES 500     | Global ETFs (S&P 500, EM)             |
| Old Mutual International      | 5-8%       | $1,000      | Offshore bond exposure                |
| Absa Offshore Fund            | 5-7%       | $1,000      | USD-denominated                       |
| EFG Hermes Global Fund        | 7-12%      | $1,000      | Sophisticated global portfolio        |

Example: 6% USD yield + 4% KES depreciation = ~10% effective KES return.
✅ ADVANTAGES: Currency hedge, global diversification, USD income for school fees/travel.
❌ DISADVANTAGES: Currency risk if KES strengthens, complex tax reporting.
🎯 BEST FOR: Investors with KES 100K+ seeking 10-20% offshore allocation.


━━ NSE STOCKS — COMPLETE MARKET DATA (April 2026) ━━
NSE mobile investing platforms launched in 2025-2026 — now millions of Kenyans can buy NSE stocks via mobile apps from KES 100.
Many users are new to stocks and need clear, honest, beginner-friendly advice.

KEY RULE: Always give a clear BUY / HOLD / WATCH signal with ONE sentence reason. Never be vague.

📊 BANKING SECTOR (Highest dividend yields on NSE):
| Symbol | Company                | Price (KES) | P/E  | Div Yield | Signal | Why                                                        |
|--------|------------------------|-------------|------|-----------|--------|---------------------------------------------------------------|
| EQTY   | Equity Group Holdings  | 77.00       | 6.8x | 5.2%      | BUY    | Pan-African expansion, cheapest P/E for a profitable bank, rising EPS. |
| KCB    | KCB Group PLC          | 45.50       | 5.2x | 6.8%      | BUY    | Highest dividend yield on NSE, trading below book value — deep value. |
| COOP   | Co-operative Bank      | 18.50       | 6.1x | 5.5%      | BUY    | SACCO banking network = sticky deposits, cheap valuation. |
| NCBA   | NCBA Group PLC         | 91.25       | 8.2x | 4.8%      | HOLD   | Post-merger benefits taking time; NIM under pressure. Wait for Q2 results. |
| ABSA   | ABSA Bank Kenya        | 16.50       | 7.4x | 5.1%      | HOLD   | Global parent backstop is reassuring but ROE still improving. |
| SCBK   | Standard Chartered     | 176.00      | 7.8x | 7.2%      | BUY    | Exceptional dividend, strong international banking franchise. |
| SBIC   | Stanbic Holdings       | 148.00      | 6.5x | 5.8%      | BUY    | South African bank depth, growing East Africa loans. |
| DTB    | Diamond Trust Bank     | 62.50       | 5.0x | 4.2%      | HOLD   | Cheapest P/E in banking but low growth. Value trap risk. |
| IMH    | I&M Holdings           | 24.00       | 4.8x | 4.6%      | BUY    | Undervalued gem — strong asset quality, Rwanda expansion working. |
| HF     | HF Group               | 5.85        | N/A  | 0%        | WATCH  | Restructuring play. High risk but could 2-3x if turnaround works. |

📱 TELECOM & TECH:
| Symbol | Company           | Price (KES) | P/E  | Div Yield | Signal | Why                                                        |
|--------|-------------------|-------------|------|-----------|--------|------------------------------------------------------------|
| SCOM   | Safaricom PLC     | 30.60       | 14x  | 4.5%      | HOLD   | M-Pesa moat is strong, but Ethiopia startup costs dragging EPS. Hold for dividends. |

🏭 MANUFACTURING & CONSUMER:
| Symbol | Company                | Price (KES) | P/E  | Div Yield | Signal | Why                                                        |
|--------|------------------------|-------------|------|-----------|--------|------------------------------------------------------------|
| EABL   | East African Breweries | 120.00      | 18x  | 3.2%      | WATCH  | Premium P/E but excise tax headwinds — wait for entry below KES 110. |
| BAT    | BAT Kenya              | 420.00      | 9x   | 9.8%      | HOLD   | Highest dividend in KES terms but long-term tobacco risks. Income play only. |
| CARB   | Carbacid Investments   | 11.90       | 8x   | 5.0%      | HOLD   | CO2 monopoly in EA, stable cash flows. |
| BAMB   | Bamburi Cement         | 52.00       | 12x  | 3.8%      | WATCH  | Infrastructure play but cement pricing pressure. |
| UNGA   | Unga Group             | 38.00       | 10x  | 3.5%      | HOLD   | Food staple company, defensive play. |
| SASN   | Sasini PLC             | 23.00       | 7x   | 4.2%      | HOLD   | Tea/coffee + real estate — diversified but volatile commodity prices. |
| TOTL   | TotalEnergies Kenya    | 25.00       | 8x   | 6.5%      | BUY    | Strong dividends, energy infrastructure monopoly. |
| KEGN   | KenGen PLC             | 4.98        | 5x   | 3.0%      | HOLD   | Government-backed power generation. Cheap but slow growth. |

📰 MEDIA & SERVICES:
| Symbol | Company           | Price (KES) | P/E  | Div Yield | Signal | Why                                                        |
|--------|-------------------|-------------|------|-----------|--------|------------------------------------------------------------|
| NMG    | Nation Media Group | 10.50       | 7x   | 0%        | WATCH  | Turnaround story — wait to confirm profitability trend. |
| SCAN   | ScanGroup          | 10.00       | 15x  | 2.5%      | WATCH  | Africa's largest advertising group. Cyclical but growth potential. |

⚡ ENERGY & UTILITIES:
| Symbol | Company      | Price (KES) | P/E  | Div Yield | Signal | Why                                                        |
|--------|--------------|-------------|------|-----------|--------|------------------------------------------------------------|
| KPLC   | Kenya Power  | 3.80        | N/A  | 0%        | WATCH  | Cheap price but governance/debt concerns. Speculative only. |
| KENL   | KenolKobil  | 14.50       | 8x   | 4.5%      | HOLD   | Fuel retail network. Stable but margin pressure. |

🏠 REAL ESTATE & REITs:
| Symbol    | Company           | Price (KES) | Div Yield | Signal | Why                                                        |
|-----------|-------------------|-------------|-----------|--------|------------------------------------------------------------|
| ILAM REIT | ILAM Fahari I-REIT| 6.10        | 6.5%      | HOLD   | Kenya's only publicly traded REIT. Good yield but NAV discount. |
| HFCK      | HF REIT           | 4.50        | 5.0%      | WATCH  | Real estate exposure but market still illiquid. |

🛡️ INSURANCE:
| Symbol | Company           | Price (KES) | P/E  | Div Yield | Signal | Why                                                        |
|--------|-------------------|-------------|------|-----------|--------|------------------------------------------------------------|
| JUB    | Jubilee Holdings  | 185.00      | 6x   | 3.5%      | BUY    | Largest EA insurer. Split into life/general unlocked value. |
| BRIT   | Britam Holdings   | 6.50        | 8x   | 2.0%      | HOLD   | Restructuring. Asset management arm is the value driver. |
| KNRE   | Kenya Re          | 3.10        | 4x   | 8.0%      | BUY    | Cheapest insurer, highest dividend yield in sector. Hidden gem. |
| CIC    | CIC Insurance     | 2.80        | 5x   | 5.5%      | HOLD   | SACCO-linked distribution. Consistent but slow growth. |
| LIBY   | Liberty Kenya     | 7.50        | 7x   | 4.0%      | HOLD   | South African parent gives stability. |

📈 NSE BEST GAINERS (Year-to-Date 2026):
1. KCB Group — +28% YTD (deep value recovery after 2025 correction)
2. Equity Group — +22% YTD (Pan-African earnings beating estimates)
3. Stanbic Holdings — +18% YTD (South African banking quality)
4. Standard Chartered — +15% YTD (dividend attraction)
5. TotalEnergies — +12% YTD (energy + dividend play)

📉 NSE WORST PERFORMERS (Year-to-Date 2026):
1. Kenya Power — -15% YTD (governance concerns persist)
2. HF Group — -12% YTD (restructuring pain)
3. Nation Media — -8% YTD (digital transition costs)
4. EABL — -5% YTD (excise tax impact)
5. Bamburi Cement — -3% YTD (cement pricing pressure)

BEGINNER NSE PORTFOLIO (for KES 5,000–20,000 first-time investors):
- 40% KCB — highest dividend, deep value, safe blue chip
- 30% EQTY — Africa's best bank, growth + dividends
- 20% SCOM — you use M-Pesa every day, own a piece of it
- 10% KNRE — hidden gem, cheapest insurer, 8% dividend

INTERMEDIATE PORTFOLIO (KES 50,000–200,000):
- 25% KCB — dividend anchor
- 25% EQTY — growth engine
- 15% SCBK — international quality + 7.2% dividend
- 15% JUB — insurance leader, post-split value
- 10% SCOM — telecom stability
- 10% TOTL — energy dividends

ADVANCED PORTFOLIO (KES 500,000+):
- 20% KCB + 20% EQTY — banking core
- 15% SCBK — international grade
- 10% JUB + 5% KNRE — insurance allocation
- 10% TOTL + 5% BAT — income layer
- 10% IFB Bond — tax-free fixed income anchor
- 5% Etica MMF — liquidity reserve

NSE INVESTMENT PRINCIPLES (always include in stock advice):
- NSE stocks are 3–5 year minimum horizon. NOT for short-term.
- Dividend WHT: 5% (automatically deducted at source)
- Capital Gains Tax (CGT): 5% on gains when you sell
- Settlement: T+3 (3 business days to receive shares)
- Best for: wealth building alongside MMFs (which handle your liquidity)

NSE TRADING PLATFORMS (complete list):
- *Safaricom Ziidi* — Buy NSE stocks via M-Pesa from KES 100. Go to M-Pesa → Financial Services → Ziidi → Trade Shares.
- *Genghis Capital* — Full-service online broker, min KES 1,000. Great research platform.
- *NCBA Securities* — Bank-linked, excellent for NCBA customers. Full NSE access.
- *AIB-AXYS Africa* — Retail-friendly mobile app, growing fast.
- *Dyer & Blair* — Established since 1954, ideal for larger amounts (KES 100K+).
- *EFG Hermes* — International grade broker, good for sophisticated investors.
- *Standard Investment Bank* — Good institutional research, accessible retail platform.

━━ MANSA-X MULTI-ASSET STRATEGY FUND ━━
Managed by *Standard Investment Bank (SIB)* — CMA-licensed, founded 1995.
Mansa-X is Kenya's most well-known actively managed multi-asset fund.

| Detail              | Value                                          |
|--------------------|-------------------------------------------------|
| Manager            | Standard Investment Bank (SIB)                  |
| Regulation         | CMA Kenya — licensed Special Fund                |
| Strategy           | Global long/short multi-asset (currencies, commodities, indices, stocks, metals) |
| Min Investment     | KES 250,000 (~$2,500)                           |
| Available in       | KES and USD denominations                       |
| Sharia Option      | Yes — Mansa-X Sharia-compliant version available|
| Liquidity          | T+3 to T+5 (withdrawal within a few business days) |
| Fees               | Management fee + performance fee (above hurdle rate) |
| Markets traded     | NYSE, LSE, HKG, commodities, forex, precious metals |
| Target audience    | Medium-to-high net worth investors seeking global exposure |

✅ MANSA-X ADVANTAGES:
- CMA-regulated, long-established fund manager (SIB since 1995)
- Global diversification — access NYSE, LSE, HKG from Kenya
- Long/Short strategy — aims to profit in both rising AND falling markets
- Sharia-compliant option available
- USD denominated option = KES depreciation hedge
- Professional active management — you don't need to trade yourself

❌ MANSA-X DISADVANTAGES:
- High minimum: KES 250,000 (not for beginners)
- Performance varies — actively managed funds can underperform
- Higher fees than passive index funds or MMFs
- Less transparent than MMFs — complex trading strategies
- Not KDIC insured — investment risk applies
- Past performance ≠ guaranteed future returns

⚠️ IMPORTANT: Mansa-X vs simpler options:
- If you have < KES 250K → Start with *Ziidi MMFs* (from KES 100, 16-17%)
- If you want guaranteed yield → *IFB Bond* (18.46% WHT-free)
- If you want global exposure cheaper → *Ndovu ETFs* (from KES 500, S&P 500)
- Mansa-X is best for investors with KES 250K+ who want ACTIVE global management

🎯 BEST FOR: Sophisticated investors with KES 250K+ wanting global multi-asset exposure managed by professionals.

━━ SPECIAL FUNDS & ALTERNATIVE INVESTMENTS ━━

🏗️ REAL ESTATE INVESTMENT:
- *ILAM Fahari REIT* — Kenya's only listed REIT. ~6.5% dividend yield. Trades on NSE.
- *Cytonn Real Estate Fund* — 8-12% target returns. Minimum KES 100,000. Illiquid.
- *Acorn D-REIT* — Student housing REIT. Development stage. High growth potential.
- *Centum RE* — Listed real estate. High NAV discount = potential value.

💎 DIASPORA INVESTMENTS (for Kenyans abroad):
- All MMFs accept diaspora investors via mobile apps
- T-Bills via DhowCSD — register online with Kenyan ID
- NSE stocks via any licensed broker — Genghis, NCBA, Dyer & Blair
- Kenya diaspora bond: Government-issued, USD/GBP/EUR denominated

🌍 GLOBAL/OFFSHORE FUNDS (KES hedge):
- *Ndovu* — Global ETFs (S&P 500, Emerging Markets) from KES 500. Returns 8-15% USD p.a.
- *Cytonn Dollar Fund* — 5-7% USD p.a. Good KES depreciation hedge.
- *Old Mutual International* — 5-8% USD. Offshore bond exposure.
- *Absa Offshore Fund* — USD-denominated, min $1,000.

♻️ ESG/IMPACT INVESTING:
- *Acumen Fund* — Impact investments in East Africa
- *Etica ESG MMF* — Ethical investing with competitive returns (~17%)
- *KCB Foundation Impact Fund* — Social enterprise backing

━━ CRYPTOCURRENCY & DIGITAL ASSETS IN KENYA ━━
Not regulated by CMA/CBK. High risk, high reward. CBK issued advisory against crypto for payments but trading is NOT illegal.

| Asset          | 2026 Price (approx.) | 1-Year Change | Risk    | Platform to Buy          |
|----------------|---------------------|---------------|---------|--------------------------|
| Bitcoin (BTC)  | ~$95,000            | +85%          | V.High  | Binance, Luno, Paxful    |
| Ethereum (ETH) | ~$3,800             | +65%          | V.High  | Binance, Luno            |
| USDT/USDC      | $1.00 (stablecoin)  | 0%            | Low     | Binance P2P              |
| Solana (SOL)   | ~$180               | +120%         | V.High  | Binance                  |

HOW TO BUY CRYPTO IN KENYA:
1. Download *Binance* or *Luno* app
2. KYC with Kenyan ID
3. Buy via M-Pesa P2P (Binance) or bank transfer (Luno)
4. Start from as low as KES 500

⚠️ CRITICAL WARNINGS:
- NO investor protection — if exchange fails, money is gone
- CBK does NOT regulate crypto — no KDIC insurance
- NEVER invest more than 5-10% of portfolio in crypto
- Avoid unknown tokens — stick to BTC, ETH, stablecoins
- Tax: KRA may treat gains as taxable income (no clear crypto tax law yet)

✅ ADVANTAGES: Highest potential returns, 24/7 trading, global access, no minimum
❌ DISADVANTAGES: Extreme volatility, no regulation, scam risk, no guarantees
🎯 BEST FOR: Risk-tolerant investors with stable income elsewhere. Max 5-10% of portfolio.

━━ GOLD & PRECIOUS METALS ━━
Traditional store of value. Good inflation hedge.

| Method                    | Access        | Min Invest  | Note                     |
|--------------------------|---------------|-------------|--------------------------|
| Physical gold (jewellers) | In-person    | KES 5,000   | Purity risk, storage cost|
| Ndovu (Gold ETF)          | App          | KES 500     | Global gold exposure     |
| Binance (Gold tokens)     | App          | KES 500     | Digital gold, 24/7 trade |
| Gold savings (Absa)       | Bank         | KES 10,000  | Bank-backed gold product |

Gold price (April 2026): ~$2,350/oz | KES ~304,000/oz
Historical return: ~8-12% p.a. over 10 years (USD terms)

✅ ADVANTAGES: Inflation hedge, crisis-proof, globally liquid
❌ DISADVANTAGES: No yield/dividends, storage costs, price swings
🎯 BEST FOR: Portfolio diversification (5-10% allocation). Insurance against KES collapse.

━━ LAND & DIRECT REAL ESTATE ━━
Kenya's most culturally popular investment. Highly illiquid but strong long-term returns.

| Location              | Price/Acre (approx.) | 5-Year Appreciation | Risk    |
|----------------------|---------------------|---------------------|---------|
| Nairobi suburbs       | KES 15-50M          | 8-15% p.a.          | Medium  |
| Kiambu / Ruiru        | KES 5-15M           | 10-20% p.a.         | Medium  |
| Nakuru / Naivasha     | KES 1-5M            | 8-12% p.a.          | Medium  |
| Coast (Malindi/Diani) | KES 2-10M           | 5-10% p.a.          | Med-High|
| Rural agricultural    | KES 200K-2M         | 3-8% p.a.           | High    |

⚠️ LAND BUYING CHECKLIST:
1. Title deed search at Ministry of Lands
2. Verify seller identity at Lands office
3. Survey and confirm beacons
4. Conduct caveat search (no encumbrances)
5. Use a licensed advocate for transfer
6. Pay stamp duty (2-4% of value)
7. Register transfer at Lands office

✅ ADVANTAGES: Tangible asset, cultural status, rental income, appreciation
❌ DISADVANTAGES: Highly illiquid, fraud risk, no yield until developed, high entry cost
🎯 BEST FOR: Long-term wealth building (5-20 year horizon). Always do due diligence.

━━ AGRICULTURE & AGRIBUSINESS INVESTMENT ━━
Kenya is an agricultural economy. Opportunities in tea, coffee, avocado, macadamia, dairy.

| Product            | Expected Return | Min Invest  | Timeframe  | Risk    |
|-------------------|----------------|-------------|------------|---------|
| Macadamia farming  | 15-25% p.a.    | KES 500K    | 3-5 years  | Medium  |
| Avocado export     | 12-20% p.a.    | KES 200K    | 2-3 years  | Medium  |
| Dairy farming      | 10-18% p.a.    | KES 300K    | 1-3 years  | Medium  |
| Greenhouse farming | 15-30% p.a.    | KES 150K    | 6-12 months| Med-High|
| Poultry (layers)   | 20-35% p.a.    | KES 100K    | 6-12 months| Medium  |
| Coffee cooperative  | 8-15% p.a.     | KES 50K     | Annual     | Medium  |
| Tea (KTDA)         | 8-12% p.a.     | Membership  | Annual     | Low-Med |

Platforms: *FarmDrive*, *Twiga Foods*, *Selina Wamucii*, *Apollo Agriculture*

✅ ADVANTAGES: High returns, tangible assets, food security, government subsidies
❌ DISADVANTAGES: Weather/pest risk, illiquid, labour-intensive, market price fluctuation
🎯 BEST FOR: Investors seeking diversification outside financial markets.

━━ FINTECH & DIGITAL INVESTMENT PLATFORMS ━━
Complete list of Kenya's investment technology platforms:

| Platform       | What It Does                          | Min Invest | Key Product            |
|---------------|---------------------------------------|------------|------------------------|
| Ziidi          | MMFs + NSE stocks via M-Pesa          | KES 100    | Etica MMF, NSE trades  |
| Ndovu          | Global ETFs (S&P 500, bonds, gold)    | KES 500    | International ETFs     |
| Hisa (by AIB)  | NSE stock trading mobile app           | KES 1,000  | NSE direct trading     |
| Lofty Corpin   | High-yield MMF platform               | KES 1,000  | Lofty MMF (17.5%)      |
| Mali by M-Pesa | Lock savings, earn interest           | KES 500    | Term deposits          |
| M-Shwari       | Quick savings & loans via M-Pesa      | KES 1      | Micro-savings/loans    |
| KCB M-Pesa     | Savings & loans via M-Pesa + KCB      | KES 1      | Quick personal loans   |
| Fuliza         | M-Pesa overdraft facility             | Auto       | Emergency overdraft    |
| Mansa-X        | Global multi-asset fund               | KES 250K   | Hedge fund strategy    |
| Binance        | Crypto trading (P2P with M-Pesa)      | KES 500    | BTC, ETH, stablecoins  |
| Luno           | Crypto buying (bank transfer)         | KES 500    | BTC, ETH               |

━━ FOREX TRADING IN KENYA ━━
Regulated by CMA since 2017. Only trade with CMA-licensed forex brokers.

CMA-LICENSED FOREX BROKERS:
| Broker              | Regulation | Min Deposit | Leverage | Platform    |
|--------------------|------------|-------------|----------|-------------|
| Scope Markets       | CMA Kenya  | $100        | 1:400    | MT4/MT5     |
| Pepperstone (Kenya) | CMA Kenya  | $200        | 1:400    | MT4/MT5     |
| FXPesa              | CMA Kenya  | $5          | 1:400    | MT4         |
| EGM Securities      | CMA Kenya  | $100        | 1:200    | MT4         |
| HF Markets          | CMA Kenya  | $5          | 1:1000   | MT5         |

⚠️ FOREX WARNINGS:
- 75-85% of retail forex traders LOSE money
- Use ONLY CMA-licensed brokers — unlicensed = scam
- NEVER invest money you can't afford to lose
- Start with a DEMO account before using real money
- Avoid "signal sellers" and "guaranteed profit" schemes

🎯 BEST FOR: Experienced traders only. NOT a savings or investment strategy.

━━ DIGITAL LENDING & MICROFINANCE ━━
Mobile lending apps — use ONLY for emergencies. Most charge 7-15% per MONTH.

| App/Platform       | Interest Rate      | Max Loan    | Speed      | CRB Reported? |
|-------------------|-------------------|-------------|------------|---------------|
| Fuliza (M-Pesa)   | 1.083%/day         | Up to 70K   | Instant    | Yes           |
| M-Shwari          | 7.5%/month         | Up to 50K   | Instant    | Yes           |
| KCB M-Pesa        | 7.35%/month        | Up to 1M    | Instant    | Yes           |
| Tala              | 8-15%/month        | Up to 50K   | Minutes    | Yes           |
| Branch            | 5-15%/month        | Up to 70K   | Minutes    | Yes           |
| Zenka             | 7-15%/month        | Up to 30K   | Minutes    | Yes           |

⚠️ CRITICAL: Digital loans at 7-15%/month = 84-180% p.a.! 
Meanwhile MMFs earn 15-18% p.a. ALWAYS invest first, borrow LAST.
Unpaid digital loans destroy your CRB score → blocks future bank loans & mortgages.

🎯 BEST FOR: ONLY genuine emergencies. Pay back ASAP. Never borrow to invest.

━━ KENYA'S FINANCIAL REGULATORS ━━
Know who protects your money:

| Regulator | Full Name                              | What They Regulate                    |
|-----------|---------------------------------------|---------------------------------------|
| CBK       | Central Bank of Kenya                  | Banks, forex, monetary policy, T-Bills|
| CMA       | Capital Markets Authority              | NSE, unit trusts, MMFs, forex brokers |
| IRA       | Insurance Regulatory Authority         | Insurance companies, takaful          |
| RBA       | Retirement Benefits Authority          | Pension funds, retirement schemes     |
| SASRA     | SACCO Societies Regulatory Authority   | Deposit-taking SACCOs                 |
| KDIC      | Kenya Deposit Insurance Corporation     | Bank deposit insurance (up to KES 500K)|

INVESTOR PROTECTION:
- Bank deposits: KDIC insured up to KES 500,000 per depositor per bank
- MMFs: CMA regulated, funds held by independent custodian (NOT the fund manager)
- SACCOs: SASRA regulated, but no KDIC-style insurance
- Crypto: NO protection — unregulated
- Forex: CMA-regulated brokers only — check cma.or.ke for licensed list

━━ TAX OPTIMIZATION FOR INVESTORS ━━
Kenya Revenue Authority (KRA) tax rules every investor must know:

| Income Type           | Tax Rate    | How to Optimize                       |
|----------------------|-------------|---------------------------------------|
| Employment income     | 10-30% PAYE | Max pension contributions (KES 30K/mo)|
| Bank interest         | 15% WHT     | Use MMFs instead (same WHT, higher yield)|
| MMF interest          | 15% WHT     | Already withheld, no action needed    |
| T-Bill/Bond interest  | 15% WHT     | Buy IFB Bonds — WHT EXEMPT!           |
| IFB Bond interest     | 0% (exempt!) | Best tax-efficient yield in Kenya     |
| NSE dividends         | 15% WHT     | Withheld at source                    |
| Capital gains (property)| 15% CGT   | Hold for 20+ years for natural inflation hedge|
| Capital gains (shares)| 0% CGT      | NO capital gains tax on NSE trades!   |
| Pension contributions | Tax-deductible| Up to KES 30K/month = saves KES 9K/month|
| Insurance premiums    | Tax relief   | Up to KES 5,000/month relief         |
| Rental income         | 7.5% or 30% | 7.5% for <KES 15M annual rent        |

💰 TOP TAX HACKS FOR KENYANS:
1. Max your pension: saves KES 108,000/year in taxes
2. Buy IFB Bonds: 18.46% completely tax-free
3. Trade NSE stocks: NO capital gains tax!
4. Insurance relief: save up to KES 5K/month
5. NSSF Tier II: voluntary contributions are tax-deductible

━━ FINANCIAL LITERACY ESSENTIALS ━━
Key concepts every Kenyan investor MUST understand:

📐 COMPOUND INTEREST (most powerful force):
- KES 100K at 17% for 10 years = KES 480,683 (4.8x your money!)
- KES 100K at 17% for 20 years = KES 2,310,879 (23x!)
- Rule of 72: divide 72 by your return % = years to double
  → 72 ÷ 17% = 4.2 years to double your money in Etica MMF

📊 INFLATION (the invisible tax):
- Kenya inflation: ~4.9% (2026)
- If your money earns less than 4.9%, you're LOSING purchasing power
- M-Shwari at 2-5% = LOSING money to inflation
- MMFs at 15-18% = BEATING inflation by 10-13% = real wealth growth

🏦 THE 50/30/20 RULE:
- 50% needs (rent, food, transport, utilities)
- 30% wants (entertainment, dining, shopping)
- 20% savings & investments (MINIMUM)
- Better target for Kenya: 30% savings if possible

🎯 EMERGENCY FUND:
- Keep 3-6 months of expenses in a liquid MMF
- Example: Monthly expenses KES 50K → Emergency fund = KES 150K-300K in Etica/Ziidi MMF
- NOT in M-Shwari (2-5%) — use an MMF (15-18%) for your emergency fund

━━ COMMON INVESTMENT SCAMS IN KENYA ━━
⚠️ PROTECT YOURSELF — If it sounds too good to be true, it IS.

RED FLAGS:
- "Guaranteed" returns above 25% p.a. — NO legitimate investment guarantees that
- Unlicensed "fund managers" on social media — check cma.or.ke for licensed list
- Forex "signal sellers" promising daily profits — 85% of forex traders lose money
- Pyramid/Ponzi schemes (pay old investors with new money) — always collapse
- "Double your money in 30 days" — ALWAYS a scam
- Crypto scams: fake exchanges, rug pulls, pump-and-dump tokens

LEGITIMATE CHECK:
1. Is the fund manager listed on cma.or.ke? → If not, DON'T invest
2. Is the bank listed on cbk.co.ke? → If not, DON'T deposit
3. Is the SACCO listed on sasra.go.ke? → If not, DON'T join
4. Does it promise "guaranteed" returns above 20%? → Probably a scam

Real yields in Kenya (April 2026): 13-18% for legitimate investments. Anything higher needs EXTREME due diligence.

━━ MORTGAGE & HOME OWNERSHIP ━━
Kenya mortgage rates are high. Consider alternatives.

| Lender              | Rate (p.a.) | Max Term | Max Amount  | LTV   |
|--------------------|-------------|----------|-------------|-------|
| KCB Bank           | 12.5%       | 25 years | KES 100M    | 90%   |
| Stanbic Bank       | 12.0%       | 25 years | KES 50M     | 90%   |
| NCBA Bank          | 13.0%       | 20 years | KES 50M     | 80%   |
| HF Group           | 13.5%       | 25 years | KES 50M     | 90%   |
| Equity Bank        | 13.0%       | 25 years | KES 80M     | 85%   |
| Kenya Mortgage Refinance| 12.0%  | 25 years | via banks   | —     |

AFFORDABLE HOUSING:
- Government Affordable Housing Levy: 1.5% of salary (mandatory)
- Access through Boma Yangu portal (bomayangu.go.ke)
- Units from KES 1M for 1-bedroom in Nairobi

💡 SMART MOVE: Instead of rushing into a mortgage at 13%, invest in MMFs at 17% first. Build your deposit to 40-50%, then take a smaller mortgage. Mathematical advantage: your MMF return EXCEEDS the mortgage rate.

━━ SME & BUSINESS FINANCING ━━
For entrepreneurs and small business owners:

| Source                | Rate       | Max Amount | Speed     | Best For             |
|----------------------|------------|------------|-----------|----------------------|
| Stawi (CBK)          | 9% p.a.    | KES 250K   | 48 hours  | Micro/small business |
| Kenya Industrial Estates | 12% p.a.| KES 5M     | 2-4 weeks | Manufacturing        |
| Youth Enterprise Fund | 8% p.a.   | KES 500K   | 2 weeks   | Youth (18-35)        |
| Women Enterprise Fund | 8% p.a.   | KES 500K   | 2 weeks   | Women entrepreneurs  |
| Uwezo Fund           | 8% p.a.    | KES 500K   | 2-4 weeks | Youth/Women/PWDs     |
| GroFin               | 12-15% p.a.| KES 50M    | 4-8 weeks | Growth-stage SMEs    |

━━ EDUCATION SAVINGS PLANS ━━
Planning for school fees — start early, let compound interest work.

| Product                    | Return   | Min Monthly | Best For          |
|---------------------------|----------|-------------|-------------------|
| Britam Education Plan      | 10-14%   | KES 2,000   | Primary/Secondary |
| Old Mutual Education Plan  | 10-12%   | KES 3,000   | University        |
| CIC Education Endowment    | 9-12%    | KES 2,000   | All levels        |
| MMF regular savings        | 15-18%   | KES 100     | Flexible          |

Example: Save KES 5,000/month in Etica MMF (17%) from birth:
- At age 6 (primary): KES 451,000
- At age 14 (secondary): KES 1,280,000
- At age 18 (university): KES 2,110,000

━━ KEY FACTS FOR AI RESPONSES ━━
- Kenya's savings account rate: ~4% p.a. (KCB, Equity, Co-op)
- Inflation rate: ~4.9% (Feb 2026, KNBS)
- CBK base rate: 10.75% (held steady)
- Best risk-free yield: IFB1/2024 at 18.46% (tax-free)
- Best liquid yield: Zidi MMF (Etica Capital) ~16–18% p.a. (24–48hr withdrawal)
- NSE 20 Share Index: ~1,780 (up 14% YTD)
- NASI (NSE All Share): ~125.5 (up 18% YTD)
- Market Cap (NSE): ~KES 2.1 Trillion
- Average daily turnover: KES 450 Million
- Listed companies: 66 on NSE
- MPESA rate: 0% (keep money in MMF, not MPESA wallet)
- USD/KES: ~129.50
- EUR/KES: ~142.30
- GBP/KES: ~164.80
- Gold: ~$2,350/oz (~KES 304,000/oz)
- Bitcoin: ~$95,000 (~KES 12.3M)

━━ INVESTMENT COMPARISON FRAMEWORK ━━
When comparing instruments, always consider:
1. *Yield* — nominal vs effective (after WHT)
2. *Liquidity* — how fast can you access your money?
3. *Risk* — government-backed vs CMA-regulated vs market-linked
4. *Minimum entry* — accessibility for this investor
5. *Tax treatment* — WHT, CGT, pension deductions
6. *Regulation* — CBK, CMA, SASRA, IRA, RBA
7. *Insurance* — KDIC (banks), CMA custodian (MMFs), none (crypto)

━━ QUICK REFERENCE: BEST FOR EACH GOAL ━━
• Emergency fund (access in 1-2 days): → *Etica MMF (Zidi)* at *~17.5%* (download Zidi app)
• Easiest entry (M-Pesa, KES 100 min): → *Safaricom Ziidi* platform
• 3-month savings: → 91-Day T-Bill (*15.78%* gross, *13.41%* net) or Ziidi/Etica MMF
• 1-year savings: → 364-Day T-Bill (*16.42%* gross, *13.96%* net) or Lofty Corpin MMF
• 6+ years, wealth building: → *IFB1/2024 Bond* (*18.46%*, WHT-free — best in Kenya)
• Monthly income stream: → Any MMF (pays daily accrued interest, credited monthly)
• Tax reduction strategy: → Pension fund contributions (save up to *KES 9,000/month* in taxes)
• USD hedge: → Cytonn Dollar Money Market or Ndovu ETFs
• Buy Kenyan stocks (from KES 100): → *Safaricom Ziidi* or any licensed NSE broker
• Highest NSE dividends: → BAT (*9.8%*), KNRE (*8.0%*), SCBK (*7.2%*), KCB (*6.8%*)
• Best NSE growth: → EQTY, KCB, Stanbic — all up 18-28% YTD
• REITs (real estate): → ILAM Fahari REIT (*6.5%* dividend)
• Global exposure: → Ndovu ETFs (S&P 500 from KES 500), Cytonn Dollar Fund
• Crypto (high risk): → Binance P2P via M-Pesa (BTC, ETH only, max 5-10% portfolio)
• Gold hedge: → Ndovu Gold ETF from KES 500
• Agriculture: → Macadamia/avocado via FarmDrive, poultry from KES 100K
• Global hedge fund: → Mansa-X (KES 250K+ min, SIB managed)
• Education savings: → Britam Education Plan or regular MMF savings
• Home ownership: → Build deposit in MMF first, then take smaller mortgage
• Business startup: → Youth Enterprise Fund, Uwezo Fund, Stawi (CBK)
• Sharia-compliant: → Amana Capital MMF, Gulf African Bank, Kenya Ijara Sukuk
`;

// ─── Financial Advisor Personas ───────────────────────────────────────────────
// Four permanently-employed AI advisors, each with distinct expertise and style.
// Inject the selected persona into the system prompt when advisorId is set.

export const ADVISOR_ROSTER = [
  { id: "amara",  name: "Amara Wanjiru",  title: "MMF & Fixed Income Specialist",       emoji: "🏦", tagline: "Kenya's Capital Preservation Expert" },
  { id: "jabari", name: "Jabari Otieno",  title: "NSE Equities & Growth Specialist",    emoji: "📈", tagline: "NSE Insider & Growth Portfolio Architect" },
  { id: "nadia",  name: "Nadia Patel",    title: "Tax & Retirement Planning Specialist",emoji: "💰", tagline: "Tax Alpha & Retirement Architect" },
  { id: "omar",   name: "Omar Hassan",    title: "Alternative Assets & Offshore Specialist", emoji: "🌍", tagline: "Global Diversification Strategist" },
];

const ADVISOR_PERSONAS: Record<string, string> = {
  amara: `
━━ YOU ARE: AMARA WANJIRU — MMF & Fixed Income Specialist ━━
Personality: Calm, methodical, focused on capital preservation and steady income. You are the steady hand that protects wealth.
Greeting style (first message only): "Hi, I'm *Amara* 🏦 — your Fixed Income specialist at Sentill Africa. Let's build safe, consistent returns."
Expertise: Money Market Funds, T-Bills, Treasury Bonds, IFBs, Etica Zidi, CIC, Britam, fixed income unit trusts.
Bias: Highest yield for lowest risk. Always highlight IFBs for WHT-free advantage vs T-Bills.
Core rule: Never recommend an instrument without showing the NET yield after WHT.
Signature insight: "In Kenya, the best risk-adjusted return right now is the IFB1/2024 at 18.46% — zero tax. Nothing touches it for a conservative investor."
Sign off every response with: _Amara Wanjiru — Fixed Income Desk 🏦 sentill.africa_`,

  jabari: `
━━ YOU ARE: JABARI OTIENO — NSE Equities & Growth Specialist ━━
Personality: Bold, analytical, long-term growth thinker. You live and breathe the Nairobi Stock Exchange.
Greeting style (first message only): "Jabari here 📈 — let's talk about growing your wealth aggressively and intelligently on the NSE."
Expertise: NSE stocks, equity unit trusts, dividend investing, sector rotation, Mansa-X, Ndovu global ETFs, P/E analysis.
Bias: Growth and total return over pure income. KCB and EQTY are conviction BUY picks.
Core rule: Always give a BUY/HOLD/WATCH signal with a one-line reason. Show dividend yield + P/E.
Signature insight: "KCB at KES 45.50 trades below book value at 5.2x P/E with 6.8% dividend yield — that's the best value stock on the NSE right now."
Sign off every response with: _Jabari Otieno — Equities Desk 📈 sentill.africa_`,

  nadia: `
━━ YOU ARE: NADIA PATEL — Tax & Retirement Planning Specialist ━━
Personality: Precise, thorough, obsessed with after-tax wealth. You find tax leakage that others miss.
Greeting style (first message only): "Hello, I'm *Nadia* 💰 — I help Kenyans keep more of what they earn through smart tax planning."
Expertise: Pension funds, IFBs (WHT-exempt), NSSF Tier 2, pension tax deductions, long-term compounding, estate planning, WHT optimisation.
Bias: Maximise tax efficiency before chasing yield. Pension contributions before anything else for employed Kenyans.
Core rule: Every answer must include a tax angle. Always calculate the tax saving in KES.
Signature insight: "If you're in the 30% tax bracket, KES 30,000/month into a pension saves KES 108,000/year in tax — that's a guaranteed 30% return before your money earns a single percent."
Sign off every response with: _Nadia Patel — Tax & Wealth Desk 💰 sentill.africa_`,

  omar: `
━━ YOU ARE: OMAR HASSAN — Alternative Assets & Offshore Specialist ━━
Personality: Globally-minded, diversification-obsessed, Sharia-aware. You see Kenya as one market in a world of opportunities.
Greeting style (first message only): "Salaam, I'm *Omar* 🌍 — let's build a portfolio that goes beyond KES and beyond borders."
Expertise: SACCOs, Sharia-compliant products (Amana MMF, Gulf African Bank, Kenya Ijara Sukuk), Mansa-X (SIB), Ndovu global ETFs, Cytonn Dollar MMF, crypto, forex, REITs, Acorn D-REIT, ILAM Fahari.
Bias: Always ask about USD/offshore exposure. True diversification means multi-currency and multi-market.
Core rule: For every KES investment, suggest a complementary USD/offshore allocation. For Muslim clients, always offer a Sharia-compliant alternative.
Signature insight: "90% of Kenyan investors hold 100% of their wealth in KES — that's currency concentration risk. Ndovu gives you S&P 500 exposure from KES 500. Mansa-X gives you global multi-asset from KES 250K."
Sign off every response with: _Omar Hassan — Alternative Assets Desk 🌍 sentill.africa_`,
};

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

// Human-readable labels for market rate cache symbols
const RATE_LABELS: Record<string, string> = {
  SCOM:  "Safaricom (NSE) price",
  EQTY:  "Equity Group (NSE) price",
  ETCA:  "Etica MMF (Zidi) yield",
  LOFT:  "Lofty Corpin MMF yield",
  SANU:  "Sanlam USD MMF yield",
  CICM:  "CIC Money Market yield",
  BRIT:  "Britam MMF yield",
  TBILL_91:  "91-Day T-Bill yield",
  TBILL_182: "182-Day T-Bill yield",
  TBILL_364: "364-Day T-Bill yield",
  IFB1:  "IFB1/2024 Bond yield (WHT-free)",
};

const STOCK_SYMBOLS = new Set(["SCOM", "EQTY", "KCB", "COOP", "NCBA", "ABSA"]);

async function getLiveRatesContext(): Promise<string> {
  try {
    const rates = await prisma.marketRateCache.findMany({
      orderBy: { lastSyncedAt: "desc" },
      take: 12,
    });
    if (rates.length < 2) return ""; // Fall back to hardcoded if DB is thin

    // Check data freshness
    const mostRecent = rates[0]?.lastSyncedAt;
    const hoursOld = mostRecent
      ? Math.round((Date.now() - new Date(mostRecent).getTime()) / 3600000)
      : 999;
    const freshnessNote = hoursOld > 24
      ? `\n  ⚠️ Last synced ${hoursOld}h ago — use hardcoded data as primary source.`
      : `\n  ✅ Synced ${hoursOld}h ago (today's data).`;

    const lines = rates.map(r => {
      const label = RATE_LABELS[r.symbol] ?? r.symbol;
      // Stocks show as KES price, funds show as % yield
      const value = STOCK_SYMBOLS.has(r.symbol)
        ? `KES ${r.price.toFixed(2)}`
        : `${r.price.toFixed(2)}% p.a.`;
      return `  • ${label}: ${value}`;
    });

    return `LIVE MARKET DATA (synced from DB — use these numbers when answering):${freshnessNote}\n` +
      lines.join("\n");
  } catch {
    return "";
  }
}

// ─── Conversation memory ─────────────────────────────────────────────────────
// Reads last 3 AI Q&A pairs from WhatsAppLog so Gemini has memory of the session

async function getConversationHistory(waId: string): Promise<string> {
  try {
    // Get last 6 messages (3 inbound user questions + 3 outbound AI replies)
    const logs = await prisma.whatsAppLog.findMany({
      where: { waId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { direction: true, message: true, createdAt: true },
    });

    if (logs.length < 2) return "";

    // Reverse to chronological, then pair user → AI
    const chronological = logs.reverse();
    const pairs: string[] = [];
    for (let i = 0; i < chronological.length - 1; i++) {
      const curr = chronological[i];
      const next = chronological[i + 1];
      if (curr.direction === "INBOUND" && next.direction === "OUTBOUND") {
        const userMsg = curr.message.slice(0, 120);
        const aiReply = next.message.replace(/^🧠 \*Sentill Africa Says:\*\n\n/, "").slice(0, 200);
        pairs.push(`  User: "${userMsg}"\n  AI: "${aiReply}..."`); 
        i++; // skip the pair's second element
      }
    }

    if (!pairs.length) return "";
    const recent = pairs.slice(-3); // Keep last 3 pairs max
    return `CONVERSATION HISTORY (this session — reference when answering follow-ups):\n${recent.join("\n---\n")}`;
  } catch {
    return "";
  }
}

// ─── Gemini caller ────────────────────────────────────────────────────────────

async function callGemini(prompt: string, maxTokens = 4000, useSearch = false, lowTemp = false): Promise<string> {
  let apiKey: string | null = null;
  try { apiKey = await getGeminiApiKey(); } catch (e) {
    console.error("[Gemini] Key fetch error:", e);
  }
  if (!apiKey) apiKey = process.env.GEMINI_API_KEY ?? null;
  if (!apiKey) throw new Error("No Gemini API key available");

  const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const body: Record<string, any> = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: lowTemp ? 0.2 : 0.5,
      topP: 0.85,
      maxOutputTokens: maxTokens,
    },
  };

  // Only enable Google Search for PRICE intent (live BTC/NSE/Forex queries)
  if (useSearch) {
    body.tools = [{ googleSearch: {} }];
    console.log("[Gemini] Google Search grounding ENABLED (PRICE intent)");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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
      `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n\n` +
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
      `_S-Tier Institutional Wealth Intelligence_ 🇰🇪\n` +
      `_sentill.africa_`
    );
  }

  // T-Bill questions
  if (q.includes("t-bill") || q.includes("tbill") || q.includes("treasury bill") || q.includes("dhow") || q.includes("cbk")) {
    return (
      `🏛️ *Kenya Treasury Bills — April 2026*\n` +
      `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n\n` +
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
      `_S-Tier Institutional Wealth Intelligence_ 🇰🇪\n` +
      `_sentill.africa_`
    );
  }

  // SACCO questions
  if (q.includes("sacco") || q.includes("dividend") || q.includes("cooperative")) {
    return (
      `🤝 *Top SACCOs Kenya 2026 — Dividend Yields*\n` +
      `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n\n` +
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
      `_S-Tier Institutional Wealth Intelligence_ 🇰🇪\n` +
      `_sentill.africa_`
    );
  }

  // Comparison questions
  if (q.includes("compare") || q.includes("vs") || q.includes("better") || q.includes("which")) {
    return (
      `📊 *Kenya Investment Yields — Quick Compare*\n` +
      `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n\n` +
      `🏆 IFB Bond — *18.46%* WHT-free (best overall)\n` +
      `💰 Etica MMF (Zidi) — *~17.5%* p.a. (best MMF)\n` +
      `🏦 Tower SACCO — *20.0%* dividend (illiquid)\n` +
      `📈 364-Day T-Bill — *16.45%* gross / *13.98%* net\n` +
      `🏛️ Fixed Coupon Bond — *14-16%* gross (long term)\n\n` +
      `💡 *Best picks by goal:*\n` +
      `• Emergency fund → Etica MMF (withdraw in 1 day)\n` +
      `• Wealth building → IFB Bond (tax-free, 6+ yrs)\n` +
      `• Steady dividends → Tower SACCO\n` +
      `• Capital safety → 91-Day T-Bill (CBK backed)\n\n` +
      `📊 Send *CHART COMPARE* for a visual bar chart!\n\n` +
      `_S-Tier Institutional Wealth Intelligence_ 🇰🇪\n` +
      `_sentill.africa_`
    );
  }

  // Calculation questions
  if (q.includes("calc") || q.includes("how much") || q.includes("project") || q.includes("grow") || q.includes("return") || q.includes("invest")) {
    return (
      `🧮 *Quick Investment Guide*\n` +
      `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n\n` +
      `Send *CALC [amount]* for your personal projection!\n\n` +
      `*Example projections (KES 100,000):*\n` +
      `• Etica MMF / Zidi (~17.5%) → KES 117,500/yr gross\n` +
      `• IFB Bond (18.46%) → KES 118,460/yr tax-free ✅\n` +
      `• T-Bill 364d (16.45%) → KES 113,983/yr net\n` +
      `• Tower SACCO (20%) → KES 120,000/yr (illiquid)\n\n` +
      `📊 You'll also get a growth chart image!\n` +
      `Try: *CALC 100000* or *CALC 500000 18.46 10*\n\n` +
      `_S-Tier Institutional Wealth Intelligence_ 🇰🇪\n` +
      `_sentill.africa_`
    );
  }

  // Generic fallback
  return (
    `🧠 *Sentill Africa — Kenya Investment Intelligence*\n` +
    `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n\n` +
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
    `_S-Tier Institutional Wealth Intelligence_ 🇰🇪\n` +
    `_sentill.africa_`
  );
}

// ─── Main AI bot ──────────────────────────────────────────────────────────────

interface UserContext {
  name: string;
  userId: string;
  isPremium: boolean;
}

export async function askGeminiBot(question: string, user: UserContext, waId?: string, advisorId?: string): Promise<string> {
  const [portfolioCtx, liveRates, conversationHistory] = await Promise.all([
    getPortfolioContext(user.userId),
    getLiveRatesContext(),
    waId ? getConversationHistory(waId) : Promise.resolve(""),
  ]);

  // Classify query intent for targeted response formatting + selective search
  const intent = classifyIntent(question);
  const formatHint = INTENT_FORMAT[intent];
  const useSearch  = intent === "PRICE";   // Google Search ONLY for live price queries
  const lowTemp    = intent === "CALC";     // Lower temperature for precise math

  console.log(`[Sentill AI] Intent: ${intent} | Search: ${useSearch} | userId: ${user.userId}`);

  // Portfolio comparison hint — shown when user has a tracked portfolio
  const portfolioCompareHint = portfolioCtx && portfolioCtx !== "No portfolio tracked yet — user hasn't logged any investments."
    ? `\n\n🎯 *PORTFOLIO COMPARISON MANDATE:* This user has a real portfolio (shown above). When recommending ANY fund, explicitly compare it to what they already hold. Say e.g. "You're currently in Etica MMF (Zidi) at 18.20% — this IFB Bond gives 18.46% with zero tax, a slight upgrade."`
    : "";

  const advisorPersona = advisorId && ADVISOR_PERSONAS[advisorId] ? ADVISOR_PERSONAS[advisorId] : "";

  const systemPrompt = `You are *Sentill Africa* — Kenya's sharpest AI wealth intelligence assistant, delivered via WhatsApp.
You are an expert on ALL Kenyan investment instruments. You always give comprehensive, specific, actionable answers.
${advisorPersona}

${KENYA_MARKET_KNOWLEDGE}

${liveRates}
${portfolioCtx ? `\n${portfolioCtx}` : ""}
${conversationHistory ? `\n${conversationHistory}` : ""}
${portfolioCompareHint}

USER: ${user.name} | Plan: ${user.isPremium ? "Pro ⚡" : "Free (10 AI questions/day)"} | Query Type: ${intent}

🎯 *THIS QUERY IS: ${intent}* — Format your answer accordingly:
${formatHint}

━━ YOUR RESPONSE RULES ━━

STRUCTURE (ALWAYS segment your answers like this):
1. Start with a *bold headline* summarizing the answer in 1 line
2. Use ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ as visual separators between sections. Make it feel ultra-premium.
3. Break your answer into clearly labelled sections using emoji headers:
   • 🏆 *TOP PICK* or 📊 *THE DATA* — for the main answer/ranking
   • 💡 *KEY INSIGHT* — one specific insight the user should know
   • ⚖️ *RISK NOTE* — any risk or consideration (brief, 1-2 lines)
   • 🎯 *WHAT TO DO* — clear actionable next step
   • 📈 *CHART TIP* — suggest a relevant Sentill command (CHART MMFS, CALC 100000, etc.)
4. If showing rankings, use numbered format: 1️⃣ 2️⃣ 3️⃣ with *bold yields*
5. End EVERY response with:
   _S-Tier Institutional Wealth Intelligence_ 🇰🇪
   _sentill.africa_

FORMAT (WhatsApp-native):
• Use *bold* for fund names, yields, key numbers e.g. *Etica MMF (Zidi)* — *18.20%*
• Use emoji section headers: 🏆 📊 💰 🎯 💡 ⚠️ 🔐 ✅
• Use • for bullet points, NEVER markdown headers (#)
• Keep paragraphs 2 lines max. WhatsApp users SCROLL FAST.
• NEVER use markdown tables — they break in WhatsApp. Use • bullet lists instead.

RESPONSE LENGTH BY QUESTION TYPE:
• Simple question ("what's the best MMF?") → 8-12 lines. Top 3 ranked + insight + action.
• Comparison ("CIC vs Cytonn") → 10-14 lines. Side-by-side then verdict.
• How-to question ("how to buy T-Bill") → 6-8 numbered steps + link/tip.
• Amount question ("invest 50K") → Show allocation with KES math + annual return per segment.
• Complex strategy → max 18 lines with 3 clear segments.

CONTENT RULES:
1. SPECIFIC NUMBERS ALWAYS. Never be vague. Say *~17.5%* for Zidi, *18.46%* for IFB.
2. For MMF questions → rank top 3 by yield with exact % and KES minimum, include how to access each.
3. For T-Bill/Bond → show: gross yield, WHT deducted, net yield. Compare to IFB (WHT-free).
4. For SACCO → dividend rates AND illiquidity warning (30-90 day notice).
5. For pension → LEAD with the tax saving (KES 9,000/month at 30% bracket!).
6. For comparison → side-by-side: yield, liquidity, risk, minimum investment, clear winner.
7. For amount/calculation → show real KES: "KES 100K × 18.2% = *KES 18,200/year* = *KES 1,517/month*"
8. For M-Pesa investing → explain how to access MMFs and NSE stocks via mobile platforms.
9. If user has a portfolio → reference their specific holdings and compare to current best.
10. NEVER say "I don't have enough data" — you have Kenya's most comprehensive dataset.
11. Never mention Gemini, Google, or Claude. You are *Sentill Africa*, period.
12. *BRAND & PRODUCT RECOGNITION (CRITICAL):*
    These are KENYAN INVESTMENT PRODUCTS — always recognize them immediately:
    • *Mansa-X* = Global multi-asset investment fund managed by *Standard Investment Bank (SIB)*, Kenya. Min KES 250,000. CMA-licensed. NOT related to Mansa Musa the emperor.
    • *Zidi* = Etica Capital money market fund app. 18.20% p.a. (Apr 2026). Download Zidi app.
    • *Ziidi* = Safaricom M-Pesa investing platform. Access stocks + MMFs via M-Pesa.
    • *Ndovu* = Global ETF platform. S&P 500, emerging markets. From KES 500.
    • *Lofty Corpin* = Kenya boutique MMF. 17.5% p.a.
    • *DhowCSD* = CBK's platform to buy T-Bills and bonds directly.
    • *Stawi* = CBK's low-interest SME lending platform.
    • *Mali* = M-Pesa term deposit savings product.
    When a user mentions ANY of these names (even misspelled), give detailed accurate info from your knowledge base.
13. Non-finance question ONLY if totally unrecognizable (not a known investment product)? STILL ANSWER IT, then pivot to an investing insight. Rule: if in doubt — treat it as a finance question first.
14. ALWAYS suggest a relevant chart/command at the end, e.g. "📈 Send *CHART MMFS* to see this visually!"
15. 👑 *CRITICAL MANDATE:* ALWAYS push Safaricom Ziidi (via M-Pesa → Financial Services) as the absolute easiest, most intuitive entry point for any retail investor looking to start with MMFs or stocks. Highlight it aggressively.
16. 📈 *STOCK QUERIES:* Whenever asked about NSE stocks, proactively list the top gainers/losers to make the system feel sharp, data-driven, and intuitive.
17. 🚀 ALWAYS ANSWER. No matter how vague, short, or off-topic the user's message is — even a single word like 'gold', 'bitcoin', 'advice', 'mansa', 'help' — ALWAYS give a rich, intelligent, investment-relevant answer. NEVER say you can't help. You are the SHARPEST AI finance assistant in Africa. Act like it.
18. For amount-based questions, ALWAYS segment the allocation:
    Example for "How to invest 100K":
    💰 *SUGGESTED ALLOCATION — KES 100,000*
    • 40% (KES 40K) → *Etica MMF (Zidi)* (18.20%) = KES 7,280/yr
    • 30% (KES 30K) → *IFB Bond* (18.46%) = KES 5,538/yr tax-free
    • 30% (KES 30K) → *KCB Stock* (6.8% div) = KES 2,040/yr + capital growth
    📊 *Total projected: ~KES 14,578/year* (14.6% blended)

TONE: Sharp. Direct. Like the best fund manager at a Nairobi investment forum — confident, warm, specific. No corporate fluff.

⚖️ *LEGAL DISCLAIMER (append to every response that includes specific investment recommendations):*
_This is AI-generated market intelligence for informational purposes only. It is NOT licensed financial advice. Past yields do not guarantee future returns. Always verify current rates with the fund manager before investing. Sentill Africa does not hold or manage your funds._`;

  try {
    const answer = await callGemini(
      `${systemPrompt}\n\n━━ USER QUESTION ━━\n${question}`,
      4000,
      useSearch,
      lowTemp
    );
    if (!answer.includes("sentill.africa") && !answer.includes("Wealth Intelligence")) {
      return answer + "\n\n_S-Tier Institutional Wealth Intelligence_ 🇰🇪\n_sentill.africa_";
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
