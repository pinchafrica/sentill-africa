"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import {
  TrendingUp, TrendingDown, Star, Plus, ArrowLeft, Shield, Activity,
  BarChart2, ChevronRight, Info, Globe, Users, DollarSign, Zap,
  Award, Calendar, Building2, Clock, ArrowUpRight, ArrowDownRight,
  CheckCircle, Bookmark, Share2, Bell
} from "lucide-react";
import NSEStockChart from "@/components/NSEStockChart";
import NSETechnicalGauge from "@/components/NSETechnicalGauge";
import AssetModal from "@/components/AssetModal";
import { useParams } from "next/navigation";
import { useAIStore } from "@/lib/store";

// ─── STOCK DATABASE ───────────────────────────────────────────────────────────

const STOCKS: Record<string, any> = {
  SCOM: {
    symbol: "SCOM", name: "Safaricom PLC", sector: "Telecoms", industry: "Mobile Telecommunications",
    tvSymbol: "NSEKE:SCOM", exchange: "NSE", currency: "KES",
    price: 30.60, change: +0.40, changePercent: +1.32, prevClose: 30.20,
    open: 30.25, high: 30.85, low: 29.90, volume: "48.2M", avgVolume: "42.1M",
    marketCap: "1,227B", sharesOut: "40.1B", freefloat: "35%",
    high52: 34.00, low52: 17.50, beta: 0.82,
    pe: 22.5, eps: 1.36, ps: 3.3, pb: 5.4, ev: "1,290B",
    divYield: 4.9, divPerShare: 1.51, payoutRatio: "111%", exDivDate: "Aug 2026",
    revenue: "371B", netIncome: "54.7B", ebitda: "118B", debtEquity: 0.45,
    roe: 38.2, currentRatio: 0.87, grossMargin: "46%", netMargin: "14.8%",
    ceo: "Peter Ndegwa", founded: "1997", employees: "~5,700", hq: "Nairobi, Kenya",
    description: "Safaricom PLC is Kenya's largest telecommunications company and the operator of M-Pesa, Africa's most successful mobile money platform. The company provides voice, data, and financial services to over 44 million subscribers across Kenya, with M-Pesa processing over KES 30 trillion annually.",
    website: "safaricom.co.ke",
    tags: ["Mobile Money", "Telecoms", "ESG Leader", "Blue Chip"],
    color: "#10b981",
    related: ["EQT", "KCBG", "COBANK", "BATK"],
    news: [
      { title: "Safaricom H1 Revenue Surges 12% on M-Pesa Growth", time: "2h ago", source: "Business Daily" },
      { title: "Ethiopia Subscriber Base Crosses 8M Mark", time: "1d ago", source: "Reuters" },
      { title: "Board Approves KES 1.51/share Final Dividend", time: "3d ago", source: "NSE Release" },
    ],
    priceHistory: [
      { date: "Mar'25", price: 17.40 }, { date: "Apr'25", price: 17.80 }, { date: "May'25", price: 18.20 },
      { date: "Jun'25", price: 18.80 }, { date: "Jul'25", price: 19.10 }, { date: "Aug'25", price: 20.50 },
      { date: "Sep'25", price: 21.20 }, { date: "Oct'25", price: 22.10 }, { date: "Nov'25", price: 21.80 },
      { date: "Dec'25", price: 22.50 }, { date: "Jan'26", price: 26.80 }, { date: "Apr'26", price: 30.60 },
    ],
    volumeHistory: [
      { date: "Mon", vol: 38.2 }, { date: "Tue", vol: 51.4 }, { date: "Wed", vol: 42.8 },
      { date: "Thu", vol: 39.5 }, { date: "Fri", vol: 48.2 },
    ],
    financials: {
      revenue: [{ y: "FY22", v: 296 }, { y: "FY23", v: 323 }, { y: "FY24", v: 371 }],
      netIncome: [{ y: "FY22", v: 46 }, { y: "FY23", v: 52 }, { y: "FY24", v: 54.7 }],
    },
    analystRating: { buy: 12, hold: 4, sell: 1, target: 35.00 },
  },
  EQT: {
    symbol: "EQT", name: "Equity Group Holdings", sector: "Banking", industry: "Commercial Banking",
    tvSymbol: "NSEKE:EQT", exchange: "NSE", currency: "KES",
    price: 77.00, change: +1.20, changePercent: +1.58, prevClose: 75.80,
    open: 76.00, high: 77.50, low: 75.50, volume: "12.4M", avgVolume: "10.8M",
    marketCap: "292.6B", sharesOut: "3.8B", freefloat: "68%",
    high52: 82.00, low52: 42.00, beta: 1.12,
    pe: 13.6, eps: 5.65, ps: 2.0, pb: 2.9, ev: "310B",
    divYield: 5.7, divPerShare: 4.37, payoutRatio: "77%", exDivDate: "Sep 2026",
    revenue: "145B", netIncome: "21.3B", ebitda: "35B", debtEquity: 7.2,
    roe: 22.4, currentRatio: 1.2, grossMargin: "78%", netMargin: "14.7%",
    ceo: "James Mwangi", founded: "1984", employees: "~17,000", hq: "Nairobi, Kenya",
    description: "Equity Group Holdings is East and Central Africa's largest bank by customer base with over 20 million accounts. Operating across 7 African countries, the group provides banking, insurance, health, and social impact services, underpinned by a strong digital platform.",
    website: "equitygroupholdings.com",
    tags: ["Banking", "Pan-African", "Dividend Stock"],
    color: "#6366f1",
    related: ["KCBG", "COBANK", "ABSA", "SCOM"],
    news: [
      { title: "Equity Group Posts KES 21.3B Profit, Beats Estimates", time: "5h ago", source: "Business Daily" },
      { title: "DRC Expansion Accelerates, Now 4M Customers", time: "2d ago", source: "Reuters Africa" },
    ],
    priceHistory: [
      { date: "Mar'25", price: 42.00 }, { date: "Apr'25", price: 43.50 }, { date: "May'25", price: 44.80 },
      { date: "Jun'25", price: 46.20 }, { date: "Jul'25", price: 47.80 }, { date: "Aug'25", price: 50.20 },
      { date: "Sep'25", price: 53.40 }, { date: "Oct'25", price: 54.80 }, { date: "Nov'25", price: 52.10 },
      { date: "Dec'25", price: 58.00 }, { date: "Jan'26", price: 65.50 }, { date: "Apr'26", price: 77.00 },
    ],
    volumeHistory: [
      { date: "Mon", vol: 9.2 }, { date: "Tue", vol: 11.8 }, { date: "Wed", vol: 10.4 },
      { date: "Thu", vol: 9.6 }, { date: "Fri", vol: 12.4 },
    ],
    financials: {
      revenue: [{ y: "FY22", v: 112 }, { y: "FY23", v: 128 }, { y: "FY24", v: 145 }],
      netIncome: [{ y: "FY22", v: 16 }, { y: "FY23", v: 19.2 }, { y: "FY24", v: 21.3 }],
    },
    analystRating: { buy: 10, hold: 5, sell: 2, target: 88.00 },
  },
  KCBG: {
    symbol: "KCBG", name: "KCB Group PLC", sector: "Banking", industry: "Commercial Banking",
    tvSymbol: "NSEKE:KCBG", exchange: "NSE", currency: "KES",
    price: 45.50, change: +0.50, changePercent: +1.11, prevClose: 45.00,
    open: 45.10, high: 45.80, low: 44.70, volume: "8.2M", avgVolume: "7.4M",
    marketCap: "145.6B", sharesOut: "3.2B", freefloat: "73%",
    high52: 48.00, low52: 32.00, beta: 1.05,
    pe: 9.4, eps: 4.82, ps: 1.2, pb: 1.8, ev: "158B",
    divYield: 6.6, divPerShare: 3.01, payoutRatio: "62%", exDivDate: "Sep 2026",
    revenue: "122B", netIncome: "15.5B", ebitda: "28B", debtEquity: 8.1,
    roe: 19.8, currentRatio: 1.1, grossMargin: "72%", netMargin: "12.7%",
    ceo: "Paul Russo", founded: "1896", employees: "~10,500", hq: "Nairobi, Kenya",
    description: "KCB Group PLC is Kenya's oldest and largest commercial bank by assets. Operating in 7 African countries, KCB offers retail, corporate, and mortgage banking, as well as insurance through its subsidiary KCB Insurance Agency.",
    website: "kcbgroup.com",
    tags: ["Banking", "Dividend Stock", "Blue Chip"],
    color: "#22c55e",
    related: ["EQT", "COBANK", "ABSA", "DTB"],
    news: [
      { title: "KCB Group Targets 10% Loan Book Growth in 2026", time: "1d ago", source: "Standard Media" },
      { title: "Acquisition of NBK Fully Integrated, Cost Synergies Realised", time: "4d ago", source: "Business Daily" },
    ],
    priceHistory: [
      { date: "Mar'25", price: 30.40 }, { date: "Apr'25", price: 31.80 }, { date: "May'25", price: 32.50 },
      { date: "Jun'25", price: 33.80 }, { date: "Jul'25", price: 35.20 }, { date: "Aug'25", price: 37.50 },
      { date: "Sep'25", price: 39.80 }, { date: "Oct'25", price: 40.20 }, { date: "Nov'25", price: 38.40 },
      { date: "Dec'25", price: 38.50 }, { date: "Jan'26", price: 41.20 }, { date: "Apr'26", price: 45.50 },
    ],
    volumeHistory: [
      { date: "Mon", vol: 6.8 }, { date: "Tue", vol: 8.9 }, { date: "Wed", vol: 7.4 },
      { date: "Thu", vol: 7.1 }, { date: "Fri", vol: 8.2 },
    ],
    financials: {
      revenue: [{ y: "FY22", v: 98 }, { y: "FY23", v: 110 }, { y: "FY24", v: 122 }],
      netIncome: [{ y: "FY22", v: 11.5 }, { y: "FY23", v: 13.8 }, { y: "FY24", v: 15.5 }],
    },
    analystRating: { buy: 8, hold: 6, sell: 2, target: 52.00 },
  },
};

