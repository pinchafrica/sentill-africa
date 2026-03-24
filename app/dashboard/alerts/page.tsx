"use client";

import { Bell, ShieldCheck, Zap, ArrowRight, Activity, Clock } from "lucide-react";

export default function AlertsHubPage() {
  const alerts = [
    { title: "IFB1/2024 Yield Update", desc: "Secondary market yield for IFB1/2024 has hit 18.6%+. Opportunity for rotation from MMF.", type: "Market Alpha", time: "2h ago", priority: "High" },
    { title: "Stock Dividend Confirmation", desc: "Safaricom (SCOM) books closure confirmed for Jul 15. Dividend yield: 8.5%.", type: "Corporate Action", time: "1d ago", priority: "Medium" },
    { title: "Institutional Handshake", desc: "Paystack gateway synchronized. Your #9A42-B token is active for the next 30 days.", type: "Security", time: "3d ago", priority: "Low" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Bell className="w-8 h-8 text-blue-600" /> Alert Intelligence Hub
        </h1>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
          Real-time Sovereign Signals <span className="text-blue-500 ml-2">• Neural Core Active</span>
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Active Signals", val: "12", icon: Zap },
          { label: "High Priority", val: "3", icon: Bell },
          { label: "Neural Uptime", val: "99.9%", icon: Activity },
          { label: "Last Sync", val: "Now", icon: Clock },
        ].map((m, i) => (
          <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
              <m.icon className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tighter">{m.val}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
           <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Neural Stream</h3>
           <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Clear All</button>
        </div>
        <div className="divide-y divide-slate-50">
           {alerts.map((alert, i) => (
             <div key={i} className="p-8 hover:bg-slate-50 transition-colors group cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${alert.priority === 'High' ? 'bg-rose-500 animate-pulse' : alert.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                      <h4 className="text-base font-black text-slate-900 tracking-tight">{alert.title}</h4>
                   </div>
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{alert.time}</span>
                </div>
                <p className="text-xs font-medium text-slate-500 leading-relaxed mb-4">{alert.desc}</p>
                <div className="flex items-center justify-between">
                   <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">{alert.type}</span>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors flex items-center gap-1">Take Action <ArrowRight className="w-3 h-3" /></span>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
