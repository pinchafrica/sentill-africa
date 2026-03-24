"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Activity, Globe, Smartphone, Briefcase, Users, Star, Building2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const BROKERS = [
  {
    name: "Standard Investment Bank (SIB)",
    short: "SIB",
    type: "Institutional & Retail",
    desc: "A leading investment bank in Kenya offering comprehensive financial services including corporate finance, stock brokerage, and wealth management (Mansa X).",
    icon: ShieldCheck,
    color: "bg-slate-800",
    features: ["Mansa-X Hub", "Corporate Advisory", "Wealth Management"]
  },
  {
    name: "Equity Investment Bank",
    short: "Equity",
    type: "Tier 1 Retail",
    desc: "Backed by Equity Group Holdings, providing robust retail stock brokerage services integrated directly with your Equity Bank accounts.",
    icon: Users,
    color: "bg-blue-800",
    features: ["Bank Integration", "Deep Retail Reach", "Mobile Trading"]
  },
  {
    name: "KCB Capital",
    short: "KCB",
    type: "Corporate & Wealth",
    desc: "The investment banking arm of KCB Group, offering vast capital market execution capabilities and deep regional liquidity.",
    icon: Briefcase,
    color: "bg-emerald-600",
    features: ["Regional Reach", "Corporate Finance", "Sovereign Debt"]
  },
  {
    name: "NCBA Investment Bank",
    short: "NCBA",
    type: "High Net-Worth",
    desc: "Specialized in delivering premium execution and research for institutional and high net-worth retail clients in East Africa.",
    icon: Star,
    color: "bg-purple-600",
    features: ["Premium Desk", "In-depth Research", "Bonds Execution"]
  },
  {
    name: "Ziidi Trader",
    short: "Ziidi",
    type: "Retail App",
    desc: "A modern, mobile-first stock trading application designed to make purchasing NSE shares accessible to the diaspora and retail investors.",
    icon: Smartphone,
    color: "bg-rose-600",
    features: ["Modern App Ui", "Diaspora Friendly", "Instant KYC"]
  },
  {
    name: "Sterling Capital",
    short: "Sterling",
    type: "Institutional",
    desc: "A premier investment bank offering cutting-edge execution, research, and corporate advisory services to local and foreign institutions.",
    icon: Activity,
    color: "bg-indigo-600",
    features: ["Institutional Alpha", "Global Partnerships", "Algorithmic Orders"]
  },
  {
    name: "AIB-AXYS Africa",
    short: "AIB",
    type: "Full Range",
    desc: "A dynamic stockbroker offering customized portfolio management and wide market access across multiple asset classes.",
    icon: Globe,
    color: "bg-teal-600",
    features: ["Multi-Asset", "Private Wealth", "Market Neutral"]
  },
  {
    name: "Dyer & Blair",
    short: "D&B",
    type: "Legacy Broker",
    desc: "One of the oldest and most established investment banks in Kenya, renowned for handling major corporate listings and sovereign debt.",
    icon: Building2,
    color: "bg-slate-600",
    features: ["Legacy Relationships", "Mega-Cap Execution", "Eurobond Desk"]
  }
];

export default function BrokersDirectoryPage() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-24">
      {/* ── BREADCRUMB ── */}
      <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex items-center gap-2">
        <Link href="/markets" className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 hover:text-slate-700 uppercase tracking-widest transition-colors">
          <ArrowLeft className="w-3 h-3" /> Markets
        </Link>
        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">/</span>
        <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Licensed Stockbrokers</span>
      </div>

      {/* ── HEADER ── */}
      <div className="px-6 md:px-10 pt-16 pb-12 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-4">
          NSE Broker <span className="text-blue-600">Directory</span>
        </h1>
        <p className="text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
          Compare and connect with Kenya's premier investment banks and licensed stockbrokers. Gain direct execution access to the Nairobi Securities Exchange.
        </p>
      </div>

      {/* ── GRID ── */}
      <div className="px-6 md:px-10 pb-20 max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BROKERS.map((broker, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={broker.name} 
            className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group flex flex-col"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl ${broker.color} text-white flex items-center justify-center shadow-lg`}>
                <broker.icon className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-100">
                {broker.type}
              </span>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-3">
              {broker.name}
            </h3>
            
            <p className="text-sm text-slate-500 leading-relaxed font-medium mb-8 flex-grow">
              {broker.desc}
            </p>

            <div className="space-y-3 mb-8">
              {broker.features.map(f => (
                <div key={f} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{f}</span>
                </div>
              ))}
            </div>

            <Link 
              href={`/markets/trading/${broker.short.toLowerCase()}`}
              className="mt-auto w-full py-4 rounded-xl border-2 border-slate-100 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all flex items-center justify-center gap-2"
            >
              View Profile <ExternalLink className="w-3 h-3" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
