"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Smartphone, CheckCircle2, XCircle, Send, Bell, RefreshCw,
  MessageSquare, Zap, ChevronRight, Copy, ExternalLink, Loader2,
  TrendingUp, Shield, Clock, Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WAStatus {
  linked: boolean;
  verified: boolean;
  phoneNumber?: string;
  notificationsEnabled?: boolean;
  frequency?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function WhatsAppHubPage() {
  const [status, setStatus] = useState<WAStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneInput, setPhoneInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [copied, setCopied] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [frequency, setFrequency] = useState("DAILY");

  // The WhatsApp bot phone from env (displayed for users to save)
  const BOT_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER ?? "+254 XXX XXXX (set env)";
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://sentil.africa";

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/me");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        setNotifEnabled(data.notificationsEnabled ?? false);
        setFrequency(data.frequency ?? "DAILY");
        if (data.phoneNumber) setPhoneInput(data.phoneNumber);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleSavePhone = async () => {
    if (!phoneInput || phoneInput.length < 9) {
      showToast("Enter a valid phone number", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/whatsapp/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneInput, notificationsEnabled: notifEnabled, frequency }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("✅ WhatsApp settings saved!");
        fetchStatus();
      } else {
        showToast(data.error ?? "Failed to save", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUnlink = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/whatsapp/me", { method: "DELETE" });
      if (res.ok) {
        showToast("WhatsApp unlinked");
        setStatus({ linked: false, verified: false });
        setPhoneInput("");
      }
    } catch {
      showToast("Failed to unlink", "error");
    } finally {
      setSaving(false);
    }
  };

  const copyBotNumber = () => {
    navigator.clipboard.writeText(BOT_NUMBER.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">WhatsApp Hub</h1>
            <p className="text-sm text-slate-500">Manage your WhatsApp connection & AI notifications</p>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-2xl text-sm font-bold shadow-xl ${
              toast.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-rose-600 text-white"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border p-6 flex items-center gap-4 ${
          status?.verified
            ? "bg-emerald-50 border-emerald-200"
            : "bg-amber-50 border-amber-200"
        }`}
      >
        {status?.verified ? (
          <CheckCircle2 className="w-8 h-8 text-emerald-500 flex-shrink-0" />
        ) : (
          <XCircle className="w-8 h-8 text-amber-500 flex-shrink-0" />
        )}
        <div className="flex-1">
          <p className="font-black text-slate-900 text-sm uppercase tracking-wider">
            {status?.verified ? "WhatsApp Connected" : "WhatsApp Not Connected"}
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            {status?.verified
              ? `Linked to ${status.phoneNumber} — Get rates, subscribe & manage from WhatsApp!`
              : "Connect your WhatsApp to get AI briefs, market rates & subscribe to Pro"}
          </p>
        </div>
        {status?.verified && (
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-200 text-emerald-800">
            LIVE
          </span>
        )}
      </motion.div>

      {/* Feature cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: MessageSquare, title: "Portfolio Query", desc: "Text PORTFOLIO anytime", color: "blue" },
          { icon: Bell, title: "AI Daily Briefs", desc: "7AM EAT every morning", color: "purple" },
          { icon: Zap, title: "Subscribe via WA", desc: "SUBSCRIBE → Paystack link", color: "emerald" },
          { icon: Shield, title: "OTP Login", desc: "Secure WhatsApp auth", color: "orange" },
        ].map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              f.color === "blue" ? "bg-blue-100" :
              f.color === "purple" ? "bg-purple-100" :
              f.color === "emerald" ? "bg-emerald-100" : "bg-orange-100"
            }`}>
              <f.icon className={`w-4 h-4 ${
                f.color === "blue" ? "text-blue-600" :
                f.color === "purple" ? "text-purple-600" :
                f.color === "emerald" ? "text-emerald-600" : "text-orange-600"
              }`} />
            </div>
            <p className="text-xs font-black text-slate-900 uppercase tracking-wider">{f.title}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ─── Connect / Settings Panel ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Connection Settings</h2>
            <Smartphone className="w-4 h-4 text-slate-400" />
          </div>

          <div className="p-6 space-y-5">
            {/* Phone input */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 block">
                Your WhatsApp Number
              </label>
              <div className="flex gap-2">
                <select
                  className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  defaultValue="+254"
                >
                  <option value="+254">🇰🇪 +254</option>
                  <option value="+255">🇹🇿 +255</option>
                  <option value="+256">🇺🇬 +256</option>
                  <option value="+1">🇺🇸 +1</option>
                </select>
                <input
                  type="tel"
                  placeholder="712 345 678"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Notification toggle */}
            <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-xs font-black text-slate-900 uppercase tracking-wider">AI Daily Briefs</p>
                <p className="text-[11px] text-slate-500">Gemini-powered morning updates at 7AM EAT</p>
              </div>
              <button
                onClick={() => setNotifEnabled(!notifEnabled)}
                className={`w-12 h-6 rounded-full transition-all relative ${notifEnabled ? "bg-emerald-500" : "bg-slate-300"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${notifEnabled ? "left-6" : "left-0.5"}`} />
              </button>
            </div>

            {/* Frequency */}
            <div>
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2 block">
                Notification Frequency
              </label>
              <div className="flex gap-2">
                {["DAILY", "WEEKLY", "MONTHLY"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFrequency(f)}
                    className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl border transition-all ${
                      frequency === f
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {f.charAt(0) + f.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Save / Unlink */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSavePhone}
                disabled={saving}
                className="flex-1 bg-slate-900 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Save Settings
              </button>
              {status?.linked && (
                <button
                  onClick={handleUnlink}
                  disabled={saving}
                  className="px-4 py-3 rounded-xl border border-rose-200 text-rose-600 text-xs font-black uppercase tracking-widest hover:bg-rose-50 transition-all disabled:opacity-50"
                >
                  Unlink
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* ─── How To Use Panel ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">How to Activate</h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Bot number card */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-emerald-700 font-black uppercase tracking-widest">Sentil WhatsApp Bot</p>
                <p className="text-sm font-bold text-emerald-900 font-mono">{BOT_NUMBER}</p>
              </div>
              <button onClick={copyBotNumber} className="text-emerald-600 hover:text-emerald-800 transition-colors">
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {[
                { step: "1", title: "Save the number", desc: "Save the Sentil bot number to your contacts" },
                { step: "2", title: "Send \u2018Hi\u2019", desc: "Open WhatsApp and send \u2018Hi\u2019 to start" },
                { step: "3", title: "Choose Login/Register", desc: "Link your Sentil account via OTP" },
                { step: "4", title: "Explore commands", desc: "MARKETS · PORTFOLIO · SUBSCRIBE · GOALS" },
              ].map((s) => (
                <div key={s.step} className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    {s.step}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">{s.title}</p>
                    <p className="text-[11px] text-slate-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp deep link */}
            <a
              href={`https://wa.me/${BOT_NUMBER.replace(/\D/g, "")}?text=Hi`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-md shadow-emerald-500/20"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in WhatsApp
            </a>
          </div>
        </motion.div>
      </div>

      {/* ─── Commands Reference ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">WhatsApp Commands</h2>
          <p className="text-xs text-slate-500 mt-1">Send these keywords to the bot anytime</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 divide-x divide-y divide-slate-100">
          {[
            { cmd: "MENU",      desc: "Main menu & account info", tag: "nav" },
            { cmd: "MARKETS",   desc: "Live NSE / MMF / T-Bill rates", tag: "data" },
            { cmd: "WATCHLIST", desc: "Your saved providers", tag: "data" },
            { cmd: "STATUS",    desc: "Subscription details", tag: "nav" },
            { cmd: "SUBSCRIBE", desc: "New Pro subscription", tag: "action" },
            { cmd: "RENEW",     desc: "Renew existing Pro plan", tag: "action" },
            { cmd: "PORTFOLIO", desc: "⚡ Pro: Tracked assets", tag: "pro" },
            { cmd: "GOALS",     desc: "⚡ Pro: Financial goals", tag: "pro" },
          ].map((c) => (
            <div key={c.cmd} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <code className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {c.cmd}
                </code>
                <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                  c.tag === "action" ? "bg-orange-100 text-orange-700" :
                  c.tag === "pro" ? "bg-purple-50 text-purple-700" :
                  c.tag === "data" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {c.tag}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{c.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── AI Brief Preview ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Sample Daily Brief</h2>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-bold">
            <Clock className="w-3.5 h-3.5" />
            Sent at 7:00 AM EAT
          </div>
        </div>
        <div className="p-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 font-mono text-sm text-slate-200 space-y-2 leading-relaxed">
            <p>🌅 <strong className="text-white">Good morning, Edwin!</strong></p>
            <p>📅 Monday, 30 March 2026</p>
            <p className="text-white/30">━━━━━━━━━━━━━━━━━━</p>
            <p>📊 <strong className="text-white">YOUR PORTFOLIO</strong></p>
            <p>💰 Total Tracked: KES 285,000.00</p>
            <p>📈 Avg Return: 13.4% p.a.</p>
            <p className="text-slate-400 text-xs italic">(These are your recorded figures. Money remains in your accounts.)</p>
            <p className="text-white/30">━━━━━━━━━━━━━━━━━━</p>
            <p>📰 <strong className="text-white">MARKET PULSE</strong></p>
            <p>• 91-Day T-Bill: 15.78%</p>
            <p>• CIC MMF: 13.40%</p>
            <p>• Sanlam MMF: 13.10%</p>
            <p className="text-white/30">━━━━━━━━━━━━━━━━━━</p>
            <p>🧠 <strong className="text-white">ORACLE INSIGHT</strong></p>
            <p className="text-emerald-300 italic">Your CIC MMF allocation is well-positioned. Consider diversifying 20% into T-Bills for improved risk-adjusted returns this quarter.</p>
            <p className="text-white/30">━━━━━━━━━━━━━━━━━━</p>
            <p className="text-slate-400">🔗 {APP_URL}/dashboard</p>
            <p className="text-slate-500 text-xs">Sentil is an intelligence hub — your money stays with your providers.</p>
            <p className="text-slate-400 text-xs">Reply MENU for quick actions</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
