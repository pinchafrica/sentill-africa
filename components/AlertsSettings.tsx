"use client";

import { useState, useEffect } from "react";
import { 
  Bell, Mail, MessageSquare, Clock, ShieldCheck, 
  Zap, Save, CheckCircle2, ChevronRight, LayoutGrid,
  Activity, BarChart2, Globe
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface AlertPrefs {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  whatsappNumber: string;
  frequency: string;
  portfolioAlerts: string;
  aiOracleAlerts: boolean;
}

export default function AlertsSettings() {
  const [prefs, setPrefs] = useState<AlertPrefs>({
    emailEnabled: true,
    whatsappEnabled: false,
    whatsappNumber: "",
    frequency: "WEEKLY",
    portfolioAlerts: "ALL",
    aiOracleAlerts: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPrefs();
  }, []);

  const fetchPrefs = async () => {
    try {
      const res = await fetch("/api/user/alerts");
      if (res.ok) {
        const data = await res.ok ? await res.json() : null;
        if (data) {
          setPrefs({
            emailEnabled: data.emailEnabled,
            whatsappEnabled: data.whatsappEnabled,
            whatsappNumber: data.whatsappNumber || "",
            frequency: data.frequency,
            portfolioAlerts: data.portfolioAlerts,
            aiOracleAlerts: data.aiOracleAlerts,
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch prefs", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      toast.success("Settings Synchronized", {
        description: "Your alert intelligence has been updated.",
      });
    } catch (err: any) {
      toast.error("Update failed", { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="h-96 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
              Alert Intelligence <Bell className="w-6 h-6 text-blue-600" />
           </h2>
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Configure Institutional Multi-Channel Notifications</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
        >
          {isSaving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Sync Intelligence
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Channel Selection */}
        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
           <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                 <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">Delivery Channels</h3>
           </div>

           <div className="space-y-6">
              {/* Email Toggle */}
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                 <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${prefs.emailEnabled ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                       <Mail className="w-5 h-5" />
                    </div>
                    <div>
                       <h4 className="text-xs font-black text-slate-900 uppercase">Email Intelligence</h4>
                       <p className="text-[9px] font-bold text-slate-500 uppercase">Shadow Portfolio Reports</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => setPrefs({...prefs, emailEnabled: !prefs.emailEnabled})}
                   className={`w-12 h-6 rounded-full transition-colors relative ${prefs.emailEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
                 >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${prefs.emailEnabled ? 'left-7' : 'left-1'}`} />
                 </button>
              </div>

              {/* WhatsApp Toggle */}
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-xl ${prefs.whatsappEnabled ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                          <MessageSquare className="w-5 h-5" />
                       </div>
                       <div>
                          <h4 className="text-xs font-black text-slate-900 uppercase">WhatsApp Protocol</h4>
                          <p className="text-[9px] font-bold text-slate-500 uppercase">Real-Time Yield Alerts</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setPrefs({...prefs, whatsappEnabled: !prefs.whatsappEnabled})}
                      className={`w-12 h-6 rounded-full transition-colors relative ${prefs.whatsappEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${prefs.whatsappEnabled ? 'left-7' : 'left-1'}`} />
                    </button>
                 </div>
                 
                 <AnimatePresence>
                   {prefs.whatsappEnabled && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       exit={{ opacity: 0, height: 0 }}
                       className="pt-4 border-t border-slate-200"
                     >
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Verified Phone Number</label>
                        <input 
                          type="text" 
                          value={prefs.whatsappNumber}
                          onChange={(e) => setPrefs({...prefs, whatsappNumber: e.target.value})}
                          placeholder="+254 7XX XXX XXX"
                          className="w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all mb-4"
                        />
                        <a 
                          href={`https://wa.me/2540706206160?text=${encodeURIComponent("Hello Sentill, I'm setting up my WhatsApp alerts and have a few questions...")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors border border-emerald-200"
                        >
                           <MessageSquare className="w-4 h-4" /> Message Concierge on WhatsApp
                        </a>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
           </div>
        </div>

        {/* Frequency & Logic */}
        <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
           <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                 <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">Alert Frequency</h3>
           </div>

           <div className="grid grid-cols-3 gap-3">
              {['DAILY', 'WEEKLY', 'MONTHLY'].map((freq) => (
                <button
                  key={freq}
                  onClick={() => setPrefs({...prefs, frequency: freq})}
                  className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    prefs.frequency === freq 
                      ? "border-amber-500 bg-amber-50 text-amber-700" 
                      : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-100"
                  }`}
                >
                   <span className="text-[10px] font-black uppercase tracking-widest">{freq}</span>
                </button>
              ))}
           </div>

           <div className="space-y-4">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Portfolio Target Selection</label>
              <select 
                value={prefs.portfolioAlerts}
                onChange={(e) => setPrefs({...prefs, portfolioAlerts: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-3xl text-xs font-black text-slate-900 uppercase tracking-widest focus:outline-none focus:border-slate-300 cursor-pointer appearance-none"
              >
                 <option value="ALL">Aggregated Global Portfolio</option>
                 <option value="MMF">Money Market Funds Only</option>
                 <option value="BONDS">Fixed Income & Bonds Only</option>
                 <option value="STOCKS">Equity & NSE Stocks Only</option>
              </select>
           </div>
        </div>

      </div>

      {/* AI Intelligence Toggle */}
      <div className="relative overflow-hidden bg-slate-950 rounded-[3rem] p-10 border border-white/10 group">
         <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
            <Zap className="w-40 h-40 text-blue-500" />
         </div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  Sentill Sentill Africa Oracle Alerts <ShieldCheck className="w-6 h-6 text-blue-400 animate-pulse" />
               </h3>
               <p className="text-slate-400 text-xs font-medium leading-relaxed mt-4 uppercase tracking-wider">
                  Enable high-latency predictive alerts. The Oracle will notify you about unusual market yield spreads, dividend announcements, and institutional bond auction results before they become mainstream.
               </p>
            </div>
            <button 
               onClick={() => setPrefs({...prefs, aiOracleAlerts: !prefs.aiOracleAlerts})}
               className={`shrink-0 px-8 py-5 rounded-3xl text-sm font-black uppercase tracking-[0.2em] transition-all border-2 flex items-center gap-3 ${
                  prefs.aiOracleAlerts 
                  ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]" 
                  : "bg-white/5 border-white/10 text-slate-400"
               }`}
            >
               {prefs.aiOracleAlerts ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
               {prefs.aiOracleAlerts ? "ORACLE ACTIVE" : "ORACLE MUTED"}
            </button>
         </div>
      </div>

    </div>
  );
}

function XCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
