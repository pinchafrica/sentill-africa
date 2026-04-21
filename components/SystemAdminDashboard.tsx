"use client";

import { 
  Activity, 
  ShieldCheck, 
  Users, 
  Zap, 
  Cpu, 
  HardDrive, 
  BarChart3, 
  Clock, 
  AlertTriangle, 
  Crosshair, 
  Radar, 
  Fingerprint,
  ArrowUpRight,
  TrendingUp,
  Landmark,
  Signal,
  MessageSquare,
  CreditCard,
  Wallet,
  Globe,
  ExternalLink
} from "lucide-react";
import { useEffect, useState } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { motion } from "framer-motion";
import WhatsAppAdminPanel from "./WhatsAppAdminPanel";

// Mock Sentinel Data
const sentinelTraffic = [
  { time: "08:00", value: 45, anomalies: 0 }, { time: "09:00", value: 80, anomalies: 2 },
  { time: "10:00", value: 120, anomalies: 4 }, { time: "11:00", value: 250, anomalies: 12 },
  { time: "12:00", value: 180, anomalies: 1 }, { time: "13:00", value: 400, anomalies: 22 },
  { time: "14:00", value: 310, anomalies: 5 }, { time: "15:00", value: 520, anomalies: 3 },
];

const riskMatrix = [
  { asset: "Equities", riskLevel: "High", sentinelScore: 82, trend: "+4%", color: "bg-red-500" },
  { asset: "Bonds", riskLevel: "Low", sentinelScore: 12, trend: "-0.5%", color: "bg-blue-500" },
  { asset: "MMFs", riskLevel: "Minimal", sentinelScore: 5, trend: "0%", color: "bg-emerald-500" },
];

