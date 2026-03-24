"use client";

import Link from "next/link";
import { TrendingUp, ShieldCheck, ArrowRight, Zap, Info, Landmark, Search, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function ProviderCard({ provider }: { provider: any }) {
  const getIcon = (type: string) => {
    switch(type) {
      case 'MMF': return TrendingUp;
      case 'Bond': return ShieldCheck;
      case 'Equity': return Zap;
      default: return Landmark;
    }
  };

  const Icon = getIcon(provider.type);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
     <div className="glass-card p-10 rounded-[3.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 group hover:border-blue-300 transition-all relative overflow-hidden flex flex-col justify-between h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform shadow-sm">
             <Landmark className="w-7 h-7 text-blue-700" />
          </div>
          <div className="text-right">
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block mb-1">CMA Status</span>
             <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">Verified</span>
          </div>
        </div>

        <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight group-hover:text-blue-700 transition-colors font-heading leading-tight">{provider.name}</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8 line-clamp-2 leading-relaxed">{provider.description}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-10">
           <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Yield</span>
              <span className="text-xl font-black text-blue-700 tracking-tighter">{provider.currentYield}%</span>
           </div>
           <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Risk</span>
              <span className="text-xl font-black text-slate-900 tracking-tighter">{provider.riskLevel}</span>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-auto">
        <Link 
          href={`/providers/${provider.slug}`}
          className="flex-1 px-6 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" /> Deep Dive
        </Link>
        <div className="w-14 h-14 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center border border-blue-100">
          <Activity className="w-6 h-6" />
        </div>
      </div>
    </div>
    </motion.div>
  );
}
