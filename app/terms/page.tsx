"use client";

import Link from "next/link";
import { Scale, ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white pt-40 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-16">
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Return to Intelligence Terminal
        </Link>
        
        <div className="space-y-6">
          <div className="w-16 h-16 bg-slate-950 rounded-[2rem] flex items-center justify-center shadow-xl shadow-slate-200">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-black text-slate-950 uppercase tracking-tighter">Terms of Intelligence</h1>
          <p className="text-xl text-slate-500 font-bold uppercase tracking-tight max-w-2xl leading-relaxed">
            Operating framework for Sentill Africa's institutional-grade analytics ecosystem.
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-12">
          <section className="space-y-4">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">1. Non-Custodial Nature</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Sentill Africa is an informational and analytical interface. We are not a bank, broker, or investment manager. We do not hold client funds, execute trades, or provide financial advice. All investment decisions are the sole responsibility of the user.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">2. Information Fidelity</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              While we aggregate data from licensed institutions (NSE, CBK, CMA), Sentill Africa does not warrant the absolute accuracy of real-time yields. Users must verify critical data with their respective fund managers or the Central Bank of Kenya.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">3. Digital Assets and Ownership</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Sentill Africa is a digital asset of Pinch Africa Limited. All proprietary algorithms, "Market Sentiment" indices, and UI/UX design components are the intellectual property of Pinch Africa Limited.
            </p>
          </section>

          <section className="p-10 bg-slate-950 rounded-[3rem] text-white">
             <h4 className="text-sm font-black uppercase tracking-[0.3em] text-blue-400 mb-4">Risk Disclosure</h4>
             <p className="text-xs font-bold leading-relaxed text-slate-400 uppercase tracking-tight">
                INVESTMENT IN THE NAIROBI SECURITIES EXCHANGE OR UNIT TRUSTS CARRIES RISK. PAST PERFORMANCE IS NOT AN INDICATOR OF FUTURE RESULTS. BY USING THIS HUB, YOU ACKNOWLEDGE THE INHERENT VOLATILITY OF AFRICAN MARKETS.
             </p>
          </section>
        </div>
      </div>
    </div>
  );
}
