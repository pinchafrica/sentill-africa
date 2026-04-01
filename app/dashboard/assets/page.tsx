"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ShieldCheck, Plus, Clock, Percent, AlertCircle, PieChart, TrendingUp,
  DollarSign, DownloadCloud, Activity, Sparkles, Landmark, ChevronRight, Zap,
  ArrowUpRight, Brain, Star, Filter, SortAsc, BarChart3, RefreshCw,
  Layers, Trash2, Eye, CheckCircle
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Asset {
  id: string;
  principal: number;
  projectedYield: number;
  loggedAt: string;
  provider: {
    id: string;
    name: string;
    type: string;
    slug: string;
    currentYield: number;
    taxCategory: string;
    riskLevel: string;
  };
}

interface AIRecommendation {
  id: string;
  category: "tax" | "yield" | "risk" | "diversification";
  title: string;
  body: string;
  action: string;
  actionHref: string;
  priority: "high" | "medium" | "low";
  savings?: number;
}

// ─── AI Recommendations Generator ─────────────────────────────────────────────
function generateRecommendations(assets: Asset[]): AIRecommendation[] {
  const recs: AIRecommendation[] = [];
  const total = assets.reduce((s, a) => s + a.principal, 0);
  const taxable = assets.filter(a => a.provider.taxCategory !== "WHT_0").reduce((s, a) => s + a.principal, 0);
  const taxFree = assets.filter(a => a.provider.taxCategory === "WHT_0").reduce((s, a) => s + a.principal, 0);
  const avgYield = total > 0 ? assets.reduce((s, a) => s + (a.principal * a.provider.currentYield / 100), 0) / total * 100 : 0;

  if (assets.length === 0) {
    recs.push({
      id: "start",
      category: "yield",
      title: "Start With a High-Alpha Foundation",
      body: "The Etica Wealth MMF at 17.55% p.a. is the perfect first step for most Kenyan investors — liquid, regulated, and CMA-approved.",
      action: "Log Your First Asset",
      actionHref: "?logAsset=etica",
      priority: "high"
    });
    recs.push({
      id: "ifb",
      category: "tax",
      title: "IFBs: 100% Tax-Free Returns",
      body: "Infrastructure Bonds (IFBs) offer up to 18.46% p.a. completely tax-free. Unlike MMFs subject to 15% WHT, every shilling goes to you.",
      action: "Explore IFBs",
      actionHref: "?logAsset=ifb1_2024",
      priority: "high",
      savings: 0
    });
    return recs;
  }

  // Tax optimization
  if (taxable > 50000 && taxFree / (total || 1) < 0.4) {
    const whtLoss = taxable * 0.16 * 0.15; // est 16% avg yield, 15% WHT
    recs.push({
      id: "tax-shift",
      category: "tax",
      title: `Save KES ${Math.floor(whtLoss).toLocaleString()} in Annual WHT`,
      body: `KES ${taxable.toLocaleString()} of your portfolio is subject to 15% Withholding Tax. Shifting at least 40% to Infrastructure Bonds eliminates this tax drag.`,
      action: "Optimize Tax Now",
      actionHref: "?logAsset=ifb1_2024",
      priority: "high",
      savings: whtLoss
    });
  }

  // Yield upgrade
  if (avgYield < 16) {
    recs.push({
      id: "yield-up",
      category: "yield",
      title: "Your Average Yield Can Be Improved",
      body: `Your current blended yield is ${avgYield.toFixed(1)}%. Moving to higher-yielding instruments like Etica MMF (17.55%) or IFBs (18.46%) could significantly increase returns.`,
      action: "Find Higher Yields",
      actionHref: "/dashboard/yields",
      priority: "medium"
    });
  }

  // Diversification
  const types = [...new Set(assets.map(a => a.provider.type))];
  if (types.length < 3) {
    recs.push({
      id: "diversify",
      category: "diversification",
      title: "Diversify Beyond " + (types[0] || "Single Asset"),
      body: "Kenyan wealth builders with 3+ asset classes have 23% lower portfolio risk. Consider adding bonds, equities, or SACCO deposits to complement your current holdings.",
      action: "Explore All Classes",
      actionHref: "/dashboard/explore",
      priority: "medium"
    });
  }

  // Risk flag
  const highRisk = assets.filter(a => a.provider.riskLevel === "High");
  if (highRisk.length > 0 && highRisk.reduce((s, a) => s + a.principal, 0) / total > 0.5) {
    recs.push({
      id: "risk",
      category: "risk",
      title: "High-Risk Concentration Alert",
      body: "Over 50% of your portfolio is in high-risk assets. Consider balancing with government bonds or top-tier MMFs to protect your capital.",
      action: "View Risk Analysis",
      actionHref: "/dashboard/risk",
      priority: "high"
    });
  }

  return recs;
}

