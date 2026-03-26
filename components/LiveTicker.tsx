"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Sparkles, Zap } from "lucide-react";

export default function LiveTicker() {
  const [rates, setRates] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/market/nse").then(r => r.json()).then(data => {
      if (data.stocks) {
        setRates(data.stocks.map((s: any) => ({
          symbol: s.symbol,
          price: s.price,
          change: s.change,
          percent: s.percent,
          isUp: s.change >= 0
        })));
      }
    }).catch(() => {});
  }, []);

  const tickerItems = rates.length > 0 ? rates : [
    { symbol: "SCOM", price: 30.60, change: 0.15, percent: 0.49, isUp: true },
    { symbol: "EQTY", price: 77.00, change: -0.50, percent: -0.64, isUp: false },
    { symbol: "KCB", price: 42.15, change: 0.85, percent: 2.06, isUp: true },
    { symbol: "EABL", price: 145.50, change: -1.25, percent: -0.85, isUp: false },
    { symbol: "ETICA", price: "17.55%", change: 0.05, percent: 0.28, isUp: true },
    { symbol: "LOFTY", price: "17.50%", change: 0.10, percent: 0.57, isUp: true },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 h-[40px] bg-slate-950 z-[100] flex items-center overflow-hidden border-b border-slate-800">
      <div className="bg-blue-600 h-full px-4 flex items-center gap-2 shrink-0 relative z-20 shadow-[10px_0_20px_rgba(0,0,0,0.5)]">
        <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
        <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">Live AI Terminal</span>
      </div>
      
      <div className="flex-1 relative overflow-hidden h-full flex items-center">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="flex items-center gap-12 whitespace-nowrap px-12"
        >
          {/* Double the list for infinite seamless scroll */}
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div key={i} className="flex items-center gap-3 group cursor-default">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">
                {item.symbol}
              </span>
              <span className="text-[11px] font-black text-white">
                {typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
              </span>
              <div className={`flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded ${item.isUp ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
                {item.isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                {item.percent}%
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="hidden md:flex items-center gap-4 px-6 h-full bg-slate-950 border-l border-slate-800 relative z-20">
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Market Open</span>
         </div>
         <div className="h-4 w-px bg-slate-800" />
         <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
            <Zap className="w-3 h-3" /> High Yield Alert
         </span>
      </div>
    </div>
  );
}
