"use client";

import { useState } from "react";
import { 
  Building2, Shield, TrendingUp, Activity, ArrowRight, Plus, 
  Info, Award, ChevronRight, Search, Zap, Star
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, AreaChart, Area
} from "recharts";
import AssetModal from "@/components/AssetModal";

const CORP_BONDS = [
  { id: "FAM2023", name: "Family Bank 13%", issuer: "Family Bank", coupon: 13.0, yield: 15.5, maturity: "2028", minInv: "100k", rating: "A-" },
  { id: "NCBA2024", name: "NCBA Corp Bond", issuer: "NCBA Group", coupon: 12.5, yield: 14.8, maturity: "2029", minInv: "50k", rating: "A+" },
  { id: "EABL2026", name: "EABL Medium Term", issuer: "EABL", coupon: 12.25, yield: 13.5, maturity: "2026", minInv: "100k", rating: "AA" },
  { id: "ABS2027", name: "Absa Corp Bond", issuer: "Absa Bank Kenya", coupon: 13.5, yield: 15.2, maturity: "2027", minInv: "100k", rating: "A+" },
];

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl text-white">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-black text-emerald-400">{p.value}%</p>
      ))}
    </div>
  );
};

export default function CorporateBondsPage() {
  const [selectedBond, setSelectedBond] = useState(CORP_BONDS[0]);
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
            <Shield className="w-3 h-3" /> Institutional Fixed Income · Yield+
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Corporate <span className="text-indigo-600">Bonds.</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secondary Market Opportunities · NSE Listed · High Yield</p>
        </div>

        {/* Analytics Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Yield Comparison</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Gross Yield vs Coupon Rate</p>
                </div>
                <Activity className="w-5 h-5 text-slate-300" />
             </div>
             
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={CORP_BONDS} barGap={8}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} />
                      <YAxis hide domain={[0, 20]} />
                      <Tooltip content={<DarkTooltip />} />
                      <Bar dataKey="coupon" name="Coupon" fill="#e2e8f0" radius={[4,4,0,0]} />
                      <Bar dataKey="yield" name="Mkt Yield" fill="#4f46e5" radius={[4,4,0,0]} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
             
             <div className="flex justify-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                   <span className="text-[9px] font-black text-slate-400 uppercase">Coupon Rate</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                   <span className="text-[9px] font-black text-slate-400 uppercase">Current Yield</span>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm flex flex-col">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                   <Building2 className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                   <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">{selectedBond.issuer}</h3>
                   <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{selectedBond.rating} Rating</span>
                </div>
             </div>
             
             <div className="space-y-4 mb-auto">
                {[
                   { l: "Tenor Remaining", v: selectedBond.maturity + " Series" },
                   { l: "Min Investment", v: "KES " + selectedBond.minInv },
                   { l: "Coupon Frequency", v: "Semi-Annual" },
                   { l: "Listed Status", v: "NSE Secondary" },
                ].map(item => (
                   <div key={item.l} className="flex justify-between border-b border-slate-50 pb-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.l}</span>
                      <span className="text-[10px] font-black text-slate-900 text-right">{item.v}</span>
                   </div>
                ))}
             </div>

             <button 
               onClick={() => handleOpenAssetModal(selectedBond.id)}
               className="mt-8 w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
             >
                Log Position <Plus className="w-3.5 h-3.5 inline ml-1" />
             </button>
          </div>
        </div>

        {/* Directory Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-50 space-y-2">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Bond Registry</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Nairobi Securities Exchange · Fixed Income Segment</p>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="pl-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Instrument</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Coupon</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Mkt Yield</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Maturity</th>
                       <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right pr-8">Trade</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {CORP_BONDS.map((b, i) => (
                       <tr key={i} className="hover:bg-slate-50/50 cursor-pointer group" onClick={() => setSelectedBond(b)}>
                          <td className="pl-8 py-5">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600">{b.name.slice(0, 2)}</div>
                                <div>
                                   <p className="text-[11px] font-black text-slate-900 uppercase">{b.name}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase">{b.issuer}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-4 py-5 text-sm font-black text-slate-600">{b.coupon}%</td>
                          <td className="px-4 py-5 text-sm font-black text-emerald-600">{b.yield}%</td>
                          <td className="px-4 py-5 text-sm font-black text-slate-900">{b.maturity}</td>
                          <td className="px-4 py-5 text-right pr-8">
                             <a href="https://ncbagroup.com/investment-bank/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-600 hover:text-white transition-all">
                                Buy via Broker <ArrowRight className="w-3 h-3" />
                             </a>
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
