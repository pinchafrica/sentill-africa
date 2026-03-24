"use client";

import { ShieldCheck, Calendar, Download, Building, Landmark, CheckCircle2, X } from "lucide-react";

interface AuditReportProps {
  entity: string;
  status: 'safe' | 'danger' | 'warning';
  onClose: () => void;
}

export default function AuditReport({ entity, status, onClose }: AuditReportProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[4rem] overflow-hidden shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="p-12 md:p-20 space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-12">
            <div className="space-y-4">
               <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                 status === 'safe' ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-rose-50 border-rose-100 text-rose-600'
               }`}>
                  <ShieldCheck className="w-3 h-3" /> Report ID: SNV-2024-{(Math.random()*1000).toFixed(0)}
               </div>
               <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase font-heading">
                 Audit <span className="text-slate-300">Report.</span>
               </h2>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Registry Verification for {entity}</p>
            </div>
            <div className="flex gap-4">
               <button className="px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download PDF
               </button>
            </div>
          </div>

          {/* Report Body */}
          <div className="grid md:grid-cols-2 gap-12">
             <div className="space-y-8">
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity Metadata</h4>
                   <div className="space-y-4">
                      <div className="flex justify-between border-b border-slate-200/50 pb-3">
                         <span className="text-[10px] font-black text-slate-500 uppercase">Regulator</span>
                         <span className="text-[10px] font-black text-slate-900 uppercase">{status === 'safe' ? 'CMA Kenya / SASRA' : 'Unregulated'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200/50 pb-3">
                         <span className="text-[10px] font-black text-slate-500 uppercase">License Status</span>
                         <span className={`text-[10px] font-black uppercase ${status === 'safe' ? 'text-blue-700' : 'text-rose-600'}`}>
                           {status === 'safe' ? 'Active / Verified' : 'No License Found'}
                         </span>
                      </div>
                      <div className="flex justify-between pb-3">
                         <span className="text-[10px] font-black text-slate-500 uppercase">Risk Level</span>
                         <span className={`text-[10px] font-black uppercase ${status === 'safe' ? 'text-blue-600' : 'text-rose-600'}`}>
                           {status === 'safe' ? 'Institutional (Low)' : 'EXPOSURE (High)'}
                         </span>
                      </div>
                   </div>
                </div>

                <div className="p-8 space-y-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Verdict</h4>
                   <p className="text-xs font-bold text-slate-600 uppercase tracking-widest leading-loose">
                     {status === 'safe' 
                       ? 'This platform is fully compliant with Kenyan financial laws. Capital deployment is considered safe up to insurance limits.'
                       : 'Our anti-fraud engine has detected typical "Ponzi" or "Exit-Scam" signals. This entity is currently on our black-list.'}
                   </p>
                </div>
             </div>

             <div className="relative">
                <img 
                   src={status === 'safe' ? "/images/adult-woman-reading-the-news-2026-03-09-23-02-26-utc.jpg" : "/images/verify_sentill_home_1773304027715.webp"} 
                   className="w-full h-full object-cover rounded-[3rem] opacity-20" 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className={`p-8 rounded-full ${status === 'safe' ? 'bg-blue-600/10' : 'bg-rose-500/10'}`}>
                      <ShieldCheck className={`w-24 h-24 ${status === 'safe' ? 'text-blue-600' : 'text-rose-500'}`} />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
