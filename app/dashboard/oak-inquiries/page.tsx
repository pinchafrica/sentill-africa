"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, TrendingUp, DollarSign, Clock, CheckCircle, Phone, Mail,
  Hash, FileText, RefreshCw, ChevronDown, Filter, Search, ArrowUpRight,
  Banknote, Building2, AlertTriangle, X
} from "lucide-react";

type OakInquiry = {
  id: string;
  name: string;
  phone: string;
  email: string;
  idNo: string;
  kraPin: string;
  fundClass: string;
  amount: number;
  sourceOfFunds: string;
  horizon: string;
  hearAbout: string;
  message: string;
  status: string;
  notes: string;
  createdAt: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  NEW:       { label: "New Lead",   color: "#3b82f6", bg: "#eff6ff",  border: "#bfdbfe" },
  CONTACTED: { label: "Contacted", color: "#f59e0b", bg: "#fffbeb",  border: "#fde68a" },
  CONVERTED: { label: "Converted", color: "#10b981", bg: "#ecfdf5",  border: "#a7f3d0" },
  DECLINED:  { label: "Declined",  color: "#ef4444", bg: "#fef2f2",  border: "#fecaca" },
};

const STATUSES = ["NEW", "CONTACTED", "CONVERTED", "DECLINED"] as const;

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.NEW;
  return (
    <span className="inline-flex items-center text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + "12" }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
    </div>
  );
}

