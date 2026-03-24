"use client";

import { useState } from "react";
import { Users, Plus, TrendingUp, ShieldCheck, Building2, Landmark, PieChart, Activity, Clock, CheckCircle2, Zap, BrainCircuit, ArrowRight, Calculator, HandCoins } from "lucide-react";

const CHAMA_ASSETS = [
  { id: "CA-01", name: "Sanlam KES MMF", type: "Money Market", allocation: "35%", value: "KES 4,970,000", yield_1yr: "16.1%", status: "Active" },
  { id: "CA-02", name: "IFB1/2023/17", type: "Sovereign Bond", allocation: "45%", value: "KES 6,390,000", yield_1yr: "17.9%", status: "Locked" },
  { id: "CA-03", name: "Acorn D-REIT", type: "Real Estate", allocation: "20%", value: "KES 2,840,000", yield_1yr: "9.2%", status: "Active" },
];

const MEMBERS = [
  { name: "John N.", role: "Treasurer", contribution: "KES 4,500,000", share: "31.7%" },
  { name: "David K.", role: "Chairperson", contribution: "KES 3,200,000", share: "22.5%" },
  { name: "Sarah O.", role: "Member", contribution: "KES 3,000,000", share: "21.1%" },
  { name: "Grace M.", role: "Member", contribution: "KES 2,000,000", share: "14.1%" },
  { name: "Peter W.", role: "Member", contribution: "KES 1,500,000", share: "10.6%" },
];

