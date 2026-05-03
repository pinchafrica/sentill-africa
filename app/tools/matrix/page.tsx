"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from "recharts";
import {
  Search, ChevronDown, ChevronUp, Shield, Zap,
  Star, CheckCircle, AlertCircle, Leaf,
  BarChart2, Award, Activity
} from "lucide-react";

// ─── UNIVERSE ─────────────────────────────────────────────────────────────────

const PRODUCTS = [
  // MMFs
  { id: "etca",   name: "Etica Capital MMF (Zidi)", manager: "Etica Capital",     type: "MMF",         risk: "Low",    yield: 18.20, netYield: 15.47, aum: 15.2,  minInv: 1000,   liquidity: "T+1",  taxRate: 15, esg: 82, sharpe: 2.8, cma: true,  sector: "Money Market", tenor: "Open-ended" },
  { id: "snlm",   name: "Sanlam MMF",          manager: "Sanlam Investments",     type: "MMF",         risk: "Low",    yield: 14.78, netYield: 12.56, aum: 8.7,   minInv: 1000,   liquidity: "T+1",  taxRate: 15, esg: 74, sharpe: 2.1, cma: true,  sector: "Money Market", tenor: "Open-ended" },
  { id: "brtm",   name: "Britam MMF",          manager: "Britam Asset Managers",  type: "MMF",         risk: "Low",    yield: 14.2,  netYield: 12.07, aum: 12.4,  minInv: 500,    liquidity: "T+1",  taxRate: 15, esg: 71, sharpe: 2.3, cma: true,  sector: "Money Market", tenor: "Open-ended" },
  { id: "eqty",   name: "Equity MMF",          manager: "Equity Bank",            type: "MMF",         risk: "Low",    yield: 13.8,  netYield: 11.73, aum: 22.1,  minInv: 100,    liquidity: "T+0",  taxRate: 15, esg: 69, sharpe: 2.2, cma: true,  sector: "Money Market", tenor: "Open-ended" },
  { id: "cicm",   name: "CIC MMF",             manager: "CIC Asset Mgmt",         type: "MMF",         risk: "Low",    yield: 13.6,  netYield: 11.56, aum: 18.3,  minInv: 100,    liquidity: "T+1",  taxRate: 15, esg: 77, sharpe: 2.1, cma: true,  sector: "Money Market", tenor: "Open-ended" },
  { id: "ncba",   name: "NCBA MMF",            manager: "NCBA Investment Bank",   type: "MMF",         risk: "Low",    yield: 12.1,  netYield: 10.29, aum: 31.4,  minInv: 100,    liquidity: "T+0",  taxRate: 15, esg: 70, sharpe: 2.0, cma: true,  sector: "Money Market", tenor: "Open-ended" },
  { id: "kcbm",   name: "KCB MMF",             manager: "KCB Asset Mgmt",         type: "MMF",         risk: "Low",    yield: 11.4,  netYield: 9.69,  aum: 28.7,  minInv: 100,    liquidity: "T+0",  taxRate: 15, esg: 65, sharpe: 1.9, cma: true,  sector: "Money Market", tenor: "Open-ended" },
  { id: "copm",   name: "Co-op MMF",           manager: "Co-op Trust",            type: "MMF",         risk: "Low",    yield: 13.4,  netYield: 11.39, aum: 9.8,   minInv: 500,    liquidity: "T+1",  taxRate: 15, esg: 68, sharpe: 2.0, cma: true,  sector: "Money Market", tenor: "Open-ended" },
  { id: "olmd",   name: "Old Mutual MMF",      manager: "Old Mutual Investments", type: "MMF",         risk: "Low",    yield: 12.9,  netYield: 10.97, aum: 14.6,  minInv: 1000,   liquidity: "T+1",  taxRate: 15, esg: 76, sharpe: 2.0, cma: true,  sector: "Money Market", tenor: "Open-ended" },
  // T-Bills
  { id: "tb91",   name: "91-Day T-Bill",       manager: "CBK",                    type: "T-Bill",      risk: "Very Low",yield: 13.2, netYield: 11.22, aum: 0,     minInv: 100000, liquidity: "HTM",  taxRate: 15, esg: 60, sharpe: 1.8, cma: true,  sector: "Government",   tenor: "91 days" },
  { id: "tb182",  name: "182-Day T-Bill",      manager: "CBK",                    type: "T-Bill",      risk: "Very Low",yield: 13.8, netYield: 11.73, aum: 0,     minInv: 100000, liquidity: "HTM",  taxRate: 15, esg: 60, sharpe: 1.9, cma: true,  sector: "Government",   tenor: "182 days" },
  { id: "tb364",  name: "364-Day T-Bill",      manager: "CBK",                    type: "T-Bill",      risk: "Very Low",yield: 14.1, netYield: 11.99, aum: 0,     minInv: 100000, liquidity: "HTM",  taxRate: 15, esg: 60, sharpe: 2.0, cma: true,  sector: "Government",   tenor: "364 days" },
  // IFBs
  { id: "ifb3",   name: "IFB 3-Year",          manager: "National Treasury",      type: "Bond (IFB)",  risk: "Low",    yield: 13.5,  netYield: 13.5,  aum: 0,     minInv: 50000,  liquidity: "Sec.", taxRate: 0,  esg: 65, sharpe: 3.2, cma: true,  sector: "Government",   tenor: "3 years" },
  { id: "ifb5",   name: "IFB 5-Year",          manager: "National Treasury",      type: "Bond (IFB)",  risk: "Low",    yield: 14.0,  netYield: 14.0,  aum: 0,     minInv: 50000,  liquidity: "Sec.", taxRate: 0,  esg: 65, sharpe: 3.4, cma: true,  sector: "Government",   tenor: "5 years" },
  { id: "ifb10",  name: "IFB 10-Year",         manager: "National Treasury",      type: "Bond (IFB)",  risk: "Medium", yield: 14.5,  netYield: 14.5,  aum: 0,     minInv: 50000,  liquidity: "Sec.", taxRate: 0,  esg: 65, sharpe: 3.5, cma: true,  sector: "Government",   tenor: "10 years" },
  { id: "fxd10",  name: "FXD1 10-Year",        manager: "National Treasury",      type: "Bond",        risk: "Medium", yield: 16.0,  netYield: 13.6,  aum: 0,     minInv: 50000,  liquidity: "Sec.", taxRate: 15, esg: 58, sharpe: 2.9, cma: true,  sector: "Government",   tenor: "10 years" },
  // Fixed Deposits
  { id: "fdep6",  name: "Fixed Deposit 6M",    manager: "Commercial Banks",       type: "Fixed Deposit",risk: "Very Low",yield: 9.5,  netYield: 8.08,  aum: 0,     minInv: 50000,  liquidity: "Locked",taxRate: 15, esg: 50, sharpe: 1.4, cma: false, sector: "Banking",      tenor: "6 months" },
  { id: "fdep12", name: "Fixed Deposit 12M",   manager: "Commercial Banks",       type: "Fixed Deposit",risk: "Very Low",yield: 10.5, netYield: 8.93,  aum: 0,     minInv: 50000,  liquidity: "Locked",taxRate: 15, esg: 50, sharpe: 1.5, cma: false, sector: "Banking",      tenor: "12 months" },
  // NSE Equities
  { id: "scom",   name: "Safaricom (SCOM)",    manager: "Listed NSE",             type: "NSE Stock",   risk: "High",   yield: 7.8,   netYield: 7.41,  aum: 775,   minInv: 500,    liquidity: "T+3",  taxRate: 5,  esg: 78, sharpe: 0.9, cma: true,  sector: "Telecoms",     tenor: "Perpetual" },
  { id: "eqt",    name: "Equity Group (EQT)",  manager: "Listed NSE",             type: "NSE Stock",   risk: "High",   yield: 9.2,   netYield: 8.74,  aum: 98,    minInv: 500,    liquidity: "T+3",  taxRate: 5,  esg: 72, sharpe: 1.2, cma: true,  sector: "Banking",      tenor: "Perpetual" },
  { id: "kegn",   name: "KenGen (KEGN)",       manager: "Listed NSE",             type: "NSE Stock",   risk: "High",   yield: 6.5,   netYield: 6.18,  aum: 42,    minInv: 500,    liquidity: "T+3",  taxRate: 5,  esg: 85, sharpe: 0.7, cma: true,  sector: "Energy",       tenor: "Perpetual" },
];