function InquiryModal({ inquiry, onClose, onSave }: { inquiry: OakInquiry; onClose: () => void; onSave: (id: string, status: string, notes: string) => Promise<void> }) {
  const [status, setStatus] = useState(inquiry.status);
  const [notes, setNotes] = useState(inquiry.notes);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(inquiry.id, status, notes);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-8 pb-0">
          <div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{inquiry.name}</h2>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
              {new Date(inquiry.createdAt).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })} EAT
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Phone, label: "Phone", value: inquiry.phone },
              { icon: Mail, label: "Email", value: inquiry.email },
              { icon: Hash, label: "ID / Passport", value: inquiry.idNo },
              { icon: FileText, label: "KRA PIN", value: inquiry.kraPin },
            ].map(f => (
              <div key={f.label} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <f.icon className="w-3 h-3 text-slate-400" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{f.label}</span>
                </div>
                <p className="text-xs font-black text-slate-800">{f.value}</p>
              </div>
            ))}
          </div>

          {/* Investment details */}
          <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-3">
            <h3 className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Investment Details</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Amount", value: `KES ${inquiry.amount.toLocaleString()}` },
                { label: "Fund Class", value: inquiry.fundClass },
                { label: "Source of Funds", value: inquiry.sourceOfFunds },
                { label: "Horizon", value: inquiry.horizon },
                { label: "Heard About OAK", value: inquiry.hearAbout || "—" },
              ].map(d => (
                <div key={d.label}>
                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block">{d.label}</span>
                  <span className="text-xs font-black text-slate-800">{d.value}</span>
                </div>
              ))}
            </div>
            {inquiry.message && (
              <div className="pt-3 border-t border-emerald-100">
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Message</span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">{inquiry.message}</p>
              </div>
            )}
          </div>

          {/* Status update */}
          <div className="space-y-3">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Update Status</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map(s => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <button key={s} onClick={() => setStatus(s)}
                    className="px-4 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border"
                    style={status === s
                      ? { background: cfg.color, color: "#fff", borderColor: cfg.color }
                      : { background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin notes */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Admin Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Add internal notes…"
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none bg-slate-50/50" />
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #10b981, #047857)" }}>
              {saving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><CheckCircle className="w-3.5 h-3.5" /> Save Changes</>}
            </button>
            <a href={`https://wa.me/${inquiry.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
              <Phone className="w-3.5 h-3.5" /> WhatsApp
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function OakInquiriesPage() {
  const [inquiries, setInquiries] = useState<OakInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selected, setSelected] = useState<OakInquiry | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/oak/inquiry");
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries ?? []);
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const refresh = () => { setRefreshing(true); load(); };

  const handleSave = async (id: string, status: string, notes: string) => {
    await fetch("/api/oak/inquiry", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, notes }),
    });
    await load();
  };

  const filtered = inquiries.filter(i => {
    const matchStatus = statusFilter === "ALL" || i.status === statusFilter;
    const matchSearch = !search || [i.name, i.email, i.phone, i.kraPin, i.idNo].some(v => v.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const kpis = {
    total: inquiries.length,
    totalAum: inquiries.reduce((s, i) => s + i.amount, 0),
    newLeads: inquiries.filter(i => i.status === "NEW").length,
    converted: inquiries.filter(i => i.status === "CONVERTED").length,
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-950 font-black text-xs" style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}>OAK</div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">OAK Fund Leads</h1>
          </div>
          <p className="text-slate-500 font-medium text-sm">Investment enquiries from the OAK Special Fund page — manage your fund manager recruitment pipeline.</p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Total Enquiries" value={kpis.total} color="#3b82f6" />
        <KpiCard icon={DollarSign} label="New Leads" value={kpis.newLeads} color="#f59e0b" />
        <KpiCard icon={CheckCircle} label="Converted" value={kpis.converted} color="#10b981" />
        <KpiCard icon={Banknote} label="Pipeline AUM" value={`KES ${(kpis.totalAum / 1_000_000).toFixed(1)}M`} color="#8b5cf6" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-5 flex flex-wrap gap-4 items-center shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone, ID…"
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-slate-50/50" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["ALL", ...STATUSES] as const).map(s => {
            const cfg = s === "ALL" ? null : STATUS_CONFIG[s];
            const active = statusFilter === s;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="px-3.5 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border"
                style={active && cfg
                  ? { background: cfg.color, color: "#fff", borderColor: cfg.color }
                  : active && !cfg
                  ? { background: "#0f172a", color: "#fff", borderColor: "#0f172a" }
                  : cfg
                  ? { background: cfg.bg, color: cfg.color, borderColor: cfg.border }
                  : { background: "#f8fafc", color: "#64748b", borderColor: "#e2e8f0" }}>
                {s === "ALL" ? "All Leads" : cfg!.label}
                {s !== "ALL" && <span className="ml-1.5 opacity-70">{inquiries.filter(i => i.status === s).length}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 text-slate-300 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Users className="w-7 h-7 text-slate-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-slate-500 uppercase tracking-wide">No enquiries found</p>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Share the OAK page to start collecting leads</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Investor", "Fund Class", "Amount", "Horizon", "Status", "Submitted", ""].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inq, idx) => (
                  <motion.tr key={inq.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => setSelected(inq)}>
                    <td className="px-5 py-4">
                      <div className="font-black text-slate-900 group-hover:text-emerald-700 transition-colors">{inq.name}</div>
                      <div className="text-slate-400 font-medium">{inq.email}</div>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-600 whitespace-nowrap">{inq.fundClass.replace(" (Full Compounding)", "").replace(" (Quarterly Distributions)", "").replace(" (50/50 Income & Growth)", "")}</td>
                    <td className="px-5 py-4 font-black text-slate-900 whitespace-nowrap">KES {inq.amount.toLocaleString()}</td>
                    <td className="px-5 py-4 font-bold text-slate-500 whitespace-nowrap">{inq.horizon || "—"}</td>
                    <td className="px-5 py-4"><StatusBadge status={inq.status} /></td>
                    <td className="px-5 py-4 font-bold text-slate-400 whitespace-nowrap">
                      {new Date(inq.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`https://wa.me/${inq.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors">
                          <Phone className="w-3 h-3" /> WA
                        </a>
                        <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[8px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">
                          <ArrowUpRight className="w-3 h-3" /> Open
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/30">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
            {filtered.length} of {inquiries.length} enquiries · Pipeline AUM: KES {filtered.reduce((s, i) => s + i.amount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && <InquiryModal inquiry={selected} onClose={() => setSelected(null)} onSave={handleSave} />}
    </div>
  );
}
