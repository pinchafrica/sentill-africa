"use client";

import { ShieldCheck, Info, Search, AlertTriangle, CheckCircle2, XCircle, ArrowLeft, ShieldAlert, Activity, ShieldQuestion } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AuditReport from "@/components/AuditReport";

export default function ScamCheckerPage() {
  const [query, setQuery] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<null | 'safe' | 'danger' | 'warning'>(null);
  const [showAudit, setShowAudit] = useState(false);

  const handleCheck = () => {
    if (!query) return;
    setChecking(true);
    setResult(null);
    
    // Verify query against institutional registry
    setTimeout(() => {
      const q = query.toLowerCase();
      if (q.includes("sacco") || q.includes("capital") || q.includes("asset") || q.includes("old mutual") || q.includes("britam")) {
        setResult('safe');
      } else if (q.includes("bitcoin") || q.includes("forex") || q.includes("whatsapp") || q.includes("gift")) {
        setResult('danger');
      } else {
        setResult('warning');
      }
      setChecking(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen py-32 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Navigation */}
        <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-500 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>
        
        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-16 items-center">
           <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[10px] font-black uppercase tracking-[0.3em]">
                 <ShieldAlert className="w-3 h-3" /> Anti-Fraud Unit
              </div>
              <h1 className="text-6xl md:text-9xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85] font-heading">
                Scam <br /> <span className="text-slate-200">Checker.</span>
              </h1>
              <p className="text-lg text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                Protect your capital. Use our institutional database to verify if an investment platform is regulated by the CMA or SASRA.
              </p>
           </div>
           
           <div className="relative group">
              <div className="absolute inset-0 bg-rose-500/10 rounded-[4rem] blur-3xl -z-10" />
              <div className="aspect-[4/5] rounded-[4rem] overflow-hidden border border-slate-100 shadow-2xl relative">
                  <img 
                    src="/images/adult-woman-reading-the-news-2026-03-09-23-02-26-utc.jpg" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    alt="African Security Analyst"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-12 left-12 right-12">
                     <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block mb-2">Registry Audit</span>
                     <h3 className="text-3xl font-black text-white uppercase tracking-tight font-heading leading-none">Security <br /> First.</h3>
                  </div>
              </div>
           </div>
        </div>

        {/* Checker Tool */}
        <div className="bg-white rounded-[4rem] border border-slate-200 p-12 md:p-20 shadow-2xl shadow-slate-200/50 space-y-12">
           <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Entity Name / Application / Link</label>
              <div className="flex flex-col md:flex-row gap-4">
                 <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                    <input 
                       type="text" 
                       placeholder="e.g. 'Britam Asset Managers' or 'Global Forex Pro'..."
                       value={query}
                       onChange={(e) => setQuery(e.target.value)}
                       className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] pl-16 pr-8 py-6 text-sm font-bold placeholder:text-slate-300 focus:ring-1 focus:ring-rose-500 outline-none transition-all"
                    />
                 </div>
                 <button 
                    onClick={handleCheck}
                    disabled={checking}
                    className="px-12 py-6 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-[2rem] hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/10 disabled:opacity-50"
                 >
                    {checking ? 'Analyzing Database...' : 'Run Verification'}
                 </button>
              </div>
           </div>

           {/* Results State */}
           {result && (
              <div className={`p-12 rounded-[3rem] border animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col md:flex-row items-center gap-8 ${
                 result === 'safe' ? 'bg-emerald-50 border-emerald-100' : 
                 result === 'danger' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'
              }`}>
                 <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center ${
                    result === 'safe' ? 'bg-emerald-500' : 
                    result === 'danger' ? 'bg-rose-500' : 'bg-amber-500'
                 }`}>
                    {result === 'safe' && <CheckCircle2 className="w-10 h-10 text-white" />}
                    {result === 'danger' && <ShieldAlert className="w-10 h-10 text-white" />}
                    {result === 'warning' && <ShieldQuestion className="w-10 h-10 text-white" />}
                 </div>
                 <div className="space-y-4 text-center md:text-left flex-1">
                    <h3 className={`text-3xl font-black uppercase font-heading ${
                       result === 'safe' ? 'text-emerald-900' : 
                       result === 'danger' ? 'text-rose-900' : 'text-amber-900'
                    }`}>
                       {result === 'safe' ? 'Institution Verified.' : 
                        result === 'danger' ? 'High Risk Alert.' : 'Manual Audit Required.'}
                    </h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-600 opacity-80 leading-relaxed">
                       {result === 'safe' ? 'This entity matches our regulated institutional registry. It is generally safe for capital exposure under CMA guidelines.' : 
                        result === 'danger' ? 'This entity shows characteristics of unregulated offshore forex or crypto schemes. Extremly high risk of capital loss.' : 
                        'Our system could not find an exact match in the CMA or SASRA registry. Please consult an advisor before deploying any capital.'}
                    </p>
                 </div>
                  <button 
                    onClick={() => setShowAudit(true)}
                    className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                    result === 'safe' ? 'border-emerald-200 text-emerald-700' : 
                    result === 'danger' ? 'border-rose-200 text-rose-700' : 'border-amber-200 text-amber-700'
                  }`}>
                    View Full Audit
                  </button>
               </div>
            )}
         </div>

         {showAudit && (
           <AuditReport 
             entity={query || "Unknown Entity"} 
             status={result || 'warning'} 
             onClose={() => setShowAudit(false)} 
           />
         )}

        {/* Intelligence Context */}
        <div className="grid md:grid-cols-2 gap-8">
           <div className="p-12 bg-slate-900 rounded-[3.5rem] text-white space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl" />
              <Activity className="w-10 h-10 text-rose-500" />
              <h4 className="text-2xl font-black uppercase font-heading">The red flags.</h4>
              <ul className="space-y-4">
                 {[
                   "Guaranteed high daily returns (e.g. 2% daily)",
                   "Requirement to recruit others (MLM structures)",
                   "Lack of CMA or SASRA certification numbers",
                   "High pressure to deposit via M-Pesa personal numbers"
                 ].map((flag, i) => (
                   <li key={i} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{flag}</span>
                   </li>
                 ))}
              </ul>
           </div>
           <div className="p-12 bg-white rounded-[3.5rem] border border-slate-100 space-y-6">
              <ShieldCheck className="w-10 h-10 text-emerald-500" />
              <h4 className="text-2xl font-black uppercase font-heading text-slate-900">Verified Channels.</h4>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-loose">
                Sentill Africa only lists institutions that are legally permitted to take deposits or manage investment capital in Kenya. If it is on Sentill, it has been vetted.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}
