"use client";

import { useEffect, useState, useMemo } from "react";
import useSWR from "swr";
import {
  BarChart3, TrendingUp, TrendingDown, Activity, Zap, Search,
  LineChart as LineChartIcon, Star, ChevronUp, ChevronDown, Flame, Globe, Sparkles, ArrowRight
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
import Link from "next/link";
import NSEStockChart from "@/components/NSEStockChart";
import NSETechnicalGauge from "@/components/NSETechnicalGauge";
import SocialSentimentPulse from "@/components/SocialSentimentPulse";
import TaxAlphaOptimizer from "@/components/TaxAlphaOptimizer";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";

const NSE_STOCKS = [
  { symbol: "SCOM", name: "Safaricom PLC", price: 19.35, change: 0.35, percent: 1.84, volume: "48.2M", pe: 14.2, divYield: 7.8, cap: "775B", sector: "Telecoms", high52: 24.50, low52: 16.00 },
  { symbol: "EQTY", name: "Equity Group Holdings", price: 48.05, change: -0.45, percent: -0.93, volume: "12.4M", pe: 7.1, divYield: 5.2, cap: "181B", sector: "Banking", high52: 56.00, low52: 38.50 },
  { symbol: "KCB", name: "KCB Group PLC", price: 37.20, change: 0.70, percent: 1.92, volume: "9.8M", pe: 5.8, divYield: 8.1, cap: "119B", sector: "Banking", high52: 43.25, low52: 30.00 },
  { symbol: "EABL", name: "East African Breweries", price: 125.50, change: -2.50, percent: -1.95, volume: "1.2M", pe: 22.3, divYield: 3.8, cap: "100B", sector: "Manufacturing", high52: 168.00, low52: 118.00 },
  { symbol: "COOP", name: "Co-operative Bank", price: 12.55, change: 0.15, percent: 1.21, volume: "6.7M", pe: 4.9, divYield: 9.3, cap: "74B", sector: "Banking", high52: 15.80, low52: 10.50 },
  { symbol: "ABSA", name: "Absa Bank Kenya", price: 14.30, change: -0.20, percent: -1.38, volume: "3.4M", pe: 6.2, divYield: 7.5, cap: "78B", sector: "Banking", high52: 18.00, low52: 12.25 },
  { symbol: "NCBA", name: "NCBA Group", price: 27.85, change: 0.85, percent: 3.15, volume: "4.1M", pe: 5.4, divYield: 6.8, cap: "46B", sector: "Banking", high52: 32.50, low52: 22.00 },
  { symbol: "BATK", name: "BAT Kenya", price: 430.00, change: 5.00, percent: 1.18, volume: "180K", pe: 11.5, divYield: 12.4, cap: "43B", sector: "Manufacturing", high52: 485.00, low52: 390.00 },
  { symbol: "SCBK", name: "Standard Chartered Kenya", price: 176.00, change: -1.00, percent: -0.56, volume: "420K", pe: 9.8, divYield: 6.1, cap: "46B", sector: "Banking", high52: 199.00, low52: 148.00 },
  { symbol: "KEGN", name: "KenGen PLC", price: 4.98, change: 0.08, percent: 1.63, volume: "14.3M", pe: 18.2, divYield: 4.5, cap: "32B", sector: "Energy", high52: 6.80, low52: 3.90 },
  { symbol: "STBK", name: "Stanbic Holdings", price: 112.50, change: -3.50, percent: -3.02, volume: "880K", pe: 7.3, divYield: 5.9, cap: "44B", sector: "Banking", high52: 128.00, low52: 89.00 },
  { symbol: "BAMB", name: "Bamburi Cement", price: 41.25, change: 1.25, percent: 3.12, volume: "2.1M", pe: 13.7, divYield: 4.2, cap: "15B", sector: "Manufacturing", high52: 52.00, low52: 35.00 },
  { symbol: "KNRE", name: "Kenya Reinsurance", price: 2.38, change: 0.03, percent: 1.28, volume: "5.6M", pe: 8.4, divYield: 11.2, cap: "5B", sector: "Insurance", high52: 3.10, low52: 1.95 },
  { symbol: "KPLC", name: "Kenya Power & Lighting", price: 2.35, change: -0.05, percent: -2.08, volume: "18.7M", pe: 32.1, divYield: 0.0, cap: "4B", sector: "Energy", high52: 4.10, low52: 1.80 },
  { symbol: "BRITAM", name: "Britam Holdings", price: 6.80, change: 0.20, percent: 3.03, volume: "8.9M", pe: 16.3, divYield: 2.8, cap: "18B", sector: "Insurance", high52: 8.50, low52: 5.40 },
];

const NSE20_DATA = [
  { month: "Apr", value: 1820 }, { month: "May", value: 1756 }, { month: "Jun", value: 1802 },
  { month: "Jul", value: 1890 }, { month: "Aug", value: 1945 }, { month: "Sep", value: 1878 },
  { month: "Oct", value: 1920 }, { month: "Nov", value: 2010 }, { month: "Dec", value: 1985 },
  { month: "Jan", value: 2065 }, { month: "Feb", value: 2142 }, { month: "Mar", value: 2198 },
];

const SECTORS = [
  { name: "Banking", change: +1.42, stocks: 6 }, { name: "Telecoms", change: +1.84, stocks: 2 },
  { name: "Manufacturing", change: -0.55, stocks: 3 }, { name: "Energy", change: -0.23, stocks: 2 },
  { name: "Insurance", change: +2.16, stocks: 3 }, { name: "Investments", change: +0.87, stocks: 4 },
];

const VOLUME_DATA = [
  { symbol: "SCOM", volume: 48.2 }, { symbol: "KPLC", volume: 18.7 }, { symbol: "KEGN", volume: 14.3 },
  { symbol: "EQTY", volume: 12.4 }, { symbol: "KCB", volume: 9.8 }, { symbol: "BRITAM", volume: 8.9 }, { symbol: "COOP", volume: 6.7 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl px-4 py-3 shadow-2xl">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-black text-emerald-400">{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</p>
      ))}
    </div>
  );
};

