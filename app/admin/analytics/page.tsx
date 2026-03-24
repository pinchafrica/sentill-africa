"use client";

import { useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Activity, MousePointerClick, Smartphone, Globe, Monitor, TrendingUp, ShieldCheck, Zap, Search, Eye } from "lucide-react";
import { motion } from "framer-motion";

const trafficData = [
  { day: "Mon", visitors: 4200, pageviews: 12500, avgDuration: "4m 12s" },
  { day: "Tue", visitors: 5100, pageviews: 15300, avgDuration: "5m 01s" },
  { day: "Wed", visitors: 4800, pageviews: 14200, avgDuration: "4m 45s" },
  { day: "Thu", visitors: 6900, pageviews: 21500, avgDuration: "6m 30s" },
  { day: "Fri", visitors: 8200, pageviews: 28400, avgDuration: "7m 15s" },
  { day: "Sat", visitors: 6100, pageviews: 19800, avgDuration: "5m 50s" },
  { day: "Sun", visitors: 7400, pageviews: 23100, avgDuration: "6m 10s" },
];

const funnelData = [
  { step: "Landing Page", count: 42700, rate: 100 },
  { step: "Sign Up", count: 18500, rate: 43.3 },
  { step: "Profile Setup", count: 12400, rate: 67.0 },
  { step: "Premium Upgrade", count: 3200, rate: 25.8 },
];

const deviceData = [
  { name: "Mobile", value: 65, color: "#10b981" },
  { name: "Desktop", value: 30, color: "#3b82f6" },
  { name: "Tablet", value: 5, color: "#f59e0b" },
];

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence & Analytics</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Real-time User Telemetry & SEO Metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-5 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
             <Activity className="w-4 h-4" /> Live Connection: GA4 Active
           </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Pageviews (7d)", value: "134.8K", trend: "+24.5%", icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Unique Visitors", value: "42.7K", trend: "+12.2%", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Premium Conversion", value: "7.4%", trend: "+1.1%", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Avg Session Time", value: "5m 38s", trend: "+45s", icon: MousePointerClick, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center border border-current/10`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-3 h-3" />
                {kpi.trend}
              </span>
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{kpi.label}</h3>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Traffic Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900">Platform Traffic</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Visitors vs Pageviews</p>
            </div>
          </div>
          <div className="h-80 w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                <RechartsTooltip contentStyle={{ border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 900 }} />
                <Area type="monotone" dataKey="pageviews" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPageviews)" />
                <Area type="monotone" dataKey="visitors" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SEO Health Score & Devices */}
        <div className="flex flex-col gap-8">
          {/* SEO Health Component */}
          <div className="bg-slate-950 text-white border border-slate-800 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Search className="w-24 h-24" />
             </div>
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Technical SEO Score</h3>
             <div className="flex items-end gap-2 mb-6">
                <span className="text-6xl font-black tracking-tighter text-emerald-400">98</span>
                <span className="text-xl font-black text-slate-500 mb-2">/100</span>
             </div>
             
             <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                   <span className="text-slate-400">Core Web Vitals</span>
                   <span className="text-emerald-400">Pass</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                   <span className="text-slate-400">LCP (Load Time)</span>
                   <span className="text-white">1.2s</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                   <span className="text-slate-400">Mobile Responsive</span>
                   <span className="text-emerald-400">100%</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                   <span className="text-slate-400">Meta Tags</span>
                   <span className="text-emerald-400">Configured</span>
                </div>
             </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex-1">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Device Split</h3>
             <div className="h-32 mb-4">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={deviceData} innerRadius={35} outerRadius={55} paddingAngle={5} dataKey="value">
                     {deviceData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                   </Pie>
                   <RechartsTooltip contentStyle={{ border: 'none', borderRadius: '12px', fontSize: '10px', fontWeight: 900 }} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             <div className="flex justify-center gap-4">
                {deviceData.map((dev, i) => (
                  <div key={i} className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full" style={{ background: dev.color }} />
                     <span className="text-[10px] font-black text-slate-500 uppercase">{dev.name}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-lg font-black text-slate-900">User Acquisition Funnel</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Journey tracking from Arrival to Monetization</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
           <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100 -translate-y-1/2 hidden md:block" />
           {funnelData.map((step, idx) => (
              <div key={idx} className="bg-white z-10 border border-slate-200 p-6 rounded-3xl shadow-sm text-center relative group hover:-translate-y-2 transition-transform duration-300">
                 <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl mx-auto flex items-center justify-center font-black text-xs mb-4 shadow-lg">
                    0{idx + 1}
                 </div>
                 <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">{step.step}</h4>
                 <div className="text-3xl font-black text-slate-900 tracking-tighter mb-2">{step.count.toLocaleString()}</div>
                 <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 inline-block px-3 py-1 rounded-full border border-emerald-100">
                    {step.rate}% Conversion
                 </div>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
}
