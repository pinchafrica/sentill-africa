"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Smartphone, Users, MessageSquare, Send, RefreshCw,
  TrendingUp, CheckCircle2, XCircle, Clock, Loader2,
  BarChart3, Zap, Radio, Crown, Search, Filter,
  ChevronDown, ChevronUp, ExternalLink, DollarSign,
  ArrowUpRight, ArrowDownRight, Eye, ShieldCheck,
  MessageCircle, UserCheck, Wallet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ────────────────────────────────────────────────────────────────────

interface WAStats {
  totalWaUsers: number;
  verifiedUsers: number;
  activeToday: number;
  totalMessages: number;
  broadcastsSent: number;
  premiumUsers: number;
  freeUsers: number;
  conversionRate: number;
}

interface RevenueData {
  totalRevenue: number;
  mrr: number;
  arr: number;
  revenueToday: number;
  monthlyRevenue: { month: string; revenue: number }[];
  totalPayments: number;
}

interface HeatmapData {
  data: number[][];
  days: string[];
}

interface WAUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  isPremium: boolean;
  premiumActivatedAt: string | null;
  premiumExpiresAt: string | null;
  paymentSource: "whatsapp" | "website" | "app" | "free";
  lastPayment: {
    method: string;
    plan: string;
    amount: number;
    reference: string;
    createdAt: string;
  } | null;
  messageCount: number;
  assetsCount: number;
  joinedAt: string;
  churnRisk: number;
  lastMessageAt: string | null;
  daysSinceLastMsg: number;
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

// ── Payment Source Badge ─────────────────────────────────────────────────────

