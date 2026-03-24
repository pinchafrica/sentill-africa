"use client";

import { Users, ShieldCheck, Activity, LineChart, PieChart, Building2, TrendingUp, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function ChamaHubPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 bg-emerald-950 overflow-hidden text-white border-t border-white/10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] -mr-96 -mt-96 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] -ml-64 -mb-64 pointer-events-none" />
        
        <div className="max-w-[1200px] mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-300 text-[10px] font-black uppercase tracking-[0.3em]">
              <Users className="w-3 h-3" /> Sentill Groups
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-tight drop-shadow-2xl">
              Institutional Power for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Chamas</span>.
            </h1>
            <p className="text-emerald-100/70 text-lg sm:text-xl font-medium leading-relaxed max-w-xl">
              Transform your investment group's Excel sheets into a live, institutional-grade data terminal. Monitor aggregated assets, track member contributions, and analyze unified yields in real-time.
            </p>
            <div className="flex flex-wrap items-center gap-4">
               <Link href="/dashboard/chamas" className="px-8 py-4 bg-white text-emerald-950 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors shadow-xl inline-block">
                 Register Your Chama
               </Link>
            </div>
          </div>
          <div className="hidden lg:block">
             <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 shadow-2xl backdrop-blur-sm relative">
                <div className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                  Live Demo
                </div>
                <h3 className="text-[11px] font-black text-emerald-300 uppercase tracking-widest mb-6">Aggregated Group AUM</h3>
                <div className="space-y-6">
                   <div className="flex items-end justify-between border-b border-white/10 pb-4">
                      <div>
                         <p className="text-4xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200">KES 14.2M</p>
                         <p className="text-[10px] text-emerald-200/50 font-bold uppercase tracking-widest">Across 4 Asset Classes</p>
                      </div>
                      <div className="text-emerald-400 text-sm font-black flex items-center gap-1"><TrendingUp className="w-4 h-4" /> +12.4%</div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                         <div className="flex items-center gap-2 mb-2">
                            <PieChart className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-bold text-emerald-200/70 uppercase">MMF Holdings</span>
                         </div>
                         <p className="text-lg font-black text-white">KES 6.5M</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                         <div className="flex items-center gap-2 mb-2">
                            <Building2 className="w-4 h-4 text-teal-400" />
                            <span className="text-[10px] font-bold text-emerald-200/70 uppercase">Real Estate</span>
                         </div>
                         <p className="text-lg font-black text-white">KES 4.2M</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-slate-50 relative">
        <div className="max-w-[1200px] mx-auto px-6">
           <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em]">Group Intelligence</h2>
              <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                 A Single Source of Truth for Member Assets.
              </h3>
              <p className="text-lg text-slate-500 font-medium">
                 Stop relying on outdated WhatsApp updates and fragmented spreadsheets. Sentill provides a centralized, cryptographically secure dashboard for your entire investment group.
              </p>
           </div>

           <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Activity,
                  title: "Unified Live Dashboard",
                  color: "emerald",
                  desc: "Connect your Chama's MMFs, Sacco deposits, and NSE portfolios to a single terminal. View your unified Net Asset Value (NAV) update in real-time."
                },
                {
                  icon: ShieldCheck,
                  title: "Role-Based Access",
                  color: "blue",
                  desc: "Chama Admins can log and manage assets, while standard members get View-Only access to monitor group performance and individual contributions."
                },
                {
                  icon: LineChart,
                  title: "Dividend & Yield Tracking",
                  color: "indigo",
                  desc: "Automatically project expected coupon payments from infrastructure bonds and historical SACCO dividends directly onto your group calendar."
                }
              ].map((f, i) => (
                <div key={i} className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-xl hover:-translate-y-2 transition-transform duration-300">
                   <div className={`w-14 h-14 rounded-2xl bg-${f.color}-50 text-${f.color}-600 flex items-center justify-center mb-6`}>
                      <f.icon className="w-6 h-6" />
                   </div>
                   <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{f.title}</h4>
                   <p className="text-slate-500 text-sm font-medium leading-relaxed">{f.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Admin Dashboard Preview Call-out */}
      <section className="py-24 max-w-[1200px] mx-auto px-6">
         <div className="bg-slate-950 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            <ShieldCheck className="w-16 h-16 text-emerald-400 mb-8" />
            <h3 className="text-4xl font-black text-white tracking-tight mb-6">Designed for Chama Administrators</h3>
            <p className="text-slate-400 text-lg max-w-2xl mb-10">
               If you are the Treasurer or Admin of your investment group, you can spin up a Sentill Chama Terminal instantly. Log group assets safely and invite members to track performance.
            </p>
            <div className="flex items-center gap-4">
               <Link href="/dashboard/chamas" className="text-center px-8 py-4 bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors shadow-xl shadow-emerald-500/20">
                 Create Chama Dashboard
               </Link>
               <Link href="/auth/register" className="text-center px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                 Member Login
               </Link>
            </div>
         </div>
      </section>

    </div>
  );
}
