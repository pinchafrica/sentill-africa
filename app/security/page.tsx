"use client";

import Link from "next/link";
import { ShieldCheck, Lock, Eye, ArrowLeft } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white pt-40 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Return to Intelligence Terminal
        </Link>
        
        <div className="space-y-4">
          <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-blue-500/20">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter">Security & Compliance</h1>
          <p className="text-xl text-slate-500 font-bold uppercase tracking-tight max-w-2xl leading-relaxed">
            Sovereign-grade protection for national wealth data. Sentill is a zero-custody intelligence platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            { title: "Zero-Custody Principle", desc: "Sentill never touches your capital. We provide high-fidelity intelligence, not custody.", icon: ShieldCheck },
            { title: "Military-Grade Encryption", desc: "All logged portfolio data is encrypted with SHA-256 and synchronized securely.", icon: Lock },
            { title: "Regulatory Guardrails", desc: "We track and verify only CMA-regulated MMFs and NSE-listed assets for total compliance.", icon: Eye },
            { title: "Institutional Audits", desc: "Generate certified wealth reports for SACCO or Chama audits with one-tap precision.", icon: ShieldCheck },
          ].map((item, i) => (
            <div key={i} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4">
              <item.icon className="w-8 h-8 text-blue-600" />
              <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">{item.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
