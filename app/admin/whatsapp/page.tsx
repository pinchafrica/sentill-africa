"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Smartphone, Users, MessageSquare, Send, RefreshCw,
  TrendingUp, CheckCircle2, XCircle, Clock, Loader2,
  BarChart3, Zap, Radio
} from "lucide-react";
import { motion } from "framer-motion";

interface WAStats {
  totalWaUsers: number;
  verifiedUsers: number;
  activeToday: number;
  totalMessages: number;
  broadcastsSent: number;
}

interface WALog {
  id: string;
  waId: string;
  direction: string;
  message: string;
  msgType: string;
  status: string;
  createdAt: string;
  user?: { name: string; email: string } | null;
}

interface WASession {
  id: string;
  waId: string;
  state: string;
  lastSeen: string;
  user?: { name: string; email: string } | null;
}

export default function AdminWhatsAppPage() {
  const [stats, setStats] = useState<WAStats | null>(null);
  const [logs, setLogs] = useState<WALog[]>([]);
  const [sessions, setSessions] = useState<WASession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);
  const [cronRunning, setCronRunning] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/whatsapp/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setLogs(data.recentLogs ?? []);
        setSessions(data.sessions ?? []);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error ?? `Server error ${res.status}`);
      }
    } catch (err) {
      setError("Network error — check your connection or server");
      console.error("[Admin WA] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const triggerCron = async () => {
    setCronRunning(true);
    try {
      const res = await fetch("/api/cron/whatsapp-daily", {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ""}` },
      });
      const data = await res.json();
      if (res.ok) {
        setBroadcastResult(`✅ Sent: ${data.sent}, Failed: ${data.failed}, Total: ${data.total}`);
      } else {
        setBroadcastResult(`❌ ${data.error ?? "Cron trigger failed"}`);
      }
    } catch {
      setBroadcastResult("❌ Cron trigger failed");
    } finally {
      setCronRunning(false);
    }
  };

  const sendBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    setBroadcasting(true);
    try {
      const res = await fetch("/api/whatsapp/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: broadcastMsg }),
      });
      const data = await res.json();
      setBroadcastResult(data.success ? `✅ Broadcast sent to ${data.sent} users` : `❌ ${data.error}`);
      setBroadcastMsg("");
    } catch {
      setBroadcastResult("❌ Failed to send broadcast");
    } finally {
      setBroadcasting(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
          <XCircle className="w-6 h-6 text-rose-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-black text-slate-900">Failed to load WhatsApp data</p>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center shadow-lg">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">WhatsApp Admin Hub</h1>
            <p className="text-sm text-slate-500">Monitor all WhatsApp activity and manage broadcasts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error banner (non-blocking — still shows stale data) */}
      {error && stats && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-xs text-rose-700 font-semibold flex items-center gap-2">
          <XCircle className="w-4 h-4 flex-shrink-0" /> {error} — showing cached data
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "WA Users", value: stats?.totalWaUsers ?? 0, icon: Users, color: "blue" },
          { label: "Verified", value: stats?.verifiedUsers ?? 0, icon: CheckCircle2, color: "emerald" },
          { label: "Active Today", value: stats?.activeToday ?? 0, icon: Radio, color: "purple" },
          { label: "Total Messages", value: stats?.totalMessages ?? 0, icon: MessageSquare, color: "orange" },
          { label: "Broadcasts", value: stats?.broadcastsSent ?? 0, icon: Send, color: "rose" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${
              s.color === "blue" ? "bg-blue-100" :
              s.color === "emerald" ? "bg-emerald-100" :
              s.color === "purple" ? "bg-purple-100" :
              s.color === "orange" ? "bg-orange-100" : "bg-rose-100"
            }`}>
              <s.icon className={`w-4 h-4 ${
                s.color === "blue" ? "text-blue-600" :
                s.color === "emerald" ? "text-emerald-600" :
                s.color === "purple" ? "text-purple-600" :
                s.color === "orange" ? "text-orange-600" : "text-rose-600"
              }`} />
            </div>
            <p className="text-2xl font-black text-slate-900">{s.value.toLocaleString()}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ─── Broadcast Panel ───────────────────────────────────────────── */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Manual Broadcast</h2>
            <p className="text-xs text-slate-500 mt-1">Send a message to all WhatsApp-verified users</p>
          </div>
          <div className="p-6 space-y-4">
            <textarea
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              placeholder="Type your broadcast message here..."
              rows={5}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-mono"
            />
            {broadcastResult && (
              <div className={`text-xs font-bold px-4 py-3 rounded-xl ${
                broadcastResult.startsWith("✅") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              }`}>
                {broadcastResult}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={sendBroadcast}
                disabled={broadcasting || !broadcastMsg.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-all disabled:opacity-50"
              >
                {broadcasting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Send Broadcast
              </button>
              <button
                onClick={triggerCron}
                disabled={cronRunning}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-widest hover:bg-emerald-50 transition-all disabled:opacity-50"
              >
                {cronRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Trigger AI Daily
              </button>
            </div>
          </div>
        </div>

        {/* ─── Active Sessions ───────────────────────────────────────────── */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Active Sessions</h2>
            <p className="text-xs text-slate-500 mt-1">Current conversation states</p>
          </div>
          <div className="divide-y divide-slate-50">
            {sessions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No active sessions</div>
            ) : (
              sessions.slice(0, 8).map((s) => (
                <div key={s.id} className="px-6 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${
                    s.state !== "IDLE" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900">{s.user?.name ?? "+"+s.waId}</p>
                    <p className="text-[11px] text-slate-500 truncate">{s.user?.email ?? s.waId}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                    s.state === "IDLE" ? "bg-slate-100 text-slate-500" :
                    s.state.includes("REGISTER") ? "bg-blue-100 text-blue-700" :
                    s.state.includes("PAY") ? "bg-orange-100 text-orange-700" : "bg-purple-100 text-purple-700"
                  }`}>
                    {s.state}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ─── Message Log ───────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Message Log</h2>
          <span className="text-xs text-slate-400">Last 50 messages · auto-refreshes every 60s</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                {["Time", "User", "WhatsApp #", "Direction", "Message", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No messages yet</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{log.user?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono">+{log.waId}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        log.direction === "INBOUND" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {log.direction === "INBOUND" ? "← IN" : "→ OUT"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-[250px] truncate">{log.message}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        log.status === "SENT" || log.status === "DELIVERED" || log.status === "READ"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
