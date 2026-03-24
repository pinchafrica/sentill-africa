"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";

interface QuickLogAssetProps {
  assetId: string;
  assetName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function QuickLogAsset({ assetId, assetName, onClose, onSuccess }: QuickLogAssetProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLog = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Invalid Amount", { description: "Please enter a valid principal capital." });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/portfolio/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId, amount }),
      });

      if (!res.ok) throw new Error("Synchronization failed");

      setIsSuccess(true);
      toast.success("Position Synchronized", {
        description: `${assetName} has been added to your Goal-Based Matrix.`,
      });
      
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err: any) {
      toast.error("Logging failed", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 pt-6 border-t border-slate-100 overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Principal Capital (KES)
              </label>
              <button 
                onClick={onClose}
                className="text-[9px] font-black text-slate-400 hover:text-slate-900 uppercase"
              >
                Cancel
              </button>
            </div>
            
            <div className="relative group">
              <input
                autoFocus
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLog()}
                placeholder="e.g. 50,000"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-950 font-black text-xl placeholder:text-slate-200 focus:outline-none focus:border-blue-600 transition-all"
                disabled={isLoading}
              />
              <button
                onClick={handleLog}
                disabled={isLoading || !amount}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-950 text-white rounded-xl flex items-center justify-center hover:bg-blue-600 disabled:opacity-20 transition-all font-black shadow-lg active:scale-95"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 px-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Aggressive Auto-Sync Active
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-4 bg-emerald-50 rounded-2xl border border-emerald-100"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-2 animate-bounce" />
            <h4 className="text-xs font-black text-emerald-950 uppercase tracking-tighter">Synchronized Successfully</h4>
            <p className="text-[9px] font-bold text-emerald-600 uppercase mt-1">Institutional data ledger updated</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
