"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Zap, Activity, Calculator, CalendarDays, ChevronUp, X, Sparkles } from "lucide-react";
import Link from "next/link";

const ORACLE_BALLOONS = [
  { id: "mmf", title: "Best MMF Rates", icon: Zap, color: "bg-emerald-500", href: "/markets/mmfs" },
  { id: "nse", title: "Top Stock Picks", icon: Activity, color: "bg-blue-500", href: "/markets/nse" },
  { id: "tax", title: "Tax Calculator", icon: Calculator, color: "bg-amber-500", href: "/tools/tax-calculator" },
  { id: "div", title: "Next Dividend Dates", icon: CalendarDays, color: "bg-rose-500", href: "/markets/saccos" },
];

export default function SentillOracle() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="flex flex-col gap-3"
          >
            {ORACLE_BALLOONS.map((balloon, idx) => (
              <motion.div
                key={balloon.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={balloon.href} className="flex items-center gap-3 pr-2 pl-4 py-2 bg-slate-900 border border-slate-700 rounded-full shadow-2xl hover:bg-slate-800 transition-colors group">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap">
                    {balloon.title}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${balloon.color}`}>
                    <balloon.icon className="w-4 h-4 text-white" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-16 h-16 rounded-full bg-slate-950 border-2 border-slate-800 shadow-[0_0_30px_rgba(59,130,246,0.3)] flex items-center justify-center relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors" />
        <div className="w-full h-full absolute top-0 left-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent opacity-50 animate-pulse" />
        
        {isOpen ? (
          <X className="w-6 h-6 text-white relative z-10" />
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-400 mb-0.5" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">Oracle</span>
          </div>
        )}
        
        {/* Glowing ring animation */}
        {!isOpen && (
          <div className="absolute inset-0 border-2 border-blue-500/50 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
        )}
      </motion.button>
    </div>
  );
}
