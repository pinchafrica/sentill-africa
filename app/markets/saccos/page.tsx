"use client";

import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, Legend, PieChart, Pie
} from "recharts";
import {
  TrendingUp, Shield, Zap, Search, ChevronRight, CheckCircle,
  Building2, Percent, Users, Landmark, AlertCircle, ArrowUpRight, BarChart2, Plus, Info, Globe, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AssetModal from "@/components/AssetModal";
import { PORTFOLIOS } from "@/lib/portfolios";

// ─── TIER 1 SACCO DATA (Extended for Analytics) ──────────────────────────────
const SACCO_METRICS = [
  { name: "Stima SACCO", yield: 15.0, aum: 53.8, interest: 11.0, rating: "AAA" },
  { name: "Police SACCO", yield: 17.0, aum: 47.9, interest: 11.0, rating: "AAA" },
  { name: "Mwalimu National", yield: 11.2, aum: 64.5, interest: 10.5, rating: "AAA" },
  { name: "Tower SACCO", yield: 20.0, aum: 31.0, interest: 13.0, rating: "AA+" },
  { name: "Safaricom SACCO", yield: 13.0, aum: 9.3, interest: 8.0, rating: "AA+" },
  { name: "Harambee SACCO", yield: 12.0, aum: 36.2, interest: 8.5, rating: "AA" },
];

const HISTORICAL_RATES = [
  { year: "2019", stima: 14.0, police: 16.5, tower: 18.0, sheria: 14.0, safaricom: 13.0 },
  { year: "2020", stima: 14.0, police: 17.0, tower: 20.0, sheria: 15.0, safaricom: 12.0 },
  { year: "2021", stima: 14.0, police: 17.0, tower: 20.0, sheria: 15.0, safaricom: 13.0 },
  { year: "2022", stima: 15.0, police: 17.0, tower: 20.0, sheria: 16.0, safaricom: 13.5 },
  { year: "2023", stima: 15.0, police: 17.0, tower: 20.0, sheria: 14.5, safaricom: 13.5 },
];

const AUM_DISTRIBUTION = [
  { name: "Stima", value: 53.8, color: "#10b981" },
  { name: "Police", value: 47.9, color: "#0ea5e9" },
  { name: "Mwalimu", value: 64.5, color: "#6366f1" },
  { name: "Tower", value: 31.0, color: "#ec4899" },
  { name: "Harambee", value: 36.2, color: "#f59e0b" },
  { name: "Other Tier 1", value: 45.0, color: "#94a3b8" },
];

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl text-[10px]">
      <p className="font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-800 pb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-6 py-1">
          <span className="font-bold text-slate-300">{p.name}</span>
          <span className="font-black text-white" style={{ color: p.color }}>{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

export default function SaccosPage() {
  const [search, setSearch] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("All");
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [prefilledAsset, setPrefilledAsset] = useState("");

  const handleOpenAssetModal = (assetId: string) => {
    setPrefilledAsset(assetId);
    setIsAssetModalOpen(true);
  };

  // Pull SACCOs from global registry
  const saccoRegistry = PORTFOLIOS.filter(p => p.category === 'saccos');
  
  const filtered = saccoRegistry.filter(s =>
    (s.name.toLowerCase().includes(search.toLowerCase()))
  );

  const avgYield = (SACCO_METRICS.reduce((a, b) => a + b.yield, 0) / SACCO_METRICS.length).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-40">
      <AssetModal 
        isOpen={isAssetModalOpen} 
        onClose={() => setIsAssetModalOpen(false)} 
        prefilledAsset={prefilledAsset}
      />

      {/* ── PREMIUM HERO ── */}
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto mb-12">
        <div className="relative overflow-hidden rounded-[3.5rem] bg-slate-950 p-12 md:p-20 shadow-2xl border border-slate-800">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />
           
           <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
              <div className="space-y-6">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">
                    <Shield className="w-4 h-4" /> SASRA Regulated Hub
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
                    SACCO <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Intelligence.</span>
                 </h1>
                 <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] max-w-xl leading-relaxed">
                    Institutional mapping of Tier-1 Kenyan SACCOs. Dividend yield history, Asset Base (AUM) scaling, and liquidity forensics for long-term cooperative returns.
                 </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 {[
                    { label: "Avg Dividend", value: `${avgYield}%`, icon: Percent },
                    { label: "Tracked AUM", value: "KES 284Bn", icon: Landmark },
                    { label: "Sector Cap", value: "Tier 1", icon: Building2 },
                    { label: "Governance", value: "High", icon: ShieldCheck },
                 ].map((stat, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl">
                       <stat.icon className="w-5 h-5 text-emerald-400 mb-3" />
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                       <p className="text-xl font-black text-white tracking-tight">{stat.value}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      <div className="px-6 md:px-12 max-w-[1600px] mx-auto space-y-12">
        
        {/* ── ANALYTICS LAYER ── */}
        <div className="grid lg:grid-cols-12 gap-10">
           {/* Yield History Chart */}
           <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 flex flex-col min-h-[500px]">
              <div className="flex items-start justify-between mb-10">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Dividend Performance Matrix</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Multi-year dividend yield scaling across Tier-1 institutions</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                   <TrendingUp className="w-4 h-4" /> Market Leader: 20%
                </div>
              </div>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={HISTORICAL_RATES}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 900 }} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={v => v + "%"} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 900 }} domain={[8, 22]} />
                          <RechartsTooltip content={<DarkTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", paddingTop: '30px', letterSpacing: '0.1em' }} />
                    <Line type="monotone" dataKey="tower" name="Tower SACCO" stroke="#ec4899" strokeWidth={4} dot={{ r: 6, fill: "#ec4899", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 10 }} />
                    <Line type="monotone" dataKey="police" name="Kenya Police" stroke="#0ea5e9" strokeWidth={4} dot={{ r: 6, fill: "#0ea5e9", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 10 }} />
                    <Line type="monotone" dataKey="stima" name="Stima SACCO" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 10 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Market Share / AUM Distribution */}
           <div className="lg:col-span-4 bg-slate-950 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
              <div className="mb-8">
                 <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                    <PieChart className="w-4 h-4" /> Sector Liquidity
                 </h3>
                 <p className="text-2xl font-black text-white tracking-tight">AUM Concentration</p>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Tier-1 Assets in KES Billions</p>
              </div>

              <div className="flex-1 w-full relative z-10">
                 <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                       <Pie
                          data={AUM_DISTRIBUTION}
                          innerRadius={65}
                          outerRadius={90}
                          paddingAngle={8}
                          dataKey="value"
                       >
                          {AUM_DISTRIBUTION.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                       </Pie>
                       <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '15px' }}
                          itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                       />
                    </PieChart>
                 </ResponsiveContainer>
              </div>

              <div className="space-y-3 mt-6">
                 {AUM_DISTRIBUTION.slice(0, 4).map((entry, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{entry.name}</span>
                       </div>
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">KES {entry.value}B</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* ── SACCO DIRECTORY ── */}
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden">
           {/* Directory Header */}
           <div className="px-10 py-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                 <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Unified SACCO Terminal</h2>
                 <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Cross-reference yields & structural mechanics from {PORTFOLIOS.length} global assets</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-[1.5rem] border border-slate-100 w-full md:w-80 shadow-inner group transition-all focus-within:bg-white focus-within:border-blue-500">
                    <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                       className="text-[11px] font-black text-slate-700 bg-transparent outline-none placeholder-slate-400 w-full uppercase tracking-widest"
                       placeholder="Find Asset ID or Name..."
                       value={search}
                       onChange={e => setSearch(e.target.value)}
                    />
                 </div>
              </div>
           </div>

           {/* Table */}
           <div className="overflow-x-auto">
              <table className="w-full">
                 <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                       <th className="text-left px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional ID</th>
                       <th className="text-center px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Asset Class</th>
                       <th className="text-right px-4 py-6 text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Div. Yield (%)</th>
                       <th className="text-right px-4 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Risk Profile</th>
                       <th className="text-right px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Min Floor</th>
                       <th className="text-center px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Sandbox Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filtered.map(sacco => (
                       <tr key={sacco.id} className="hover:bg-blue-50/40 transition-all group">
                          <td className="px-10 py-8">
                             <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-3xl flex items-center justify-center border-t-2 border-white/50 shadow-xl transition-transform group-hover:scale-110 ${sacco.bg}`}>
                                   <Landmark className={`w-7 h-7 ${sacco.color}`} />
                                </div>
                                <div className="space-y-1">
                                   <p className="text-sm font-black text-slate-900 tracking-tight uppercase">{sacco.name}</p>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                      <Info className="w-3 h-3" /> Tier 1 Manager
                                   </p>
                                </div>
                             </div>
                          </td>
                          <td className="px-4 py-8 text-center">
                             <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-widest">{sacco.category}</span>
                          </td>
                          <td className="px-4 py-8 text-right">
                             <p className="text-lg font-black text-emerald-600 tracking-tight">{sacco.yield}</p>
                             <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Historical</p>
                          </td>
                          <td className="px-4 py-8 text-right">
                             <div className="flex items-center justify-end gap-2 text-slate-700">
                                <Shield className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{sacco.risk}</span>
                             </div>
                          </td>
                          <td className="px-4 py-8 text-right">
                             <span className="text-[10px] font-black text-slate-900 tracking-widest uppercase">{sacco.minInvest}</span>
                          </td>
                          <td className="px-10 py-8 text-center">
                             <div className="flex items-center justify-center gap-3">
                                <button 
                                  onClick={() => handleOpenAssetModal(sacco.id)}
                                  className="px-6 py-3 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2"
                                >
                                   <Plus className="w-4 h-4" /> Add to Sandbox
                                </button>
                                <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all">
                                   <ArrowUpRight className="w-4 h-4" />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* ── INSIGHT CARD ── */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-[4rem] p-12 md:p-20 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full -mr-48 -mt-48 blur-[100px] pointer-events-none" />
           <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
              <div className="w-32 h-32 rounded-[2.5rem] bg-white border border-emerald-100 flex items-center justify-center shadow-3xl shrink-0 group-hover:scale-110 transition-transform duration-700">
                 <Globe className="w-16 h-16 text-emerald-600" />
              </div>
              <div className="space-y-6">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                    Sentill Strategic Alpha
                 </div>
                 <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">
                    Capital Preservation <br /> via Tier-1 Aggregation.
                 </h2>
                 <p className="text-slate-600 font-semibold text-lg max-w-2xl leading-relaxed">
                    Unlike the stock market, SACCO yields are anchored by structural community capital and regulated lending spreads. By diversifying across 3 top-tier SACCOs, you can achieve a risk-managed composite yield exceeding 15.5% annually, tax-advantaged.
                 </p>
                 <div className="flex flex-wrap gap-4 pt-4">
                    <button className="px-10 py-5 bg-slate-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl hover:bg-emerald-700 transition-all">
                       Contact Institutional Advisor
                    </button>
                    <button className="px-10 py-5 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all">
                       Download Sector Report
                    </button>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
