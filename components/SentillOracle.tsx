"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Zap, Activity, Calculator, CalendarDays, X, Sparkles, Brain, TrendingUp, BarChart3 } from "lucide-react";
import Link from "next/link";

const ORACLE_BALLOONS = [
  { id: "mmf", title: "Best MMF Rates", desc: "Live yields updated daily", icon: TrendingUp, color: "from-emerald-500 to-emerald-600", href: "/markets/mmfs" },
  { id: "nse", title: "Top Stock Picks", desc: "AI-powered NSE signals", icon: Activity, color: "from-blue-500 to-blue-600", href: "/markets/nse" },
  { id: "tax", title: "Tax Calculator", desc: "KRA withholding optimizer", icon: Calculator, color: "from-amber-500 to-orange-500", href: "/tools/tax-calculator" },
  { id: "div", title: "SACCO Intelligence", desc: "Audit & dividend data", icon: CalendarDays, color: "from-rose-500 to-pink-500", href: "/markets/saccos" },
  { id: "bonds", title: "Bond Yields", desc: "IFB & T-Bill rates", icon: BarChart3, color: "from-indigo-500 to-violet-500", href: "/markets/bonds" },
];

export default function SentillOracle() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col items-start gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-slate-950 border border-white/10 rounded-[1.5rem] shadow-2xl shadow-blue-900/30 overflow-hidden w-[280px] backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm uppercase tracking-tight">Sentill Oracle</p>
                    <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">Quick Intelligence</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-3 space-y-1.5">
              {ORACLE_BALLOONS.map((balloon, idx) => (
                <motion.div
                  key={balloon.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                >
                  <Link
                    href={balloon.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
                  >
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${balloon.color} flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <balloon.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-white uppercase tracking-wider truncate">{balloon.title}</p>
                      <p className="text-[9px] text-slate-500 font-bold truncate">{balloon.desc}</p>
                    </div>
                    <svg className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 pt-0">
              <Link
                href="/dashboard/advisor"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/30"
              >
                <Brain className="w-3.5 h-3.5" />
                Ask Oracle AI
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Oracle FAB Button - LEFT SIDE */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.25)] flex items-center justify-center relative overflow-hidden group"
      >
        {/* Inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 group-hover:from-blue-500/30 group-hover:to-indigo-500/20 transition-all" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent opacity-60 animate-pulse" />

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6 text-white relative z-10" />
            </motion.div>
          ) : (
            <motion.div key="oracle" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="relative z-10 flex flex-col items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-400 mb-0.5" />
              <span className="text-[7px] font-black uppercase tracking-[0.15em] text-white/90">Oracle</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glowing ring animation */}
        {!isOpen && (
          <div className="absolute inset-0 border-2 border-blue-500/40 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
        )}
      </motion.button>
    </div>
  );
}
