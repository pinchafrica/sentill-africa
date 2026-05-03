"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  MessageSquare, Search, Filter, RefreshCw, Send, ArrowLeft,
  CheckCircle2, Clock, Users, Zap, TrendingUp, ChevronRight,
  Crown, Shield, Loader2, Bot, User, BarChart3, XCircle,
  ArrowUpRight, ArrowDownLeft, Inbox, MessageCircle, X, Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ─────────────────────────────────────────────────────────── */
interface ConvSummary {
  waId: string;
  messageCount: number;
  lastMessageAt: string | null;
  user: { id: string; name: string; email: string; verified: boolean; isPremium: boolean; joinedAt: string } | null;
  sessionState: string;
  lastSeen: string | null;
  lastMessage: { text: string; direction: string } | null;
}

interface Message {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  message: string;
  msgType: string;
  status: string;
  createdAt: string;
}

interface ThreadData {
  waId: string;
  messages: Message[];
  user: any;
  sessionState: any;
  analytics: {
    totalMessages: number;
    inboundCount: number;
    outboundCount: number;
    avgResponseFormatted: string;
    firstMessage: string | null;
    lastMessage: string | null;
    topTopics: [string, number][];
    aiScore?: {
      total: number;
      coverage: number;
      speed: number;
      depth: number;
      engagement: number;
      diversity: number;
      grade: string;
    };
  };
}

interface Stats {
  totalConversations: number;
  totalMessages: number;
  messagesToday: number;
  inboundToday: number;
  outboundToday: number;
  activeToday: number;
}

