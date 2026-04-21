"use client";

import { motion } from "framer-motion";
import {
  TrendingUp, ShieldCheck, Zap, Building2, Users, Landmark,
  BarChart2, ArrowUpRight, ArrowDownRight, RefreshCw, Info,
  DollarSign, Globe
} from "lucide-react";
import Link from "next/link";

const YIELD_TABLE = [
  // MMFs
  { name: "Etica Capital MMF (Zidi)", category: "mmf", yield: 18.20, tenure: "Daily liquidity", risk: "Low", tax: "15% WHT", minInvest: "KES 1,000", trend: "up", change: "+0.65", regulated: "CMA" },
  { name: "Lofty-Corban MMF", category: "mmf", yield: 17.50, tenure: "Daily liquidity", risk: "Low", tax: "15% WHT", minInvest: "KES 1,000", trend: "up", change: "+0.08", regulated: "CMA" },
  { name: "Sanlam USD MMF", category: "mmf", yield: 6.20, tenure: "Daily liquidity", risk: "Low", tax: "15% WHT", minInvest: "USD 100", trend: "stable", change: "0.00", regulated: "CMA" },
  { name: "CIC Money Market", category: "mmf", yield: 16.90, tenure: "Daily liquidity", risk: "Low", tax: "15% WHT", minInvest: "KES 1,000", trend: "down", change: "-0.05", regulated: "CMA" },
  // Bonds
  { name: "IFB1/2024 (8.5yr)", category: "bonds", yield: 18.46, tenure: "8.5 years", risk: "Sovereign", tax: "Tax-Free", minInvest: "KES 50,000", trend: "up", change: "+0.21", regulated: "CBK" },
  { name: "FXD1/2023/10YR", category: "bonds", yield: 16.84, tenure: "10 years", risk: "Sovereign", tax: "15% WHT", minInvest: "KES 50,000", trend: "stable", change: "0.00", regulated: "CBK" },
  { name: "T-Bill 91 Day", category: "bonds", yield: 9.10, tenure: "91 days", risk: "Sovereign", tax: "15% WHT", minInvest: "KES 100,000", trend: "down", change: "-0.30", regulated: "CBK" },
  { name: "T-Bill 364 Day", category: "bonds", yield: 11.40, tenure: "364 days", risk: "Sovereign", tax: "15% WHT", minInvest: "KES 100,000", trend: "up", change: "+0.25", regulated: "CBK" },
  // Stocks
  { name: "Safaricom (SCOM)", category: "stocks", yield: 8.50, tenure: "Equity", risk: "Medium", tax: "Div. WHT 5%", minInvest: "KES 4 (1 share)", trend: "down", change: "-0.33", regulated: "NSE/CMA" },
  { name: "Equity Group (EQTY)", category: "stocks", yield: 7.20, tenure: "Equity", risk: "Medium", tax: "Div. WHT 5%", minInvest: "KES 77 (1 share)", trend: "up", change: "+0.50", regulated: "NSE/CMA" },
  { name: "NCBA Group", category: "stocks", yield: 9.10, tenure: "Equity", risk: "Medium", tax: "Div. WHT 5%", minInvest: "KES 91 (1 share)", trend: "up", change: "+3.69", regulated: "NSE/CMA" },
  // SACCOs
  { name: "Stima SACCO", category: "saccos", yield: 14.00, tenure: "1 year", risk: "Low-Medium", tax: "WHT on Div.", minInvest: "KES 10,000", trend: "stable", change: "0.00", regulated: "SASRA" },
  { name: "Mwalimu SACCO", category: "saccos", yield: 13.50, tenure: "1 year", risk: "Low-Medium", tax: "WHT on Div.", minInvest: "KES 5,000", trend: "up", change: "+0.50", regulated: "SASRA" },
  // Global
  { name: "US S&P 500 ETF", category: "global", yield: 11.20, tenure: "Equity", risk: "High", tax: "30% Foreign WHT", minInvest: "USD 100", trend: "up", change: "+1.20", regulated: "SEC" },
  { name: "Eurobond KE 2028", category: "global", yield: 7.50, tenure: "2028 maturity", risk: "Sovereign", tax: "15% WHT", minInvest: "USD 1,000", trend: "stable", change: "0.00", regulated: "CBK/IDA" },
];

const CATEGORY_META: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  mmf:       { label: "Money Market Fund", color: "text-violet-600", bg: "bg-violet-50 border-violet-200", icon: ShieldCheck },
  bonds:     { label: "Treasury / Bond", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: Landmark },
  stocks:    { label: "NSE Equity", color: "text-orange-500", bg: "bg-orange-50 border-orange-200", icon: BarChart2 },
  saccos:    { label: "SACCO", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: Users },
  global:    { label: "Global Asset", color: "text-slate-600", bg: "bg-slate-50 border-slate-200", icon: Globe },
};

