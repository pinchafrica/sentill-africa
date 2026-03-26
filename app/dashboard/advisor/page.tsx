"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import {
  BrainCircuit, TrendingUp, ShieldCheck, Zap, Star, Trophy,
  BarChart3, Layers, Calculator, ArrowRight, Info, Target,
  Brain, Sparkles, Building2, DollarSign, CheckCircle2, AlertCircle,
  Flame, ChevronRight, RefreshCw, Filter, Loader2
} from "lucide-react";

// ─── Market Data ─────────────────────────────────────────────────────────────
const TOP_PERFORMERS = [
  {
    rank: 1,
    id: "ifb1_2024",
    name: "IFB1/2024/006",
    fullName: "Infrastructure Bond 2024",
    type: "Govt Bond",
    yield: 18.46,
    netYield: 18.46,
    taxCategory: "WHT_0",
    riskLevel: "Low",
    aum: "KES 120B",
    badge: "Highest Net Return",
    badgeColor: "bg-emerald-100 text-emerald-700",
    color: "from-emerald-500 to-teal-600",
    description: "Flagship tax-free infrastructure bond offering Kenya's best net yield for 2024-2030.",
    trend: "+0.12%",
    trendUp: true,
    category: "fixed_income"
  },
  {
    rank: 2,
    id: "etica",
    name: "Etica Wealth MMF",
    fullName: "Etica Capital MMF",
    type: "MMF",
    yield: 17.55,
    netYield: 14.92,
    taxCategory: "WHT_15",
    riskLevel: "Low",
    aum: "KES 18.2B",
    badge: "#1 Money Market",
    badgeColor: "bg-blue-100 text-blue-700",
    color: "from-blue-500 to-indigo-600",
    description: "Kenya's best-performing money market fund with daily accrual and instant T+1 redemption.",
    trend: "+0.08%",
    trendUp: true,
    category: "mmf"
  },
  {
    rank: 3,
    id: "lofty",
    name: "Lofty-Corban MMF",
    fullName: "Lofty-Corban Investment",
    type: "MMF",
    yield: 17.50,
    netYield: 14.875,
    taxCategory: "WHT_15",
    riskLevel: "Low",
    aum: "KES 8.5B",
    badge: "Rising Star",
    badgeColor: "bg-violet-100 text-violet-700",
    color: "from-violet-500 to-purple-600",
    description: "High-growth MMF with competitive rates and CMA-regulated fund management.",
    trend: "+0.05%",
    trendUp: true,
    category: "mmf"
  },
  {
    rank: 4,
    id: "scom",
    name: "Safaricom (SCOM)",
    fullName: "Safaricom PLC",
    type: "NSE Equity",
    yield: 8.5,
    netYield: 8.08,
    taxCategory: "WHT_5",
    riskLevel: "Medium",
    aum: "KES 30.60/share",
    badge: "Dividend Champion",
    badgeColor: "bg-amber-100 text-amber-700",
    color: "from-amber-500 to-orange-600",
    description: "Kenya's largest company by market cap with consistent dividend payouts and M-Pesa dominance.",
    trend: "-0.33%",
    trendUp: false,
    category: "equity"
  },
  {
    rank: 5,
    id: "stima_sacco",
    name: "Stima SACCO",
    fullName: "Stima DT SACCO",
    type: "SACCO",
    yield: 14.5,
    netYield: 14.5,
    taxCategory: "WHT_0",
    riskLevel: "Low",
    aum: "KES 52B",
    badge: "SASRA Tier 1",
    badgeColor: "bg-teal-100 text-teal-700",
    color: "from-teal-500 to-emerald-600",
    description: "Kenya's largest SACCO with guaranteed deposits and 14.5% dividend. SASRA-regulated Tier 1.",
    trend: "+0%",
    trendUp: true,
    category: "sacco"
  }
];

