"use client";

import { useState } from "react";
import { 
  TrendingUp, TrendingDown, Activity, Globe, Zap, Search, 
  LineChart as LineChartIcon, Star, ChevronUp, ChevronDown, 
  ArrowRight, Shield, Award, Briefcase, Plus
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend
} from "recharts";
import AssetModal from "@/components/AssetModal";
import Link from "next/link";

const US_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc.", price: 182.52, change: 1.45, percent: 0.80, cap: "2.8T", sector: "Technology", pe: 28.4, yield: 0.52 },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 415.50, change: -2.30, percent: -0.55, cap: "3.1T", sector: "Technology", pe: 36.2, yield: 0.72 },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 875.30, change: 15.40, percent: 1.79, cap: "2.2T", sector: "Semiconductors", pe: 72.1, yield: 0.02 },
  { symbol: "TSLA", name: "Tesla, Inc.", price: 175.05, change: -4.20, percent: -2.34, cap: "560B", sector: "Automotive", pe: 42.5, yield: 0.00 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 178.15, change: 0.85, percent: 0.48, cap: "1.8T", sector: "Consumer retail", pe: 58.9, yield: 0.00 },
  { symbol: "META", name: "Meta Platforms", price: 495.20, change: 3.10, percent: 0.63, cap: "1.2T", sector: "Technology", pe: 24.8, yield: 0.40 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 152.05, change: 1.25, percent: 0.83, cap: "1.9T", sector: "Technology", pe: 22.5, yield: 0.00 },
];

const MARKET_STATS = [
  { label: "S&P 500", value: "5,123", change: "+0.45%" },
  { label: "NASDAQ", value: "16,274", change: "+0.82%" },
  { label: "DOW 30", value: "38,904", change: "-0.12%" },
  { label: "US 10Y Yield", value: "4.21%", change: "+0.02" },
];

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-black text-indigo-400">{p.value}</p>
      ))}
    </div>
  );
};

export default function USStocksPage() {
  const [selectedStock, setSelectedStock] = useState(US_STOCKS[0]);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [prefilledAsset, setPrefilledAsset] = useState<string | undefined>(undefined);

  const handleOpenAssetModal = (assetId?: string) => {
    setPrefilledAsset(assetId);
    setIsAssetModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
              <Globe className="w-3 h-3" /> Global Markets · Institutional
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">US <span className="text-indigo-600">Equities.</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NYSE & NASDAQ · Tier 1 Assets · Real-time Analysis</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {MARKET_STATS.map((s, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm min-w-[140px]">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{s.label}</p>
                <p className="text-sm font-black text-slate-900">{s.value}</p>
                <p className={`text-[10px] font-bold ${s.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{s.change}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Highlight Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black">{selectedStock.symbol.slice(0,1)}</div>
                   <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{selectedStock.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedStock.symbol} · {selectedStock.sector}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-black text-slate-900 tracking-tighter">${selectedStock.price.toFixed(2)}</p>
                   <p className={`text-[10px] font-black ${selectedStock.percent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {selectedStock.percent >= 0 ? '+' : ''}{selectedStock.percent}%
                   </p>
                </div>
             </div>
             
             <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={[
                      { day: 'Mon', price: selectedStock.price * 0.98 },
                      { day: 'Tue', price: selectedStock.price * 0.99 },
                      { day: 'Wed', price: selectedStock.price * 1.01 },
                      { day: 'Thu', price: selectedStock.price * 1.02 },
                      { day: 'Fri', price: selectedStock.price },
                   ]}>
                      <defs>
                         <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                      <YAxis hide />
                      <Tooltip content={<DarkTooltip />} />
                      <Area type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#chartGrad)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>

             <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-50 text-center">
                {[{ l: "Mkt Cap", v: selectedStock.cap }, { l: "P/E", v: selectedStock.pe }, { l: "Yield", v: selectedStock.yield + "%" }, { l: "Change", v: selectedStock.change }].map(m => (
                   <div key={m.l}>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.l}</p>
                      <p className="text-xs font-black text-slate-900 mt-1">{m.v}</p>
                   </div>
                ))}
             </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
             <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full mb-6">
                   <Zap className="w-3 h-3 text-amber-400" />
                   <span className="text-[8px] font-black uppercase tracking-widest">Sentill Pro Brokerage</span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4 leading-tight">Trade Global Stocks Directly</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-8">
                   Invest in top US tech and blue chips with zero commissions for Pro users. Real-time execution via our Tier-1 liquidity partners.
                </p>
                
                <div className="space-y-4 mb-8">
                   {[
                      { icon: Shield, label: "SEC Registered", val: "Yes" },
                      { icon: Award, label: "Execution Speed", val: "< 50ms" },
                      { icon: Briefcase, label: "Liquidity", val: "Institutional" },
                   ].map(feat => (
                      <div key={feat.label} className="flex items-center justify-between border-b border-white/5 pb-3">
                         <div className="flex items-center gap-2">
                            <feat.icon className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{feat.label}</span>
                         </div>
                         <span className="text-[10px] font-black">{feat.val}</span>
                      </div>
                   ))}
                </div>

                <a href="https://www.interactivebrokers.com" target="_blank" rel="noreferrer" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
                   Open Global Account <ArrowRight className="w-4 h-4" />
                </a>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32" />
          </div>
        </div>

        {/* Stocks Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                 <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight text-white md:text-slate-900">Market Registry</h2>
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">S&P 500 & NASDAQ Selects</p>
              </div>
              <div className="relative">
                 <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input placeholder="Search ticker..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold focus:ring-1 focus:ring-indigo-500 outline-none w-48" />
              </div>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="pl-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Ticker</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-white md:text-slate-400">Price</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Change</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Mkt Cap</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">P/E</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right pr-8">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {US_STOCKS.map((s, i) => (
                       <tr key={i} className="hover:bg-slate-50/50 transition-all cursor-pointer group" onClick={() => setSelectedStock(s)}>
                          <td className="pl-8 py-5">
                             <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[9px] font-black text-indigo-600 uppercase">{s.symbol.slice(0,2)}</span>
                                <div>
                                   <p className="text-[11px] font-black text-slate-900 uppercase">{s.symbol}</p>
                                   <p className="text-[8px] font-bold text-slate-400 uppercase">{s.name}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-4 py-5">
                             <span className="text-sm font-black text-slate-900">${s.price.toFixed(2)}</span>
                          </td>
                          <td className="px-4 py-5">
                             <span className={`text-[10px] font-black ${s.percent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {s.percent >= 0 ? '+' : ''}{s.percent}%
                             </span>
                          </td>
                          <td className="px-4 py-5 hidden md:table-cell">
                             <span className="text-[10px] font-black text-slate-500 uppercase">{s.cap}</span>
                          </td>
                          <td className="px-4 py-5 hidden lg:table-cell">
                             <span className="text-[10px] font-black text-slate-500 uppercase">{s.pe}x</span>
                          </td>
                          <td className="px-4 py-5 text-right pr-8">
                             <button onClick={(e) => { e.stopPropagation(); handleOpenAssetModal(s.symbol); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-lg ml-auto hover:bg-slate-800 transition-all shadow-md">
                                Log Asset
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
      <AssetModal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} prefilledAsset={prefilledAsset} />
    </div>
  );
}
