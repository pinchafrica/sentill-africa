"use client";

import { ShieldCheck, Lock, Eye, AlertCircle, Terminal, FileText, ArrowRight, CheckCircle2 } from "lucide-react";

export default function AdminAuditPage() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.3em]">
           <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Sentinel Security Protocol v9
        </div>
        <h2 className="text-4xl font-black text-slate-950 uppercase tracking-tighter">Security <span className="text-slate-200">Audit.</span></h2>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">End-to-end encryption monitoring and institutional access logs.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          { label: "Encryption Status", value: "AES-256 Active", icon: Lock, status: "Secure", color: "text-emerald-500" },
          { label: "Failed Login Attempts", value: "0", icon: AlertCircle, status: "Low Risk", color: "text-slate-400" },
          { label: "System Integrity", value: "Verified", icon: CheckCircle2, status: "Optimal", color: "text-blue-500" },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
             <s.icon className={`w-8 h-8 ${s.color} mb-6`} />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
             <p className="text-xl font-black text-slate-950 tracking-tight mt-1">{s.value}</p>
             <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{s.status}</span>
                <ArrowRight className="w-3 h-3 text-slate-200" />
             </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 blur-[100px] rounded-full pointer-events-none" />
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4 max-w-xl">
               <h3 className="text-2xl font-black uppercase tracking-tight">Sentinel AI Watchdog</h3>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  Our proprietary AI watchdog monitors every packet in real-time. Any deviation from institutional patterns triggers an immediate secondary authentication challenge or temporary cluster isolation.
               </p>
            </div>
            <button className="px-10 py-5 bg-white text-slate-950 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-xl">
               Run Full Penetration Test
            </button>
         </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
         <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight">Access Log</h3>
            <div className="flex gap-2">
               <button className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-400 uppercase hover:text-slate-900 transition-colors">Export Logs</button>
            </div>
         </div>
         <div className="space-y-2">
            {[
              { user: "SuperAdmin-01", action: "System Config Update", ip: "192.168.1.1", time: "10 mins ago" },
              { user: "SentinelBot", action: "Daily Backup Verified", ip: "Internal", time: "1 hour ago" },
              { user: "SuperAdmin-01", action: "Dashboard Access", ip: "192.168.1.1", time: "2 hours ago" },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-6">
                   <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Terminal className="w-4 h-4 text-slate-400" />
                   </div>
                   <div>
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest block">{log.user}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">{log.action}</span>
                   </div>
                </div>
                <div className="text-right">
                   <span className="text-[9px] font-black text-slate-900 uppercase block">{log.ip}</span>
                   <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{log.time}</span>
                </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
