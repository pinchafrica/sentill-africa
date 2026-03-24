"use client";

import { useState } from "react";
import { 
  Briefcase, TrendingUp, Activity, Globe, Zap, ArrowRight, 
  Plus, Info, Award, ChevronRight, Search, Landmark, Shield
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend
} from "recharts";
import AssetModal from "@/components/AssetModal";

const PE_FUNDS = [
  { id: "HEL-I", name: "Helios Investment Partners", strategy: "Growth Capital", irv: "20%+", aum: "$3.6B", status: "Active", regions: "Pan-Africa" },
  { id: "EXS-I", name: "Exis Capital", strategy: "Buyout", irv: "18%+", aum: "$1.2B", status: "Closed", regions: "East Africa" },
  { id: "SDR-I", name: "Sedar Fund IV", strategy: "Small Cap", irv: "22%+", aum: "$450M", status: "Fundraising", regions: "Kenya / Uganda" },
  { id: "AVR-I", name: "Adenia Capital", strategy: "Control Growth", irv: "17%+", aum: "$800M", status: "Active", regions: "Africa" },
];

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl text-white">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-black text-indigo-400">{p.value}</p>
      ))}
    </div>
  );
};

export default function PEPage() {
  const [selectedFund, setSelectedFund] = useState(PE_FUNDS[0]);
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <Shield className="w-3 h-3 text-emerald-400" /> Alternative Alpha · Private Equity
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Private <span className="text-indigo-600">Equity.</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institutional Deal Flow · Direct Investments · Fund Registry</p>
        </div>

        {/* Highlight Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900 uppercase font-black">{selectedFund.name.slice(0, 1)}</div>
                   <div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{selectedFund.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedFund.strategy} · {selectedFund.regions}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-2xl font-black text-slate-900 tracking-tighter">{selectedFund.irv}</p>
                   <p className="text-[9px] text-slate-400 font-bold uppercase">Estimated IRR</p>
                </div>
             </div>

             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={[
                      { sector: 'Fintech', multiple: 4.2 },
                      { sector: 'Energy', multiple: 3.5 },
                      { sector: 'Agri', multiple: 2.8 },
                      { sector: 'Health', multiple: 3.1 },
                   ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="sector" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                      <YAxis hide domain={[0, 6]} />
                      <Tooltip content={<DarkTooltip />} />
                      <Bar dataKey="multiple" name="Exit Multiple" fill="#4f46e5" radius={[6,6,0,0]} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
             
             <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-50 text-center">
                {[{ l: "AUM", v: selectedFund.aum }, { l: "Min Ticket", v: "$5M" }, { l: "Term", v: "10 Yrs" }, { l: "vintage", v: "2024" }].map(m => (
                   <div key={m.l}>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.l}</p>
                      <p className="text-xs font-black text-slate-900 mt-1">{m.v}</p>
                   </div>
                ))}
             </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col justify-between">
             <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full mb-6 border border-white/5">
                   <Zap className="w-3 h-3 text-amber-400" />
                   <span className="text-[8px] font-black uppercase tracking-widest">Sentill Direct Access</span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-4 leading-tight">Co-Invest in Tier-1 PE Transactions</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-8">
                   Sentill Pro members can participate in select co-investment opportunities alongside leading global and regional PE firms. Access institutional-grade diligence and structures.
                </p>
                
                <div className="space-y-4">
                   {[
                      { l: "Target Multiple", v: "3.5x - 5.0x" },
                      { l: "Security", v: "Preferred Equity" },
                      { l: "Reporting", v: "Quarterly NAV" },
                   ].map(feat => (
                      <div key={feat.l} className="flex justify-between border-b border-white/5 pb-2">
                         <span className="text-[9px] font-bold text-slate-500 uppercase">{feat.l}</span>
                         <span className="text-[9px] font-black">{feat.v}</span>
                      </div>
                   ))}
                </div>
             </div>
             
             <button 
               onClick={() => handleOpenAssetModal(selectedFund.id)}
               className="mt-8 w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl"
             >
                Request Access <ArrowRight className="w-4 h-4 inline ml-1" />
             </button>
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32" />
          </div>
        </div>

        {/* Directory */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                 <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Active Private Markets</h2>
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Authorized fund managers & special purpose vehicles</p>
              </div>
              <Landmark className="w-5 h-5 text-slate-300" />
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="pl-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Fund Manager</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Strategy</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Target IRR</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">AUM</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right pr-8">Log</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {PE_FUNDS.map((f, i) => (
                       <tr key={i} className="hover:bg-slate-50/5 transition-all cursor-pointer group" onClick={() => setSelectedFund(f)}>
                          <td className="pl-8 py-5">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">{f.name.slice(0, 1)}</div>
                                <div>
                                   <p className="text-[11px] font-black text-slate-900 uppercase">{f.name}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase">{f.regions}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-4 py-5 text-[10px] font-black text-slate-600 uppercase tracking-wide">{f.strategy}</td>
                          <td className="px-4 py-5 font-black text-emerald-600 text-sm">{f.irv}</td>
                          <td className="px-4 py-5 hidden md:table-cell text-[10px] font-bold text-slate-500 uppercase">{f.aum}</td>
                          <td className="px-4 py-5 text-right pr-8">
                             <button onClick={(e) => { e.stopPropagation(); handleOpenAssetModal(f.id); }} className="p-2 hover:bg-slate-100 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-all">
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
