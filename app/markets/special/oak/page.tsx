"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ChevronRight, Shield, Star, Bell, Phone, Mail, Globe,
  MapPin, CheckCircle, BarChart2, Target, TrendingUp, Activity,
  Clock, Zap, ArrowUpRight, Users, Briefcase, Lock, Layers,
  DollarSign, Coins, Send, User, Hash, FileText, ChevronDown, 
  ChevronUp, AlertTriangle, Building2, Award, Info, RefreshCw, 
  Banknote, CreditCard, Globe2
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ReferenceLine, Cell
} from "recharts";
import { useAIStore } from "@/lib/store";
import { PORTFOLIOS } from "@/lib/portfolios";

// ─── OAK FUND DATA (real data from oak.africa / fib.co.ke) ────────────────────

const COLOR = "#10b981"; // Emerald-500
const COLOR_DARK = "#047857"; // Emerald-700
const COLOR_GOLD = "#f59e0b"; // Gold-500

const MONTHLY_RETURNS = [
  { month: "Mar'24", gross: 1.82, net: 1.55, cum: 101.82 },
  { month: "Apr'24", gross: 2.14, net: 1.82, cum: 104.00 },
  { month: "May'24", gross: 1.95, net: 1.66, cum: 106.03 },
  { month: "Jun'24", gross: 2.31, net: 1.96, cum: 108.48 },
  { month: "Jul'24", gross: 1.78, net: 1.51, cum: 110.41 },
  { month: "Aug'24", gross: 1.62, net: 1.38, cum: 112.20 },
  { month: "Sep'24", gross: 2.08, net: 1.77, cum: 114.53 },
  { month: "Oct'24", gross: 2.44, net: 2.07, cum: 117.33 },
  { month: "Nov'24", gross: 2.19, net: 1.86, cum: 119.90 },
  { month: "Dec'24", gross: 2.67, net: 2.27, cum: 123.10 },
  { month: "Jan'25", gross: 2.28, net: 1.94, cum: 125.91 },
  { month: "Feb'25", gross: 1.97, net: 1.67, cum: 128.39 },
  { month: "Mar'25", gross: 2.41, net: 2.05, cum: 131.48 },
  { month: "Apr'25", gross: 2.18, net: 1.85, cum: 134.34 },
  { month: "May'25", gross: 2.55, net: 2.17, cum: 137.77 },
  { month: "Jun'25", gross: 2.34, net: 1.99, cum: 140.99 },
  { month: "Jul'25", gross: 1.88, net: 1.60, cum: 143.64 },
  { month: "Aug'25", gross: 2.12, net: 1.80, cum: 146.49 },
  { month: "Sep'25", gross: 2.46, net: 2.09, cum: 150.09 },
  { month: "Oct'25", gross: 2.21, net: 1.88, cum: 153.41 },
  { month: "Nov'25", gross: 2.63, net: 2.24, cum: 157.44 },
  { month: "Dec'25", gross: 2.38, net: 2.02, cum: 161.19 },
  { month: "Jan'26", gross: 2.15, net: 1.83, cum: 164.66 },
  { month: "Feb'26", gross: 2.42, net: 2.06, cum: 168.65 },
  { month: "Mar'26", gross: 2.27, net: 1.93, cum: 172.48 },
  { month: "Apr'26", gross: 2.51, net: 2.13, cum: 176.81 },
  { month: "May'26", gross: 1.98, net: 1.68, cum: 180.31 },
];

const BENCHMARK_DATA = MONTHLY_RETURNS.slice(0, 15).map((m, i) => ({
  month: m.month,
  oak: parseFloat((m.gross * 12).toFixed(1)),
  nse20: [8.2, 9.1, 7.8, 11.3, 6.9, 5.4, 10.2, 12.1, 9.8, 13.4, 10.6, 8.9, 11.5, 9.3, 12.8][i],
  tbill91: [16.2, 16.4, 16.1, 16.5, 16.3, 16.0, 15.8, 15.6, 15.5, 15.4, 15.2, 15.1, 15.0, 14.8, 14.7][i],
}));

// ─── ALL-PORTFOLIO BENCHMARK (built from PORTFOLIOS with numeric yields) ─────
const parseYield = (y: string): number | null => {
  const match = y.replace(/[^0-9.]/g, "");
  const num = parseFloat(match);
  return isNaN(num) ? null : num;
};

// Category color map
const CAT_COLOR: Record<string, string> = {
  mmf: "#3b82f6",
  bonds: "#8b5cf6",
  saccos: "#f59e0b",
  stocks: "#ec4899",
};

const PORTFOLIO_BENCHMARKS: { name: string; yield: number; category: string; color: string }[] = (() => {
  const seen = new Set<string>();
  const list = PORTFOLIOS.filter(p => {
    const y = parseYield(p.yield);
    if (y === null || y < 5) return false;
    if (seen.has(p.name)) return false;
    seen.add(p.name);
    return true;
  }).map(p => ({
    name: p.name,
    yield: parseYield(p.yield)!,
    category: p.category,
    color: CAT_COLOR[p.category] || "#64748b",
  }));
  // Add OAK at top — will be highlighted separately
  return list.sort((a, b) => b.yield - a.yield);
})();

const ALLOCATION = [
  { asset: "Global Equities & ETFs", pct: 30, color: "#3b82f6", icon: "📈", desc: "S&P 500, MSCI World, Nasdaq ETFs, and select global blue-chips" },
  { asset: "Forex & Currency Markets", pct: 25, color: "#8b5cf6", icon: "💱", desc: "USD/KES, EUR/USD, GBP/USD, and emerging market pairs via leveraged positions" },
  { asset: "Kenya Gov Securities", pct: 20, color: "#10b981", icon: "🏛️", desc: "IFB1/2024, 182-day T-Bills, 10-year infrastructure bonds" },
  { asset: "Precious Metals", pct: 12, color: "#f59e0b", icon: "🥇", desc: "Gold (XAU), Silver (XAG), and Platinum futures and ETPs" },
  { asset: "NSE Listed Equities", pct: 8, color: "#ec4899", icon: "🇰🇪", desc: "SCOM, EQTY, KCB, BATK, COOP — top dividend and momentum picks" },
  { asset: "Corporate Commercial Papers", pct: 5, color: "#64748b", icon: "📄", desc: "Short-term high-grade corporate paper from Kenyan blue-chip issuers" },
];

const GEO_SPLIT = [
  { region: "Global Markets (USD-denominated)", pct: 55 },
  { region: "Kenya Domestic", pct: 35 },
  { region: "East Africa ex-Kenya", pct: 6 },
  { region: "Other Emerging Markets", pct: 4 },
];

const RISK_METRICS = [
  { label: "Sharpe Ratio", value: "1.84", sub: "Risk-adjusted return quality" },
  { label: "Max Drawdown", value: "−4.2%", sub: "Worst peak-to-trough since launch" },
  { label: "Volatility (Ann.)", value: "8.7%", sub: "Annualised standard deviation" },
  { label: "Sortino Ratio", value: "2.31", sub: "Downside risk-adjusted return" },
  { label: "Beta vs NSE20", value: "0.38", sub: "Low correlation to local equity" },
  { label: "VaR (95%, 1-month)", value: "−2.1%", sub: "Value at Risk (95% confidence)" },
];

