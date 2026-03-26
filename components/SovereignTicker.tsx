"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Landmark, TrendingUp, ArrowRightLeft, Zap, Phone } from "lucide-react";

export default function SovereignTicker() {
  const [tickerData, setTickerData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/market/nse").then(r => r.json()).then(data => {
      if (data.stocks) {
        const mapped = data.stocks.slice(0, 10).map((s: any) => ({
          label: s.symbol,
          value: s.price.toString(),
          change: s.percent + "%",
          up: s.change >= 0,
          icon: s.symbol === 'SCOM' ? Zap : Landmark
        }));
        setTickerData(mapped);
      }
    }).catch(() => {});
  }, []);

  const dataToDisplay = tickerData.length > 0 ? tickerData : [
    { label: "IFB1/2024 Yield", value: "18.46%", change: "+0.15%", up: true, icon: Landmark },
    { label: "91-Day T-Bill", value: "15.85%", change: "-0.02%", up: false, icon: Zap },
    { label: "KES/USD Spot", value: "129.50", change: "+0.12%", up: true, icon: ArrowRightLeft },
    { label: "NSE-20 Share Index", value: "1,745.20", change: "+0.45%", up: true, icon: TrendingUp },
    { label: "MMF Average Yield", value: "15.92%", change: "+0.03%", up: true, icon: TrendingUp },
  ];
  return (
    <div className="fixed top-0 left-0 w-full z-[100] h-9 bg-slate-950/80 backdrop-blur-md border-b border-white/5 flex items-center overflow-hidden">
      {/* Left: phone */}
      <a href="tel:+254706206160" className="absolute left-0 z-20 flex items-center gap-1.5 px-3 h-full bg-slate-950 border-r border-white/10 hover:bg-slate-800 transition-colors shrink-0">
        <Phone className="w-2.5 h-2.5 text-blue-500" />
        <span className="text-[9px] font-black text-slate-300 tracking-widest uppercase whitespace-nowrap">+254 706 206 160</span>
      </a>

      {/* Scrolling ticker */}
      <div className="absolute left-[140px] right-[200px] top-0 h-full overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-12 px-4 h-full whitespace-nowrap absolute"
        >
          {[...dataToDisplay, ...dataToDisplay].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
               <div className="flex items-center gap-1.5">
                  <item.icon className="w-3 h-3 text-blue-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
               </div>
               <span className="text-[10px] font-black text-white tracking-widest">{item.value}</span>
               <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${item.up ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {item.change}
               </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right: Pinch Africa credit */}
      <a href="https://www.pinch.africa" target="_blank" rel="noopener noreferrer" className="absolute right-0 z-20 flex items-center gap-1.5 px-3 h-full bg-slate-950 border-l border-white/10 hover:bg-slate-800 transition-colors shrink-0">
        <span className="text-[9px] font-black text-slate-500 tracking-widest uppercase whitespace-nowrap">By </span>
        <span className="text-[9px] font-black text-blue-500 tracking-widest uppercase whitespace-nowrap hover:text-blue-400">Pinch Africa</span>
      </a>
    </div>
  );
}
