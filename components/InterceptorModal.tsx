"use client";

import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, CheckCircle2, DollarSign, Clock } from 'lucide-react';

interface InterceptorStore {
  isOpen: boolean;
  provider: { name: string; paybill: string } | null;
  open: (name: string, paybill: string) => void;
  close: () => void;
}

export const useInterceptor = create<InterceptorStore>((set) => ({
  isOpen: false,
  provider: null,
  open: (name, paybill) => set({ isOpen: true, provider: { name, paybill } }),
  close: () => set({ isOpen: false, provider: null }),
}));

export default function InterceptorModal() {
  const { isOpen, provider, close } = useInterceptor();

  if (!isOpen || !provider) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-card max-w-lg w-full rounded-[2.5rem] overflow-hidden relative z-10"
        >
          {/* Header */}
          <div className="p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-3xl flex items-center justify-center mx-auto ring-1 ring-amber-500/50">
              <ShieldAlert className="w-10 h-10" />
            </div>
            
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-3">Institutional Interceptor</h2>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                Direct Investment Confirmation Required
              </p>
            </div>

            <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 space-y-6">
               <p className="text-xs text-slate-300 font-medium leading-relaxed">
                 Sentill Africa is a **Data Hub**, not a bank. We do not touch your capital. To invest in <span className="text-blue-600 font-black">{provider.name}</span>, you must use their verified official channels.
               </p>

                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/50 text-center">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Provider Status</span>
                     <div className="flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-black text-blue-600 uppercase tracking-widest">CMA Regulated & Verified</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-4 pt-4">
              <button 
                onClick={close}
                className="w-full py-5 bg-blue-700 text-white font-black rounded-2xl uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all border border-blue-600/50"
              >
                I Understand & Consent
              </button>
              <button 
                onClick={close}
                className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors"
              >
                Cancel Transaction
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