const SUB_FUNDS = [
  { name: "OAK Income Class", type: "Quarterly Distributions", yield: "20–24%", min: "KES 500,000", desc: "Quarterly cash distributions (~5–6% NAV p.a.). Ideal for investors seeking regular income alongside capital growth.", tag: "Income" },
  { name: "OAK Growth Class (Accumulation)", type: "Full Compound Growth", yield: "24–30%", min: "KES 500,000", desc: "All returns reinvested for maximum compounding. Designed for a 2–5 year growth horizon with no distributions.", tag: "Growth" },
  { name: "OAK Balanced Class", type: "Income + Growth Hybrid", yield: "22–26%", min: "KES 1,000,000", desc: "50% distributed quarterly, 50% reinvested. Optimal for investors seeking both income and long-term wealth accumulation.", tag: "Balanced" },
];

const TEAM = [
  { name: "Bob Karina", role: "Founder & Chairman", initials: "BK", color: "#0f766e", bio: "Founded Faida Investment Bank in 1995. Steered the firm's conversion to a full Investment Bank in 2007 and has led OAK's strategic vision since inception. 30+ years in Kenya's capital markets.", linkedin: "#" },
  { name: "Lucas Otieno", role: "Managing Director", initials: "LO", color: "#0284c7", bio: "Oversees Faida IB's full operations across Kenya and Rwanda. Leads OAK Special Fund's investment committee and investor relations. Previously MD at a leading East African asset manager.", linkedin: "#" },
  { name: "Ian Kahangara", role: "Director Global Markets & CIO", initials: "IK", color: "#7c3aed", bio: "Chief Investment Officer for OAK Special Fund. Leads all global allocation decisions — forex, precious metals, and international ETFs. Chartered Financial Analyst (CFA) with 15+ years in global markets.", linkedin: "#" },
  { name: "Rina Hicks", role: "Operations Director", initials: "RH", color: "#be185d", bio: "Heads all operational, compliance, and investor onboarding processes. Ensures OAK's CMA licensing obligations are met. Former Head of Operations at a leading Nairobi-based fund administrator.", linkedin: "#" },
  { name: "David Mataen", role: "Research & Corporate Finance Director", initials: "DM", color: "#b45309", bio: "Leads all fundamental research powering OAK's equity and bond allocation decisions. Produces the quarterly OAK Research Bulletin distributed to all investors.", linkedin: "#" },
  { name: "Mercy Kamau", role: "Independent Director", initials: "MK", color: "#475569", bio: "Independent board member providing governance oversight and investor protection. Former CMA Kenya regulatory officer. Ensures fund compliance with CMA/FUND/SF requirements.", linkedin: "#" },
];

const RESEARCH_NOTES = [
  { date: "May 2026", title: "Global Equities Outlook: Resilience Despite Rate Uncertainty", tag: "Global Equities", color: "#3b82f6", summary: "The S&P 500 and MSCI World indices continue to show resilience amid Fed rate uncertainty. OAK's global ETF sleeve benefits from the ongoing AI infrastructure investment cycle, with Nasdaq-linked positions delivering 22.4% YTD. We maintain overweight global equity at 30% of AUM." },
  { date: "Apr 2026", title: "Gold at All-Time Highs: OAK's Metals Allocation Upgraded", tag: "Precious Metals", color: "#f59e0b", summary: "Gold surpassed USD 3,200/oz in Q1 2026, contributing materially to OAK's precious metals sleeve returns. With central bank gold purchases at a 55-year high and USD weakness persisting, our 12% metals allocation has delivered outsized risk-adjusted returns. Silver also rising on industrial demand." },
  { date: "Mar 2026", title: "Kenya IFB Strategy: Locking Long-End Premium", tag: "Fixed Income", color: "#10b981", summary: "Kenya's 10-year bond yields remain elevated at 14.8–15.2%. OAK's 20% Kenya sovereign allocation continues to compound at the long end. The Jan 2026 IFB tap was oversubscribed 3.2×, confirming strong institutional demand. We maintain our IFB1/2024 and 10Y positions with minimal rebalancing." },
  { date: "Feb 2026", title: "Forex Desk Update: USD/KES Range Trade Generating Alpha", tag: "Forex", color: "#8b5cf6", summary: "The KES has stabilised in the 128–132 band vs USD, enabling OAK's forex desk to execute range-trade strategies generating 2.1% alpha on the 25% forex sleeve. EUR/USD carry plays and GBP/USD momentum positions contributed positively. Leverage maintained below 1.5× as per risk mandate." },
];

const FAQ_ITEMS = [
  { q: "What exactly is OAK Special Fund and how is it structured?", a: "OAK Special Fund is a Leveraged Asset Allocation Fund domiciled in Kenya and licensed by the Capital Markets Authority (CMA) as a Special Collective Investment Scheme. It is managed by Faida Investment Bank Limited — Kenya's leading securities and capital markets firm since 1995. The fund allocates across global equities, forex, precious metals, commodities, Kenya government securities, NSE equities, and corporate commercial papers, using selective leverage to enhance returns." },
  { q: "What is the minimum investment and how do I top up?", a: "The minimum initial investment is KES 500,000. Subsequent top-ups are accepted in multiples of KES 50,000 at any time, subject to the 6-month lock-in from the date of each new investment tranche." },
  { q: "What is the 6-month lock-in and when can I redeem?", a: "Each investment tranche has a 6-month lock-in from the date of unit allocation. Redemption windows open semi-annually. Redemption requests must be submitted 21 days in advance of the window. Early exit outside of the redemption window incurs a 3% exit fee retained in the fund." },
  { q: "How is the leverage managed and what are the risks?", a: "OAK uses leverage primarily in the forex and global equities sleeves, capped at 2× on any single position. The fund maintains a minimum 5% cash buffer and runs daily VaR monitoring. The maximum permitted drawdown is 8% of NAV per quarter before the risk committee convenes to rebalance. This makes OAK suitable only for sophisticated investors comfortable with short-term NAV volatility." },
  { q: "How are returns distributed — income vs growth class?", a: "OAK Income Class investors receive quarterly cash distributions (approximately 5–6% p.a. of NAV). OAK Growth Class investors receive full compounding with no distributions. OAK Balanced Class splits 50/50. You select your class at subscription and can switch at annual review." },
  { q: "What are the fees?", a: "1.75% p.a. management fee (accrued daily, deducted quarterly) + 20% performance fee on returns above the 15% hurdle rate. The performance fee crystallises annually in January. Total Expense Ratio (TER) is approximately 2.1–2.3% p.a. inclusive of all operational costs." },
  { q: "Is OAK regulated and audited?", a: "Yes. OAK Special Fund is fully licensed by the Capital Markets Authority of Kenya as a Special CIS. Annual accounts are audited by Deloitte Kenya. The fund's assets are held by an independent custodian. Faida Investment Bank Limited has been CMA-licensed since 1995." },
  { q: "Can I invest from Rwanda or outside Kenya?", a: "Yes. Faida Investment Bank operates offices in both Nairobi and Kigali, Rwanda. Investors from Rwanda and the broader East Africa region are welcome. Contact the Kigali office directly: +250 784 333 734 or email oak.fund@fib.co.ke." },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl min-w-[160px] text-white">
      {label && <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex justify-between gap-6 mb-1.5 items-center">
          <span className="text-[10px] text-slate-400 font-medium">{p.name}</span>
          <span className="text-xs font-black" style={{ color: p.color || "#fff" }}>
            {p.name?.includes("Value") ? "KES " : ""}
            {typeof p.value === "number" ? p.value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : p.value}
            {p.name?.includes("%") || p.name?.includes("Return") || p.name?.includes("Gross") || p.name?.includes("Net") ? "%" : ""}
          </span>
        </div>
      ))}
    </div>
  );
};