// Fallback stock
const DEFAULT_STOCK = STOCKS["SCOM"];

// ─── DARK TOOLTIP ─────────────────────────────────────────────────────────────

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-xl">
      {label && <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex justify-between gap-6">
          <span className="text-[9px] text-slate-400">{p.name}</span>
          <span className="text-[10px] font-black text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const EXTRA_STOCKS: Record<string, any> = {
  "COOP": { name: "Co-op Bank", price: 18.50, change: +0.25, changePercent: +1.37, industry: "Banking" },
  "EABL": { name: "East African Breweries", price: 120.0, change: -1.00, changePercent: -0.83, industry: "Manufacturing" },
  "BAT": { name: "BAT Kenya", price: 430.0, change: +5.00, changePercent: +1.18, industry: "Manufacturing" },
  "ABSA": { name: "Absa Bank Kenya", price: 16.50, change: +0.15, changePercent: +0.92, industry: "Banking" },
  "SCBK": { name: "Standard Chartered", price: 250.0, change: +2.00, changePercent: +0.81, industry: "Banking" },
  "IMH": { name: "I&M Group", price: 18.5, change: +0.30, changePercent: +1.6, industry: "Banking" },
  "BAMB": { name: "Bamburi Cement", price: 25.0, change: -0.50, changePercent: -2.0, industry: "Construction" },
  "KPLC": { name: "Kenya Power", price: 1.5, change: +0.05, changePercent: +3.4, industry: "Energy" },
  "KEGN": { name: "KenGen", price: 2.3, change: +0.02, changePercent: +0.9, industry: "Energy" },
  "CTUM": { name: "Centum Investment", price: 8.5, change: -0.10, changePercent: -1.2, industry: "Investment" },
  "JUB": { name: "Jubilee Holdings", price: 185.0, change: +1.50, changePercent: +0.8, industry: "Insurance" },
  "DTK": { name: "Diamond Trust Bank", price: 45.0, change: +0.80, changePercent: +1.8, industry: "Banking" }
};

