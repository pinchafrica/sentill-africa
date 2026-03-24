"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Zap, Shield, Crown, ArrowRight, Minus } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PremiumModal from "@/components/PremiumModal";
import { useState, useEffect } from "react";
import { useAIStore } from "@/lib/store";
import { useRouter } from "next/navigation";

const PACKAGES = [
  {
    name: "Standard Access",
    price: "Free",
    period: "Forever",
    description: "Essential intelligence for the emerging retail investor in Kenya.",
    color: "from-slate-800 to-slate-900 border-white/10 text-white",
    features: [
      "Live NSE Ticker & EOD Data",
      "Daily Top 5 MMF Yields",
      "Basic Portfolio Tracking (Up to 3 Assets)",
      "Sentil Academy (Full Access)",
      "Standard Web Support"
    ],
    missing: [
      "Tax Alpha Optimizer",
      "Real-time Institutional Order Book",
      "Sentil Cortex AI Oracle",
      "Unlimited Asset Logging"
    ],
    cta: "Sign Up Free",
    link: "/auth/register"
  },
  {
    name: "7-Day Pro Trial",
    price: "KES 100",
    period: "/7 days",
    description: "Try every Pro feature for 7 days. No commitment, no auto-renewal. Cancel anytime.",
    color: "from-emerald-900/60 to-slate-950 border-emerald-500/30 text-emerald-400 transform md:-translate-y-4 scale-105 shadow-2xl shadow-emerald-900/20",
    badge: "🔥 Best First Step",
    features: [
      "Everything in Standard",
      "Sentil Alpha AI Engine (Full)",
      "KRA Tax-Loss Harvesting AI",
      "Real-time Price & Yield Alerts",
      "Unlimited Portfolio Logging",
      "NSE Candlestick Charts + RSI/MACD",
      "Chama / Investment Club Dashboard",
      "Priority 24/7 Support"
    ],
    missing: [],
    cta: "Start 7-Day Trial — KES 100",
    link: "/auth/register?plan=premium"
  },
  {
    name: "Pro Monthly",
    price: "KES 150",
    period: "/month",
    description: "Full institutional-grade intelligence for serious Kenyan investors. Starts after your 7-day KES 100 trial. Cancel anytime.",
    color: "from-blue-900/60 to-indigo-950 border-blue-500/30 text-blue-400",
    badge: "Most Popular",
    features: [
      "Everything in 7-Day Trial",
      "Estate Vault (Beneficiary Automations)",
      "NSE Block Trade Scanner",
      "Global Macro Sentiment Pulse",
      "Automated KRA Tax Export",
      "1-on-1 Wealth Strategy Session",
      "Downloadable PDF Analytics",
      "Direct API Feed Access (Webhooks)"
    ],
    missing: [],
    cta: "Upgrade to Pro — KES 150/mo",
    link: "/auth/register?plan=pro"
  }
];

export default function PackagesPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "annually">("annually");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  const { isPremiumModalOpen, setPremiumModalOpen } = useAIStore();

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.authenticated) {
          setIsLoggedIn(true);
          setUser(data.user);
        }
      } catch (err) {
        console.error("Session check failed:", err);
      }
    }
    checkSession();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-blue-500/30">
      <Navbar />

      <section className="pt-40 pb-32 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-indigo-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center space-y-8 mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-8">
              <Crown className="w-4 h-4" /> Sentill Premium
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none font-heading mb-6">
              Unlock the Depth <br/>
              <span className="text-slate-500">of the Market.</span>
            </h1>
            
            <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              From free essential market data to institutional-grade AI modeling. Choose the intelligence tier that fits your capital.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 mt-12"
          >
            <span className={`text-sm font-bold uppercase tracking-widest transition-colors ${billing === 'monthly' ? 'text-white' : 'text-slate-500'}`}>Monthly</span>
            <button 
              onClick={() => setBilling(b => b === 'monthly' ? 'annually' : 'monthly')}
              className="w-16 h-8 rounded-full bg-slate-800 border border-slate-700 relative flex items-center px-1 cursor-pointer transition-colors hover:border-slate-600"
            >
              <div className={`w-6 h-6 rounded-full bg-blue-500 shadow-lg transform transition-transform duration-300 ${billing === 'annually' ? 'translate-x-8' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-bold uppercase tracking-widest transition-colors ${billing === 'annually' ? 'text-white' : 'text-slate-500'}`}>
              Annually <span className="text-emerald-400 ml-2 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px]">-20%</span>
            </span>
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 items-center relative z-10">
          {PACKAGES.map((pkg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className={`bg-gradient-to-b ${pkg.color} border rounded-[3rem] p-10 relative flex flex-col h-full`}
            >
              {pkg.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                  {pkg.badge}
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{pkg.name}</h3>
                <p className="text-sm font-medium opacity-80 leading-relaxed min-h-[40px]">{pkg.description}</p>
              </div>

              <div className="mb-10 pb-10 border-b border-current/10">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white tracking-tighter">
                    {pkg.price}
                  </span>
                  <span className="text-sm font-bold tracking-widest uppercase opacity-70">
                    {pkg.period}
                  </span>
                </div>
              </div>

              <div className="space-y-5 flex-grow mb-10">
                {pkg.features.map((f, j) => (
                  <div key={j} className="flex items-start gap-4">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-current opacity-80" />
                    <span className="text-sm font-bold text-white leading-relaxed">{f}</span>
                  </div>
                ))}
                {pkg.missing.map((f, j) => (
                  <div key={j} className="flex items-start gap-4 opacity-40">
                    <Minus className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-bold">{f}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => {
                   if (pkg.name === "Standard Access") {
                      if (isLoggedIn) {
                         router.push("/dashboard");
                      } else {
                         router.push("/auth/register");
                      }
                   } else {
                      if (isLoggedIn) {
                         setPremiumModalOpen(true);
                      } else {
                         router.push(pkg.link);
                      }
                   }
                }}
                className={`w-full py-5 rounded-2xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest transition-all ${
                  pkg.badge 
                    ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {isLoggedIn && pkg.name === "Institutional Premium" && user?.isPremium ? "Active Plan" : pkg.cta} <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </section>
      <PremiumModal 
        isOpen={isPremiumModalOpen} 
        onClose={() => setPremiumModalOpen(false)} 
      />
    </div>
  );
}