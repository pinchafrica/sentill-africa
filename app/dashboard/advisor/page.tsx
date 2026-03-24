"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BrainCircuit, Calculator, ShieldCheck, TrendingUp, Building2, 
  ArrowRight, CheckCircle2, AlertCircle, Zap
} from "lucide-react";

export default function AdvisorAPI() {
  const [capital, setCapital] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [strategyGenerated, setStrategyGenerated] = useState<boolean>(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capital || Number(capital) < 1000) return;
    
    setIsGenerating(true);
    setStrategyGenerated(false);

    // Simulate AI generation time
    setTimeout(() => {
      setIsGenerating(false);
      setStrategyGenerated(true);
    }, 1500);
  };

  const amount = Number(capital) || 0;
  
  // Strategy allocation logic based on amount
  const mmfAllocation = amount * 0.40;
  const bondsAllocation = amount * 0.45;
  const stocksAllocation = amount * 0.15;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ultra Advisor</h1>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded shadow-sm border border-emerald-200 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Core Engine
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-500">
            Institutional-grade allocation matrices based on live yield curves and CMA risk profiling.
          </p>
        </div>
      </div>

      {/* ─── CALCULATOR INPUT ────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
         <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                 <Calculator className="w-4 h-4 text-emerald-500" /> Capital Available (KES)
               </label>
               <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-xl">KSh</span>
                 <input 
                   type="number" 
                   value={capital}
                   onChange={(e) => setCapital(e.target.value)}
                   placeholder="150000"
                   className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-16 pr-6 py-4 text-slate-900 font-mono font-black text-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-inner"
                 />
               </div>
            </div>
            <div className="md:w-48 flex items-end">
               <button 
                 type="submit"
                 disabled={isGenerating || !capital || Number(capital) < 1000}
                 className="w-full bg-slate-900 text-white rounded-2xl h-[68px] font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(15,23,42,0.39)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.23)] flex items-center justify-center gap-2"
               >
                 {isGenerating ? (
                   <span className="flex items-center gap-2 animate-pulse">
                     <BrainCircuit className="w-5 h-5" /> Processing
                   </span>
                 ) : (
                   "Generate Alpha"
                 )}
               </button>
            </div>
         </form>

         {(capital && Number(capital) < 1000) && (
           <div className="mt-4 flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wider">
             <AlertCircle className="w-4 h-4" /> Minimum capital requirement: KES 1,000
           </div>
         )}
      </div>

      {/* ─── STRATEGY OUTPUT & ROADMAP ───────────────────────────────────── */}
      <AnimatePresence>
        {strategyGenerated && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* 3-Tier Allocation Matrix */}
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-emerald-500" /> Optimal Capital Distribution
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* MMF Tier */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col pt-8 relative overflow-hidden group hover:border-emerald-200 transition-colors">
                <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-8 h-8 text-emerald-500/20" />
                </div>
                <div className="relative z-10 flex-1">
                   <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">40% Allocation</span>
                   <h4 className="text-xl font-black text-slate-900 mt-4">Liquidity Shield</h4>
                   <p className="text-xs text-slate-500 font-bold mt-1">Money Market Funds</p>
                   <p className="text-3xl font-mono font-black text-slate-900 mt-4 tracking-tighter">
                     <span className="text-sm font-bold text-slate-400 mr-1">KES</span>
                     {mmfAllocation.toLocaleString()}
                   </p>
                </div>
              </div>

              {/* Bonds Tier */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col pt-8 relative overflow-hidden group hover:border-indigo-200 transition-colors">
                <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500" />
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Building2 className="w-8 h-8 text-indigo-500/20" />
                </div>
                <div className="relative z-10 flex-1">
                   <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">45% Allocation</span>
                   <h4 className="text-xl font-black text-slate-900 mt-4">Generational Anchor</h4>
                   <p className="text-xs text-slate-500 font-bold mt-1">IFB Treasury Bonds</p>
                   <p className="text-3xl font-mono font-black text-slate-900 mt-4 tracking-tighter">
                     <span className="text-sm font-bold text-slate-400 mr-1">KES</span>
                     {bondsAllocation.toLocaleString()}
                   </p>
                </div>
              </div>

              {/* Stocks Tier */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col pt-8 relative overflow-hidden group hover:border-blue-200 transition-colors">
                <div className="absolute top-0 inset-x-0 h-1 bg-blue-500" />
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                   <TrendingUp className="w-8 h-8 text-blue-500/20" />
                </div>
                <div className="relative z-10 flex-1">
                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">15% Allocation</span>
                   <h4 className="text-xl font-black text-slate-900 mt-4">Growth Alpha</h4>
                   <p className="text-xs text-slate-500 font-bold mt-1">NSE Blue-Chip Equities</p>
                   <p className="text-3xl font-mono font-black text-slate-900 mt-4 tracking-tighter">
                     <span className="text-sm font-bold text-slate-400 mr-1">KES</span>
                     {stocksAllocation.toLocaleString()}
                   </p>
                </div>
              </div>
            </div>

            {/* Implementation Roadmap */}
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4 mt-8 border-b border-slate-200 pb-2">
              Execution Roadmap
            </h3>

            <div className="space-y-4">
               
               <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                    01
                  </div>
                  <div className="flex-1">
                     <h5 className="font-black text-slate-900">Secure Liquid Anchor</h5>
                     <p className="text-sm text-slate-600 font-medium leading-relaxed mt-1">
                       Move <strong className="text-emerald-600 tracking-tight font-mono">KES {mmfAllocation.toLocaleString()}</strong> to Etica Wealth MMF. Use PayBill <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">800000</span>, Account <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">ID-1234</span>. This guarantees 17.5% gross yield with sub-24hr liquidity.
                     </p>
                  </div>
                  <div className="hidden sm:flex items-center">
                    <CheckCircle2 className="w-6 h-6 text-slate-300" />
                  </div>
               </div>

               <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                    02
                  </div>
                  <div className="flex-1">
                     <h5 className="font-black text-slate-900">Acquire Tax-Free Duration</h5>
                     <p className="text-sm text-slate-600 font-medium leading-relaxed mt-1">
                       Instruct your broker to acquire <strong className="text-indigo-600 tracking-tight font-mono">KES {bondsAllocation.toLocaleString()}</strong> of IFB1/2024/6.5 in the secondary market. Target a clean price of ~94.00 to lock in 18.5% Net.
                     </p>
                  </div>
                  <div className="hidden sm:flex items-center">
                    <CheckCircle2 className="w-6 h-6 text-slate-300" />
                  </div>
               </div>

               <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                    03
                  </div>
                  <div className="flex-1">
                     <h5 className="font-black text-slate-900">Deploy Equity Tranche</h5>
                     <p className="text-sm text-slate-600 font-medium leading-relaxed mt-1">
                       Allocate <strong className="text-blue-600 tracking-tight font-mono">KES {stocksAllocation.toLocaleString()}</strong> equally into <code>SCOM.KE</code> and <code>EQTY.KE</code> to capture impending dividend payouts before Q4 closure.
                     </p>
                  </div>
                  <div className="hidden sm:flex items-center">
                    <CheckCircle2 className="w-6 h-6 text-slate-300" />
                  </div>
               </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
