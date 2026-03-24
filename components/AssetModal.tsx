"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, TrendingUp, Shield, Plus, ArrowRight, Landmark, Users, ChevronRight, CheckCircle2, Globe, Activity, Zap } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { PORTFOLIOS } from "@/lib/portfolios";

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledAsset?: string;
}

type AssetClass = 'mmf' | 'stocks' | 'bonds' | 'saccos' | 'pension' | 'land' | 'global' | 'agri' | 'commodities' | 'special';

export default function AssetModal({ isOpen, onClose, prefilledAsset }: AssetModalProps) {
  const [assetClass, setAssetClass] = useState<AssetClass>('mmf');
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter portfolios based on category
  const currentOptions = PORTFOLIOS.filter(p => p.category === assetClass);
  
  useEffect(() => {
    if (prefilledAsset) {
      const found = PORTFOLIOS.find(a => a.id.toLowerCase() === prefilledAsset.toLowerCase());
      if (found) {
        setAssetClass(found.category as AssetClass);
        setSelectedAssetId(found.id);
      }
    }
  }, [prefilledAsset, isOpen]);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        <motion.div 
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-white sm:rounded-[2.5rem] rounded-t-[2.5rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-8 pt-8 pb-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Add Money</h2>
              <p className="text-sm font-bold text-slate-500 mt-1">What did you invest in?</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 space-y-8 overflow-y-auto">
            
            {/* Asset Categories */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-2">Category</label>
              <div className="grid grid-cols-3 gap-2">
                 {[
                   { id: 'mmf', label: 'Savings', icon: Shield },
                   { id: 'bonds', label: 'Govt Bonds', icon: Landmark },
                   { id: 'stocks', label: 'Stocks', icon: TrendingUp },
                   { id: 'saccos', label: 'SACCOs', icon: Building2 },
                   { id: 'pension', label: 'Pension', icon: Users },
                   { id: 'global', label: 'Global', icon: Globe },
                   { id: 'agri', label: 'Agri', icon: Activity },
                   { id: 'commodities', label: 'Commodities', icon: Activity },
                   { id: 'special', label: 'Special', icon: Zap },
                 ].map((cat) => (
                   <button
                     key={cat.id}
                     onClick={() => { setAssetClass(cat.id as any); setSelectedAssetId(""); }}
                     className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all ${
                       assetClass === cat.id 
                         ? "border-blue-600 bg-blue-50 text-blue-700" 
                         : "border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50"
                     }`}
                   >
                     <cat.icon className={`w-5 h-5 ${assetClass === cat.id ? "text-blue-600" : "text-slate-400"}`} />
                     <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                   </button>
                 ))}
              </div>
            </div>

            {/* Which specific one */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-2">Which exactly?</label>
              <div className="relative">
                <select 
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold text-base focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select an option...</option>
                  {currentOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name} — {opt.yield || opt.manager}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   <ChevronRight className="w-5 h-5 rotate-90" />
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-2">
                 {assetClass === 'stocks' ? 'How many shares?' : 'How much? (KES)'}
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={assetClass === 'stocks' ? "e.g. 500" : "e.g. 100000"}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-5 text-slate-900 font-black text-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-8 border-t border-slate-100 bg-white">
            <button 
              disabled={!selectedAssetId || !amount || isLoading}
              onClick={async () => {
                setIsLoading(true);
                try {
                  const res = await fetch("/api/portfolio/assets", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ assetId: selectedAssetId, amount }),
                  });

                  if (!res.ok) throw new Error("Failed to save");

                  toast.success("Saved Successfully!", {
                    icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  });
                  onClose();
                  window.location.reload(); 
                } catch (err: any) {
                  toast.error("Could not save", { description: "Please try again later." });
                } finally {
                  setIsLoading(false);
                }
              }}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              ) : (
                <>Save Investment <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
            <button 
              onClick={onClose}
              className="w-full mt-4 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
