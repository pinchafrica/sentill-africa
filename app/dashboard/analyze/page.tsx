"use client";

import { useState } from "react";
import { Search, Calculator, Sparkles, TrendingUp, Shield, BarChart3, ArrowRight, Wallet, PieChart, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIStore } from "@/lib/store";
import { toast } from "sonner";

export default function AIAdvisorPage() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setTaxOptimizerOpen, setChatOpen } = useAIStore();

  const handleAction = (name: string) => {
    if (name === "Tax Savings Estimator") setTaxOptimizerOpen(true);
    else if (name === "Compound Interest Calculator" || name === "Retirement Planner") window.dispatchEvent(new Event("open-wealth-predictor"));
    else if (name === "Risk Profiler") window.dispatchEvent(new Event("open-risk-profiler"));
    else toast.success("AI Tool initializing...");
  };

  const handleSearch = async (forcedQuery?: string) => {
    const q = forcedQuery || query;
    if (!q) return;

    setIsLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (data.error && data.error === "upgrade_required") {
         setResponse("### ⚡ Premium Intelligence Locked\nUpgrade to Pro to unlock unlimited Sentil Assistant queries, deeper market forecasts, and personalized wealth matrix analytics.");
      } else if (data.error) {
         setResponse(data.error);
      } else {
         setResponse(data.response);
      }
    } catch (err) {
      setResponse("### Neural Core Error\nThe local AI matrix is temporarily offline.");
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedSearches = [
    "Predict my wealth in 5 years",
    "Should I buy Safaricom stocks today?",
    "Find safe MMFs above 15% return",
    "Calculate my tax savings on IFBs",
    "Compare KCB vs Equity Group"
  ];

  const tools = [
    { name: "Compound Interest Calculator", icon: Calculator, color: "text-blue-500", bg: "bg-blue-50" },
    { name: "Tax Savings Estimator", icon: Shield, color: "text-emerald-500", bg: "bg-emerald-50" },
    { name: "Retirement Planner", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" },
    { name: "Risk Profiler", icon: BarChart3, color: "text-amber-500", bg: "bg-amber-50" }
  ];

  const collections = [
    { title: "Safest Growth", desc: "Low risk, guaranteed returns (Govt Bonds & MMFs)", icon: Shield, count: 12 },
    { title: "High-Risk Movers", desc: "Tech & Banking stocks with massive upside potential", icon: Sparkles, count: 8 },
    { title: "Halal Investments", desc: "100% Shariah-compliant funds and Sukuks", icon: Wallet, count: 4 },
    { title: "Diaspora Favorites", desc: "Top picks for zero-fee KES remittance growth", icon: PieChart, count: 6 }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pt-32 pb-20 px-4 md:px-10">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Giant Search Area */}
        <div className="text-center space-y-8 mt-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Sentill AI Advisor
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter capitalize leading-tight">
              What do you want to <br className="hidden md:block" /> know about your money?
            </h1>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative max-w-2xl mx-auto z-10">
            <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-full pointer-events-none" />
            <div className="relative flex items-center bg-white border-2 border-slate-200 rounded-full shadow-lg overflow-hidden group focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all">
              <Search className="w-6 h-6 text-slate-400 ml-6 shrink-0 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                placeholder="Ask me to analyze a stock, calculate returns, or suggest safe investments..."
                className="w-full bg-transparent border-none py-6 pl-4 pr-6 text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-0 text-sm md:text-base tracking-wide"
                disabled={isLoading}
              />
              <button onClick={() => handleSearch()} disabled={isLoading} className="mr-3 px-6 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-full text-xs font-black uppercase tracking-widest transition-all shrink-0 shadow-md flex items-center gap-2 disabled:opacity-50">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Ask AI <ArrowRight className="w-4 h-4 hidden sm:block" /></>}
              </button>
            </div>
          </motion.div>

          {/* AI Response Block */}
          <AnimatePresence>
             {(isLoading || response) && (
                <motion.div 
                   initial={{ opacity: 0, height: 0, y: -20 }}
                   animate={{ opacity: 1, height: "auto", y: 0 }}
                   exit={{ opacity: 0, height: 0, y: -20 }}
                   className="max-w-2xl mx-auto overflow-hidden text-left"
                >
                   <div className="bg-slate-950 p-8 rounded-[2rem] shadow-2xl relative border border-slate-800">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                         <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Sparkles className="w-4 h-4 text-white" />
                         </div>
                         <h3 className="text-sm font-black text-white uppercase tracking-widest">Sentill Intelligence</h3>
                      </div>
                      
                      {isLoading && !response && (
                         <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Running institutional models...</span>
                         </div>
                      )}
                      
                      {response && (
                         <div className="text-slate-300 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                            {response}
                         </div>
                      )}
                   </div>
                </motion.div>
             )}
          </AnimatePresence>

          {/* Quick Indicators / Chips */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
             {suggestedSearches.map((search, i) => (
                <button 
                   key={i} 
                   onClick={() => { setQuery(search); handleSearch(search); }} 
                   className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 uppercase tracking-wider hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all shadow-sm"
                >
                   {search}
                </button>
             ))}
          </motion.div>
        </div>

        {/* Quick Calculators Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Helpful Calculators</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tools.map((tool, i) => (
              <button key={i} onClick={() => handleAction(tool.name)} className="bg-white border border-slate-200 p-6 rounded-[2rem] text-center hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col items-center gap-4">
                <div className={`w-14 h-14 ${tool.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <tool.icon className={`w-6 h-6 ${tool.color}`} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{tool.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Categorized Portfolios */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Curated Investment Collections</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {collections.map((col, i) => (
              <div key={i} className="bg-white border border-slate-200 p-6 rounded-[2rem] hover:shadow-lg transition-all cursor-pointer group flex items-start gap-5">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors shrink-0">
                  <col.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-1 flex items-center gap-2">
                    {col.title} <span className="bg-slate-100 text-slate-500 text-[9px] px-2 py-0.5 rounded-full">{col.count} Assets</span>
                  </h4>
                  <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{col.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
