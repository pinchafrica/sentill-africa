"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import {
  ArrowLeft, ChevronRight, Shield, CheckCircle, AlertCircle, Star,
  Plus, TrendingUp, Activity, Leaf, Clock, Percent, DollarSign,
  BarChart2, Info, Zap, Bell, Calculator, Award, ArrowUpRight, Users
} from "lucide-react";
import { useParams } from "next/navigation";
import { useAIStore } from "@/lib/store";

// ─── FUND DATABASE ────────────────────────────────────────────────────────────

const FUNDS: Record<string, any> = {
  etca: {
    id: "etca", code: "ETCA", name: "Etica Capital MMF (Zidi)", manager: "Etica Capital Ltd",
    yield7d: 18.20, yield30d: 18.05, yield90d: 17.90, yield1y: 17.5,
    aum: 15.2, minInvest: 1000, liquidity: "T+1", risk: "Low", riskScore: 18,
    taxRate: 15, netYield: 15.47, esg: 82, cmaLicensed: true, inceptionDate: "2019",
    nav: 1.0891, currency: "KES", mgmtFee: 1.5, perfFee: 0,
    color: "#10b981", paybill: "511116", mpesaEnabled: true,
    category: "Income", subcategory: "Money Market",
    custodian: "Stanbic Bank Kenya", auditor: "Deloitte Kenya",
    description: "Etica Wealth MMF is Kenya's highest-yielding CMA-licensed money market fund, consistently delivering industry-leading returns through a concentrated allocation to high-grade T-bills, IFBs, and bank placements. The fund is accessible from as little as KES 100 via M-Pesa paybill 511116.",
    investmentStrategy: "The fund invests primarily in 91-day and 182-day CBK T-bills (≥60% allocation), complemented by short-dated government bonds and overnight/7-day bank placements at top-tier institutions. The portfolio is rebalanced weekly to optimise the yield-liquidity trade-off.",
    allocation: [
      { asset: "T-Bills (91d)", pct: 45 }, { asset: "T-Bills (182d)", pct: 22 },
      { asset: "Bank Placements", pct: 18 }, { asset: "IFBs", pct: 10 }, { asset: "Cash", pct: 5 },
    ],
    yieldHistory: [
      { month: "Mar'25", yield: 15.1 }, { month: "Apr'25", yield: 15.4 }, { month: "May'25", yield: 15.8 },
      { month: "Jun'25", yield: 16.1 }, { month: "Jul'25", yield: 16.3 }, { month: "Aug'25", yield: 16.5 },
      { month: "Sep'25", yield: 16.8 }, { month: "Oct'25", yield: 17.0 }, { month: "Nov'25", yield: 17.1 },
      { month: "Dec'25", yield: 17.8 }, { month: "Jan'26", yield: 18.0 }, { month: "Apr'26", yield: 18.2 },
    ],
    navHistory: [
      { month: "Mar'25", nav: 1.0620 }, { month: "Apr'25", nav: 1.0652 }, { month: "May'25", nav: 1.0689 },
      { month: "Jun'25", nav: 1.0714 }, { month: "Jul'25", nav: 1.0738 }, { month: "Aug'25", nav: 1.0762 },
      { month: "Sep'25", nav: 1.0783 }, { month: "Oct'25", nav: 1.0801 }, { month: "Nov'25", nav: 1.0818 },
      { month: "Dec'25", nav: 1.0829 }, { month: "Jan'26", nav: 1.0837 }, { month: "Feb'26", nav: 1.0847 },
    ],
    peers: [
      { id: "lofty", name: "Lofty-Corpin MMF", yield: 17.50, color: "#6366f1" },
      { id: "brtm", name: "Britam MMF", yield: 15.50, color: "#f59e0b" },
      { id: "snlm", name: "Sanlam MMF", yield: 15.10, color: "#8b5cf6" },
    ],
    news: [
      { title: "Etica Capital MMF (Zidi) Tops Kenya MMF League at 18.20%", time: "1d ago", source: "Business Daily" },
      { title: "CMA Confirms Etica Wealth Full Compliance for FY2025", time: "1w ago", source: "CMA Kenya" },
    ],
    faq: [
      { q: "How do I invest?", a: "Send money via M-Pesa Paybill 511116, Account Number: your registered phone number. Minimum KES 100." },
      { q: "When do I earn interest?", a: "Interest accrues daily and is reflected in your growing unit balance. It compounds monthly." },
      { q: "Can I withdraw anytime?", a: "Yes. Redemption requests are processed T+1 — funds reach your M-Pesa or bank account next business day." },
      { q: "Is it insured?", a: "The fund is CMA-licensed and regulated. Client funds are ring-fenced from the fund manager's balance sheet." },
    ],
  },
  brtm: {
    id: "brtm", code: "BRTM", name: "Britam Money Market Fund", manager: "Britam Asset Managers",
    yield7d: 15.50, yield30d: 15.30, yield90d: 15.10, yield1y: 14.5,
    aum: 8.4, minInvest: 1000, liquidity: "T+1", risk: "Low", riskScore: 15,
    taxRate: 15, netYield: 13.18, esg: 71, cmaLicensed: true, inceptionDate: "2010",
    nav: 1.0589, currency: "KES", mgmtFee: 2.0, perfFee: 0,
    color: "#f59e0b", paybill: "603040", mpesaEnabled: true,
    category: "Income", subcategory: "Money Market",
    custodian: "Standard Chartered Kenya", auditor: "PWC Kenya",
    description: "Britam MMF is a well-established money market fund managed by Britam Asset Managers, a subsidiary of Britam Holdings PLC — one of Kenya's largest listed insurance and financial services groups. With over KES 12B AUM, the fund offers competitive yields, strong liquidity, and the backing of a highly regulated group.",
    investmentStrategy: "The fund maintains a diversified short-term fixed income portfolio including T-Bills, bank placements, and commercial paper from top-rated Kenyan corporates. The strategy prioritises capital preservation and stable income generation.",
    allocation: [
      { asset: "T-Bills", pct: 40 }, { asset: "Bank Placements", pct: 35 },
      { asset: "Commercial Paper", pct: 15 }, { asset: "Bonds", pct: 5 }, { asset: "Cash", pct: 5 },
    ],
    yieldHistory: [
      { month: "Mar'25", yield: 12.8 }, { month: "Apr'25", yield: 13.0 }, { month: "May'25", yield: 13.2 },
      { month: "Jun'25", yield: 13.5 }, { month: "Jul'25", yield: 13.6 }, { month: "Aug'25", yield: 13.7 },
      { month: "Sep'25", yield: 13.8 }, { month: "Oct'25", yield: 14.0 }, { month: "Nov'25", yield: 14.1 },
      { month: "Dec'25", yield: 14.0 }, { month: "Jan'26", yield: 14.1 }, { month: "Feb'26", yield: 14.2 },
    ],
    navHistory: [
      { month: "Mar'25", nav: 1.0380 }, { month: "Apr'25", nav: 1.0402 }, { month: "May'25", nav: 1.0425 },
      { month: "Jun'25", nav: 1.0448 }, { month: "Jul'25", nav: 1.0464 }, { month: "Aug'25", nav: 1.0480 },
      { month: "Sep'25", nav: 1.0497 }, { month: "Oct'25", nav: 1.0514 }, { month: "Nov'25", nav: 1.0530 },
      { month: "Dec'25", nav: 1.0549 }, { month: "Jan'26", nav: 1.0568 }, { month: "Feb'26", nav: 1.0589 },
    ],
    peers: [
      { id: "etca", name: "Etica Wealth MMF", yield: 17.55, color: "#10b981" },
      { id: "eqty", name: "Equity MMF", yield: 13.8, color: "#8b5cf6" },
      { id: "cicm", name: "CIC MMF", yield: 13.6, color: "#ec4899" },
    ],
    news: [
      { title: "Britam Reports Record MMF Inflows Amid Rate Cycle", time: "3d ago", source: "Britam Holdings" },
      { title: "Britam Asset Managers Wins Best Fund Manager Award", time: "2w ago", source: "Financial Times Africa" },
    ],
    faq: [
      { q: "How do I invest?", a: "Via M-Pesa Paybill 603040 or bank transfer. Minimum KES 500." },
      { q: "What is the management fee?", a: "2.0% per annum, deducted from gross returns before yield reporting." },
      { q: "Is the fund insured?", a: "CMA-licensed and regulated. Assets held in custody at Standard Chartered Kenya." },
    ],
  },
  ncba: {
    id: "ncba", code: "NCBA", name: "NCBA MMF", manager: "NCBA Investment Bank",
    yield7d: 12.1, yield30d: 11.89, yield90d: 11.6, yield1y: 11.2,
    aum: 31.4, minInvest: 100, liquidity: "T+0", risk: "Low", riskScore: 12,
    taxRate: 15, netYield: 10.29, esg: 70, cmaLicensed: true, inceptionDate: "2013",
    nav: 1.0378, currency: "KES", mgmtFee: 1.5, perfFee: 0,
    color: "#a855f7", paybill: "880100", mpesaEnabled: true,
    category: "Income", subcategory: "Money Market",
    custodian: "NCBA Bank Kenya", auditor: "KPMG Kenya",
    description: "NCBA MMF is Kenya's largest money market fund by AUM with KES 31.4B under management. It offers instant T+0 liquidity directly integrated with the NCBA Loop mobile banking platform, making it the go-to liquidity vehicle for NCBA bank customers and institutional cash managers.",
    investmentStrategy: "The fund focuses on highly liquid, short-duration instruments: overnight repos, T-bills (primarily 91-day), and demand deposits at top-tier banks. The T+0 liquidity requirement constrains the fund to maintain ≥30% overnight liquidity at all times, slightly compressing yield relative to T+1 peers.",
    allocation: [
      { asset: "Overnight Repos", pct: 35 }, { asset: "T-Bills (91d)", pct: 40 },
      { asset: "Bank Deposits", pct: 20 }, { asset: "Cash", pct: 5 },
    ],
    yieldHistory: [
      { month: "Mar'25", yield: 10.9 }, { month: "Apr'25", yield: 11.1 }, { month: "May'25", yield: 11.2 },
      { month: "Jun'25", yield: 11.4 }, { month: "Jul'25", yield: 11.5 }, { month: "Aug'25", yield: 11.6 },
      { month: "Sep'25", yield: 11.7 }, { month: "Oct'25", yield: 11.8 }, { month: "Nov'25", yield: 11.9 },
      { month: "Dec'25", yield: 12.0 }, { month: "Jan'26", yield: 12.0 }, { month: "Feb'26", yield: 12.1 },
    ],
    navHistory: [
      { month: "Mar'25", nav: 1.0289 }, { month: "Apr'25", nav: 1.0299 }, { month: "May'25", nav: 1.0310 },
      { month: "Jun'25", nav: 1.0319 }, { month: "Jul'25", nav: 1.0329 }, { month: "Aug'25", nav: 1.0339 },
      { month: "Sep'25", nav: 1.0348 }, { month: "Oct'25", nav: 1.0358 }, { month: "Nov'25", nav: 1.0367 },
      { month: "Dec'25", nav: 1.0372 }, { month: "Jan'26", nav: 1.0375 }, { month: "Feb'26", nav: 1.0378 },
    ],
    peers: [
      { id: "etca", name: "Etica Wealth MMF", yield: 17.55, color: "#10b981" },
      { id: "eqty", name: "Equity MMF", yield: 13.8, color: "#8b5cf6" },
      { id: "kcbm", name: "KCB MMF", yield: 11.4, color: "#22c55e" },
    ],
    news: [
      { title: "NCBA MMF Hits KES 31B AUM, Largest in Kenya", time: "1w ago", source: "NCBA Group" },
    ],
    faq: [
      { q: "How do I invest?", a: "Available directly in NCBA Loop app. Also via M-Pesa Paybill 880100. Minimum KES 100." },
      { q: "What is T+0 liquidity?", a: "Your redemption is processed same business day — funds available in your NCBA account instantly during banking hours." },
    ],
  },
};