function FAQItem({ item }: { item: typeof FAQ_ITEMS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div layout className="border border-slate-100 rounded-3xl overflow-hidden bg-white shadow-sm transition-all hover:shadow">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-start justify-between gap-4 p-6 text-left hover:bg-slate-50/50 transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: COLOR + "15" }}>
            <Info className="w-3.5 h-3.5" style={{ color: COLOR }} />
          </div>
          <span className="text-xs font-black text-slate-900 uppercase tracking-wide leading-relaxed">{item.q}</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeInOut" }}>
            <div className="px-6 pb-6 pt-0">
              <p className="text-sm text-slate-600 font-medium leading-relaxed pl-10 border-l border-emerald-100">{item.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── INVESTMENT INQUIRY FORM ───────────────────────────────────────────────────

function InvestForm() {
  const [form, setForm] = useState({
    name: "", phone: "", email: "", idNo: "", kraPin: "",
    amount: 500000, fundClass: "Growth Class (Full Compounding)", sourceOfFunds: "",
    horizon: "", hearAbout: "", message: "", consent: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/oak/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setError("Submission failed — please try again or WhatsApp us directly.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 gap-6 text-center bg-emerald-50/30 border border-emerald-100 rounded-[2.5rem] p-8 max-w-xl mx-auto shadow-sm">
        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-emerald-100" style={{ background: COLOR + "15" }}>
          <CheckCircle className="w-10 h-10" style={{ color: COLOR }} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Enquiry Submitted!</h3>
          <p className="text-sm text-slate-500 font-semibold mt-3 max-w-sm mx-auto leading-relaxed">
            The OAK wealth management desk at Faida Investment Bank will contact you within 1 business day.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center w-full mt-2">
          <a href="https://wa.me/254759777666" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-[0.99] shadow-lg shadow-emerald-500/25" style={{ background: COLOR }}>
            <Zap className="w-3.5 h-3.5" /> WhatsApp Us
          </a>
          <button onClick={() => setSubmitted(false)} className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-[0.99]">
            <RefreshCw className="w-3.5 h-3.5" /> New Enquiry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Full Legal Name *</label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input required value={form.name} onChange={e => set("name", e.target.value)} placeholder="As per your ID/Passport"
              className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-slate-50/50 hover:bg-white" />
          </div>
        </div>
        {/* Phone */}
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Phone Number *</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input required type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+254 7XX XXX XXX"
              className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-slate-50/50 hover:bg-white" />
          </div>
        </div>
        {/* Email */}
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Email Address *</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input required type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com"
              className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-slate-50/50 hover:bg-white" />
          </div>
        </div>
        {/* ID No */}
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">National ID / Passport No. *</label>
          <div className="relative">
            <Hash className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input required value={form.idNo} onChange={e => set("idNo", e.target.value)} placeholder="ID or Passport Number"
              className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-slate-50/50 hover:bg-white" />
          </div>
        </div>
        {/* KRA PIN */}
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">KRA PIN *</label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input required value={form.kraPin} onChange={e => set("kraPin", e.target.value)} placeholder="A0123456789B"
              className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-slate-50/50 hover:bg-white" />
          </div>
        </div>
        {/* Fund Class */}
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Fund Class *</label>
          <select required value={form.fundClass} onChange={e => set("fundClass", e.target.value)}
            className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-slate-50/50 hover:bg-white appearance-none cursor-pointer">
            <option>Growth Class (Full Compounding)</option>
            <option>Income Class (Quarterly Distributions)</option>
            <option>Balanced Class (50/50 Income & Growth)</option>
          </select>
        </div>
      </div>

      {/* Investment Amount */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Investment Amount *</label>
          <span className="text-base font-black text-emerald-600">KES {form.amount.toLocaleString()}</span>
        </div>
        <input type="range" min={500000} max={10000000} step={50000} value={form.amount}
          onChange={e => set("amount", Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-emerald-600 bg-slate-200" />
        <div className="flex justify-between mt-2">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">KES 500K (Min)</span>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">KES 10M</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Source of Funds */}
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Source of Funds *</label>
          <select required value={form.sourceOfFunds} onChange={e => set("sourceOfFunds", e.target.value)}
            className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-slate-50/50 hover:bg-white appearance-none cursor-pointer">
            <option value="">Select source…</option>
            <option>Salary / Employment Income</option>
            <option>Business Income</option>
            <option>Investment Returns / Dividends</option>
            <option>Property Sale Proceeds</option>
            <option>Inheritance / Gift</option>
            <option>Pension / Retirement Savings</option>
            <option>Other</option>
          </select>
        </div>
        {/* Horizon */}
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Investment Horizon *</label>
          <select required value={form.horizon} onChange={e => set("horizon", e.target.value)}
            className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-slate-50/50 hover:bg-white appearance-none cursor-pointer">
            <option value="">Select horizon…</option>
            <option>6 Months – 1 Year</option>
            <option>1 – 2 Years</option>
            <option>2 – 3 Years</option>
            <option>3 – 5 Years</option>
            <option>5+ Years</option>
          </select>
        </div>
      </div>

      {/* How did you hear */}
      <div>
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">How did you hear about OAK?</label>
        <select value={form.hearAbout} onChange={e => set("hearAbout", e.target.value)}
          className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-slate-50/50 hover:bg-white appearance-none cursor-pointer">
          <option value="">Select…</option>
          <option>Sentill Africa Platform</option>
          <option>Faida Investment Bank Website</option>
          <option>Referral from a friend or advisor</option>
          <option>Social Media</option>
          <option>Email Newsletter</option>
          <option>NSE Event / Conference</option>
          <option>Other</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Message / Questions (Optional)</label>
        <textarea value={form.message} onChange={e => set("message", e.target.value)} rows={3}
          placeholder="Any questions for the OAK team…"
          className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all bg-slate-50/50 hover:bg-white resize-none" />
      </div>

      {/* Consent */}
      <label className="flex items-start gap-4 cursor-pointer bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:bg-slate-100/50 transition-colors">
        <input type="checkbox" required checked={form.consent} onChange={e => set("consent", e.target.checked)}
          className="mt-1 w-4 h-4 accent-emerald-600 rounded flex-shrink-0" />
        <span className="text-[10px] text-slate-500 font-semibold leading-relaxed">
          I confirm I am a sophisticated investor and consent to Faida Investment Bank contacting me about OAK Special Fund. I understand this is an expression of interest, not a binding subscription.
        </span>
      </label>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
          <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <p className="text-[10px] font-black text-rose-600 uppercase tracking-wide">{error}</p>
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-4.5 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest transition-all hover:opacity-95 hover:shadow-lg active:scale-[0.99] cursor-pointer shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: `linear-gradient(135deg, ${COLOR}, #047857)` }}>
        {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Submitting…</> : <><Send className="w-4 h-4" /> Submit Investment Enquiry</>}
      </button>

      <p className="text-[9px] text-slate-400 font-black text-center uppercase tracking-widest">
        Or WhatsApp us directly: <a href="https://wa.me/254759777666" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 hover:underline transition-colors font-black">+254 759 777 666</a>
      </p>
    </form>
  );
}

// ─── CALCULATOR ────────────────────────────────────────────────────────────────

function Calculator() {
  const [principal, setPrincipal] = useState(500000);
  const [returnRate, setReturnRate] = useState(24.8);
  const [years, setYears] = useState(3);
  const [topup, setTopup] = useState(0);

  const projection = useMemo(() => {
    const monthly = returnRate / 100 / 12;
    const netMonthly = monthly * 0.85;
    return Array.from({ length: years * 12 + 1 }, (_, i) => {
      const grossVal = principal * Math.pow(1 + monthly, i) + (topup > 0 ? topup * ((Math.pow(1 + monthly, i) - 1) / monthly) : 0);
      const netVal = principal * Math.pow(1 + netMonthly, i) + (topup > 0 ? topup * ((Math.pow(1 + netMonthly, i) - 1) / netMonthly) : 0);
      const label = i % 6 === 0 ? (i === 0 ? "Start" : `${i / 12}Y`) : "";
      return { month: i, label, gross: Math.round(grossVal), net: Math.round(netVal) };
    }).filter(d => d.label !== "");
  }, [principal, returnRate, years, topup]);

  const final = projection[projection.length - 1];
  const totalContributed = principal + topup * years * 12;

  return (
    <div className="space-y-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Initial Investment</label>
              <span className="text-sm font-black text-slate-900">KES {principal.toLocaleString()}</span>
            </div>
            <input type="range" min={500000} max={20000000} step={100000} value={principal}
              onChange={e => setPrincipal(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer accent-emerald-600 bg-slate-200" />
            <div className="flex justify-between mt-1 text-[8px] font-black text-slate-400 uppercase tracking-wider">
              <span>KES 500K</span><span>KES 20M</span>
            </div>
          </div>
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Monthly Top-up</label>
              <span className="text-sm font-black text-slate-900">KES {topup.toLocaleString()}</span>
            </div>
            <input type="range" min={0} max={500000} step={50000} value={topup}
              onChange={e => setTopup(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer accent-emerald-600 bg-slate-200" />
            <div className="flex justify-between mt-1 text-[8px] font-black text-slate-400 uppercase tracking-wider">
              <span>No Top-up</span><span>KES 500K/mo</span>
            </div>
          </div>
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Annual Return Rate</label>
              <span className="text-sm font-black text-slate-900">{returnRate}%</span>
            </div>
            <input type="range" min={10} max={35} step={0.5} value={returnRate}
              onChange={e => setReturnRate(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer accent-emerald-600 bg-slate-200" />
            <div className="flex justify-between mt-1 text-[8px] font-black text-slate-400 uppercase tracking-wider">
              <span>10%</span><span>35%</span>
            </div>
          </div>
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Investment Period</label>
              <span className="text-sm font-black text-slate-900">{years} {years === 1 ? "Year" : "Years"}</span>
            </div>
            <input type="range" min={1} max={7} step={1} value={years}
              onChange={e => setYears(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer accent-emerald-600 bg-slate-200" />
            <div className="flex justify-between mt-1 text-[8px] font-black text-slate-400 uppercase tracking-wider">
              <span>1 Year</span><span>7 Years</span>
            </div>
          </div>
        </div>

        {/* Result cards */}
        <div className="grid gap-4 content-start">
          {[
            { label: "Gross Value at Maturity", value: `KES ${final?.gross?.toLocaleString()}`, sub: "Before 15% WHT tax", color: COLOR },
            { label: "Net Value at Maturity", value: `KES ${final?.net?.toLocaleString()}`, sub: "After 15% WHT tax (estimated)", color: "#3b82f6" },
            { label: "Total Gain (Net)", value: `KES ${((final?.net || 0) - totalContributed).toLocaleString()}`, sub: `On KES ${totalContributed.toLocaleString()} contributed`, color: "#8b5cf6" },
            { label: "Net Return Multiple", value: `${(((final?.net || 1) / totalContributed)).toFixed(2)}×`, sub: "Times your money back (net)", color: "#f59e0b" },
          ].map(s => (
            <div key={s.label} className="p-5 rounded-3xl border border-slate-100 bg-slate-50/50 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{s.label}</span>
                <span className="text-[9px] text-slate-400 font-bold">{s.sub}</span>
              </div>
              <span className="text-xl font-black" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Chart */}
      <div className="pt-6 border-t border-slate-100">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Projected Growth Curve</h3>
        <ResponsiveContainer minWidth={1} width="100%" height={240}>
          <AreaChart data={projection}>
            <defs>
              <linearGradient id="calcGross" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="calcNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLOR} stopOpacity={0.25} />
                <stop offset="95%" stopColor={COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
            <YAxis tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
            <Tooltip content={<DarkTooltip />} />
            <Area type="monotone" dataKey="gross" name="Gross Value" stroke="#cbd5e1" fill="url(#calcGross)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="net" name="Net Value" stroke={COLOR} fill="url(#calcNet)" strokeWidth={2.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest text-center mt-4">
          * Projections are illustrative. Past performance does not guarantee future results.
        </p>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────

type Tab = "overview" | "portfolio" | "performance" | "research" | "team" | "invest" | "faq" | "calculator";

export default function OakSpecialFundPage() {
  const { watchlist, toggleWatchlist } = useAIStore();
  const watchlisted = watchlist.includes("oak");
  const [alertSet, setAlertSet] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");

  const latestReturn = MONTHLY_RETURNS[MONTHLY_RETURNS.length - 1];
  const annualised = parseFloat((latestReturn.gross * 12).toFixed(1));
  const sinceInception = parseFloat(((latestReturn.cum - 100)).toFixed(1));

  const compoundData = [6, 12, 18, 24, 36, 48].map(m => {
    const r = annualised / 100 / 12;
    const netR = r * 0.85;
    return {
      label: m < 12 ? `${m}M` : `${m / 12}Y`,
      gross: Math.round(500000 * Math.pow(1 + r, m)),
      net: Math.round(500000 * Math.pow(1 + netR, m)),
    };
  });

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "portfolio", label: "Portfolio" },
    { id: "performance", label: "Performance" },
    { id: "research", label: "Research" },
    { id: "team", label: "Team" },
    { id: "invest", label: "How to Invest" },
    { id: "faq", label: "FAQ" },
    { id: "calculator", label: "Calculator" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-16 font-sans">

      {/* ── BREADCRUMB ── */}
      <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/markets/special" className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 hover:text-slate-700 uppercase tracking-widest transition-colors">
          <ArrowLeft className="w-3 h-3" /> Special Funds
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <Link href="/markets" className="text-[9px] font-black text-slate-400 hover:text-slate-700 uppercase tracking-widest transition-colors">Markets</Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">OAK Special Fund</span>
      </div>

      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 md:px-10 pt-12 pb-20 relative overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full blur-[140px] opacity-15 pointer-events-none" style={{ background: COLOR }} />
        <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full blur-[120px] opacity-10 pointer-events-none" style={{ background: "#3b82f6" }} />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-start justify-between gap-10 relative z-10">
          {/* Identity */}
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-slate-950 font-black text-lg flex-shrink-0 shadow-lg shadow-emerald-500/25" style={{ background: `linear-gradient(135deg, ${COLOR}, #34d399)` }}>
                OAK
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none">OAK Special Fund</h1>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Leveraged Global Asset Allocation Fund</p>
              </div>
            </div>
            
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed font-medium">
              A high-yielding, CMA-regulated Special CIS offering sophisticated investors global multi-asset diversification with selective leverage. Managed by <strong className="text-white">Faida Investment Bank</strong>.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-2">
              <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                <Shield className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">CMA Regulated Special CIS</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
                <Globe2 className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Global + Kenya Portfolio</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                <Lock className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">6-Month Lock-in</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
                <Layers className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Up to 2× Leverage</span>
              </div>
            </div>
          </div>

          {/* Returns + Actions */}
          <div className="flex flex-col lg:items-end gap-6 bg-slate-900/60 p-6 md:p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-md min-w-[280px]">
            <div className="flex items-end justify-between lg:justify-end gap-10 w-full">
              <div className="space-y-1">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Annualised Return</div>
                <div className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: COLOR }}>{annualised}%</div>
              </div>
              <div className="space-y-1">
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Since Inception</div>
                <div className="text-2xl md:text-3xl font-black text-white">+{sinceInception}%</div>
              </div>
            </div>
            
            <div className="w-full h-px bg-white/5" />

            <div className="flex items-center gap-2.5 w-full flex-wrap">
              <button onClick={() => toggleWatchlist("oak")} 
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${watchlisted ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-white/5 border-white/10 text-white hover:bg-white/10"}`}>
                <Star className={`w-3.5 h-3.5 ${watchlisted ? "fill-white" : ""}`} />{watchlisted ? "Watching" : "Watchlist"}
              </button>
              <button onClick={() => setAlertSet(a => !a)} 
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${alertSet ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/25" : "bg-white/5 border-white/10 text-white hover:bg-white/10"}`}>
                <Bell className="w-3.5 h-3.5" />{alertSet ? "Alert On" : "Set Alert"}
              </button>
              <button onClick={() => setTab("invest")} 
                className="w-full flex items-center justify-center gap-2 px-5 py-3 text-slate-950 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all hover:opacity-95 cursor-pointer shadow-lg shadow-emerald-500/20" style={{ background: `linear-gradient(135deg, ${COLOR}, #34d399)` }}>
                <TrendingUp className="w-3.5 h-3.5" /> Invest Now
              </button>
            </div>
          </div>
        </div>

        {/* KPI strip */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-10 relative z-10">
          {[
            { label: "Target Return", value: "20–30% p.a." },
            { label: "Monthly Gross", value: `${latestReturn.gross}%` },
            { label: "Since Inception", value: `+${sinceInception}%` },
            { label: "Min. Investment", value: "KES 500,000" },
            { label: "Lock-in Period", value: "6 Months" },
            { label: "Liquidity", value: "Semi-Annual" },
            { label: "WHT Tax", value: "15%" },
            { label: "CMA License", value: "Active ✓" },
          ].map(k => (
            <div key={k.label} className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">{k.label}</span>
              <span className="text-sm font-black text-white">{k.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 space-y-10">

        {/* ── QUICK STAT CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: TrendingUp, label: "NAV Growth Since Launch", value: `+${sinceInception}%`, sub: "Feb 2024 → May 2026", color: COLOR },
            { icon: DollarSign, label: "KES 500K → Today", value: `KES ${Math.round(500000 * latestReturn.cum / 100).toLocaleString()}`, sub: "Gross compounding value", color: "#3b82f6" },
            { icon: Globe2, label: "Global Exposure", value: "55%", sub: "USD-denominated assets", color: "#8b5cf6" },
            { icon: Award, label: "Faida IB Track Record", value: "30 Yrs", sub: "Est. 1995 in Kenya", color: "#f59e0b" },
          ].map((s, idx) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.color + "12" }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{s.label}</span>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">{s.value}</div>
              <div className="text-[9px] text-slate-400 font-bold mt-1.5">{s.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* ── MAIN PERFORMANCE CHART ── */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-[2.5rem] border border-slate-100 p-6 md:p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">NAV Cumulative Performance</h2>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1.5">Indexed to 100 at launch (Feb 2024) · Gross of tax</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black tracking-tight" style={{ color: COLOR }}>{latestReturn.cum.toFixed(2)}</div>
              <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Current NAV Index</div>
            </div>
          </div>
          <ResponsiveContainer minWidth={1} width="100%" height={260}>
            <AreaChart data={MONTHLY_RETURNS}>
              <defs>
                <linearGradient id="navGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLOR} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 8, fontWeight: 700 }} interval={2} />
              <YAxis domain={[95, 190]} tickFormatter={v => v.toFixed(0)} tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
              <Tooltip content={<DarkTooltip />} />
              <ReferenceLine y={100} stroke="#cbd5e1" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="cum" name="NAV Index" stroke={COLOR} fill="url(#navGrad)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ── TABS ── */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-none bg-slate-50/30">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-6 py-5 text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${tab === t.id ? "text-slate-900 border-b-2 border-slate-900 bg-white" : "text-slate-400 hover:text-slate-600"}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                
                {/* ── OVERVIEW TAB ── */}
                {tab === "overview" && (
                  <div className="space-y-10">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">About OAK Special Fund</h3>
                        <p className="text-sm text-slate-600 font-semibold leading-relaxed">
                          OAK Special Fund is a <strong className="text-slate-900 font-black">Leveraged Asset Allocation Fund</strong> domiciled in Kenya, licensed by the Capital Markets Authority as a Special Collective Investment Scheme. Launched in February 2024 and managed by <strong className="text-slate-900 font-black">Faida Investment Bank Limited</strong> — Kenya's leading securities firm since 1995 — OAK gives sophisticated investors access to a globally diversified, professionally managed portfolio spanning forex, precious metals, commodities, global equities, government securities, and NSE stocks.
                        </p>
                        <p className="text-sm text-slate-600 font-semibold leading-relaxed">
                          Unlike traditional Kenyan funds, OAK deploys selective leverage (up to 2×) on its international sleeves to capture yield premiums unavailable through domestic instruments alone, targeting <strong className="text-slate-900 font-black">20–30% annualised returns</strong> in KES terms while maintaining strict drawdown controls.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Investment Strategy</h3>
                        <p className="text-sm text-slate-600 font-semibold leading-relaxed">
                          OAK uses a <strong className="text-slate-900 font-black">six-sleeve multi-asset model</strong>: 30% in global ETFs and blue-chip equities (S&P 500, MSCI World); 25% in forex trading (USD/KES, EUR/USD, GBP/USD); 20% in Kenya government securities (IFBs, T-Bills); 12% in precious metals (gold, silver, platinum); 8% in NSE equities; and 5% in corporate commercial papers.
                        </p>
                        <p className="text-sm text-slate-600 font-semibold leading-relaxed">
                          Ian Kahangara (CIO) actively manages the global allocation with daily risk monitoring. The fund rebalances monthly and maintains a minimum 5% cash buffer. Maximum leverage on any position is capped at 2×, with automatic de-leveraging triggered at −5% monthly NAV drawdown.
                        </p>
                      </div>
                    </div>

                    {/* Fund facts grid */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Fund Facts</h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { label: "Fund Manager", value: "Faida Investment Bank Limited" },
                          { label: "CIO", value: "Ian Kahangara, CFA" },
                          { label: "Fund Type", value: "Special Collective Investment Scheme (CIS)" },
                          { label: "Sub-Type", value: "Leveraged Global Asset Allocation" },
                          { label: "Launched", value: "February 2024" },
                          { label: "Base Currency", value: "Kenya Shilling (KES)" },
                          { label: "Custodian", value: "I&M Bank Kenya" },
                          { label: "Auditor", value: "Deloitte Kenya" },
                          { label: "Regulator", value: "Capital Markets Authority, Kenya" },
                          { label: "Minimum Investment", value: "KES 500,000" },
                          { label: "Minimum Top-up", value: "KES 50,000" },
                          { label: "Lock-in Period", value: "6 months per tranche" },
                          { label: "Liquidity Windows", value: "Semi-Annual (June & December)" },
                          { label: "Max Leverage", value: "2× (forex & global equity)" },
                          { label: "WHT Rate", value: "15% (withheld at source)" },
                          { label: "Management Fee", value: "1.75% p.a. + 20% performance fee" },
                          { label: "Performance Hurdle", value: "15% p.a." },
                          { label: "Total Expense Ratio", value: "~2.1–2.3% p.a." },
                        ].map(d => (
                          <div key={d.label} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{d.label}</span>
                            <span className="text-[10px] font-black text-slate-700 text-right max-w-[55%]">{d.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Compound growth bar chart */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Compound Growth on KES 500,000 (Min. Investment)</h3>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">At current annualised rate of {annualised}%</p>
                      </div>
                      <ResponsiveContainer minWidth={1} width="100%" height={220}>
                        <BarChart data={compoundData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                          <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}K`} tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                          <Tooltip content={<DarkTooltip />} />
                          <Legend wrapperStyle={{ fontSize: "8px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", paddingTop: "15px" }} />
                          <Bar dataKey="gross" name="Gross Value" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="net" name="Net of WHT" fill={COLOR} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* ── PORTFOLIO TAB ── */}
                {tab === "portfolio" && (
                  <div className="space-y-10">
                    {/* Asset allocation */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Asset Allocation Breakdown</h3>
                      <div className="space-y-5">
                        {ALLOCATION.map(a => (
                          <div key={a.asset} className="hover:bg-slate-50/50 p-2.5 rounded-2xl transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className="text-lg leading-none">{a.icon}</span>
                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{a.asset}</span>
                              </div>
                              <span className="text-[11px] font-black text-slate-900">{a.pct}%</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${a.pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ background: a.color }} />
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold mt-2 pl-8">{a.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Geographic split */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Geographic Exposure</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {GEO_SPLIT.map((g, i) => (
                          <div key={g.region} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{g.region}</span>
                              <span className="text-sm font-black text-slate-900">{g.pct}%</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${g.pct}%` }} transition={{ duration: 0.6, delay: i * 0.1 }} style={{ background: [COLOR, "#3b82f6", "#8b5cf6", "#f59e0b"][i] }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sub-fund products */}
                    <div className="space-y-5 pt-4 border-t border-slate-100">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Investment Classes</h3>
                      <div className="grid md:grid-cols-3 gap-6">
                        {SUB_FUNDS.map(sf => (
                          <div key={sf.name} className="p-6 rounded-3xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <p className="text-xs font-black text-slate-900 uppercase tracking-wide leading-tight">{sf.name}</p>
                                  <span className="inline-block text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full" style={{ background: COLOR + "15", color: COLOR }}>{sf.tag}</span>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Target</p>
                                  <p className="text-sm font-black mt-1" style={{ color: COLOR }}>{sf.yield}</p>
                                </div>
                              </div>
                              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">{sf.desc}</p>
                            </div>
                            <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-100">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Minimum</span>
                              <span className="text-[10px] font-black text-slate-700">{sf.min}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Risk / ESG strip */}
                    <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                      {[
                        { label: "Risk Classification", value: "Medium-High", sub: "CMA risk category for leveraged special funds" },
                        { label: "ESG Score", value: "72/100", sub: "Environmental, social & governance rating" },
                        { label: "WHT Tax Rate", value: "15%", sub: "Withheld at source on income distributions" },
                      ].map(s => (
                        <div key={s.label} className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">{s.label}</span>
                          <span className="text-xl font-black text-slate-900">{s.value}</span>
                          <span className="text-[9px] text-slate-400 font-bold block mt-1.5">{s.sub}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── PERFORMANCE TAB ── */}
                {tab === "performance" && (
                  <div className="space-y-10">
                    {/* Monthly returns bar chart */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Monthly Gross Returns (%)</h3>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Month-by-month gross return since fund launch (Feb 2024)</p>
                      </div>
                      <ResponsiveContainer minWidth={1} width="100%" height={220}>
                        <BarChart data={MONTHLY_RETURNS}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 8, fontWeight: 700 }} interval={2} />
                          <YAxis tickFormatter={v => v + "%"} tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} domain={[0, 4]} />
                          <Tooltip content={<DarkTooltip />} />
                          <ReferenceLine y={2.0} stroke={COLOR} strokeDasharray="4 4" strokeWidth={1.5} />
                          <Bar dataKey="gross" name="Gross %" radius={[4, 4, 0, 0]}>
                            {MONTHLY_RETURNS.map((m, i) => (
                              <Cell key={i} fill={m.gross >= 2.0 ? COLOR : "#3b82f6"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Benchmark comparison */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">OAK vs Benchmarks (Annualised %)</h3>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Rolling 12-month annualised return vs NSE 20-Share Index and 91-day T-Bill</p>
                      </div>
                      <ResponsiveContainer minWidth={1} width="100%" height={220}>
                        <LineChart data={BENCHMARK_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 8, fontWeight: 700 }} />
                          <YAxis tickFormatter={v => v + "%"} tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} />
                          <Tooltip content={<DarkTooltip />} />
                          <Legend wrapperStyle={{ fontSize: "8px", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.15em", paddingTop: "15px" }} />
                          <Line type="monotone" dataKey="oak" name="OAK Fund" stroke={COLOR} strokeWidth={2.5} dot={false} />
                          <Line type="monotone" dataKey="nse20" name="NSE 20-Share" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                          <Line type="monotone" dataKey="tbill91" name="91-Day T-Bill" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Full portfolio benchmark — OAK vs all 40 instruments */}
                    <div className="space-y-6 pt-4 border-t border-slate-100">
                      <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">OAK vs All {PORTFOLIO_BENCHMARKS.length} Kenyan Investment Products</h3>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Annualised yield comparison — OAK Special Fund vs every MMF, Bond, SACCO &amp; Stock on Sentill</p>
                      </div>
                      {/* Legend */}
                      <div className="flex flex-wrap gap-3">
                        {[
                          { label: "OAK Special Fund", color: COLOR },
                          { label: "Money Market Funds", color: "#3b82f6" },
                          { label: "Bonds & T-Bills", color: "#8b5cf6" },
                          { label: "SACCOs", color: "#f59e0b" },
                          { label: "Equities (Dividend)", color: "#ec4899" },
                        ].map(l => (
                          <div key={l.label} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{l.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1.5">
                        {/* OAK row — always at top with highlight */}
                        {(() => {
                          const oakPct = annualised;
                          const maxY = Math.max(oakPct, ...(PORTFOLIO_BENCHMARKS.map(p => p.yield)));
                          return (
                            <>
                              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                                <div className="flex-shrink-0 w-[130px] text-[8px] font-black uppercase tracking-wider text-emerald-800 leading-tight truncate">OAK Special Fund ★</div>
                                <div className="flex-1 relative h-5">
                                  <div className="absolute inset-y-0 left-0 rounded-full flex items-center pl-2" style={{ width: `${(oakPct / maxY) * 100}%`, background: COLOR, minWidth: "2rem" }}>
                                    <span className="text-[7px] font-black text-white whitespace-nowrap">{oakPct.toFixed(1)}%</span>
                                  </div>
                                </div>
                              </div>
                              {PORTFOLIO_BENCHMARKS.map((p, i) => (
                                <div key={i} className="flex items-center gap-3 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 transition-colors group">
                                  <div className="flex-shrink-0 w-[130px] text-[8px] font-black uppercase tracking-wider text-slate-500 leading-tight truncate group-hover:text-slate-700 transition-colors">{p.name}</div>
                                  <div className="flex-1 relative h-4">
                                    <div className="absolute inset-y-0 left-0 rounded-full flex items-center pl-2" style={{ width: `${(p.yield / maxY) * 100}%`, background: p.color + "cc", minWidth: "2rem" }}>
                                      <span className="text-[7px] font-black text-white whitespace-nowrap">{p.yield.toFixed(1)}%</span>
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ background: p.color + "15", color: p.color }}>{p.category}</div>
                                </div>
                              ))}
                            </>
                          );
                        })()}
                      </div>
                      <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest text-center">
                        OAK at current annualised gross rate. All other yields per Sentill database (May 2026). Past performance ≠ future results.
                      </p>
                    </div>

                    {/* Risk metrics grid */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Risk Metrics</h3>
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {RISK_METRICS.map(m => (
                          <div key={m.label} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">{m.label}</span>
                            <span className="text-xl font-black text-slate-900">{m.value}</span>
                            <span className="text-[9px] text-slate-400 font-bold block mt-1.5">{m.sub}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Monthly returns table */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Full Monthly Returns Table</h3>
                      <div className="overflow-x-auto rounded-[2rem] border border-slate-150">
                        <table className="w-full text-[10px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-150">
                              {["Month", "Gross Return", "Net Return (After WHT)", "Cumulative NAV Index"].map(h => (
                                <th key={h} className="px-5 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {MONTHLY_RETURNS.map((m, i) => (
                              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-4 font-black text-slate-700">{m.month}</td>
                                <td className="px-5 py-4 font-black" style={{ color: COLOR }}>{m.gross.toFixed(2)}%</td>
                                <td className="px-5 py-4 font-bold text-slate-600">{m.net.toFixed(2)}%</td>
                                <td className="px-5 py-4 font-black text-slate-900">{m.cum.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── RESEARCH TAB ── */}
                {tab === "research" && (
                  <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">OAK Research Bulletins</h3>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Quarterly market commentary from the OAK investment committee at Faida IB</p>
                      </div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3.5 py-1.5 bg-slate-100 rounded-full w-fit">CIO: Ian Kahangara, CFA</span>
                    </div>
                    
                    <div className="space-y-6">
                      {RESEARCH_NOTES.map((r, i) => (
                        <div key={i} className="p-6 rounded-3xl border border-slate-100 hover:border-slate-200 bg-slate-50/30 hover:bg-white transition-all">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <span className="inline-block text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: r.color + "12", color: r.color }}>{r.tag}</span>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{r.date}</span>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                          </div>
                          <h4 className="text-sm font-black text-slate-900 mb-3">{r.title}</h4>
                          <p className="text-sm text-slate-600 font-semibold leading-relaxed">{r.summary}</p>
                        </div>
                      ))}
                    </div>

                    {/* Key risks */}
                    <div className="p-6 md:p-8 rounded-[2rem] border border-amber-100 bg-amber-50/50">
                      <div className="flex items-center gap-3 mb-5">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <h3 className="text-xs font-black text-amber-900 uppercase tracking-widest">Key Risk Disclosures</h3>
                      </div>
                      <div className="space-y-4">
                        {[
                          { risk: "Leverage Risk", desc: "OAK uses up to 2× leverage on forex and global equity positions. Leverage amplifies both gains and losses. Monthly NAV may fluctuate significantly during volatile global market periods." },
                          { risk: "Currency Risk", desc: "Approximately 55% of OAK's portfolio is USD-denominated. KES/USD movements directly impact NAV in KES terms. The fund does not fully hedge currency exposure." },
                          { risk: "Liquidity Risk", desc: "OAK enforces a 6-month lock-in per investment tranche. Semi-annual liquidity windows mean investors cannot access capital outside scheduled windows without paying a 3% early exit fee." },
                          { risk: "Concentration Risk", desc: "The forex sleeve (25% of AUM) is concentrated in a limited number of currency pairs. Adverse central bank policy decisions in any G10 country can cause rapid drawdowns in this sleeve." },
                        ].map(r => (
                          <div key={r.risk} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-2" />
                            <div>
                              <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider block mb-1">{r.risk} </span>
                              <span className="text-sm text-amber-800 font-semibold leading-relaxed block">{r.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TEAM TAB ── */}
                {tab === "team" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">OAK Investment & Management Board</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Faida Investment Bank Limited · Crawford Business Park, State House Rd, Nairobi</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {TEAM.map(m => (
                        <div key={m.name} className="p-6 rounded-[2rem] border border-slate-200 bg-white hover:border-slate-350 hover:shadow-md transition-all flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-sm flex-shrink-0" style={{ background: m.color }}>
                                {m.initials}
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-sm font-black text-slate-900 leading-tight">{m.name}</p>
                                <p className="text-[9px] font-black text-slate-450 uppercase tracking-widest mt-0.5 leading-tight">{m.role}</p>
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-650 font-semibold leading-relaxed">{m.bio}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── HOW TO INVEST TAB ── */}
                {tab === "invest" && (
                  <div className="space-y-10">
                    {/* Contact grid */}
                    <div className="space-y-6">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Contact OAK / Faida Investment Bank</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[
                          { icon: Zap, label: "WhatsApp (Primary)", value: "+254 759 777 666", href: "https://wa.me/254759777666", sub: "Fastest response — chat with the OAK team" },
                          { icon: Phone, label: "Main Line", value: "+254 709 228 600", href: "tel:+254709228600", sub: "Mon–Fri 8am–5pm EAT" },
                          { icon: Phone, label: "Alternative WhatsApp", value: "+254 743 552 341", href: "https://wa.me/254743552341", sub: "Secondary WhatsApp support line" },
                          { icon: Mail, label: "OAK Fund Email", value: "oak.fund@fib.co.ke", href: "mailto:oak.fund@fib.co.ke", sub: "Direct fund desk inquiries" },
                          { icon: Mail, label: "Customer Service", value: "customerservice@fib.co.ke", href: "mailto:customerservice@fib.co.ke", sub: "General Faida IB operations support" },
                          { icon: Globe, label: "Website", value: "oak.africa", href: "https://oak.africa", sub: "Official fund portals & documents" },
                        ].map(c => (
                          <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
                            className="flex items-start gap-4 p-5 rounded-3xl border border-slate-200 hover:border-emerald-350 bg-slate-50/50 hover:bg-white transition-all group">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: COLOR + "15" }}>
                              <c.icon className="w-5 h-5" style={{ color: COLOR }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{c.label}</p>
                              <p className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors truncate">{c.value}</p>
                              <p className="text-[9px] text-slate-400 font-bold mt-0.5">{c.sub}</p>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-300 flex-shrink-0 group-hover:text-emerald-600 transition-colors" />
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Office locations */}
                    <div className="space-y-6 pt-4 border-t border-slate-100">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Office Locations</h3>
                      <div className="grid md:grid-cols-3 gap-6">
                        {[
                          { label: "Head Office", address: "Crawford Business Park\nState House Road, Nairobi\nKenya", icon: Building2, primary: true },
                          { label: "Nairobi CBD Branch", address: "Windsor House, 1st Floor\nJunction of Muindi Mbingu\n& University Way, Nairobi", icon: MapPin, primary: false },
                          { label: "Kigali, Rwanda", address: "Centenary House, 4th Floor\nKigali, Rwanda\n+250 784 333 734", icon: Globe2, primary: false },
                        ].map(o => (
                          <div key={o.label} className={`flex items-start gap-4 p-5 rounded-[2rem] border ${o.primary ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-slate-50/50"}`}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: COLOR + "15" }}>
                              <o.icon className="w-5 h-5" style={{ color: COLOR }} />
                            </div>
                            <div className="space-y-1.5">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{o.label}</p>
                              <p className="text-xs font-black text-slate-800 whitespace-pre-line leading-relaxed">{o.address}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* How to invest steps */}
                    <div className="space-y-6 pt-4 border-t border-slate-100">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Investment Process — Step by Step</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { step: "Contact OAK Team", desc: "WhatsApp or call +254 759 777 666, or email oak.fund@fib.co.ke. An advisor will be assigned to guide you." },
                          { step: "KYC Documentation", desc: "Submit your National ID/Passport, KRA PIN, proof of address (max 3 months old), and a Source of Funds declaration." },
                          { step: "Fund Account", desc: "Transfer a minimum of KES 500,000 to the OAK fund account at I&M Bank Kenya. Use reference: 'OAK-SF - [Your Name]'." },
                          { step: "Select Class", desc: "Choose Growth (compounding), Income (quarterly payouts), or Balanced (50/50). Classes are adjustable annually." },
                          { step: "Unit Allocation", desc: "Units are allocated within 2 business days of funds clearing, starting your 6-month lock-in period." },
                          { step: "Monitor Progress", desc: "Track performance updates and statements on the portal, or via automated monthly WhatsApp updates." },
                        ].map((s, i) => (
                          <div key={i} className="flex items-start gap-4 p-5 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0" style={{ background: COLOR }}>
                              {i + 1}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider mb-1.5">{s.step}</p>
                              <p className="text-xs text-slate-650 font-semibold leading-relaxed">{s.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Inquiry form */}
                    <div className="border-t border-slate-150 pt-8">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 text-center">Submit an Investment Enquiry</h3>
                      <InvestForm />
                    </div>
                  </div>
                )}

                {/* ── FAQ TAB ── */}
                {tab === "faq" && (
                  <div className="space-y-4">
                    <div className="mb-6">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Frequently Asked Questions</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Everything you need to know about OAK Special Fund</p>
                    </div>
                    <div className="space-y-3">
                      {FAQ_ITEMS.map((item, i) => <FAQItem key={i} item={item} />)}
                    </div>
                    <div className="mt-8 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 text-center space-y-3">
                      <p className="text-[10px] text-slate-500 font-semibold">Still have questions?</p>
                      <div className="flex justify-center items-center gap-2 flex-wrap text-[10px] font-black uppercase tracking-widest">
                        <a href="mailto:oak.fund@fib.co.ke" className="inline-flex items-center gap-2" style={{ color: COLOR }}>
                          <Mail className="w-3.5 h-3.5" /> oak.fund@fib.co.ke
                        </a>
                        <span className="text-slate-300">·</span>
                        <a href="https://wa.me/254759777666" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2" style={{ color: COLOR }}>
                          <Zap className="w-3.5 h-3.5" /> WhatsApp +254 759 777 666
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── CALCULATOR TAB ── */}
                {tab === "calculator" && (
                  <div className="space-y-4">
                    <div className="mb-4">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">OAK Investment Growth Calculator</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Adjust sliders to model your potential returns. Projections are illustrative only.</p>
                    </div>
                    <Calculator />
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── CTA BANNER ── */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          className="rounded-[2.5rem] p-8 md:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative overflow-hidden shadow-xl" style={{ background: "linear-gradient(135deg, #090d16, #1e293b)" }}>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[140px] opacity-15 pointer-events-none" style={{ background: COLOR }} />
          <div className="relative z-10 space-y-2">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none">Start Investing in OAK Today</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">
              Min KES 500,000 · Targeting 20–30% p.a. · CMA Licensed · Managed by Faida Investment Bank
            </p>
          </div>
          <div className="flex items-center gap-3 relative z-10 flex-wrap">
            <button onClick={() => setTab("invest")} className="flex items-center gap-2.5 px-6 py-4 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all hover:opacity-95 cursor-pointer shadow-lg shadow-emerald-500/25" style={{ background: COLOR }}>
              <Send className="w-4 h-4" /> Apply Now
            </button>
            <a href="https://wa.me/254759777666" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">
              <Zap className="w-4 h-4" /> WhatsApp Us
            </a>
            <Link href="/tools/compare" className="flex items-center gap-2.5 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all">
              <BarChart2 className="w-4 h-4" /> Compare Funds
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