function SourceBadge({ source }: { source: WAUser["paymentSource"] }) {
  const config = {
    whatsapp: { label: "WA", bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200" },
    website:  { label: "WEB", bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-200" },
    app:      { label: "APP", bg: "bg-purple-100", text: "text-purple-700", ring: "ring-purple-200" },
    free:     { label: "FREE", bg: "bg-slate-100", text: "text-slate-500", ring: "ring-slate-200" },
  }[source];

  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ring-1 ${config.bg} ${config.text} ${config.ring}`}>
      {source === "whatsapp" && <MessageCircle className="w-3 h-3" />}
      {source === "website" && <ExternalLink className="w-3 h-3" />}
      {source === "app" && <Smartphone className="w-3 h-3" />}
      {config.label}
    </span>
  );
}

// ── Plan Badge ───────────────────────────────────────────────────────────────

function PlanBadge({ isPremium, expiresAt }: { isPremium: boolean; expiresAt: string | null }) {
  if (!isPremium) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-200">
        FREE
      </span>
    );
  }

  const isExpiringSoon = expiresAt
    ? new Date(expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    : false;

  return (
    <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ring-1 ${
      isExpiringSoon
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-gradient-to-r from-violet-100 to-purple-100 text-purple-800 ring-purple-200"
    }`}>
      <Crown className="w-3 h-3" />
      {isExpiringSoon ? "EXPIRING" : "PRO"}
    </span>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AdminWhatsAppPage() {
  const [stats, setStats] = useState<WAStats | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [users, setUsers] = useState<WAUser[]>([]);
  const [logs, setLogs] = useState<WALog[]>([]);
  const [sessions, setSessions] = useState<WASession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);
  const [cronRunning, setCronRunning] = useState(false);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState<"all" | "premium" | "free">("all");
  const [filterSource, setFilterSource] = useState<"all" | "whatsapp" | "website" | "app" | "free">("all");
  const [sortField, setSortField] = useState<"joinedAt" | "messageCount" | "name">("joinedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [activeTab, setActiveTab] = useState<"users" | "messages" | "sessions" | "analytics">("users");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // Direct Message
  const [dmUser, setDmUser] = useState<WAUser | null>(null);
  const [dmText, setDmText] = useState("");
  const [dmSending, setDmSending] = useState(false);
  const [dmResult, setDmResult] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/whatsapp/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRevenue(data.revenue ?? null);
        setHeatmap(data.heatmap ?? null);
        setUsers(data.users ?? []);
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

  const sendDM = async () => {
    if (!dmUser || !dmText.trim()) return;
    setDmSending(true);
    setDmResult(null);
    try {
      const res = await fetch("/api/whatsapp/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waId: dmUser.phone, message: dmText, userId: dmUser.id }),
      });
      const data = await res.json();
      if (data.success) {
        setDmResult(`✅ Message sent to ${dmUser.name}`);
        setDmText("");
        setTimeout(() => { setDmUser(null); setDmResult(null); }, 2000);
      } else {
        setDmResult(`❌ ${data.error}`);
      }
    } catch {
      setDmResult("❌ Failed to send");
    } finally {
      setDmSending(false);
    }
  };

  // ── Filtered & Sorted Users ──────────────────────────────────────────────

  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone?.includes(q)
      );
    }

    // Plan filter
    if (filterPlan === "premium") result = result.filter(u => u.isPremium);
    if (filterPlan === "free") result = result.filter(u => !u.isPremium);

    // Source filter
    if (filterSource !== "all") result = result.filter(u => u.paymentSource === filterSource);

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "messageCount") cmp = a.messageCount - b.messageCount;
      else cmp = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      return sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [users, searchQuery, filterPlan, filterSource, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  // ── Loading / Error ──────────────────────────────────────────────────────

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

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    sortField === field
      ? sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
      : null
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">WhatsApp CRM Dashboard</h1>
            <p className="text-sm text-slate-500">User directory · Payment sources · AI usage analytics</p>
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

      {/* Error banner (non-blocking) */}
      {error && stats && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-xs text-rose-700 font-semibold flex items-center gap-2">
          <XCircle className="w-4 h-4 flex-shrink-0" /> {error} — showing cached data
        </div>
      )}

      {/* ── Stats Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: "Total WA Users", value: stats?.totalWaUsers ?? 0, icon: Users, color: "blue" },
          { label: "Premium", value: stats?.premiumUsers ?? 0, icon: Crown, color: "purple" },
          { label: "Free", value: stats?.freeUsers ?? 0, icon: UserCheck, color: "slate" },
          { label: "Verified", value: stats?.verifiedUsers ?? 0, icon: ShieldCheck, color: "emerald" },
          { label: "Active Today", value: stats?.activeToday ?? 0, icon: Radio, color: "cyan" },
          { label: "Total Msgs", value: stats?.totalMessages ?? 0, icon: MessageSquare, color: "orange" },
          { label: "Broadcasts", value: stats?.broadcastsSent ?? 0, icon: Send, color: "rose" },
          { label: "Conversion", value: `${stats?.conversionRate ?? 0}%`, icon: TrendingUp, color: "green", isText: true },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm"
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${
              s.color === "blue" ? "bg-blue-100" :
              s.color === "purple" ? "bg-purple-100" :
              s.color === "slate" ? "bg-slate-100" :
              s.color === "emerald" ? "bg-emerald-100" :
              s.color === "cyan" ? "bg-cyan-100" :
              s.color === "orange" ? "bg-orange-100" :
              s.color === "rose" ? "bg-rose-100" : "bg-green-100"
            }`}>
              <s.icon className={`w-3.5 h-3.5 ${
                s.color === "blue" ? "text-blue-600" :
                s.color === "purple" ? "text-purple-600" :
                s.color === "slate" ? "text-slate-500" :
                s.color === "emerald" ? "text-emerald-600" :
                s.color === "cyan" ? "text-cyan-600" :
                s.color === "orange" ? "text-orange-600" :
                s.color === "rose" ? "text-rose-600" : "text-green-600"
              }`} />
            </div>
            <p className="text-xl font-black text-slate-900">
              {"isText" in s ? s.value : (typeof s.value === "number" ? s.value.toLocaleString() : s.value)}
            </p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Conversion Funnel Bar ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Conversion Funnel</h3>
          <span className="text-xs font-bold text-emerald-600">{stats?.conversionRate ?? 0}% conversion rate</span>
        </div>
        <div className="flex gap-1 h-4 rounded-full overflow-hidden bg-slate-100">
          <div
            className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-700"
            style={{ width: `${Math.max(stats?.conversionRate ?? 0, 2)}%` }}
          />
          <div
            className="bg-gradient-to-r from-slate-200 to-slate-300 rounded-r-full transition-all duration-700 flex-1"
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-bold">
          <span className="text-purple-600">⚡ {stats?.premiumUsers ?? 0} Premium</span>
          <span className="text-slate-400">{stats?.freeUsers ?? 0} Free Users</span>
        </div>
      </div>

      {/* ── Tab Navigation ────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {([
          { key: "users",     label: "User Directory",     icon: Users },
          { key: "analytics", label: "Revenue & Insights", icon: BarChart3 },
          { key: "messages",  label: "Message Log",        icon: MessageSquare },
          { key: "sessions",  label: "Live Sessions",      icon: Radio },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: User Directory ───────────────────────────────────────────── */}
      {activeTab === "users" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
        >
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value as typeof filterPlan)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase tracking-wider"
              >
                <option value="all">All Plans</option>
                <option value="premium">⚡ Premium</option>
                <option value="free">🔓 Free</option>
              </select>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value as typeof filterSource)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase tracking-wider"
              >
                <option value="all">All Sources</option>
                <option value="whatsapp">💬 WhatsApp</option>
                <option value="website">🌐 Website</option>
                <option value="app">📱 App</option>
                <option value="free">🔓 No Payment</option>
              </select>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {filteredUsers.length} of {users.length} users
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {[
                    { key: "name", label: "User", sortable: true },
                    { key: "phone", label: "WhatsApp", sortable: false },
                    { key: "plan", label: "Plan", sortable: false },
                    { key: "source", label: "Paid Via", sortable: false },
                    { key: "messageCount", label: "Messages", sortable: true },
                    { key: "assets", label: "Assets", sortable: false },
                    { key: "joinedAt", label: "Joined", sortable: true },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && toggleSort(col.key as typeof sortField)}
                      className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 ${
                        col.sortable ? "cursor-pointer hover:text-slate-600 select-none" : ""
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && <SortIcon field={col.key as typeof sortField} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      No users match your filters
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isExpanded = expandedUserId === u.id;
                    const daysLeft = u.premiumExpiresAt
                      ? Math.ceil((new Date(u.premiumExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      : null;
                    const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
                    const isExpired = daysLeft !== null && daysLeft <= 0;

                    return (
                      <React.Fragment key={u.id}>
                        <tr
                          onClick={() => setExpandedUserId(isExpanded ? null : u.id)}
                          className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${isExpanded ? "bg-slate-50/50" : ""}`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black text-white ${
                                u.isPremium
                                  ? "bg-gradient-to-br from-violet-600 to-purple-700"
                                  : "bg-gradient-to-br from-slate-400 to-slate-500"
                              }`}>
                                {u.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{u.name}</p>
                                  {isExpiringSoon && (
                                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title={`Expires in ${daysLeft} days`} />
                                  )}
                                  {isExpired && u.isPremium && (
                                    <span className="w-2 h-2 rounded-full bg-rose-500" title="Subscription expired" />
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400">{u.email}</p>
                              </div>
                              <ChevronDown className={`w-3 h-3 text-slate-300 transition-transform ml-auto ${isExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-slate-600 text-[11px]">+{u.phone}</span>
                            {u.verified && <CheckCircle2 className="w-3 h-3 text-emerald-500 inline ml-1" />}
                          </td>
                          <td className="px-4 py-3">
                            <PlanBadge isPremium={u.isPremium} expiresAt={u.premiumExpiresAt} />
                          </td>
                          <td className="px-4 py-3">
                            <SourceBadge source={u.paymentSource} />
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-slate-700">{u.messageCount.toLocaleString()}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-bold ${u.assetsCount > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                              {u.assetsCount}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {new Date(u.joinedAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "2-digit" })}
                          </td>
                        </tr>

                        {/* ── Expanded Detail Panel ──────────────────────── */}
                        <AnimatePresence>
                          {isExpanded && (
                            <tr>
                              <td colSpan={7} className="p-0">
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 py-5 bg-gradient-to-r from-slate-50/80 to-white border-b border-slate-100">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                                      {/* Subscription Status Card */}
                                      <div className={`rounded-xl p-4 border ${
                                        u.isPremium
                                          ? isExpiringSoon
                                            ? "bg-amber-50 border-amber-200"
                                            : isExpired
                                              ? "bg-rose-50 border-rose-200"
                                              : "bg-gradient-to-br from-violet-50 to-purple-50 border-purple-200"
                                          : "bg-slate-50 border-slate-200"
                                      }`}>
                                        <div className="flex items-center gap-2 mb-2">
                                          <Crown className={`w-4 h-4 ${u.isPremium ? "text-purple-600" : "text-slate-400"}`} />
                                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subscription</p>
                                        </div>
                                        {u.isPremium ? (
                                          <>
                                            <p className="text-sm font-black text-slate-900">
                                              {u.lastPayment?.plan?.replace(/_/g, " ") ?? "Pro Active"}
                                            </p>
                                            {daysLeft !== null && (
                                              <div className="mt-2">
                                                <div className="flex items-center justify-between text-[10px] mb-1">
                                                  <span className="font-bold text-slate-500">Time remaining</span>
                                                  <span className={`font-black ${
                                                    isExpired ? "text-rose-600" : isExpiringSoon ? "text-amber-600" : "text-emerald-600"
                                                  }`}>
                                                    {isExpired ? "EXPIRED" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}
                                                  </span>
                                                </div>
                                                {!isExpired && (
                                                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                      className={`h-full rounded-full transition-all ${
                                                        isExpiringSoon ? "bg-amber-400" : "bg-purple-500"
                                                      }`}
                                                      style={{ width: `${Math.min(100, Math.max(5, (daysLeft / 30) * 100))}%` }}
                                                    />
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </>
                                        ) : (
                                          <p className="text-sm font-bold text-slate-500">Free Plan</p>
                                        )}
                                      </div>

                                      {/* Dates Card */}
                                      <div className="rounded-xl p-4 bg-white border border-slate-200">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Clock className="w-4 h-4 text-blue-500" />
                                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Key Dates</p>
                                        </div>
                                        <div className="space-y-2">
                                          <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Joined</p>
                                            <p className="text-xs font-bold text-slate-800">
                                              {new Date(u.joinedAt).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}
                                            </p>
                                          </div>
                                          {u.premiumActivatedAt && (
                                            <div>
                                              <p className="text-[9px] font-bold text-slate-400 uppercase">Pro Since</p>
                                              <p className="text-xs font-bold text-purple-700">
                                                {new Date(u.premiumActivatedAt).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}
                                              </p>
                                            </div>
                                          )}
                                          {u.premiumExpiresAt && (
                                            <div>
                                              <p className="text-[9px] font-bold text-slate-400 uppercase">Expires On</p>
                                              <p className={`text-xs font-bold ${
                                                isExpired ? "text-rose-600" : isExpiringSoon ? "text-amber-600" : "text-slate-800"
                                              }`}>
                                                {new Date(u.premiumExpiresAt).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}
                                                {isExpiringSoon && " ⚠️"}
                                                {isExpired && " ❌"}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Payment Card */}
                                      <div className="rounded-xl p-4 bg-white border border-slate-200">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Wallet className="w-4 h-4 text-emerald-500" />
                                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Last Payment</p>
                                        </div>
                                        {u.lastPayment ? (
                                          <div className="space-y-2">
                                            <div>
                                              <p className="text-[9px] font-bold text-slate-400 uppercase">Amount</p>
                                              <p className="text-lg font-black text-emerald-600">
                                                KES {u.lastPayment.amount.toLocaleString()}
                                              </p>
                                            </div>
                                            <div className="flex gap-3">
                                              <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Method</p>
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                                  u.lastPayment.method === "MPESA" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                                }`}>
                                                  {u.lastPayment.method}
                                                </span>
                                              </div>
                                              <div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Date</p>
                                                <p className="text-[11px] font-bold text-slate-700">
                                                  {new Date(u.lastPayment.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <p className="text-xs text-slate-400 italic">No payments recorded</p>
                                        )}
                                      </div>

                                      {/* Activity Card */}
                                      <div className="rounded-xl p-4 bg-white border border-slate-200">
                                        <div className="flex items-center gap-2 mb-2">
                                          <BarChart3 className="w-4 h-4 text-orange-500" />
                                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Activity</p>
                                        </div>
                                        <div className="space-y-2">
                                          <div className="flex justify-between">
                                            <span className="text-[10px] text-slate-500">Messages</span>
                                            <span className="text-xs font-black text-slate-800">{u.messageCount.toLocaleString()}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-[10px] text-slate-500">Assets Logged</span>
                                            <span className="text-xs font-black text-slate-800">{u.assetsCount}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-[10px] text-slate-500">WA Verified</span>
                                            <span className={`text-xs font-black ${u.verified ? "text-emerald-600" : "text-rose-500"}`}>
                                              {u.verified ? "Yes ✓" : "No"}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-[10px] text-slate-500">Source</span>
                                            <SourceBadge source={u.paymentSource} />
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Expiry Warning Banner */}
                                    {u.isPremium && isExpiringSoon && !isExpired && (
                                      <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                                        <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                        <div className="flex-1">
                                          <p className="text-xs font-black text-amber-800">
                                            Subscription expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                                          </p>
                                          <p className="text-[10px] text-amber-600 mt-0.5">
                                            WhatsApp renewal reminder will be sent {daysLeft <= 2 ? "today" : `${daysLeft - 2} day${daysLeft - 2 !== 1 ? "s" : ""} before expiry`} via the daily cron job.
                                          </p>
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-amber-200 text-amber-800">
                                          ⚠️ EXPIRING
                                        </span>
                                      </div>
                                    )}

                                    {u.isPremium && isExpired && (
                                      <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl">
                                        <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                                        <div className="flex-1">
                                          <p className="text-xs font-black text-rose-800">
                                            Subscription has expired
                                          </p>
                                          <p className="text-[10px] text-rose-600 mt-0.5">
                                            User was sent a renewal reminder. Pro features are now locked.
                                          </p>
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-rose-200 text-rose-800">
                                          ❌ EXPIRED
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── TAB: Message Log ──────────────────────────────────────────────── */}
      {activeTab === "messages" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Message Log</h2>
            <span className="text-xs text-slate-400">Last 50 messages · auto-refreshes every 60s</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
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
                      <td className="px-4 py-3 text-slate-700 max-w-[300px] truncate">{log.message}</td>
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
        </motion.div>
      )}

      {/* ── TAB: Live Sessions ────────────────────────────────────────────── */}
      {activeTab === "sessions" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Live Conversation Sessions</h2>
            <p className="text-xs text-slate-500 mt-1">Current WhatsApp conversation states</p>
          </div>
          <div className="divide-y divide-slate-50">
            {sessions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No active sessions</div>
            ) : (
              sessions.map((s) => (
                <div key={s.id} className="px-6 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    s.state !== "IDLE" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900">{s.user?.name ?? "+"+s.waId}</p>
                    <p className="text-[11px] text-slate-500 truncate">{s.user?.email ?? s.waId}</p>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(s.lastSeen).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                    s.state === "IDLE" ? "bg-slate-100 text-slate-500" :
                    s.state.includes("REGISTER") ? "bg-blue-100 text-blue-700" :
                    s.state.includes("SUB") || s.state.includes("PAY") ? "bg-orange-100 text-orange-700" :
                    s.state.includes("BROWSE") ? "bg-cyan-100 text-cyan-700" : "bg-purple-100 text-purple-700"
                  }`}>
                    {s.state}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
      {/* ── TAB: Revenue & Insights ──────────────────────────────────────── */}
      {activeTab === "analytics" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Revenue Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Revenue", value: revenue?.totalRevenue ?? 0, prefix: "KES ", color: "emerald", icon: DollarSign },
              { label: "Monthly Recurring", value: revenue?.mrr ?? 0, prefix: "KES ", color: "purple", icon: TrendingUp },
              { label: "Projected ARR", value: revenue?.arr ?? 0, prefix: "KES ", color: "blue", icon: ArrowUpRight },
              { label: "Today's Revenue", value: revenue?.revenueToday ?? 0, prefix: "KES ", color: "orange", icon: Zap },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${
                  card.color === "emerald" ? "bg-emerald-100" :
                  card.color === "purple" ? "bg-purple-100" :
                  card.color === "blue" ? "bg-blue-100" : "bg-orange-100"
                }`}>
                  <card.icon className={`w-4 h-4 ${
                    card.color === "emerald" ? "text-emerald-600" :
                    card.color === "purple" ? "text-purple-600" :
                    card.color === "blue" ? "text-blue-600" : "text-orange-600"
                  }`} />
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {card.prefix}{card.value.toLocaleString()}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{card.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Monthly Revenue Chart */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-4">Monthly Revenue (Last 6 Months)</h3>
            <div className="flex items-end gap-2 h-40">
              {(revenue?.monthlyRevenue ?? []).map((m, i) => {
                const maxRev = Math.max(...(revenue?.monthlyRevenue ?? []).map(r => r.revenue), 1);
                const heightPct = (m.revenue / maxRev) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-slate-500">
                      {m.revenue > 0 ? `${(m.revenue / 1000).toFixed(1)}K` : "0"}
                    </span>
                    <div className="w-full relative" style={{ height: "120px" }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(heightPct, 2)}%` }}
                        transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                        className={`absolute bottom-0 w-full rounded-lg ${
                          i === (revenue?.monthlyRevenue?.length ?? 0) - 1
                            ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                            : "bg-gradient-to-t from-slate-300 to-slate-200"
                        }`}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Activity Heatmap */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-4">
                🔥 Activity Heatmap — 7 Day × 24 Hour
              </h3>
              <div className="space-y-1">
                {(heatmap?.data ?? []).map((row, dayIdx) => (
                  <div key={dayIdx} className="flex items-center gap-1">
                    <span className="w-8 text-[9px] font-bold text-slate-400 text-right">
                      {heatmap?.days?.[dayIdx] ?? ""}
                    </span>
                    <div className="flex-1 flex gap-[2px]">
                      {row.map((count, hourIdx) => {
                        const maxCount = Math.max(...(heatmap?.data ?? [[]]).flat(), 1);
                        const intensity = count / maxCount;
                        return (
                          <div
                            key={hourIdx}
                            title={`${heatmap?.days?.[dayIdx]} ${hourIdx}:00 — ${count} messages`}
                            className="flex-1 h-5 rounded-sm transition-colors"
                            style={{
                              backgroundColor: count === 0
                                ? "#f1f5f9"
                                : `rgba(16, 185, 129, ${Math.max(0.15, intensity)})`
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-1 mt-2">
                  <span className="w-8" />
                  <div className="flex-1 flex justify-between text-[8px] text-slate-300 font-bold">
                    <span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Churn Risk Leaderboard */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                  ⚠️ Churn Risk — At-Risk Users
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">Users most likely to disengage (scored 0–100)</p>
              </div>
              <div className="divide-y divide-slate-50">
                {[...users]
                  .sort((a, b) => b.churnRisk - a.churnRisk)
                  .slice(0, 8)
                  .map((u) => (
                    <div key={u.id} className="px-6 py-3 flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black text-white ${
                        u.churnRisk >= 70 ? "bg-rose-500" : u.churnRisk >= 40 ? "bg-amber-500" : "bg-emerald-500"
                      }`}>
                        {u.churnRisk}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {u.daysSinceLastMsg === 999 ? "Never messaged" : `Last active ${u.daysSinceLastMsg}d ago`}
                          {" · "}{u.messageCount} msgs
                        </p>
                      </div>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            u.churnRisk >= 70 ? "bg-rose-500" : u.churnRisk >= 40 ? "bg-amber-400" : "bg-emerald-400"
                          }`}
                          style={{ width: `${u.churnRisk}%` }}
                        />
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDmUser(u); setDmText(""); setDmResult(null); }}
                        className="p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                        title={`DM ${u.name}`}
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Broadcast + Cron Panel ────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
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

        {/* Quick Stats Summary */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl overflow-hidden text-white p-6 space-y-6">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider">Bot Intelligence</h2>
            <p className="text-xs text-slate-400 mt-1">AI usage & conversion insights</p>
          </div>
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Free AI Limit</p>
              <p className="text-2xl font-black">3 prompts<span className="text-sm text-slate-400 font-normal"> / day</span></p>
              <p className="text-[11px] text-slate-400 mt-1">Free users get 3 AI questions per day before premium gate</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pricing Tiers</p>
              <div className="space-y-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-300">📱 1 Week</span>
                  <span className="text-xs font-bold text-emerald-400">KES 99</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-300">📅 1 Month</span>
                  <span className="text-xs font-bold text-emerald-400">KES 349</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-300">🏆 3 Months</span>
                  <span className="text-xs font-bold text-emerald-400">KES 999</span>
                </div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Revenue</p>
              <p className="text-3xl font-black text-emerald-400">KES {(revenue?.totalRevenue ?? 0).toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-1">Total lifetime · MRR: KES {(revenue?.mrr ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── DM Modal (Slide-over) ──────────────────────────────────────────── */}
      <AnimatePresence>
        {dmUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end"
            onClick={() => setDmUser(null)}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-600 to-green-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-sm font-black text-white">
                      {dmUser.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{dmUser.name}</p>
                      <p className="text-[11px] text-white/70">+{dmUser.phone}</p>
                    </div>
                  </div>
                  <button onClick={() => setDmUser(null)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <XCircle className="w-5 h-5 text-white/70" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <PlanBadge isPremium={dmUser.isPremium} expiresAt={dmUser.premiumExpiresAt} />
                    <SourceBadge source={dmUser.paymentSource} />
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      dmUser.churnRisk >= 70 ? "bg-rose-100 text-rose-700" :
                      dmUser.churnRisk >= 40 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      Risk: {dmUser.churnRisk}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-black text-slate-900">{dmUser.messageCount}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Messages</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-black text-slate-900">{dmUser.assetsCount}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Assets</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-black text-slate-900">{dmUser.daysSinceLastMsg === 999 ? "—" : `${dmUser.daysSinceLastMsg}d`}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Last Active</p>
                    </div>
                  </div>
                </div>

                {/* Quick Templates */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Quick Templates</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Hi! 👋 Just checking in — how's your investment journey going?",
                      "🎉 Special offer! Upgrade to Pro for just KES 99/week. Send SUBSCRIBE anytime.",
                      "📊 Have you checked today's market rates? Send RATES to see live NSE prices!",
                      "⏳ Your Pro subscription expires soon. Renew at sentill.africa/packages",
                    ].map((tpl, i) => (
                      <button
                        key={i}
                        onClick={() => setDmText(tpl)}
                        className="text-[10px] px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors text-left"
                      >
                        {tpl.slice(0, 40)}…
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer — Compose */}
              <div className="px-6 py-4 border-t border-slate-100 space-y-3">
                {dmResult && (
                  <div className={`text-xs font-bold px-3 py-2 rounded-lg text-center ${
                    dmResult.startsWith("✅") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                  }`}>
                    {dmResult}
                  </div>
                )}
                <div className="flex gap-2">
                  <textarea
                    value={dmText}
                    onChange={(e) => setDmText(e.target.value)}
                    placeholder={`Message ${dmUser.name.split(" ")[0]}...`}
                    rows={3}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>
                <button
                  onClick={sendDM}
                  disabled={dmSending || !dmText.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest py-3 rounded-xl transition-all disabled:opacity-50"
                >
                  {dmSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Send WhatsApp Message
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