/* ── Helpers ───────────────────────────────────────────────────────── */
function timeAgo(d: string | null) {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function formatPhone(waId: string) {
  if (waId.startsWith("254")) return `+254 ${waId.slice(3, 6)} ${waId.slice(6)}`;
  return `+${waId}`;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function ConversationsDashboard() {
  const [convos, setConvos] = useState<ConvSummary[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedWaId, setSelectedWaId] = useState<string | null>(null);
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [dmText, setDmText] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  /* ── Auto-refresh every 15s ──────────────────────────────────────── */
  useEffect(() => {
    const interval = setInterval(() => { fetchConvos(); }, 15000);
    return () => clearInterval(interval);
  }, [fetchConvos]);

  /* ── CSV Export ──────────────────────────────────────────────────── */
  const exportCSV = () => {
    const headers = ["Phone", "Name", "Email", "Messages", "Last Active", "Premium", "Verified"];
    const rows = convos.map((c) => [
      c.waId,
      c.user?.name ?? "Unknown",
      c.user?.email ?? "—",
      c.messageCount,
      c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleString() : "—",
      c.user?.isPremium ? "Yes" : "No",
      c.user?.verified ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sentil-conversations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("📥 CSV exported!");
  };

  /* ── Fetch conversations ─────────────────────────────────────────── */
  const fetchConvos = useCallback(async () => {
    try {
      const res = await fetch(`/api/whatsapp/conversations?search=${search}&filter=${filter}`);
      if (!res.ok) return;
      const data = await res.json();
      setConvos(data.conversations ?? []);
      setStats(data.stats ?? null);
    } catch { /* silent */ } finally { setLoading(false); }
  }, [search, filter]);

  useEffect(() => { fetchConvos(); }, [fetchConvos]);

  /* ── Fetch thread ────────────────────────────────────────────────── */
  const openThread = async (waId: string) => {
    setSelectedWaId(waId);
    setThreadLoading(true);
    setThread(null);
    try {
      const res = await fetch(`/api/whatsapp/conversations/${waId}`);
      if (res.ok) {
        const data = await res.json();
        setThread(data);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
      }
    } catch { /* silent */ } finally { setThreadLoading(false); }
  };

  /* ── Send DM ─────────────────────────────────────────────────────── */
  const handleSendDM = async () => {
    if (!dmText.trim() || !selectedWaId) return;
    setSending(true);
    try {
      const res = await fetch("/api/whatsapp/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waId: selectedWaId, message: dmText.trim(), userId: thread?.user?.id }),
      });
      if (res.ok) {
        showToast("✅ Message sent!");
        setDmText("");
        openThread(selectedWaId); // Refresh
      } else { showToast("❌ Failed to send"); }
    } catch { showToast("❌ Network error"); } finally { setSending(false); }
  };

  const filters = [
    { key: "all", label: "All", icon: Inbox },
    { key: "active", label: "Active 24h", icon: Zap },
    { key: "premium", label: "Premium", icon: Crown },
    { key: "unverified", label: "Unverified", icon: XCircle },
    { key: "unlinked", label: "Unlinked", icon: Shield },
  ];

  /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  return (
    <div className="space-y-6 pb-16">
      {/* ── Toast ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-6 right-6 z-[200] px-5 py-3 rounded-2xl text-sm font-bold shadow-xl bg-emerald-600 text-white"
          >{toast}</motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Conversations</h1>
            <p className="text-xs text-slate-500 font-medium">WhatsApp AI CRM — All threads</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-black uppercase tracking-widest text-emerald-700 transition-all">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={() => { setLoading(true); fetchConvos(); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-700 transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Total Threads", value: stats.totalConversations, icon: Users, color: "blue" },
            { label: "Total Messages", value: stats.totalMessages.toLocaleString(), icon: MessageCircle, color: "purple" },
            { label: "Messages Today", value: stats.messagesToday, icon: TrendingUp, color: "emerald" },
            { label: "Inbound Today", value: stats.inboundToday, icon: ArrowDownLeft, color: "cyan" },
            { label: "Outbound Today", value: stats.outboundToday, icon: ArrowUpRight, color: "orange" },
            { label: "Active 24h", value: stats.activeToday, icon: Zap, color: "rose" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${
                s.color === "blue" ? "bg-blue-50" : s.color === "purple" ? "bg-purple-50" :
                s.color === "emerald" ? "bg-emerald-50" : s.color === "cyan" ? "bg-cyan-50" :
                s.color === "orange" ? "bg-orange-50" : "bg-rose-50"}`}>
                <s.icon className={`w-4 h-4 ${
                  s.color === "blue" ? "text-blue-500" : s.color === "purple" ? "text-purple-500" :
                  s.color === "emerald" ? "text-emerald-500" : s.color === "cyan" ? "text-cyan-500" :
                  s.color === "orange" ? "text-orange-500" : "text-rose-500"}`} />
              </div>
              <p className="text-lg font-black text-slate-900">{s.value}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Search + Filters ───────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by phone, name, or email..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                filter === f.key
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
              }`}>
              <f.icon className="w-3 h-3" /> {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content: List + Thread ─────────────────────────────── */}
      <div className="grid lg:grid-cols-[380px_1fr] gap-4 min-h-[600px]">
        
        {/* ── Conversation List ──────────────────────────────────────── */}
        <div className={`bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col ${selectedWaId ? "hidden lg:flex" : "flex"}`}>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-700">
                {convos.length} conversation{convos.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-50" style={{ maxHeight: "calc(100vh - 380px)" }}>
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : convos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs font-bold">No conversations found</p>
              </div>
            ) : (
              convos.map((c) => (
                <button key={c.waId} onClick={() => openThread(c.waId)}
                  className={`w-full text-left px-5 py-4 hover:bg-slate-50 transition-all group ${
                    selectedWaId === c.waId ? "bg-emerald-50 border-l-4 border-emerald-500" : ""
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                      c.user?.isPremium ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" :
                      c.user ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
                    }`}>
                      {c.user?.name ? c.user.name.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase() : c.waId.slice(-2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-black text-slate-900 truncate">
                          {c.user?.name || formatPhone(c.waId)}
                        </p>
                        <span className="text-[9px] font-bold text-slate-400 flex-shrink-0 ml-2">
                          {timeAgo(c.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{formatPhone(c.waId)}</p>
                      {c.lastMessage && (
                        <p className="text-[10px] text-slate-400 truncate mt-1 max-w-[220px]">
                          {c.lastMessage.direction === "OUTBOUND" ? "🤖 " : "👤 "}
                          {c.lastMessage.text.slice(0, 60)}{c.lastMessage.text.length > 60 ? "…" : ""}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                          {c.messageCount} msgs
                        </span>
                        {c.user?.isPremium && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">⚡ PRO</span>
                        )}
                        {c.user?.verified && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">✓ Verified</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Thread View ─────────────────────────────────────────────── */}
        <div className={`bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col ${!selectedWaId ? "hidden lg:flex" : "flex"}`}>
          {!selectedWaId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10" />
              </div>
              <p className="text-sm font-bold text-slate-400">Select a conversation</p>
              <p className="text-xs text-slate-300 mt-1">Click any thread to view the full chat</p>
            </div>
          ) : threadLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : thread ? (
            <>
              {/* Thread Header */}
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <button onClick={() => { setSelectedWaId(null); setThread(null); }}
                    className="lg:hidden w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black ${
                    thread.user?.isPremium ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" :
                    thread.user ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    {thread.user?.name ? thread.user.name.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase() : thread.waId.slice(-2)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900">{thread.user?.name || formatPhone(thread.waId)}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{formatPhone(thread.waId)} · {thread.analytics.totalMessages} messages</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {thread.user?.isPremium && <span className="text-[9px] font-black px-2 py-1 rounded-full bg-amber-100 text-amber-700">⚡ PRO</span>}
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Avg Response</p>
                      <p className="text-xs font-black text-emerald-600">{thread.analytics.avgResponseFormatted}</p>
                    </div>
                    {thread.analytics.aiScore && (() => {
                      const s = thread.analytics.aiScore;
                      const bg = s.total >= 70 ? "#ecfdf5" : s.total >= 45 ? "#fffbeb" : "#fff1f2";
                      const border = s.total >= 70 ? "#a7f3d0" : s.total >= 45 ? "#fde68a" : "#fecdd3";
                      const text = s.total >= 70 ? "#059669" : s.total >= 45 ? "#d97706" : "#e11d48";
                      return (
                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl border-2"
                          style={{ background: bg, borderColor: border }}>
                          <span className="text-lg font-black leading-none" style={{ color: text }}>{s.total}</span>
                          <span className="text-[8px] font-black uppercase" style={{ color: text }}>{s.grade}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Thread stats mini-bar */}
                <div className="flex gap-4 mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <ArrowDownLeft className="w-3 h-3 text-blue-500" />
                    <span className="text-[10px] font-black text-slate-600">{thread.analytics.inboundCount} in</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-600">{thread.analytics.outboundCount} out</span>
                  </div>
                  {thread.analytics.topTopics.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <BarChart3 className="w-3 h-3 text-purple-500" />
                      {thread.analytics.topTopics.slice(0, 4).map(([topic]) => (
                        <span key={topic} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-600">{topic}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Score Breakdown */}
                {thread.analytics.aiScore && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">AI Intelligence Score</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { label: "Coverage", val: thread.analytics.aiScore.coverage, max: 20 },
                        { label: "Speed", val: thread.analytics.aiScore.speed, max: 20 },
                        { label: "Depth", val: thread.analytics.aiScore.depth, max: 25 },
                        { label: "Engage", val: thread.analytics.aiScore.engagement, max: 20 },
                        { label: "Diverse", val: thread.analytics.aiScore.diversity, max: 15 },
                      ].map((d) => {
                        const pct = Math.round((d.val / d.max) * 100);
                        const barColor = pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-rose-500";
                        return (
                          <div key={d.label} className="text-center">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.label}</p>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                            </div>
                            <p className="text-[9px] font-black text-slate-600 mt-0.5">{d.val}/{d.max}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gradient-to-b from-slate-50/50 to-white" style={{ maxHeight: "calc(100vh - 500px)", minHeight: "300px" }}>
                {thread.messages.filter(m => m.msgType !== "webhook_debug").map((msg) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.direction === "OUTBOUND"
                        ? "bg-emerald-600 text-white rounded-br-md"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm"
                    }`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        {msg.direction === "OUTBOUND" ? (
                          <Bot className="w-3 h-3 opacity-60" />
                        ) : (
                          <User className="w-3 h-3 text-slate-400" />
                        )}
                        <span className={`text-[9px] font-black uppercase tracking-widest ${
                          msg.direction === "OUTBOUND" ? "text-emerald-200" : "text-slate-400"
                        }`}>
                          {msg.direction === "OUTBOUND" ? "SENTIL AI" : "USER"}
                        </span>
                      </div>
                      <p className={`text-[13px] leading-relaxed whitespace-pre-wrap break-words ${
                        msg.direction === "OUTBOUND" ? "text-white/95" : "text-slate-700"
                      }`}>
                        {msg.message.length > 500 ? msg.message.slice(0, 500) + "..." : msg.message}
                      </p>
                      <p className={`text-[9px] mt-1.5 font-bold ${
                        msg.direction === "OUTBOUND" ? "text-emerald-300" : "text-slate-400"
                      }`}>
                        {new Date(msg.createdAt).toLocaleString("en-KE", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                        {msg.direction === "OUTBOUND" && msg.status === "READ" && " ✓✓"}
                        {msg.direction === "OUTBOUND" && msg.status === "DELIVERED" && " ✓✓"}
                        {msg.direction === "OUTBOUND" && msg.status === "SENT" && " ✓"}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Reply bar */}
              <div className="px-5 py-4 border-t border-slate-100 bg-white">
                <div className="flex gap-2">
                  <input type="text" placeholder="Type a reply..."
                    value={dmText} onChange={(e) => setDmText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendDM()}
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button onClick={handleSendDM} disabled={sending || !dmText.trim()}
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
