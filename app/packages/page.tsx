"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Zap, Shield, Crown, ArrowRight, Star, Sparkles } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PremiumModal from "@/components/PremiumModal";
import { useState, useEffect } from "react";
import { useAIStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function PackagesPage() {
  const router = useRouter();
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
        
        <div className="max-w-3xl mx-auto text-center space-y-8 mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-8">
              <Crown className="w-4 h-4" /> Sentill Pro
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none font-heading mb-6">
              One Plan. <br/>
              <span className="text-emerald-400">Full Power.</span>
            </h1>
            
            <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              Institutional-grade AI wealth intelligence for less than a cup of coffee per day. No tiers. No upsells. Just everything.
            </p>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-8"
          >
            {[
              { icon: Shield, label: "Cancel Anytime" },
              { icon: Zap, label: "Instant Activation" },
              { icon: Star, label: "100% Refund Guarantee" },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                <badge.icon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{badge.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ─── SINGLE PLAN CARD ──────────────────────────── */}
        <div className="max-w-lg mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-b from-emerald-900/60 to-slate-950 border border-emerald-500/30 rounded-[2.5rem] p-10 relative shadow-2xl shadow-emerald-900/30"
          >
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg whitespace-nowrap">
              🔥 Everything Included
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Sentill Pro</h3>
              <p className="text-[11px] font-medium text-emerald-400/80 leading-relaxed">
                Full institutional-grade intelligence. All features unlocked. 30 days of unlimited access.
              </p>
            </div>

            <div className="text-center mb-10 pb-8 border-b border-emerald-500/15">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-6xl font-black text-white tracking-tighter">
                  KES 490
                </span>
                <span className="text-sm font-bold tracking-widest uppercase text-emerald-400/70">
                  /month
                </span>
              </div>
              <p className="text-[11px] text-emerald-400/60 font-bold mt-3">
                ≈ KES 16/day · Less than a cup of coffee
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-10">
              {[
                "Unlimited Sentill Oracle AI — Ask anything, anytime",
                "Full Portfolio Tracker — Log unlimited assets",
                "KRA Tax-Loss Harvesting AI",
                "Real-time Price & Yield Alerts",
                "NSE Candlestick Charts + RSI/MACD",
                "Financial Goal Planning & Tracking",
                "Chama / Investment Club Dashboard",
                "Estate Vault (Beneficiary Automations)",
                "NSE Block Trade Scanner",
                "Global Macro Sentiment Pulse",
                "Automated KRA Tax Export",
                "Downloadable PDF Analytics",
                "Priority 24/7 Support",
                "Direct API Feed Access (Webhooks)",
              ].map((f, j) => (
                <div key={j} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span className="text-[12px] font-bold text-white leading-relaxed">{f}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => {
                if (isLoggedIn) {
                  setPremiumModalOpen(true);
                } else {
                  router.push("/auth/register?plan=premium");
                }
              }}
              className="w-full py-5 rounded-2xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25"
            >
              {isLoggedIn && user?.isPremium ? "✅ Active Plan" : "⚡ Activate Pro — KES 490/mo"} <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust */}
            <div className="flex items-center justify-center gap-4 mt-6">
              {["No auto-renew", "Cancel anytime", "M-Pesa & Card"].map((t, i) => (
                <span key={i} className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  ✓ {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Free tier info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-lg mx-auto mt-12 text-center"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h4 className="text-sm font-black text-white uppercase tracking-tight mb-3">Already using Sentill Free?</h4>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-4">
              Free users get live NSE ticker, daily top 5 MMF yields, basic portfolio tracking (3 assets), full Sentill Academy access, and 10 free AI questions per day.
            </p>
            <button 
              onClick={() => {
                if (isLoggedIn) {
                  router.push("/dashboard");
                } else {
                  router.push("/auth/register");
                }
              }}
              className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              {isLoggedIn ? "Go to Dashboard" : "Create Free Account"} <ArrowRight className="w-3 h-3 inline ml-1" />
            </button>
          </div>
        </motion.div>

        {/* WhatsApp CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-2xl mx-auto mt-16 text-center"
        >
          <p className="text-slate-500 text-sm font-bold mb-4">Need help or have questions?</p>
          <a
            href="https://wa.me/254703469525?text=Hi%20Sentill%2C%20I%20need%20help%20choosing%20a%20subscription%20plan."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Chat with Us on WhatsApp
          </a>
        </motion.div>
      </section>
      <PremiumModal 
        isOpen={isPremiumModalOpen} 
        onClose={() => setPremiumModalOpen(false)} 
      />
    </div>
  );
}