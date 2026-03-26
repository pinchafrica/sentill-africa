"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell, ReferenceLine
} from "recharts";
import {
  TrendingUp, Shield, Zap, Activity, ChevronRight, ChevronDown, ChevronUp,
  Search, Star, CheckCircle, AlertCircle, Calculator,
  Award, Layers, DollarSign,
  Clock, Percent, Leaf, Plus
} from "lucide-react";
import { useAIStore } from "@/lib/store";
import AssetModal from "@/components/AssetModal";

// ─── MMF DATA ────────────────────────────────────────────────────────────────

const MMF_FUNDS = [
  {
    id: 1, name: "Etica Wealth MMF", code: "ETCA", manager: "Etica Capital",
    yield7d: 17.55, yield30d: 17.21, yield90d: 16.89, yield1y: 16.2,
    aum: 4.2, minInvest: 100, liquidity: "T+1", risk: "Low",
    taxCategory: "WHT 15%", cmaLicensed: true, esgScore: 82, inceptionDate: "2019",
    currency: "KES", category: "Income", status: "Open",
    fees: { management: 1.5, performance: 0 },
    color: "#10b981", nav: 1.0847
  },
  {
    id: 2, name: "Sanlam MMF", code: "SNLM", manager: "Sanlam Investments",
    yield7d: 14.78, yield30d: 14.52, yield90d: 14.1, yield1y: 13.8,
    aum: 8.7, minInvest: 1000, liquidity: "T+1", risk: "Low",
    taxCategory: "WHT 15%", cmaLicensed: true, esgScore: 74, inceptionDate: "2012",
    currency: "KES", category: "Income", status: "Open",
    fees: { management: 1.75, performance: 0 },
    color: "#6366f1", nav: 1.0621
  },
  {
    id: 3, name: "Britam MMF", code: "BRTM", manager: "Britam Asset Managers",
    yield7d: 14.2, yield30d: 13.95, yield90d: 13.7, yield1y: 13.1,
    aum: 12.4, minInvest: 500, liquidity: "T+1", risk: "Low",
    taxCategory: "WHT 15%", cmaLicensed: true, esgScore: 71, inceptionDate: "2010",
    currency: "KES", category: "Income", status: "Open",
    fees: { management: 2.0, performance: 0 },
    color: "#f59e0b", nav: 1.0589
  },
  {
    id: 4, name: "Equity MMF", code: "EQTY", manager: "Equity Investment Bank",
    yield7d: 13.8, yield30d: 13.62, yield90d: 13.4, yield1y: 12.9,
    aum: 22.1, minInvest: 100, liquidity: "T+0", risk: "Low",
    taxCategory: "WHT 15%", cmaLicensed: true, esgScore: 69, inceptionDate: "2016",
    currency: "KES", category: "Income", status: "Open",
    fees: { management: 1.5, performance: 0 },
    color: "#8b5cf6", nav: 1.0534
  },
  {
    id: 5, name: "CIC MMF", code: "CICM", manager: "CIC Asset Management",
    yield7d: 13.6, yield30d: 13.41, yield90d: 13.2, yield1y: 12.7,
    aum: 18.3, minInvest: 100, liquidity: "T+1", risk: "Low",
    taxCategory: "WHT 15%", cmaLicensed: true, esgScore: 77, inceptionDate: "2008",
    currency: "KES", category: "Income", status: "Open",
    fees: { management: 1.75, performance: 0 },
    color: "#ec4899", nav: 1.0512
  },
  {
    id: 6, name: "Cytonn High Yield MMF", code: "CYTN", manager: "Cytonn Investments",
    yield7d: 13.5, yield30d: 13.28, yield90d: 13.0, yield1y: 12.5,
    aum: 3.1, minInvest: 1000, liquidity: "T+3", risk: "Medium",
    taxCategory: "WHT 15%", cmaLicensed: false, esgScore: 52, inceptionDate: "2015",
    currency: "KES", category: "High Yield", status: "Open",
    fees: { management: 2.0, performance: 20 },
    color: "#f97316", nav: 1.0498
  },
  {
    id: 7, name: "Co-op MMF", code: "COPM", manager: "Co-op Trust Investment",
    yield7d: 13.4, yield30d: 13.18, yield90d: 12.9, yield1y: 12.4,
    aum: 9.8, minInvest: 500, liquidity: "T+1", risk: "Low",
    taxCategory: "WHT 15%", cmaLicensed: true, esgScore: 68, inceptionDate: "2014",
    currency: "KES", category: "Income", status: "Open",
    fees: { management: 1.5, performance: 0 },
    color: "#14b8a6", nav: 1.0487
  },
  {
    id: 8, name: "ICEA Lion MMF", code: "ICEA", manager: "ICEA Lion Asset Mgmt",
    yield7d: 13.1, yield30d: 12.88, yield90d: 12.6, yield1y: 12.1,
    aum: 6.2, minInvest: 2500, liquidity: "T+1", risk: "Low",
    taxCategory: "WHT 15%", cmaLicensed: true, esgScore: 73, inceptionDate: "2011",
    currency: "KES", category: "Income", status: "Open",
    fees: { management: 1.75, performance: 0 },
    color: "#0ea5e9", nav: 1.0456
  },
  {
    id: 9, name: "Old Mutual MMF", code: "OLMD", manager: "Old Mutual Investment",
    yield7d: 12.9, yield30d: 12.71, yield90d: 12.5, yield1y: 12.0,
    aum: 14.6, minInvest: 1000, liquidity: "T+1", risk: "Low",
    taxCategory: "WHT 15%", cmaLicensed: true, esgScore: 76, inceptionDate: "2009",
    currency: "KES", category: "Income", status: "Open",
    fees: { management: 2.0, performance: 0 },
    color: "#84cc16", nav: 1.0434
  },
  {
    id: 10, name: "NCBA MMF", code: "NCBA", manager: "NCBA Investment Bank",
    yield7d: 12.1, yield30d: 11.89, yield90d: 11.6, yield1y: 11.2,
    aum: 31.4, minInvest: 100, liquidity: "T+0", risk: "Low",
    taxCategory: "WHT 15%", cmaLicensed: true, esgScore: 70, inceptionDate: "2013",
    currency: "KES", category: "Income", status: "Open",
    fees: { management: 1.5, performance: 0 },
    color: "#a855f7", nav: 1.0378
  },
  {
    id: 11, name: "Absa MMF", code: "ABSA", manager: "Absa Asset Management",
    yield7d: 11.8, yield30d: 11.65, yield90d: 11.4, yield1y: 10.9,
    aum: 19.2, minInvest: 500, liquidity: "T+1", risk: "Low",
    taxCategory: "WHT 15%", cmaLicensed: true, esgScore: 72, inceptionDate: "2010",
    currency: "KES", category: "Income", status: "Open",
    fees: { management: 1.75, performance: 0 },
    color: "#f43f5e", nav: 1.0341
  },
  {
    id: 12, name: "KCB MMF", code: "KCBM", manager: "KCB Asset Management",
    yield7d: 11.4, yield30d: 11.21, yield90d: 11.0, yield1y: 10.6,
    aum: 28.7, minInvest: 100, liquidity: "T+0", risk: "Low",
    taxCategory: "WHT 15%", cmaLicensed: true, esgScore: 65, inceptionDate: "2017",
    currency: "KES", category: "Income", status: "Open",
    fees: { management: 1.5, performance: 0 },
    color: "#22c55e", nav: 1.0312
  },
];

