"use client";

import { useState, useMemo } from "react";
import { Search, Filter, ShieldCheck, ArrowRight, BrainCircuit, Activity, PieChart, Landmark, MapIcon, ChevronRight } from "lucide-react";
import Link from "next/link";
import { PORTFOLIOS } from "@/lib/portfolios";
import AnalysisDrawer from "@/components/AnalysisDrawer";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const CATEGORIES = [
  { id: "all", label: "All Portfolios" },
  { id: "mmf", label: "Money Market Funds" },
  { id: "stocks", label: "NSE Stocks" },
  { id: "bonds", label: "Fixed Income" },
  { id: "saccos", label: "SACCOs" },
  { id: "land", label: "Real Estate" },
];

export default function DashboardExplorePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleAnalyse = (asset: any) => {
    setSelectedAsset(asset);
    setIsDrawerOpen(true);
  };

  const { data: nseData } = useSWR("/api/market/nse", fetcher);
  const { data: yieldsData } = useSWR("/api/market/yields", fetcher);

  const mergedPortfolios = useMemo(() => {
    return PORTFOLIOS.map(p => {
      if (p.category === "stocks") {
        const liveStock = nseData?.stocks?.find((s: any) => s.symbol === p.id || s.ticker === p.id + ".NR");
        if (liveStock) {
          return { ...p, price: `KES ${liveStock.price.toFixed(2)}`, yield: `${liveStock.divYield}%`, isLive: liveStock.source === 'gemini-forced' };
        }
      }
      if (p.category === "mmf") {
        const liveMmf = yieldsData?.mmfs?.find((m: any) => m.code === p.id);
        if (liveMmf) {
          return { ...p, yield: `${liveMmf.yield}%`, isLive: liveMmf.source === 'gemini-forced' };
        }
      }
      if (p.category === "bonds") {
        const liveBond = yieldsData?.bonds?.find((b: any) => b.name.toUpperCase().replace("/", "-") === p.id.toUpperCase());
        if (liveBond) {
          return { ...p, yield: `${liveBond.yield}%`, isLive: liveBond.source === 'gemini-forced' };
        }
      }
      return p;
    });
  }, [nseData, yieldsData]);

  const filteredPortfolios = useMemo(() => {
    return mergedPortfolios.filter(p => {
      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.manager.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, mergedPortfolios]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* ─── HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence Hub</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Global Market Registry <span className="text-emerald-500 ml-2">• 45+ Verified Assets</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button className="px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
             <Filter className="w-4 h-4" /> Advanced Filters
           </button>
        </div>
      </div>

      {/* ─── SEARCH & CATEGORIES ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by asset name or manager..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
          />
        </div>
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 md:pb-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeCategory === cat.id 
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" 
                  : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── GRID ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPortfolios.map((portfolio) => (
          <div key={portfolio.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-2xl ${portfolio.bg} ${portfolio.color} flex items-center justify-center border border-current/10`}>
                <portfolio.icon className="w-6 h-6" />
              </div>
              {portfolio.trending && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                  <Activity className="w-3 h-3" /> Trending
                </span>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-black text-slate-900 mb-1">{portfolio.name}</h3>
              <p className="text-xs font-bold text-slate-500 mb-4">{portfolio.manager}</p>
              <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-[90%]">
                {portfolio.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 my-6 py-6 border-y border-slate-100">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  {portfolio.category === 'stocks' ? 'Price' : portfolio.category === 'mmf' ? 'Rate Current' : 'Yield'}
                </p>
                <p className={`text-lg font-black ${portfolio.color}`}>
                  {portfolio.price || portfolio.yield}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Min. Entry</p>
                <p className="text-lg font-black text-slate-900">{portfolio.minInvest}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleAnalyse(portfolio)}
                className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <BrainCircuit className="w-3.5 h-3.5" /> Analyse
              </button>
              <button className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">
                Compare
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPortfolios.length === 0 && (
        <div className="text-center py-20">
          <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-900">No Asset Found</h3>
          <p className="text-sm text-slate-500 mt-2">Adjust your filters or try a different search term.</p>
        </div>
      )}
      
      <AnalysisDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        asset={selectedAsset} 
      />
    </div>
  );
}
