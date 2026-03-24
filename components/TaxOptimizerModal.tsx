"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HandCoins, Info, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useAIStore } from "@/lib/store";
import TaxAlphaOptimizer from "./TaxAlphaOptimizer";

export default function TaxOptimizerModal() {
  const { isTaxOptimizerOpen, setTaxOptimizerOpen } = useAIStore();
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    if (isTaxOptimizerOpen) {
      fetch("/api/portfolio/assets")
        .then(r => r.json())
        .then(d => setAssets(Array.isArray(d) ? d : []))
        .catch(console.error);
    }
  }, [isTaxOptimizerOpen]);

  // Calculations
  const mmfs = assets.filter(a => a.type === 'MONEY_MARKET' || a.category === 'Money Market' || a.name?.toLowerCase().includes('mmf'));
  const totalMMF = mmfs.reduce((acc, curr) => acc + (curr.principal || 0), 0);
  const avgMMFYield = mmfs.length > 0 ? (mmfs.reduce((acc, curr) => acc + (curr.projectedYield || 0.15), 0) / mmfs.length) * 100 : 16.5;

  const rebalanceAmount = totalMMF * 0.3; // Recommend moving 30%
  const currentNetYield = (avgMMFYield / 100) * 0.85; 
  const ifbYield = 0.185; // Example 18.5% tax-free IFB
  const yieldDiff = ifbYield - currentNetYield;
  const additionalGain = rebalanceAmount * yieldDiff;

  if (!isTaxOptimizerOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setTaxOptimizerOpen(false)}
          className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white border border-slate-200 shadow-2xl rounded-[3rem] overflow-hidden"
        >
          <div className="flex justify-between items-center px-10 pt-10 pb-6 border-b border-slate-50">
            <div>
              <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tighter">Tax Alpha Optimizer</h2>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2 flex items-center gap-2">
                 <ShieldCheck className="w-3 h-3" /> Institutional Net Yield Simulation
              </p>
            </div>
            <button 
              onClick={() => setTaxOptimizerOpen(false)}
              className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-100 text-slate-400 transition-colors border border-slate-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-10 space-y-8">
             <div className="grid md:grid-cols-2 gap-8">
                <TaxAlphaOptimizer yieldRate={avgMMFYield} taxCategory="WHT_15" />
                <div className="space-y-6">
                   <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100 space-y-4">
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-blue-700">Sentill Projection</h4>
                      <p className="text-xl font-bold text-slate-900 leading-tight">
                         {totalMMF > 0 
                           ? `"Based on your KES ${totalMMF.toLocaleString()} in Money Markets, rebalancing 30% into tax-free Infrastructure Bonds (IFB) could gain you an additional `
                           : `"By moving 30% of standard savings into Infrastructure Bonds (IFB), you could gain an additional `}
                         <span className="text-blue-600">KES {totalMMF > 0 ? additionalGain.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "14,200"}</span> in net annual interest."
                      </p>
                   </div>
                   <button className="w-full py-5 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl">
                      Apply Strategic Rebalance <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