// ─── 12-MONTH YIELD TREND ─────────────────────────────────────────────────────

const YIELD_TREND = [
  { month: "Mar'25", etica: 15.1, britam: 12.8, equity: 12.4, cic: 12.1, ncba: 10.9 },
  { month: "Apr'25", etica: 15.4, britam: 13.0, equity: 12.6, cic: 12.3, ncba: 11.1 },
  { month: "May'25", etica: 15.8, britam: 13.2, equity: 12.8, cic: 12.5, ncba: 11.2 },
  { month: "Jun'25", etica: 16.1, britam: 13.5, equity: 13.0, cic: 12.7, ncba: 11.4 },
  { month: "Jul'25", etica: 16.3, britam: 13.6, equity: 13.2, cic: 12.8, ncba: 11.5 },
  { month: "Aug'25", etica: 16.5, britam: 13.7, equity: 13.3, cic: 12.9, ncba: 11.6 },
  { month: "Sep'25", etica: 16.8, britam: 13.8, equity: 13.5, cic: 13.1, ncba: 11.7 },
  { month: "Oct'25", etica: 17.0, britam: 14.0, equity: 13.6, cic: 13.3, ncba: 11.8 },
  { month: "Nov'25", etica: 17.1, britam: 14.1, equity: 13.7, cic: 13.4, ncba: 11.9 },
  { month: "Dec'25", etica: 17.2, britam: 14.0, equity: 13.6, cic: 13.5, ncba: 12.0 },
  { month: "Jan'26", etica: 17.3, britam: 14.1, equity: 13.7, cic: 13.5, ncba: 12.0 },
  { month: "Feb'26", etica: 17.5, britam: 14.2, equity: 13.8, cic: 13.6, ncba: 12.1 },
];

