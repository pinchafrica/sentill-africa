"use client";

import Link from "next/link";
import { Search, ShieldCheck, TrendingUp, Filter, Activity, Landmark, ChevronDown, ChevronUp, Star, Zap } from "lucide-react";
import ProviderCard from "@/components/ProviderCard";
import { useState, useMemo } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  All: { label: "All", color: "text-slate-700", bg: "bg-slate-900 text-white" },
  MMF: { label: "Money Market", color: "text-emerald-700", bg: "bg-emerald-600 text-white" },
  Bond: { label: "Bonds", color: "text-amber-700", bg: "bg-amber-500 text-black" },
  "T-Bill": { label: "T-Bills", color: "text-indigo-700", bg: "bg-indigo-600 text-white" },
  SACCO: { label: "SACCOs", color: "text-violet-700", bg: "bg-violet-600 text-white" },
  Pension: { label: "Pensions", color: "text-rose-700", bg: "bg-rose-600 text-white" },
};

const SORT_OPTIONS = [
  { value: "yield_desc", label: "Highest Yield" },
  { value: "yield_asc", label: "Lowest Yield" },
  { value: "name_asc", label: "Name A–Z" },
  { value: "risk_asc", label: "Lowest Risk" },
];

export default function ProvidersPageClient({ providers }: { providers: any[] }) {
  const { data: yieldsData } = useSWR("/api/market/yields", fetcher, {
    refreshInterval: 300_000,
    revalidateOnFocus: false,
  });

  // Overlay live yields from scraper onto Prisma providers
  const liveProviders = useMemo(() => {
    if (!yieldsData) return providers;
    const liveMap: Record<string, number> = {};
    [...(yieldsData.mmfs ?? []), ...(yieldsData.tbills ?? []), ...(yieldsData.bonds ?? [])].forEach((item: any) => {
      const key = (item.name ?? item.code ?? "").toLowerCase();
      if (key && item.yield != null) liveMap[key] = item.yield;
      if (item.tenor) liveMap[item.tenor.toLowerCase()] = item.rate;
    });
    return providers.map((p) => {
      const key = p.name.toLowerCase();
      const live = Object.entries(liveMap).find(([k]) => key.includes(k.split(" ")[0]));
      if (live && Math.abs(live[1] - p.currentYield) < 5) {
        return { ...p, currentYield: live[1] };
      }
      return p;
    });
  }, [providers, yieldsData]);

  const [search, setSearch] = useState("");
  const [shariahOnly, setShariahOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("yield_desc");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const RISK_ORDER: Record<string, number> = { "Zero Risk": 0, "Very Low": 1, "Low": 2, "Moderate": 3, "High": 4 };

  const filteredProviders = useMemo(() => {
    let list = liveProviders.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchesShariah = shariahOnly ? p.isHalal : true;
      const matchesType = typeFilter === "All" ? true : p.type === typeFilter;
      return matchesSearch && matchesShariah && matchesType;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === "yield_desc") return b.currentYield - a.currentYield;
      if (sortBy === "yield_asc") return a.currentYield - b.currentYield;
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "risk_asc") return (RISK_ORDER[a.riskLevel] ?? 5) - (RISK_ORDER[b.riskLevel] ?? 5);
      return 0;
    });
    return list;
  }, [liveProviders, search, shariahOnly, typeFilter, sortBy]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { All: liveProviders.length };
    liveProviders.forEach((p) => {
      counts[p.type] = (counts[p.type] || 0) + 1;
    });
    return counts;
  }, [liveProviders]);

  const avgYield = filteredProviders.length
    ? (filteredProviders.reduce((a, p) => a + p.currentYield, 0) / filteredProviders.length).toFixed(2)
    : "—";

  const topYield = filteredProviders.length
    ? Math.max(...filteredProviders.map((p) => p.currentYield)).toFixed(2)
    : "—";

  const currentSortLabel = SORT_OPTIONS.find((s) => s.value === sortBy)?.label || "Sort";

  return (
    <div className="min-h-screen py-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Institutional Registry</div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9] font-heading">
              Market <br /> <span className="text-slate-200">Intelligence.</span>
            </h1>
            <p className="text-sm text-slate-500 max-w-lg">
              Kenya's most comprehensive database of CMA-regulated investment providers.
              Compare MMFs, bonds, T-bills, SACCOs and pension funds in one place.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search providers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-xs font-black uppercase tracking-widest text-slate-900 outline-none focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
              />
            </div>
            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:border-slate-400 transition-all shadow-sm"
              >
                <Filter className="w-4 h-4" /> {currentSortLabel}
                {showSortMenu ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showSortMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                      className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                        sortBy === opt.value ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      {opt.value === sortBy && <span className="mr-1">✓</span>}{opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Showing Providers", value: filteredProviders.length.toString(), icon: Activity, color: "text-emerald-600" },
            { label: "Avg Yield", value: `${avgYield}%`, icon: TrendingUp, color: "text-amber-600" },
            { label: "Top Yield", value: `${topYield}%`, icon: Star, color: "text-emerald-600" },
            { label: "CMA Verified", value: "100%", icon: ShieldCheck, color: "text-blue-600" },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-slate-100 shadow-sm p-5 rounded-3xl flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{stat.label}</span>
                <span className="text-xl font-black text-slate-900 tracking-tighter">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Type Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(TYPE_LABELS).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                typeFilter === key ? meta.bg : "bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100"
              }`}
            >
              {meta.label}
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                typeFilter === key ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {typeCounts[key] || 0}
              </span>
            </button>
          ))}

          {/* Shariah toggle */}
          <button
            onClick={() => setShariahOnly(!shariahOnly)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ml-auto ${
              shariahOnly ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100"
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Shariah Only
          </button>
        </div>

        {/* Quick links to market pages */}
        <div className="flex flex-wrap gap-3 pb-2 border-b border-slate-100">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest self-center">Quick Nav:</span>
          {[
            { label: "NSE Stocks", href: "/markets/nse", color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
            { label: "MMFs", href: "/markets/mmfs", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
            { label: "Bonds & IFBs", href: "/markets/bonds", color: "text-amber-600 bg-amber-50 border-amber-100" },
            { label: "Compare", href: "/tools/compare", color: "text-slate-600 bg-slate-50 border-slate-100" },
            { label: "Matrix", href: "/tools/matrix", color: "text-violet-600 bg-violet-50 border-violet-100" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all hover:shadow-sm ${link.color}`}
            >
              {link.label} →
            </Link>
          ))}
        </div>

        {/* Provider Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProviders.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>

        {filteredProviders.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No providers match your filters.</p>
            <button
              onClick={() => { setSearch(""); setTypeFilter("All"); setShariahOnly(false); }}
              className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* CTA Footer */}
        <div className="bg-slate-950 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-6 mt-8">
          <div className="space-y-2">
            <div className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Get Started Today</div>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
              Track all your investments in one place
            </h3>
            <p className="text-slate-400 text-sm">Log assets, compare yields, and model your wealth growth.</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link
              href="/auth/register"
              className="px-7 py-4 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-400 transition-colors"
            >
              Open Account
            </Link>
            <Link
              href="/tools/compare"
              className="px-7 py-4 bg-white/10 text-white border border-white/20 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/20 transition-colors"
            >
              Compare Tools
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
