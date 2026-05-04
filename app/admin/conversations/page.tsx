"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MessageSquare, Users, Search, Filter, RefreshCw, Loader2,
  ArrowLeft, Send, Crown, ShieldCheck, Clock, XCircle,
  ChevronDown, Radio, Eye, BarChart3, Zap, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── types ─────────────────────────────────────────────────── */
interface ConvoSummary {
  waId: string;
  messageCount: number;
  lastMessageAt: string | null;
  user: { id: string; name: string; email: string; verified: boolean; isPremium: boolean; joinedAt: string } | null;
  sessionState: string;
  lastSeen: string;
  lastMessage: { text: string; direction: string } | null;
}

interface ThreadMsg {
  id: string;
  direction: string;
  message: string;
  msgType: string;
  status: string;
  createdAt: string;
}

interface ThreadData {
  waId: string;
  messages: ThreadMsg[];
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
    aiScore: { total: number; coverage: number; speed: number; depth: number; engagement: number; diversity: number; grade: string };
  };
}

/* ── helpers ───────────────────────────────────────────────── */
function timeAgo(d: string | null) {
  if (!d) return "—";
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });
}

function StateBadge({ state }: { state: string }) {
  const c = state === "IDLE" ? "bg-slate-100 text-slate-500"
    : state.includes("REGISTER") ? "bg-blue-100 text-blue-700"
    : state.includes("PAY") || state.includes("SUB") ? "bg-orange-100 text-orange-700"
    : "bg-purple-100 text-purple-700";
  return <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${c}`}>{state}</span>;
}

/* ── score ring ────────────────────────────────────────────── */
function ScoreRing({ score, grade, size = 64 }: { score: number; grade: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-black" style={{ color }}>{grade}</span>
        <span className="text-[8px] font-bold text-slate-400">{score}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function ConversationsPage() {
  const [convos, setConvos] = useState<ConvoSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Thread view
  const [activeWaId, setActiveWaId] = useState<string | null>(null);
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);

  // DM
  const [dmText, setDmText] = useState("");
  const [dmSending, setDmSending] = useState(false);
  const [dmResult, setDmResult] = useState<string | null>(null);

  const fetchConvos = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ search, filter, limit: "100" });
      const res = await fetch(`/api/whatsapp/conversations?${q}`);
      if (res.ok) {
        const d = await res.json();
        setConvos(d.conversations ?? []);
        setTotal(d.total ?? 0);
        setStats(d.stats ?? null);
      }
    } catch { /* silent */ }
    setLoading(false);
  }, [search, filter]);

  useEffect(() => { fetchConvos(); }, [fetchConvos]);

  const openThread = async (waId: string) => {
    setActiveWaId(waId);
    setThreadLoading(true);
    setThread(null);
    setDmText("");
    setDmResult(null);
    try {
      const res = await fetch(`/api/whatsapp/conversations/${waId}`);
      if (res.ok) setThread(await res.json());
    } catch { /* silent */ }
    setThreadLoading(false);
  };

  const sendDM = async () => {
    if (!activeWaId || !dmText.trim()) return;
    setDmSending(true);
    try {
      const res = await fetch("/api/whatsapp/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waId: activeWaId, message: dmText, userId: thread?.user?.id }),
      });
      const d = await res.json();
      if (d.success) {
        setDmResult("✅ Sent");
        setDmText("");
        setTimeout(() => { openThread(activeWaId!); setDmResult(null); }, 1500);
      } else setDmResult(`❌ ${d.error}`);
    } catch { setDmResult("❌ Failed"); }
    setDmSending(false);
  };

  /* ── Thread View ─────────────────────────────────────────── */
  if (activeWaId) {
    return (
      <div className="space-y-6 pb-16">
        {/* Back + Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveWaId(null)}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white ${
                thread?.user?.isPremium ? "bg-gradient-to-br from-violet-600 to-purple-700" : "bg-gradient-to-br from-slate-500 to-slate-600"
              }`}>
                {thread?.user?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() ?? "?"}
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900">
                  {thread?.user?.name ?? `+${activeWaId}`}
                </h1>
                <p className="text-xs text-slate-400 font-mono">+{activeWaId}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {thread?.user?.isPremium && (
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 ring-1 ring-purple-200">
                <Crown className="w-3 h-3" /> PRO
              </span>
            )}
            {thread?.user?.verified && (
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            )}
            {thread?.sessionState && <StateBadge state={thread.sessionState.state} />}
          </div>
        </div>

        {threadLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          </div>
        ) : thread ? (
          <>
            {/* Analytics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { l: "Total Msgs", v: thread.analytics.totalMessages, c: "blue" },
                { l: "Inbound", v: thread.analytics.inboundCount, c: "cyan" },
                { l: "Outbound", v: thread.analytics.outboundCount, c: "emerald" },
                { l: "Avg Response", v: thread.analytics.avgResponseFormatted, c: "purple", t: true },
                { l: "First Msg", v: thread.analytics.firstMessage ? timeAgo(thread.analytics.firstMessage) : "—", c: "slate", t: true },
                { l: "Last Msg", v: thread.analytics.lastMessage ? timeAgo(thread.analytics.lastMessage) : "—", c: "orange", t: true },
                { l: "Topics", v: thread.analytics.topTopics.length, c: "rose" },
              ].map((s, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                  <p className="text-lg font-black text-slate-900">{s.v}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.l}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-[1fr_320px] gap-6">
              {/* Chat Thread */}
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col" style={{ maxHeight: "calc(100vh - 300px)" }}>
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Full Conversation · {thread.messages.length} messages
                  </h2>
                  <button onClick={() => openThread(activeWaId!)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-1" id="chat-scroll">
                  {(() => {
                    let lastDate = "";
                    return thread.messages.map((msg) => {
                      const msgDate = fmtDate(msg.createdAt);
                      const showDate = msgDate !== lastDate;
                      lastDate = msgDate;
                      const isIn = msg.direction === "INBOUND";
                      return (
                        <React.Fragment key={msg.id}>
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-4 py-1.5 rounded-full">
                                {msgDate}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isIn ? "justify-start" : "justify-end"} mb-1`}>
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isIn
                                ? "bg-white border border-slate-200 text-slate-800 rounded-bl-md"
                                : "bg-gradient-to-br from-emerald-600 to-green-700 text-white rounded-br-md shadow-sm"
                            }`}>
                              <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                              <div className={`flex items-center gap-1.5 mt-1 ${isIn ? "text-slate-300" : "text-white/60"}`}>
                                <span className="text-[9px] font-bold">{fmtTime(msg.createdAt)}</span>
                                {!isIn && (
                                  <span className="text-[8px] font-bold uppercase">{msg.status === "READ" ? "✓✓" : msg.status === "DELIVERED" ? "✓✓" : "✓"}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    });
                  })()}
                </div>

                {/* Compose */}
                <div className="px-5 py-3 border-t border-slate-100">
                  {dmResult && (
                    <div className={`text-xs font-bold px-3 py-2 rounded-lg mb-2 ${
                      dmResult.startsWith("✅") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}>{dmResult}</div>
                  )}
                  <div className="flex gap-2">
                    <input value={dmText} onChange={(e) => setDmText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendDM()}
                      placeholder="Reply to this conversation..."
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    <button onClick={sendDM} disabled={dmSending || !dmText.trim()}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                      {dmSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Send
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Sidebar — AI Score + Topics */}
              <div className="space-y-4">
                {/* AI Score Card */}
                <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">AI Intelligence Score</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <ScoreRing score={thread.analytics.aiScore.total} grade={thread.analytics.aiScore.grade} />
                    <div>
                      <p className="text-2xl font-black text-slate-900">{thread.analytics.aiScore.total}<span className="text-sm text-slate-400">/100</span></p>
                      <p className="text-[10px] text-slate-500">Conversation quality</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { l: "Coverage", v: thread.analytics.aiScore.coverage, m: 20 },
                      { l: "Speed", v: thread.analytics.aiScore.speed, m: 20 },
                      { l: "Depth", v: thread.analytics.aiScore.depth, m: 25 },
                      { l: "Engagement", v: thread.analytics.aiScore.engagement, m: 20 },
                      { l: "Diversity", v: thread.analytics.aiScore.diversity, m: 15 },
                    ].map((d) => (
                      <div key={d.l}>
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="font-bold text-slate-500">{d.l}</span>
                          <span className="font-black text-slate-700">{d.v}/{d.m}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${(d.v / d.m) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Topics */}
                {thread.analytics.topTopics.length > 0 && (
                  <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Top Topics</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {thread.analytics.topTopics.map(([topic, count]) => (
                        <span key={topic} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                          {topic} <span className="text-slate-400">({count})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Info */}
                {thread.user && (
                  <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">User Details</h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-slate-400">Email</span><span className="font-bold text-slate-700">{thread.user.email}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Joined</span><span className="font-bold text-slate-700">{fmtDate(thread.user.createdAt)}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Assets</span><span className="font-bold text-slate-700">{thread.user._count?.portfolioAssets ?? 0}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Payments</span><span className="font-bold text-slate-700">{thread.user._count?.payments ?? 0}</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <XCircle className="w-8 h-8 text-rose-400" />
            <p className="text-sm font-bold text-slate-500">Failed to load conversation</p>
          </div>
        )}
      </div>
    );
  }

  /* ── Conversation List View ──────────────────────────────── */
  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Conversations</h1>
            <p className="text-sm text-slate-500">Full WhatsApp conversation threads · Start to finish</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          <button onClick={fetchConvos}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { l: "Conversations", v: stats.totalConversations, c: "blue" },
            { l: "Total Messages", v: stats.totalMessages?.toLocaleString(), c: "emerald" },
            { l: "Today", v: stats.messagesToday, c: "orange" },
            { l: "Inbound Today", v: stats.inboundToday, c: "cyan" },
            { l: "Active 24h", v: stats.activeToday, c: "purple" },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
              <p className="text-xl font-black text-slate-900">{s.v}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All</option>
          <option value="active">Active 24h</option>
          <option value="premium">Premium</option>
          <option value="unverified">Unverified</option>
          <option value="unlinked">No Account</option>
        </select>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {convos.length} of {total}
        </span>
      </div>

      {/* Conversation List */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-50">
        {convos.length === 0 && !loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">No conversations found</div>
        ) : (
          convos.map((c) => (
            <motion.div key={c.waId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => openThread(c.waId)}
              className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              {/* Avatar */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-[11px] font-black text-white flex-shrink-0 ${
                c.user?.isPremium ? "bg-gradient-to-br from-violet-600 to-purple-700" : "bg-gradient-to-br from-slate-400 to-slate-500"
              }`}>
                {c.user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "?"}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                    {c.user?.name ?? `+${c.waId}`}
                  </p>
                  {c.user?.isPremium && <Crown className="w-3 h-3 text-purple-500 flex-shrink-0" />}
                  {c.user?.verified && <ShieldCheck className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {c.lastMessage ? (
                    <><span className="font-bold">{c.lastMessage.direction === "INBOUND" ? "←" : "→"}</span> {c.lastMessage.text}</>
                  ) : "No messages"}
                </p>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <StateBadge state={c.sessionState} />
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400">{timeAgo(c.lastMessageAt)}</p>
                  <p className="text-[10px] font-black text-slate-600">{c.messageCount} msgs</p>
                </div>
                <Eye className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