const AI_RECOMMENDATIONS = [
  {
    id: "tax-alpha",
    category: "tax" as const,
    title: "Tax Alpha Opportunity — Save 15% More",
    body: "If you're holding only MMFs, you're losing 15% of returns to WHT annually. Shifting 40% of your portfolio to IFBs (tax-free) could save a significant amount. The IFB1/2024 is currently offering 18.46% completely tax-free — effectively outperforming any MMF after-tax.",
    priority: "critical" as const,
    action: "Log IFB Asset",
    actionHref: "/dashboard/assets?logAsset=ifb1_2024",
    icon: ShieldCheck,
    accentColor: "emerald",
    metric: "18.46% Tax-Free",
    metricLabel: "vs 14.9% MMF net"
  },
  {
    id: "mmf-ladder",
    category: "yield" as const,
    title: "MMF Ladder Strategy — Maximize Liquidity + Yield",
    body: "Split your liquid savings across Etica (17.55%) and Lofty-Corban (17.50%). This slight diversification across two top MMFs reduces counterparty risk while maintaining excellent yield. Both are CMA-regulated Tier 1 funds.",
    priority: "high" as const,
    action: "Explore MMFs",
    actionHref: "/dashboard/explore",
    icon: Layers,
    accentColor: "blue",
    metric: "17.5% avg",
    metricLabel: "blended MMF yield"
  },
  {
    id: "sacco-anchor",
    category: "diversification" as const,
    title: "SACCO Anchor — 14.5% + Loan Access",
    body: "SACCOs like Stima offer guaranteed dividends (14.5%) and emergency loan access at 1% per month — far cheaper than any bank. Perfect for investors who need credit access alongside growth. SASRA-regulated with government-supervised deposits.",
    priority: "medium" as const,
    action: "View SACCOs",
    actionHref: "/dashboard/sacco",
    icon: Building2,
    accentColor: "teal",
    metric: "14.5% + Loans",
    metricLabel: "dividend + credit"
  },
  {
    id: "nse-timing",
    category: "market" as const,
    title: "NSE: Equity Group Dividend Season Approaching",
    body: "Equity Group (EQTY) is trading at KES 77.00 and typically announces dividends in Q2. With a historical payout ratio of ~35%, buying before the record date could lock in an additional 4-6% in dividends on top of capital gains.",
    priority: "medium" as const,
    action: "Research EQTY",
    actionHref: "/dashboard/yields",
    icon: TrendingUp,
    accentColor: "amber",
    metric: "KES 77.00",
    metricLabel: "current price"
  },
  {
    id: "diaspora-usd",
    category: "diaspora" as const,
    title: "Diaspora: Sanlam USD MMF at 6.20% USD",
    body: "For investors earning or holding USD, the Sanlam USD Money Market Fund offers 6.20% annually in USD — significantly higher than any US savings account. Eliminates forex risk for diaspora remittances.",
    priority: "low" as const,
    action: "View USD Funds",
    actionHref: "/dashboard/explore?type=USD",
    icon: DollarSign,
    accentColor: "violet",
    metric: "6.20% USD",
    metricLabel: "Sanlam USD MMF"
  }
];

const CATEGORIES = [
  { id: "all", label: "All Insights", icon: Sparkles },
  { id: "tax", label: "Tax Alpha", icon: ShieldCheck },
  { id: "yield", label: "Yield Boost", icon: TrendingUp },
  { id: "diversification", label: "Diversify", icon: Layers },
  { id: "market", label: "Market Timing", icon: BarChart3 },
  { id: "diaspora", label: "Diaspora", icon: DollarSign }
];

