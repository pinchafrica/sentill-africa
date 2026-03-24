"use client";

import { useState } from "react";
import { 
  Diamond, TrendingUp, Activity, Globe, Zap, ArrowRight, 
  Plus, Info, Award, ChevronRight, Search, Anchor, Shield
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend
} from "recharts";
import AssetModal from "@/components/AssetModal";

const COMMODITY_DATA = [
  { id: "GOLD-SPOT", name: "Gold Spot", symbol: "XAU", price: 2158.40, unit: "oz", change: +12.50, percent: +0.58, trend: "Bullish" },
  { id: "SILVER-SPOT", name: "Silver Spot", symbol: "XAG", price: 24.35, unit: "oz", change: -0.15, percent: -0.62, trend: "Consolidating" },
  { id: "BRENT-OIL", name: "Brent Crude", symbol: "BRENT", price: 82.15, unit: "bbl", change: +1.20, percent: +1.48, trend: "Rising" },
  { id: "PLATINUM", name: "Platinum Spot", symbol: "XPT", price: 915.00, unit: "oz", change: +5.00, percent: +0.55, trend: "Stable" },
];

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl text-white">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-black text-amber-400">${p.value.toLocaleString()}</p>
      ))}
    </div>
  );
};

export default function CommoditiesPage() {
  const [selectedAsset, setSelectedAsset] = useState(COMMODITY_DATA[0]);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-widest">
            <Diamond className="w-3 h-3" /> Hard Assets · Institutional Grade
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Global <span className="text-indigo-600">Commodities.</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spot Prices · Futures Data · Institutional Vaulting</p>
        </div>

        {/* Chart Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                      <Diamond className="w-6 h-6 text-amber-600" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{selectedAsset.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedAsset.symbol} · {selectedAsset.trend}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-black text-slate-900 tracking-tighter">${selectedAsset.price.toLocaleString()}</p>
                   <p className="text-[9px] text-slate-400 font-bold uppercase">per {selectedAsset.unit}</p>
                </div>
             </div>

             <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={[
                      { t: '1D', p: selectedAsset.price * 0.99 },
                      { t: '5D', p: selectedAsset.price * 1.01 },
                      { t: '1M', p: selectedAsset.price * 0.98 },
                      { t: '6M', p: selectedAsset.price * 1.05 },
                      { t: 'Spot', p: selectedAsset.price },
                   ]}>
                      <defs>
                         <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                      <YAxis hide />
                      <Tooltip content={<DarkTooltip />} />
                      <Area type="monotone" dataKey="p" stroke="#f59e0b" strokeWidth={3} fill="url(#chartGrad)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
             
             <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-50 text-center">
                {[{ l: "52W High", v: "$2,210" }, { l: "52W Low", v: "$1,811" }, { l: "Daily Vol", v: "1.2B" }, { l: "Sentiment", v: "Bullish" }].map(m => (
                   <div key={m.l}>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.l}</p>
                      <p className="text-xs font-black text-slate-900 mt-1">{m.v}</p>
                   </div>
                ))}
             </div>
          </div>

          <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
             <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 rounded-full mb-6 border border-amber-500/20">
                   <Shield className="w-3 h-3 text-amber-400" />
                   <span className="text-[8px] font-black uppercase tracking-widest">Vaulted Storage</span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4 leading-tight">Physical Gold & Commodity Exposure</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-8">
                   Securely buy and hold physical bullion in licensed vaults globally. Institutional grade insurance and audit trails for all Pro users.
                </p>
                
                <div className="space-y-4">
                   {[
                      { icon: Activity, l: "Daily Liquidity", v: "24/7" },
                      { icon: Anchor, l: "Vaulting", v: "Switzerland" },
                      { icon: Shield, l: "Audited", v: "Quarterly" },
                   ].map(feat => (
                      <div key={feat.l} className="flex items-center justify-between border-b border-white/5 pb-2">
                         <div className="flex items-center gap-2">
                            <feat.icon className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{feat.l}</span>
                         </div>
                         <span className="text-[10px] font-black">{feat.v}</span>
                      </div>
                   ))}
                </div>
             </div>
             
             <button 
               onClick={() => handleOpenAssetModal(selectedAsset.id)}
               className="mt-8 w-full py-4 bg-amber-600 hover:bg-amber-500 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all"
             >
                Purchase Spot {selectedAsset.name} <ArrowRight className="w-4 h-4 inline ml-1" />
             </button>
             <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] -mr-32 -mt-32" />
          </div>
        </div>

        {/* Commodity Board */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Global Spot Prices</h2>
              <Search className="w-5 h-5 text-slate-300" />
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="pl-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Asset</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Spot Price</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Change</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Unit</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right pr-8">Link</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {COMMODITY_DATA.map((c, i) => (
                       <tr key={i} className="hover:bg-slate-50/50 transition-all cursor-pointer group" onClick={() => setSelectedAsset(c)}>
                          <td className="pl-8 py-5">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                   <Diamond className="w-4 h-4 text-amber-600" />
                                </div>
                                <span className="text-[11px] font-black text-slate-900 uppercase">Spot {c.name}</span>
                             </div>
                          </td>
                          <td className="px-4 py-5 text-sm font-black text-slate-900">${c.price.toLocaleString()}</td>
                          <td className="px-4 py-5">
                             <span className={`text-[10px] font-black ${c.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {c.change >= 0 ? '+' : ''}{c.percent}%
                             </span>
                          </td>
                          <td className="px-4 py-5 hidden md:table-cell text-[10px] font-bold text-slate-500 uppercase">{c.unit}</td>
                          <td className="px-4 py-5 text-right pr-8">
                             <button onClick={(e) => { e.stopPropagation(); handleOpenAssetModal(c.id); }} className="p-2 hover:bg-slate-100 rounded-lg transition-all group-hover:bg-slate-900 group-hover:text-white">
                                <Plus className="w-4 h-4" />
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
