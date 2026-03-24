"use client";

import { Map, ArrowRight, ShieldCheck, TrendingUp, Info, Activity, Landmark, Compass, Layers } from "lucide-react";
import { motion } from "framer-motion";

export default function LandAnalysisPage() {
  const plots = [
    { name: "Ruiru East (Phase 4)", type: "Residential", premium: "12.4%", status: "High Liquidity", parity: "1.2 Plots" },
    { name: "Nanyuki (Greens)", type: "Speculative", premium: "8.2%", status: "Medium Term", parity: "0.8 Plots" },
    { name: "Malindi (Coastal)", type: "Holiday/Agricultural", premium: "15.1%", status: "Emerging Market", parity: "2.1 Plots" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Map className="w-8 h-8 text-emerald-600" /> Land Parity Index
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Institutional Hard-Asset Mapping <span className="text-emerald-500 ml-2">• Q1 2026 Index</span>
          </p>
        </div>
      </div>

      {/* ─── TOP METRICS ─────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Aggregate Land Value</span>
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">KES 14,250,500</h2>
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
             <TrendingUp className="w-3 h-3" /> +4.2% Growth vs KES MMF
           </p>
        </div>
        <div className="bg-slate-900 rounded-[2rem] p-8 shadow-xl text-white md:col-span-2 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
              <div className="space-y-4">
                 <h3 className="text-xl font-black uppercase tracking-tight">Pilot Handover: Land Liquidity</h3>
                 <p className="text-xs font-medium text-slate-400 max-w-sm leading-relaxed">
                   Currently, your liquid portfolio is equivalent to <span className="text-emerald-400">3.2 Plots in Ruiru</span>. 
                   Diversification into hard assets is recommended if target net worth exceeds 50M.
                 </p>
              </div>
              <button className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg">
                 Analyze Acquisition <ArrowRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>

      {/* ─── LAND MATRIX ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 lg:p-12 shadow-sm">
         <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
            <div>
               <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Plot Portfolio</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Verified Registry Synchronized</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-500 text-[9px] font-black uppercase tracking-widest">
               <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Registry Guard Active
            </div>
         </div>

         <div className="grid md:grid-cols-3 gap-6">
            {plots.map((plot, i) => (
              <div key={i} className="group bg-slate-50 border border-slate-100 rounded-3xl p-6 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                 <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-900 group-hover:text-emerald-600 transition-colors">
                       <Compass className="w-6 h-6" />
                    </div>
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                       {plot.premium} Alpha
                    </span>
                 </div>
                 <h4 className="text-lg font-black text-slate-900 tracking-tight mb-1">{plot.name}</h4>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{plot.type}</p>
                 
                 <div className="space-y-3 pt-6 border-t border-slate-100">
                    <div className="flex justify-between text-[10px] font-bold">
                       <span className="text-slate-400 uppercase tracking-widest">Status</span>
                       <span className="text-slate-900 uppercase">{plot.status}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold">
                       <span className="text-slate-400 uppercase tracking-widest">MMF Parity</span>
                       <span className="text-slate-900 uppercase">{plot.parity}</span>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* ─── MARKET INTELLIGENCE ────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-8">
         <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
               </div>
               <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Zoning & Infrastructure Upgrades</h4>
            </div>
            <div className="space-y-4">
               {[
                 { title: "Eastern Bypass Expansion", impact: "+15% Property Value", zone: "Ruiru/Kamakis" },
                 { title: "Western Bypass Finalization", impact: "+12% Property Value", zone: "Wangige/Banana" },
                 { title: "Dongo Kundu Bypass Phase 3", impact: "+22% Property Value", zone: "Kwale/Mombasa South" },
               ].map((update, i) => (
                 <div key={i} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50 flex justify-between items-center group cursor-pointer hover:bg-slate-50">
                    <div>
                       <p className="text-xs font-black text-slate-900 uppercase group-hover:text-blue-600 transition-colors">{update.title}</p>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{update.zone}</p>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{update.impact}</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-800 flex items-center justify-center">
                     <Info className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest font-heading">Institutional Disclaimer</h4>
               </div>
               <p className="text-xs font-medium text-amber-900/60 leading-relaxed uppercase tracking-wider">
                  Land analysis provided by Sentill is for informational purposes only. Direct title verification at the <span className="text-amber-900">Ministry of Lands (ArdhiSas)</span> is mandatory before any transaction. Sentill conducts independent high-resolution drone mapping and valuation modeling for top-tier plots.
               </p>
            </div>
            <button className="w-full mt-8 py-4 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-amber-300">
               Access ArdhiSas Verification Terminal
            </button>
         </div>
      </div>

    </div>
  );
}
