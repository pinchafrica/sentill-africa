"use client";

import { useState, useMemo } from "react";
import { 
  Briefcase, TrendingUp, Activity, Globe, Zap, ArrowRight, 
  Plus, Info, Award, ChevronRight, Search, Landmark, Shield, 
  BarChart4, Layers, Database, PieChart, FlaskConical, Filter, Scale, 
  Trophy, Globe2, BarChart3, Presentation
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend, LineChart, Line
} from "recharts";
import AssetModal from "@/components/AssetModal";
import { motion, AnimatePresence } from "framer-motion";

const PE_FUNDS = [
  { 
    id: "HEL-I", 
    name: "Helios Investment Partners", 
    short: "Helios",
    strategy: "Growth Capital", 
    irr: "22.5%", 
    aum: "$3.6B", 
    status: "Active", 
    regions: "Pan-Africa", 
    vintage: "2021", 
    exitStrategy: "IPO / Trade Sale",
    minTicket: "$10M+",
    sectors: ["Fintech", "Energy", "Telecom"],
    description: "Helios is the largest Africa-focused private investment firm, specializing in growth capital for scalable regional champions.",
    icon: Trophy,
    color: "from-blue-600 to-slate-900"
  },
  { 
    id: "EXS-I", 
    name: "Exis Capital (EA Fund V)", 
    short: "Exis",
    strategy: "Leveraged Buyout", 
    irr: "18.8%", 
    aum: "$1.2B", 
    status: "Closed", 
    regions: "East Africa", 
    vintage: "2020", 
    exitStrategy: "Secondary Buyout",
    minTicket: "$5M+",
    sectors: ["Healthcare", "Manufacturing"],
    description: "Exis Capital focuses on control-oriented buyouts of mid-sized East African enterprises with strong cash flows.",
    icon: Scale,
    color: "from-emerald-600 to-slate-900"
  },
  { 
    id: "SDR-I", 
    name: "Sedar Strategic IV", 
    short: "Sedar",
    strategy: "Small Cap / SME", 
    irr: "24.2%", 
    aum: "$450M", 
    status: "Fundraising", 
    regions: "Kenya / Uganda", 
    vintage: "2024", 
    exitStrategy: "Direct Listing",
    minTicket: "$1M+",
    sectors: ["Agri-Tech", "Logistics"],
    description: "Sedar focuses on institutionalizing high-growth SMEs in the EAC, bridging the gap between seed and growth capital.",
    icon: FlaskConical,
    color: "from-amber-500 to-slate-900"
  },
  { 
    id: "AVR-I", 
    name: "Adenia Partners V", 
    short: "Adenia",
    strategy: "Control Growth", 
    irr: "17.4%", 
    aum: "$800M", 
    status: "Active", 
    regions: "Sub-Saharan Africa", 
    vintage: "2022", 
    exitStrategy: "Trade Sale",
    minTicket: "$10M+",
    sectors: ["Consumer Goods", "B2B Services"],
    description: "Adenia Partners is a private equity firm investing in Sub-Saharan Africa, focusing on business transformation and ESG scaling.",
    icon: Shield,
    color: "from-indigo-600 to-slate-900"
  },
];

const SECTOR_PERFORMANCE = [
  { sector: 'Fintech', multiple: 4.8 },
  { sector: 'Energy', multiple: 3.2 },
  { sector: 'Agri', multiple: 2.9 },
  { sector: 'Health', multiple: 4.1 },
  { sector: 'Logistics', multiple: 3.5 },
];

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-950 border border-white/10 rounded-2xl p-4 shadow-2xl text-white">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex justify-between gap-6 py-1">
           <span className="text-[10px] font-bold text-slate-500 uppercase">{p.name}</span>
           <span className="text-sm font-black text-blue-400">{p.value}x</span>
        </div>
      ))}
    </div>
  );
};

