"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Landmark, TrendingUp, ArrowRightLeft, Zap, Phone,
  BookOpen, Scale, Users, Target, ChevronDown, ChevronRight
} from "lucide-react";

const RESEARCH_LINKS = [
  { label: "Best MMFs 2026",        href: "/blog/best-money-market-funds-kenya-2026", icon: TrendingUp,  color: "text-emerald-400" },
  { label: "Buy T-Bills Guide",     href: "/blog/treasury-bills-kenya-guide",          icon: Landmark,    color: "text-blue-400"    },
  { label: "MMF vs Bonds",          href: "/blog/mmf-vs-bonds-kenya",                  icon: Scale,       color: "text-violet-400"  },
  { label: "Best SACCOs 2026",      href: "/blog/best-saccos-kenya-2026",              icon: Users,       color: "text-amber-400"   },
  { label: "Invest KES 50K",        href: "/blog/how-to-invest-50000-kenya",           icon: Target,      color: "text-rose-400"    },
  { label: "All Articles →",        href: "/blog",                                      icon: BookOpen,    color: "text-slate-400"   },
];

export default function SovereignTicker() {
  const [tickerData, setTickerData] = useState<any[]>([]);
  const [researchOpen, setResearchOpen] = useState(false);

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
    { label: "IFB1/2024",     value: "18.46%",   change: "+0.15%", up: true,  icon: Landmark       },
    { label: "91-Day T-Bill", value: "15.85%",   change: "-0.02%", up: false, icon: Zap             },
    { label: "KES/USD",       value: "129.50",   change: "+0.12%", up: true,  icon: ArrowRightLeft  },
    { label: "NSE-20",        value: "1,745.20", change: "+0.45%", up: true,  icon: TrendingUp      },
    { label: "MMF Avg Yield", value: "15.92%",   change: "+0.03%", up: true,  icon: TrendingUp      },
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-[100] h-9 bg-slate-950/90 backdrop-blur-md border-b border-white/5 flex items-stretch overflow-visible">

      {/* ── LEFT: phone ── */}
      <a
        href="tel:+254703469525"
        className="flex items-center gap-1.5 px-3 h-full bg-slate-950 border-r border-white/10 hover:bg-slate-800 transition-colors shrink-0 z-10"
      >
        <Phone className="w-2.5 h-2.5 text-blue-500" />
        <span className="text-[9px] font-black text-slate-300 tracking-widest uppercase whitespace-nowrap hidden sm:block">
          +254 703 469 525
        </span>
      </a>

      {/* ── CENTRE-LEFT (50%): Scrolling ticker ── */}
      <div className="flex-1 relative overflow-hidden min-w-0 border-r border-white/10">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />
        <motion.div
          animate={{ x: ["0%", "-33.333%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-10 px-4 h-full whitespace-nowrap absolute top-0 left-0"
        >
          {[...dataToDisplay, ...dataToDisplay, ...dataToDisplay].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <item.icon className="w-3 h-3 text-blue-500/70" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
              </div>
              <span className="text-[9px] font-black text-white tracking-widest">{item.value}</span>
              <span className={`text-[8px] font-black px-1 py-0.5 rounded ${item.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {item.change}
              </span>
              <span className="text-white/10 text-[10px]">|</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── CENTRE-RIGHT (50%): Research Hub quick links ── */}
      <div className="hidden lg:flex items-stretch gap-0 border-r border-white/10">
        {/* Research label */}
        <button
          onClick={() => setResearchOpen(v => !v)}
          className="flex items-center gap-1.5 px-3 h-full hover:bg-white/5 transition-colors text-[9px] font-black text-emerald-400 uppercase tracking-widest whitespace-nowrap border-r border-white/5"
        >
          <BookOpen className="w-3 h-3" />
          Research Hub
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${researchOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Individual quick links */}
        {RESEARCH_LINKS.slice(0, 5).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-1.5 px-3 h-full hover:bg-white/5 transition-colors border-r border-white/5 group"
          >
            <link.icon className={`w-2.5 h-2.5 ${link.color} shrink-0`} />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap group-hover:text-white transition-colors">
              {link.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Research Hub Dropdown (full menu) */}
      <AnimatePresence>
        {researchOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 top-9 z-[99]"
              onClick={() => setResearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-9 left-1/4 z-[200] w-72 bg-slate-950 border border-white/10 rounded-b-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Sentill Research Hub</p>
                <p className="text-[8px] text-slate-500 font-bold mt-0.5">Kenya investment intelligence & guides</p>
              </div>
              <div className="py-2">
                {RESEARCH_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setResearchOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors group"
                  >
                    <link.icon className={`w-3.5 h-3.5 ${link.color} shrink-0`} />
                    <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors">
                      {link.label}
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-600 ml-auto group-hover:text-slate-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── RIGHT: WhatsApp Rotating CTA Ticker ── */}
      <WATicker />
    </div>
  );
}

const WA_MESSAGES = [
  "Ask about MMF yields 💰",
  "Best T-Bills Kenya 📊",
  "Get free rate alerts 🔔",
  "IFB bonds — 18.46% 🏆",
  "Chat with Sentill AI 🤖",
  "Invest from KES 100 ✅",
];

function WATicker() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % WA_MESSAGES.length);
        setVisible(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <a
      href="https://wa.me/254703469525?text=Hello%20Sentill%2C%20I'd%20like%20to%20learn%20more%20about%20investment%20options%20in%20Kenya."
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 h-full bg-emerald-600 hover:bg-emerald-500 transition-colors shrink-0 border-l border-white/10 group min-w-[44px] sm:min-w-[200px] overflow-hidden"
    >
      {/* WhatsApp icon — always visible */}
      <svg className="w-3 h-3 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>

      {/* Rotating message — desktop only */}
      <span
        className="hidden sm:block text-[9px] font-black text-white tracking-wide whitespace-nowrap transition-all duration-300"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(-6px)' }}
      >
        {WA_MESSAGES[idx]}
      </span>
    </a>
  );
}
