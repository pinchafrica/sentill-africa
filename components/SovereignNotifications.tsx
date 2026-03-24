"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, ShieldCheck, X, Bot, ArrowRight } from "lucide-react";
import { useAIStore } from "@/lib/store";

export default function SovereignNotifications() {
  const [show, setShow] = useState(false);
  const { setChatOpen } = useAIStore();

  useEffect(() => {
    // Re-enabling the notification pulse for launch
    const timer = setTimeout(() => setShow(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          className="fixed bottom-8 right-32 z-[300] w-[320px] bg-[#25D366] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#075E54] p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                 <Bot className="w-4 h-4" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest leading-none">Sentil AI</p>
                 <p className="text-[9px] font-medium opacity-70">Market Briefing</p>
              </div>
            </div>
            <button onClick={() => setShow(false)} className="opacity-70 hover:opacity-100">
               <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 bg-[#F0F2F5]">
             <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm relative">
                <div className="absolute top-0 -left-2 w-4 h-4 bg-white clip-path-whatsapp-tail" />
                <p className="text-[11px] font-bold text-slate-800 leading-relaxed">
                   "Market Alert: IFB1/2024 bond returns have reached 18.5%. This is an <span className="text-emerald-600">OPTIMAL</span> time to invest."
                </p>
                <div className="flex justify-end mt-1">
                   <span className="text-[9px] text-slate-400 font-bold">12:45 PM ✓✓</span>
                </div>
             </div>

             <button 
                onClick={() => {
                  setShow(false);
                  setChatOpen(true);
                }}
                className="w-full py-3 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-colors"
             >
                View Analysis <ArrowRight className="w-3.5 h-3.5" />
             </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
