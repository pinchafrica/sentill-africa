"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, ChevronRight, Shield, Star, Plus, TrendingUp, Activity,
  Clock, Zap, Bell, Calculator, Award, ArrowUpRight, Users, Phone,
  Mail, Globe, MapPin, Building2, Briefcase, CheckCircle, AlertCircle,
  BarChart2, Target, PieChart, Landmark
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useAIStore } from "@/lib/store";

// ─── SPECIAL FUND DATABASE ────────────────────────────────────────────────────

const SPECIAL_FUNDS: Record<string, any> = {
  "mansa-x": {
    id: "mansa-x",
    code: "MANSA-X",
    name: "Mansa X Special Fund",
    manager: "Mansa Capital Management Ltd",
    color: "#7c3aed",
    founded: "2021",
    aum: 2.8,
    targetReturn: "22–28%",
    actualReturn: 24.6,
    minInvest: 250000,
    lockup: "6 Months",
    liquidity: "Semi-Annual",
    risk: "Medium-High",
    cmaLicensed: true,
    category: "Special Fund",
    subcategory: "Multi-Strategy Growth",
    custodian: "I&M Bank Kenya",
    auditor: "Grant Thornton Kenya",
    taxRate: 15,
    esg: 74,
    description: "Mansa X Special Fund is a high-alpha multi-strategy vehicle targeting 22–28% annual returns through a tri-engine approach: structured fixed income alpha, domestic equity momentum plays, and direct SME credit origination. The fund requires a minimum of KES 250,000 and operates under a CMA-licensed framework with semi-annual liquidity windows (June & December), making it exclusively accessible to institutional and high-net-worth individual investors.",
    strategy: "Mansa X deploys a 40/35/25 split across: (1) Government & IFB arbitrage plays, capturing yield curve inefficiencies across the 3M–5Y tenor spectrum; (2) Momentum equity selection across NSE's top 20 constituents using a proprietary AI-ranking model; and (3) Direct SME lending to CMA-approved credit facilities with first-charge security on business assets.",
    allocation: [
      { asset: "Fixed Income Alpha", pct: 40 },
      { asset: "NSE Equity Momentum", pct: 35 },
      { asset: "SME Direct Credit", pct: 20 },
      { asset: "Cash & Liquidity Buffer", pct: 5 },
    ],
    subFunds: [
      { name: "Mansa X Fixed Income Alpha Fund", type: "Sovereign & IFB Arbitrage", yield: "19.5%", min: "KES 250,000", desc: "Targets IFB1/2024, 182-day T-Bills, and yield curve positioning across 3M–5Y tenors" },
      { name: "Mansa X NSE Momentum Equity Fund", type: "Active NSE Equity", yield: "Market+", min: "KES 250,000", desc: "AI-ranked top 10 NSE equities with quarterly rebalancing based on momentum scoring" },
      { name: "Mansa X SME Direct Credit Fund", type: "Private Credit", yield: "28–35%", min: "KES 500,000", desc: "First-charge secured SME lending to CMA-approved Kenyan businesses in tech & logistics" },
      { name: "Mansa X Balanced Growth Class", type: "Multi-Strategy Blended", yield: "22–28%", min: "KES 250,000", desc: "The flagship blended class combining all three sleeves in a single allocation" },
    ],
    yieldHistory: [
      { month: "Mar'25", yield: 21.2 }, { month: "Apr'25", yield: 21.8 },
      { month: "May'25", yield: 22.5 }, { month: "Jun'25", yield: 23.1 },
      { month: "Jul'25", yield: 23.6 }, { month: "Aug'25", yield: 23.9 },
      { month: "Sep'25", yield: 24.1 }, { month: "Oct'25", yield: 24.3 },
      { month: "Nov'25", yield: 24.4 }, { month: "Dec'25", yield: 24.5 },
      { month: "Jan'26", yield: 24.5 }, { month: "Feb'26", yield: 24.6 },
    ],
    contacts: {
      phone: "+254 700 555 001",
      whatsapp: "+254 700 555 001",
      email: "invest@mansacapital.co.ke",
      website: "www.mansacapital.co.ke",
      address: "1st Floor, Britam Tower, Hospital Road, Upper Hill, Nairobi",
      relationshipManager: "Grace Wanjiku",
      rmPhone: "+254 722 101 001",
      rmEmail: "g.wanjiku@mansacapital.co.ke",
    },
    howToInvest: [
      "Complete the online KYC at www.mansacapital.co.ke/invest",
      "Submit ID (National ID or Passport), KRA PIN, and proof of address",
      "Transfer minimum KES 250,000 to I&M Bank account: 00123456789 (Mansa Capital Management Ltd)",
      "Reference: 'MANSA-X – [Your Full Name]'",
      "Receive unit allocation confirmation within 2 business days; 6-month lock-up begins from allocation date",
    ],
    faq: [
      { q: "What is the minimum investment?", a: "KES 250,000 minimum. Top-ups are accepted in multiples of KES 50,000 at any semi-annual redemption window." },
      { q: "When can I redeem?", a: "Redemption windows open semi-annually in June and December. Requests must be submitted 30 days in advance. The initial 6-month lock-up must be served before any redemption." },
      { q: "Is the fund CMA licensed?", a: "Yes. Mansa X Special Fund is fully licensed by the Capital Markets Authority of Kenya under CMA/FUND/SF/2021/001." },
      { q: "How are returns distributed?", a: "Returns compound in-fund by default. Investors who elect income distribution at entry receive semi-annual cash payouts in June and December." },
    ],
  },

  "kuza-momentum": {
    id: "kuza-momentum",
    code: "KUZA-MO",
    name: "Kuza Momentum Special Fund",
    manager: "Kuza Asset Management Ltd",
    color: "#0284c7",
    founded: "2020",
    aum: 4.1,
    targetReturn: "18–22%",
    actualReturn: 19.8,
    minInvest: 25000,
    lockup: "6 Months",
    liquidity: "Semi-Annual",
    risk: "Medium",
    cmaLicensed: true,
    category: "Special Fund",
    subcategory: "Growth & Income Hybrid",
    custodian: "Equity Bank Kenya",
    auditor: "KPMG Kenya",
    taxRate: 15,
    esg: 79,
    description: "Kuza Momentum Special Fund is a growth-oriented vehicle that blends Kenya's strongest fixed-income yields with carefully selected NSE equity positions and private credit facilities. With a 6-month lock-up and semi-annual liquidity, Kuza Momentum targets KES-based investors who desire professionally managed, above-savings returns without the full illiquidity premium of purely private funds.",
    strategy: "The fund uses a momentum-scoring engine that rebalances quarterly, rotating capital into the highest-scoring NSE equities while maintaining a ≥50% floor in sovereign fixed income. The private credit sleeve targets SMEs in the technology, agriculture, and logistics sectors — Kenya's fastest-growing GDP contributors.",
    allocation: [
      { asset: "Sovereign Fixed Income", pct: 50 },
      { asset: "NSE Equities (Top 10 Momentum)", pct: 30 },
      { asset: "Private SME Credit", pct: 15 },
      { asset: "Cash & Liquidity", pct: 5 },
    ],
    subFunds: [
      { name: "Kuza Momentum Fixed Income Fund", type: "Sovereign Fixed Income", yield: "16–18%", min: "KES 25,000", desc: "Core allocation to IFBs, 91-day and 182-day T-Bills, and short corporate bonds" },
      { name: "Kuza Momentum NSE Equity Fund", type: "Active NSE Equity", yield: "Market+", min: "KES 25,000", desc: "Top 10 NSE equities by momentum score: SCOM, EQTY, KCB, BATK, COOP and more" },
      { name: "Kuza Momentum SME Credit Class", type: "Private Credit", yield: "24–30%", min: "KES 100,000", desc: "Direct SME lending in tech, agri-business, and logistics with asset security" },
      { name: "Kuza Momentum Balanced Class", type: "Blended Multi-Asset", yield: "18–22%", min: "KES 25,000", desc: "The flagship blended class — equities + bonds + credit in one optimised allocation" },
    ],
    yieldHistory: [
      { month: "Mar'25", yield: 17.5 }, { month: "Apr'25", yield: 17.9 },
      { month: "May'25", yield: 18.2 }, { month: "Jun'25", yield: 18.6 },
      { month: "Jul'25", yield: 18.9 }, { month: "Aug'25", yield: 19.1 },
      { month: "Sep'25", yield: 19.3 }, { month: "Oct'25", yield: 19.5 },
      { month: "Nov'25", yield: 19.6 }, { month: "Dec'25", yield: 19.7 },
      { month: "Jan'26", yield: 19.7 }, { month: "Feb'26", yield: 19.8 },
    ],
    contacts: {
      phone: "+254 711 220 002",
      whatsapp: "+254 711 220 002",
      email: "funds@kuza.co.ke",
      website: "www.kuza.co.ke",
      address: "4th Floor, Westend Towers, Waiyaki Way, Westlands, Nairobi",
      relationshipManager: "Brian Otieno",
      rmPhone: "+254 733 202 002",
      rmEmail: "b.otieno@kuza.co.ke",
    },
    howToInvest: [
      "Register at www.kuza.co.ke/funds and complete digital KYC",
      "Upload National ID/Passport + KRA PIN certificate",
      "Transfer KES 25,000+ to Equity Bank: 0101234567 (Kuza Asset Management)",
      "Reference: 'KUZA-MO – [Your Phone Number]'",
      "Units allocated within 1 business day; statement sent via email",
    ],
    faq: [
      { q: "What is the minimum investment?", a: "KES 25,000 minimum. Additional contributions accepted anytime in multiples of KES 5,000." },
      { q: "How does the semi-annual liquidity work?", a: "Redemptions are processed every June and December. Submit your request 21 days before the window." },
      { q: "Is it regulated?", a: "Yes, fully licensed by CMA Kenya under CMA/FUND/SF/2020/003. Annual financials audited by KPMG Kenya." },
      { q: "Can I invest via M-Pesa?", a: "Yes. Top-ups via M-Pesa Paybill 400220, Account: your registered national ID number." },
    ],
  },

  "oak": {
    id: "oak",
    code: "OAK-SF",
    name: "Oak Special Fund",
    manager: "Oak Capital Partners Ltd",
    color: "#059669",
    founded: "2018",
    aum: 6.9,
    targetReturn: "16–20%",
    actualReturn: 17.4,
    minInvest: 100000,
    lockup: "24 Months",
    liquidity: "Annual",
    risk: "Medium",
    cmaLicensed: true,
    category: "Special Fund",
    subcategory: "Wealth Preservation & Growth",
    custodian: "Standard Chartered Bank Kenya",
    auditor: "Deloitte Kenya",
    taxRate: 15,
    esg: 86,
    description: "Oak Special Fund is a premium wealth preservation and growth vehicle established in 2018, now managing KES 6.9B for Kenya's institutional and affluent investors. The fund prioritizes capital protection while delivering 16–20% annual returns through a disciplined multi-asset strategy anchored on long-dated government securities, high-quality NSE dividend equities, and select real estate income positions.",
    strategy: "Oak deploys a classic 60/30/10 institutional framework: 60% in long-duration government bonds (IFBs, 10–15yr Ts), capturing the yield premium at the long end; 30% in dividend-yielding NSE equities (SCOM, EQTY, KCB, COOP) with strong free cash flow profiles; and 10% in real estate income assets — listed REITs and income-generating property SPVs.",
    allocation: [
      { asset: "Long-Duration Gov Bonds (IFBs & 10-15yr)", pct: 60 },
      { asset: "NSE Dividend Equities", pct: 30 },
      { asset: "Real Estate Income (REITs & SPVs)", pct: 10 },
    ],
    subFunds: [
      { name: "Oak Long Bond & IFB Income Fund", type: "Long-Duration Fixed Income", yield: "18–20%", min: "KES 100,000", desc: "IFB1/2024, 10-year & 15-year government bonds capturing the long-end yield premium" },
      { name: "Oak NSE Dividend Income Fund", type: "NSE Dividend Equity", yield: "Div + Capital", min: "KES 100,000", desc: "Top dividend-yielding NSE equities: Safaricom, Equity, KCB, Co-op, BATK" },
      { name: "Oak Real Estate Income Fund", type: "Property & REIT Income", yield: "12–15%", min: "KES 500,000", desc: "Acorn Student REIT, Stanlib Fahari I-REIT, and select commercial property SPVs" },
      { name: "Oak Balanced Preservation Class", type: "Blended Institutional", yield: "16–20%", min: "KES 100,000", desc: "The flagship class combining all three allocations for balanced capital preservation" },
      { name: "Oak Growth Class (Accumulation)", type: "Full Compound Growth", yield: "16–20%+", min: "KES 250,000", desc: "No distributions — all returns reinvested for maximum compounding over 2–5 years" },
    ],
    yieldHistory: [
      { month: "Mar'25", yield: 15.8 }, { month: "Apr'25", yield: 16.1 },
      { month: "May'25", yield: 16.4 }, { month: "Jun'25", yield: 16.7 },
      { month: "Jul'25", yield: 16.9 }, { month: "Aug'25", yield: 17.0 },
      { month: "Sep'25", yield: 17.1 }, { month: "Oct'25", yield: 17.2 },
      { month: "Nov'25", yield: 17.3 }, { month: "Dec'25", yield: 17.3 },
      { month: "Jan'26", yield: 17.4 }, { month: "Feb'26", yield: 17.4 },
    ],
    contacts: {
      phone: "+254 720 399 003",
      whatsapp: "+254 720 399 003",
      email: "wealth@oakcapitalpartners.co.ke",
      website: "www.oakcapitalpartners.co.ke",
      address: "8th Floor, The Oval, Ring Road Parklands, Nairobi",
      relationshipManager: "Amina Hassan",
      rmPhone: "+254 701 303 003",
      rmEmail: "a.hassan@oakcapitalpartners.co.ke",
    },
    howToInvest: [
      "Schedule a private advisory call: +254 720 399 003",
      "Complete the High-Net-Worth KYC package (sent via DocuSign)",
      "Wire KES 100,000+ to Standard Chartered A/C: 01-2345678-00 (Oak Capital Partners)",
      "Reference: 'OAK-SF – [Your Full Legal Name]'",
      "Investment committee approval within 3 business days; units allocated immediately upon approval",
    ],
    faq: [
      { q: "Who is Oak Special Fund designed for?", a: "HNW individuals, family offices, corporate treasuries, and institutional investors seeking capital preservation with 16–20% returns over a 2–5 year horizon." },
      { q: "Why a 24-month lock-up?", a: "The long-duration bond and REIT positions need a minimum 24-month horizon to capture the full term premium without forced liquidations." },
      { q: "What is the income distribution policy?", a: "'Income Class' investors receive quarterly distributions of approximately 4% of NAV. 'Growth Class' investors receive full compounding. You choose at subscription." },
      { q: "Is there an early exit penalty?", a: "Early redemption outside the annual window incurs a 3% exit fee retained in the fund for remaining investors." },
    ],
  },

  "avocap": {
    id: "avocap",
    code: "AVOCAP",
    name: "Avocap Africa Special Fund",
    manager: "Avocap Asset Management Ltd",
    color: "#dc2626",
    founded: "2022",
    aum: 1.6,
    targetReturn: "20–26%",
    actualReturn: 21.9,
    minInvest: 75000,
    lockup: "18 Months",
    liquidity: "Semi-Annual",
    risk: "High",
    cmaLicensed: true,
    category: "Special Fund",
    subcategory: "East Africa Frontier Markets",
    custodian: "Absa Bank Kenya",
    auditor: "PWC Kenya",
    taxRate: 15,
    esg: 68,
    description: "Avocap Africa Special Fund is a frontier-market-focused income vehicle targeting 20–26% annual returns by capitalising on yield opportunities across East Africa's most rapidly developing capital markets. The fund invests across Kenya, Uganda, Tanzania, and Rwanda sovereign and corporate instruments, offering investors unparalleled geographical diversification within a CMA-licensed Kenyan framework.",
    strategy: "Avocap deploys a regionally-diversified fixed income and credit strategy: 45% in Kenya IFBs and T-bills; 25% in Ugandan and Tanzanian government paper (USD-hedged); 20% in East African corporate bonds (banking and telco sectors); and 10% in frontier-market private credit with first-charge security.",
    allocation: [
      { asset: "Kenya IFBs & T-Bills", pct: 45 },
      { asset: "Uganda & Tanzania Gov Paper (USD-hedged)", pct: 25 },
      { asset: "EA Corporate Bonds (Banks & Telcos)", pct: 20 },
      { asset: "Frontier Private Credit", pct: 10 },
    ],
    subFunds: [
      { name: "Avocap Africa Equity Special Fund", type: "EA Multi-Country Equity", yield: "Market+", min: "KES 75,000", desc: "Pan-African equity exposure: NSE, Uganda Securities Exchange, DSE Tanzania blue chips" },
      { name: "Avocap Africa Fixed Income Fund", type: "EA Sovereign Fixed Income", yield: "20–24%", min: "KES 75,000", desc: "Kenya IFBs + Ugandan & Tanzanian government paper, all USD-hedged" },
      { name: "Avocap EA Corporate Bond Fund", type: "Regional Corporate Bonds", yield: "18–22%", min: "KES 150,000", desc: "East African banking and telecom sector bonds — KCB, EABL, Safaricom, MTN Uganda" },
      { name: "Avocap Frontier Credit Fund", type: "Frontier Private Credit", yield: "28–34%", min: "KES 500,000", desc: "First-lien secured lending to Uganda, Tanzania and Rwanda high-growth SMEs" },
      { name: "Avocap Africa Blended Fund", type: "Diversified EA Portfolio", yield: "20–26%", min: "KES 75,000", desc: "The flagship blended fund across all four Avocap sleeves in one unified portfolio" },
    ],
    yieldHistory: [
      { month: "Mar'25", yield: 19.5 }, { month: "Apr'25", yield: 20.0 },
      { month: "May'25", yield: 20.4 }, { month: "Jun'25", yield: 20.8 },
      { month: "Jul'25", yield: 21.0 }, { month: "Aug'25", yield: 21.2 },
      { month: "Sep'25", yield: 21.4 }, { month: "Oct'25", yield: 21.6 },
      { month: "Nov'25", yield: 21.7 }, { month: "Dec'25", yield: 21.8 },
      { month: "Jan'26", yield: 21.8 }, { month: "Feb'26", yield: 21.9 },
    ],
    contacts: {
      phone: "+254 719 488 004",
      whatsapp: "+254 719 488 004",
      email: "invest@avocapafrica.co.ke",
      website: "www.avocapafrica.co.ke",
      address: "3rd Floor, Delta Towers, Waiyaki Way, Westlands, Nairobi",
      relationshipManager: "James Karanja",
      rmPhone: "+254 744 404 004",
      rmEmail: "j.karanja@avocapafrica.co.ke",
    },
    howToInvest: [
      "Apply online at www.avocapafrica.co.ke/special-fund",
      "Upload National ID/Passport, KRA PIN, and source-of-funds declaration",
      "Transfer minimum KES 75,000 to Absa A/C: 1234567890 (Avocap Asset Management)",
      "Reference: 'AVOCAP-SF – [Your ID Number]'",
      "Units confirmed and statement issued within 3 business days",
    ],
    faq: [
      { q: "Why invest in East Africa frontier markets?", a: "EA frontier markets offer sovereign yield premiums of 2–5% above Kenya-only instruments, with rapid capital market development and strong demographic tailwinds. Avocap provides a regulated Kenyan framework for this exposure." },
      { q: "How is currency risk managed?", a: "Non-KES positions are USD-hedged using forward contracts rolled quarterly. Hedging costs are absorbed within the 1.75% management fee structure." },
      { q: "What is the Avocap Africa Equity Special Fund?", a: "It is a dedicated sub-fund within the Avocap family targeting NSE, Uganda Securities Exchange, and DSE Tanzania blue-chip equities. Minimum entry KES 75,000." },
      { q: "Is there a dividend yield?", a: "The fund targets quarterly income distributions of approximately 5–6% of NAV annually for income class investors." },
    ],
  },

  "etica-special": {
    id: "etica-special",
    code: "ETICA-SF",
    name: "Etica Special Fund",
    manager: "Etica Capital Ltd",
    color: "#10b981",
    founded: "2023",
    aum: 1.1,
    targetReturn: "25–32%",
    actualReturn: 27.3,
    minInvest: 100000,
    lockup: "12 Months",
    liquidity: "Quarterly",
    risk: "High",
    cmaLicensed: true,
    category: "Special Fund",
    subcategory: "Premium Institutional Alpha",
    custodian: "Stanbic Bank Kenya",
    auditor: "Deloitte Kenya",
    taxRate: 15,
    esg: 82,
    description: "Etica Special Fund is the premium, high-conviction offering from Etica Capital Ltd — the same house behind Kenya's highest-yielding MMF. This special fund targets institutional-grade alpha of 25–32% annually by combining Etica's proven fixed income expertise with leveraged IFB positions, direct private credit origination, and a concentrated technology equity sleeve. Strictly limited to 500 investors.",
    strategy: "Etica SF uses a high-concentration, high-conviction three-pillar model: (1) Leveraged IFB & Long Bond at 1.3× targeting 18.5% IFB1/2024; (2) Originate-to-Hold Private Credit to Kenya's top-20 fastest-growing SMEs at 28–35% coupon; and (3) A concentrated 5-stock technology equity portfolio selected by proprietary AI stock-picking models.",
    allocation: [
      { asset: "Leveraged IFB & Gov Bond (1.3×)", pct: 45 },
      { asset: "Private Credit (SME Originate-to-Hold)", pct: 30 },
      { asset: "Technology Equity (5-Stock AI Portfolio)", pct: 20 },
      { asset: "Cash & Risk Buffer", pct: 5 },
    ],
    subFunds: [
      { name: "Etica Leveraged IFB Income Fund", type: "Leveraged Sovereign Fixed Income", yield: "24–28%", min: "KES 100,000", desc: "1.3× leveraged exposure to IFB1/2024 and equivalent instruments — highest-yield sovereign play" },
      { name: "Etica Private Credit Fund I", type: "Direct SME Credit Origination", yield: "28–35%", min: "KES 500,000", desc: "First-lien secured originate-to-hold lending to Kenya's top 20 fastest-growing SMEs" },
      { name: "Etica AI Technology Equity Fund", type: "Concentrated Tech Equity", yield: "Market+", min: "KES 100,000", desc: "AI-selected 5-stock portfolio: SCOM, M-Kopa, Wasoko, Twiga Foods, EQTY Tech" },
      { name: "Etica Special Fund (Blended)", type: "High-Alpha Multi-Strategy", yield: "25–32%", min: "KES 100,000", desc: "The flagship blended class — all three pillars in a single allocation for institutional alpha" },
    ],
    yieldHistory: [
      { month: "Mar'25", yield: 24.1 }, { month: "Apr'25", yield: 24.8 },
      { month: "May'25", yield: 25.3 }, { month: "Jun'25", yield: 25.8 },
      { month: "Jul'25", yield: 26.2 }, { month: "Aug'25", yield: 26.5 },
      { month: "Sep'25", yield: 26.8 }, { month: "Oct'25", yield: 27.0 },
      { month: "Nov'25", yield: 27.1 }, { month: "Dec'25", yield: 27.2 },
      { month: "Jan'26", yield: 27.2 }, { month: "Feb'26", yield: 27.3 },
    ],
    contacts: {
      phone: "+254 700 511 005",
      whatsapp: "+254 700 511 005",
      email: "specialfund@eticacapital.co.ke",
      website: "www.eticacapital.co.ke/special-fund",
      address: "12th Floor, UAP Old Mutual Tower, Upper Hill, Nairobi",
      relationshipManager: "Dr. Peter Kamau",
      rmPhone: "+254 722 505 005",
      rmEmail: "p.kamau@eticacapital.co.ke",
    },
    howToInvest: [
      "Contact Dr. Peter Kamau: +254 722 505 005 for eligibility check",
      "Submit Expression of Interest at www.eticacapital.co.ke/special-fund/apply",
      "Complete institutional KYC: Passport/ID, KRA PIN, AML declaration, source-of-wealth statement",
      "Wire KES 100,000+ to Stanbic Bank A/C: 9876543210 (Etica Capital Ltd — Special Fund)",
      "Reference: 'ESFC – [Your Full Name] – [Date]'",
      "Investment committee reviews within 5 business days; offer letter issued before unit allocation",
    ],
    faq: [
      { q: "How is Etica SF different from Etica Wealth MMF?", a: "The MMF targets capital preservation and daily liquidity at ~17.5%. The Special Fund uses leverage and private credit to target 25–32%, suitable only for sophisticated investors." },
      { q: "What is the leverage risk?", a: "The IFB sleeve uses 1.3× leverage maximum. The fund maintains ≥5% cash buffer with active risk management to limit drawdown to ≤8% NAV per quarter." },
      { q: "Is the 500-investor limit real?", a: "Yes — per the trust deed. As of March 2026, approximately 340 slots remain. Applications are processed first-come, first-served." },
      { q: "How is the management fee structured?", a: "2.0% p.a. base management fee + 20% performance fee on returns above the 18% hurdle rate. Performance fee crystallises annually in January." },
    ],
  },
};