const DEFAULT_FUND = FUNDS["etca"];

// ─── DARK TOOLTIP ─────────────────────────────────────────────────────────────

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-xl">
      {label && <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex justify-between gap-6">
          <span className="text-[9px] text-slate-400">{p.name}</span>
          <span className="text-[10px] font-black text-white">{typeof p.value === "number" ? p.value.toFixed(p.value < 5 ? 4 : 2) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const EXTRA_FUNDS: Record<string, any> = {
  "sanlam": { name: "Sanlam MMF", manager: "Sanlam Investments", yield7d: 15.10 },
  "cic": { name: "CIC MMF", manager: "CIC Asset Management", yield7d: 13.60 },
  "cicm": { name: "CIC MMF", manager: "CIC Asset Management", yield7d: 13.60 },
  "omam": { name: "Old Mutual MMF", manager: "Old Mutual Investment Group", yield7d: 13.40 },
  "cytonn": { name: "Cytonn MMF", manager: "Cytonn Investments", yield7d: 16.90 },
  "absa": { name: "Absa MMF", manager: "Absa Asset Management", yield7d: 13.20 },
  "icea": { name: "ICEA Lion MMF", manager: "ICEA Lion Asset Management", yield7d: 14.50 },
  "genghis": { name: "Genghis Capital MMF", manager: "Genghis Capital", yield7d: 14.5 },
  "lofty": { name: "Lofty-Corpin MMF", manager: "Lofty-Corpin Investments", yield7d: 17.50 },
  "enwealth": { name: "Enwealth MMF", manager: "Enwealth Financial", yield7d: 14.1 },
  "apollo": { name: "Apollo MMF", manager: "Apollo Asset Management", yield7d: 15.0 },
  "genafrica": { name: "GenAfrica MMF", manager: "GenAfrica Asset Managers", yield7d: 14.3 },
  "dryassoc": { name: "Dry Associates MMF", manager: "Dry Associates", yield7d: 14.9 },
  "madison": { name: "Madison MMF", manager: "Madison Investment", yield7d: 13.8 },
  "coop": { name: "Co-op Trust MMF", manager: "Co-op Trust Investments", yield7d: 13.2 },
  "oldmutual": { name: "Old Mutual MMF", manager: "Old Mutual Investment Group", yield7d: 13.40 },
  "orient": { name: "Orient MMF", manager: "Orient Asset Managers", yield7d: 14.05 },
  "kuza": { name: "Kuza MMF", manager: "Kuza Asset Management", yield7d: 16.5 },
  "absa-mmf": { name: "Absa MMF", manager: "Absa Asset Management", yield7d: 13.20 },
  "jubilee-mmf": { name: "Jubilee MMF", manager: "Jubilee Asset Management", yield7d: 13.9 },
  "african-alliance": { name: "African Alliance MMF", manager: "African Alliance", yield7d: 13.0 }
};

import { useMarketRates } from "@/lib/useMarketRates";

export default function MMFFundPage() {
  const params = useParams();
  const idParam = (params?.id as string)?.toLowerCase() || "etca";
  
  let baseFund = FUNDS[idParam];
  if (!baseFund && EXTRA_FUNDS[idParam]) {
    const extra = EXTRA_FUNDS[idParam];
    baseFund = {
      ...DEFAULT_FUND,
      id: idParam,
      code: idParam.toUpperCase().slice(0,4),
      name: extra.name,
      manager: extra.manager,
      yield7d: extra.yield7d,
      yield30d: +(extra.yield7d - 0.2).toFixed(2),
      yield90d: +(extra.yield7d - 0.5).toFixed(2),
      yield1y: +(extra.yield7d - 0.8).toFixed(2),
      color: "#64748b",
      description: `${extra.name} is a premier money market fund managed by ${extra.manager}, offering competitive yields and capital preservation for Kenyan investors.`,
    };
  } else if (!baseFund) {
    baseFund = DEFAULT_FUND;
  }

  // Deep clone to avoid mutating the static object
  let fund = JSON.parse(JSON.stringify(baseFund));

  // ── LIVE RATES OVERRIDE ──
  const { funds: liveFunds } = useMarketRates();
  const liveMatch = liveFunds.find(f => f.id === fund.id || f.code.toLowerCase() === fund.code.toLowerCase());
  
  if (liveMatch) {
    fund.yield7d = liveMatch.yield7d;
    fund.yield30d = liveMatch.yield30d;
    fund.yield90d = liveMatch.yield90d;
    fund.yield1y = liveMatch.yield1y;
    fund.aum = liveMatch.aum || fund.aum;
    fund.netYield = Number((liveMatch.yield7d * (1 - (fund.taxRate || 15) / 100)).toFixed(2));
    
    // Also override peer yields if they are in the live db
    if (fund.peers) {
      fund.peers = fund.peers.map((p: any) => {
        const pMatch = liveFunds.find(lf => lf.id === p.id || lf.code.toLowerCase() === p.id.toLowerCase());
        return pMatch ? { ...p, yield: pMatch.yield7d } : p;
      });
    }
  }

  const { watchlist, toggleWatchlist } = useAIStore();
  const watchlisted = watchlist.includes(fund.id);

  const [alertSet, setAlertSet] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "portfolio" | "tax" | "faq">("overview");
  const [taxPrincipal, setTaxPrincipal] = useState(500000);
  const [taxPeriod, setTaxPeriod] = useState(12);

  // Tax calculator
  const grossReturn = taxPrincipal * (fund.yield7d / 100) * (taxPeriod / 12);
  const whtTax = grossReturn * (fund.taxRate / 100);
  const netReturn = grossReturn - whtTax;
  const netYield = fund.yield7d * (1 - fund.taxRate / 100);

  const compoundData = [1, 3, 6, 12, 24, 36].map(m => {
    const r = fund.yield7d / 100 / 12;
    const rNet = netYield / 100 / 12;
    return {
      label: m < 12 ? `${m}M` : `${m / 12}Y`,
      gross: Math.round(taxPrincipal * Math.pow(1 + r, m)),
      net: Math.round(taxPrincipal * Math.pow(1 + rNet, m)),
    };
  });

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── BREADCRUMB ── */}
      <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex items-center gap-2">
        <Link href="/markets/mmfs" className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 hover:text-slate-700 uppercase tracking-widest transition-colors">
          <ArrowLeft className="w-3 h-3" /> Money Market Funds
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">{fund.code}</span>
      </div>

      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 px-6 md:px-10 pt-8 pb-14">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">

          {/* Identity */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl" style={{ background: fund.color }}>
                {fund.code.slice(0, 2)}
              </div>
              <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">{fund.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{fund.manager}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Since {fund.inceptionDate}</span>
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
                <Leaf className="w-3 h-3 text-emerald-400" />
                <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">ESG {fund.esg}/100</span>
              </div>
              {fund.mpesaEnabled && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span className="text-[9px] text-amber-300 font-black uppercase tracking-widest">M-Pesa {fund.paybill}</span>
                </div>
              )}
            </div>
          </div>

          {/* Yield + Actions */}
          <div className="flex flex-col lg:items-end gap-4">
            <div>
              <div className="flex items-end gap-4">
                <div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">7-Day Yield</div>
                  <div className="text-5xl font-black tracking-tighter" style={{ color: fund.color }}>{fund.yield7d}%</div>
                </div>
                <div className="pb-1">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Net (after WHT)</div>
                  <div className="text-2xl font-black text-white">{fund.netYield}%</div>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                NAV: {fund.nav.toFixed(4)} · AUM: KES {fund.aum}B · Min: KES {fund.minInvest.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => toggleWatchlist(fund.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${watchlisted ? "bg-amber-500 border-amber-500 text-white" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}>
                <Star className={`w-3.5 h-3.5 ${watchlisted ? "fill-white" : ""}`} />{watchlisted ? "Watching" : "Watchlist"}
              </button>
              <button onClick={() => setAlertSet(a => !a)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${alertSet ? "bg-indigo-500 border-indigo-500 text-white" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}>
                <Bell className="w-3.5 h-3.5" />{alertSet ? "Alert On" : "Set Alert"}
              </button>
              <button 
                onClick={() => { 
                  setActiveTab("tax"); 
                  setTimeout(() => {
                    const el = document.getElementById("tax-calculator-section");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "center" });
                    } else {
                      window.scrollTo({ top: document.body.scrollHeight / 2, behavior: "smooth" });
                    }
                  }, 100);
                }} 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-[9px] font-black uppercase tracking-widest transition-all"
              >
                <Calculator className="w-3.5 h-3.5" /> Quick Calc
              </button>
              <Link href={`/dashboard/assets?logAsset=${fund.id}`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-400 text-white transition-all">
                <Plus className="w-3.5 h-3.5" />Invest Now
              </Link>
            </div>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-6">
          {[
            { label: "30d Yield", value: fund.yield30d + "%" },
            { label: "90d Yield", value: fund.yield90d + "%" },
            { label: "1Y Yield", value: fund.yield1y + "%" },
            { label: "NAV", value: fund.nav.toFixed(4) },
            { label: "AUM", value: "KES " + fund.aum + "B" },
            { label: "Mgmt Fee", value: fund.mgmtFee + "%" },
            { label: "Min Invest", value: "KES " + fund.minInvest },
            { label: "Risk", value: fund.risk },
          ].map(k => (
            <div key={k.label} className="bg-white/5 rounded-xl p-3 border border-white/10">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{k.label}</span>
              <span className="text-sm font-black text-white">{k.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 md:px-10 py-8 space-y-8">

        {/* ── YIELD & NAV CHARTS ── */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">12-Month Yield History</h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-5">7-day annualised effective yield</p>
            <ResponsiveContainer minWidth={1} width="100%" height={200}>
              <AreaChart data={fund.yieldHistory}>
                <defs>
                  <linearGradient id="yGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={fund.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={fund.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                <YAxis domain={["auto", "auto"]} tickFormatter={v => v + "%"} tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                <Tooltip content={<DarkTooltip />} />
                <Area type="monotone" dataKey="yield" name="7d Yield %" stroke={fund.color} fill="url(#yGrad)" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">NAV Per Unit</h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-5">Net Asset Value · KES per unit</p>
            <ResponsiveContainer minWidth={1} width="100%" height={200}>
              <LineChart data={fund.navHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                <YAxis domain={["auto", "auto"]} tickFormatter={v => v.toFixed(4)} tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                <Tooltip content={<DarkTooltip />} />
                <Line type="monotone" dataKey="nav" name="NAV" stroke="#6366f1" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── DETAIL TABS ── */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100">
            {(["overview", "portfolio", "tax", "faq"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-5 text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600"}`}
              >
                {tab === "tax" ? "Tax Calc" : tab === "faq" ? "FAQ" : tab}
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
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{fund.investmentStrategy}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: "Custodian", value: fund.custodian },
                    { label: "Auditor", value: fund.auditor },
                    { label: "Tax on Returns", value: `${fund.taxRate}% WHT (final)` },
                    { label: "Category", value: fund.category + " · " + fund.subcategory },
                    { label: "NAV Frequency", value: "Daily publication" },
                    { label: "CMA Status", value: fund.cmaLicensed ? "Full License ✓" : "Pending" },
                  ].map(d => (
                    <div key={d.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{d.label}</span>
                      <span className="text-[10px] font-black text-slate-700">{d.value}</span>
                    </div>
                  ))}
                </div>

                {/* Peer comparison */}
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">vs Peers (7d Yield)</h3>
                  <div className="space-y-3">
                    {[{ id: fund.id, name: fund.name, yield: fund.yield7d, color: fund.color, isThis: true }, ...fund.peers].map((p: any) => (
                      <div key={p.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${p.isThis ? "border-slate-200 bg-slate-50" : "border-slate-100 hover:border-slate-200"}`}>
                        {p.isThis && <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                        <span className="text-[10px] font-black text-slate-700 flex-1">{p.name}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${(p.yield / 20) * 100}%`, background: p.color }} />
                          </div>
                          <span className="text-sm font-black text-slate-900 w-14 text-right" style={{ color: p.color }}>{p.yield}%</span>
                        </div>
                        {!p.isThis && (
                          <Link href={`/markets/mmfs/${p.id}`} className="text-[8px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700">View →</Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PORTFOLIO ALLOCATION */}
            {activeTab === "portfolio" && (
              <div className="space-y-6">
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
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Duration</span>
                    <span className="text-xl font-black text-slate-900">~45 days</span>
                    <span className="text-[9px] text-slate-400 font-bold block mt-1">Weighted average maturity</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Credit Quality</span>
                    <span className="text-xl font-black text-emerald-600">AAA / AA</span>
                    <span className="text-[9px] text-slate-400 font-bold block mt-1">All issuers investment grade</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Max Single Issuer</span>
                    <span className="text-xl font-black text-slate-900">25%</span>
                    <span className="text-[9px] text-slate-400 font-bold block mt-1">CMA regulatory limit</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAX CALCULATOR */}
            {activeTab === "tax" && (
              <div id="tax-calculator-section" className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Principal (KES)</label>
                    <input type="number" value={taxPrincipal} onChange={e => setTaxPrincipal(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-black text-slate-900 outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Period (Months)</label>
                    <input type="number" min={1} max={120} value={taxPeriod} onChange={e => setTaxPeriod(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-black text-slate-900 outline-none focus:border-emerald-400" />
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {[3, 6, 12, 24].map(v => (
                        <button key={v} onClick={() => setTaxPeriod(v)} className="text-[8px] font-black text-slate-400 hover:text-emerald-600 px-1.5 py-0.5 bg-slate-50 rounded border border-slate-100 hover:border-emerald-200 transition-all">{v < 12 ? v + "M" : v / 12 + "Y"}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="p-4 rounded-xl border" style={{ background: fund.color + "10", borderColor: fund.color + "30" }}>
                      <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: fund.color }}>WHT Rate</span>
                      <span className="text-xl font-black text-slate-900">{fund.taxRate}%</span>
                      <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Withheld at source</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Gross Return", value: `KES ${Math.round(grossReturn).toLocaleString()}`, color: "text-slate-800", bg: "bg-slate-50 border-slate-200" },
                    { label: "WHT (15%)", value: `-KES ${Math.round(whtTax).toLocaleString()}`, color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
                    { label: "Net Return", value: `KES ${Math.round(netReturn).toLocaleString()}`, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
                    { label: "Net Yield (ann.)", value: `${netYield.toFixed(2)}%`, color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-200" },
                  ].map(r => (
                    <div key={r.label} className={`rounded-2xl border p-5 ${r.bg}`}>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2">{r.label}</span>
                      <span className={`text-lg font-black ${r.color}`}>{r.value}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Compound Growth Projection</h3>
                  <ResponsiveContainer minWidth={1} width="100%" height={200}>
                    <BarChart data={compoundData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                      <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}K`} tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                      <Tooltip content={({ active, payload, label }: any) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-xl">
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">{label}</p>
                            {payload.map((p: any) => (
                              <div key={p.name} className="flex justify-between gap-6">
                                <span className="text-[9px] text-slate-400">{p.name}</span>
                                <span className="text-[10px] font-black text-white">KES {Number(p.value).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }} />
                      <Bar dataKey="gross" name="Gross Value" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="net" name="Net Value" fill={fund.color} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* FAQ */}
            {activeTab === "faq" && (
              <div className="space-y-4">
                {fund.faq.map((item: any, i: number) => (
                  <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2">{item.q}</h3>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── NEWS ── */}
        {fund.news?.length > 0 && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-5">Latest News</h2>
            <div className="space-y-4">
              {fund.news.map((n: any, i: number) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all cursor-pointer">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: fund.color + "20" }}>
                    <Activity className="w-4 h-4" style={{ color: fund.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-black text-slate-900">{n.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{n.source}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[9px] font-bold text-slate-400">{n.time}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-[2.5rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Start Investing in {fund.code}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Min KES {fund.minInvest.toLocaleString()} · {fund.liquidity} · {fund.taxRate}% WHT · {fund.yield7d}% gross yield
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/assets?logAsset=${fund.id}`} className="flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all">
              <Plus className="w-4 h-4" /> Invest Now
            </Link>
            <Link href="/tools/compare" className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all">
              <BarChart2 className="w-4 h-4" /> Compare Funds
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
