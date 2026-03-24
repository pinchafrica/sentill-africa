"use client";

import { useState, useMemo } from "react";
import { 
  Search, Filter, Activity, PieChart, ShieldCheck, Landmark, 
  Zap, Info, TrendingUp, BarChart2, ArrowRight, Star, 
  ChevronDown, LayoutGrid, List, SlidersHorizontal, Plus, Map as MapIcon, FolderPlus
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import QuickLogAsset from "@/components/QuickLogAsset";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// --- DATA STRUCTURES ---

const CATEGORIES = [
  { id: "all", label: "All Portfolios" },
  { id: "mmf", label: "Money Market Funds" },
  { id: "stocks", label: "NSE Stocks" },
  { id: "bonds", label: "Fixed Income" },
  { id: "saccos", label: "SACCOs" },
  { id: "land", label: "Real Estate" },
  { id: "global", label: "Global Markets" },
  { id: "agri", label: "Agri" },
  { id: "commodities", label: "Commodities" },
  { id: "special", label: "Special Funds" },
];
import { PORTFOLIOS } from "@/lib/portfolios";

export default function ExploreMarketsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const router = useRouter();
  const [quickLogAssetId, setQuickLogAssetId] = useState<string | null>(null);

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
        const liveBond = yieldsData?.bonds?.find((b: any) => p.name.includes(b.name));
        if (liveBond) {
          return { ...p, yield: `${liveBond.yield}%`, isLive: liveBond.source === 'gemini-forced' };
        }
      }
      if (p.category === "saccos") {
        const liveSacco = yieldsData?.saccos?.find((s: any) => p.name.includes(s.name) || s.name.includes(p.name));
        if (liveSacco) {
          return { ...p, yield: `${liveSacco.yield}%`, isLive: liveSacco.source === 'gemini-forced' };
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

  const handleAnalyse = (e: React.MouseEvent, link: string) => {
    e.stopPropagation();
    toast.info("Sentill Oracle is analyzing this portfolio...");
    router.push(link + "?analyse=true");
  };

  const handleCompare = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    router.push('/tools/compare?asset=' + id);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-24">
      {/* --- HERO SECTION --- */}
      <section className="px-6 md:px-10 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4">
                <Zap className="w-3 h-3" /> Institutional Intelligence
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-4">
                Explore<br />Markets
              </h1>
              <p className="text-slate-500 text-sm font-medium max-w-xl mb-6">
                The ultimate institutional browser for Kenya's investment landscape. 
                Filter through MMFs, Stocks, Bonds, and SACCOs with real-time yield intelligence.
              </p>
              
              <Link href="/markets/nse" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                <BarChart2 className="w-4 h-4" /> NSE Stock Market (By Industry)
              </Link>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                <div className={`p-3 rounded-xl cursor-pointer transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`} onClick={() => setViewMode('grid')}>
                    <LayoutGrid className="w-5 h-5" />
                </div>
                <div className={`p-3 rounded-xl cursor-pointer transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`} onClick={() => setViewMode('list')}>
                    <List className="w-5 h-5" />
                </div>
            </div>
          </div>

          {/* --- SEARCH & FILTERS --- */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search portfolios, managers, or ticker symbols..." 
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600/20 text-slate-900 font-bold placeholder:text-slate-400 transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="px-6 py-4 bg-white rounded-2xl border border-slate-200 flex items-center gap-3 text-slate-700 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                    activeCategory === cat.id 
                      ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10" 
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- NSE STOCKS BY INDUSTRY --- */}
      {activeCategory === "all" || activeCategory === "stocks" ? (
        <section className="px-6 md:px-10 mb-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-500" /> NSE Stock Market (By Industry)
            </h2>
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-none">
              {[
                { name: "Banking", stocks: ["EQTY", "KCB", "COOP", "ABSA", "SCBK", "IMH", "DTK"] },
                { name: "Telecommunications", stocks: ["SCOM"] },
                { name: "Manufacturing", stocks: ["EABL", "BAT"] },
                { name: "Energy & Construction", stocks: ["KPLC", "KEGN", "BAMB"] },
                { name: "Investment & Insurance", stocks: ["CTUM", "JUB"] },
              ].map(industry => (
                <div key={industry.name} className="min-w-[280px] bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex-shrink-0">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-50">{industry.name}</h3>
                  <div className="space-y-3">
                    {industry.stocks.map(sym => {
                      const stockInfo = mergedPortfolios.find(p => p.id === sym);
                      if (!stockInfo) return null;
                      return (
                        <div key={sym} onClick={() => router.push(stockInfo.link)} className="flex items-center justify-between cursor-pointer group hover:bg-slate-50 p-2 -mx-2 rounded-xl transition-all">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black text-white ${stockInfo.bg.replace('bg-', 'bg-').replace('50', '500').replace('100', '600')}`}>
                              {sym.slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest group-hover:text-blue-600 transition-colors">{sym}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase">{stockInfo.yield} Yield</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-slate-900 block">{'price' in stockInfo ? stockInfo.price : "KES --"}</span>
                            {(stockInfo as any).isLive && <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Live</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* --- PORTFOLIO LISTING --- */}
      <section className="px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            <AnimatePresence mode="popLayout">
              {filteredPortfolios.map((portfolio, idx) => (
                <motion.div
                  key={portfolio.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => router.push(portfolio.link)}
                  className={`${viewMode === 'grid' ? 'bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col' : 'bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between gap-6'} group hover:border-blue-200 cursor-pointer transition-all relative overflow-hidden`}
                >
                  {(portfolio as any).isLive ? (
                    <div className="absolute top-4 right-4 animate-pulse z-10">
                        <div className="px-2 py-1 bg-blue-100 border border-blue-200 rounded-lg text-[8px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-1 shadow-sm shadow-blue-500/20">
                            <Zap className="w-2.5 h-2.5" /> AI Synced
                        </div>
                    </div>
                  ) : portfolio.trending ? (
                    <div className="absolute top-4 right-4 animate-pulse z-10">
                        <div className="px-2 py-1 bg-amber-100 border border-amber-200 rounded-lg text-[8px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-1">
                            <TrendingUp className="w-2.5 h-2.5" /> Hot Signal
                        </div>
                    </div>
                  ) : null}

                  <div className={viewMode === 'list' ? "flex items-center gap-6 flex-1" : ""}>
                    <div className={`w-12 h-12 rounded-2xl ${portfolio.bg} flex items-center justify-center mb-6`}>
                        <portfolio.icon className={`w-6 h-6 ${portfolio.color}`} />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase group-hover:text-blue-700 transition-colors">{portfolio.name}</h3>
                            <div className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-widest">
                                {portfolio.category}
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{portfolio.manager}</p>
                        
                        {(viewMode === 'grid') && (
                            <p className="text-sm text-slate-500 font-medium mb-8 line-clamp-2">
                                {portfolio.description}
                            </p>
                        )}
                    </div>
                  </div>

                  <div className={viewMode === 'grid' ? "grid grid-cols-3 gap-4 mb-8 pt-8 border-t border-slate-50" : "flex items-center gap-8 px-6 border-l border-slate-100"}>
                    <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                          {portfolio.category === 'mmf' ? 'Rate Current' : portfolio.category === 'stocks' ? 'Price' : 'Yield'}
                        </span>
                        <span className="text-xl font-black text-slate-900">
                          {portfolio.category === 'stocks' && 'price' in portfolio ? portfolio.price : portfolio.yield}
                        </span>
                    </div>
                    <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Risk</span>
                        <span className={`text-[11px] font-black uppercase ${portfolio.risk === 'Low' ? 'text-emerald-600' : portfolio.risk === 'Sovereign' ? 'text-amber-600' : 'text-indigo-600'}`}>{portfolio.risk}</span>
                    </div>
                    <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Min Invest</span>
                        <span className="text-[11px] font-black text-slate-900 tracking-wider whitespace-nowrap">{portfolio.minInvest}</span>
                    </div>
                  </div>

                  <div className={viewMode === 'grid' ? "grid grid-cols-3 gap-2 mt-auto" : "flex items-center gap-2 min-w-[240px]"}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickLogAssetId(quickLogAssetId === portfolio.id ? null : portfolio.id);
                      }}
                      className={viewMode === 'grid' 
                        ? "py-3 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black rounded-xl uppercase tracking-widest transition-all shadow-md shadow-blue-600/20 flex flex-col items-center justify-center gap-1"
                        : "flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black rounded-xl uppercase tracking-widest transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"}
                    >
                        <FolderPlus className={viewMode === 'grid' ? "w-4 h-4" : "w-3.5 h-3.5"} /> 
                        <span>{quickLogAssetId === portfolio.id ? 'Cancel' : 'Add'}</span>
                    </button>
                    <button 
                      onClick={(e) => handleAnalyse(e, portfolio.link)}
                      className={viewMode === 'grid'
                        ? "py-3 bg-slate-50 hover:bg-slate-100 text-slate-900 text-[9px] font-black rounded-xl uppercase tracking-widest transition-all border border-slate-100 flex flex-col items-center justify-center gap-1"
                        : "flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-900 text-[9px] font-black rounded-xl uppercase tracking-widest transition-all border border-slate-100 flex items-center justify-center gap-2"}
                    >
                        <Activity className={viewMode === 'grid' ? "w-4 h-4" : "w-3.5 h-3.5"} /> 
                        <span>Analyse</span>
                    </button>
                    <button 
                      onClick={(e) => handleCompare(e, portfolio.id)}
                      className={viewMode === 'grid'
                        ? "py-3 bg-slate-950 hover:bg-slate-800 text-white text-[9px] font-black rounded-xl uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1 shadow-lg shadow-slate-900/10"
                        : "flex-1 py-3 bg-slate-950 hover:bg-slate-800 text-white text-[9px] font-black rounded-xl uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"}
                    >
                        <BarChart2 className={viewMode === 'grid' ? "w-4 h-4" : "w-3.5 h-3.5"} /> 
                        <span>Compare</span>
                    </button>
                  </div>

                  <AnimatePresence>
                    {quickLogAssetId === portfolio.id && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <QuickLogAsset 
                          assetId={portfolio.id} 
                          assetName={portfolio.name}
                          onClose={() => setQuickLogAssetId(null)}
                          onSuccess={() => {
                            // Optionally refresh or redirect
                          }}
                        />
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredPortfolios.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Info className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">No Portfolios Found</h3>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Try adjusting your search or category filters</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