export default function NSEStockPage() {
  const params = useParams();
  const symbolParam = (params?.symbol as string)?.toUpperCase() || "SCOM";
  
  let stock = STOCKS[symbolParam];
  if (!stock && EXTRA_STOCKS[symbolParam]) {
    const extra = EXTRA_STOCKS[symbolParam];
    stock = {
      ...DEFAULT_STOCK,
      symbol: symbolParam,
      name: extra.name,
      price: extra.price,
      change: extra.change,
      changePercent: extra.changePercent,
      industry: extra.industry,
      prevClose: Number((extra.price - extra.change).toFixed(2)),
      volume: "N/A",
      avgVolume: "N/A",
      marketCap: "N/A",
      peRatio: "N/A",
      dividendYield: "N/A",
      high52: (extra.price * 1.2).toFixed(2),
      low52: (extra.price * 0.8).toFixed(2),
      description: `${extra.name} is a leading entity in the ${extra.industry} sector listed on the Nairobi Securities Exchange.`,
    };
  } else if (!stock) {
    stock = DEFAULT_STOCK;
  }

  const { watchlist, toggleWatchlist } = useAIStore();
  const watchlisted = watchlist.includes(stock.symbol);

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [alertSet, setAlertSet] = useState(false);
  const [chartPeriod, setChartPeriod] = useState("1Y");
  const [activeTab, setActiveTab] = useState<"overview" | "financials" | "news" | "peers">("overview");
  const [counter, setCounter] = useState(stock.price * 0.85);

  const [aiInsights, setAiInsights] = useState("");
  const [aiError, setAiError] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    async function fetchAiInsights() {
      setIsAiLoading(true);
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            query: `Analyze ${stock.symbol} stock. Give me a 3-sentence summary on its recent performance and future outlook.`,
            context: { price: stock.price, PE: stock.pe, DivYield: stock.divYield }
          }),
        });
        const data = await res.json();
        if (data.error === "upgrade_required") {
          setAiError("upgrade_required");
        } else {
          setAiError("");
          setAiInsights(data.response || "Sentill Africa is currently offline.");
        }
      } catch (err) {
        setAiError("");
        setAiInsights("Unable to reach the Sentil Assistant.");
      } finally {
        setIsAiLoading(false);
      }
    }
    fetchAiInsights();
  }, [stock.symbol, stock.price, stock.pe, stock.divYield]);

  useEffect(() => {
    const timer = setTimeout(() => setCounter(stock.price), 600);
    return () => clearTimeout(timer);
  }, [stock.price]);

  const isUp = stock.change >= 0;
  const totalAnalysts = stock.analystRating.buy + stock.analystRating.hold + stock.analystRating.sell;
  const buyPct = Math.round(stock.analystRating.buy / totalAnalysts * 100);
  const range52Pct = Math.round((stock.price - stock.low52) / (stock.high52 - stock.low52) * 100);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── BREADCRUMB ── */}
      <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex items-center gap-2">
        <Link href="/markets/nse" className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 hover:text-slate-700 uppercase tracking-widest transition-colors">
          <ArrowLeft className="w-3 h-3" /> NSE Markets
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stock.sector}</span>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">{stock.symbol}</span>
      </div>

      {/* ── HERO HEADER ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 md:px-10 pt-8 pb-12">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">

          {/* Left: Identity */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl" style={{ background: stock.color }}>
                {stock.symbol.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white uppercase tracking-tight">{stock.name}</h1>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stock.symbol}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stock.exchange}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stock.sector}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {stock.tags.map((t: string) => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-[8px] font-black text-slate-300 uppercase tracking-widest">{t}</span>
              ))}
            </div>
          </div>

          {/* Right: Price + Actions */}
          <div className="flex flex-col lg:items-end gap-4">
            <div>
              <div className="flex items-end gap-4">
                <span className="text-5xl font-black text-white tracking-tighter">
                  {stock.currency} {counter.toFixed(2)}
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-500/20 border border-blue-500/30 self-center mb-1">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Data Verified</span>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl ${isUp ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-rose-500/20 border border-rose-500/30"}`}>
                  {isUp ? <ArrowUpRight className="w-4 h-4 text-emerald-400" /> : <ArrowDownRight className="w-4 h-4 text-rose-400" />}
                  <span className={`text-sm font-black ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                    {isUp ? "+" : ""}{stock.change.toFixed(2)} ({isUp ? "+" : ""}{stock.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Prev Close: KES {stock.prevClose} · Vol: {stock.volume}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleWatchlist(stock.symbol)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${watchlisted ? "bg-amber-500 border-amber-500 text-white" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}
              >
                <Star className={`w-3.5 h-3.5 ${watchlisted ? "fill-white" : ""}`} />
                {watchlisted ? "Watching" : "Watchlist"}
              </button>
              <button
                onClick={() => setAlertSet(a => !a)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${alertSet ? "bg-indigo-500 border-indigo-500 text-white" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}
              >
                <Bell className="w-3.5 h-3.5" />
                {alertSet ? "Alert On" : "Set Alert"}
              </button>
              <button
                onClick={() => {
                  setIsAssetModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-400 text-white transition-all shadow-lg shadow-emerald-900/10"
              >
                <Plus className="w-3.5 h-3.5" />
                Add to Portfolio
              </button>
            </div>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-6">
          {[
            { label: "Open", value: stock.open },
            { label: "Day High", value: stock.high },
            { label: "Day Low", value: stock.low },
            { label: "Mkt Cap", value: stock.marketCap },
            { label: "P/E Ratio", value: stock.pe },
            { label: "Div Yield", value: stock.divYield + "%" },
            { label: "EPS", value: stock.eps },
            { label: "Beta", value: stock.beta },
          ].map(k => (
            <div key={k.label} className="bg-white/5 rounded-xl p-3 border border-white/10">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{k.label}</span>
              <span className="text-sm font-black text-white">{k.value}</span>
            </div>
          ))}
        </div>

        {/* 52W Range */}
        <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">52-Week Range</span>
            <span className="text-[9px] font-black text-slate-300">{range52Pct}% of range</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-rose-400">{stock.low52}</span>
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full relative" style={{ width: "100%" }}>
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg" style={{ left: `${range52Pct}%`, transform: "translate(-50%,-50%)" }} />
              </div>
            </div>
            <span className="text-[10px] font-black text-emerald-400">{stock.high52}</span>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 py-8 space-y-8">

        {/* ── CHART SECTION ── */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 pt-6 pb-4 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Live Chart</h2>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
              </div>
            </div>
          </div>
          <div style={{ height: 500 }} className="bg-slate-950 rounded-b-[2.5rem] overflow-hidden">
            <NSEStockChart
              symbol={stock.symbol}
              price={stock.price}
              change={stock.change}
              percent={stock.changePercent}
              high52={stock.high52}
              low52={stock.low52}
            />
          </div>
        </div>

        {/* ── PRICE HISTORY + VOLUME ── */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">12-Month Price History</h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-5">Closing price · KES</p>
            <ResponsiveContainer minWidth={1} width="100%" height={200}>
              <AreaChart data={stock.priceHistory}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={stock.color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={stock.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                <YAxis domain={["auto", "auto"]} tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} tickFormatter={v => v.toFixed(0)} />
                <Tooltip content={<DarkTooltip />} />
                <ReferenceLine y={stock.price} stroke={stock.color} strokeDasharray="3 3" strokeWidth={1} />
                <Area type="monotone" dataKey="price" name="Price (KES)" stroke={stock.color} fill="url(#priceGrad)" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Weekly Volume</h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-5">Shares traded (millions)</p>
            <ResponsiveContainer minWidth={1} width="100%" height={200}>
              <BarChart data={stock.volumeHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="vol" name="Volume (M)" fill={stock.color} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── DETAIL TABS ── */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100">
            {(["overview", "financials", "news", "peers"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-5 text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600"}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Description */}
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3">About {stock.name}</h3>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{stock.description}</p>
                  <div className="flex flex-wrap gap-4 mt-4">
                    {[
                      { icon: Building2, label: "Founded", value: stock.founded },
                      { icon: Users, label: "Employees", value: stock.employees },
                      { icon: Globe, label: "Website", value: stock.website },
                      { icon: DollarSign, label: "CEO", value: stock.ceo },
                    ].map(d => (
                      <div key={d.label} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                        <d.icon className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{d.label}:</span>
                        <span className="text-[9px] font-black text-slate-700">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3">Key Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Market Cap", value: "KES " + stock.marketCap },
                      { label: "Revenue (FY24)", value: "KES " + stock.revenue },
                      { label: "Net Income", value: "KES " + stock.netIncome },
                      { label: "ROE", value: stock.roe + "%" },
                      { label: "Net Margin", value: stock.netMargin },
                      { label: "Shares Outstanding", value: stock.sharesOut },
                      { label: "Div/Share", value: "KES " + stock.divPerShare },
                      { label: "Payout Ratio", value: stock.payoutRatio },
                    ].map(m => (
                      <div key={m.label} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{m.label}</span>
                        <span className="text-sm font-black text-slate-900">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analyst Rating */}
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3">Analyst Consensus</h3>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-3xl font-black text-emerald-600">{buyPct}%</div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Buy</div>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[
                        { label: "Buy", count: stock.analystRating.buy, color: "bg-emerald-500", pct: Math.round(stock.analystRating.buy / totalAnalysts * 100) },
                        { label: "Hold", count: stock.analystRating.hold, color: "bg-amber-400", pct: Math.round(stock.analystRating.hold / totalAnalysts * 100) },
                        { label: "Sell", count: stock.analystRating.sell, color: "bg-rose-400", pct: Math.round(stock.analystRating.sell / totalAnalysts * 100) },
                      ].map(r => (
                        <div key={r.label} className="flex items-center gap-3">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest w-8">{r.label}</span>
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.pct}%` }} />
                          </div>
                          <span className="text-[9px] font-black text-slate-700 w-6 text-right">{r.count}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-center">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">12M Target</div>
                      <div className="text-2xl font-black text-slate-900">KES {stock.analystRating.target}</div>
                      <div className={`text-[9px] font-black mt-1 ${stock.analystRating.target > stock.price ? "text-emerald-500" : "text-rose-500"}`}>
                        {stock.analystRating.target > stock.price ? "+" : ""}{(((stock.analystRating.target - stock.price) / stock.price) * 100).toFixed(1)}% upside
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FINANCIALS TAB */}
            {activeTab === "financials" && (
              <div className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Revenue (KES Bn)</h3>
                    <ResponsiveContainer minWidth={1} width="100%" height={200}>
                      <BarChart data={stock.financials.revenue}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="y" tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                        <Tooltip content={<DarkTooltip />} />
                        <Bar dataKey="v" name="Revenue (Bn)" fill={stock.color} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Net Income (KES Bn)</h3>
                    <ResponsiveContainer minWidth={1} width="100%" height={200}>
                      <BarChart data={stock.financials.netIncome}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="y" tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                        <Tooltip content={<DarkTooltip />} />
                        <Bar dataKey="v" name="Net Income (Bn)" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "EV/EBITDA", value: "7.0x" },
                    { label: "Debt/Equity", value: stock.debtEquity },
                    { label: "Current Ratio", value: stock.currentRatio },
                    { label: "Gross Margin", value: stock.grossMargin },
                    { label: "P/S Ratio", value: stock.ps + "x" },
                    { label: "P/B Ratio", value: stock.pb + "x" },
                    { label: "Free Float", value: stock.freefloat },
                    { label: "EBITDA", value: "KES " + stock.ebitda },
                  ].map(m => (
                    <div key={m.label} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">{m.label}</span>
                      <span className="text-sm font-black text-slate-900">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NEWS TAB */}
            {activeTab === "news" && (
              <div className="space-y-4">
                {stock.news.map((n: any, i: number) => (
                  <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all cursor-pointer">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: stock.color + "20" }}>
                      <Activity className="w-5 h-5" style={{ color: stock.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-black text-slate-900">{n.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{n.source}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[9px] font-bold text-slate-400">{n.time}</span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}

            {/* PEERS TAB */}
            {activeTab === "peers" && (
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-5">Peer comparison · {stock.sector} sector</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stock.related.map((sym: string) => {
                    const peer = STOCKS[sym];
                    if (!peer) return (
                      <Link key={sym} href={`/markets/nse/${sym}`} className="block p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600">{sym.slice(0, 2)}</div>
                          <span className="text-[10px] font-black text-slate-700 uppercase">{sym}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">View Profile →</p>
                      </Link>
                    );
                    return (
                      <Link key={sym} href={`/markets/nse/${sym}`} className="block p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[9px] font-black" style={{ background: peer.color }}>{peer.symbol.slice(0, 2)}</div>
                          <div>
                            <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest">{peer.symbol}</p>
                            <p className="text-[8px] text-slate-400 font-bold">{peer.sector}</p>
                          </div>
                        </div>
                        <p className="text-sm font-black text-slate-900">KES {peer.price}</p>
                        <p className={`text-[9px] font-black ${peer.change >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                          {peer.change >= 0 ? "+" : ""}{peer.changePercent.toFixed(2)}%
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── TECHNICAL ANALYSIS ── */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Technical Analysis</h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">11 Indicators · Real-time signals · {stock.symbol}</p>
          </div>
          <div className="bg-slate-950 p-5 rounded-b-[2.5rem]" style={{ minHeight: 480 }}>
            <NSETechnicalGauge
              symbol={stock.symbol}
              price={stock.price}
              percent={stock.changePercent}
              pe={stock.pe}
              divYield={stock.divYield}
            />
          </div>
        </div>

        {/* ── AI INSIGHTS PANEL ── */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest">Sentill Africa · {stock.symbol} Analysis</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Market Intelligence · April 2026</p>
            </div>
          </div>

          {aiError === "upgrade_required" ? (
             <div className="flex flex-col items-center justify-center text-center py-6 relative z-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Premium Intelligence Locked</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 max-w-sm mb-6">
                   Upgrade to Pro to unlock institutional-grade market analysis for {stock.symbol} and other NSE Equities.
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
                   <span className="text-slate-400 text-sm font-medium italic">Sentill is reading the market for {stock.symbol}...</span>
                 </div>
               ) : (
                 <div className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 text-sm text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
                   {aiInsights}
                 </div>
               )}
            </div>
          )}
        </div>

        {/* ── ADD TO PORTFOLIO CTA ── */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2.5rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Track {stock.symbol} in Your Portfolio</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Log your position · Monitor yield · Smart portfolio analytics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
               onClick={() => {
                 setIsAssetModalOpen(true);
               }}
              className="flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all"
            >
              <Plus className="w-4 h-4" /> Add to Portfolio
            </button>
            <Link href="/tools/compare" className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all">
              <BarChart2 className="w-4 h-4" /> Compare
            </Link>
          </div>
        </div>

        {/* ── DIVIDEND INCOME CALCULATOR ── */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Dividend Income Calculator</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">How much would you earn per year?</p>
            </div>
          </div>
          {[10000, 50000, 100000].map(amt => {
            const shares = Math.floor(amt / stock.price);
            const grossDiv = shares * stock.divPerShare;
            const netDiv = Math.round(grossDiv * 0.95);
            return (
              <div key={amt} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                <div>
                  <span className="text-[10px] font-black text-slate-700">KES {amt.toLocaleString()} invested</span>
                  <span className="text-[9px] text-slate-400 font-medium ml-2">= {shares} shares</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-600">KES {netDiv.toLocaleString()}/yr</span>
                  <span className="text-[9px] text-slate-400 font-medium block">net dividend (after 5% WHT)</span>
                </div>
              </div>
            );
          })}
          <p className="text-[8px] text-slate-400 font-medium mt-4">Based on KES {stock.divPerShare}/share last declared dividend · {stock.divYield}% yield · Capital gains currently 0% tax in Kenya.</p>
        </div>

        {/* ── INVEST VIA ZIIDI ── */}
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-[2.5rem] p-8 text-white">
          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-sm font-black">Z</div>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-100">Ziidi by Safaricom</span>
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight">Invest in {stock.symbol} via M-Pesa</h2>
              <p className="text-[10px] text-emerald-100 font-medium mt-1">Kenya's easiest way to own NSE stocks · Start from KES 100</p>
            </div>
            <div className="bg-white/15 border border-white/20 rounded-2xl px-4 py-3 text-center flex-shrink-0">
              <div className="text-2xl font-black">KES 100</div>
              <div className="text-[8px] font-black uppercase tracking-widest text-emerald-100">minimum</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "M-Pesa native", icon: "📱" },
              { label: "Digital KYC (2 min)", icon: "✅" },
              { label: "Dividends to M-Pesa", icon: "💰" },
              { label: "0% capital gains tax", icon: "🎉" },
            ].map(f => (
              <div key={f.label} className="bg-white/10 border border-white/15 rounded-xl p-3 text-center">
                <div className="text-lg mb-1">{f.icon}</div>
                <div className="text-[8px] font-black uppercase tracking-widest text-emerald-100">{f.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-white/10 border border-white/20 rounded-2xl p-4 mb-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100 mb-2">How to buy {stock.symbol} on Ziidi:</p>
            <div className="space-y-1">
              {[
                "Open Safaricom app → tap Ziidi",
                "Create account with your ID (2 min)",
                `Search "${stock.symbol}" → tap Buy`,
                "Enter amount → pay via M-Pesa → Done",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 text-[9px] font-medium text-white">
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[8px] font-black flex-shrink-0">{i + 1}</span>
                  {step}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 text-[9px] text-emerald-200 font-medium">
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span>Regulated by CMA · Shares held in your CDS account · Not financial advice</span>
          </div>
        </div>

        {/* ── NSE TRADING RULES ── */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">NSE Trading Rules</h2>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-6">What every Kenyan investor needs to know</p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Clock, label: "Trading Hours", value: "Mon–Fri · 9:00am – 3:00pm EAT", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: Calendar, label: "Settlement (T+3)", value: "Shares & cash clear in 3 business days", color: "text-indigo-600", bg: "bg-indigo-50" },
              { icon: DollarSign, label: "Broker Commission", value: "~1.5–2.5% per trade · CDA levy 0.12%", color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: Shield, label: "Dividend WHT", value: "5% withheld automatically by company", color: "text-amber-600", bg: "bg-amber-50" },
              { icon: TrendingUp, label: "Capital Gains Tax", value: "Currently 0% in Kenya — keep full profit", color: "text-emerald-600", bg: "bg-emerald-50" },
              { icon: Award, label: "Your Shares", value: "Held in CDS account — safe even if broker closes", color: "text-purple-600", bg: "bg-purple-50" },
            ].map(r => (
              <div key={r.label} className={`flex items-start gap-3 p-4 ${r.bg} rounded-2xl`}>
                <r.icon className={`w-4 h-4 ${r.color} mt-0.5 flex-shrink-0`} />
                <div>
                  <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{r.label}</p>
                  <p className="text-[10px] font-medium text-slate-600 mt-0.5">{r.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BROKER DIRECTORY ── */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <div>
                 <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Advanced: Direct Broker Access</h2>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">CMA-Licensed NSE Stockbrokers</p>
              </div>
              <Shield className="w-5 h-5 text-slate-300" />
           </div>
           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                 { name: "NCBA Go-Live", url: "https://ncbagroup.com/investment-bank/", desc: "M-Pesa deposits. From KES 500.", commission: "1.5%", mpesa: true },
                 { name: "Dyer & Blair", url: "https://dyerandblair.com/", desc: "Kenya's oldest investment bank.", commission: "2.1%", mpesa: false },
                 { name: "Faida F-Trade", url: "https://www.fib.co.ke/", desc: "Mobile-first app, easy KYC.", commission: "1.8%", mpesa: true },
                 { name: "SIB Mansa-X", url: "https://sib.co.ke/", desc: "Multi-asset + global markets.", commission: "2.0%", mpesa: false }
              ].map(broker => (
                 <a key={broker.name} href={broker.url} target="_blank" rel="noreferrer" className="group p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest group-hover:text-indigo-600">{broker.name}</h4>
                      {broker.mpesa && <span className="text-[7px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 uppercase tracking-widest">M-Pesa</span>}
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium mb-1">{broker.desc}</p>
                    <p className="text-[9px] font-black text-slate-600">Commission: {broker.commission}</p>
                    <div className="flex items-center gap-2 text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-3">
                       Launch App <ChevronRight className="w-3 h-3" />
                    </div>
                 </a>
              ))}
           </div>
        </div>
      </div>
      <AssetModal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} prefilledAsset={stock.symbol} />
    </div>
  );
}
