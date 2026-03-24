"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, Target, Shield, Zap, Info } from "lucide-react";
import { useAIStore } from "@/lib/store";

export default function RiskProfilerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [age, setAge] = useState(30);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-risk-profiler", handleOpen);
    
    // Fetch portolio context
    fetch("/api/portfolio/assets")
      .then(r => r.json())
      .then(d => setAssets(Array.isArray(d) ? d : []))
      .catch();
      
    return () => window.removeEventListener("open-risk-profiler", handleOpen);
  }, []);

  // Risk Calc logic
  const portfolioAnalysis = useMemo(() => {
    const total = assets.reduce((acc, curr) => acc + (curr.principal || 0), 0);
    
    // Categorize risk based on Sentill logic
    let lowRisk = 0; // MMFs, Govt Bonds
    let medRisk = 0; // Real Estate, Corporate Bonds
    let highRisk = 0;  // Stocks, Crypto, Startups

    assets.forEach(a => {
      const p = a.principal || 0;
      const t = (a.type || "").toUpperCase();
      if (t.includes('MMF') || t.includes('MONEY_MARKET') || t.includes('BOND')) {
        lowRisk += p;
      } else if (t.includes('PROPERTY') || t.includes('REIT') || t.includes('CHAMA')) {
        medRisk += p;
      } else {
        highRisk += p;
      }
    });

    if (total === 0) {
       // Dummy fallback if no assets
       lowRisk = 500000;
       medRisk = 300000;
       highRisk = 200000;
    }
    
    const actualTotal = lowRisk + medRisk + highRisk;
    return {
      total: actualTotal,
      low: lowRisk,
      med: medRisk,
      high: highRisk,
      lowPct: Math.round((lowRisk / actualTotal) * 100) || 0,
      medPct: Math.round((medRisk / actualTotal) * 100) || 0,
      highPct: Math.round((highRisk / actualTotal) * 100) || 0,
    };
  }, [assets]);

  // AI Score 1-100 (100 = max risk)
  const currentRiskScore = Math.round((portfolioAnalysis.medPct * 0.5) + (portfolioAnalysis.highPct * 1.0));
  
  // Rule of thumb: 120 - age = ideal equity/high risk %
  const targetHighRiskPct = Math.max(0, 120 - age);

  let profileType = "Conservative";
  let profileColor = "text-emerald-500";
  let profileBg = "bg-emerald-50";

  if (currentRiskScore > 70) {
    profileType = "Aggressive";
    profileColor = "text-rose-500";
    profileBg = "bg-rose-50";
  } else if (currentRiskScore > 40) {
    profileType = "Balanced";
    profileColor = "text-amber-500";
    profileBg = "bg-amber-50";
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
        
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
          
          {/* Left Panel */}
          <div className="w-full md:w-5/12 bg-slate-950 p-8 flex flex-col justify-between text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
             <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                   <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Alpha Risk Profiler</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-8">AI analysis of your exposure vectors based on biological age and current capital allocation.</p>

                <div className="space-y-6">
                   <div>
                     <label className="text-[10px] font-black uppercase text-slate-500 block mb-2">Your Age: {age}</label>
                     <input type="range" min="18" max="90" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full accent-white" />
                     <p className="text-[9px] font-bold text-slate-500 uppercase mt-2">Determines Target Allocation (120 Rule)</p>
                   </div>
                </div>
             </div>

             <div className="relative z-10 mt-10">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Sentill AI Verdict</div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest ${profileBg} ${profileColor}`}>
                   <Target className="w-4 h-4" /> {profileType}
                </div>
             </div>
          </div>

          {/* Right Panel */}
          <div className="w-full md:w-7/12 p-8 md:p-10 relative">
             <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4" />
             </button>

             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Current vs Target Allocation</h3>

             {/* Risk Meter */}
             <div className="mb-10">
                <div className="flex justify-between items-end mb-2">
                   <div>
                      <span className="text-5xl font-black text-slate-900 tracking-tighter">{currentRiskScore}</span>
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">/ 100</span>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Target Risk Score</p>
                      <p className="text-xl font-black text-indigo-600 tracking-tighter">{targetHighRiskPct}</p>
                   </div>
                </div>
                {/* Meter Bar */}
                <div className="h-4 bg-slate-100 rounded-full flex overflow-hidden w-full relative">
                   <div className="h-full bg-emerald-500" style={{ width: `${portfolioAnalysis.lowPct}%` }} />
                   <div className="h-full bg-amber-500" style={{ width: `${portfolioAnalysis.medPct}%` }} />
                   <div className="h-full bg-rose-500" style={{ width: `${portfolioAnalysis.highPct}%` }} />
                   <div className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10" style={{ left: `${targetHighRiskPct}%` }} title="Target High Risk Vector" />
                </div>
                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-400 mt-2">
                   <span>Conservative (0)</span>
                   <span>Aggressive (100)</span>
                </div>
             </div>

             {/* AI Insight Box */}
             <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                   <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5" />
                   </div>
                   <div>
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-blue-900 mb-2">AI Restructuring Alert</h4>
                      {currentRiskScore < targetHighRiskPct - 15 ? (
                         <p className="text-xs font-bold text-slate-600 leading-relaxed">
                            At age {age}, you have a long time horizon but your portfolio is heavily skewed towards Low Risk ({portfolioAnalysis.lowPct}%). 
                            You are losing compound Alpha to inflation. Sentill AI recommends rebalancing your KES {portfolioAnalysis.total.toLocaleString()} portfolio to include more NSE Equities or targeted index funds to hit your {targetHighRiskPct}% target exposure.
                         </p>
                      ) : currentRiskScore > targetHighRiskPct + 15 ? (
                         <p className="text-xs font-bold text-slate-600 leading-relaxed">
                            At age {age}, your portfolio is over-exposed to High Risk vectors ({portfolioAnalysis.highPct}%). 
                            Given the 120 Rule, the AI recommends taking profits and moving at least {(currentRiskScore - targetHighRiskPct)}% of your capital into tax-free sovereign bonds to safeguard principal.
                         </p>
                      ) : (
                         <p className="text-xs font-bold text-slate-600 leading-relaxed">
                            Your portfolio risk exactly matches institutional algorithms for a {age}-year-old. Your asset mix perfectly bridges inflation defense (MMFs) with aggressive compound growth. Keep deploying capital proportionately.
                         </p>
                      )}
                   </div>
                </div>
             </div>

             {/* Legend */}
             <div className="mt-8 flex items-center gap-6 justify-center">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-emerald-500" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Low Risk {portfolioAnalysis.lowPct}%</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-amber-500" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Medium {portfolioAnalysis.medPct}%</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-rose-500" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">High Risk {portfolioAnalysis.highPct}%</span>
                </div>
             </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
