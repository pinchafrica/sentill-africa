"use client";

import { Landmark, Users, TrendingUp, ShieldCheck, PieChart, Activity, Clock, CheckCircle2, Building2 } from "lucide-react";

const CHAMA_ASSETS = [
  { id: "CA-01", name: "Sanlam KES MMF", type: "Money Market", allocation: "35%", value: "KES 4,970,000", yield_1yr: "16.1%", status: "Active" },
  { id: "CA-02", name: "IFB1/2023/17", type: "Sovereign Bond", allocation: "45%", value: "KES 6,390,000", yield_1yr: "17.9%", status: "Locked" },
  { id: "CA-03", name: "Acorn D-REIT", type: "Real Estate", allocation: "20%", value: "KES 2,840,000", yield_1yr: "9.2%", status: "Active" },
];

export default function ChamaAssetsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-emerald-100">
              <Users className="w-3 h-3" /> Prestige Wealth Group
           </div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Global Assets</h1>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
             Detailed breakdown of the group's entire portfolio
           </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
               <thead>
                  <tr className="border-b border-slate-100">
                     <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Name</th>
                     <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</th>
                     <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Principal Value</th>
                     <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Group Weight</th>
                     <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Yield p.a.</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {CHAMA_ASSETS.map((asset, i) => (
                     <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="py-4 px-4">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                                 {asset.type === 'Money Market' ? <Activity className="w-4 h-4 text-emerald-600" /> : 
                                  asset.type === 'Sovereign Bond' ? <Landmark className="w-4 h-4 text-blue-600" /> :
                                  <Building2 className="w-4 h-4 text-amber-600" />}
                              </div>
                              <div>
                                 <p className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors cursor-pointer text-sm">{asset.name}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{asset.id}</p>
                              </div>
                           </div>
                        </td>
                        <td className="py-4 px-4">
                           <span className="text-[10px] font-black border border-slate-200 bg-slate-50 text-slate-600 px-2 py-1 rounded-md uppercase tracking-widest">
                              {asset.type}
                           </span>
                        </td>
                        <td className="py-4 px-4 font-black text-slate-900 text-sm">
                           {asset.value}
                        </td>
                        <td className="py-4 px-4">
                           <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-slate-600">{asset.allocation}</span>
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-emerald-500 rounded-full" style={{ width: asset.allocation }} />
                              </div>
                           </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                           <span className="text-sm font-black text-emerald-600">{asset.yield_1yr}</span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