export default function SystemAdminDashboard({ 
  totalUsers = 0, 
  premiumUsers = 0, 
  totalAUM = 0 
}: { 
  totalUsers?: number; 
  premiumUsers?: number; 
  totalAUM?: number; 
}) {
  const [metrics, setMetrics] = useState<any>(null);
  const [liveRates, setLiveRates] = useState<any>({ mmfs: [], nse: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSystemData() {
      try {
        const [metricsRes, yieldsRes, nseRes] = await Promise.all([
          fetch("/api/admin/metrics"),
          fetch("/api/market/yields"),
          fetch("/api/market/nse")
        ]);
        
        const metricsData = await metricsRes.ok ? await metricsRes.json() : null;
        const yieldsData = await yieldsRes.ok ? await yieldsRes.json() : { mmfs: [] };
        const nseData = await nseRes.ok ? await nseRes.json() : { stocks: [] };
        
        setMetrics(metricsData);
        setLiveRates({ mmfs: yieldsData.mmfs || [], nse: nseData.stocks || [] });
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch admin dashboard sources:", err);
      }
    }
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 30000); 
    return () => clearInterval(interval);
  }, []);

  const etca = liveRates.mmfs.find((m: any) => m.code === "etca")?.yield || "18.20";
  const scom = liveRates.nse.find((s: any) => s.symbol === "SCOM")?.price || "30.60";

  const dynamicRiskMatrix = [
    { asset: "SCOM (Equities)", riskLevel: "Live Rate", sentinelScore: 82, trend: `KES ${scom}`, color: "bg-red-500" },
    { asset: "Top MMF", riskLevel: "Live Rate", sentinelScore: 95, trend: `${etca}%`, color: "bg-blue-500" },
    { asset: "Fixed Income", riskLevel: "Minimal", sentinelScore: 12, trend: "+0%", color: "bg-emerald-500" },
  ];

  const coreMetrics = [
    { label: "Market Streams", value: "12,450", sub: "Live Latency: 42ms", icon: Radar, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Premium Fleet", value: premiumUsers?.toLocaleString() || "0", sub: "Active Subscriptions", icon: Crosshair, color: "text-red-500", bg: "bg-red-50" },
    { label: "Total Members", value: totalUsers?.toLocaleString() || "0", sub: "Verified Global Users", icon: Fingerprint, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Aggregate AUM", value: `KES ${(totalAUM / 1000000 || 850).toFixed(1)}M`, sub: "Liquidity Index", icon: HardDrive, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* SECTION: SYSTEM PULSE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.3em]">
             <Cpu className="w-3.5 h-3.5 animate-pulse text-emerald-400" /> System Integrity Certified
          </div>
          <h2 className="text-4xl font-black text-slate-950 uppercase tracking-tighter">Command <span className="text-slate-200">Center.</span></h2>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Real-time infrastructure oversight and capital flow analysis.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-6 py-3 bg-white border border-slate-200 text-slate-950 text-[10px] font-black rounded-2xl uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
              Generate Audit
           </button>
           <button className="px-8 py-3 bg-slate-950 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-slate-200">
              Emergency Override
           </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid md:grid-cols-4 gap-6">
        {coreMetrics.map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
             <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <stat.icon className="w-24 h-24 text-slate-950" />
             </div>
             <div className="relative z-10 flex flex-col h-full">
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-8 border border-white/10`}>
                   <stat.icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{stat.label}</span>
                   <span className="text-3xl font-black text-slate-950 tracking-tighter block">{stat.value}</span>
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block pt-4">{stat.sub}</span>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* WHATSAPP BROADCAST */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WhatsAppAdminPanel />
        </div>
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Broadcast History</h3>
          </div>
          <div className="space-y-3">
            {[
              { date: "Mon Mar 23, 2026", time: "07:30 AM", status: "Sent", recipients: 1 },
              { date: "Fri Mar 21, 2026", time: "07:30 AM", status: "Sent", recipients: 1 },
              { date: "Thu Mar 20, 2026", time: "07:30 AM", status: "Sent", recipients: 1 },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div>
                    <p className="text-xs font-black text-slate-900">{log.date}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{log.time} EAT · {log.recipients} recipient</p>
                  </div>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full">{log.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CORE ANALYTICS */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Real-time Data Stream */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
           <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight flex items-center gap-3">
                   <Activity className="w-5 h-5 text-blue-600" /> Sentinel Data Stream
                </h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">Live Portfolio Tracking Engine v4.0</p>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active</span>
              </div>
           </div>

           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={sentinelTraffic}>
                    <defs>
                       <linearGradient id="colorStream" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                    <Tooltip 
                       contentStyle={{ border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#0f172a" strokeWidth={4} fillOpacity={1} fill="url(#colorStream)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Risk Matrix AI */}
        <div className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
           
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" /> Sentinel Risk AI
                 </h3>
                 <button className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                 </button>
              </div>

              <div className="space-y-6 flex-1">
                 {dynamicRiskMatrix.map((risk, i) => (
                   <div key={i} className="space-y-3">
                      <div className="flex justify-between items-end">
                         <div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-1">{risk.asset} Class</span>
                            <span className="text-sm font-black uppercase tracking-widest">{risk.riskLevel} S-Rating</span>
                         </div>
                         <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{risk.trend}</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${risk.sentinelScore}%` }}
                           className={`h-full ${risk.color}`}
                         />
                      </div>
                   </div>
                 ))}
              </div>

              <button className="w-full mt-10 py-5 bg-white text-slate-950 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-emerald-400 hover:text-white transition-all shadow-xl">
                 Execute Deep Audit
              </button>
           </div>
        </div>
      </div>

      {/* LOGS */}
      <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
         <div className="flex items-center justify-between mb-10">
           <div>
              <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight flex items-center gap-3">
                 <Signal className="w-5 h-5 text-emerald-500" /> Intelligence Feed
              </h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Live Global Operational Logs</p>
           </div>
           <div className="flex gap-2">
              <button className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-slate-950 transition-colors">
                 <ArrowUpRight className="w-4 h-4" />
              </button>
           </div>
         </div>

         <div className="space-y-2">
            {[
              { type: "CRITICAL", msg: "Unusual withdrawal pattern detected on Portfolio ID: 8829", time: "2 min ago", color: "bg-red-50 text-red-700" },
              { type: "UPDATE", msg: "CMA Data Sync Completed - 452 Assets Matched", time: "15 min ago", color: "bg-blue-50 text-blue-700" },
              { type: "INFO", msg: "Sentinel AI Model Retrained on latest CBK rates", time: "1 hour ago", color: "bg-emerald-50 text-emerald-700" },
              { type: "WARNING", msg: "Latency spike in API Route: /api/market/yields", time: "3 hours ago", color: "bg-amber-50 text-amber-700" },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-6">
                   <div className={`px-3 py-1.5 ${log.color} text-[9px] font-black uppercase tracking-widest rounded-lg min-w-[100px] text-center`}>
                      {log.type}
                   </div>
                   <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{log.msg}</span>
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{log.time}</span>
              </div>
            ))}
         </div>
      </div>

      {/* SUBSCRIPTIONS & TIERS */}
      <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
         <div className="flex items-center justify-between mb-10">
           <div>
              <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight flex items-center gap-3">
                 <Users className="w-5 h-5 text-indigo-500" /> Subscription & Tier Matrix
              </h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Live Free vs Paid Tier Analytics & Expiries</p>
           </div>
           <div className="flex gap-2">
              <button className="px-5 py-2.5 bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-colors shadow-lg">
                 Export Ledger
              </button>
           </div>
         </div>

         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="border-b border-slate-100">
                 <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">User / Org</th>
                 <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Current Tier</th>
                 <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                 <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Activation Date</th>
                 <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Expiry Date</th>
                 <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-4">AUM Managed</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {[
                 { name: "Alpha Capital Ltd", email: "treasury@alpha.co.ke", tier: "S-Tier Pro", status: "Active", activation: "12 Mar 2026", expiry: "12 Mar 2027", aum: "KES 450M", color: "bg-blue-100 text-blue-700" },
                 { name: "John Doe", email: "john@example.com", tier: "Free Builder", status: "Active", activation: "15 Mar 2026", expiry: "Lifetime", aum: "KES 1.2M", color: "bg-slate-100 text-slate-600" },
                 { name: "Stima SACCO Hub", email: "investments@stima.co.ke", tier: "Enterprise", status: "Active", activation: "01 Jan 2026", expiry: "31 Dec 2026", aum: "KES 2.8B", color: "bg-emerald-100 text-emerald-700" },
                 { name: "Jane Smith", email: "jane.smith@gmail.com", tier: "Free Builder", status: "Active", activation: "10 Feb 2026", expiry: "Lifetime", aum: "KES 850K", color: "bg-slate-100 text-slate-600" },
                 { name: "Beta Investments", email: "hello@betainv.com", tier: "S-Tier Pro", status: "Expiring Soon", activation: "20 Mar 2025", expiry: "20 Mar 2026", aum: "KES 120M", color: "bg-amber-100 text-amber-700" },
               ].map((user, i) => (
                 <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                   <td className="py-5 pl-4 flex flex-col justify-center">
                     <span className="text-[12px] font-black text-slate-900 tracking-tight">{user.name}</span>
                     <span className="text-[10px] font-black text-slate-400 tracking-widest">{user.email}</span>
                   </td>
                   <td className="py-5">
                     <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${user.color}`}>
                       {user.tier}
                     </span>
                   </td>
                   <td className="py-5">
                     <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{user.status}</span>
                     </div>
                   </td>
                   <td className="py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">{user.activation}</td>
                   <td className="py-5 text-[10px] font-black text-slate-900 uppercase tracking-widest">{user.expiry}</td>
                   <td className="py-5 text-right pr-4 text-[11px] font-black text-slate-900 tracking-widest">{user.aum}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
         {/* FEEDBACK INTELLIGENCE */}
         <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-10">
               <div>
                  <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight flex items-center gap-3">
                     <MessageSquare className="w-5 h-5 text-blue-500" /> Feedback Intelligence
                  </h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Direct User Sentiment & Feature Requests</p>
               </div>
               <span className="px-3 py-1.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-lg">
                  12 New Today
               </span>
            </div>

            <div className="space-y-4">
               {[
                  { user: "Sarah M.", sentiment: "Positive", text: "The comparison tool is a game changer for my IFB strategy.", time: "10m ago" },
                  { user: "David K.", sentiment: "Feature Request", text: "Would love to see more SACCO dividend history graphs.", time: "1h ago" },
                  { user: "Org: Zidi Hub", sentiment: "Support", text: "Latency on MMF sync in the diaspora hub is slightly high.", time: "2h ago" },
               ].map((item, i) => (
                  <div key={i} className="p-5 bg-slate-50 rounded-[2rem] border border-transparent hover:border-slate-100 transition-all">
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{item.user}</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.time}</span>
                     </div>
                     <p className="text-[11px] text-slate-600 font-bold leading-relaxed">{item.text}</p>
                     <div className="mt-4 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                           item.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-700' : 
                           item.sentiment === 'Feature Request' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                           {item.sentiment}
                        </span>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* PAYMENT GATEWAY PULSE */}
         <div className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
            
            <div className="relative z-10">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                     <CreditCard className="w-5 h-5 text-indigo-400" /> Payment Gateway Pulse
                  </h3>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               </div>

               <div className="flex items-center justify-between mb-10 p-6 bg-white/5 rounded-2xl border border-white/5">
                  <div>
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Today's Revenue</span>
                     <span className="text-2xl font-black tracking-tighter">KES 120,450.00</span>
                  </div>
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
               </div>

               <div className="space-y-4">
                  {[
                     { id: "PAY-9928", user: "Alpha Capital", amount: "KES 45,000", status: "Success", method: "M-Pesa Paybill" },
                     { id: "PAY-9927", user: "John Doe", amount: "KES 2,500", status: "Processing", method: "Direct Bank Transfer" },
                     { id: "PAY-9926", user: "Stima SACCO", amount: "KES 150,000", status: "Success", method: "Card Terminal" },
                  ].map((pay, i) => (
                     <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                              <Wallet className="w-4 h-4 text-indigo-400" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest">{pay.user}</p>
                              <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{pay.id} • {pay.method}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black tracking-tight">{pay.amount}</p>
                           <p className={`text-[8px] font-black uppercase tracking-widest ${pay.status === 'Success' ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
                              {pay.status}
                           </p>
                        </div>
                     </div>
                  ))}
               </div>

               <button className="w-full mt-10 py-5 bg-white text-slate-950 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-indigo-400 hover:text-white transition-all shadow-xl">
                  Reconcile Daily Ledger
               </button>
            </div>
         </div>
      </div>

      {/* GOOGLE ANALYTICS STREAM OVERVIEW */}
      <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden group">
         <div className="flex items-center justify-between mb-10">
           <div>
              <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight flex items-center gap-3">
                 <Globe className="w-5 h-5 text-blue-500" /> Web Analytics & Traffic Streams
              </h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Live Google Analytics 4 Configured Property</p>
           </div>
           <div className="flex gap-2">
              <span className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100 shadow-sm">
                 G-TAG ACTIVE
              </span>
           </div>
         </div>

         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-2">Stream Name</span>
               <span className="text-sm font-black text-slate-900 tracking-tight">Sentill Africa</span>
            </div>
            
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-2">Stream URL</span>
               <a href="https://www.sentill.africa" target="_blank" rel="noreferrer" className="text-sm font-black text-blue-600 tracking-tight hover:underline flex items-center gap-2">
                 www.sentill.africa <ExternalLink className="w-3 h-3" />
               </a>
            </div>

            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col justify-center">
               <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-2 border-b border-emerald-200/50 pb-2">Stream ID</span>
               <span className="text-sm font-black text-emerald-900 tracking-tight flex items-center gap-2">
                 13956185086
               </span>
            </div>

            <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-center relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 bg-blue-500/20 w-24 h-24 rounded-full blur-[20px]" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-800 pb-2 relative z-10">Measurement ID</span>
               <span className="text-sm font-black text-white tracking-widest relative z-10 flex items-center justify-between">
                 G-RHE3JS0FYT <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
               </span>
            </div>
         </div>
         
         <div className="mt-8 flex justify-end">
             <a href="https://analytics.google.com" target="_blank" rel="noreferrer" className="px-6 py-3 bg-white border border-slate-200 text-slate-900 text-[10px] font-black rounded-2xl uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
                Open GA4 Dashboard <ArrowUpRight className="w-4 h-4" />
             </a>
         </div>
      </div>

    </div>
  );
}
