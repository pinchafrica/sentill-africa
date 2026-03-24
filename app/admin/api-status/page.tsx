"use client";

import { useState } from "react";
import { 
  Activity, 
  Server, 
  Zap, 
  Database, 
  Globe, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Wifi, 
  WifiOff 
} from "lucide-react";

export default function ApiStatusPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const connections = [
    { name: "Cortex Alpha AI (Gemini)", endpoint: "/api/ai", latency: "124ms", status: "Operational", uptime: "99.99%", type: "Internal Intelligence", icon: Zap, color: "text-indigo-500", bg: "bg-indigo-50" },
    { name: "NSE Market Feed", endpoint: "api.nse.co.ke/v1/ticker", latency: "42ms", status: "Operational", uptime: "100%", type: "External Feed", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
    { name: "CBK Exchange Rates", endpoint: "centralbank.go.ke/api/rates", latency: "89ms", status: "Operational", uptime: "99.98%", type: "External Feed", icon: Globe, color: "text-emerald-500", bg: "bg-emerald-50" },
    { name: "M-Pesa Daraja Gateway", endpoint: "sandbox.safaricom.co.ke/mpesa", latency: "312ms", status: "Degraded", uptime: "98.50%", type: "Payment Processor", icon: WalletIcon, color: "text-amber-500", bg: "bg-amber-50", alert: "High latency detected in C2B simulation" },
    { name: "Paystack Webhooks", endpoint: "api.paystack.co/transaction", latency: "---", status: "Offline", uptime: "95.20%", type: "Payment Processor", icon: Server, color: "text-red-500", bg: "bg-red-50", alert: "Webhook signature verification failing" },
    { name: "Primary Database (Supabase)", endpoint: "db.sentill.internal", latency: "12ms", status: "Operational", uptime: "100%", type: "Data Storage", icon: Database, color: "text-blue-500", bg: "bg-blue-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">API & Connectivity Monitor</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Real-time Systems Health & Gateway Latency
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleRefresh}
             disabled={isRefreshing}
             className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl flex items-center gap-2 disabled:opacity-50"
           >
             <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> 
             {isRefreshing ? 'Pinging Nodes...' : 'Refresh Status'}
           </button>
        </div>
      </div>

      {/* Global Status Banner */}
      <div className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden flex items-center justify-between">
         <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />
         <div className="relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
               <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <div>
               <h2 className="text-xl font-black text-white uppercase tracking-tight">System Degraded</h2>
               <p className="text-[11px] font-bold text-amber-400 uppercase tracking-widest mt-1">Payment Gateways Experiencing Issues</p>
            </div>
         </div>
         <div className="relative z-10 text-right hidden sm:block">
            <p className="text-sm font-black text-white">2 Active Alerts</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Last Checked: Just now</p>
         </div>
      </div>

      {/* Connection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {connections.map((conn, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all group flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${conn.bg} ${conn.color} flex items-center justify-center border border-current/10`}>
                  <conn.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">{conn.name}</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">{conn.type}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1.5 border-l border-slate-100 pl-4">
                 <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                   conn.status === 'Operational' ? 'bg-emerald-50 text-emerald-600' :
                   conn.status === 'Degraded' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                 }`}>
                   {conn.status === 'Operational' ? <CheckCircle2 className="w-3 h-3" /> :
                    conn.status === 'Degraded' ? <AlertTriangle className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                   {conn.status}
                 </span>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Wifi className="w-3 h-3" /> {conn.latency}
                 </span>
              </div>
            </div>

            <div className="space-y-4 flex-1">
               <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Target Endpoint</p>
                  <p className="text-[11px] font-mono font-bold text-slate-600 truncate">{conn.endpoint}</p>
               </div>
               
               {conn.alert ? (
                 <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-red-700 leading-snug">{conn.alert}</p>
                 </div>
               ) : (
                 <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">30-Day Uptime</span>
                    <span className="text-[12px] font-black text-slate-900">{conn.uptime}</span>
                 </div>
               )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
               <button className="flex-1 py-2.5 bg-slate-50 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors">
                 View Logs
               </button>
               {conn.status !== 'Operational' && (
                 <button className="flex-1 py-2.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-colors">
                   Restart Node
                 </button>
               )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

function WalletIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}
