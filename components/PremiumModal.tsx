"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ShieldCheck, Zap, Brain, BarChart3, Bell, TrendingUp, CheckCircle2, Star, Clock, Sparkles } from "lucide-react";

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
          amount: 490,
          mpesaCode: "254700000000",
          plan: "PRO_30_DAYS",
          email: userEmail || "user@sentill.africa"
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
          className="relative z-10 bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
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
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-black uppercase tracking-[0.25em] mb-4">
                  <Star className="w-3.5 h-3.5" /> Sentill Pro
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-tight mb-2">
                  Unlock Institutional<br />Intelligence.
                </h2>
                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                  One simple plan. Every feature. No upsells.
                </p>
              </div>

              {/* Single Plan Summary */}
              <div className="bg-gradient-to-b from-emerald-900/30 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 mb-6 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Sentill Pro · 30 Days</p>
                <p className="text-5xl font-black text-white tracking-tighter">KES 490</p>
                <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest">≈ KES 16/day · Cancel anytime · No auto-renew</p>
              </div>

              {/* Features grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {PRO_FEATURES.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/5 border border-white/8 rounded-2xl p-3">
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

              {/* CTA */}
              <button
                onClick={handleUpgrade}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" /> Activate Pro — KES 490
              </button>

              {/* WhatsApp help */}
              <div className="text-center mt-4">
                <a
                  href="https://wa.me/254703469525?text=Hi%20Sentill%2C%20I%20need%20help%20with%20my%20subscription."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[9px] text-slate-500 hover:text-emerald-400 font-bold uppercase tracking-widest transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Need help? Chat on WhatsApp
                </a>
              </div>

              {/* Trust */}
              <div className="flex items-center justify-center gap-2 mt-3">
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