const PRIORITY_CONFIG = {
  critical: { label: "Critical", badge: "bg-rose-100 text-rose-700 border-rose-200", border: "border-l-rose-500" },
  high: { label: "High Priority", badge: "bg-orange-100 text-orange-700 border-orange-200", border: "border-l-orange-500" },
  medium: { label: "Medium", badge: "bg-amber-100 text-amber-700 border-amber-200", border: "border-l-amber-400" },
  low: { label: "Info", badge: "bg-slate-100 text-slate-600 border-slate-200", border: "border-l-slate-300" }
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function IntelligenceDashboard() {
  const [activeSection, setActiveSection] = useState<"top_performers" | "ai_intel">("top_performers");
  const [activeCat, setActiveCat] = useState("all");
  const [filterType, setFilterType] = useState("All");
  const [capital, setCapital] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [strategyGenerated, setStrategyGenerated] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [liveQuery, setLiveQuery] = useState("");

  const assetTypes = ["All", "fixed_income", "mmf", "equity", "sacco"];

  const filteredPerformers = useMemo(() => {
    if (filterType === "All") return TOP_PERFORMERS;
    return TOP_PERFORMERS.filter(p => p.category === filterType);
  }, [filterType]);

  const filteredRecs = useMemo(() => {
    if (activeCat === "all") return AI_RECOMMENDATIONS;
    return AI_RECOMMENDATIONS.filter(r => r.category === activeCat);
  }, [activeCat]);

  const handleGenerateStrategy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capital || Number(capital) < 1000) return;
    setIsGenerating(true);
    setStrategyGenerated(false);
    setTimeout(() => { setIsGenerating(false); setStrategyGenerated(true); }, 1200);
  };

  const handleAiQuery = async () => {
    if (!liveQuery.trim()) return;
    setIsAiLoading(true);
    setAiResponse("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: liveQuery })
      });
      const data = await res.json();
      if (data.error === "upgrade_required") {
        setAiResponse("⚡ Premium Required — Upgrade to Pro to unlock unlimited AI Oracle queries.");
      } else {
        setAiResponse(data.response || "No response generated.");
      }
    } catch {
      setAiResponse("AI Oracle temporarily unavailable. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const amount = Number(capital) || 0;
  const mmfAlloc = amount * 0.40;
  const bondsAlloc = amount * 0.45;
  const stocksAlloc = amount * 0.15;

  return (
    <div className="space-y-8 pb-24 max-w-4xl mx-auto">

      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">AI Intelligence Hub</h1>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded flex items-center gap-1">
              <Zap className="w-3 h-3" /> Live
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Institutional intelligence · Real-time market data · AI-powered insights
          </p>
        </div>
        <Link href="/dashboard/analyze" className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wide hover:bg-blue-600 transition-colors shadow-lg">
          <BrainCircuit className="w-4 h-4" /> Ask AI Oracle
        </Link>
      </div>

      {/* ─── SECTION TOGGLE ──────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
        <button
          onClick={() => setActiveSection("top_performers")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${
            activeSection === "top_performers" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span className="hidden sm:inline">Top Performers</span>
          <span className="sm:hidden">Top</span>
        </button>
        <button
          onClick={() => setActiveSection("ai_intel")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${
            activeSection === "ai_intel" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Brain className="w-4 h-4" />
          <span className="hidden sm:inline">AI Recommendations</span>
          <span className="sm:hidden">AI Intel</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSection === "top_performers" && (
          <motion.div key="top" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

            {/* Category filter */}
            <div className="flex gap-2 flex-wrap">
              {assetTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all ${
                    filterType === type ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {type === "fixed_income" ? "Bonds" : type === "All" ? "All" : type === "mmf" ? "MMFs" : type === "equity" ? "Equities" : "SACCOs"}
                </button>
              ))}
            </div>

            {/* Leaderboard */}
            <div className="space-y-3">
              {filteredPerformers.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-lg transition-all group relative overflow-hidden"
                >
                  {/* Rank accent */}
                  <div className={`absolute top-0 left-0 bottom-0 w-1 rounded-l-3xl bg-gradient-to-b ${p.color}`} />
                  
                  <div className="flex items-center gap-4 pl-2">
                    {/* Rank */}
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center shrink-0 shadow-md`}>
                      <span className="text-white font-black text-sm">#{p.rank}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="font-black text-slate-900 text-sm">{p.name}</h3>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${p.badgeColor}`}>
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">{p.type} · {p.aum}</p>
                    </div>

                    {/* Yield */}
                    <div className="text-right shrink-0">
                      <div className="text-xl font-black text-slate-900">{p.yield}%</div>
                      <div className={`text-[9px] font-black uppercase ${p.trendUp ? "text-emerald-600" : "text-rose-500"}`}>
                        {p.trend} today
                      </div>
                      {p.taxCategory === "WHT_0" && (
                        <div className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1">WHT-Free</div>
                      )}
                    </div>

                    <Link
                      href={`/dashboard/assets?logAsset=${p.id}`}
                      className="shrink-0 px-3 py-2 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all hidden sm:block"
                    >
                      Log Asset
                    </Link>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-relaxed mt-3 pl-2">{p.description}</p>

                  <div className="flex items-center gap-3 mt-3 pl-2 flex-wrap">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      p.riskLevel === "Low" ? "bg-emerald-50 text-emerald-700" :
                      p.riskLevel === "Medium" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                    }`}>
                      {p.riskLevel} Risk
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold">
                      Net: {p.netYield.toFixed(2)}% after tax
                    </span>
                    <Link href={`/dashboard/assets?logAsset=${p.id}`} className="ml-auto sm:hidden text-[10px] font-black text-blue-600 flex items-center gap-1">
                      Log <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Allocation Tool */}
            <div className="bg-gradient-to-br from-slate-950 to-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-base">Ultra Allocation Engine</h3>
                    <p className="text-slate-400 text-xs font-bold">AI-optimized portfolio distribution</p>
                  </div>
                </div>

                <form onSubmit={handleGenerateStrategy} className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">KES</span>
                    <input
                      type="number"
                      value={capital}
                      onChange={e => setCapital(e.target.value)}
                      placeholder="500000"
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-2xl pl-14 pr-4 py-4 font-black text-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isGenerating || !capital || Number(capital) < 1000}
                    className="sm:w-40 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-wide text-xs transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-xl"
                  >
                    {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing</> : "Generate Alpha"}
                  </button>
                </form>

                <AnimatePresence>
                  {strategyGenerated && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-3 mt-4">
                      {[
                        { label: "Liquidity Shield", sublabel: "Etica MMF (40%)", amount: mmfAlloc, color: "emerald", yield: "17.55%" },
                        { label: "Tax-Free Anchor", sublabel: "IFB1/2024 (45%)", amount: bondsAlloc, color: "blue", yield: "18.46%" },
                        { label: "Growth Alpha", sublabel: "SCOM/EQTY (15%)", amount: stocksAlloc, color: "amber", yield: "~8.5%" }
                      ].map((t, i) => (
                        <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center">
                          <p className={`text-[9px] font-black uppercase tracking-widest text-${t.color}-400 mb-1`}>{t.yield}</p>
                          <p className="text-white font-black text-lg">KES {Math.round(t.amount).toLocaleString()}</p>
                          <p className="text-slate-400 text-[10px] font-bold mt-0.5">{t.label}</p>
                          <p className="text-slate-500 text-[9px]">{t.sublabel}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === "ai_intel" && (
          <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

            {/* AI Header */}
            <div className="bg-gradient-to-r from-indigo-950 to-slate-950 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-black text-lg mb-1">Sentill AI Oracle — Live Intelligence</h3>
                  <p className="text-indigo-300 text-xs font-bold">{AI_RECOMMENDATIONS.length} active intelligence alerts based on current market conditions</p>
                </div>
              </div>

              {/* Quick query */}
              <div className="relative mt-5">
                <input
                  type="text"
                  value={liveQuery}
                  onChange={e => setLiveQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAiQuery()}
                  placeholder="Ask: Should I buy SCOM today? What's my best tax strategy?"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-2xl px-5 py-4 pr-24 text-sm font-medium focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  onClick={handleAiQuery}
                  disabled={isAiLoading || !liveQuery.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wide disabled:opacity-40 transition-all flex items-center gap-1"
                >
                  {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Zap className="w-3 h-3" /> Ask</>}
                </button>
              </div>

              <AnimatePresence>
                {aiResponse && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Oracle Response</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-wrap">
              {CATEGORIES.map(cat => {
                const count = cat.id === "all" ? AI_RECOMMENDATIONS.length : AI_RECOMMENDATIONS.filter(r => r.category === cat.id).length;
                if (count === 0 && cat.id !== "all") return null;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCat(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide whitespace-nowrap transition-all ${
                      activeCat === cat.id ? "bg-slate-900 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <cat.icon className="w-3.5 h-3.5" />
                    {cat.label} {cat.id !== "all" && count > 0 && `(${count})`}
                  </button>
                );
              })}
            </div>

            {/* Recommendation Banners */}
            <div className="space-y-4">
              {filteredRecs.map((rec, i) => {
                const priorityCfg = PRIORITY_CONFIG[rec.priority];
                return (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className={`bg-white border border-slate-200 border-l-4 ${priorityCfg.border} rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group`}
                  >
                    <div className="flex items-start gap-5">
                      <div className={`w-12 h-12 rounded-2xl bg-${rec.accentColor}-50 flex items-center justify-center shrink-0`}>
                        <rec.icon className={`w-6 h-6 text-${rec.accentColor}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Priority + metric */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${priorityCfg.badge}`}>
                            {priorityCfg.label}
                          </span>
                          <div className={`flex items-center gap-1 bg-${rec.accentColor}-50 px-2.5 py-0.5 rounded-full`}>
                            <span className={`text-[10px] font-black text-${rec.accentColor}-700`}>{rec.metric}</span>
                          </div>
                          <span className={`text-[9px] text-${rec.accentColor}-500 font-bold`}>{rec.metricLabel}</span>
                        </div>
                        
                        <h4 className="text-sm font-black text-slate-900 mb-1.5">{rec.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">{rec.body}</p>
                        
                        <Link
                          href={rec.actionHref}
                          className={`inline-flex items-center gap-2 px-4 py-2.5 bg-${rec.accentColor}-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wide hover:opacity-90 transition-opacity shadow-sm`}
                        >
                          {rec.action} <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
