"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, Shield, Activity, Calculator, BrainCircuit } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAIStore } from "@/lib/store";

export default function WealthPredictorModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [monthlyContribution, setMonthlyContribution] = useState(10000);
  const [years, setYears] = useState(10);
  const [assets, setAssets] = useState<any[]>([]);
  
  const currentNetWorth = useMemo(() => {
    if (!Array.isArray(assets) || assets.length === 0) return 0;
    return assets.reduce((acc, curr) => acc + (curr.principal || 0), 0);
  }, [assets]);

  const avgYield = useMemo(() => {
    if (!Array.isArray(assets) || assets.length === 0 || currentNetWorth === 0) return 0.165;
    const totalYield = assets.reduce((acc, curr) => acc + (curr.projectedYield || 0), 0);
    return totalYield / currentNetWorth;
  }, [assets, currentNetWorth]);

  // Generate Compound Data
  const projectionData = useMemo(() => {
    const data = [];
    let rollingBalance = currentNetWorth;
    const monthlyRate = avgYield / 12;

    for (let i = 0; i <= years; i++) {
       if (i === 0) {
         data.push({ year: "Year 0", balance: rollingBalance, contributions: rollingBalance });
         continue;
       }
       
       let yearContributions = 0;
       // Compound 12 months
       for(let m = 0; m < 12; m++) {
          rollingBalance += monthlyContribution;
          yearContributions += monthlyContribution;
          rollingBalance = rollingBalance * (1 + monthlyRate);
       }
       
       data.push({ 
          year: `Year ${i}`, 
          balance: Math.round(rollingBalance),
          contributions: Math.round(currentNetWorth + (monthlyContribution * 12 * i))
       });
    }
    return data;
  }, [currentNetWorth, avgYield, monthlyContribution, years]);

  const finalValue = projectionData[projectionData.length - 1]?.balance || 0;
  const totalContributed = projectionData[projectionData.length - 1]?.contributions || 0;
  const aiAlpha = finalValue - totalContributed;

  useEffect(() => {
    // Listen for custom trigger event
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-wealth-predictor", handleOpen);
    
    // Fetch portolio context
    fetch("/api/portfolio/assets")
      .then(r => r.ok ? r.json() : [])
      .then(d => setAssets(Array.isArray(d) ? d : []))
      .catch(() => setAssets([]));
      
    return () => window.removeEventListener("open-wealth-predictor", handleOpen);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-[600px]">
        
        {/* Sidebar Controls */}
        <div className="w-full md:w-80 bg-slate-50 border-r border-slate-100 p-6 flex flex-col justify-between shrink-0 overflow-y-auto">
           <div>
              <div className="flex items-center justify-between mb-8">
                 <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                 </div>
                 <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 md:hidden">
                    <X className="w-4 h-4" />
                 </button>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-2">Wealth Predictor</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed mb-8">AI Trajectory Mapping based on your current portfolio yields.</p>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Current Starting Capital</label>
                    <div className="text-xl font-black text-slate-900 tracking-tight">KES {currentNetWorth.toLocaleString()}</div>
                    <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Blended Yield: {(avgYield * 100).toFixed(1)}% p.a.</div>
                 </div>

                 <div className="pt-4 border-t border-slate-200">
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Monthly Contribution (KES)</label>
                    <input 
                      type="number" 
                      value={monthlyContribution} 
                      onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm mb-2"
                    />
                    <input type="range" min="0" max="250000" step="5000" value={monthlyContribution} onChange={(e) => setMonthlyContribution(Number(e.target.value))} className="w-full accent-indigo-600" />
                 </div>

                 <div className="pt-4 border-t border-slate-200">
                    <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Projection Timeline: {years} Years</label>
                    <input type="range" min="1" max="30" step="1" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full accent-indigo-600" />
                    <div className="flex justify-between text-[8px] font-black text-slate-400 mt-2">
                       <span>1 YR</span>
                       <span>30 YR</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Main Graph Area */}
        <div className="flex-1 p-6 md:p-10 flex flex-col relative overflow-hidden">
           <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 w-10 h-10 hidden md:flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors z-10">
              <X className="w-5 h-5" />
           </button>
           
           <div className="mb-8">
              <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-1">Projected Future Value</p>
              <div className="flex items-end gap-4">
                 <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">KES {(finalValue / 1000000).toFixed(2)}M</h3>
                 <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full mb-2">
                   +KES {(aiAlpha / 1000000).toFixed(1)}M Alpha
                 </span>
              </div>
           </div>

           <div className="flex-1 w-full min-h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                   <YAxis tickFormatter={(val) => `KES ${(val/1000000).toFixed(1)}M`} axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} />
                   <Tooltip 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px' }}
                     labelStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}
                     itemStyle={{ fontSize: '12px', fontWeight: 900, color: '#0f172a' }}
                     formatter={(value: any, name: any) => [`KES ${Number(value).toLocaleString()}`, name === 'balance' ? 'Projected Wealth' : 'Total Contributed']}
                   />
                   <Area type="monotone" dataKey="contributions" stroke="#cbd5e1" strokeWidth={2} fillOpacity={0} />
                   <Area type="monotone" dataKey="balance" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorBalance)" />
                 </AreaChart>
              </ResponsiveContainer>
              <div className="absolute top-4 right-4 flex items-center gap-4 text-[9px] font-black uppercase tracking-widest">
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-300" /> Principal</div>
                 <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-600" /> AI Compound Growth</div>
              </div>
           </div>
           
           <div className="mt-6 flex items-start gap-4 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <BrainCircuit className="w-6 h-6 text-indigo-600 shrink-0" />
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-indigo-900 mb-1">Sentill Analyst Insight</p>
                 <p className="text-xs font-bold text-indigo-800 leading-relaxed">
                   By contributing KES {monthlyContribution.toLocaleString()} monthly over {years} years at your current blended yield of {(avgYield * 100).toFixed(1)}%, your wealth drastically outperforms inflation. The compound alpha generated purely from interest is KES {aiAlpha.toLocaleString()}.
                 </p>
              </div>
           </div>
        </div>

      </motion.div>
    </div>
  );
}
