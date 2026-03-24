"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Landmark, Activity, Wallet, ShieldCheck, ChevronRight, CheckCircle2, ChevronLeft, Building2, PieChart, TrendingUp } from "lucide-react";
import { logAsset } from "@/app/actions";

interface Provider {
  id: string;
  name: string;
  type: string;
  currentYield: number;
}

interface LogAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  providers: Provider[];
}

const CATEGORY_ICONS: Record<string, any> = {
  "Money Market Fund": Activity,
  "Treasury Bond": ShieldCheck,
  "NSE Equity": PieChart,
  "SACCO": Building2,
  "Pension Fund": Landmark,
  "Stock": TrendingUp
};

const getCategoryIcon = (type: string) => {
  return CATEGORY_ICONS[type] || Wallet;
};

export default function LogAssetModal({ isOpen, onClose, providers }: LogAssetModalProps) {
  // Step 1: Category, Step 2: Provider, Step 3: Amount, Step 4: Success
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Group providers by type
  const categories = useMemo(() => {
    return Array.from(new Set(providers.map(p => p.type)));
  }, [providers]);

  const filteredProviders = useMemo(() => {
    if (!selectedCategory) return [];
    return providers.filter(p => p.type === selectedCategory);
  }, [selectedCategory, providers]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSelectedCategory(null);
      setSelectedProvider(null);
      setAmount("");
    }, 300);
  };

  const handleSubmit = async () => {
    if (!selectedProvider || !amount) return;
    setLoading(true);
    const result = await logAsset(selectedProvider.id, parseFloat(amount));
    setLoading(false);
    if (result.success) {
      setStep(4); // Success step
      setTimeout(handleClose, 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                 {step > 1 && step < 4 && (
                   <button 
                     onClick={() => setStep(prev => prev - 1)}
                     className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                   >
                     <ChevronLeft className="w-5 h-5" />
                   </button>
                 )}
                 <div>
                   <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Log Wealth Marker</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                     {step === 4 ? "Transaction Verified" : 
                      step === 1 ? "Select Asset Category" : 
                      step === 2 ? `Select ${selectedCategory}` : 
                      "Log Principal Amount"}
                   </p>
                 </div>
              </div>
              <button 
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 min-h-[400px]">
              {step === 4 ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-blue-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="text-xl font-black text-slate-900 uppercase">Marker Established</h4>
                    <p className="text-sm text-slate-400 font-medium">Your portfolio has been synchronized.</p>
                  </div>
                </div>
              ) : step === 1 ? (
                <div className="grid grid-cols-2 gap-4">
                  {categories.map((cat, idx) => {
                    const Icon = getCategoryIcon(cat);
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setStep(2);
                        }}
                        className="group flex flex-col items-center gap-4 p-6 rounded-[2rem] border border-slate-100 hover:border-blue-600 hover:bg-blue-50/30 transition-all text-center"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm group-hover:bg-white group-hover:border-blue-200 transition-colors">
                          <Icon className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 uppercase tracking-widest block">{cat}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase mt-1 inline-block">View Providers</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : step === 2 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {filteredProviders.map((p) => {
                      const Icon = getCategoryIcon(p.type);
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedProvider(p);
                            setStep(3);
                          }}
                          className="group flex items-center gap-4 p-5 rounded-2xl border border-slate-100 hover:border-blue-600 hover:bg-blue-50/30 transition-all text-left"
                        >
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:border-blue-200 transition-colors shrink-0">
                            <Icon className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest block truncate">{p.name}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase truncate">{p.type} • {p.currentYield}% Yield</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shrink-0">
                        <Activity className="w-5 h-5 text-blue-600" />
                     </div>
                     <div className="min-w-0">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block truncate">Selected Provider</span>
                        <span className="text-sm font-black text-slate-900 uppercase truncate">{selectedProvider?.name}</span>
                     </div>
                     <button onClick={() => setStep(2)} className="ml-auto shrink-0 text-[9px] font-black text-blue-700 uppercase tracking-widest hover:underline">Change</button>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block px-2">Principal Amount (KES)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-6 text-4xl font-black text-slate-900 tracking-tighter focus:border-blue-600 focus:outline-none transition-all placeholder:text-slate-200"
                      />
                      <div className="absolute right-8 top-1/2 -translate-y-1/2 text-sm font-black text-slate-300 uppercase">KES</div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2 italic">
                      Projected Annual Yield: <span className="text-blue-600">KES {((parseFloat(amount || "0") * (selectedProvider?.currentYield || 0)) / 100).toLocaleString()}</span>
                    </p>
                  </div>

                  <button
                    disabled={loading || !amount}
                    onClick={handleSubmit}
                    className="w-full py-6 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-[2rem] hover:bg-blue-700 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-950/20"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Commit to Portfolio <ShieldCheck className="w-5 h-5" /></>
                    )}
                  </button>
                </div>
              )}
            </div>
            
            <div className="px-8 py-5 bg-slate-50 flex items-center justify-between border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-600" />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sentill V2.1 Trusted Channel</span>
              </div>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                Step {step === 4 ? 3 : step} of 3
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
