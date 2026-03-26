"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ShieldCheck, Zap, ArrowRight, Activity, Clock, Mail, MessageSquare, CheckCircle, Save, Loader2, Toggle, AlertCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface AlertPrefs {
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  whatsappNumber?: string;
  frequency: string;
  portfolioAlerts: string;
  aiOracleAlerts: boolean;
}

const LIVE_ALERTS = [
  { title: "IFB1/2024 Yield Update", desc: "Secondary market yield for IFB1/2024 has reached 18.6%+. This is an excellent opportunity for rotation from taxable MMFs.", type: "Market Alpha", time: "2h ago", priority: "High", icon: TrendingUp },
  { title: "Safaricom Dividend Confirmation", desc: "SCOM books closure confirmed for Jul 15. Dividend yield: 8.5% — buy before cutoff date to qualify.", type: "Corporate Action", time: "1d ago", priority: "Medium", icon: Bell },
  { title: "CBK Policy Rate Held at 10%", desc: "The Central Bank of Kenya held the MPR at 10.00% in the March 2025 MPC meeting, supporting continued strong bond yields.", type: "Macro Alert", time: "3d ago", priority: "Medium", icon: AlertCircle },
  { title: "Etica MMF Yield: 17.55%", desc: "Etica Wealth MMF remains Kenya's top-performing money market fund for Q1 2025. Daily accrual active.", type: "Yield Update", time: "5d ago", priority: "Low", icon: Activity },
];

export default function AlertsHubPage() {
  const [prefs, setPrefs] = useState<AlertPrefs>({
    emailEnabled: true,
    whatsappEnabled: false,
    whatsappNumber: "",
    frequency: "WEEKLY",
    portfolioAlerts: "ALL",
    aiOracleAlerts: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"feed" | "settings">("feed");

  useEffect(() => {
    fetch("/api/user/alerts")
      .then(r => r.json())
      .then(d => {
        if (d && !d.error) {
          setPrefs({
            emailEnabled: d.emailEnabled ?? true,
            whatsappEnabled: d.whatsappEnabled ?? false,
            whatsappNumber: d.whatsappNumber || "",
            frequency: d.frequency || "WEEKLY",
            portfolioAlerts: d.portfolioAlerts || "ALL",
            aiOracleAlerts: d.aiOracleAlerts ?? true,
          });
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs)
      });
      if (res.ok) {
        toast.success("Alert preferences saved! ✓");
      } else {
        toast.error("Failed to save preferences");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20 max-w-4xl mx-auto">

      {/* ─── HEADER ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
            <Bell className="w-7 h-7 text-blue-600" /> Alert Hub
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            Real-time intelligence · Email & WhatsApp notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[10px] font-black uppercase">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live Feed
          </span>
        </div>
      </div>

      {/* ─── STATS ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active Signals", val: `${LIVE_ALERTS.length}`, icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "High Priority", val: `${LIVE_ALERTS.filter(a => a.priority === "High").length}`, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
          { label: "Neural Uptime", val: "99.9%", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Last Sync", val: "2h ago", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((m, i) => (
          <div key={i} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
              <div className={`w-7 h-7 ${m.bg} rounded-lg flex items-center justify-center`}>
                <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
              </div>
            </div>
            <div className={`text-2xl font-black tracking-tighter ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* ─── TABS ──────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab("feed")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${
            activeTab === "feed" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Bell className="w-3.5 h-3.5" /> Intelligence Feed
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${
            activeTab === "settings" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Mail className="w-3.5 h-3.5" /> Notification Settings
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "feed" && (
          <motion.div key="feed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Live Alerts</h3>
                <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Mark All Read</button>
              </div>
              <div className="divide-y divide-slate-100">
                {LIVE_ALERTS.map((alert, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="p-5 hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        alert.priority === "High" ? "bg-rose-50" : alert.priority === "Medium" ? "bg-amber-50" : "bg-slate-50"
                      }`}>
                        <alert.icon className={`w-5 h-5 ${
                          alert.priority === "High" ? "text-rose-600" : alert.priority === "Medium" ? "text-amber-600" : "text-slate-400"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {alert.priority === "High" && <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse inline-block" />}
                            <h4 className="text-sm font-black text-slate-900">{alert.title}</h4>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest shrink-0">{alert.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mb-3">{alert.desc}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                            alert.priority === "High" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                            alert.priority === "Medium" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                            "bg-blue-50 text-blue-700 border border-blue-100"
                          }`}>{alert.type}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors flex items-center gap-1">
                            Take Action <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <>
                {/* Email Notifications */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Email Notifications</h3>
                      <p className="text-[10px] text-slate-500 font-bold">Receive alerts directly to your inbox</p>
                    </div>
                    <button
                      onClick={() => setPrefs(p => ({ ...p, emailEnabled: !p.emailEnabled }))}
                      className={`ml-auto relative w-12 h-6 rounded-full transition-colors ${prefs.emailEnabled ? "bg-blue-600" : "bg-slate-200"}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${prefs.emailEnabled ? "translate-x-6" : ""}`} />
                    </button>
                  </div>

                  {prefs.emailEnabled && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Notification Frequency</label>
                        <div className="flex gap-2">
                          {["DAILY", "WEEKLY", "MONTHLY"].map(freq => (
                            <button
                              key={freq}
                              onClick={() => setPrefs(p => ({ ...p, frequency: freq }))}
                              className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all ${
                                prefs.frequency === freq ? "bg-blue-600 text-white" : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {freq}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* WhatsApp */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">WhatsApp Alerts</h3>
                      <p className="text-[10px] text-slate-500 font-bold">Instant alerts via WhatsApp</p>
                    </div>
                    <button
                      onClick={() => setPrefs(p => ({ ...p, whatsappEnabled: !p.whatsappEnabled }))}
                      className={`ml-auto relative w-12 h-6 rounded-full transition-colors ${prefs.whatsappEnabled ? "bg-emerald-600" : "bg-slate-200"}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${prefs.whatsappEnabled ? "translate-x-6" : ""}`} />
                    </button>
                  </div>

                  {prefs.whatsappEnabled && (
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">WhatsApp Number (+254...)</label>
                      <input
                        type="tel"
                        value={prefs.whatsappNumber}
                        onChange={e => setPrefs(p => ({ ...p, whatsappNumber: e.target.value }))}
                        placeholder="+254712345678"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* Alert Types */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide pb-3 border-b border-slate-100">Alert Categories</h3>
                  {[
                    { key: "aiOracleAlerts", label: "AI Oracle Insights", desc: "Weekly AI-generated portfolio recommendations", checked: prefs.aiOracleAlerts },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.label}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setPrefs(p => ({ ...p, [item.key]: !p[item.key as keyof AlertPrefs] }))}
                        className={`relative w-12 h-6 rounded-full transition-colors ${item.checked ? "bg-blue-600" : "bg-slate-200"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${item.checked ? "translate-x-6" : ""}`} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg disabled:opacity-50"
                >
                  {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Preferences</>}
                </button>

                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  ✅ Email notifications sent for: Account creation · Asset logged · AI insights · Payment confirmations
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
