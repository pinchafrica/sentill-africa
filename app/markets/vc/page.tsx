"use client";

import { useState, useMemo } from "react";
import { 
  Zap, TrendingUp, Activity, Globe, ArrowRight, 
  Plus, Info, Award, ChevronRight, Search, 
  Rocket, Lightbulb, Shield, Briefcase, 
  Target, BarChart4, PieChart as PieChartIcon, 
  Trophy, FlaskConical, Globe2, BarChart3, Presentation,
  ZapOff, Cpu, Megaphone, Smartphone, Star
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend, LineChart, Line,
  PieChart, Pie
} from "recharts";
import AssetModal from "@/components/AssetModal";
import { motion, AnimatePresence } from "framer-motion";

const VC_DEALS = [
  { 
    id: "WSK-24", 
    name: "Wasoko Series C", 
    short: "Wasoko",
    sector: "E-Commerce / B2B", 
    stage: "Series C", 
    target: "$50M", 
    valuation: "$600M", 
    status: "Active", 
    regions: "East / West Africa", 
    lead: "Tiger Global / Aulon",
    description: "Wasoko is revolutionizing informal retail supply chains across Africa through a proprietary platform and logistics backbone.",
    traction: "35% MoM Growth",
    score: 94,
    color: "from-amber-400 to-orange-700"
  },
  { 
    id: "SNK-23", 
    name: "Sun King Debt / Equity", 
    short: "Sun King",
    sector: "Renewable Energy / IoT", 
    stage: "Series D", 
    target: "$130M", 
    valuation: "$1.2B+", 
    status: "Closing", 
    regions: "Global Africa", 
    lead: "Beyond Net Zero",
    description: "Sun King is the largest off-grid solar energy provider in Africa, servicing over 95 million people with clean power solutions.",
    traction: "Unicorn Status",
    score: 98,
    color: "from-emerald-400 to-teal-700"
  },
  { 
    id: "MKO-24", 
    name: "M-KOPA Growth Round", 
    short: "M-KOPA",
    sector: "Fintech / IoT Lending", 
    stage: "Growth Stage", 
    target: "$200M", 
    valuation: "$800M+", 
    status: "Active", 
    regions: "Kenya / Nigeria / Ghana", 
    lead: "Standard Bank",
    description: "M-KOPA provides digital credit and essential products to underbanked customers through their proprietary IoT platform.",
    traction: "5M+ Users",
    score: 92,
    color: "from-blue-400 to-blue-700"
  },
  { 
    id: "KZV-24", 
    name: "Kuzeva Logistics", 
    short: "Kuzeva",
    sector: "Freight Tech", 
    stage: "Seed / Series A", 
    target: "$5M", 
    valuation: "$15M", 
    status: "Open", 
    regions: "Nairobi Base", 
    lead: "Enza Capital",
    description: "Kuzeva is a next-gen freight and warehousing exchange connecting long-haul shippers with transparent, real-time logistics.",
    traction: "120 New Fleets",
    score: 86,
    color: "from-rose-400 to-rose-700"
  },
];

const FUNDING_TRENDS = [
  { yr: '2019', val: 1.3 },
  { yr: '2020', val: 2.1 },
  { yr: '2021', val: 4.8 },
  { yr: '2022', val: 5.2 },
  { yr: '2023', val: 3.4 },
  { yr: '2024', val: 4.1 },
];

const SECTOR_PIE = [
  { name: 'Fintech', value: 45, fill: '#f59e0b' },
  { name: 'Logistics', value: 20, fill: '#3b82f6' },
  { name: 'Energy', value: 15, fill: '#10b981' },
  { name: 'E-Comm', value: 10, fill: '#ec4899' },
  { name: 'Other', value: 10, fill: '#64748b' },
];

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-950 border border-white/10 rounded-2xl p-4 shadow-2xl text-white">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex justify-between gap-6 py-1">
           <span className="text-[10px] font-bold text-slate-500 uppercase">{p.name}</span>
           <span className="text-sm font-black text-amber-400">${p.value}Bn</span>
        </div>
      ))}
    </div>
  );
};

