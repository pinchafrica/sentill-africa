"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ShieldCheck, Zap, Brain, BarChart3, Bell, TrendingUp, CheckCircle2, Star } from "lucide-react";

const PRO_FEATURES = [
  { icon: Brain,      title: "KRA Tax-Loss Harvesting AI",     desc: "Auto-detect withholding tax inefficiencies and swap to better instruments." },
  { icon: BarChart3,  title: "Live NSE Candlestick Charts",    desc: "Full OHLC charts with RSI, MACD, EMA overlays for all NSE stocks." },
  { icon: TrendingUp, title: "Portfolio Risk Analyzer",        desc: "Sharpe ratio, VaR, max drawdown, and inflation-adjusted real returns." },
  { icon: Bell,       title: "Real-Time Price Alerts",         desc: "Get notified the instant a stock, bond or MMF hits your target yield." },
  { icon: Zap,        title: "Unlimited Asset Logging",        desc: "No cap — log all your assets across SACCOs, stocks, land, and more." },
  { icon: ShieldCheck, title: "Sentil Alpha Engine",           desc: "AI insights reserved for institutional fund managers. Now yours." },
];

export default function PremiumModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [stage, setStage] = useState<"value" | "loading" | "error">("value");
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStage("value");
      setApiError("");
    }
  }, [isOpen]);

  const handleUpgrade = async () => {
    setApiError("");
    setStage("loading");

    try {
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      const realUserId = sessionData?.user?.id;
      const userEmail = sessionData?.user?.email;

      if (!realUserId) {
        setApiError("Please log in to upgrade.");
        setStage("error");
        return;
      }

      const res = await fetch("/api/payment/mpesa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: realUserId,
          amount: 100,            // ← 100 KES trial
          mpesaCode: "254700000000",
          plan: "TRIAL_7_DAYS",   // ← 7-day trial
          email: userEmail || "user@sentil.africa"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || "Payment initialization failed.");
        setStage("error");
        return;
      }

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        setApiError("No authorization URL returned.");
        setStage("error");
      }

    } catch (e) {
      console.error("Payment request failed", e);
      setApiError("Network error sending payment request.");
      setStage("error");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          className="relative z-10 bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors z-50 bg-white/5 p-2 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          {/* VALUE PROP STATE */}
          {stage === "value" && (
            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-black uppercase tracking-[0.25em] mb-4">
                  <Star className="w-3.5 h-3.5" /> Sentil Pro Trial
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-tight mb-2">
                  Unlock Institutional<br />Intelligence.
                </h2>
                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                  Get 7 days of every Pro feature for just <span className="text-emerald-400 font-black">KES 100</span>. No commitments.
                </p>
              </div>

              {/* Features grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {PRO_FEATURES.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/5 border border-white/8 rounded-2xl p-4">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                      <f.icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white mb-0.5">{f.title}</p>
                      <p className="text-[9px] text-slate-400 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing strip */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">7-Day Pro Trial</p>
                  <p className="text-3xl font-black text-white tracking-tighter">KES 100</p>
                  <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest">Then KES 499/mo · Cancel anytime</p>
                </div>
                <div className="space-y-1.5 text-right">
                  {["✅ All Pro features", "✅ No auto-renew surprise", "✅ Cancel anytime"].map((t, i) => (
                    <p key={i} className="text-[9px] text-emerald-400 font-bold">{t}</p>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleUpgrade}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" /> Start 7-Day Trial for KES 100
              </button>

              {/* Trust */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                  Secured by Paystack · Bank-Grade SSL
                </p>
              </div>
            </div>
          )}

          {/* LOADING STATE */}
          {stage === "loading" && (
            <div className="p-12 flex flex-col items-center gap-6 text-center">
              <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Redirecting to Checkout...</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                  You&apos;ll be redirected to Paystack&apos;s secure payment page.
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/50 border border-emerald-500/20 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">Bank-Grade SSL Encryption</p>
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {stage === "error" && (
            <div className="p-10 flex flex-col items-center gap-5 text-center">
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-[1.5rem] flex items-center justify-center">
                <X className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Connection Error</h3>
                <p className="text-[11px] text-rose-400 font-bold uppercase tracking-widest bg-rose-950/40 border border-rose-500/20 rounded-xl px-4 py-3 max-w-xs mx-auto">
                  {apiError}
                </p>
              </div>
              <div className="flex gap-3 w-full max-w-xs">
                <button
                  onClick={() => setStage("value")}
                  className="flex-1 py-3 bg-slate-800 text-slate-300 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleUpgrade}
                  className="flex-1 py-3 bg-emerald-600 text-white font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-1"
                >
                  <Zap className="w-3 h-3" /> Retry
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