type SortKey = "yield" | "netYield" | "aum" | "minInv" | "esg" | "sharpe" | "taxRate";
type Product = typeof PRODUCTS[0];

// ─── YIELD HEATMAP COLOR ──────────────────────────────────────────────────────

const heatColor = (yield_: number) => {
  if (yield_ >= 15) return { bg: "bg-emerald-500", text: "text-white" };
  if (yield_ >= 13) return { bg: "bg-emerald-400", text: "text-white" };
  if (yield_ >= 11) return { bg: "bg-emerald-200", text: "text-emerald-900" };
  if (yield_ >= 9)  return { bg: "bg-amber-200",   text: "text-amber-900" };
  if (yield_ >= 7)  return { bg: "bg-orange-200",  text: "text-orange-900" };
  return                   { bg: "bg-rose-200",    text: "text-rose-900" };
};

const riskColor = (risk: string) => ({
  "Very Low": "bg-slate-100 text-slate-600",
  "Low":      "bg-emerald-100 text-emerald-700",
  "Medium":   "bg-amber-100 text-amber-700",
  "High":     "bg-rose-100 text-rose-700",
}[risk] ?? "bg-slate-100 text-slate-600");

// ─── DARK TOOLTIP ─────────────────────────────────────────────────────────────

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-xl min-w-[140px]">
      {label && <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="text-[9px] text-slate-400 font-bold">{p.name}</span>
          <span className="text-[10px] font-black text-white">{typeof p.value === "number" ? p.value.toFixed(2) + "%" : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────

import { useMarketRates } from "@/lib/useMarketRates";

export default function MatrixPage() {
  const [sortBy, setSortBy] = useState<SortKey>("yield");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [typeFilter, setTypeFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>(["etca", "ifb10"]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const { funds, bonds } = useMarketRates();

  // Merge live yields into the static PRODUCTS list
  const LIVE_PRODUCTS = useMemo(() => {
    return PRODUCTS.map(p => {
      const liveObj = { ...p };
      
      if (p.type === "MMF") {
        const liveFund = funds.find(f => f.id.toString() === p.id || f.code.toLowerCase() === p.id.toLowerCase());
        if (liveFund) {
          liveObj.yield = liveFund.yield7d;
          liveObj.aum = liveFund.aum || liveObj.aum;
          liveObj.netYield = Number((liveFund.yield7d * (1 - (liveObj.taxRate / 100))).toFixed(2));
        }
      } else if (p.type.includes("Bond")) {
        // e.g. "ifb5" -> match logic if available
        const liveBond = bonds.find(b => b.name.toLowerCase().includes(p.name.toLowerCase()));
        if (liveBond) {
          liveObj.yield = liveBond.yield;
          liveObj.netYield = Number((liveBond.yield * (1 - (liveObj.taxRate / 100))).toFixed(2));
        }
      }
      return liveObj;
    });
  }, [funds, bonds]);

  const types = Array.from(new Set(LIVE_PRODUCTS.map(p => p.type)));
  const risks = Array.from(new Set(LIVE_PRODUCTS.map(p => p.risk)));

  const filtered = useMemo(() =>
    LIVE_PRODUCTS
      .filter(p => typeFilter === "all" || p.type === typeFilter)
      .filter(p => riskFilter === "all" || p.risk === riskFilter)
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.manager.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => sortDir === "desc" ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]),
    [sortBy, sortDir, typeFilter, riskFilter, search, LIVE_PRODUCTS]
  );

  const toggleSort = (col: SortKey) => {
    if (sortBy === col) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortBy === col
      ? sortDir === "desc" ? <ChevronDown className="w-3 h-3 text-emerald-400" /> : <ChevronUp className="w-3 h-3 text-emerald-400" />
      : <ChevronDown className="w-3 h-3 text-slate-500" />;

  // Top 10 by net yield for bar chart
  const topChart = [...LIVE_PRODUCTS].sort((a, b) => b.netYield - a.netYield).slice(0, 10);
  const COLORS = ["#10b981", "#22c55e", "#4ade80", "#6ee7b7", "#a7f3d0", "#6366f1", "#8b5cf6", "#a855f7", "#f59e0b", "#ef4444"];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 px-6 md:px-10 pt-10 pb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em] mb-6">
          <Activity className="w-3 h-3" /> Provider Matrix · {LIVE_PRODUCTS.length} Instruments
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none mb-3">
          Investment<br />Matrix
        </h1>
        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] max-w-lg">
          Sortable, filterable universe of {LIVE_PRODUCTS.length} Kenyan investment instruments · Heatmap yields · Live rank by net return
        </p>

        {/* Top 10 net yield bar */}
        <div className="mt-10 bg-white/5 backdrop-blur rounded-[2rem] border border-white/10 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Top 10 by Net Yield</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">After WHT · All asset classes</p>
            </div>
          </div>
          <ResponsiveContainer minWidth={1} width="100%" height={200}>
            <BarChart data={topChart.map((p, i) => ({ name: p.id.toUpperCase(), net: p.netYield, fill: COLORS[i] }))} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
              <YAxis tickFormatter={v => v + "%"} tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="net" name="Net Yield" radius={[6, 6, 0, 0]}>
                {topChart.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="px-6 md:px-10 py-10">

        {/* ── CONTROLS ── */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm mb-8 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              className="text-[10px] font-bold text-slate-700 bg-transparent outline-none placeholder-slate-400 w-36"
              placeholder="Search product..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Type */}
          <select
            className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 outline-none"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Risk */}
          <select
            className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 outline-none"
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
          >
            <option value="all">All Risk</option>
            {risks.map(r => <option key={r} value={r}>{r} Risk</option>)}
          </select>

          {/* Heatmap toggle */}
          <button
            onClick={() => setHeatmapMode(m => !m)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${heatmapMode ? "bg-emerald-600 border-emerald-600 text-white" : "bg-slate-50 border-slate-100 text-slate-600"}`}
          >
            <BarChart2 className="w-3.5 h-3.5" /> Heatmap
          </button>

          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-auto">{filtered.length} instruments</span>
        </div>

        {/* ── MATRIX TABLE ── */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">#</th>
                  <th className="text-left px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Instrument</th>
                  <th className="text-center px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</th>
                  <th className="text-right px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-emerald-600" onClick={() => toggleSort("yield")}>
                    <div className="flex items-center justify-end gap-1">Gross % <SortIcon col="yield" /></div>
                  </th>
                  <th className="text-right px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-emerald-600" onClick={() => toggleSort("netYield")}>
                    <div className="flex items-center justify-end gap-1">Net % <SortIcon col="netYield" /></div>
                  </th>
                  <th className="text-right px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-emerald-600" onClick={() => toggleSort("taxRate")}>
                    <div className="flex items-center justify-end gap-1">WHT <SortIcon col="taxRate" /></div>
                  </th>
                  <th className="text-center px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Risk</th>
                  <th className="text-right px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-emerald-600" onClick={() => toggleSort("sharpe")}>
                    <div className="flex items-center justify-end gap-1">Sharpe <SortIcon col="sharpe" /></div>
                  </th>
                  <th className="text-center px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Liquidity</th>
                  <th className="text-right px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-emerald-600" onClick={() => toggleSort("minInv")}>
                    <div className="flex items-center justify-end gap-1">Min KES <SortIcon col="minInv" /></div>
                  </th>
                  <th className="text-right px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer hover:text-emerald-600" onClick={() => toggleSort("esg")}>
                    <div className="flex items-center justify-end gap-1"><Leaf className="w-3 h-3" /> ESG <SortIcon col="esg" /></div>
                  </th>
                  <th className="text-center px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">CMA</th>
                  <th className="text-center px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">★</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((p, i) => {
                  const heat = heatmapMode ? heatColor(p.netYield) : null;
                  const isWatched = watchlist.includes(p.id);
                  const isHovered = hoveredRow === p.id;
                  return (
                    <tr
                      key={p.id}
                      onMouseEnter={() => setHoveredRow(p.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className={`transition-all ${isHovered ? "bg-slate-50" : ""}`}
                    >
                      {/* Rank */}
                      <td className="px-8 py-4">
                        <span className="text-[9px] font-black text-slate-400">{i + 1}</span>
                        {i === 0 && <Award className="w-3.5 h-3.5 text-amber-400 inline ml-1" />}
                      </td>

                      {/* Name */}
                      <td className="px-4 py-4">
                        <div>
                          <span className="text-[11px] font-black text-slate-900 block">{p.name}</span>
                          <span className="text-[9px] text-slate-400 font-bold">{p.manager} · {p.tenor}</span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-4 text-center">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest px-2 py-1 bg-slate-100 rounded-full">{p.type}</span>
                      </td>

                      {/* Gross yield */}
                      <td className={`px-4 py-4 text-right ${heat ? `${heat.bg} ${heat.text}` : ""}`}>
                        <span className={`text-sm font-black ${heat ? "" : "text-slate-800"}`}>{p.yield.toFixed(2)}%</span>
                      </td>

                      {/* Net yield */}
                      <td className={`px-4 py-4 text-right ${heat ? `${heat.bg} ${heat.text}` : ""}`}>
                        <div>
                          <span className={`text-sm font-black ${heat ? "" : "text-emerald-600"}`}>{p.netYield.toFixed(2)}%</span>
                          {p.taxRate === 0 && <span className="text-[7px] font-black text-emerald-500 block uppercase tracking-widest">WHT Exempt</span>}
                        </div>
                      </td>

                      {/* WHT */}
                      <td className="px-4 py-4 text-right">
                        <span className={`text-[10px] font-black ${p.taxRate === 0 ? "text-emerald-500" : "text-slate-600"}`}>
                          {p.taxRate === 0 ? "0% ✓" : p.taxRate + "%"}
                        </span>
                      </td>

                      {/* Risk */}
                      <td className="px-4 py-4 text-center">
                        <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${riskColor(p.risk)}`}>{p.risk}</span>
                      </td>

                      {/* Sharpe */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${Math.min(p.sharpe / 4 * 100, 100)}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-slate-700">{p.sharpe}</span>
                        </div>
                      </td>

                      {/* Liquidity */}
                      <td className="px-4 py-4 text-center">
                        <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${
                          p.liquidity === "T+0" ? "bg-emerald-100 text-emerald-700" :
                          p.liquidity === "T+1" ? "bg-blue-100 text-blue-700" :
                          p.liquidity === "T+3" ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>{p.liquidity}</span>
                      </td>

                      {/* Min invest */}
                      <td className="px-4 py-4 text-right">
                        <span className="text-[10px] font-bold text-slate-600">{p.minInv.toLocaleString()}</span>
                      </td>

                      {/* ESG */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-10 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${p.esg}%` }} />
                          </div>
                          <span className="text-[9px] font-black text-slate-700">{p.esg}</span>
                        </div>
                      </td>

                      {/* CMA */}
                      <td className="px-4 py-4 text-center">
                        {p.cma
                          ? <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                          : <AlertCircle className="w-4 h-4 text-amber-400 mx-auto" />}
                      </td>

                      {/* Watchlist */}
                      <td className="px-4 py-4 text-center cursor-pointer" onClick={() => setWatchlist(w => isWatched ? w.filter(x => x !== p.id) : [...w, p.id])}>
                        <Star className={`w-4 h-4 mx-auto transition-colors ${isWatched ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"}`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── INSIGHTS ── */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {[
            {
              icon: Award, color: "bg-amber-50 border-amber-100 text-amber-700",
              title: "Best Net Yield", product: [...LIVE_PRODUCTS].sort((a, b) => b.netYield - a.netYield)[0],
              stat: (p: Product) => p.netYield.toFixed(2) + "% net",
            },
            {
              icon: Shield, color: "bg-emerald-50 border-emerald-100 text-emerald-700",
              title: "Best Risk-Adjusted", product: [...LIVE_PRODUCTS].sort((a, b) => b.sharpe - a.sharpe)[0],
              stat: (p: Product) => "Sharpe " + p.sharpe,
            },
            {
              icon: Zap, color: "bg-indigo-50 border-indigo-100 text-indigo-700",
              title: "Tax Alpha Pick", product: [...LIVE_PRODUCTS].filter(p => p.taxRate === 0).sort((a, b) => b.yield - a.yield)[0],
              stat: (p: Product) => p.yield + "% WHT-exempt",
            },
          ].map(card => (
            <div key={card.title} className={`rounded-[2rem] border p-6 ${card.color}`}>
              <div className="flex items-center gap-2 mb-3">
                <card.icon className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-widest">{card.title}</span>
              </div>
              <p className="text-sm font-black">{card.product.name}</p>
              <p className="text-[10px] font-bold opacity-70 mt-1">{card.stat(card.product)}</p>
            </div>
          ))}
        </div>

        {/* ── HEATMAP LEGEND ── */}
        {heatmapMode && (
          <div className="mt-6 bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm flex flex-wrap items-center gap-4">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Yield Heatmap:</span>
            {[
              { label: "≥15%", cls: "bg-emerald-500 text-white" },
              { label: "13-15%", cls: "bg-emerald-400 text-white" },
              { label: "11-13%", cls: "bg-emerald-200 text-emerald-900" },
              { label: "9-11%", cls: "bg-amber-200 text-amber-900" },
              { label: "7-9%", cls: "bg-orange-200 text-orange-900" },
              { label: "<7%", cls: "bg-rose-200 text-rose-900" },
            ].map(l => (
              <div key={l.label} className={`px-3 py-1 rounded-full text-[9px] font-black ${l.cls}`}>{l.label}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