// ─── DARK TOOLTIP ──────────────────────────────────────────────────────────────
const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-xl">
      {label && <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex justify-between gap-6">
          <span className="text-[9px] text-slate-400">{p.name}</span>
          <span className="text-[10px] font-black text-white">{typeof p.value === "number" ? p.value.toFixed(2) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function SpecialFundPage() {
  const params = useParams();
  const idParam = (params?.id as string)?.toLowerCase() || "mansa-x";
  const fund = SPECIAL_FUNDS[idParam] || SPECIAL_FUNDS["mansa-x"];

  const { watchlist, toggleWatchlist } = useAIStore();
  const watchlisted = watchlist.includes(fund.id);
  const [alertSet, setAlertSet] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "portfolio" | "contact" | "faq">("overview");

  const compoundData = [6, 12, 18, 24, 36].map(m => {
    const r = fund.actualReturn / 100 / 12;
    const netR = r * 0.85;
    return {
      label: m < 12 ? `${m}M` : `${m / 12}Y`,
      gross: Math.round(fund.minInvest * Math.pow(1 + r, m)),
      net: Math.round(fund.minInvest * Math.pow(1 + netR, m)),
    };
  });

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── BREADCRUMB ── */}
      <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex items-center gap-2">
        <Link href="/markets/special" className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 hover:text-slate-700 uppercase tracking-widest transition-colors">
          <ArrowLeft className="w-3 h-3" /> Special Funds
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">{fund.code}</span>
      </div>

      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 px-6 md:px-10 pt-10 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[140px] opacity-10 pointer-events-none" style={{ background: fund.color }} />

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 relative z-10">
          {/* Identity */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-sm" style={{ background: fund.color }}>
                {fund.code.slice(0, 4)}
              </div>
              <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">{fund.name}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{fund.manager}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Est. {fund.founded}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AUM: KES {fund.aum}B</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {fund.cmaLicensed && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">CMA Licensed</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
                <Clock className="w-3 h-3 text-slate-300" />
                <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">{fund.liquidity} Liquidity</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
                <Target className="w-3 h-3 text-amber-400" />
                <span className="text-[9px] text-amber-300 font-black uppercase tracking-widest">{fund.lockup} Lock-up</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
                <Activity className="w-3 h-3 text-rose-400" />
                <span className="text-[9px] text-rose-300 font-black uppercase tracking-widest">Risk: {fund.risk}</span>
              </div>
            </div>
          </div>

          {/* Yield + Actions */}
          <div className="flex flex-col lg:items-end gap-4">
            <div>
              <div className="flex items-end gap-4">
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Actual Return (YTD)</div>
                  <div className="text-5xl font-black tracking-tighter" style={{ color: fund.color }}>{fund.actualReturn}%</div>
                </div>
                <div className="pb-1">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Range</div>
                  <div className="text-2xl font-black text-white">{fund.targetReturn}</div>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                Min: KES {fund.minInvest.toLocaleString()} · {fund.subcategory}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => toggleWatchlist(fund.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${watchlisted ? "bg-amber-500 border-amber-500 text-white" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}>
                <Star className={`w-3.5 h-3.5 ${watchlisted ? "fill-white" : ""}`} />{watchlisted ? "Watching" : "Watchlist"}
              </button>
              <button onClick={() => setAlertSet(a => !a)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${alertSet ? "bg-indigo-500 border-indigo-500 text-white" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}>
                <Bell className="w-3.5 h-3.5" />{alertSet ? "Alert On" : "Set Alert"}
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
              >
                <Phone className="w-3.5 h-3.5" /> Invest Now
              </button>
            </div>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-8 relative z-10">
          {[
            { label: "Target Return", value: fund.targetReturn },
            { label: "Actual Return", value: fund.actualReturn + "%" },
            { label: "AUM", value: "KES " + fund.aum + "B" },
            { label: "Min Invest", value: "KES " + fund.minInvest.toLocaleString() },
            { label: "Lock-up", value: fund.lockup },
            { label: "Liquidity", value: fund.liquidity },
            { label: "WHT Tax", value: fund.taxRate + "%" },
            { label: "ESG Score", value: fund.esg + "/100" },
          ].map(k => (
            <div key={k.label} className="bg-white/5 rounded-xl p-3 border border-white/10">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{k.label}</span>
              <span className="text-sm font-black text-white">{k.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="px-6 md:px-10 py-8 space-y-8">

        {/* Yield Chart */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">12-Month Performance Track</h2>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-5">Annualised effective return, net of fees</p>
          <ResponsiveContainer minWidth={1} width="100%" height={220}>
            <AreaChart data={fund.yieldHistory}>
              <defs>
                <linearGradient id="sfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={fund.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={fund.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
              <YAxis tickFormatter={v => v + "%"} tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
              <Tooltip content={<DarkTooltip />} />
              <Area type="monotone" dataKey="yield" name="Return %" stroke={fund.color} fill="url(#sfGrad)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── TABS ── */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {(["overview", "portfolio", "contact", "faq"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-5 text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600"}`}>
                {tab === "contact" ? "How to Invest" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-8">

            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3">About This Fund</h3>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{fund.description}</p>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3">Investment Strategy</h3>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{fund.strategy}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: "Fund Manager", value: fund.manager },
                    { label: "Custodian", value: fund.custodian },
                    { label: "Auditor", value: fund.auditor },
                    { label: "Category", value: fund.category + " · " + fund.subcategory },
                    { label: "WHT Rate", value: fund.taxRate + "% (final, withheld at source)" },
                    { label: "CMA Status", value: fund.cmaLicensed ? "Fully Licensed ✓" : "Pending" },
                    { label: "Lock-up Period", value: fund.lockup },
                    { label: "Liquidity Window", value: fund.liquidity },
                  ].map(d => (
                    <div key={d.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{d.label}</span>
                      <span className="text-[10px] font-black text-slate-700 text-right max-w-[55%]">{d.value}</span>
                    </div>
                  ))}
                </div>

                {/* Growth projection */}
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Compound Growth on Min Investment (KES {fund.minInvest.toLocaleString()})</h3>
                  <ResponsiveContainer minWidth={1} width="100%" height={200}>
                    <BarChart data={compoundData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                      <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}K`} tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                      <Tooltip content={<DarkTooltip />} />
                      <Bar dataKey="gross" name="Gross Value" fill="#cbd5e1" radius={[4,4,0,0]} />
                      <Bar dataKey="net" name="Net Value" fill={fund.color} radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* PORTFOLIO */}
            {activeTab === "portfolio" && (
              <div className="space-y-8">
                {/* Allocation bars */}
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-5">Portfolio Allocation</h3>
                  <div className="space-y-4">
                    {fund.allocation.map((a: any) => (
                      <div key={a.asset}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{a.asset}</span>
                          <span className="text-[10px] font-black text-slate-900">{a.pct}%</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${a.pct}%`, background: fund.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sub-fund products grid */}
                {fund.subFunds && (
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-5">Fund Products &amp; Sub-Funds</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {fund.subFunds.map((sf: any, i: number) => (
                        <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <p className="text-[11px] font-black text-slate-900 uppercase tracking-wide leading-tight">{sf.name}</p>
                              <span className="inline-block mt-1.5 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: fund.color + "18", color: fund.color }}>{sf.type}</span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Yield</p>
                              <p className="text-sm font-black" style={{ color: fund.color }}>{sf.yield}</p>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-3">{sf.desc}</p>
                          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Minimum</span>
                            <span className="text-[10px] font-black text-slate-700">{sf.min}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk/ESG/Tax strip */}
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { label: "Risk Rating", value: fund.risk, sub: "Fund risk classification" },
                    { label: "ESG Score", value: fund.esg + "/100", sub: "Environmental & governance" },
                    { label: "WHT Tax", value: fund.taxRate + "%", sub: "Withheld at source" },
                  ].map(s => (
                    <div key={s.label} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">{s.label}</span>
                      <span className="text-xl font-black text-slate-900">{s.value}</span>
                      <span className="text-[9px] text-slate-400 font-bold block mt-1">{s.sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HOW TO INVEST / CONTACTS */}
            {activeTab === "contact" && (
              <div className="space-y-8">

                {/* Contact cards */}
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-5">Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { icon: Phone, label: "Main Line", value: fund.contacts.phone, href: `tel:${fund.contacts.phone}` },
                      { icon: Zap, label: "WhatsApp", value: fund.contacts.whatsapp, href: `https://wa.me/${fund.contacts.whatsapp.replace(/\D/g,"")}` },
                      { icon: Mail, label: "Email", value: fund.contacts.email, href: `mailto:${fund.contacts.email}` },
                      { icon: Globe, label: "Website", value: fund.contacts.website, href: `https://${fund.contacts.website}` },
                    ].map(c => (
                      <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-4 p-5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white transition-all group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: fund.color + "20" }}>
                          <c.icon className="w-5 h-5" style={{ color: fund.color }} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{c.label}</p>
                          <p className="text-sm font-black text-slate-900 group-hover:text-blue-700 transition-colors">{c.value}</p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-slate-600 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4 p-6 rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: fund.color + "20" }}>
                    <MapPin className="w-5 h-5" style={{ color: fund.color }} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Office Address</p>
                    <p className="text-sm font-black text-slate-900">{fund.contacts.address}</p>
                  </div>
                </div>

                {/* Relationship Manager */}
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Your Dedicated Relationship Manager</h3>
                  <div className="flex items-center gap-6 p-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0" style={{ background: fund.color }}>
                      {fund.contacts.relationshipManager.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-slate-900">{fund.contacts.relationshipManager}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Relationship Manager · {fund.manager}</p>
                      <div className="flex gap-4 mt-3">
                        <a href={`tel:${fund.contacts.rmPhone}`} className="flex items-center gap-1.5 text-[9px] font-black text-slate-600 hover:text-blue-700 uppercase tracking-widest transition-colors">
                          <Phone className="w-3 h-3" /> {fund.contacts.rmPhone}
                        </a>
                        <a href={`mailto:${fund.contacts.rmEmail}`} className="flex items-center gap-1.5 text-[9px] font-black text-slate-600 hover:text-blue-700 uppercase tracking-widest transition-colors">
                          <Mail className="w-3 h-3" /> Email
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How to invest steps */}
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-5">How to Invest — Step by Step</h3>
                  <div className="space-y-3">
                    {fund.howToInvest.map((step: string, i: number) => (
                      <div key={i} className="flex items-start gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0" style={{ background: fund.color }}>
                          {i + 1}
                        </div>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* FAQ */}
            {activeTab === "faq" && (
              <div className="space-y-4">
                {fund.faq.map((item: any, i: number) => (
                  <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-start gap-3 mb-3">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: fund.color }} />
                      <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{item.q}</h3>
                    </div>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed pl-7">{item.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="rounded-[2.5rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, #0f172a, #1e293b)` }}>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ background: fund.color }} />
          <div className="relative z-10">
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Invest in {fund.code} Today</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Min KES {fund.minInvest.toLocaleString()} · Targeting {fund.targetReturn} p.a. · {fund.liquidity} Liquidity
            </p>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <button onClick={() => setActiveTab("contact")} className="flex items-center gap-2 px-6 py-3.5 text-white text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all" style={{ background: fund.color }}>
              <Phone className="w-4 h-4" /> Contact Manager
            </button>
            <Link href="/tools/compare" className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all">
              <BarChart2 className="w-4 h-4" /> Compare Funds
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