export default function NSEPage() {
  const { data: nseApiData } = useSWR("/api/market/nse", fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  });

  // Merge live API prices into static stock list
  const stocks = useMemo(() => {
    if (!nseApiData?.stocks?.length) return NSE_STOCKS;
    const liveMap: Record<string, any> = {};
    for (const s of nseApiData.stocks) {
      liveMap[s.symbol.replace(".NR", "")] = s;
    }
    return NSE_STOCKS.map(s => {
      const live = liveMap[s.symbol];
      if (!live) return s;
      return {
        ...s,
        price: live.price ?? s.price,
        change: live.change ?? s.change,
        percent: live.percent ?? s.percent,
        volume: live.volume ? `${(live.volume / 1_000_000).toFixed(1)}M` : s.volume,
      };
    });
  }, [nseApiData]);

  const isLive = nseApiData?.source?.type === "yahoo";

  const [selectedStock, setSelectedStock] = useState(NSE_STOCKS[0]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "banking" | "telecoms" | "manufacturing">("all");
  const [watchlist, setWatchlist] = useState<string[]>(["SCOM", "EQTY"]);

  // Sync selectedStock with live prices
  useEffect(() => {
    const live = stocks.find(s => s.symbol === selectedStock.symbol);
    if (live) setSelectedStock(live);
  }, [stocks]);

  const gainers = [...stocks].filter(s => s.percent > 0).sort((a, b) => b.percent - a.percent).slice(0, 5);
  const losers = [...stocks].filter(s => s.percent < 0).sort((a, b) => a.percent - b.percent).slice(0, 5);
  const totalAdvance = stocks.filter(s => s.percent > 0).length;
  const totalDecline = stocks.filter(s => s.percent < 0).length;

  const filtered = stocks.filter(s => {
    const matchTab = activeTab === "all" || s.sector.toLowerCase().startsWith(activeTab);
    const matchSearch = !search || s.symbol.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const toggleWatchlist = (sym: string) => setWatchlist(prev => prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]);
  const selectStock = (s: typeof NSE_STOCKS[0]) => { setSelectedStock(s); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const sourceLabel = isLive ? "Live · Yahoo Finance" : "Delayed · Authoritative Fallback";

  return (
    <div className="min-h-screen bg-slate-50 py-28 px-4 md:px-8">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em]">
              <Activity className="w-3 h-3" /> NSE Kenya · Live
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase">Market <span className="text-indigo-600">Terminal.</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nairobi Securities Exchange · {stocks.length} listed instruments · {sourceLabel}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[10px] font-black text-emerald-700 uppercase tracking-widest">
              <TrendingUp className="w-3.5 h-3.5" /> NSE 20: 2,198 (+2.09%)
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-widest">
              <Globe className="w-3.5 h-3.5 text-slate-400" /> {totalAdvance}↑ / {totalDecline}↓ Breadth
            </div>
          </div>
        </div>

        {/* Market Overview Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "NSE 20 Index", value: "2,198", change: "+2.09%", sub: "YTD +20.8%", up: true },
            { label: "Market Cap", value: "KES 2.1T", change: "+1.4%", sub: "Total listed", up: true },
            { label: "Daily Turnover", value: "KES 1.38B", change: "+18.2%", sub: "vs yesterday", up: true },
            { label: "Trading Volume", value: "145.7M", change: "Shares", sub: "All segments", up: true },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{m.label}</p>
              <p className="text-xl font-black text-slate-900 tracking-tighter">{m.value}</p>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">{m.change}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">{m.sub}</p>
            </div>
          ))}
        </div>

        {/* NSE 20 Chart + Sector Heatmap */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">NSE 20 Share Index</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">12-month performance trajectory</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[10px] font-black text-emerald-600 uppercase">+20.8% YTD</span>
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer minWidth={1} width="100%" height={256}>
                <AreaChart data={NSE20_DATA}>
                  <defs>
                    <linearGradient id="nseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={45} domain={[1700, 2300]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" name="NSE 20" stroke="#6366f1" strokeWidth={2.5} fill="url(#nseGrad)" dot={false} activeDot={{ r: 6, fill: "#6366f1" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-4 gap-4 pt-6 mt-4 border-t border-slate-100">
              {[{ label: "52W High", value: "2,412" }, { label: "52W Low", value: "1,820" }, { label: "Avg Volume", value: "128M" }, { label: "Mkt P/E", value: "10.2x" }].map((m, i) => (
                <div key={i} className="text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
                  <p className="text-sm font-black text-slate-900 mt-1">{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">Sector Heatmap</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Today's performance</p>
              </div>
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SECTORS.map((s, i) => (
                <div key={i} className={`p-4 rounded-2xl flex flex-col gap-1 cursor-pointer hover:scale-[1.03] transition-transform ${s.change > 0 ? "bg-emerald-500/15 border border-emerald-500/20" : "bg-rose-500/15 border border-rose-500/20"}`}>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.name}</span>
                  <span className={`text-lg font-black tracking-tighter ${s.change > 0 ? "text-emerald-400" : "text-rose-400"}`}>{s.change > 0 ? "+" : ""}{s.change}%</span>
                  <span className="text-[8px] font-bold text-slate-600 uppercase">{s.stocks} stocks</span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-white/5 space-y-2">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Market Breadth</p>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500" style={{ width: `${(totalAdvance / stocks.length) * 100}%` }} />
                <div className="h-full bg-rose-500" style={{ width: `${(totalDecline / stocks.length) * 100}%` }} />
              </div>
              <div className="flex justify-between text-[9px] font-black uppercase">
                <span className="text-emerald-400">{totalAdvance} Advancing</span>
                <span className="text-rose-400">{totalDecline} Declining</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Trading Terminal */}
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            {/* Stock info bar */}
            <div className="bg-white rounded-[2rem] border border-slate-100 p-5 flex flex-wrap items-center gap-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-sm">{selectedStock.symbol.slice(0, 2)}</div>
                <div>
                  <span className="text-lg font-black text-slate-900 uppercase tracking-tight block">{selectedStock.symbol}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{selectedStock.name}</span>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-100 hidden md:block" />
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase">Price</p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">KES {selectedStock.price.toFixed(2)}</p>
              </div>
              <div className={`px-3 py-2 rounded-xl flex items-center gap-1.5 text-sm font-black ${selectedStock.percent >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                {selectedStock.percent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {selectedStock.percent >= 0 ? "+" : ""}{selectedStock.percent}%
              </div>
              <div className="hidden md:grid grid-cols-4 gap-5 ml-auto text-center">
                {[{ label: "P/E", value: `${selectedStock.pe}x` }, { label: "Div Yield", value: `${selectedStock.divYield}%` }, { label: "Mkt Cap", value: `KES ${selectedStock.cap}` }, { label: "Volume", value: selectedStock.volume }].map((m, i) => (
                  <div key={i}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
                    <p className="text-sm font-black text-slate-900">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* NSE Stock Chart — custom OHLCV + SMA */}
            <div className="rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-xl" style={{ height: 520 }}>
              <NSEStockChart
                symbol={selectedStock.symbol}
                price={selectedStock.price}
                change={selectedStock.change}
                percent={selectedStock.percent}
                high52={selectedStock.high52}
                low52={selectedStock.low52}
              />
            </div>

            {/* Volume Leaders chart */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Volume Leaders</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Today's most traded (M shares)</p>
                </div>
                <BarChart3 className="w-5 h-5 text-slate-400" />
              </div>
              <div className="h-44">
                <ResponsiveContainer minWidth={1} width="100%" height={256}>
                  <BarChart data={VOLUME_DATA} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="symbol" tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="volume" name="Volume (M)" radius={[6, 6, 0, 0]}>
                      {VOLUME_DATA.map((_, i) => <Cell key={i} fill={i === 0 ? "#6366f1" : i % 2 === 0 ? "#10b981" : "#e2e8f0"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-5">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2"><ChevronUp className="w-4 h-4 text-emerald-500" /> Top Gainers</h3>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{gainers.length}</span>
              </div>
              <div className="divide-y divide-slate-50">
                {gainers.map((s, i) => (
                  <button key={i} onClick={() => selectStock(s)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-emerald-50/30 transition-all">
                    <div className="text-left">
                      <span className="text-[11px] font-black text-slate-900 uppercase block">{s.symbol}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{s.sector}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 block">KES {s.price}</span>
                      <span className="text-[10px] font-black text-emerald-600">+{s.percent}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2"><ChevronDown className="w-4 h-4 text-rose-500" /> Top Losers</h3>
                <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-full">{losers.length}</span>
              </div>
              <div className="divide-y divide-slate-50">
                {losers.map((s, i) => (
                  <button key={i} onClick={() => selectStock(s)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-rose-50/20 transition-all">
                    <div className="text-left">
                      <span className="text-[11px] font-black text-slate-900 uppercase block">{s.symbol}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{s.sector}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 block">KES {s.price}</span>
                      <span className="text-[10px] font-black text-rose-600">{s.percent}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Technical Gauge */}
            <div className="bg-slate-950 rounded-[2.5rem] border border-slate-800 p-5 shadow-xl" style={{ minHeight: 460 }}>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-black text-slate-200 uppercase tracking-wide">Technical Analysis</span>
                <span className="ml-auto text-[9px] font-black text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-500/30 uppercase tracking-widest">
                  {selectedStock.symbol}
                </span>
              </div>
              <div style={{ height: 420 }}>
                <NSETechnicalGauge
                  symbol={selectedStock.symbol}
                  price={selectedStock.price}
                  percent={selectedStock.percent}
                  pe={selectedStock.pe}
                  divYield={selectedStock.divYield}
                />
              </div>
            </div>

            <SocialSentimentPulse score={78} mentions={1240} />
          </div>
        </div>

        {/* AI Recommendation Banner */}
        <div className="relative rounded-[2.5rem] overflow-hidden shadow-xl mb-8 group min-h-[400px]">
          <div className="absolute inset-0 bg-slate-900/50 z-10 transition-colors group-hover:bg-slate-900/40" />
          <img 
            src="/images/african-american-entrepreneur-businessman-working-2026-03-09-09-18-43-utc.jpg"
            alt="Sentil AI Recommendation"
            className="absolute inset-0 w-full h-full object-cover object-[center_30%] group-hover:scale-105 transition-transform duration-[1500ms]"
          />
          <div className="relative z-20 p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
            <div className="max-w-2xl text-white">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/30 border border-indigo-400/40 rounded-full mb-6 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-indigo-300" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-50">Sentill AI Recommendation</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 drop-shadow-md">Stock of the Day: <span className="text-emerald-400">EQTY</span></h2>
              <p className="text-sm md:text-base font-medium text-slate-100 leading-relaxed mb-8 drop-shadow">
                Our Neural Recommendation Engine has identified a profound alpha opportunity in Equity Group Holdings. Analysing real-time sentiment, volume acceleration, and fundamental valuation metrics for all stocks providers.
              </p>
              
              <div className="flex items-center gap-6 mb-8 flex-wrap">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1 drop-shadow">AI Confidence</p>
                  <p className="text-3xl font-black text-emerald-400 drop-shadow-lg">96.4%</p>
                </div>
                <div className="h-10 w-px bg-white/30 hidden sm:block" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1 drop-shadow">Target Price</p>
                  <p className="text-3xl font-black text-white drop-shadow-lg">KES 54.00</p>
                </div>
                <div className="h-10 w-px bg-white/30 hidden md:block" />
                <div className="hidden md:block">
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1 drop-shadow">Time Horizon</p>
                  <p className="text-2xl font-black text-white drop-shadow-lg">3-6 Mos</p>
                </div>
              </div>
              
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-900/50">
                More Information
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="hidden lg:block relative">
              <div className="w-72 backdrop-blur-xl bg-slate-900/40 border border-white/20 rounded-[2rem] p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/40 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-indigo-200" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Growth Vector</p>
                    <p className="text-base font-black text-white drop-shadow">Positive Matrix</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[{ label: "Volume Spurt", val: "+24.3%" }, { label: "Institutional Buying", val: "High" }, { label: "Retail Sentiment", val: "Bullish" }].map((m, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0">
                      <span className="text-[10px] uppercase font-bold text-slate-300">{m.label}</span>
                      <span className="text-sm font-black text-white drop-shadow">{m.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full Stock Registry */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">NSE Listed Securities</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{stocks.length} instruments · Click to analyse</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {(["all", "banking", "telecoms", "manufacturing"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 hover:text-slate-700"}`}>{tab}</button>
              ))}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold uppercase focus:ring-1 focus:ring-indigo-500 outline-none w-40 placeholder:text-slate-400" />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/60">
                  <th className="pl-8 pr-2 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest w-10"></th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Ticker</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Change</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Volume</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">P/E</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Div Yield</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden xl:table-cell">52W Range</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Mkt Cap</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right pr-8">Sector</th>
                  <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right pr-8">Deep Dive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((stock, i) => {
                  const isSelected = selectedStock.symbol === stock.symbol;
                  const rangePercent = ((stock.price - stock.low52) / (stock.high52 - stock.low52)) * 100;
                  return (
                    <tr key={i} onClick={() => selectStock(stock)}
                      className={`cursor-pointer transition-all group ${isSelected ? "bg-indigo-50/40" : "hover:bg-slate-50/60"}`}>
                      <td className="pl-8 pr-2 py-5">
                        <button onClick={(e) => { e.stopPropagation(); toggleWatchlist(stock.symbol); }} className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${watchlist.includes(stock.symbol) ? "text-amber-500" : "text-slate-200 hover:text-slate-400"}`}>
                          <Star className="w-3.5 h-3.5" fill={watchlist.includes(stock.symbol) ? "currentColor" : "none"} />
                        </button>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[9px] font-black ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600"} transition-all`}>
                            {stock.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <span className="text-[11px] font-black text-slate-900 uppercase block">{stock.symbol}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase hidden md:block">{stock.name.split(" ").slice(0, 2).join(" ")}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5"><span className="text-sm font-black text-slate-900">KES {stock.price.toFixed(2)}</span></td>
                      <td className="px-4 py-5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${stock.percent >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                          {stock.percent >= 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}{Math.abs(stock.percent)}%
                        </span>
                      </td>
                      <td className="px-4 py-5 hidden md:table-cell"><span className="text-[10px] font-black text-slate-500 uppercase">{stock.volume}</span></td>
                      <td className="px-4 py-5 hidden lg:table-cell"><span className="text-[11px] font-black text-slate-700">{stock.pe}x</span></td>
                      <td className="px-4 py-5 hidden lg:table-cell"><span className="text-[11px] font-black text-indigo-600">{stock.divYield}%</span></td>
                      <td className="px-4 py-5 hidden xl:table-cell">
                        <div className="w-28 space-y-1">
                          <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase"><span>{stock.low52}</span><span>{stock.high52}</span></div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${rangePercent}%` }} /></div>
                        </div>
                      </td>
                      <td className="px-4 py-5 hidden lg:table-cell"><span className="text-[11px] font-black text-slate-700">KES {stock.cap}</span></td>
                      <td className="px-4 py-5 text-right pr-8"><span className="px-2 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-600 uppercase">{stock.sector}</span></td>
                      <td className="px-4 py-5 text-right pr-8" onClick={e => e.stopPropagation()}>
                        <Link href={`/markets/nse/${stock.symbol}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[8px] font-black uppercase tracking-widest rounded-lg transition-all">
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tax Alpha + Order Book Depth */}
        <div className="grid lg:grid-cols-2 gap-6">
          <TaxAlphaOptimizer yieldRate={selectedStock.divYield} taxCategory="WHT_10" />

          {/* Order Book / Market Depth panel */}
          <div className="bg-slate-950 rounded-[2.5rem] border border-slate-800 p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-200 uppercase tracking-tight flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5 text-indigo-400" /> Order Book
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                  {selectedStock.symbol} · Bid / Ask Depth
                </p>
              </div>
              <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/20 uppercase">
                Live Simulated
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Bids */}
              <div>
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">Bids</p>
                <div className="space-y-1">
                  {Array.from({ length: 8 }, (_, i) => {
                    const bidPrice = (selectedStock.price * (1 - (i + 1) * 0.003)).toFixed(2);
                    const seed = selectedStock.symbol.charCodeAt(0) + i * 7;
                    const qty = ((seed * 13 % 50) + 5) * 1000;
                    const maxQty = 60000;
                    return (
                      <div key={i} className="relative flex items-center justify-between px-2 py-1.5 rounded overflow-hidden">
                        <div
                          className="absolute inset-0 bg-emerald-500/10 rounded"
                          style={{ width: `${(qty / maxQty) * 100}%` }}
                        />
                        <span className="relative text-[10px] font-mono text-emerald-400 font-bold">{bidPrice}</span>
                        <span className="relative text-[10px] font-mono text-slate-400">{(qty / 1000).toFixed(0)}K</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Asks */}
              <div>
                <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-2">Asks</p>
                <div className="space-y-1">
                  {Array.from({ length: 8 }, (_, i) => {
                    const askPrice = (selectedStock.price * (1 + (i + 1) * 0.003)).toFixed(2);
                    const seed = selectedStock.symbol.charCodeAt(1) + i * 11;
                    const qty = ((seed * 17 % 45) + 8) * 1000;
                    const maxQty = 60000;
                    return (
                      <div key={i} className="relative flex items-center justify-between px-2 py-1.5 rounded overflow-hidden">
                        <div
                          className="absolute inset-y-0 right-0 bg-rose-500/10 rounded"
                          style={{ width: `${(qty / maxQty) * 100}%` }}
                        />
                        <span className="relative text-[10px] font-mono text-rose-400 font-bold">{askPrice}</span>
                        <span className="relative text-[10px] font-mono text-slate-400">{(qty / 1000).toFixed(0)}K</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* Spread */}
            <div className="mt-5 pt-5 border-t border-slate-800 flex items-center justify-between">
              <div className="text-center">
                <p className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">Last</p>
                <p className="text-sm font-black text-white">KES {selectedStock.price.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">Spread</p>
                <p className="text-sm font-black text-amber-400">
                  KES {(selectedStock.price * 0.006).toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">Change</p>
                <p className={`text-sm font-black ${selectedStock.percent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {selectedStock.percent >= 0 ? "+" : ""}{selectedStock.percent}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
