"use client";

import { useState, useEffect } from "react";
import AlertsSettings from "@/components/AlertsSettings";
import { User, Bell, ChevronLeft, ShieldCheck, CreditCard, Save, Camera, Phone, Mail, MapPin, Calendar, Lock, Eye, EyeOff, CheckCircle2, Zap, Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  isPremium: boolean;
  premiumExpiresAt: string | null;
  role: string;
  createdAt: string;
}

export default function SettingsCenter() {
  const [activeTab, setActiveTab] = useState("alerts");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwForm, setPwForm] = useState({ old: "", new: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session").then(r => r.json()).then(d => {
      if (d?.user) setUser(d.user);
    }).catch(() => {});
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.new !== pwForm.confirm) { toast.error("New passwords don't match"); return; }
    if (pwForm.new.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setSavingPw(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: pwForm.old, newPassword: pwForm.new })
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to update password"); }
      else { toast.success("Password updated successfully!"); setPwForm({ old: "", new: "", confirm: "" }); }
    } catch { toast.error("Network error"); }
    finally { setSavingPw(false); }
  };

  const premiumDaysLeft = user?.premiumExpiresAt
    ? Math.max(0, Math.ceil((new Date(user.premiumExpiresAt).getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-slate-900 uppercase tracking-widest">Command Center</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preferences &amp; Profile</p>
            </div>
          </div>
          {user && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-white text-[9px] font-black">
                {user.name?.split(" ").map(p => p[0]).join("").slice(0,2).toUpperCase()}
              </div>
              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{user.name}</span>
              {user.isPremium && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">⚡ Pro</span>}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar tabs */}
          <div className="w-full md:w-56 flex-shrink-0 space-y-2">
            {[
              { id: "alerts", label: "Smart Alerts", icon: Bell },
              { id: "profile", label: "My Profile", icon: User },
              { id: "security", label: "Security", icon: ShieldCheck },
              { id: "billing", label: "Billing", icon: CreditCard },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? "bg-slate-900 text-white shadow-xl" : "bg-white text-slate-500 hover:bg-slate-100"}`}
              >
                <tab.icon className="w-5 h-5" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6">

            {/* ALERTS TAB */}
            {activeTab === "alerts" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Alert Preferences</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-6">Configure AI-powered notifications</p>
                  <AlertsSettings />
                </div>
              </motion.div>
            )}

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Avatar + name card */}
                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                  <div className="flex items-start gap-6 mb-8 pb-8 border-b border-slate-100">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-white text-2xl font-black shadow-xl">
                        {user?.name?.split(" ").map(p => p[0]).join("").slice(0,2).toUpperCase() || "SI"}
                      </div>
                      <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-md hover:bg-emerald-400 transition-colors">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{user?.name || "—"}</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user?.role || "USER"} · Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : "—"}</p>
                      {user?.isPremium && (
                        <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-[9px] font-black text-emerald-700 uppercase tracking-widest">
                          <Zap className="w-3 h-3" /> Pro Active · {premiumDaysLeft} days remaining
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    {[
                      { icon: User, label: "Full Name", value: user?.name, placeholder: "Your full name" },
                      { icon: Mail, label: "Email Address", value: user?.email, placeholder: "your@email.com", type: "email" },
                      { icon: Phone, label: "Phone Number", value: user?.phone || "", placeholder: "+254 7XX XXX XXX" },
                      { icon: MapPin, label: "Location", value: user?.location || "Nairobi, KE", placeholder: "City, Country" },
                    ].map((field, i) => (
                      <div key={i} className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <field.icon className="w-3.5 h-3.5" /> {field.label}
                        </label>
                        <input
                          type={(field as any).type || "text"}
                          defaultValue={field.value || ""}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
                        />
                      </div>
                    ))}
                  </div>

                  <button className="mt-8 flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    <Save className="w-4 h-4" /> Save Profile Changes
                  </button>
                  <p className="text-[9px] text-slate-400 font-bold mt-3 uppercase tracking-widest">Profile editing coming in the next version — UI preview only.</p>
                </div>

                {/* Account Stats */}
                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Account Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Plan", value: user?.isPremium ? "Pro" : "Free", color: user?.isPremium ? "text-emerald-600" : "text-slate-500" },
                      { label: "Days Left", value: user?.isPremium ? `${premiumDaysLeft}d` : "∞", color: "text-blue-600" },
                      { label: "Member Since", value: user?.createdAt ? new Date(user.createdAt).getFullYear().toString() : "—", color: "text-slate-700" },
                      { label: "Role", value: user?.role || "USER", color: "text-purple-600" },
                    ].map((s, i) => (
                      <div key={i} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center">
                        <p className={`text-2xl font-black tracking-tighter ${s.color}`}>{s.value}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Password Change */}
                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Change Password</h2>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Secure your account with a strong password</p>
                    </div>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                    {[
                      { key: "old", label: "Current Password", show: showOldPw, toggle: () => setShowOldPw(!showOldPw) },
                      { key: "new", label: "New Password", show: showNewPw, toggle: () => setShowNewPw(!showNewPw) },
                      { key: "confirm", label: "Confirm New Password", show: showNewPw, toggle: () => setShowNewPw(!showNewPw) },
                    ].map((f) => (
                      <div key={f.key} className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{f.label}</label>
                        <div className="relative">
                          <input
                            type={f.show ? "text" : "password"}
                            value={pwForm[f.key as keyof typeof pwForm]}
                            onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                            placeholder="••••••••"
                            className="w-full px-4 py-3.5 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
                          />
                          <button type="button" onClick={f.toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                            {f.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    <button type="submit" disabled={savingPw} className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50">
                      {savingPw ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Lock className="w-4 h-4" /> Update Password</>}
                    </button>
                  </form>
                </div>

                {/* Security checklist */}
                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Security Checklist</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Email verified", done: true },
                      { label: "Strong password set", done: true },
                      { label: "2-Factor Authentication (2FA)", done: false, note: "Coming soon" },
                      { label: "KYC identity verification", done: false, note: "Coming soon" },
                      { label: "Device management", done: false, note: "Coming soon" },
                    ].map((item, i) => (
                      <div key={i} className={`flex items-center justify-between p-4 rounded-xl border ${item.done ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"}`}>
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className={`w-5 h-5 ${item.done ? "text-emerald-500" : "text-slate-300"}`} />
                          <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">{item.label}</span>
                        </div>
                        {item.done
                          ? <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full uppercase tracking-widest">Done</span>
                          : <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-full uppercase tracking-widest">{item.note}</span>
                        }
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* BILLING TAB */}
            {activeTab === "billing" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Current plan */}
                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 pb-4 border-b border-slate-100">Current Plan</h2>
                  <div className={`rounded-2xl p-6 flex items-center justify-between border ${user?.isPremium ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {user?.isPremium ? <Zap className="w-5 h-5 text-emerald-600" /> : <Star className="w-5 h-5 text-slate-400" />}
                        <span className="text-lg font-black uppercase tracking-tight text-slate-900">{user?.isPremium ? "Sentil Pro" : "Free Plan"}</span>
                      </div>
                      {user?.isPremium && user?.premiumExpiresAt && (
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Active until {new Date(user.premiumExpiresAt).toLocaleDateString("en-KE", { month: "long", day: "numeric", year: "numeric" })}
                          &nbsp;·&nbsp; <span className="text-emerald-600">{premiumDaysLeft} days remaining</span>
                        </p>
                      )}
                      {!user?.isPremium && (
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Upgrade to unlock all Pro features</p>
                      )}
                    </div>
                    <Link href="/packages" className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${user?.isPremium ? "bg-slate-900 text-white hover:bg-emerald-700" : "bg-emerald-600 text-white hover:bg-emerald-500"}`}>
                      {user?.isPremium ? "Manage Plan" : "Upgrade — KES 100"}
                    </Link>
                  </div>
                </div>

                {/* What's included */}
                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">What&apos;s in Pro</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      "KRA Tax-Loss Harvesting AI", "NSE Candlestick Charts + MACD/RSI",
                      "Real-time Price & Yield Alerts", "Unlimited Asset Logging",
                      "Portfolio Risk Analyzer", "Sentil Alpha Engine",
                      "Estate Vault (Beneficiary Automations)", "Priority 24/7 Support"
                    ].map((f, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${user?.isPremium ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100 opacity-50"}`}>
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${user?.isPremium ? "text-emerald-500" : "text-slate-300"}`} />
                        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-700">{f}</span>
                      </div>
                    ))}
                  </div>
                  {!user?.isPremium && (
                    <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3">Try all Pro features for just KES 100 / 7 days</p>
                      <Link href="/packages" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all">
                        <Zap className="w-4 h-4" /> Start 7-Day Trial
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
