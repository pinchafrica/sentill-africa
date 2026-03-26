"use client";

import { useState } from "react";
import { 
  Users, UserPlus, TrendingUp, Shield, BarChart3, 
  Plus, MessageSquare, Target, Wallet, ArrowRight,
  TrendingDown, Activity, Clock, PieChart, Sparkles, ChevronRight, CheckCircle, XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CHAMAS = [
  { id: 1, name: "The Visionary Titans", balance: 5490200, members: 12, yield: 18.2, loans: 2, completion: 78, color: "bg-blue-600", category: "Wealth Creation" },
  { id: 2, name: "Apex Equity Group", balance: 12500000, members: 8, yield: 22.4, loans: 0, completion: 92, color: "bg-violet-600", category: "Aggressive Equity" },
  { id: 3, name: "Family Legacy Fund", balance: 1200000, members: 4, yield: 15.6, loans: 1, completion: 45, color: "bg-emerald-600", category: "Social Capital" },
];

const MEMBERS = [
  { name: "Johnstone Mutua", role: "Chairman", contribution: 650000, status: "PAID" },
  { name: "Sarah Wambui", role: "Treasurer", contribution: 580000, status: "PAID" },
  { name: "Edward Mule", role: "Secretary", contribution: 420000, status: "PENDING" },
  { name: "Grace Njeri", role: "Member", contribution: 380000, status: "PAID" },
  { name: "David Okomo", role: "Member", contribution: 310000, status: "PAID" },
];

export default function ChamaHubPage() {
  const [activeChama, setActiveChama] = useState(CHAMAS[0]);

  return (
    <div className="min-h-screen bg-slate-50/50 pt-32 pb-20 px-4 md:px-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4">
              <Users className="w-3.5 h-3.5" /> Institutional Group Banking
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Chama Hub</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Manage your investment groups with institutional collective power.</p>
          </div>
          <button className="px-6 py-4 bg-slate-900 text-white rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create New Chama
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Sidebar: My Chamas */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Your Active Groups</h3>
            <div className="space-y-3">
              {CHAMAS.map(chama => (
                <button
                  key={chama.id}
                  onClick={() => setActiveChama(chama)}
                  className={`w-full p-6 rounded-[2rem] border transition-all text-left flex items-center gap-4 ${activeChama.id === chama.id ? "bg-white border-blue-200 shadow-xl ring-4 ring-blue-500/5 translate-x-1" : "bg-white/50 border-slate-200 hover:bg-white"}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm ${chama.color}`}>
                    {chama.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-wide">{chama.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{chama.members} Members · KES {chama.balance.toLocaleString()}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${activeChama.id === chama.id ? "text-blue-500" : "text-slate-300"}`} />
                </button>
              ))}
            </div>

            {/* AI Insight for Chamas */}
            <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/40 transition-all" />
              <Sparkles className="absolute top-4 right-4 w-5 h-5 text-blue-400" />
              <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-3">Chama Intelligence</p>
              <p className="text-xs font-medium text-slate-300 leading-relaxed mb-4">
                "Based on your group saving velocity, you'll hit your KES 5M milestone in 8 months. Moving idle cash to Etica MMF can boost yield by 3.5%."
              </p>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                Run Simulation
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Active Chama Performance */}
            <div className="bg-white border border-slate-200 rounded-[3rem] p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg ${activeChama.color}`}>
                    {activeChama.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{activeChama.name}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Collective Group Fund · {activeChama.category}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all active:scale-95 shadow-lg">
                    <Wallet className="w-4 h-4" /> Group Deposit
                  </button>
                  <button className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all">
                    <MessageSquare className="w-5 h-5 text-slate-700" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[
                  { label: "Group Net Worth", value: "KES " + activeChama.balance.toLocaleString(), icon: Wallet, color: "text-blue-600" },
                  { label: "Annual Yield", value: activeChama.yield + "%", icon: TrendingUp, color: "text-emerald-600" },
                  { label: "Active Loans", value: activeChama.loans, icon: Activity, color: "text-rose-600" },
                  { label: "Milestone", value: activeChama.completion + "%", icon: Target, color: "text-amber-600" },
                ].map((stat, i) => (
                  <div key={i} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                    <stat.icon className={`w-5 h-5 ${stat.color} mb-3 group-hover:scale-110 transition-transform`} />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-base font-black text-slate-900">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Members List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Active Members ({activeChama.members})</h3>
                  <button className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800">Manage Members</button>
                </div>
                <div className="bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100">
                  <table className="w-full text-left">
                    <thead className="bg-white border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Position</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Contribution</th>
                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 px-2">
                      {MEMBERS.map((member, i) => (
                        <tr key={i} className="hover:bg-white transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-600">
                                {member.name.split(" ").map(n => n[0]).join("")}
                              </div>
                              <span className="text-[11px] font-black text-slate-900 uppercase tracking-wide">{member.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{member.role}</span>
                          </td>
                          <td className="px-6 py-5 text-right">
                             <span className="text-[11px] font-black text-slate-900">KES {member.contribution.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-5 text-center">
                             <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${member.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                {member.status === 'PAID' ? <CheckCircle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                                {member.status}
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Bottom Grid: Allocation + Decisions */}
            <div className="grid md:grid-cols-2 gap-6 pb-12">
               <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Group Allocation</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-6 tracking-widest">Collective Asset Diversification</p>
                  
                  <div className="space-y-5">
                    {[
                      { l: "MMF (Liquidity)", v: 45, c: "bg-blue-600" },
                      { l: "Treasury Bonds", v: 35, c: "bg-indigo-600" },
                      { l: "NSE Equities", v: 20, c: "bg-violet-600" }
                    ].map(st => (
                      <div key={st.l}>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 text-slate-700">
                          <span>{st.l}</span>
                          <span>{st.v}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                          <div className={`h-full ${st.c} transition-all duration-1000`} style={{ width: `${st.v}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group border border-slate-800">
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none" />
                  <h3 className="text-sm font-black uppercase tracking-widest mb-1">Group Decisions</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-8 tracking-widest">Active Investment Proposals</p>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                    <p className="text-[9px] font-black uppercase text-blue-400 tracking-[0.2em] mb-3">Vote #105 · 48h Left</p>
                    <p className="text-[11px] font-black text-slate-100 leading-relaxed mb-6 capitalize leading-[1.6]">Adjust group strategy: Increase Equity exposure by 5% targeting Safaricom.</p>
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest mb-2">
                       <span className="text-emerald-400">Yes (75%)</span>
                       <span className="text-rose-400">No (25%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex">
                       <div className="h-full bg-emerald-500 w-[75%]" />
                       <div className="h-full bg-rose-500 w-[25%]" />
                    </div>
                  </div>
                  <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40">
                    Cast Group Vote
                  </button>
               </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
