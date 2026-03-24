"use client";

import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white pt-40 pb-20 px-6">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Return to Intelligence Terminal
        </Link>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-slate-950 uppercase tracking-tighter">Privacy Policy</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Last Updated: March 2026
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          <section className="space-y-4">
            <h3 className="text-xl font-black text-slate-900 uppercase">1. Information Collection</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              We collect minimal data necessary for portfolio tracking. As a non-custodial platform, we do not require access to your bank accounts or CMA CDS accounts. All manual entries are encrypted.
            </p>
          </section>
          
          <section className="space-y-4">
            <h3 className="text-xl font-black text-slate-900 uppercase">2. Use of Intelligence</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Financial data is used exclusively to generate your personalized wealth matrix and correlation reports. We do not sell user data to third-party lenders or insurance providers.
            </p>
          </section>

          <section className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100">
             <p className="text-sm text-blue-800 font-bold leading-relaxed">
                Sentill employs advanced biometric and hardware-key security standards for all Premium Tier accounts.
             </p>
          </section>
        </div>
      </div>
    </div>
  );
}
