"use client";

import { useState } from "react";
import { 
  TrendingUp, Activity, Globe, Zap, ArrowRight, Shield, Award, 
  BarChart as BarIcon, LineChart as LineIcon, ChevronUp, ChevronDown
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend, LineChart, Line
} from "recharts";
import Link from "next/link";

const YIELD_DATA = [
  { provider: "Etica MMF", gross: 18.2, net: 15.47, category: "MMF" },
  { provider: "Sanlam MMF", gross: 17.5, net: 14.88, category: "MMF" },
  { provider: "Zimele MMF", gross: 16.8, net: 14.28, category: "MMF" },
  { provider: "Cytonn MMF", gross: 19.5, net: 16.58, category: "MMF" },
  { provider: "IFB1/2024", gross: 18.46, net: 18.46, category: "Bond" },
  { provider: "FXD1/2024", gross: 16.0, net: 13.6, category: "Bond" },
  { provider: "91-Day T-Bill", gross: 15.82, net: 13.45, category: "Treasury" },
];

const HISTORICAL_YIELDS = [
  { month: "Jan", etica: 16.5, sanlam: 15.8, cytonn: 18.2, treasury: 14.5 },
  { month: "Feb", etica: 17.2, sanlam: 16.0, cytonn: 18.8, treasury: 15.2 },
  { month: "Mar", etica: 18.2, sanlam: 16.5, cytonn: 19.5, treasury: 15.8 },
];

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl text-white">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="text-sm font-black">{p.value}%</p>
      ))}
    </div>
  );
};

export default function YieldsDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-24 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
            <Activity className="w-3 h-3" /> Live Yield Intelligence · Fixed Income
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Market <span className="text-indigo-600">Yields.</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time Comparative Analytics · Gross vs Net Benchmark</p>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Yield Matrix</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Net effective yields across asset classes</p>
                </div>
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs">A+</div>
             </div>
             <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={YIELD_DATA} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" hide domain={[0, 22]} />
                      <YAxis dataKey="provider" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 800 }} width={100} />
                      <Tooltip content={<DarkTooltip />} />
                      <Bar dataKey="net" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Trend Analysis</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">3-Month moving benchmarks</p>
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
             </div>
             <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={HISTORICAL_YIELDS}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} />
                      <YAxis hide domain={[12, 22]} />
                      <Tooltip content={<DarkTooltip />} />
                      <Line type="monotone" dataKey="etica" stroke="#4f46e5" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="cytonn" stroke="#f59e0b" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="treasury" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                   </LineChart>
                </ResponsiveContainer>
             </div>
             <div className="flex justify-center gap-6 mt-4">
                {[{ l: "Etica", c: "bg-indigo-600" }, { l: "Cytonn", c: "bg-amber-500" }, { l: "T-Bills", c: "bg-emerald-500" }].map(l => (
                   <div key={l.l} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${l.c}`} />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{l.l}</span>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="pl-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Provider</th>
                    <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Gross Yield</th>
                    <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-emerald-600">Net Yield</th>
                    <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Tax Rate</th>
                    <th className="px-4 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right pr-8">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {YIELD_DATA.map((y, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-all">
                       <td className="pl-8 py-5">
                          <div>
                             <p className="text-[11px] font-black text-slate-900 uppercase">{y.provider}</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{y.category}</p>
                          </div>
                       </td>
                       <td className="px-4 py-5 text-sm font-black text-slate-500">{y.gross}%</td>
                       <td className="px-4 py-5 text-sm font-black text-emerald-600">{y.net}%</td>
                       <td className="px-4 py-5 hidden md:table-cell">
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase">
                             {y.category === 'Bond' && y.provider.includes('IFB') ? '0%' : '15% WHT'}
                          </span>
                       </td>
                       <td className="px-4 py-5 text-right pr-8">
                          <Link href={y.category === 'MMF' ? '/markets/mmfs' : y.category === 'Bond' ? '/markets/bonds' : '/markets/treasuries'} className="inline-flex items-center gap-1 text-[9px] font-black text-indigo-600 uppercase hover:text-indigo-800">
                             Analysis <ArrowRight className="w-3 h-3" />
                          </Link>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
