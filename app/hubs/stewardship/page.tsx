"use client";

import { motion } from "framer-motion";
import { 
  ShieldCheck, Landmark, Users, ArrowRight,
  Sparkles, Leaf, Scale, HeartHandshake, Building2
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function StewardshipHub() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-blue-500/30">
      <Navbar />

      <div className="pt-40 max-w-[1480px] mx-auto px-6 lg:px-12 pb-32">
        {/* ─── HERO SECTION ──────────────────────────── */}
        <div className="relative overflow-hidden rounded-[3rem] bg-slate-950 p-10 md:p-20 shadow-2xl border border-slate-800 mb-16">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />
           
           <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Multi-Generational Wealth</span>
                 </div>
                 
                 <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.1]">
                    Legacy & <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                      Stewardship.
                    </span>
                 </h1>
                 
                 <p className="text-sm md:text-base font-medium text-slate-400 leading-relaxed max-w-xl">
                    Transcend traditional wealth management. Sentill Stewardship provides Family Office infrastructure, bespoke trust planning, and philanthropic vehicles designed to preserve capital across generations.
                 </p>
                 
                 <div className="flex flex-wrap gap-4">
                    <button className="px-8 py-4 bg-white text-slate-950 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-amber-500 hover:text-white transition-all shadow-xl hover:-translate-y-1 active:scale-95 flex items-center gap-2">
                       Consult an Advisor <ArrowRight className="w-4 h-4" />
                    </button>
                    <button className="px-8 py-4 bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">
                       Explore Legal Frameworks
                    </button>
                 </div>
              </div>
              
              <div className="hidden lg:grid grid-cols-2 gap-6 relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white/5 rounded-full animate-spin-slow pointer-events-none" />
                 
                 {[
                   { icon: ShieldCheck, title: "Trusts & Estates", desc: "Ironclad asset protection." },
                   { icon: Building2, title: "Family Office", desc: "Bespoke centralized management." },
                   { icon: HeartHandshake, title: "Philanthropy", desc: "Structured charitable giving." },
                   { icon: Leaf, title: "ESG & Impact", desc: "Align investments with values." }
                 ].map((item, i) => (
                    <div key={i} className={`bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md hover:bg-white/10 transition-colors ${i === 1 || i === 3 ? 'translate-y-8' : ''}`}>
                       <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center mb-6">
                          <item.icon className="w-6 h-6" />
                       </div>
                       <h3 className="text-lg font-black text-white tracking-tight mb-2">{item.title}</h3>
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                          {item.desc}
                       </p>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* ─── PILLARS OF STEWARDSHIP ──────────────────────────── */}
        <div className="mb-24">
           <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">The Pillars of Preservation</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                 Robust frameworks securing your wealth beyond your lifetime.
              </p>
           </div>
           
           <div className="grid md:grid-cols-3 gap-8">
              {/* Trust Pillar */}
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 hover:shadow-2xl transition-all group hover:-translate-y-2">
                 <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:bg-amber-50 group-hover:border-amber-200 group-hover:text-amber-600 transition-colors">
                    <Scale className="w-8 h-8 text-slate-400 group-hover:text-amber-500 transition-colors" />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4">Living & Testamentary Trusts</h3>
                 <p className="text-[12px] font-medium text-slate-500 leading-relaxed mb-8">
                    Isolate assets from probate and civil liability. Our network of legal fiduciaries structure discretionary, fixed, and charitable trusts tailored to your family's dynamic needs.
                 </p>
                 <ul className="space-y-3 mb-8">
                    {["Probate avoidance", "Creditor protection", "Tax minimization"].map((f, i) => (
                       <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600">
                          <Check className="w-3.5 h-3.5 text-amber-500" /> {f}
                       </li>
                    ))}
                 </ul>
              </div>

              {/* Family Office Pillar */}
              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 hover:shadow-2xl transition-all group hover:-translate-y-2 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px]" />
                 <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:bg-amber-500/20 group-hover:border-amber-500/30 transition-colors relative z-10">
                    <Users className="w-8 h-8 text-white group-hover:text-amber-400 transition-colors" />
                 </div>
                 <h3 className="text-xl font-black text-white tracking-tight mb-4 relative z-10">Multi-Family Office Console</h3>
                 <p className="text-[12px] font-medium text-slate-400 leading-relaxed mb-8 relative z-10">
                    A panoramic view of your global illiquid and liquid assets. Aggregate performance, automate dividend distribution to beneficiaries, and orchestrate board-level strategic oversight.
                 </p>
                 <ul className="space-y-3 mb-8 relative z-10">
                    {["Consolidated Reporting", "Next-Gen Education", "Concierge Advisory"].map((f, i) => (
                       <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-300">
                          <Check className="w-3.5 h-3.5 text-amber-400" /> {f}
                       </li>
                    ))}
                 </ul>
              </div>

              {/* Philanthropy Pillar */}
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 hover:shadow-2xl transition-all group hover:-translate-y-2">
                 <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:bg-amber-50 group-hover:border-amber-200 group-hover:text-amber-600 transition-colors">
                    <HeartHandshake className="w-8 h-8 text-slate-400 group-hover:text-amber-500 transition-colors" />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tight mb-4">Strategic Philanthropy</h3>
                 <p className="text-[12px] font-medium text-slate-500 leading-relaxed mb-8">
                    Deploy capital towards causes that compound human progress. We facilitate Donor-Advised Funds (DAFs) and private foundations with tax-optimized structural integrity.
                 </p>
                 <ul className="space-y-3 mb-8">
                    {["Donor-Advised Funds", "Endowment Management", "Impact Auditing"].map((f, i) => (
                       <li key={i} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600">
                          <Check className="w-3.5 h-3.5 text-amber-500" /> {f}
                       </li>
                    ))}
                 </ul>
              </div>
           </div>
        </div>

        {/* ─── DEDICATED CONCIERGE CTA ──────────────────────── */}
        <div className="bg-amber-50 border border-amber-200 rounded-[3rem] p-12 md:p-20 flex flex-col items-center text-center relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-amber-200/50 rounded-full animate-ping-slow pointer-events-none" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-amber-200 rounded-full animate-pulse pointer-events-none" />
           
           <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-xl shadow-amber-200/50 border border-amber-200">
                 <Landmark className="w-10 h-10" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter">
                 Secure Your Dynasty.
              </h2>
              <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                 Access is strictly by application. Sentill Stewardship mandates a minimum AUM of KES 50M (or equivalent) for full fiduciary engagement and Family Office deployment.
              </p>
              
              <div className="pt-6">
                 <button className="px-12 py-5 bg-slate-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-[0_20px_40px_-10px_rgba(245,158,11,0.3)] hover:-translate-y-1 active:scale-95 flex items-center gap-3 mx-auto">
                    Request Private Consultation <ArrowRight className="w-4 h-4" />
                 </button>
                 <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mt-6">
                    Confidential. Fiduciary. Institutional.
                 </p>
              </div>
           </div>
        </div>

      </div>
      
      <Footer />
    </main>
  );
}

// Simple Check Icon Component for this file
function Check(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
