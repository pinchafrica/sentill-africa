"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Zap, Shield, Crown, ArrowRight, Star, Users, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type BillingCycle = "MONTHLY" | "QUARTERLY" | "ANNUAL";

const PLAN_CATALOG: Record<BillingCycle, {
  planKey: string;
  amount: number;
  days: number;
  label: string;
  perMonth: number;
  perDay: number;
  savingsPct: number;
  savingsAbs: number;
  badge?: string;
}> = {
  MONTHLY:   { planKey: "PRO_30_DAYS",       amount: 490,  days: 30,  label: "/month",   perMonth: 490,  perDay: 16.33, savingsPct: 0,  savingsAbs: 0 },
  QUARTERLY: { planKey: "QUARTERLY_90_DAYS", amount: 1299, days: 90,  label: "/3 months", perMonth: 433, perDay: 14.43, savingsPct: 12, savingsAbs: 171, badge: "SAVE 12%" },
  ANNUAL:    { planKey: "ANNUAL_365_DAYS",   amount: 4900, days: 365, label: "/year",     perMonth: 408, perDay: 13.42, savingsPct: 17, savingsAbs: 980, badge: "BEST VALUE · 2 MONTHS FREE" },
};

const PRO_FEATURES = [
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
];

export default function PackagesPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cycle, setCycle] = useState<BillingCycle>("ANNUAL");
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");

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

  const current = PLAN_CATALOG[cycle];

  const handleCheckout = async (planKey: string, amount: number) => {
    setError("");

    if (!isLoggedIn) {
      router.push(`/auth/register?plan=${planKey}`);
      return;
    }

    setCheckingOut(true);
    try {
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      const realUserId = sessionData?.user?.id;
      const userEmail = sessionData?.user?.email;

      if (!realUserId) {
        setError("Please log in to upgrade.");
        setCheckingOut(false);
        return;
      }

      const res = await fetch("/api/payment/mpesa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: realUserId,
          amount,
          mpesaCode: "WEB-CHECKOUT",
          plan: planKey,
          email: userEmail || "user@sentill.africa",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Payment initialization failed.");
        setCheckingOut(false);
        return;
      }

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        setError("No authorization URL returned.");
        setCheckingOut(false);
      }
    } catch (e) {
      console.error("Payment request failed", e);
      setError("Network error sending payment request.");
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 selection:bg-blue-500/30">
      <Navbar />

      <section className="pt-40 pb-32 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-indigo-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center space-y-8 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-8">
              <Crown className="w-4 h-4" /> Sentill Pro
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none font-heading mb-6">
              Choose Your <br />
              <span className="text-emerald-400">Billing Cycle.</span>
            </h1>

            <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              Every plan includes every feature. Pay longer, save more. Cancel anytime.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-8"
          >
            {[
              { icon: Shield, label: "Cancel Anytime" },
              { icon: Zap, label: "Instant Activation" },
              { icon: Star, label: "M-Pesa & Card" },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                <badge.icon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{badge.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ─── BILLING CYCLE TOGGLE ──────────────────────────── */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-1.5 grid grid-cols-3 gap-1.5">
            {(["MONTHLY", "QUARTERLY", "ANNUAL"] as BillingCycle[]).map((c) => {
              const isActive = cycle === c;
              const plan = PLAN_CATALOG[c];
              return (
                <button
                  key={c}
                  onClick={() => setCycle(c)}
                  className={`relative py-3 px-2 rounded-xl transition-all text-center ${
                    isActive
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-900/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-widest">{c}</div>
                  {plan.savingsPct > 0 && (
                    <div className={`text-[8px] font-black uppercase tracking-widest mt-1 ${isActive ? "text-emerald-100" : "text-emerald-400"}`}>
                      Save {plan.savingsPct}%
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── MAIN PLAN CARD ──────────────────────────── */}
        <div className="max-w-lg mx-auto relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={cycle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="bg-gradient-to-b from-emerald-900/60 to-slate-950 border border-emerald-500/30 rounded-[2.5rem] p-10 relative shadow-2xl shadow-emerald-900/30"
            >
              {current.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg whitespace-nowrap">
                  {current.badge}
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Sentill Pro</h3>
                <p className="text-[11px] font-medium text-emerald-400/80 leading-relaxed">
                  Full institutional-grade intelligence. All features unlocked.
                </p>
              </div>

              <div className="text-center mb-10 pb-8 border-b border-emerald-500/15">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-6xl font-black text-white tracking-tighter">
                    KES {current.amount.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold tracking-widest uppercase text-emerald-400/70">
                    {current.label}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400/60 font-bold mt-3">
                  {cycle === "MONTHLY"
                    ? "≈ KES 16/day · Less than a cup of coffee"
                    : `≈ KES ${current.perMonth}/month · KES ${current.perDay.toFixed(2)}/day`}
                </p>
                {current.savingsAbs > 0 && (
                  <p className="inline-block mt-3 text-[10px] font-black text-emerald-300 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1.5">
                    💎 Save KES {current.savingsAbs.toLocaleString()} vs. monthly
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-4 mb-10">
                {PRO_FEATURES.map((f, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <span className="text-[12px] font-bold text-white leading-relaxed">{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleCheckout(current.planKey, current.amount)}
                disabled={checkingOut || (isLoggedIn && user?.isPremium)}
                className="w-full py-5 rounded-2xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {checkingOut ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting to Paystack…</>
                ) : isLoggedIn && user?.isPremium ? (
                  "✅ Active Plan"
                ) : (
                  <>⚡ Activate Pro — KES {current.amount.toLocaleString()} <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              {error && (
                <p className="mt-4 text-[10px] font-black text-rose-400 uppercase tracking-widest bg-rose-950/40 border border-rose-500/20 rounded-xl px-4 py-3 text-center">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-center gap-4 mt-6">
                {["Cancel anytime", "Instant activation", "M-Pesa & Card"].map((t, i) => (
                  <span key={i} className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    ✓ {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ─── CHAMA GROUP PLAN (B2B) ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-lg mx-auto mt-12"
        >
          <div className="bg-gradient-to-b from-indigo-900/40 to-slate-950 border border-indigo-500/25 rounded-[2rem] p-8 relative">
            <div className="absolute -top-4 left-8 px-4 py-1.5 bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
              👥 Chama Group Plan
            </div>

            <div className="flex items-start justify-between gap-6 mt-2">
              <div className="flex-1">
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" /> Built for investment clubs
                </h3>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed mb-4">
                  Up to 10 members share full Pro access. One invoice. Contribution tracker, group reports, and monthly AI brief.
                </p>

                <ul className="space-y-2 mb-6">
                  {[
                    "10 Pro seats included",
                    "Shared portfolio dashboard",
                    "Member contribution tracker",
                    "Monthly group performance brief",
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                      <span className="text-[11px] font-bold text-white">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-right shrink-0">
                <p className="text-4xl font-black text-white tracking-tighter">KES 2,500</p>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1">/month · 10 seats</p>
                <p className="text-[9px] text-slate-500 font-bold mt-2">KES 250/member</p>
              </div>
            </div>

            <button
              onClick={() => handleCheckout("CHAMA_MONTHLY", 2500)}
              disabled={checkingOut}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25 disabled:opacity-60"
            >
              {checkingOut ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
              ) : (
                <>Activate Chama Plan <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </motion.div>

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

        {/* Referral callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-lg mx-auto mt-8 text-center"
        >
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">🎁 Referral Bonus</p>
            <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
              Invite friends to Sentill. Each time a referred friend upgrades to Pro, <span className="text-emerald-400 font-black">you earn 30 days FREE</span>.
            </p>
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
    </div>
  );
}
