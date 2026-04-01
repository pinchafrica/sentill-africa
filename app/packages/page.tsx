"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Zap, Shield, Crown, ArrowRight, Minus, Star, Clock, Sparkles } from "lucide-react";
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
      "Sentill Africa Oracle AI",
      "Unlimited Asset Logging"
    ],
    cta: "Sign Up Free",
    link: "/auth/register",
    planCode: null,
    amount: 0,
  },
  {
    name: "1 Week Pro",
    price: "KES 99",
    period: "/week",
    description: "Try every Pro feature for 7 days. No commitment, no auto-renewal.",
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
    cta: "Start 1-Week Trial — KES 99",
    link: "/auth/register?plan=premium",
    planCode: "WEEKLY_7_DAYS",
    amount: 99,
  },
  {
    name: "1 Month Pro",
    price: "KES 349",
    period: "/month",
    description: "Full institutional-grade intelligence. Save 12% vs weekly billing.",
    color: "from-blue-900/60 to-indigo-950 border-blue-500/30 text-blue-400",
    badge: "Most Popular",
    features: [
      "Everything in 1-Week Pro",
      "Estate Vault (Beneficiary Automations)",
      "NSE Block Trade Scanner",
      "Global Macro Sentiment Pulse",
      "Automated KRA Tax Export",
      "1-on-1 Wealth Strategy Session",
      "Downloadable PDF Analytics",
      "Direct API Feed Access (Webhooks)"
    ],
    missing: [],
    cta: "Go Pro — KES 349/mo",
    link: "/auth/register?plan=pro",
    planCode: "MONTHLY_30_DAYS",
    amount: 349,
  },
  {
    name: "3 Months Pro",
    price: "KES 999",
    period: "/quarter",
    description: "Maximum savings — lock in 3 months of Pro at the best rate. Save 24% vs monthly.",
    color: "from-indigo-900/60 to-violet-950 border-indigo-500/30 text-indigo-400",
    badge: "💎 Best Value",
    features: [
      "Everything in Monthly Pro",
      "Priority Concierge Support",
      "Exclusive Quarterly Wealth Report",
      "Early Access to New Features",
      "Custom Portfolio Strategy Session",
      "Advanced Risk Profiler AI",
      "Institutional Research Briefs",
      "VIP Community Access"
    ],
    missing: [],
    cta: "Lock in 3 Months — KES 999",
    link: "/auth/register?plan=quarterly",
    planCode: "QUARTERLY_90_DAYS",
    amount: 999,
  }
];

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

          {/* Pricing badges */}
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

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-start relative z-10">
          {PACKAGES.map((pkg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className={`bg-gradient-to-b ${pkg.color} border rounded-[2.5rem] p-8 relative flex flex-col h-full`}
            >
              {pkg.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg whitespace-nowrap">
                  {pkg.badge}
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{pkg.name}</h3>
                <p className="text-[11px] font-medium opacity-80 leading-relaxed min-h-[40px]">{pkg.description}</p>
              </div>

              <div className="mb-8 pb-6 border-b border-current/10">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white tracking-tighter">
                    {pkg.price}
                  </span>
                  <span className="text-sm font-bold tracking-widest uppercase opacity-70">
                    {pkg.period}
                  </span>
                </div>
                {pkg.amount > 0 && pkg.planCode === "QUARTERLY_90_DAYS" && (
                  <p className="text-[10px] text-emerald-400 font-bold mt-2">
                    ≈ KES {Math.round(pkg.amount / 13)}/week · Save 24%
                  </p>
                )}
                {pkg.planCode === "MONTHLY_30_DAYS" && (
                  <p className="text-[10px] text-blue-400 font-bold mt-2">
                    ≈ KES {Math.round(pkg.amount / 4)}/week · Save 12%
                  </p>
                )}
              </div>

              <div className="space-y-4 flex-grow mb-8">
                {pkg.features.map((f, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-current opacity-80 mt-0.5" />
                    <span className="text-[11px] font-bold text-white leading-relaxed">{f}</span>
                  </div>
                ))}
                {pkg.missing.map((f, j) => (
                  <div key={j} className="flex items-start gap-3 opacity-40">
                    <Minus className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="text-[11px] font-bold">{f}</span>
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
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  pkg.badge 
                    ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {isLoggedIn && user?.isPremium && pkg.amount > 0 ? "Active Plan" : pkg.cta} <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* WhatsApp CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-2xl mx-auto mt-20 text-center"
        >
          <p className="text-slate-500 text-sm font-bold mb-4">Need help choosing the right plan?</p>
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