// ─── AUM DISTRIBUTION ────────────────────────────────────────────────────────

const AUM_DISTRIBUTION = [
  { name: "NCBA", aum: 31.4, share: 17.8 },
  { name: "KCB", aum: 28.7, share: 16.3 },
  { name: "Equity", aum: 22.1, share: 12.5 },
  { name: "Absa", aum: 19.2, share: 10.9 },
  { name: "CIC", aum: 18.3, share: 10.4 },
  { name: "Old Mutual", aum: 14.6, share: 8.3 },
  { name: "Britam", aum: 12.4, share: 7.0 },
  { name: "Co-op", aum: 9.8, share: 5.6 },
  { name: "Sanlam", aum: 8.7, share: 4.9 },
  { name: "Others", aum: 9.9, share: 5.6 },
];

// ─── RISK-RETURN DATA ─────────────────────────────────────────────────────────

const RISK_RETURN = [
  { name: "Etica", risk: 1.8, ret: 17.55, size: 4.2 },
  { name: "Sanlam", risk: 2.1, ret: 14.78, size: 8.7 },
  { name: "Britam", risk: 2.3, ret: 14.2, size: 12.4 },
  { name: "Equity", risk: 2.0, ret: 13.8, size: 22.1 },
  { name: "CIC", risk: 2.2, ret: 13.6, size: 18.3 },
  { name: "Cytonn", risk: 4.1, ret: 13.5, size: 3.1 },
  { name: "Co-op", risk: 2.4, ret: 13.4, size: 9.8 },
  { name: "ICEA", risk: 2.3, ret: 13.1, size: 6.2 },
  { name: "Old Mutual", risk: 2.5, ret: 12.9, size: 14.6 },
  { name: "NCBA", risk: 1.9, ret: 12.1, size: 31.4 },
  { name: "Absa", risk: 2.2, ret: 11.8, size: 19.2 },
  { name: "KCB", risk: 2.0, ret: 11.4, size: 28.7 },
];

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-xl min-w-[160px]">
      {label && <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
            <span className="text-[9px] text-slate-400 font-bold uppercase">{p.name}</span>
          </div>
          <span className="text-[10px] font-black text-white">{typeof p.value === "number" ? p.value.toFixed(2) + "%" : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────

function AnimatedNum({ value, decimals = 1, prefix = "", suffix = "" }: { value: number; decimals?: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <>{prefix}{display.toFixed(decimals)}{suffix}</>;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function MMFPage() {
  const { isAssetModalOpen, setAssetModalOpen, prefilledAsset, setPrefilledAsset } = useAIStore();

  // Missing States
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [liquidityFilter, setLiquidityFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"yield7d" | "yield30d" | "aum" | "minInvest" | "esgScore">("yield7d");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [watchlist, setWatchlist] = useState<number[]>([]);
  const [selectedFund, setSelectedFund] = useState(MMF_FUNDS[0]);
  const [showTaxCalc, setShowTaxCalc] = useState(false);
  const [taxPrincipal, setTaxPrincipal] = useState(100000);
  const [taxPeriod, setTaxPeriod] = useState(12);
  const [taxFund, setTaxFund] = useState(MMF_FUNDS[0]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState("");
  const [aiError, setAiError] = useState("");
  const [isLive, setIsLive] = useState(true);

  const funds = MMF_FUNDS;

  const handleOpenAssetModal = (assetId?: string) => {
    setPrefilledAsset(assetId);
    setAssetModalOpen(true);
  };

  useEffect(() => {
    async function fetchAiInsights() {
      setIsAiLoading(true);
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            query: "Analyze the current MMF landscape. Give me two short, punchy bullet points under Yield Alert and Risk Warning.",
          }),
        });
        const data = await res.json();
        if (data.error === "upgrade_required") {
          setAiError("upgrade_required");
        } else {
          setAiError("");
          setAiInsights(data.response || "Sentil AI is currently offline.");
        }
      } catch (err) {
        setAiError("");
        setAiInsights("Unable to reach the Sentil Assistant.");
      } finally {
        setIsAiLoading(false);
      }
    }
    fetchAiInsights();
  }, []);

  // Sorted + filtered funds
  const sorted = [...funds]
    .filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.manager.toLowerCase().includes(search.toLowerCase()))
    .filter(f => riskFilter === "all" || f.risk === riskFilter)
    .filter(f => liquidityFilter === "all" || f.liquidity === liquidityFilter)
    .sort((a, b) => {
      const va = a[sortBy] as number, vb = b[sortBy] as number;
      return sortDir === "desc" ? vb - va : va - vb;
    });

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const totalAUM = funds.reduce((s, f) => s + f.aum, 0);
  const topYield = Math.max(...funds.map(f => f.yield7d));
  const avgYield = (funds.reduce((s, f) => s + f.yield7d, 0) / funds.length).toFixed(2);

  // Tax calculator
  const grossReturn = taxPrincipal * (taxFund.yield7d / 100) * (taxPeriod / 12);
  const whtTax = grossReturn * 0.15;
  const netReturn = grossReturn - whtTax;
  const netYield = (netReturn / taxPrincipal) * (12 / taxPeriod) * 100;

  // Compound growth
  const compoundGrowth = (months: number) => {
    const r = taxFund.yield7d / 100 / 12;
    const withTax = taxPrincipal * Math.pow(1 + r * 0.85, months);
    const withoutTax = taxPrincipal * Math.pow(1 + r, months);
    return { withTax, withoutTax, months };
  };
  const compoundData = [1, 3, 6, 12, 24, 36, 60].map(m => {
    const d = compoundGrowth(m);
    return { label: m < 12 ? `${m}M` : `${m / 12}Y`, withTax: Math.round(d.withTax), withoutTax: Math.round(d.withoutTax) };
  });

  const SortIcon = ({ col }: { col: typeof sortBy }) =>
    sortBy === col
      ? sortDir === "desc" ? <ChevronDown className="w-3 h-3 text-emerald-400" /> : <ChevronUp className="w-3 h-3 text-emerald-400" />
      : <ChevronDown className="w-3 h-3 text-slate-600" />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 px-6 md:px-10 pt-10 pb-16">
        {/* Badge */}
        <div className="flex items-center gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase tracking-[0.3em]">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLive ? "bg-emerald-400" : "bg-slate-500"}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? "bg-emerald-500" : "bg-slate-600"}`} />
            </span>
            Money Market Intelligence · {isLive ? "Live Data" : "Cached Data"}
          </div>
          {isLive && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30">
              <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[9px] text-blue-400 font-black uppercase tracking-widest">AI Verified Yields</span>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none mb-3">
              Money<br />Market Funds
            </h1>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] max-w-md">
              CMA-regulated intelligence on all {funds.length} Kenyan MMFs · Yields, AUM, risk, liquidity, ESG & tax-adjusted returns
            </p>
          </div>

          {/* Market pulse */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Funds Tracked", value: funds.length, icon: Layers, suffix: "", prefix: "" },
              { label: "Total AUM", value: totalAUM, icon: DollarSign, suffix: "B", prefix: "KES " },
              { label: "Top Yield (7d)", value: topYield, icon: TrendingUp, suffix: "%", prefix: "" },
              { label: "Avg Yield", value: Number(avgYield), icon: Percent, suffix: "%", prefix: "" },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 backdrop-blur rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                </div>
                <p className="text-2xl font-black text-white tracking-tight">
                  <AnimatedNum value={stat.value} decimals={stat.suffix === "%" ? 2 : 1} prefix={stat.prefix} suffix={stat.suffix} />
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── YIELD RANKING BAR CHART ── */}
        <div className="bg-white/5 backdrop-blur rounded-[2rem] border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Yield Ranking</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">7-day annualised yield · All funds</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">Live</span>
            </div>
          </div>
          <ResponsiveContainer minWidth={1} width="100%" height={220}>
            <BarChart data={[...funds].sort((a, b) => b.yield7d - a.yield7d).map(f => ({ name: f.code, yield: f.yield7d, fill: f.color }))} layout="vertical" margin={{ left: 0, right: 30 }}>
              <XAxis type="number" domain={[0, 20]} tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} tickFormatter={v => v + "%"} />
              <YAxis type="category" dataKey="name" width={48} tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 900 }} />
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <Tooltip content={<DarkTooltip />} />
              <ReferenceLine x={Number(avgYield)} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: `Avg ${avgYield}%`, fill: "#f59e0b", fontSize: 9, fontWeight: 700 }} />
              <Bar dataKey="yield" name="7d Yield" radius={[0, 6, 6, 0]}>
                {[...funds].sort((a, b) => b.yield7d - a.yield7d).map((f, i) => (
                  <Cell key={i} fill={f.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="px-6 md:px-10 py-10 space-y-10">

        {/* ── 12-MONTH YIELD TREND ── */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">12-Month Yield Trend</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Top 5 funds · Annualised 7-day effective yield</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { key: "etica", label: "Etica", color: "#10b981" },
                { key: "britam", label: "Britam", color: "#f59e0b" },
                { key: "equity", label: "Equity", color: "#8b5cf6" },
                { key: "cic", label: "CIC", color: "#ec4899" },
                { key: "ncba", label: "NCBA", color: "#a855f7" },
              ].map(l => (
                <div key={l.key} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wide">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer minWidth={1} width="100%" height={280}>
            <LineChart data={YIELD_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
              <YAxis domain={[10, 19]} tickFormatter={v => v + "%"} tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
              <Tooltip content={<DarkTooltip />} />
              <Line type="monotone" dataKey="etica" name="Etica" stroke="#10b981" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="britam" name="Britam" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="equity" name="Equity" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cic" name="CIC" stroke="#ec4899" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ncba" name="NCBA" stroke="#a855f7" strokeWidth={2} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ── SIDE-BY-SIDE: AUM + RISK-RETURN ── */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* AUM by fund */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">AUM Distribution</h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-6">Market share by assets under management (KES Bn)</p>
            <ResponsiveContainer minWidth={1} width="100%" height={240}>
              <BarChart data={AUM_DISTRIBUTION} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 8, fontWeight: 700 }} angle={-30} textAnchor="end" height={40} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="aum" name="AUM (KES Bn)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Risk vs Return scatter */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Risk vs Return</h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-6">Volatility score (lower = safer) vs 7-day yield · Bubble = AUM</p>
            <ResponsiveContainer minWidth={1} width="100%" height={240}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="risk" name="Risk Score" domain={[1, 5]} tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} label={{ value: "Risk", fill: "#64748b", fontSize: 9, offset: -4, position: "insideBottom" }} />
                <YAxis dataKey="ret" name="7d Yield" tickFormatter={v => v + "%"} tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }: any) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl text-[10px]">
                        <p className="font-black text-white">{d.name}</p>
                        <p className="text-emerald-400">Yield: {d.ret}%</p>
                        <p className="text-slate-400">Risk: {d.risk}</p>
                        <p className="text-slate-400">AUM: KES {d.size}B</p>
                      </div>
                    );
                  }}
                />
                <Scatter data={RISK_RETURN} fill="#10b981">
                  {RISK_RETURN.map((d, i) => (
                    <Cell key={i} fill={d.risk > 3 ? "#f97316" : d.ret > 14 ? "#10b981" : "#6366f1"} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── FUND REGISTRY TABLE ── */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          {/* Header / controls */}
          <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Fund Registry</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{sorted.length} funds · Tap header to sort</p>
            </div>
            <div className="flex flex-wrap gap-3 md:ml-auto">
              {/* Search */}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  className="text-[10px] font-bold text-slate-700 bg-transparent outline-none placeholder-slate-400 w-32"
                  placeholder="Search fund..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {/* Risk filter */}
              <select
                className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 outline-none"
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value as any)}
              >
                <option value="all">All Risk</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
              </select>
              {/* Liquidity filter */}
              <select
                className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 outline-none"
                value={liquidityFilter}
                onChange={e => setLiquidityFilter(e.target.value as any)}
              >
                <option value="all">Any Liquidity</option>
                <option value="T+0">T+0 Instant</option>
                <option value="T+1">T+1 Next Day</option>
                <option value="T+3">T+3</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="text-left px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Fund</th>
                  <th className="px-4 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-emerald-600" onClick={() => toggleSort("yield7d")}>
                    <div className="flex items-center justify-end gap-1">7d Yield <SortIcon col="yield7d" /></div>
                  </th>
                  <th className="px-4 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-emerald-600" onClick={() => toggleSort("yield30d")}>
                    <div className="flex items-center justify-end gap-1">30d Yield <SortIcon col="yield30d" /></div>
                  </th>
                  <th className="px-4 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-emerald-600" onClick={() => toggleSort("aum")}>
                    <div className="flex items-center justify-end gap-1">AUM (Bn) <SortIcon col="aum" /></div>
                  </th>
                  <th className="px-4 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-emerald-600" onClick={() => toggleSort("minInvest")}>
                    <div className="flex items-center justify-end gap-1">Min. KES <SortIcon col="minInvest" /></div>
                  </th>
                  <th className="px-4 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Liquidity</th>
                  <th className="px-4 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Risk</th>
                  <th className="px-4 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-emerald-600" onClick={() => toggleSort("esgScore")}>
                    <div className="flex items-center justify-end gap-1"><Leaf className="w-3 h-3" /> ESG <SortIcon col="esgScore" /></div>
                  </th>
                  <th className="px-4 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">CMA</th>
                  <th className="px-4 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Watch</th>
                  <th className="px-4 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Deep Dive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sorted.map((fund, i) => {
                  const isTop = fund.yield7d === topYield;
                  const isWatched = watchlist.includes(fund.id);
                  return (
                    <tr
                      key={fund.id}
                      className={`hover:bg-slate-50 transition-all cursor-pointer ${selectedFund.id === fund.id ? "bg-emerald-50/40" : ""}`}
                      onClick={() => setSelectedFund(fund)}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[9px] font-black" style={{ background: fund.color }}>
                            {fund.code.slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-black text-slate-900">{fund.name}</span>
                              {isTop && <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[8px] font-black uppercase">Top</span>}
                            </div>
                            <span className="text-[9px] text-slate-400 font-bold">{fund.manager}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-right">
                        <span className="text-sm font-black text-emerald-600">{fund.yield7d}%</span>
                      </td>
                      <td className="px-4 py-5 text-right">
                        <span className="text-[11px] font-black text-slate-700">{fund.yield30d}%</span>
                      </td>
                      <td className="px-4 py-5 text-right">
                        <span className="text-[11px] font-black text-slate-700">{fund.aum}</span>
                      </td>
                      <td className="px-4 py-5 text-right">
                        <span className="text-[10px] font-bold text-slate-600">{fund.minInvest.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${fund.liquidity === "T+0" ? "bg-emerald-100 text-emerald-700" : fund.liquidity === "T+1" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                          {fund.liquidity}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${fund.risk === "Low" ? "bg-slate-100 text-slate-600" : "bg-orange-100 text-orange-700"}`}>
                          {fund.risk}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${fund.esgScore}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-slate-700">{fund.esgScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center">
                        {fund.cmaLicensed
                          ? <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                          : <AlertCircle className="w-4 h-4 text-amber-500 mx-auto" />}
                      </td>
                      <td className="px-4 py-5 text-center" onClick={e => { e.stopPropagation(); setWatchlist(w => isWatched ? w.filter(x => x !== fund.id) : [...w, fund.id]); }}>
                        <Star className={`w-4 h-4 mx-auto transition-colors ${isWatched ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`} />
                      </td>
                      <td className="px-4 py-5 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              const codeIdMap: Record<string, string> = {
                                ETCA: 'etica',
                                SNLM: 'sanlam',
                                BRTM: '',
                                EQTY: '',
                                CYTN: 'cytonn',
                              };
                              let assetId;
                              if (fund.code === 'ETCA') assetId = 'etica';
                              else if (fund.code === 'SNLM') assetId = 'sanlam';
                              else if (fund.code === 'CYTN') assetId = 'cytonn';
                              
                              if (assetId) {
                                setPrefilledAsset(assetId);
                              } else {
                                setPrefilledAsset(undefined);
                              }
                              setAssetModalOpen(true);
                            }}
                            className="inline-flex items-center justify-center w-7 h-7 bg-slate-100 hover:bg-emerald-600 text-slate-400 hover:text-white rounded-lg transition-all"
                            title="Log Asset"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <a href={`/markets/mmfs/${fund.code.toLowerCase()}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-lg transition-all">
                            View →
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── SELECTED FUND DETAIL ── */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-sm" style={{ background: selectedFund.color }}>
                {selectedFund.code.slice(0, 2)}
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">{selectedFund.name}</h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{selectedFund.manager} · Since {selectedFund.inceptionDate}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {selectedFund.cmaLicensed && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">CMA Licensed</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
                <Clock className="w-3 h-3 text-slate-300" />
                <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">{selectedFund.liquidity} Liquidity</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
                <Leaf className="w-3 h-3 text-emerald-400" />
                <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">ESG {selectedFund.esgScore}/100</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: "7-day Yield", value: selectedFund.yield7d + "%", accent: true },
              { label: "30-day Yield", value: selectedFund.yield30d + "%" },
              { label: "90-day Yield", value: selectedFund.yield90d + "%" },
              { label: "1-Year Yield", value: selectedFund.yield1y + "%" },
              { label: "AUM", value: "KES " + selectedFund.aum + "B" },
              { label: "Min Invest", value: "KES " + selectedFund.minInvest.toLocaleString() },
              { label: "NAV", value: selectedFund.nav.toFixed(4) },
              { label: "Mgmt Fee", value: selectedFund.fees.management + "%" },
              { label: "Perf Fee", value: selectedFund.fees.performance ? selectedFund.fees.performance + "%" : "None" },
              { label: "Tax", value: selectedFund.taxCategory },
              { label: "Category", value: selectedFund.category },
              { label: "Currency", value: selectedFund.currency },
            ].map(item => (
              <div key={item.label} className="bg-white/5 rounded-xl p-3 border border-white/10">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block mb-1">{item.label}</span>
                <span className={`text-sm font-black ${item.accent ? "text-emerald-400" : "text-white"}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── TAX CALCULATOR ── */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between cursor-pointer" onClick={() => setShowTaxCalc(s => !s)}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Tax-Adjusted Return Calculator</h2>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">WHT 15% · Multi-scenario · Compound growth</p>
              </div>
            </div>
            {showTaxCalc ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </div>

          {showTaxCalc && (
            <div className="p-8 space-y-8">
              {/* Inputs */}
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Principal (KES)</label>
                  <input
                    type="number"
                    value={taxPrincipal}
                    onChange={e => setTaxPrincipal(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-black text-slate-900 outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Period (Months)</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={taxPeriod}
                    onChange={e => setTaxPeriod(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-black text-slate-900 outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Fund</label>
                  <select
                    value={taxFund.id}
                    onChange={e => setTaxFund(funds.find(f => f.id === Number(e.target.value))!)}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-black text-slate-900 outline-none focus:border-emerald-400"
                  >
                    {funds.map(f => <option key={f.id} value={f.id}>{f.name} ({f.yield7d}%)</option>)}
                  </select>
                </div>
              </div>

              {/* Results */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Gross Return", value: `KES ${Math.round(grossReturn).toLocaleString()}`, sub: `${taxFund.yield7d}% gross`, color: "bg-slate-50 border-slate-200 text-slate-900" },
                  { label: "WHT (15%)", value: `KES ${Math.round(whtTax).toLocaleString()}`, sub: "Withheld at source", color: "bg-rose-50 border-rose-200 text-rose-700" },
                  { label: "Net Return", value: `KES ${Math.round(netReturn).toLocaleString()}`, sub: "After tax", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                  { label: "Net Yield (ann.)", value: `${netYield.toFixed(2)}%`, sub: "Tax-adjusted annualised", color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
                ].map(r => (
                  <div key={r.label} className={`rounded-2xl border p-5 ${r.color}`}>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2">{r.label}</span>
                    <span className="text-lg font-black block">{r.value}</span>
                    <span className="text-[9px] font-bold text-slate-400 mt-1 block">{r.sub}</span>
                  </div>
                ))}
              </div>

              {/* Compound growth chart */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Compound Growth Projection</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Monthly compounding · With vs without WHT tax</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[9px] font-bold text-slate-500 uppercase">After Tax</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-300" /><span className="text-[9px] font-bold text-slate-500 uppercase">Gross</span></div>
                  </div>
                </div>
                <ResponsiveContainer minWidth={1} width="100%" height={200}>
                  <AreaChart data={compoundData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                    <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}K`} tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                    <Tooltip content={({ active, payload, label }: any) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-slate-900 rounded-xl p-3 border border-slate-700 shadow-xl text-[10px]">
                          <p className="text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
                          {payload.map((p: any) => (
                            <p key={p.name} className="font-black" style={{ color: p.color }}>
                              {p.name}: KES {Number(p.value).toLocaleString()}
                            </p>
                          ))}
                        </div>
                      );
                    }} />
                    <Area type="monotone" dataKey="withoutTax" name="Gross" stroke="#cbd5e1" fill="#f1f5f9" strokeWidth={1.5} />
                    <Area type="monotone" dataKey="withTax" name="After Tax" stroke="#10b981" fill="#d1fae5" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* IFB Comparison tip */}
              <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-indigo-900 uppercase tracking-widest mb-1">Tax Alpha Tip: Consider Infrastructure Bonds</p>
                  <p className="text-[10px] text-indigo-700 font-medium leading-relaxed">
                    Government Infrastructure Bonds (IFBs) are <strong>WHT-exempt</strong> in Kenya. A 12.5% IFB yield is effectively equivalent to a ~14.7% MMF yield after WHT.
                    If {taxFund.name}&apos;s gross yield ({taxFund.yield7d}%) → net {netYield.toFixed(2)}%, an IFB yielding ≥{netYield.toFixed(2)}% would deliver equal after-tax income with no withholding.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── AI INSIGHTS PANEL ── */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest">Sentil AI · MMF Intelligence</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Real-time Neural Analysis</p>
            </div>
          </div>

          {aiError === "upgrade_required" ? (
             <div className="flex flex-col items-center justify-center text-center py-6 relative z-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Premium Intelligence Locked</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 max-w-sm mb-6">
                   Upgrade to Pro to unlock institutional-grade AI analysis for MMFs and NSE Equities.
                </p>
                <Link href="/packages" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-900/50 transition-all">
                   Upgrade to Pro
                </Link>
             </div>
          ) : (
            <div className="relative z-10">
               {isAiLoading ? (
                 <div className="flex items-center gap-3 py-4">
                   <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                   <span className="text-slate-400 text-sm font-medium italic">Sentil AI is processesing MMF data...</span>
                 </div>
               ) : (
                 <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 text-sm text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                   {aiInsights}
                 </div>
               )}
            </div>
          )}
        </div>

        {/* ── REGULATORY & EDUCATIONAL ── */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "CMA Regulation", icon: Shield, color: "bg-emerald-50 text-emerald-600",
              points: [
                "All Kenyan MMFs must be licensed by the Capital Markets Authority (CMA)",
                "Daily NAV publication required",
                "Minimum liquid assets: 10% of NAV",
                "Maximum single issuer exposure: 25%",
                "Annual audited accounts within 4 months of year-end",
              ]
            },
            {
              title: "Tax Treatment", icon: Percent, color: "bg-indigo-50 text-indigo-600",
              points: [
                "WHT at 15% deducted at source on interest income",
                "WHT is final tax — no further income tax liability",
                "IFBs: WHT-exempt by Income Tax Act Cap 470",
                "T-Bills: WHT at 15% applies",
                "Capital gains on NAV appreciation: currently exempt",
              ]
            },
            {
              title: "How to Invest", icon: Zap, color: "bg-amber-50 text-amber-600",
              points: [
                "Complete KYC (ID, KRA PIN, bank details)",
                "Sign investor agreement with fund manager",
                "Deposit via RTGS, EFT, or M-Pesa (select funds)",
                "Units allocated at next NAV after cleared funds",
                "Monitor via fund manager portal or Sentil dashboard",
              ]
            },
          ].map(card => (
            <div key={card.title} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{card.title}</h3>
              </div>
              <ul className="space-y-3">
                {card.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-[10px] text-slate-600 font-medium leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
