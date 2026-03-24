"use client";

import Link from "next/link";
import { Users, Target, Globe, ArrowLeft, Trophy, Landmark, ShieldCheck, Scale } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white pt-40 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-16">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Return to Intelligence Terminal
        </Link>
        
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
            <Landmark className="w-3 h-3" /> Institutional Mandate
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-slate-950 uppercase tracking-tighter leading-none">
            The Sentill Mandate: <br/>
            <span className="text-blue-600">Sovereign Wealth Intelligence</span>
          </h1>
          <p className="text-xl text-slate-500 font-bold uppercase tracking-tight max-w-2xl leading-relaxed">
            Aligning national capital allocation with Vision 2030 through precision data and democratic wealth inclusion.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            { 
              title: "Vision 2030 Alignment", 
              desc: "Empowering every Kenyan citizen with the tools to participate in high-yield national development projects and sovereign instruments.", 
              icon: Target 
            },
            { 
              title: "Institutional Transparency", 
              desc: "Aggregating 10,000+ data points from the NSE, CBK, and CMA to provide a unified source of truth for wealth creation.", 
              icon: ShieldCheck 
            },
            { 
              title: "Digital Financial Inclusion", 
              desc: "Lowering the barrier to entry for MMFs, Bonds, and Equities, ensuring marginalized economic segments have Tier-1 market access.", 
              icon: Users 
            },
            { 
              title: "Strategic Capital Policy", 
              desc: "Providing the Ministry of Finance and individual stakeholders with real-time feedback on capital flight and domestic investment utility.", 
              icon: Scale 
            },
          ].map((item, i) => (
            <div key={i} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4 hover:border-blue-200 transition-colors group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">{item.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-950 rounded-[3rem] p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Founder's Commitment</h2>
            <p className="text-slate-400 font-bold uppercase tracking-tight leading-relaxed max-w-2xl">
              "Our mission is to ensure that no Kenyan is left behind in the global digital economy. We are building the infrastructure for a more prosperious, inclusive, and transparent financial future for Africa."
            </p>
            <div className="pt-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700" />
              <div>
                <div className="text-sm font-black uppercase tracking-widest">Leadership Team</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sentill Wealth Hub Nairobi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