// ─── Category color util ────────────────────────────────────────────────────
const CAT_CONFIG = {
  tax: { color: "emerald", icon: ShieldCheck, label: "Tax Alpha" },
  yield: { color: "blue", icon: TrendingUp, label: "Yield Boost" },
  risk: { color: "rose", icon: AlertCircle, label: "Risk Alert" },
  diversification: { color: "violet", icon: Layers, label: "Diversify" }
} as const;

const PRIORITY_BADGE = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-slate-100 text-slate-600"
};

// ─── Main Component ────────────────────────────────────────────────────────────
function MyAssetsInner() {
  const searchParams = useSearchParams();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "instruments" | "ai">("overview");
  const [activeCat, setActiveCat] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"principal" | "yield" | "date">("principal");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAssets = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    try {
      const res = await fetch("/api/portfolio/assets", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch {
      toast.error("Failed to load assets");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    // If logAsset param, switch to instruments tab
    if (searchParams?.get("logAsset")) {
      setActiveTab("instruments");
    }
  }, [searchParams]);

  // ─── Computed stats ───────────────────────────────────────────────────────
  const totalPrincipal = useMemo(() => assets.reduce((s, a) => s + a.principal, 0), [assets]);
  const totalGrossYield = useMemo(() => assets.reduce((s, a) => s + (a.principal * a.provider.currentYield) / 100, 0), [assets]);
  const taxFreeAmount = useMemo(() => assets.filter(a => a.provider.taxCategory === "WHT_0").reduce((s, a) => s + a.principal, 0), [assets]);
  const taxEfficiencyScore = totalPrincipal > 0 ? Math.round((taxFreeAmount / totalPrincipal) * 100) : 0;
  const avgBlendedYield = totalPrincipal > 0 ? (totalGrossYield / totalPrincipal) * 100 : 0;

  const recommendations = useMemo(() => generateRecommendations(assets), [assets]);
  const highPriorityCount = recommendations.filter(r => r.priority === "high").length;

  // ─── Filtered & sorted assets ─────────────────────────────────────────────
  const assetTypes = useMemo(() => ["All", ...new Set(assets.map(a => a.provider.type))], [assets]);
  const filteredAssets = useMemo(() => {
    let list = activeCat === "All" ? assets : assets.filter(a => a.provider.type === activeCat);
    return [...list].sort((a, b) => {
      if (sortBy === "principal") return b.principal - a.principal;
      if (sortBy === "yield") return b.provider.currentYield - a.provider.currentYield;
      return new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime();
    });
  }, [assets, activeCat, sortBy]);

  const handleExportCSV = () => {
    if (assets.length === 0) { toast.error("No assets to export"); return; }
    const rows = [
      ["Instrument", "Type", "Principal (KES)", "Yield (%)", "WHT Status", "Logged At"],
      ...assets.map(a => [
        a.provider.name,
        a.provider.type,
        a.principal,
        a.provider.currentYield,
        a.provider.taxCategory === "WHT_0" ? "Tax-Free" : "Standard 15%",
        new Date(a.loggedAt).toLocaleDateString("en-KE")
      ])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sentill-portfolio.csv"; a.click();
    toast.success("Portfolio exported!");
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-24 bg-slate-100 rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="text-slate-900 space-y-6 animate-in fade-in duration-300">

      {/* ─── HEADER ROW ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">My Assets</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Sentill Intelligence Hub · {assets.length} active position{assets.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => fetchAssets(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-wide transition-colors shadow-sm">
            <DownloadCloud className="w-3.5 h-3.5" /> Export
          </button>
          <Link href="?logAsset=true" className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-black uppercase tracking-wide transition-colors shadow-lg shadow-blue-600/20">
            <Plus className="w-3.5 h-3.5" /> Log Asset
          </Link>
        </div>
      </div>

      {/* ─── TOP METRICS ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total AUM", value: `KES ${totalPrincipal.toLocaleString()}`, sub: "Verified", icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Annual Yield", value: `KES ${Math.floor(totalGrossYield).toLocaleString()}`, sub: "Pre-tax est.", icon: Percent, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Tax Alpha", value: `${taxEfficiencyScore}/100`, sub: taxEfficiencyScore < 50 ? "Sub-optimal" : "Optimized", icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Avg Yield", value: `${avgBlendedYield.toFixed(1)}%`, sub: "Blended rate", icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
              <div className={`w-7 h-7 ${m.bg} rounded-lg flex items-center justify-center`}>
                <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
              </div>
            </div>
            <div className={`text-xl font-black tracking-tighter ${m.color}`}>{m.value}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">{m.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ─── TABS ──────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
        {([
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "instruments", label: "Instruments", icon: Layers },
          { id: "ai", label: `Sentill Africa Oracle ${highPriorityCount > 0 ? `(${highPriorityCount})` : ""}`, icon: Brain },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.id === "ai" ? "AI" : tab.id === "overview" ? "Stats" : "Assets"}</span>
          </button>
        ))}
      </div>

      {/* ─── TAB CONTENT ───────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {assets.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* Portfolio Distribution */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Portfolio Breakdown</h3>
                  <div className="space-y-3">
                    {assets.map((asset, i) => {
                      const pct = totalPrincipal > 0 ? (asset.principal / totalPrincipal) * 100 : 0;
                      const isTaxFree = asset.provider.taxCategory === "WHT_0";
                      return (
                        <div key={asset.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">{asset.provider.name}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${isTaxFree ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                                {isTaxFree ? "WHT-Free" : "15% WHT"}
                              </span>
                              <span className="font-black text-slate-900">{pct.toFixed(1)}%</span>
                            </div>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 }}
                              className={`h-full rounded-full ${isTaxFree ? "bg-emerald-500" : "bg-blue-500"}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* WHT Efficiency Panel */}
                <div className={`p-6 rounded-3xl ${taxEfficiencyScore >= 50 ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck className={`w-5 h-5 ${taxEfficiencyScore >= 50 ? "text-emerald-600" : "text-amber-600"}`} />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Tax Efficiency Score</h3>
                    <span className={`ml-auto text-2xl font-black ${taxEfficiencyScore >= 50 ? "text-emerald-600" : "text-amber-600"}`}>{taxEfficiencyScore}/100</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {taxEfficiencyScore >= 60
                      ? `Excellent! KES ${taxFreeAmount.toLocaleString()} of your portfolio is WHT-exempt, saving you approximately KES ${Math.floor(taxFreeAmount * 0.16 * 0.15).toLocaleString()} annually.`
                      : `You're losing approximately KES ${Math.floor((totalPrincipal - taxFreeAmount) * 0.16 * 0.15).toLocaleString()} annually to WHT. Shift to IFBs to eliminate this.`}
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}

        {activeTab === "instruments" && (
          <motion.div
            key="instruments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex gap-1.5 flex-wrap">
                {assetTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setActiveCat(type)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-colors ${
                      activeCat === type
                        ? "bg-slate-900 text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="bg-white border border-slate-200 text-xs font-bold text-slate-700 px-3 py-1.5 rounded-lg focus:outline-none"
              >
                <option value="principal">Sort: Principal</option>
                <option value="yield">Sort: Yield</option>
                <option value="date">Sort: Date</option>
              </select>
            </div>

            {filteredAssets.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                {/* Mobile-first card layout */}
                <div className="divide-y divide-slate-100">
                  {filteredAssets.map((asset, i) => {
                    const isTaxFree = asset.provider.taxCategory === "WHT_0";
                    const annualYield = (asset.principal * asset.provider.currentYield) / 100;
                    const pct = totalPrincipal > 0 ? (asset.principal / totalPrincipal) * 100 : 0;
                    return (
                      <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="p-4 md:p-5 hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-black text-slate-900 text-sm">{asset.provider.name}</h3>
                              <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                {asset.provider.type}
                              </span>
                              {isTaxFree && (
                                <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">
                                  WHT-Free
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-2 flex-wrap">
                              <span className="text-lg font-black text-slate-900">KES {asset.principal.toLocaleString("en-KE")}</span>
                              <span className="text-emerald-600 font-bold text-xs">+{asset.provider.currentYield}% p.a.</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 font-bold uppercase">
                              <span>{pct.toFixed(1)}% of portfolio</span>
                              <span>·</span>
                              <span>KES {Math.floor(annualYield).toLocaleString()} / yr</span>
                              <span>·</span>
                              <span>{asset.loggedAt ? new Date(asset.loggedAt).toLocaleDateString("en-KE", { day: "numeric", month: "short" }) : "—"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Link
                              href={`/dashboard/explore?q=${asset.provider.slug}`}
                              className="w-8 h-8 bg-slate-50 hover:bg-slate-200 border border-slate-200 rounded-lg flex items-center justify-center transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600" />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "ai" && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* AI Header Banner */}
            <div className="bg-gradient-to-r from-slate-950 to-slate-800 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg">Sentill Sentill Africa Oracle</h3>
                  <p className="text-slate-400 text-xs font-bold tracking-wide">
                    {recommendations.length} personalized intelligence alerts · {highPriorityCount} high priority
                  </p>
                </div>
                <Link href="/dashboard/analyze" className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-black uppercase tracking-wide transition-colors">
                  Full AI Hub <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {Object.entries(CAT_CONFIG).map(([key, cfg]) => {
                const count = recommendations.filter(r => r.category === key).length;
                if (count === 0) return null;
                return (
                  <span key={key} className={`px-3 py-1.5 bg-${cfg.color}-50 text-${cfg.color}-700 border border-${cfg.color}-200 rounded-full text-[10px] font-black uppercase tracking-wide flex items-center gap-1.5`}>
                    <cfg.icon className="w-3 h-3" />
                    {cfg.label} ({count})
                  </span>
                );
              })}
            </div>

            {/* Recommendation Banners */}
            <div className="space-y-3">
              {recommendations.map((rec, i) => {
                const cfg = CAT_CONFIG[rec.category];
                return (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`bg-white border-l-4 ${
                      rec.priority === "high" ? "border-l-rose-500" :
                      rec.priority === "medium" ? "border-l-amber-500" : "border-l-slate-300"
                    } border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-${cfg.color}-50 flex items-center justify-center shrink-0 mt-0.5`}>
                        <cfg.icon className={`w-5 h-5 text-${cfg.color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${PRIORITY_BADGE[rec.priority]}`}>
                            {rec.priority} priority
                          </span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-${cfg.color}-50 text-${cfg.color}-700`}>
                            {cfg.label}
                          </span>
                          {rec.savings && rec.savings > 0 && (
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                              Save KES {Math.floor(rec.savings).toLocaleString()}/yr
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-slate-900 mb-1">{rec.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed mb-3">{rec.body}</p>
                        <Link
                          href={rec.actionHref}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 bg-${cfg.color}-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wide hover:opacity-90 transition-opacity`}
                        >
                          {rec.action} <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick AI Chat */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
              <Sparkles className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600 mb-3">Have a specific question about your portfolio?</p>
              <Link href="/dashboard/analyze" className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wide hover:bg-blue-600 transition-colors">
                <Brain className="w-3.5 h-3.5" /> Ask Sentill Africa Oracle
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white px-6 py-20 text-center group">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-sm mx-auto space-y-6">
          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-100 border border-blue-50 group-hover:scale-110 transition-transform duration-500 ring-4 ring-blue-50/50">
            <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Discovery Matrix Active</h3>
            <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-[0.2em] max-w-xs mx-auto">
              Log your first asset to activate AI portfolio intelligence and real-time optimization.
            </p>
          </div>
          <div className="grid gap-3 pt-4">
            <Link href="?logAsset=ifb1_2024" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all text-left group/item">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <Landmark className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">IFB1/2024/006</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Govt Infrastructure Bond</span>
                </div>
              </div>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">18.4% Tax-Free</span>
            </Link>
            <Link href="?logAsset=etica" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all text-left group/item">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Etica Wealth MMF</span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Liquid Money Market</span>
                </div>
              </div>
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">17.5% Annual</span>
            </Link>
          </div>
          <div className="pt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <Zap className="w-3 h-3 text-amber-500" /> Oracle Ready · Awaiting First Asset
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyAssetsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4 animate-pulse">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-3xl" />)}
      </div>
    }>
      <MyAssetsInner />
    </Suspense>
  );
}