const CATEGORIES = ["all", "mmf", "bonds", "stocks", "saccos", "global"];

export default function YieldsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Yield Intelligence</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Kenya Market Rates · Updated Daily 07:00 EAT</p>
            </div>
          </div>
        </div>
        <Link
          href="/tools/compare"
          className="flex items-center gap-2 px-5 py-3 bg-slate-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg"
        >
          <Zap className="w-4 h-4" /> Compare Assets
        </Link>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Best MMF Yield", value: "18.20%", sub: "Etica (Zidi)", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100", icon: ShieldCheck },
          { label: "Best Bond (Tax-Free)", value: "18.46%", sub: "IFB1/2024 8.5yr", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", icon: Landmark },
          { label: "NSE Top Dividend", value: "9.10%", sub: "NCBA Group", color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100", icon: BarChart2 },
          { label: "Global ETF (USD)", value: "11.20%", sub: "US S&P 500 ETF", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", icon: Globe },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`bg-white border ${kpi.border} rounded-3xl p-5 shadow-sm`}
          >
            <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[11px] font-bold text-slate-500 mt-0.5">{kpi.sub}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Yield Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Market Yield Matrix</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{YIELD_TABLE.length} instruments tracked</p>
          </div>
          <span className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
            <RefreshCw className="w-3 h-3" /> Live Data
          </span>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 px-8 py-3 bg-slate-50 border-b border-slate-100">
          {["Asset", "Category", "Yield p.a.", "Tenure", "Risk", "Tax", "Min. Invest", "Regulator", "Trend"].map((h, i) => (
            <div key={i} className={`col-span-${i === 0 ? 3 : i === 1 ? 2 : 1} text-[9px] font-black text-slate-400 uppercase tracking-widest`}>{h}</div>
          ))}
        </div>

        {YIELD_TABLE.map((row, i) => {
          const meta = CATEGORY_META[row.category] || CATEGORY_META.mmf;
          const Icon = meta.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.03 }}
              className="grid grid-cols-12 items-center px-8 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
            >
              {/* Asset Name */}
              <div className="col-span-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${meta.bg}`}>
                  <Icon className={`w-4 h-4 ${meta.color}`} />
                </div>
                <p className="text-sm font-black text-slate-900 truncate">{row.name}</p>
              </div>
              {/* Category */}
              <div className="col-span-2">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${meta.bg} ${meta.color}`}>
                  {meta.label}
                </span>
              </div>
              {/* Yield */}
              <div className="col-span-1">
                <span className={`text-base font-black ${row.yield >= 15 ? "text-emerald-600" : row.yield >= 10 ? "text-blue-600" : "text-slate-700"}`}>
                  {row.yield}%
                </span>
              </div>
              {/* Tenure */}
              <div className="col-span-1 text-[10px] font-bold text-slate-500">{row.tenure}</div>
              {/* Risk */}
              <div className="col-span-1">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                  row.risk === "Sovereign" ? "bg-emerald-100 text-emerald-700" :
                  row.risk === "Low" ? "bg-blue-100 text-blue-700" :
                  row.risk === "Medium" ? "bg-amber-100 text-amber-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {row.risk}
                </span>
              </div>
              {/* Tax */}
              <div className="col-span-1 text-[10px] font-bold text-slate-500">{row.tax}</div>
              {/* Min Invest */}
              <div className="col-span-1 text-[10px] font-bold text-slate-600">{row.minInvest}</div>
              {/* Regulator */}
              <div className="col-span-1 text-[10px] font-black text-slate-400 uppercase">{row.regulated}</div>
              {/* Trend */}
              <div className="col-span-1 flex items-center gap-1">
                {row.trend === "up" ? (
                  <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-black">
                    <ArrowUpRight className="w-3.5 h-3.5" /> {row.change}
                  </span>
                ) : row.trend === "down" ? (
                  <span className="flex items-center gap-1 text-red-500 text-[10px] font-black">
                    <ArrowDownRight className="w-3.5 h-3.5" /> {row.change}
                  </span>
                ) : (
                  <span className="text-slate-400 text-[10px] font-black">—</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
          Yield data is for informational purposes only. Past yields do not guarantee future returns. Sentill Africa does not custody client funds. All rates are indicative — verify with respective fund managers or CBK. Tax treatment may vary.
        </p>
      </div>
    </div>
  );
}

// Re-trigger build at 2026-03-24 19:20:31
