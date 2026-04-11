"use client";

import { useState, useEffect } from "react";
import {
  Bell, Check, Zap, Clock, Calendar, BarChart2, Moon,
  Smartphone, Shield, BellOff, Settings, ArrowRight, Save, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

// ─── Frequency options ────────────────────────────────────────────────────────

const FREQUENCIES = [
  {
    value: "TWICE_DAILY",
    label: "Twice Daily",
    sublabel: "7 AM + 6 PM",
    icon: Zap,
    color: "border-amber-400 bg-amber-50",
    iconColor: "text-amber-600",
    badge: "Most Active",
    badgeColor: "bg-amber-100 text-amber-700",
    description: "Morning brief at 7am and evening wrap at 6pm every day.",
  },
  {
    value: "DAILY",
    label: "Daily Morning",
    sublabel: "7:00 AM EAT",
    icon: Bell,
    color: "border-emerald-400 bg-emerald-50",
    iconColor: "text-emerald-600",
    badge: "Most Popular",
    badgeColor: "bg-emerald-100 text-emerald-700",
    description: "Full daily brief with portfolio performance, market pulse, and one AI insight — every morning.",
  },
  {
    value: "THREE_DAILY",
    label: "3× daily",
    sublabel: "7 AM · 12 PM · 6 PM",
    icon: RefreshCw,
    color: "border-violet-400 bg-violet-50",
    iconColor: "text-violet-600",
    badge: "Pro Only",
    badgeColor: "bg-violet-100 text-violet-700",
    description: "Full morning brief, midday market pulse, and evening performance wrap.",
    premiumOnly: true,
  },
  {
    value: "WEEKLY",
    label: "Weekly Intelligence",
    sublabel: "Monday 7:30 AM",
    icon: Calendar,
    color: "border-blue-400 bg-blue-50",
    iconColor: "text-blue-600",
    badge: "Deep Analysis",
    badgeColor: "bg-blue-100 text-blue-700",
    description: "One in-depth weekly report with market league tables, portfolio review, and 3 AI strategic insights.",
  },
  {
    value: "MARKET_ALERTS_ONLY",
    label: "Alerts Only",
    sublabel: "When yields hit your target",
    icon: BarChart2,
    color: "border-rose-400 bg-rose-50",
    iconColor: "text-rose-600",
    badge: "Custom",
    badgeColor: "bg-rose-100 text-rose-700",
    description: "No scheduled messages — we only notify you when a specific fund's yield crosses your threshold.",
  },
  {
    value: "NONE",
    label: "Paused",
    sublabel: "No notifications",
    icon: BellOff,
    color: "border-slate-300 bg-slate-50",
    iconColor: "text-slate-400",
    badge: null,
    description: "Disable all notifications. You can re-enable any time.",
  },
];

const ALERT_TYPES = [
  { key: "watchlistAlerts", label: "Watchlist Rate Changes", desc: "When a fund you're watching changes yield significantly", icon: BarChart2 },
  { key: "marketMoversAlerts", label: "Big Market Moves", desc: "When any top instrument moves ±0.5% in a session", icon: Zap },
  { key: "aiOracleAlerts", label: "AI Oracle Insights", desc: "When Sentill AI detects an unusual opportunity", icon: Settings },
];

const MSG_PREVIEWS: Record<string, string[]> = {
  DAILY: [
    "🌅 *Good morning, Edwin!*",
    "📅 _Monday, 7 April 2026_",
    "━━━━━━━━━━━━━━━━━━",
    "⚡ *SENTILL DAILY BRIEF*",
    "",
    "📊 *MARKET PULSE*",
    "_Kenya's live investment landscape:_",
    "",
    "🥇 *Zidi MMF* — *18.20%*",
    "🥈 *IFB1/2024 Bond* — *18.50%* _(tax-free)_",
    "🥉 *Etica Capital MMF* — *17.55%*",
    "   *91-Day T-Bill* — *15.78%*",
    "",
    "━━━━━━━━━━━━━━━━━━",
    "📁 *YOUR PORTFOLIO TODAY*",
    "",
    "💼 *Invested:* KES 500,000",
    "📈 *Blended Yield:* 16.20% p.a.  🥇 *Excellent*",
    "💸 *Monthly Earnings:* ~KES 6,750",
    "🎯 *Annual Projection:* ~KES 81,000",
    "🏦 *vs Savings Account:* +12.2% alpha/yr",
    "",
    "━━━━━━━━━━━━━━━━━━",
    "🧠 *ORACLE INSIGHT*",
    "",
    "💡 Your CIC MMF allocation is yielding 13.4% but Zidi is paying 18.2% — switching KES 200,000 to Zidi would generate an extra KES 9,600 this year with the same T+1 liquidity.",
  ],
  WEEKLY: [
    "🗓️ *SENTILL WEEKLY INTELLIGENCE*",
    "_Week of 7 April 2026_",
    "",
    "━━━━━━━━━━━━━━━━━━",
    "👋 Hey *Edwin* — here's your full",
    "weekly market intelligence report:",
    "",
    "🏆 *WEEKLY YIELD LEAGUE*",
    "_Kenya's top instruments this week:_",
    "",
    "1️⃣ *IFB1/2024 Bond* — *18.50%* _(tax-free)_",
    "2️⃣ *Zidi MMF* — *18.20%*",
    "3️⃣ *Etica Capital MMF* — *17.55%*",
    "4️⃣ *364-Day T-Bill* — *16.42%* _(CBK)_",
    "5️⃣ *91-Day T-Bill* — *15.78%* _(CBK)_",
    "6️⃣ *CIC MMF* — *13.60%*",
    "",
    "━━━━━━━━━━━━━━━━━━",
    "🧠 *ORACLE WEEKLY ANALYSIS*",
    "",
    "📈 CBK's decision to hold the base rate is keeping T-Bill yields elevated — the 364-Day bill at 16.42% remains the strongest risk-free 1-year instrument available.",
    "",
    "🎯 This week's action: Invest any idle KES 50,000+ into the next Monday T-Bill auction and ladder it with a Zidi MMF position for instant liquidity cover.",
    "",
    "💡 Infrastructure Bonds give you an effective 3-4% yield advantage over regular bonds through WHT exemption — most investors don't factor this when comparing.",
  ],
  MARKET_ALERTS_ONLY: [
    "🚨🎯 *SENTILL ALERT — Edwin!*",
    "",
    "━━━━━━━━━━━━━━━━━━",
    "📊 *Zidi MMF* has crossed your target 🎯",
    "",
    "🎯 *Your alert level:* *18.00%*",
    "📈 *Current yield:* *18.20%*",
    "📊 *Delta:* +0.20%",
    "",
    "━━━━━━━━━━━━━━━━━━",
    "⚡ *Reply *INVEST* to act on this now*",
    "_Or visit sentill.africa/markets_",
  ],
};

FREQUENCIES.forEach(f => {
  if (!MSG_PREVIEWS[f.value]) MSG_PREVIEWS[f.value] = MSG_PREVIEWS["DAILY"];
});

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [prefs, setPrefs] = useState({
    whatsappEnabled: true,
    frequency: "DAILY",
    watchlistAlerts: true,
    marketMoversAlerts: false,
    aiOracleAlerts: true,
    yieldThreshold: 18.0,
  });
  const [previewFreq, setPreviewFreq] = useState("DAILY");
  const [testSending, setTestSending] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [prefsRes, sessionRes] = await Promise.all([
          fetch("/api/notifications/preferences"),
          fetch("/api/auth/session"),
        ]);
        if (prefsRes.ok) {
          const data = await prefsRes.json();
          if (data.prefs) setPrefs(p => ({ ...p, ...data.prefs }));
        }
        if (sessionRes.ok) {
          const sess = await sessionRes.json();
          setIsPremium(sess.user?.isPremium ?? false);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (res.ok) {
        toast.success("Notification preferences saved!", {
          description: "You'll receive messages based on your chosen schedule.",
        });
      } else {
        toast.error("Failed to save preferences");
      }
    } catch {
      toast.error("Network error — please try again");
    }
    setSaving(false);
  };

  const handleTestMessage = async () => {
    setTestSending(true);
    try {
      const res = await fetch("/api/notifications/test", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success("Test message sent!", { description: "Check your WhatsApp now." });
      } else {
        toast.error(data.error ?? "Failed to send test");
      }
    } catch {
      toast.error("Failed to send test message");
    }
    setTestSending(false);
  };

  const selectedFreq = FREQUENCIES.find(f => f.value === prefs.frequency) ?? FREQUENCIES[1];
  const previewLines = MSG_PREVIEWS[previewFreq] ?? MSG_PREVIEWS["DAILY"];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold">Loading preferences...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-950 pt-8 pb-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.1),_transparent_60%)]" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
            <Bell className="w-3 h-3 text-emerald-400" />
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Notification Center</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Daily Intelligence Settings</h1>
          <p className="text-slate-400 text-sm font-medium mt-2">
            Choose how and when Sentill keeps you informed via WhatsApp. Each message is AI-personalised with your live portfolio data.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-6 pb-16 space-y-6">

        {/* WhatsApp Toggle */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">WhatsApp Notifications</p>
                <p className="text-[10px] text-slate-500 font-medium">Deliver briefs directly to your WhatsApp</p>
              </div>
            </div>
            <button
              onClick={() => setPrefs(p => ({ ...p, whatsappEnabled: !p.whatsappEnabled }))}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${prefs.whatsappEnabled ? "bg-[#25D366]" : "bg-slate-200"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${prefs.whatsappEnabled ? "left-6" : "left-0.5"}`} />
            </button>
          </div>
        </div>

        {/* Frequency Selection */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Frequency</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FREQUENCIES.map((f) => {
              const Icon = f.icon;
              const isSelected = prefs.frequency === f.value;
              const isLocked = (f as any).premiumOnly && !isPremium;
              return (
                <button
                  key={f.value}
                  disabled={isLocked}
                  onClick={() => {
                    if (isLocked) { toast.error("This frequency requires Pro"); return; }
                    setPrefs(p => ({ ...p, frequency: f.value }));
                    setPreviewFreq(f.value);
                  }}
                  className={`relative flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                    isSelected ? f.color + " shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"
                  } ${isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-white/80" : "bg-slate-100"}`}>
                    <Icon className={`w-4.5 h-4.5 ${isSelected ? f.iconColor : "text-slate-500"}`} />
                  </div>
                  <div className="pr-6">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[11px] font-black ${isSelected ? "text-slate-900" : "text-slate-700"}`}>{f.label}</span>
                      {f.badge && (
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide ${f.badgeColor}`}>
                          {isLocked ? "🔒 Pro" : f.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? "text-slate-600" : "text-slate-400"}`}>{f.sublabel}</p>
                    <p className={`text-[10px] mt-1 leading-relaxed ${isSelected ? "text-slate-600" : "text-slate-400"}`}>{f.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alert Type Toggles */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Alert Types</h2>
          </div>
          <div className="space-y-4">
            {ALERT_TYPES.map((a) => {
              const Icon = a.icon;
              const enabled = prefs[a.key as keyof typeof prefs] as boolean;
              return (
                <div key={a.key} className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-900">{a.label}</p>
                      <p className="text-[9px] text-slate-500 font-medium">{a.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPrefs(p => ({ ...p, [a.key]: !enabled }))}
                    className={`relative w-11 h-6 rounded-full transition-all ${enabled ? "bg-emerald-500" : "bg-slate-300"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${enabled ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Yield Threshold */}
          {prefs.frequency === "MARKET_ALERTS_ONLY" && (
            <div className="mt-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
              <label className="text-[9px] font-black text-rose-800 uppercase tracking-widest block mb-2">
                Alert me when any fund reaches (% yield)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={10} max={25} step={0.5}
                  value={prefs.yieldThreshold}
                  onChange={e => setPrefs(p => ({ ...p, yieldThreshold: parseFloat(e.target.value) }))}
                  className="flex-1 accent-rose-500"
                />
                <span className="text-lg font-black text-rose-600 w-16 text-right">{prefs.yieldThreshold.toFixed(1)}%</span>
              </div>
              <p className="text-[9px] text-rose-600 font-medium mt-2">You'll get an instant alert when any MMF/Bond/T-Bill crosses {prefs.yieldThreshold.toFixed(1)}%</p>
            </div>
          )}
        </div>

        {/* Message Preview */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Message Preview</h2>
            </div>
            <div className="flex gap-2">
              {FREQUENCIES.slice(0, 4).map(f => (
                <button
                  key={f.value}
                  onClick={() => setPreviewFreq(f.value)}
                  className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest transition-all ${
                    previewFreq === f.value ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {f.label.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* WhatsApp Chat UI */}
          <div className="bg-[#0B141A] p-4">
            <div className="flex flex-col gap-1">
              {/* Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-white/10 mb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-black">SA</div>
                <div>
                  <p className="text-white text-xs font-bold">Sentill Africa</p>
                  <p className="text-green-400 text-[9px] font-medium">Official Business Account ✓</p>
                </div>
              </div>
              {/* Message bubble */}
              <div className="bg-[#1F2C34] rounded-2xl rounded-tl-none px-4 py-3 max-w-[95%] shadow">
                {previewLines.map((line, i) => (
                  <p key={i} className={`text-[11px] leading-relaxed font-mono ${
                    line === "" ? "h-2" :
                    line.startsWith("━") ? "text-slate-600 text-[8px]" :
                    line.startsWith("*") || line.includes("*") ? "text-white" :
                    line.startsWith("_") ? "text-slate-400 italic" :
                    "text-[#E9EDE9]"
                  }`}>
                    {line
                      .replace(/\*([^*]+)\*/g, (_, t) => t)
                      .replace(/_([^_]+)_/g, (_, t) => t)
                      || " "}
                  </p>
                ))}
                <p className="text-[9px] text-slate-600 mt-2 text-right">7:00 AM ✓✓</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
            <p className="text-[10px] text-slate-500 font-medium">
              📱 Actual messages are fully formatted with *bold*, _italic_, and personalised with your live portfolio data
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Preferences"}
          </button>
          <button
            onClick={handleTestMessage}
            disabled={testSending}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            {testSending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Zap className="w-4 h-4" />}
            {testSending ? "Sending..." : "Send Test Message"}
          </button>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-blue-900 mb-1">WhatsApp number linked at registration</p>
            <p className="text-xs text-blue-700 font-medium leading-relaxed">
              Messages are sent to the WhatsApp number you registered with. To update your number, contact support or reply <strong>SETTINGS</strong> in the WhatsApp chat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
