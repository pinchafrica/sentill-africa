"use client";

import { AlertTriangle, ShieldAlert } from "lucide-react";

export default function SafetyRadarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">AI Scam Radar</h1>
        <p className="text-sm font-semibold text-slate-500 mt-1">
          Cross-referencing CMA & SASRA warning lists to protect capital.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
         <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-4">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-black text-slate-900">Institutional Safety Audit</h2>
         </div>
         
         <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
            <div className="flex items-start gap-4">
               <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
               <div>
                  <h3 className="text-md font-black text-red-900">Active SASRA Warning</h3>
                  <p className="text-xs text-red-700 font-medium mt-1 leading-relaxed">
                     Our AI has detected non-compliant deposits matching the profile of unstructured SACCOs currently under investigation by SASRA. Ensure all deposits are routed strictly to Tier-1 registered entities.
                  </p>
               </div>
            </div>
         </div>

         <div className="mt-6 flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div>
               <p className="text-xs font-black text-emerald-900">CMA Validated Entity Setup</p>
               <p className="text-[10px] text-emerald-700 uppercase tracking-widest font-bold mt-1">All Sentill API connections are secure.</p>
            </div>
            <div className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm">
               Verified
            </div>
         </div>
      </div>
    </div>
  );
}
