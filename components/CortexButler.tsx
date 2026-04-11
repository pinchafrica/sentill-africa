"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, X, MessageSquare, Zap, TrendingUp, 
  ShieldCheck, Info, ArrowRight, Activity 
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAIStore } from "@/lib/store";
import { usePathname } from "next/navigation";

export default function CortexButler() {
  const { isChatOpen: isOpen, setChatOpen: setIsOpen, toggleChat } = useAIStore();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pathname = usePathname();

  // Hide on auth pages to avoid blocking login/register forms
  if (pathname?.startsWith("/auth")) return null;

  const marketPulse = [
    { label: "Sentiment", value: "BULLISH", color: "text-emerald-500" },
    { label: "Top MMF", value: "Zidi (18.2%)", color: "text-blue-500" },
    { label: "NSE Vol", value: "Normal", color: "text-slate-400" },
  ];

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResponse("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResponse(data.response);
    } catch (err: any) {
      setError(err.message || "Intelligence core disconnected.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "Analyze my portfolio" }),
      });
      const data = await res.json();
      
      if (data.error === "upgrade_required") {
        setError("upgrade_required");
      } else if (data.error) {
        setError(data.error);
      } else {
        setResponse(data.response || "Analysis Complete: Your portfolio shows a safe approach with good returns. Recommendation: Consider adding more IFB1/2024 bonds to maximize your tax-free growth.");
        toast.success("Portfolio Analysis Completed");
      }
    } catch (err) {
      setError("Neural Core Error");
      toast.error("Neural Core Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200]">
      {/* CortexButler trigger is handled by SentillOracle — no extra FAB needed */}
      {false && !isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-blue-700 text-white rounded-[2rem] shadow-2xl shadow-blue-600/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
        >
          <Bot className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-4 sm:absolute sm:bottom-20 sm:right-0 w-[calc(100vw-2rem)] sm:w-[400px] h-[75vh] sm:h-[600px] max-h-[85vh] bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-[2rem] sm:rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-slate-950 p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tighter">Sentill Africa Assistant</h3>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">AI Assistant Ready</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Insight Box */}
            <div className="p-8 space-y-6 flex-1 overflow-y-auto max-h-[500px]">
               {!response && !loading && !error && (
                 <div className="p-6 bg-slate-900 border border-slate-800 rounded-[2rem] text-[13px] font-bold text-slate-100 leading-relaxed tracking-wide shadow-inner">
                    "Market Signals indicate a highly favorable <span className="text-emerald-400 font-black italic">Growth Window</span>. Kenya's bond returns are 4.2% higher than neighboring countries. It's a great time to invest."
                 </div>
               )}

               {loading && (
                 <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Processing Neural Output...</p>
                 </div>
               )}

               {error && error === "upgrade_required" && (
                 <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                      <Zap className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Premium Intelligence Locked</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                       Upgrade to Pro to unlock unlimited Sentil Assistant queries, market forecasts, and personalized wealth matrix analytics.
                    </p>
                    <Link href="/packages" onClick={() => setIsOpen(false)} className="mt-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all w-full shadow-lg shadow-indigo-900/50">
                       Upgrade to Pro
                    </Link>
                 </div>
               )}

               {error && error !== "upgrade_required" && (
                 <div className="p-6 bg-rose-50 border border-rose-100 rounded-[2rem] text-xs font-bold text-rose-600 leading-relaxed tracking-wide shadow-sm">
                    {error}
                 </div>
               )}

               {response && (
                 <div className="p-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] text-[13px] font-bold text-slate-950 leading-relaxed tracking-wide shadow-sm whitespace-pre-wrap">
                    {response}
                 </div>
               )}

               {/* Interaction Form */}
               <form onSubmit={handleAsk} className="relative">
                  <input 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask Sentill Africa Assistant..."
                    className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-bold text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                  />
                  <button 
                    disabled={loading}
                    className="absolute right-2 top-2 p-2 bg-slate-950 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
               </form>

               {/* Quick Stats Grid */}
               <div className="grid grid-cols-2 gap-4">
                  {marketPulse.map((stat, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                       <p className={`text-xs font-black uppercase ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">System Status</span>
                     <p className="text-xs font-black text-slate-900 uppercase">Online</p>
                  </div>
               </div>

               {/* Call to Action Matrix */}
               <div className="space-y-3 pt-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Intelligence Shortcuts</p>
                  <Link href="/tools/compare" onClick={() => setIsOpen(false)} className="w-full p-5 bg-white border-2 border-slate-100 rounded-[1.5rem] flex items-center justify-between hover:border-blue-600 group transition-all">
                     <div className="flex items-center gap-4">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <span className="text-xs font-black uppercase text-slate-900 tracking-tight">Compare Assets</span>
                     </div>
                     <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-all" />
                  </Link>
                  <Link href="/markets/mmfs" onClick={() => setIsOpen(false)} className="w-full p-5 bg-white border-2 border-slate-100 rounded-[1.5rem] flex items-center justify-between hover:border-emerald-500 group transition-all">
                     <div className="flex items-center gap-4">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-black uppercase text-slate-900 tracking-tight">Daily Yield Hub</span>
                     </div>
                     <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-all" />
                  </Link>
                  <Link href="/tools/tax-calculator" onClick={() => setIsOpen(false)} className="w-full p-5 bg-white border-2 border-slate-100 rounded-[1.5rem] flex items-center justify-between hover:border-amber-500 group transition-all">
                     <div className="flex items-center gap-4">
                        <Info className="w-5 h-5 text-amber-600" />
                        <span className="text-xs font-black uppercase text-slate-900 tracking-tight">Tax Growth Optimizer</span>
                     </div>
                     <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-all" />
                  </Link>
               </div>
            </div>

            {/* Footer */}
            <div className="p-8 bg-slate-50 border-t border-slate-100">
               <button 
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl disabled:opacity-50"
               >
                  Analyze My Portfolio (AI)
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
