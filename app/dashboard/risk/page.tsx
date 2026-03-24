"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell, Legend
} from "recharts";
import { Shield, AlertTriangle, TrendingDown, BarChart3, Info, CheckCircle2 } from "lucide-react";

const MATURITY_DATA = [
  { name: "91-Day T-Bill", maturity: "3M", yield: 15.85, risk: 1, amount: 250000, color: "#10b981" },
  { name: "182-Day T-Bill", maturity: "6M", yield: 15.90, risk: 1.5, amount: 180000, color: "#10b981" },
  { name: "IFB1/2023", maturity: "2Y", yield: 17.20, risk: 2, amount: 500000, color: "#3b82f6" },
  { name: "KE-2025/12Y", maturity: "5Y", yield: 16.80, risk: 3, amount: 300000, color: "#8b5cf6" },
  { name: "IFB2/2024", maturity: "7Y", yield: 18.46, risk: 4, amount: 400000, color: "#f59e0b" },
  { name: "KE-2031/15Y", maturity: "12Y", yield: 14.90, risk: 5, amount: 150000, color: "#ef4444" },
];

const RADAR_DATA = [
  { metric: "Credit Risk", value: 15 },
  { metric: "Liquidity Risk", value: 40 },
  { metric: "Duration Risk", value: 55 },
  { metric: "Inflation Risk", value: 35 },
  { metric: "Currency Risk", value: 20 },
  { metric: "Concentration", value: 50 },
];

const RISK_RATINGS = [
  { label: "Overall Risk Score", value: "3.2 / 10", trend: "Low", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { label: "Modified Duration", value: "4.8 yrs", trend: "Moderate", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  { label: "Portfolio VaR (95%)", value: "KES 12,400", trend: "Daily", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  { label: "Sharpe Ratio", value: "1.84", trend: "Strong", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl text-white">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-black" style={{ color: p.color }}>
            {p.name}: {p.value}{p.name.includes("Yield") ? "%" : p.name.includes("Amount") ? " KES" : ""}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function BondsRiskPage() {
  const [activeView, setActiveView] = useState<"ladder" | "radar">("ladder");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none mb-2">Risk Spectrums</h1>
          <p className="text-sm font-semibold text-slate-500">Maturity laddering, duration risk, and portfolio VaR analysis across your bond holdings.</p>
        </div>
        <div className="flex gap-2">
          {(["ladder", "radar"] as const).map(v => (
            <button key={v} onClick={() => setActiveView(v)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === v ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
              {v === "ladder" ? "Maturity Ladder" : "Risk Radar"}
            </button>
          ))}
        </div>
      </div>

      {/* Risk KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {RISK_RATINGS.map((r, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className={`${r.bg} border ${r.border} rounded-[1.5rem] p-5`}>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{r.label}</p>
            <p className={`text-2xl font-black tracking-tighter ${r.color}`}>{r.value}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{r.trend}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
        {activeView === "ladder" ? (
          <>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Bond Maturity Ladder</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Duration risk by allocation — KES</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={MATURITY_DATA} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="maturity" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" name="Allocation (KES)" radius={[8, 8, 0, 0]}>
                  {MATURITY_DATA.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
              {MATURITY_DATA.map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-wide truncate">{d.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{d.yield}% yield · {d.maturity}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Portfolio Risk Radar</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Multi-dimensional risk exposure (0–100)</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={360}>
              <RadarChart data={RADAR_DATA} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 9 }} />
                <Radar name="Risk" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>

            <div className="grid md:grid-cols-3 gap-3 mt-4">
              {RADAR_DATA.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-wide">{d.metric}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${d.value}%`, backgroundColor: d.value < 30 ? "#10b981" : d.value < 60 ? "#f59e0b" : "#ef4444" }} />
                    </div>
                    <span className="text-[10px] font-black text-slate-500">{d.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* Risk Insights */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">AI Risk Insights</h3>
        <div className="space-y-3">
          {[
            { icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50 border-emerald-200", text: "Your short-term T-Bills (91 & 182-day) provide excellent liquidity buffer. Consider increasing this allocation to 35%." },
            { icon: AlertTriangle, color: "text-amber-500 bg-amber-50 border-amber-200", text: "IFB2/2024 at 18.46% yield has high duration (7Y). A 1% rate rise would reduce its market value by ~6.8%." },
            { icon: TrendingDown, color: "text-blue-500 bg-blue-50 border-blue-200", text: "Your portfolio Sharpe Ratio of 1.84 beats the Kenya benchmark of 1.2 — excellent risk-adjusted performance." },
          ].map((insight, i) => (
            <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${insight.color}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${insight.color.split(" ").slice(1).join(" ")}`}>
                <insight.icon className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-bold text-slate-700 leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
