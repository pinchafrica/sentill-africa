"use client";

import { useState } from "react";
import { 
  Globe, TrendingUp, Activity, Zap, Search, Star, 
  ArrowRight, Shield, Award, Briefcase, Plus, Landmark
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend
} from "recharts";
import AssetModal from "@/components/AssetModal";

const ETF_DATA = [
  { id: "VOO", name: "Vanguard S&P 500 ETF", category: "US Large Cap", price: 472.15, yield: 1.34, er: 0.03, change: +0.45, percent: +0.82 },
  { id: "VTI", name: "Vanguard Total Stock Market", category: "Total US", price: 252.80, yield: 1.38, er: 0.03, change: +0.32, percent: +0.65 },
  { id: "QQQ", name: "Invesco QQQ Trust", category: "US Tech", price: 442.10, yield: 0.58, er: 0.20, change: +5.20, percent: +1.42 },
  { id: "VXUS", name: "Vanguard Total Intl Stock", category: "Global ex-US", price: 58.45, yield: 3.12, er: 0.07, change: -0.12, percent: -0.21 },
  { id: "VWO", name: "Vanguard Emerging Markets", category: "Emerging Markets", price: 41.50, yield: 3.45, er: 0.08, change: +0.05, percent: +0.12 },
];

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl text-white">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-black text-indigo-400">{p.value}%</p>
      ))}
    </div>
  );
};

export default function GlobalETFsPage() {
  const [selectedETF, setSelectedETF] = useState(ETF_DATA[0]);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
            <Globe className="w-3 h-3" /> Global Diversification · Passive Alpha
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">International <span className="text-indigo-600">ETFs.</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Low-cost Indexing · Sector Focus · Emerging Markets</p>
        </div>

        {/* Highlight Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                      <Globe className="w-6 h-6 text-indigo-600" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{selectedETF.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedETF.id} · {selectedETF.category}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-black text-slate-900 tracking-tighter">${selectedETF.price.toFixed(2)}</p>
                   <p className={`text-[10px] font-black ${selectedETF.percent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {selectedETF.percent >= 0 ? '+' : ''}{selectedETF.percent}%
                   </p>
                </div>
             </div>

             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={ETF_DATA.slice(0, 4)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="id" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                      <YAxis hide domain={[0, 4]} />
                      <Tooltip content={<DarkTooltip />} />
                      <Bar dataKey="yield" name="Div Yield" fill="#4f46e5" radius={[4,4,0,0]} />
                      <Bar dataKey="er" name="Exp Ratio" fill="#e2e8f0" radius={[4,4,0,0]} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
             
             <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-50 text-center">
                {[{ l: "Exp Ratio", v: selectedETF.er + "%" }, { l: "Div Yield", v: selectedETF.yield + "%" }, { l: "NAV", v: "$" + selectedETF.price }, { l: "Type", v: "Passive" }].map(m => (
                   <div key={m.l}>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.l}</p>
                      <p className="text-xs font-black text-slate-900 mt-1">{m.v}</p>
                   </div>
                ))}
             </div>
          </div>

          <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col justify-between">
             <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 rounded-full mb-6 border border-indigo-500/20">
                   <Award className="w-3 h-3 text-indigo-400" />
                   <span className="text-[8px] font-black uppercase tracking-widest">Global Access Tier</span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4 leading-tight">Institutional Global Portfolios</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-8">
                   Build a globally diversified portfolio with the click of a button. Rebalance automatically across different geogprahies and sectors.
                </p>
                
                <div className="space-y-4">
                   {[
                      { l: "Broker Partner", v: "Interactive Brokers" },
                      { l: "Custodian", v: "SEC / FINRA" },
                      { l: "Platform Fee", v: "0.25% p.a." },
                   ].map(feat => (
                      <div key={feat.l} className="flex justify-between border-b border-white/5 pb-2">
                         <span className="text-[9px] font-bold text-slate-500 uppercase">{feat.l}</span>
                         <span className="text-[9px] font-black">{feat.v}</span>
                      </div>
                   ))}
                </div>
             </div>
             
             <button 
               onClick={() => handleOpenAssetModal(selectedETF.id)}
               className="mt-8 w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl"
             >
                Add to Portfolio <Plus className="w-4 h-4 inline ml-1" />
             </button>
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32" />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">ETF Universe</h2>
              <Search className="w-5 h-5 text-slate-300" />
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="pl-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">ETF</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">NAV Price</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Change</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Ex Ratio</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Category</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right pr-8">Log</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {ETF_DATA.map((e, i) => (
                       <tr key={i} className="hover:bg-slate-50/5 transition-all cursor-pointer group" onClick={() => setSelectedETF(e)}>
                          <td className="pl-8 py-5">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600">{e.id.slice(0, 1)}</div>
                                <div>
                                   <p className="text-[11px] font-black text-slate-900 uppercase">{e.id}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase line-clamp-1">{e.name}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-4 py-5 text-sm font-black text-slate-900">${e.price.toFixed(2)}</td>
                          <td className="px-4 py-5">
                             <span className={`text-[10px] font-black ${e.percent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {e.percent >= 0 ? '+' : ''}{e.percent}%
                             </span>
                          </td>
                          <td className="px-4 py-5 hidden md:table-cell text-[10px] font-black text-slate-500">{e.er}%</td>
                          <td className="px-4 py-5 hidden lg:table-cell text-[10px] font-bold text-slate-500 uppercase">{e.category}</td>
                          <td className="px-4 py-5 text-right pr-8">
                             <button onClick={(e) => { e.stopPropagation(); handleOpenAssetModal(e.currentTarget.id); }} className="p-2 hover:bg-slate-100 rounded-lg">
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