export default function VCPage() {
  const [selectedDeal, setSelectedDeal] = useState(VC_DEALS[0]);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [prefilledAsset, setPrefilledAsset] = useState<string | undefined>(undefined);

  const handleOpenAssetModal = (assetId?: string) => {
    setPrefilledAsset(assetId);
    setIsAssetModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20 pt-24">
      <AssetModal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} prefilledAsset={prefilledAsset} />

      {/* --- ROCKET HERO --- */}
      <section className="px-6 md:px-12 max-w-[1600px] mx-auto mb-16">
        <div className="relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-slate-900 via-slate-950 to-[#0A0A1F] p-12 md:p-20 border border-white/5 shadow-[0_0_100px_rgba(245,158,11,0.05)]">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />
           
           <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-16">
              <div className="flex-1 space-y-8">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-[0.3em]">
                    <Rocket className="w-4 h-4" /> Alpha Stage Access
                 </div>
                 <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.85]">
                    VENTURE <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">CAPITAL.</span>
                 </h1>
                 <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] max-w-xl leading-relaxed">
                    Early Stage Innovation. B2B Disruption. Scalable Tech Infrastructure.
                    <br />The next African Unicorn starts here.
                 </p>
                 
                 <div className="flex flex-wrap gap-4">
                    <button className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-amber-600/20 active:scale-95 flex items-center gap-2">
                       <Lightbulb className="w-4 h-4" /> View Pitch Decks
                    </button>
                    <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                       <Smartphone className="w-4 h-4" /> Founders Portal
                    </button>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 lg:w-[400px]">
                 {[
                    { label: "Deal Volume", value: "$4.1Bn", icon: Activity },
                    { label: "Active SPVs", value: "24+", icon: Briefcase },
                    { label: "Unicorns", value: "7 Tracked", icon: Star },
                    { label: "Exit Multiple", value: "12.5x", icon: TrendingUp },
                 ].map((stat, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2.5rem]">
                       <stat.icon className="w-5 h-5 text-amber-400 mb-3" />
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                       <p className="text-xl font-black text-white tracking-tight">{stat.value}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* --- VENTURE TERMINAL --- */}
      <section className="px-6 md:px-12 max-w-[1600px] mx-auto mb-16 space-y-12">
        <div className="grid lg:grid-cols-12 gap-10">
           {/* Detailed Deal Analytics */}
           <div className="lg:col-span-8 bg-slate-900 rounded-[4rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden flex flex-col min-h-[600px]">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12 relative z-10">
                 <div className="flex items-center gap-6">
                    <div className={`w-20 h-20 rounded-[2rem] bg-gradient-to-br ${selectedDeal.color} flex items-center justify-center shadow-2xl transform hover:rotate-6 transition-transform`}>
                       <Zap className="w-10 h-10 text-white" />
                    </div>
                    <div>
                       <h2 className="text-3xl font-black uppercase tracking-tighter">{selectedDeal.name}</h2>
                       <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">{selectedDeal.sector}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedDeal.stage}</span>
                       </div>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-4xl font-black text-white tracking-tighter">{selectedDeal.target}</p>
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mt-1">Target Raise</p>
                 </div>
              </div>

              <div className="grid md:grid-cols-4 gap-6 mb-12 relative z-10">
                 {[
                    { l: "Estimated Cap", v: selectedDeal.valuation, icon: Cpu },
                    { l: "Region Focus", v: selectedDeal.regions, icon: Globe2 },
                    { l: "Lead LP", v: selectedDeal.lead, icon: Shield },
                    { l: "Traction", v: selectedDeal.traction, icon: Target },
                 ].map((m, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-5 rounded-3xl">
                       <m.icon className="w-4 h-4 text-amber-400 mb-2" />
                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{m.l}</p>
                       <p className="text-[11px] font-black text-white uppercase line-clamp-1">{m.v}</p>
                    </div>
                 ))}
              </div>

              <div className="flex-1 w-full relative z-10 min-h-[250px]">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Annual Venture Inflow ($ USD)</h3>
                       <p className="text-[9px] text-slate-600 font-bold uppercase mt-1 tracking-widest">Aggregate Africa VC Deal Value Trend</p>
                    </div>
                    <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-[9px] font-black uppercase tracking-widest">
                       2024 Projecting: $4.1B
                    </div>
                 </div>
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={FUNDING_TRENDS}>
                       <defs>
                          <linearGradient id="vcGrad" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                       <XAxis dataKey="yr" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 900 }} />
                       <YAxis hide domain={[0, 6]} />
                       <Tooltip content={<DarkTooltip />} cursor={{ fill: '#ffffff05' }} />
                       <Area type="monotone" dataKey="val" stroke="#f59e0b" strokeWidth={4} fill="url(#vcGrad)" dot={{ r: 6, fill: '#f59e0b', strokeWidth: 2, stroke: '#1e293b' }} activeDot={{ r: 10 }} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Market Share / High Impact Info */}
           <div className="lg:col-span-4 flex flex-col gap-10">
              <div className="bg-white rounded-[4rem] p-10 text-slate-900 border border-slate-100 shadow-2xl flex flex-col justify-between group h-full">
                 <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-600 font-black text-[9px] uppercase mb-8 tracking-widest">
                       <Star className="w-3.5 h-3.5" /> High Conviction Deals
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-4 leading-none text-slate-900 md:text-slate-900">Angel <br /> Syndicates.</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-10">
                       Sentill Angels provides direct participation in Seed and Series A tech startups for accredited individuals. Minimum ticket: $10k per deal.
                    </p>
                    
                    <div className="space-y-4 mb-10">
                       {[
                          { l: "Platform Lead", v: "Sentill Ventures" },
                          { l: "Legal Structure", v: "VCC / Delaware" },
                          { l: "Admin Fee", v: "2% Carry / 1% Mgmt" },
                       ].map(f => (
                          <div key={f.l} className="flex justify-between items-end border-b border-slate-100 pb-2">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{f.l}</span>
                             <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{f.v}</span>
                          </div>
                       ))}
                    </div>
                 </div>
                 
                 <button 
                   onClick={() => handleOpenAssetModal(selectedDeal.id)}
                   className="w-full py-5 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:bg-amber-600 border-none flex items-center justify-center gap-3 active:scale-95"
                 >
                    Request Deck <ArrowRight className="w-4 h-4" />
                 </button>
              </div>

              <div className="bg-slate-900 rounded-[4rem] border border-white/5 p-10 overflow-hidden relative shadow-2xl flex flex-col">
                 <div className="relative z-10 flex flex-col h-full">
                    <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-4">Capital Allocation</h3>
                    <div className="flex-1 w-full min-h-[200px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                             <Pie
                                data={SECTOR_PIE}
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={10}
                                dataKey="value"
                             >
                                {SECTOR_PIE.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />
                                ))}
                             </Pie>
                             <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '15px' }}
                                itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                             />
                          </PieChart>
                       </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                       {SECTOR_PIE.slice(0, 4).map(s => (
                          <div key={s.name} className="flex items-center gap-3">
                             <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.fill }} />
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.name}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* --- VENTURE DEAL REGISTRY --- */}
        <div className="bg-white text-slate-900 rounded-[4rem] border border-slate-100 overflow-hidden shadow-2xl">
           <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                 <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Venture Pipeline</h2>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Live deals and fundraising startups across Africa</p>
              </div>
              <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-[2.5rem] border border-slate-100 w-full md:w-96">
                 <Search className="w-4 h-4 text-slate-400" />
                 <input 
                    className="text-[11px] font-black text-slate-700 bg-transparent outline-none placeholder-slate-400 w-full uppercase tracking-widest"
                    placeholder="Find Startup / Sector..."
                 />
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="pl-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Company / Round</th>
                       <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Vertical</th>
                       <th className="px-6 py-6 text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Target Raise</th>
                       <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hidden md:table-cell">Health Score</th>
                       <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-right pr-10">Access Desk</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {VC_DEALS.map((d, i) => (
                       <tr 
                         key={i} 
                         className={`hover:bg-amber-500/5 transition-all cursor-pointer group ${selectedDeal.id === d.id ? 'bg-amber-500/5' : ''}`}
                         onClick={() => setSelectedDeal(d)}
                       >
                          <td className="pl-10 py-8">
                             <div className="flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${d.color} flex items-center justify-center text-white font-black text-xs shadow-xl`}>
                                   {d.id.slice(0, 1)}
                                </div>
                                <div>
                                   <p className="text-sm font-black text-slate-900 tracking-tight uppercase group-hover:text-amber-600 transition-colors">{d.name}</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                      <Rocket className="w-3 h-3 text-amber-500" /> {d.stage}
                                   </p>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-8">
                             <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200">
                                {d.sector}
                             </span>
                          </td>
                          <td className="px-6 py-8 font-black text-amber-600 text-lg tracking-tighter">
                             {d.target}
                          </td>
                          <td className="px-6 py-8 hidden md:table-cell">
                             <div className="flex items-center gap-4">
                                <div className="flex-1 max-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                   <div className="h-full bg-amber-500 rounded-full" style={{ width: `${d.score}%` }} />
                                </div>
                                <span className="text-[10px] font-black text-slate-900">{d.score}</span>
                             </div>
                          </td>
                          <td className="px-6 py-8 text-right pr-10">
                             <div className="flex items-center justify-end gap-3">
                                <button className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-950 hover:text-white transition-all text-slate-400 shadow-sm">
                                   <ArrowRight className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleOpenAssetModal(d.id); }}
                                  className="p-3 bg-white border border-slate-100 rounded-xl hover:bg-amber-600 hover:text-white transition-all text-slate-900 shadow-sm"
                                >
                                   <Plus className="w-4 h-4" />
                                </button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </section>

      {/* --- VC STRATEGY FOOTER --- */}
      <section className="px-6 md:px-12 max-w-[1600px] mx-auto pb-20">
         <div className="bg-slate-900 rounded-[4rem] border border-white/5 p-12 md:p-20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-full h-full bg-amber-500/5 blur-[120px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-20">
               <div className="w-40 h-40 rounded-[3rem] bg-amber-500 text-slate-950 flex items-center justify-center shadow-3xl shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                  <Activity className="w-20 h-20" />
               </div>
               
               <div className="flex-1 space-y-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-xl">
                     Venture Beta Intelligence
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.85]">
                     Future Proofing <br /> the Africa <span className="text-amber-500">Tech Index.</span>
                  </h2>
                  <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-3xl">
                     Sentill's Venture Terminal tracks over 500 startups and active VC funds. We provide the data layer for founders to raise capital and for investors to deploy with confidence. From Seed to Exit, we are your strategic partner in the African tech ecosystem.
                  </p>
                  
                  <div className="flex flex-wrap gap-6 pt-4">
                     <button className="px-12 py-5 bg-amber-600 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-amber-500 transition-all flex items-center gap-3 active:scale-95">
                        Register for Deal Flow <ArrowRight className="w-5 h-5" />
                     </button>
                     <div className="flex items-center gap-4 px-6 border-l border-white/10">
                        <div>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active SPVs</p>
                           <p className="text-xl font-black text-white uppercase">14</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deployments</p>
                           <p className="text-xl font-black text-white uppercase">$120M+</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

    </div>
  );
}