export default function PEPage() {
  const [selectedFund, setSelectedFund] = useState(PE_FUNDS[0]);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [prefilledAsset, setPrefilledAsset] = useState<string | undefined>(undefined);
  const [activeSegment, setActiveSegment] = useState("Growth");

  const handleOpenAssetModal = (assetId?: string) => {
    setPrefilledAsset(assetId);
    setIsAssetModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20 pt-24">
      <AssetModal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} prefilledAsset={prefilledAsset} />

      {/* --- PREMIUM HERO --- */}
      <section className="px-6 md:px-12 max-w-[1600px] mx-auto mb-16">
        <div className="relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-slate-900 via-slate-950 to-black p-12 md:p-20 border border-white/5 shadow-3xl">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />
           
           <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-16">
              <div className="flex-1 space-y-8">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">
                    <Shield className="w-4 h-4" /> SEC/CMA Accredited Hub
                 </div>
                 <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.85]">
                    PRIVATE <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">EQUITY.</span>
                 </h1>
                 <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] max-w-xl leading-relaxed">
                    Institutional Deal Flow. Direct Co-investments. Secondary Portfolios. 
                    <br />Access the $30bn African Private Market Liquidity.
                 </p>
                 
                 <div className="flex flex-wrap gap-4">
                    <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center gap-2">
                       <BarChart4 className="w-4 h-4" /> Download Deal Sheet
                    </button>
                    <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                       <Globe2 className="w-4 h-4" /> Foreign LP Desk
                    </button>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 lg:w-[400px]">
                 {[
                    { label: "Tracked AUM", value: "$5.8Bn", icon: Landmark },
                    { label: "Target IRR", value: "18-24%", icon: TrendingUp },
                    { label: "Avg Vintage", value: "2022", icon: Activity },
                    { label: "Deal Velocity", value: "High", icon: Zap },
                 ].map((stat, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2.5rem]">
                       <stat.icon className="w-5 h-5 text-blue-400 mb-3" />
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                       <p className="text-xl font-black text-white tracking-tight">{stat.value}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* --- ANALYTICS DASHBOARD --- */}
      <section className="px-6 md:px-12 max-w-[1600px] mx-auto mb-16 space-y-12">
        <div className="grid lg:grid-cols-12 gap-10">
           {/* Detailed Fund Breakdown */}
           <div className="lg:col-span-8 bg-slate-900 rounded-[4rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden flex flex-col min-h-[600px]">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12 relative z-10">
                 <div className="flex items-center gap-6">
                    <div className={`w-20 h-20 rounded-[2rem] bg-gradient-to-br ${selectedFund.color} flex items-center justify-center shadow-2xl`}>
                       <selectedFund.icon className="w-10 h-10 text-white" />
                    </div>
                    <div>
                       <h2 className="text-3xl font-black uppercase tracking-tighter">{selectedFund.name}</h2>
                       <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{selectedFund.strategy}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedFund.regions}</span>
                       </div>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-4xl font-black text-white tracking-tighter">{selectedFund.irr}</p>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Target Net IRR</p>
                 </div>
              </div>

              <div className="grid md:grid-cols-4 gap-6 mb-12 relative z-10">
                 {[
                    { l: "Total AUM", v: selectedFund.aum, icon: Database },
                    { l: "Vintage Yr", v: selectedFund.vintage, icon: Activity },
                    { l: "Exit Route", v: selectedFund.exitStrategy, icon: Presentation },
                    { l: "Ticket Size", v: selectedFund.minTicket, icon: Briefcase },
                 ].map((m, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-5 rounded-3xl">
                       <m.icon className="w-4 h-4 text-blue-500 mb-2" />
                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{m.l}</p>
                       <p className="text-sm font-black text-white">{m.v}</p>
                    </div>
                 ))}
              </div>

              <div className="flex-1 w-full relative z-10 min-h-[250px]">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Sector Alpha Comparison (Exit Multiples)</h3>
                 </div>
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SECTOR_PERFORMANCE}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                       <XAxis dataKey="sector" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 900 }} />
                       <YAxis hide domain={[0, 6]} />
                       <Tooltip content={<DarkTooltip />} cursor={{ fill: '#ffffff05' }} />
                       <Bar dataKey="multiple" name="Exit Multiple" fill="#3b82f6" radius={[12, 12, 0, 0]} barSize={40}>
                         {SECTOR_PERFORMANCE.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#1e293b'} />
                         ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>

              <div className="mt-10 pt-10 border-t border-white/5 flex flex-wrap gap-4 relative z-10">
                 {selectedFund.sectors.map(s => (
                    <span key={s} className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[9px] font-black text-blue-300 uppercase tracking-widest">
                       {s} Focus
                    </span>
                 ))}
              </div>
           </div>

           {/* Quick Actions / LP Access */}
           <div className="lg:col-span-4 flex flex-col gap-10">
              <div className="bg-white rounded-[4rem] p-10 text-slate-900 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                 <div className="relative z-10">
                    <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-6 transform group-hover:rotate-12 transition-transform duration-500">
                       <Zap className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-4 leading-none">Co-Investment <br /> Opportunity.</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-10">
                       Sentill Pro members gain secondary access to vetted PE deals alongside lead institutions. Participation starts at $250k.
                    </p>
                    
                    <div className="space-y-4 mb-10">
                       {[
                          { l: "Platform Fee", v: "1.5% Asset p.a." },
                          { l: "Carry Model", v: "20% over 8% hurdle" },
                          { l: "Legal Hub", v: "Mauritius / Kenya" },
                       ].map(f => (
                          <div key={f.l} className="flex justify-between items-end border-b border-slate-100 pb-2">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{f.l}</span>
                             <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{f.v}</span>
                          </div>
                       ))}
                    </div>
                 </div>
                 
                 <button 
                   onClick={() => handleOpenAssetModal(selectedFund.id)}
                   className="w-full py-5 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 transition-all hover:bg-blue-600 border-none group flex items-center justify-center gap-3"
                 >
                    Request LP Deck <ArrowRight className="w-4 h-4" />
                 </button>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[4rem] p-10 text-white relative overflow-hidden flex-1 shadow-2xl">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                 <Globe className="w-12 h-12 text-white/50 mb-6" />
                 <h3 className="text-xl font-black uppercase tracking-tight mb-2 flex items-center gap-2">
                    <FlaskConical className="w-5 h-5" /> Secondary Desk
                 </h3>
                 <p className="text-xs text-blue-100 font-medium leading-relaxed">
                    Looking for early exits or discounted entries? Our LP Secondary Market matches institutional buyers with departing fund partners.
                 </p>
                 <div className="mt-8 pt-8 border-t border-white/20 flex items-center justify-between">
                    <div>
                       <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest leading-none">Open Bids</p>
                       <p className="text-lg font-black mt-1">$142.5M</p>
                    </div>
                    <button className="p-3 bg-white text-blue-600 rounded-xl hover:scale-110 transition-transform">
                       <Plus className="w-5 h-5" />
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* --- DEAL REGISTRY TABLE --- */}
        <div className="bg-slate-900 rounded-[4rem] border border-white/5 overflow-hidden shadow-2xl">
           <div className="p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                 <h2 className="text-2xl font-black uppercase tracking-tighter">Unified Fund Registry</h2>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Cross-referencing the top 25 institutional PE managers</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/5 w-full md:w-80 transition-all focus-within:bg-white/10 focus-within:border-blue-500">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input 
                       className="text-[11px] font-black text-white bg-transparent outline-none placeholder-slate-500 w-full uppercase tracking-widest"
                       placeholder="Find Fund Manager..."
                    />
                 </div>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-white/5">
                       <th className="pl-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Institution / LP Model</th>
                       <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Strategy Segment</th>
                       <th className="px-6 py-6 text-[10px] font-black text-emerald-500 uppercase tracking-widest">Target IRR</th>
                       <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Asset Cap (AUM)</th>
                       <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-10">Registry Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {PE_FUNDS.map((f, i) => (
                       <tr 
                         key={i} 
                         className={`hover:bg-blue-600/10 transition-all cursor-pointer group ${selectedFund.id === f.id ? 'bg-blue-600/5' : ''}`}
                         onClick={() => setSelectedFund(f)}
                       >
                          <td className="pl-10 py-8">
                             <div className="flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white font-black text-sm shadow-xl`}>
                                   <f.icon className="w-6 h-6" />
                                </div>
                                <div>
                                   <p className="text-sm font-black text-white tracking-tight uppercase group-hover:text-blue-400 transition-colors">{f.name}</p>
                                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                      <Globe className="w-3 h-3" /> {f.regions}
                                   </p>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-8">
                             <span className="px-3 py-1 bg-white/5 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5 group-hover:border-blue-500/30 transition-colors">
                                {f.strategy}
                             </span>
                          </td>
                          <td className="px-6 py-8">
                             <p className="text-lg font-black text-emerald-500 tracking-tighter">{f.irr}</p>
                             <p className="text-[8px] font-black text-emerald-600/50 uppercase tracking-widest leading-none mt-1">Net Flowing</p>
                          </td>
                          <td className="px-6 py-8 hidden md:table-cell">
                             <p className="text-sm font-black text-white uppercase">{f.aum}</p>
                             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Deployed</p>
                          </td>
                          <td className="px-6 py-8 text-right pr-10">
                             <div className="flex items-center justify-end gap-3">
                                <button className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-slate-400">
                                   <ArrowRight className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleOpenAssetModal(f.id); }}
                                  className="p-3 bg-slate-950 border border-white/10 rounded-xl hover:bg-emerald-600 hover:text-white transition-all text-white shadow-xl"
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

      {/* --- STRATEGIC INSIGHT CARD --- */}
      <section className="px-6 md:px-12 max-w-[1600px] mx-auto">
         <div className="bg-gradient-to-br from-slate-900 to-black rounded-[4rem] p-12 md:p-20 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-full h-full bg-blue-600/5 blur-[120px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-20">
               <div className="w-40 h-40 rounded-[3rem] bg-white text-slate-900 flex items-center justify-center shadow-3xl shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                  <BarChart3 className="w-20 h-20" />
               </div>
               
               <div className="flex-1 space-y-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">
                     Institutional Alpha Insight
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.85]">
                     Bridging the <br /> Capital Efficiency <span className="text-blue-500">Gap.</span>
                  </h2>
                  <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-3xl">
                     African Private Equity continues to outperform public markets due to the 'Liquidity Premium' and direct operational value-add. Over the last 10 years, Tier-1 pan-African PE funds have delivered a median IRR of 14.5% in USD terms, significantly higher than regional NSE returns.
                  </p>
                  
                  <div className="flex flex-wrap gap-6 pt-4">
                     <button className="px-12 py-5 bg-blue-600 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-600/20 hover:bg-blue-500 transition-all flex items-center gap-3">
                        Join Institutional Briefings <ArrowRight className="w-5 h-5" />
                     </button>
                     <div className="flex items-center gap-4 px-6 border-l border-white/10">
                        <div>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active LPs</p>
                           <p className="text-xl font-black text-white uppercase">1.4K+</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deployments</p>
                           <p className="text-xl font-black text-white uppercase">$850M+</p>
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
