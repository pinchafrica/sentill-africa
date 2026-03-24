"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, Info, ChevronRight, Scale, PieChart, InfoIcon } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";
import Link from "next/link";

export default function TaxCalculatorPage() {
  const [principal, setPrincipal] = useState<number>(500000);
  const [years, setYears] = useState<number>(5);
  
  // Asset A (e.g. MMF at 16% Gross, 15% WHT -> 13.6% Net)
  const [rateA, setRateA] = useState<number>(16);
  const [taxA, setTaxA] = useState<number>(15);

  // Asset B (e.g. IFB at 16% Gross, 0% Tax -> 16% Net)
  const [rateB, setRateB] = useState<number>(16);
  const [taxB, setTaxB] = useState<number>(0);

  // Math logic
  const netRateA = rateA * (1 - taxA / 100);
  const netRateB = rateB * (1 - taxB / 100);

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 0; i <= years; i++) {
        // Compound interest: A = P(1 + r/n)^(nt)
        // Simplified to annual compounding for visualization
        const valueA = principal * Math.pow(1 + netRateA / 100, i);
        const valueB = principal * Math.pow(1 + netRateB / 100, i);
        data.push({
            year: `Year ${i}`,
            assetA: Math.round(valueA),
            assetB: Math.round(valueB),
            alpha: Math.round(valueB - valueA)
        });
    }
    return data;
  }, [principal, years, netRateA, netRateB]);

  const finalA = chartData[chartData.length - 1]?.assetA || 0;
  const finalB = chartData[chartData.length - 1]?.assetB || 0;
  const taxAlpha = finalB - finalA;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* ─── HEADER ROW ───────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Tax Alpha Engine</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Quantify the compounding effect of KRA Withholding Tax
          </p>
        </div>
        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-black uppercase tracking-widest transition-colors w-fit">
           Back to Dashboard
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* ─── INPUT PANEL (Left 4 Cols) ──────────────────────────────── */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Calculator className="w-4 h-4 text-blue-600" /> Investment Variables
              </h3>

              <div className="space-y-5">
                 {/* Principal & Time */}
                 <div className="space-y-4 pb-5 border-b border-slate-100">
                    <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Initial Capital (KES)</label>
                       <input 
                          type="number" 
                          value={principal} 
                          onChange={e => setPrincipal(Number(e.target.value))}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                       />
                    </div>
                    <div>
                       <div className="flex justify-between items-center mb-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Horizon</label>
                         <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{years} Years</span>
                       </div>
                       <input 
                          type="range" 
                          min="1" max="25" 
                          value={years} 
                          onChange={e => setYears(Number(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                       />
                    </div>
                 </div>

                 {/* Asset A (Taxed) */}
                 <div className="space-y-4 pb-5 border-b border-slate-100">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-slate-800" /> Asset A (Taxable - e.g. MMF)
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                       <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Gross Yield (%)</label>
                          <input type="number" value={rateA} onChange={e => setRateA(Number(e.target.value))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900" />
                       </div>
                       <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">KRA WHT (%)</label>
                          <input type="number" value={taxA} onChange={e => setTaxA(Number(e.target.value))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900" />
                       </div>
                    </div>
                 </div>

                 {/* Asset B (Tax-Free) */}
                 <div className="space-y-4">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500" /> Asset B (Tax-Free - e.g. IFB)
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                       <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Gross Yield (%)</label>
                          <input type="number" value={rateB} onChange={e => setRateB(Number(e.target.value))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900" />
                       </div>
                       <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">KRA WHT (%)</label>
                          <input type="number" value={taxB} onChange={e => setTaxB(Number(e.target.value))} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 disabled:opacity-50" disabled />
                       </div>
                    </div>
                 </div>

              </div>
           </div>

           {/* Info Widget */}
           <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex gap-3 shadow-sm">
             <InfoIcon className="w-5 h-5 text-blue-500 shrink-0" />
             <div>
               <h5 className="text-[10px] font-black tracking-widest uppercase text-blue-900 mb-1">What is Tax Alpha?</h5>
               <p className="text-[10px] font-medium text-blue-800/80 leading-relaxed">
                 Tax Alpha is the additional return generated purely by investing in tax-advantaged structures (like Infrastructure Bonds) versus standard taxed accounts (like Money Market Funds).
               </p>
             </div>
           </div>
        </div>

        {/* ─── OUTPUT VISUALIZATION (Right 8 Cols) ────────────────────── */}
        <div className="lg:col-span-8 space-y-6">
           
           {/* Metric Cards Top */}
           <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-800">
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex justify-between">
                    Asset A Final <span className="text-slate-500">Net {netRateA.toFixed(1)}%</span>
                 </div>
                 <div className="text-xl sm:text-2xl font-black text-white tracking-tighter">
                   KES {(finalA).toLocaleString()}
                 </div>
              </div>
              <div className="bg-emerald-900 rounded-2xl p-5 shadow-lg border border-emerald-800">
                 <div className="text-[10px] font-black text-emerald-400/80 uppercase tracking-widest mb-1 flex justify-between">
                    Asset B Final <span className="text-emerald-500/50">Net {netRateB.toFixed(1)}%</span>
                 </div>
                 <div className="text-xl sm:text-2xl font-black text-emerald-50 tracking-tighter">
                   KES {(finalB).toLocaleString()}
                 </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-200 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 blur-2xl rounded-full" />
                 <div className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1 relative z-10">
                    The Tax Alpha (Difference)
                 </div>
                 <div className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tighter relative z-10">
                   + KES {taxAlpha > 0 ? taxAlpha.toLocaleString() : "0"}
                 </div>
              </div>
           </div>

           {/* Core Charting */}
           <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm min-h-[400px] flex flex-col">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <TrendingUp className="w-4 h-4 text-emerald-500" /> Compounding Trajectory
              </h3>
              
              <div className="flex-1 w-full min-h-[350px]">
                 <ResponsiveContainer width="100%" minWidth={1} height="100%">
                   <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#1e293b" stopOpacity={0.1}/>
                         <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                         <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis 
                        dataKey="year" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                        dy={10} 
                        minTickGap={20}
                     />
                     <YAxis 
                        tickFormatter={(val) => `KES ${(val / 1000000).toFixed(1)}M`} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                     />
                     <Tooltip 
                        formatter={(value: any, name: any) => [
                          `KES ${Number(value).toLocaleString()}`, 
                          name === 'assetA' ? 'Asset A (Taxed)' : name === 'assetB' ? 'Asset B (Tax-Free)' : 'Tax Alpha Spread'
                        ]}
                        labelStyle={{ color: '#0f172a', fontWeight: 'bold', fontSize: '12px' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                     />
                     <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }} />
                     
                     <Area type="monotone" dataKey="assetA" name="Asset A (Taxed)" stroke="#1e293b" strokeWidth={3} fillOpacity={1} fill="url(#colorA)" />
                     <Area type="monotone" dataKey="assetB" name="Asset B (Tax-Free)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorB)" />
                   </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