export default function DashboardChamaPage() {
  const [activeTab, setActiveTab] = useState<"assets" | "members" | "loans">("assets");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-emerald-100">
              <Users className="w-3 h-3" /> Prestige Wealth Group
           </div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Group Intelligence</h1>
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
             Aggregated Net Asset Value & Member Equity
           </p>
        </div>
        <div className="flex items-center gap-3">
           <button className="px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2">
             <ShieldCheck className="w-4 h-4" /> Manage Access
           </button>
           <button className="px-5 py-3 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl flex items-center gap-2">
             <Plus className="w-4 h-4" /> Log Group Asset
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-all group-hover:scale-150" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 relative z-10">Total Group NAV</h3>
            <p className="text-4xl font-black text-slate-900 tracking-tighter relative z-10">KES 14.2M</p>
            <div className="flex items-center gap-2 mt-4 relative z-10">
               <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-widest">
                 <TrendingUp className="w-3 h-3" /> +14.2% YTD
               </span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Across 3 Assets</span>
            </div>
         </div>
         
         <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Active Members</h3>
            <div className="flex items-end gap-3">
               <p className="text-4xl font-black text-slate-900 tracking-tighter">5</p>
               <div className="flex -space-x-3 pb-1">
                  {[1,2,3,4,5].map(i => (
                     <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {MEMBERS[i-1].name[0]}
                     </div>
                  ))}
               </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 flex items-center gap-1">
               <ShieldCheck className="w-3 h-3 text-emerald-500" /> Fully Kyc Verified
            </p>
         </div>

         <div className="bg-slate-950 text-white p-6 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 relative z-10">Next Scheduled Dividend</h3>
            <p className="text-2xl font-black tracking-tight text-white relative z-10">KES 412,000</p>
            <div className="flex items-center justify-between mt-4 relative z-10">
               <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                 <Landmark className="w-3 h-3 text-blue-400" /> IFB1/2023/17
               </span>
               <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md uppercase tracking-widest">
                 In 14 Days
               </span>
            </div>
         </div>
      </div>

      {/* Sentill AI Insights (Group Level) */}
      <div className="border border-indigo-100 bg-indigo-50/50 rounded-[2.5rem] p-8 lg:p-10 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none transition-all duration-700 group-hover:scale-110" />
         <div className="flex flex-col md:flex-row gap-8 relative z-10 items-start">
            <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200 shadow-lg shadow-indigo-500/20">
               <Zap className="w-8 h-8 animate-pulse" />
            </div>
            <div className="flex-1 space-y-4">
               <div>
                 <h3 className="text-xl font-black text-indigo-950 uppercase tracking-tight flex items-center gap-2">
                   Sentill AI Group Oracle
                   <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Live Analysis</span>
                 </h3>
                 <p className="text-[11px] font-bold text-indigo-600/60 uppercase tracking-widest mt-1">
                   Algorithmic Treasury Optimization for Prestige Wealth Group
                 </p>
               </div>
               <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm">
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded">High Probability</span>
                     </div>
                     <h4 className="text-sm font-black text-slate-900 leading-tight mb-2">Reallocate 15% to Upcoming IFB</h4>
                     <p className="text-xs font-medium text-slate-500 leading-relaxed mb-4">
                        Moving KES 2.1M from Money Market (16.1%) to the new Infrastructure Bond (est. 18.5% tax-free) will increase group net annual yield by KES 62,000.
                     </p>
                     <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1 transition-colors">
                        Simulate Move <ArrowRight className="w-3 h-3" />
                     </button>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm filter grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                     <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[2px] z-10 rounded-2xl group-hover:hidden transition-all text-[10px] font-black text-indigo-900 uppercase tracking-widest">
                        <BrainCircuit className="w-3 h-3 mr-2" /> Upgrade to View
                     </div>
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1 rounded">Risk Alert</span>
                     </div>
                     <h4 className="text-sm font-black text-slate-900 leading-tight mb-2">D-REIT Liquidity Warning</h4>
                     <p className="text-xs font-medium text-[transparent] bg-slate-200 rounded animate-pulse leading-relaxed mb-4">
                        This text is blurred out because you need to upgrade to sentill pro to unlock deeper ai insights for your group portfolio dynamics and stress tests.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Tabs Layout */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-sm">
         <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-6">
            <button 
               onClick={() => setActiveTab('assets')}
               className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                 activeTab === 'assets' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
               }`}
            >
               Group Portfolio
            </button>
            <button 
               onClick={() => setActiveTab('members')}
               className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                 activeTab === 'members' ? 'bg-slate-950 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
               }`}
            >
               Member Equity
            </button>
            <button 
               onClick={() => setActiveTab('loans')}
               className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                 activeTab === 'loans' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
               }`}
            >
               Treasury & Loans
            </button>
         </div>

         {activeTab === 'loans' && (
            <div className="p-6">
               <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1 space-y-6">
                     <div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">AI Loan Underwriting</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Request loans instantly backed by your equity multiplier.</p>
                     </div>
                     <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
                           <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Your Borrowing Power (3x Equity)</span>
                           <span className="text-xl font-black text-indigo-600">KES 13,500,000</span>
                        </div>
                        <div className="space-y-4">
                           <div>
                              <label className="text-[10px] font-black uppercase text-slate-400 block mb-2">Requested Amount</label>
                              <div className="relative">
                                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">KES</span>
                                 <input type="number" placeholder="0.00" className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                              </div>
                           </div>
                           <button className="w-full py-4 bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md">
                              <Calculator className="w-4 h-4" /> Run AI Loan Simulation
                           </button>
                        </div>
                     </div>
                  </div>
                  <div className="w-full md:w-80 flex-shrink-0">
                     <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">Active Liabilities</h4>
                        <div className="space-y-4">
                           <div className="border border-amber-200 bg-amber-50 rounded-2xl p-4">
                              <div className="flex items-start justify-between">
                                 <div>
                                    <p className="text-[11px] font-black text-slate-900 uppercase">Emergency Loan</p>
                                    <p className="text-[9px] font-bold text-amber-600 uppercase mt-0.5">Due in 14 days</p>
                                 </div>
                                 <HandCoins className="w-4 h-4 text-amber-500" />
                              </div>
                              <p className="text-lg font-black text-slate-900 mt-2">KES 250,000</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'assets' && (
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                     <tr className="border-b border-slate-100">
                        <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Name</th>
                        <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</th>
                        <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Principal Value</th>
                        <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Group Weight</th>
                        <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Yield p.a.</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {CHAMA_ASSETS.map((asset, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                                    {asset.type === 'Money Market' ? <Activity className="w-4 h-4 text-emerald-600" /> : 
                                     asset.type === 'Sovereign Bond' ? <Landmark className="w-4 h-4 text-blue-600" /> :
                                     <Building2 className="w-4 h-4 text-amber-600" />}
                                 </div>
                                 <div>
                                    <p className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors cursor-pointer text-sm">{asset.name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{asset.id}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="py-4 px-4">
                              <span className="text-[10px] font-black border border-slate-200 bg-slate-50 text-slate-600 px-2 py-1 rounded uppercase tracking-widest">
                                 {asset.type}
                              </span>
                           </td>
                           <td className="py-4 px-4 font-black text-slate-900 text-sm">
                              {asset.value}
                           </td>
                           <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                 <span className="text-[11px] font-bold text-slate-600">{asset.allocation}</span>
                                 <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: asset.allocation }} />
                                 </div>
                              </div>
                           </td>
                           <td className="py-4 px-4 text-right">
                              <span className="text-sm font-black text-emerald-600">{asset.yield_1yr}</span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         {activeTab === 'members' && (
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                     <tr className="border-b border-slate-100">
                        <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Name</th>
                        <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Governance Role</th>
                        <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Contribution</th>
                        <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Equity Share</th>
                        <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {MEMBERS.map((member, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                           <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-black text-xs border border-slate-200 flex items-center justify-center">
                                    {member.name[0]}
                                 </div>
                                 <p className="font-bold text-slate-900 text-sm">{member.name}</p>
                              </div>
                           </td>
                           <td className="py-4 px-4">
                              <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${
                                member.role === 'Treasurer' || member.role === 'Chairperson' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-500 border border-slate-200'
                              }`}>
                                 {member.role}
                              </span>
                           </td>
                           <td className="py-4 px-4 font-black text-slate-900 text-sm">
                              {member.contribution}
                           </td>
                           <td className="py-4 px-4">
                              <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 uppercase tracking-widest">
                                 {member.share}
                              </span>
                           </td>
                           <td className="py-4 px-4 text-right">
                              <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-end gap-1 uppercase tracking-widest">
                                 <CheckCircle2 className="w-3 h-3" /> Fully Vested
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
    </div>
  );
}
