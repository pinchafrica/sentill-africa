"use client";

import { useState } from "react";
import { 
  Sprout, TrendingUp, Activity, Globe, Zap, ArrowRight, 
  Plus, Info, Award, ChevronRight, Search, Landmark
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend
} from "recharts";
import AssetModal from "@/components/AssetModal";

const AGRI_DATA = [
  { id: "TEA-KTDA", name: "Grade 1 Tea", origin: "Mombasa Auction", price: 3.45, unit: "kg", change: +0.12, percent: +3.6, trend: "Rising" },
  { id: "COF-AA", name: "Coffee Grade AA", origin: "Nairobi Exchange", price: 285.00, unit: "kg", change: -5.50, percent: -1.9, trend: "Stable" },
  { id: "MAZ-W", name: "White Maize", origin: "Local Markets", price: 3200.00, unit: "90kg Bag", change: +45.00, percent: +1.4, trend: "High Demand" },
  { id: "WHT-K", name: "Premium Wheat", origin: "Narok / Eldoret", price: 4100.00, unit: "90kg Bag", change: +10.00, percent: +0.2, trend: "Stable" },
];

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl text-white">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-black text-emerald-400">{p.value}</p>
      ))}
    </div>
  );
};

export default function AgriMarketPage() {
  const [selectedAsset, setSelectedAsset] = useState(AGRI_DATA[0]);
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
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
            <Sprout className="w-3 h-3" /> Real Asset Intelligence · Agri-Hub
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Agriculture <span className="text-indigo-600">Futures.</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Commodity Auctions · Farm-gate Benchmarks · Export Data</p>
        </div>

        {/* Highlight Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                      <Sprout className="w-6 h-6 text-emerald-600" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{selectedAsset.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedAsset.origin} · {selectedAsset.trend}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-black text-slate-900 tracking-tighter">KES {selectedAsset.price.toLocaleString()}</p>
                   <p className="text-[9px] text-slate-400 font-bold uppercase">per {selectedAsset.unit}</p>
                </div>
             </div>

             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={[
                      { t: 'Jan', p: selectedAsset.price * 0.9 },
                      { t: 'Feb', p: selectedAsset.price * 0.95 },
                      { t: 'Mar', p: selectedAsset.price * 1.05 },
                      { t: 'Apr', p: selectedAsset.price },
                   ]}>
                      <defs>
                         <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                      <YAxis hide />
                      <Tooltip content={<DarkTooltip />} />
                      <Area type="monotone" dataKey="p" stroke="#10b981" strokeWidth={3} fill="url(#chartGrad)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
             
             <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-50 text-center">
                {[{ l: "Auction Vol", v: "42.8k Tons" }, { l: "Export Rank", v: "#1" }, { l: "YTD Change", v: "+12.4%" }, { l: "Outlook", v: "Bullish" }].map(m => (
                   <div key={m.l}>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.l}</p>
                      <p className="text-xs font-black text-slate-900 mt-1">{m.v}</p>
                   </div>
                ))}
             </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col justify-between">
             <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full mb-6 border border-emerald-500/20">
                   <Landmark className="w-3 h-3 text-emerald-400" />
                   <span className="text-[8px] font-black uppercase tracking-widest">Trade Finance Enabled</span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4 leading-tight">Commodity Finance & Aggregation</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-8">
                   Invest in warehouse receipt systems or fund export aggregators through our vetted institutional partners. Secure, real-asset returns.
                </p>
                
                <div className="space-y-4">
                   {[
                      { l: "Contract Minimum", v: "KES 500,000" },
                      { l: "Security Level", v: "Asset-Backed" },
                      { l: "Exit Liquidity", v: "High (Auction Based)" },
                   ].map(feat => (
                      <div key={feat.l} className="flex justify-between border-b border-white/5 pb-2">
                         <span className="text-[9px] font-bold text-slate-500 uppercase">{feat.l}</span>
                         <span className="text-[9px] font-black">{feat.v}</span>
                      </div>
                   ))}
                </div>
             </div>
             
             <button 
               onClick={() => handleOpenAssetModal(selectedAsset.id)}
               className="mt-8 w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all"
             >
                Invest in Agri-Contracts <ArrowRight className="w-4 h-4 inline ml-1" />
             </button>
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32" />
          </div>
        </div>

        {/* Directory */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                 <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Commodity Price Board</h2>
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Daily benchmarks from authoritative auctions</p>
              </div>
              <Activity className="w-5 h-5 text-slate-300" />
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="pl-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Asset</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Benchmark Price</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Change</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Unit</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Trade Location</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right pr-8">Log</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {AGRI_DATA.map((a, i) => (
                       <tr key={i} className="hover:bg-slate-50/50 transition-all cursor-pointer" onClick={() => setSelectedAsset(a)}>
                          <td className="pl-8 py-5">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                   <Sprout className="w-4 h-4 text-emerald-600" />
                                </div>
                                <span className="text-[11px] font-black text-slate-900 uppercase">{a.name}</span>
                             </div>
                          </td>
                          <td className="px-4 py-5 text-sm font-black text-slate-900">KES {a.price.toLocaleString()}</td>
                          <td className="px-4 py-5 text-[10px] font-black">
                             <span className={a.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                                {a.change >= 0 ? '+' : ''}{a.percent}%
                             </span>
                          </td>
                          <td className="px-4 py-5 hidden md:table-cell text-[10px] font-bold text-slate-500 uppercase">{a.unit}</td>
                          <td className="px-4 py-5 hidden lg:table-cell text-[10px] font-bold text-slate-500 uppercase">{a.origin}</td>
                          <td className="px-4 py-5 text-right pr-8">
                             <button onClick={(e) => { e.stopPropagation(); handleOpenAssetModal(a.id); }} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                                <Plus className="w-4 h-4 text-slate-400" />
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
