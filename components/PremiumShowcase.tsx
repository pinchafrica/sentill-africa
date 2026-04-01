"use client";

import { useState } from "react";
import {
  LayoutGrid, BarChart2, Bell, Globe, CheckCircle2, Lock,
  Zap, TrendingUp, Brain, ChevronRight, Star
} from "lucide-react";

const CATEGORIES = [
  {
    id: "alpha",
    label: "Sentil Alpha Engine",
    icon: Brain,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    features: [
      { label: "KRA Tax-Loss Harvesting AI", free: false },
      { label: "CBK Rate Impact Modeler", free: false },
      { label: "SACCO Dividend Prediction AI", free: false },
      { label: "Dynamic IFB Yield Curves", free: false },
      { label: "Portfolio Rebalancing AI", free: false },
      { label: "Estate Vault (Beneficiary Automations)", free: false },
      { label: "NSE Block Trade Scanner", free: false },
      { label: "Global Macro Sentiment Pulse", free: false },
      { label: "Automated KRA Tax Export", free: false },
      { label: "Priority Sentill Africa Oracle Support", free: false },
    ],
  },
  {
    id: "data",
    label: "Private Market Data",
    icon: LayoutGrid,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    features: [
      { label: "CMA Registry Change Alerts", free: false },
      { label: "Private Equity Valuations", free: false },
      { label: "Tier 1 SACCO AUM Tracking", free: false },
      { label: "Off-market Bond Liquidity", free: false },
      { label: "Real Estate REIT Yields", free: false },
      { label: "Eurobond Spread Analysis", free: false },
      { label: "Historical MMF Rate Mapping", free: false },
      { label: "Forex Interbank Rate Feed", free: false },
      { label: "Basic Market Yields", free: true },
      { label: "Provider Comparison Matrix", free: true },
    ],
  },
  {
    id: "alerts",
    label: "Precision Alert Engine",
    icon: Bell,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    features: [
      { label: "Real-time CBK Rate Alerts", free: false },
      { label: "IFB Primary Auction Alerts", free: false },
      { label: "Tax-Free Yield Threshold Notifications", free: false },
      { label: "NSE Earnings Call Summaries", free: false },
      { label: "SACCO AGM Resolution Alerts", free: false },
      { label: "Portfolio Risk Volatility Warnings", free: false },
      { label: "Withholding Tax (WHT) Penalty Alerts", free: false },
      { label: "KRA Tax Deadline Reminders", free: true },
      { label: "Market Intelligence Digests", free: true },
      { label: "Daily MMF Yield Updates", free: true },
    ],
  },
  {
    id: "platform",
    label: "Platform Access",
    icon: Globe,
    color: "text-blue-600",
    bg: "bg-blue-600/10",
    border: "border-blue-600/20",
    features: [
      { label: "Unlimited Asset Logging", free: false },
      { label: "Asset Watchlists", free: false },
      { label: "Natural Language AI Logging", free: false },
      { label: "Sentil Desktop App (Mac/Win)", free: false },
      { label: "No ads — ever", free: false },
      { label: "Downloadable PDF Analytics", free: false },
      { label: "1-on-1 Wealth Strategy Session", free: false },
      { label: "Track up to 3 Assets", free: true },
      { label: "Basic Portfolio Projection", free: true },
      { label: "Sentil Academy Full Access", free: true },
    ],
  },
];

const PLANS = [
  {
    id: "free",
    label: "Free",
    price: "KES 0",
    period: "/mo",
    description: "Essential tools for getting started",
    cta: "Current Plan",
    accent: "bg-slate-50 border-slate-200",
    ctaStyle: "bg-slate-200 text-slate-600 cursor-default",
    features: ["Provider data matrix", "Basic portfolio log", "3 Asset tracking limit", "Sentil Academy"],
  },
  {
    id: "trial",
    label: "7-Day Trial",
    price: "KES 100",
    period: "/trial",
    description: "Try all Pro features — zero commitment",
    cta: "🔥 Start 7-Day Trial",
    accent: "bg-slate-900 border-emerald-800",
    ctaStyle: "bg-emerald-500 text-white hover:bg-emerald-400",
    badge: "Best First Step",
    badgeStyle: "bg-emerald-500 text-slate-950",
    features: ["Everything in Pro", "7 full days access", "No auto-renewal", "Cancel instantly"],
  },
  {
    id: "pro",
    label: "Pro Monthly",
    price: "KES 499",
    period: "/mo",
    description: "Full institutional-grade intelligence",
    cta: "Upgrade to Pro",
    accent: "bg-slate-900 border-slate-800",
    ctaStyle: "bg-amber-500 text-slate-950 hover:bg-amber-400",
    badge: "Most Popular",
    badgeStyle: "bg-amber-500 text-slate-950",
    features: ["Everything in Free", "Sentil Alpha AI Engine", "KRA Tax Optimizer", "Unlimited logging", "No ads"],
  },
  {
    id: "annual",
    label: "Annual Pro",
    price: "KES 4,499",
    period: "/yr",
    description: "Save 25% — best value",
    cta: "Get Annual",
    accent: "bg-blue-700 border-blue-600",
    ctaStyle: "bg-white text-blue-700 hover:bg-blue-50",
    badge: "Save 25%",
    badgeStyle: "bg-blue-500 text-white",
    features: ["Everything in Pro", "Estate Vault full access", "1-on-1 Strategy Session", "Priority Support", "Automated KRA Export"],
  },
];

