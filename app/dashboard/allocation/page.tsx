"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from "recharts";
import { LayoutGrid, TrendingUp, Calendar, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

// Allocation breakdown
const ALLOCATION_DATA = [
  { name: "MMFs & Money Market", value: 35, color: "#10b981", amount: 875000 },
  { name: "Gov't Bonds (IFBs)", value: 28, color: "#3b82f6", amount: 700000 },
  { name: "NSE Equities", value: 18, color: "#f59e0b", amount: 450000 },
  { name: "Treasury Bills", value: 10, color: "#8b5cf6", amount: 250000 },
  { name: "SACCO Deposits", value: 6, color: "#06b6d4", amount: 150000 },
  { name: "Real Estate / Land", value: 3, color: "#f43f5e", amount: 75000 },
];

// Dividend forecast data
const DIVIDEND_DATA = [
  { month: "Jan", dividends: 12400 },
  { month: "Feb", dividends: 8200 },
  { month: "Mar", dividends: 15600 },
  { month: "Apr", dividends: 9800 },
  { month: "May", dividends: 22000 },
  { month: "Jun", dividends: 18500 },
  { month: "Jul", dividends: 31000 },  // Books closure SCOM
  { month: "Aug", dividends: 14200 },
  { month: "Sep", dividends: 28400 },  // Books closure EQTY
  { month: "Oct", dividends: 11000 },
  { month: "Nov", dividends: 9600 },
  { month: "Dec", dividends: 19800 },
];

// NSE equity holdings
const NSE_HOLDINGS = [
  { ticker: "SCOM.KE", name: "Safaricom", shares: 4000, price: 18.15, change: +2.3, dividend: "KES 0.65", booksClosure: "Jul 15" },
  { ticker: "EQTY.KE", name: "Equity Group", shares: 800, price: 48.20, change: -0.8, dividend: "KES 2.00", booksClosure: "Sep 04" },
  { ticker: "KCB.KE", name: "KCB Group", shares: 1200, price: 36.95, change: +1.1, dividend: "KES 1.50", booksClosure: "Aug 22" },
  { ticker: "BAMB.KE", name: "Bamburi Cement", shares: 500, price: 25.00, change: -2.1, dividend: "KES 0.75", booksClosure: "Oct 10" },
  { ticker: "KCCO.KE", name: "KenolKobil", shares: 3000, price: 14.70, change: +0.5, dividend: "KES 0.25", booksClosure: "Nov 20" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl text-white">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-base font-black text-emerald-400">KES {payload[0]?.value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const PieCustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl text-white">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{entry.name}</p>
        <p className="text-base font-black text-white">{entry.value}%</p>
        <p className="text-xs font-bold text-emerald-400">KES {entry.amount.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function StocksAllocationPage() {
  const [activeTab, setActiveTab] = useState<"allocation" | "dividends" | "calendar">("allocation");

  const totalPortfolio = ALLOCATION_DATA.reduce((sum, d) => sum + d.amount, 0);
  const totalAnnualDividends = DIVIDEND_DATA.reduce((sum, d) => sum + d.dividends, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none mb-2">Allocation Maps</h1>
          <p className="text-sm font-semibold text-slate-500">Portfolio composition, dividend forecasts, and NSE stock P/E heatmaps.</p>
        </div>
        <div className="flex gap-2">
          {(["allocation", "dividends", "calendar"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
              {t === "allocation" ? "Allocation" : t === "dividends" ? "Dividend Forecast" : "Dividend Calendar"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Portfolio", value: `KES ${(totalPortfolio/1000000).toFixed(2)}M`, color: "text-slate-900", bg: "bg-slate-50 border-slate-200" },
          { label: "Annual Dividends", value: `KES ${(totalAnnualDividends/1000).toFixed(1)}K`, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
          { label: "Upcoming Events", value: "3 stocks", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
          { label: "Dividend Yield", value: "8.9%", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`${s.bg} border rounded-[1.5rem] p-5`}>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`text-xl font-black tracking-tighter ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Chart Panel */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">

        {/* ALLOCATION PIE */}
        {activeTab === "allocation" && (
          <>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Portfolio Composition</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Asset class breakdown by allocation %</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={ALLOCATION_DATA} dataKey="value" cx="50%" cy="50%" innerRadius={75} outerRadius={130}
                    paddingAngle={3} strokeWidth={0}>
                    {ALLOCATION_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieCustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {ALLOCATION_DATA.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-slate-300 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <div>
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-wide">{d.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold">KES {d.amount.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{d.value}%</p>
                      <div className="w-20 h-1.5 bg-slate-200 rounded-full mt-1">
                        <div className="h-full rounded-full" style={{ width: `${d.value}%`, backgroundColor: d.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* DIVIDEND FORECAST CHART */}
        {activeTab === "dividends" && (
          <>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Dividend Forecast 2025</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Monthly expected dividend income — KES</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={DIVIDEND_DATA} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="dividendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="dividends" stroke="#10b981" strokeWidth={2.5}
                  fill="url(#dividendGrad)" dot={{ fill: "#10b981", r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}

        {/* DIVIDEND CALENDAR */}
        {activeTab === "calendar" && (
          <>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">NSE Dividend Calendar</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Upcoming books closure dates for your equity holdings</p>
              </div>
            </div>
            <div className="space-y-3">
              {NSE_HOLDINGS.map((stock, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                      {stock.ticker.split(".")[0].slice(0,3)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-wide">{stock.ticker}</p>
                      <p className="text-[10px] font-bold text-slate-500">{stock.name} · {stock.shares.toLocaleString()} shares</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Price</p>
                      <p className="text-sm font-black text-slate-900 tracking-tighter">KES {stock.price}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Change</p>
                      <div className={`flex items-center gap-1 text-sm font-black ${stock.change >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {stock.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {Math.abs(stock.change)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dividend</p>
                      <p className="text-sm font-black text-emerald-600">{stock.dividend}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Books Closure</p>
                      <p className="text-sm font-black text-blue-600">{stock.booksClosure}, 2025</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
