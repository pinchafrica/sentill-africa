"use client";

import { HandCoins, Info, HandHelping } from "lucide-react";

interface TaxAlphaOptimizerProps {
  yieldRate: number;
  taxCategory: string; // WHT_15, WHT_10, WHT_5
}

export default function TaxAlphaOptimizer({ yieldRate, taxCategory }: TaxAlphaOptimizerProps) {
  const getTaxRate = () => {
    switch (taxCategory) {
      case "WHT_15": return 15;
      case "WHT_10": return 10;
      case "WHT_5": return 5;
      default: return 15;
    }
  };

  const taxRate = getTaxRate();
  const taxLoses = (yieldRate * taxRate) / 100;
  const netYield = yieldRate - taxLoses;

  return (
    <div className="bg-slate-900 rounded-[2rem] p-8 border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -z-10 group-hover:bg-blue-600/20 transition-colors" />
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 rounded-xl">
            <HandCoins className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-[10px]">Tax Growth Analyzer</h4>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">KRA Net-Yield Logic</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-blue-600/10 border border-blue-600/20 rounded-full text-[10px] font-black text-blue-500 uppercase tracking-widest animate-pulse">
          Optimization Active
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Gross Yield</span>
            <span className="text-2xl font-black text-white">{yieldRate.toFixed(2)}%</span>
        </div>
        <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">WHT Rate</span>
            <span className="text-2xl font-black text-rose-400">{taxRate}%</span>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Effective Net Yield</span>
           <span className="text-3xl font-black text-blue-500 font-heading">{netYield.toFixed(2)}%</span>
        </div>
        
        {/* Progress Bar for Leakage */}
        <div className="space-y-2">
            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                <span className="text-slate-500">Capital Efficiency</span>
                <span className="text-blue-600">{100 - taxRate}% Retained</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                   style={{ width: `${100 - taxRate}%` }} 
                />
            </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-white/5 flex items-start gap-3">
         <Info className="w-4 h-4 text-slate-500 mt-0.5" />
         <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">
           Tax Growth is the value created by managing investment taxes. Sentill calculates your Wittholding Tax (WHT) in real-time based on KRA 2024 regulations.
         </p>
      </div>
    </div>
  );
}