export default function PremiumShowcase() {
  const [activeCategory, setActiveCategory] = useState("alpha");
  const cat = CATEGORIES.find((c) => c.id === activeCategory)!;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-black uppercase tracking-[0.3em]">
            <Star className="w-3 h-3" /> Sentil Pro
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            Institutional-Grade <br /><span className="text-slate-300">Intelligence Features.</span>
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-md">
            Everything you need to analyse, track, and optimise your Kenyan investment portfolio — at a professional level.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Try it for just</p>
            <p className="text-2xl font-black text-slate-900 tracking-tighter">KES 100<span className="text-slate-400 text-sm font-bold">/7 days</span></p>
          </div>
        </div>
      </div>

      {/* Category Tabs + Feature List */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tab Selector */}
        <div className="space-y-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                activeCategory === c.id
                  ? `${c.bg} ${c.border} shadow-lg`
                  : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeCategory === c.id ? c.bg : "bg-slate-100"}`}>
                <c.icon className={`w-5 h-5 ${activeCategory === c.id ? c.color : "text-slate-400"}`} />
              </div>
              <div className="flex-1">
                <span className={`text-[11px] font-black uppercase tracking-widest block ${activeCategory === c.id ? "text-slate-900" : "text-slate-600"}`}>{c.label}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{c.features.filter((f) => !f.free).length} Pro features</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-all ${activeCategory === c.id ? `${c.color} translate-x-0.5` : "text-slate-300"}`} />
            </button>
          ))}
        </div>

        {/* Feature List */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
          <div className={`p-8 border-b border-slate-100 flex items-center gap-4 ${cat.bg}`}>
            <div className={`w-12 h-12 bg-white rounded-2xl flex items-center justify-center border ${cat.border} shadow-sm`}>
              <cat.icon className={`w-6 h-6 ${cat.color}`} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{cat.label}</h3>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                {cat.features.filter((f) => !f.free).length} Pro · {cat.features.filter((f) => f.free).length} Free
              </p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            {cat.features.map((feature, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                  feature.free
                    ? "bg-slate-50 border-slate-100 opacity-80"
                    : "bg-white border-slate-200 hover:border-amber-300 hover:shadow-md cursor-pointer"
                }`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${feature.free ? "bg-blue-100" : "bg-amber-50 border border-amber-200"}`}>
                  {feature.free ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${feature.free ? "text-slate-600" : "text-slate-800"}`}>
                  {feature.label}
                </span>
                {!feature.free && (
                  <span className="ml-auto text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex-shrink-0">
                    Pro
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-[2.5rem] border p-7 flex flex-col gap-5 ${plan.accent} ${plan.id === "trial" ? "ring-2 ring-emerald-500/40" : plan.id === "pro" ? "ring-2 ring-amber-500/30" : ""}`}
          >
            {plan.badge && (
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${plan.badgeStyle || "bg-slate-700 text-white"}`}>
                {plan.badge}
              </div>
            )}
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${plan.id === "free" ? "text-slate-500" : "text-white/60"}`}>{plan.label}</p>
              <p className={`text-3xl font-black tracking-tighter ${plan.id === "free" ? "text-slate-900" : "text-white"}`}>
                {plan.price}
                <span className={`text-sm font-bold ml-1 ${plan.id === "free" ? "text-slate-400" : "text-white/50"}`}>{plan.period}</span>
              </p>
              <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${plan.id === "free" ? "text-slate-400" : "text-white/50"}`}>{plan.description}</p>
            </div>
            <button className={`w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${plan.ctaStyle}`}>
              {plan.cta}
            </button>
            <div className="space-y-2 pt-2 border-t border-white/10">
              {plan.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${plan.id === "free" ? "text-blue-600" : plan.id === "trial" ? "text-emerald-400" : plan.id === "pro" ? "text-amber-400" : "text-white"}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${plan.id === "free" ? "text-slate-600" : "text-white/70"}`}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
