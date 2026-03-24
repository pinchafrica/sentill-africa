"use client";

import { useState } from "react";
import { 
  Zap, TrendingUp, Activity, Globe, ArrowRight, 
  Plus, Info, Award, ChevronRight, Search, 
  Rocket, Lightbulb, Shield, Briefcase
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend
} from "recharts";
import AssetModal from "@/components/AssetModal";

const VC_DEALS = [
  { id: "WSK-24", name: "Wasoko Series C", sector: "E-Commerce", stage: "Series C", target: "$50M", valuation: "$600M", status: "Open", regions: "East / West Africa" },
  { id: "SNK-23", name: "Sun King Debt", sector: "Solar / Energy", stage: "Debt / Equity", target: "$130M", valuation: "$1.2B", status: "Closing", regions: "Global Africa" },
  { id: "MKO-24", name: "M-KOPA Growth", sector: "Fintech / IoT", stage: "Growth", target: "$200M", valuation: "$800M+", status: "Active", regions: "Kenya / Nigeria" },
  { id: "KZV-24", name: "Kuzeva Logistics", sector: "Logistics", stage: "Seed / Series A", target: "$5M", valuation: "$25M", status: "Open", regions: "Nairobi Base" },
];

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl text-white">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-black text-amber-400">{p.value}</p>
      ))}
    </div>
  );
};

export default function VCPage() {
  const [selectedDeal, setSelectedDeal] = useState(VC_DEALS[0]);
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
            <Rocket className="w-3 h-3" /> Rocket Fuel · Venture Capital
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Venture <span className="text-amber-500">Capital.</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Early Stage Innovation · Tech Unicorns · High Conviction Deals</p>
        </div>

        {/* Highlight Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-amber-600" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{selectedDeal.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedDeal.sector} · {selectedDeal.stage}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-black text-slate-900 tracking-tighter">{selectedDeal.target}</p>
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Target Raise</p>
                </div>
             </div>

             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={[
                      { t: 'Seed', v: 2 },
                      { t: 'Series A', v: 8 },
                      { t: 'Series B', v: 25 },
                      { t: 'Growth', v: 60 },
                   ]}>
                      <defs>
                         <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                      <YAxis hide domain={[0, 80]} />
                      <Tooltip content={<DarkTooltip />} />
                      <Area type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={3} fill="url(#chartGrad)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
             
             <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-50 text-center">
                {[{ l: "Est Valuation", v: selectedDeal.valuation }, { l: "Lead Investors", v: "Tier 1" }, { l: "Open Spots", v: "Limited" }, { l: "Closing", v: "60 Days" }].map(m => (
                   <div key={m.l}>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.l}</p>
                      <p className="text-xs font-black text-slate-900 mt-1">{m.v}</p>
                   </div>
                ))}
             </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-2xl">
             <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 rounded-full mb-6 border border-amber-500/20">
                   <Lightbulb className="w-3 h-3 text-amber-400" />
                   <span className="text-[8px] font-black uppercase tracking-widest">Early Admittance Only</span>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-4 leading-tight text-white md:text-white">Back the Next African Giant.</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-8">
                   Sentill Curated Decks provide access to vetted Series A and B tech startups across Africa. We focus on Fintech, Logistics, and Cleantech.
                </p>
                
                <div className="space-y-4">
                   {[
                      { l: "Platform Lead", v: "Sentill Ventures" },
                      { l: "Legal Structure", v: "VCC / Delaware" },
                      { l: "Admin Fee", v: "2% Carry / 2% Mgmt" },
                   ].map(feat => (
                      <div key={feat.l} className="flex justify-between border-b border-white/5 pb-2">
                         <span className="text-[9px] font-bold text-slate-500 uppercase">{feat.l}</span>
                         <span className="text-[9px] font-black">{feat.v}</span>
                      </div>
                   ))}
                </div>
             </div>
             
             <button 
               onClick={() => handleOpenAssetModal(selectedDeal.id)}
               className="mt-8 w-full py-4 bg-amber-600 hover:bg-amber-500 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
             >
                Download Deck <ArrowRight className="w-4 h-4 inline ml-1" />
             </button>
             <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] -mr-32 -mt-32" />
          </div>
        </div>

        {/* Deal Registry */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                 <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Venture Deal Flow</h2>
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Live and upcoming investment rounds</p>
              </div>
              <Rocket className="w-5 h-5 text-slate-200" />
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="pl-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Company / Round</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Sector</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Target</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Valuation</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right pr-8">Link</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {VC_DEALS.map((d, i) => (
                       <tr key={i} className="hover:bg-slate-50 transition-all cursor-pointer group" onClick={() => setSelectedDeal(d)}>
                          <td className="pl-8 py-5">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">{d.id.slice(0, 1)}</div>
                                <div>
                                   <p className="text-[11px] font-black text-slate-900 uppercase">{d.name}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase">{d.stage}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-4 py-5 text-[10px] font-black text-slate-600 uppercase tracking-wide">{d.sector}</td>
                          <td className="px-4 py-5 font-black text-amber-600 text-sm">{d.target}</td>
                          <td className="px-4 py-5 hidden md:table-cell text-[10px] font-bold text-slate-500 uppercase">{d.valuation}</td>
                          <td className="px-4 py-5 text-right pr-8">
                             <button onClick={(e) => { e.stopPropagation(); handleOpenAssetModal(d.id); }} className="p-2 hover:bg-slate-100 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">
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
