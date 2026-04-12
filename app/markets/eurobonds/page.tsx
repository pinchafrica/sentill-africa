"use client";

import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";
import {
  Globe, Shield, TrendingUp, TrendingDown, DollarSign, Calendar,
  ArrowRight, CheckCircle, AlertTriangle, Info, ExternalLink,
  BarChart3, FileText, Zap, ChevronDown, ChevronUp
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/* ── DATA ── */
const EUROBONDS = [
  {
    id: "KE2024",
    name: "Kenya 2024 Eurobond",
    fullName: "Republic of Kenya 6.875% Eurobond",
    coupon: 6.875,
    currency: "USD",
    maturity: "2024-06-24",
    tenor: "10yr",
    issuedAmount: "USD 2.0B",
    issuedYear: 2014,
    status: "Matured",
    rating: "B (S&P)",
    ytm: "Matured",
    color: "#94a3b8",
    used: "Refinancing short-term CBK debt & infrastructure financing",
    priceHistory: [
      { date: "2021", price: 98.2, ytm: 7.1 }, { date: "2022-H1", price: 95.5, ytm: 7.8 },
      { date: "2022-H2", price: 88.1, ytm: 10.2 }, { date: "2023-H1", price: 72.4, ytm: 14.8 },
      { date: "2023-H2", price: 86.5, ytm: 11.2 }, { date: "2024-Q1", price: 92.8, ytm: 9.4 },
      { date: "2024-Q2", price: 100.0, ytm: 0.0 },
    ]
  },
  {
    id: "KE2027",
    name: "Kenya 2027 Eurobond",
    fullName: "Republic of Kenya 8.00% Eurobond",
    coupon: 8.00,
    currency: "USD",
    maturity: "2027-05-22",
    tenor: "10yr",
    issuedAmount: "USD 1.0B",
    issuedYear: 2019,
    status: "Active",
    rating: "B (Fitch)",
    ytm: 9.45,
    color: "#10b981",
    used: "Infrastructure, energy & social development funding",
    priceHistory: [
      { date: "Jan 24", price: 96.4, ytm: 9.8 }, { date: "Feb 24", price: 94.2, ytm: 10.5 },
      { date: "Mar 24", price: 98.1, ytm: 8.9 }, { date: "Apr 24", price: 99.0, ytm: 8.6 },
      { date: "May 24", price: 98.6, ytm: 8.8 }, { date: "Jun 24", price: 97.9, ytm: 9.1 },
      { date: "Jul 24", price: 98.3, ytm: 9.0 }, { date: "Aug 24", price: 97.5, ytm: 9.3 },
      { date: "Sep 24", price: 96.8, ytm: 9.5 }, { date: "Oct 24", price: 97.1, ytm: 9.4 },
      { date: "Nov 24", price: 96.4, ytm: 9.6 }, { date: "Dec 24", price: 96.9, ytm: 9.45 },
    ]
  },
  {
    id: "KE2028",
    name: "Kenya 2028 Eurobond",
    fullName: "Republic of Kenya 7.25% Eurobond",
    coupon: 7.25,
    currency: "USD",
    maturity: "2028-02-28",
    tenor: "12yr",
    issuedAmount: "USD 900M",
    issuedYear: 2019,
    status: "Active",
    rating: "B (Moody's Ba3)",
    ytm: 9.82,
    color: "#3b82f6",
    used: "Infrastructure development and budget support",
    priceHistory: [
      { date: "Jan 24", price: 94.5, ytm: 9.6 }, { date: "Feb 24", price: 92.1, ytm: 10.4 },
      { date: "Mar 24", price: 95.8, ytm: 9.1 }, { date: "Apr 24", price: 96.7, ytm: 8.8 },
      { date: "May 24", price: 96.2, ytm: 9.0 }, { date: "Jun 24", price: 95.5, ytm: 9.3 },
      { date: "Jul 24", price: 95.9, ytm: 9.2 }, { date: "Aug 24", price: 95.1, ytm: 9.5 },
      { date: "Sep 24", price: 94.3, ytm: 9.8 }, { date: "Oct 24", price: 94.7, ytm: 9.7 },
      { date: "Nov 24", price: 94.0, ytm: 9.9 }, { date: "Dec 24", price: 93.8, ytm: 9.82 },
    ]
  },
  {
    id: "KE2032",
    name: "Kenya 2032 Eurobond",
    fullName: "Republic of Kenya 7.875% Eurobond",
    coupon: 7.875,
    currency: "USD",
    maturity: "2032-02-01",
    tenor: "12yr",
    issuedAmount: "USD 1.5B",
    issuedYear: 2024,
    status: "Active",
    rating: "B (S&P)",
    ytm: 10.12,
    color: "#f59e0b",
    used: "Refinancing the matured 2014 bonds & fiscal consolidation",
    priceHistory: [
      { date: "Mar 24", price: 99.0, ytm: 8.1 },  { date: "Apr 24", price: 97.8, ytm: 8.5 },
      { date: "May 24", price: 97.1, ytm: 8.8 }, { date: "Jun 24", price: 96.4, ytm: 9.1 },
      { date: "Jul 24", price: 95.8, ytm: 9.4 }, { date: "Aug 24", price: 95.2, ytm: 9.6 },
      { date: "Sep 24", price: 94.6, ytm: 9.8 }, { date: "Oct 24", price: 94.1, ytm: 10.0 },
      { date: "Nov 24", price: 93.5, ytm: 10.1 }, { date: "Dec 24", price: 93.0, ytm: 10.12 },
    ]
  },
];

const SPREAD_DATA = [
  { date: "Jan 24", kenya: 940, nigeria: 880, ghana: 2200, ethiopia: 1400, usTreasury: 480 },
  { date: "Mar 24", kenya: 820, nigeria: 750, ghana: 1800, ethiopia: 1200, usTreasury: 480 },
  { date: "May 24", kenya: 750, nigeria: 720, ghana: 1600, ethiopia: 1150, usTreasury: 500 },
  { date: "Jul 24", kenya: 800, nigeria: 730, ghana: 1500, ethiopia: 1100, usTreasury: 510 },
  { date: "Sep 24", kenya: 820, nigeria: 740, ghana: 1450, ethiopia: 1080, usTreasury: 490 },
  { date: "Dec 24", kenya: 780, nigeria: 720, ghana: 1380, ethiopia: 1050, usTreasury: 470 },
];

const FX_RISK_DATA = [
  { month: "Jan", usdkes: 126.5, change: -2.1 },
  { month: "Feb", usdkes: 129.2, change: +2.1 },
  { month: "Mar", usdkes: 131.0, change: +1.4 },
  { month: "Apr", usdkes: 134.8, change: +2.9 },
  { month: "May", usdkes: 137.2, change: +1.8 },
  { month: "Jun", usdkes: 131.5, change: -4.2 },
  { month: "Jul", usdkes: 129.8, change: -1.3 },
  { month: "Aug", usdkes: 128.4, change: -1.1 },
  { month: "Sep", usdkes: 127.1, change: -1.0 },
  { month: "Oct", usdkes: 129.0, change: +1.5 },
  { month: "Nov", usdkes: 130.2, change: +0.9 },
  { month: "Dec", usdkes: 129.5, change: -0.5 },
];

const REPAYMENT = [
  { year: "2025", amount: 0 },
  { year: "2026", amount: 0 },
  { year: "2027", amount: 1000 },  // 2027 bond
  { year: "2028", amount: 900 },   // 2028 bond
  { year: "2029", amount: 0 },
  { year: "2030", amount: 0 },
  { year: "2031", amount: 0 },
  { year: "2032", amount: 1500 },  // 2032 bond
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl text-white text-xs">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="font-black" style={{ color: p.color }}>
            {p.name}: {typeof p.value === "number" ? (p.name.includes("Price") ? p.value + "¢" : p.value) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function EurobondPage() {
  const [selectedBond, setSelectedBond] = useState(EUROBONDS[1]);
  const [activeTab, setActiveTab] = useState<"overview" | "spreads" | "fx" | "guide">("overview");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const FAQS = [
    { q: "What is a Eurobond?", a: "A Eurobond is a bond issued in a currency other than the currency of the country where it is issued. Kenya's Eurobonds are USD-denominated bonds issued in international capital markets (London, New York). They are NOT sold to retail investors directly — they trade on international secondary markets." },
    { q: "Can Kenyan retail investors buy Eurobonds?", a: "Not directly. Kenya's Eurobonds are primarily available to institutional investors (hedge funds, pension funds, sovereign wealth funds). Kenyan retail investors can gain indirect exposure through global bond ETFs that hold emerging market sovereign debt." },
    { q: "How does USD/KES exchange rate affect Eurobond risk?", a: "Kenya must repay Eurobond principal and coupons in USD. If the KES depreciates against USD, the debt burden in local currency terms increases dramatically. This is the primary risk associated with Eurobonds for Kenya as a nation." },
    { q: "What is a credit spread?", a: "The credit spread is the extra yield over US Treasury bonds that investors demand to compensate for the risk of lending to Kenya. A 780 basis point spread means Kenya pays 7.8% MORE than the US government to borrow. When spreads narrow, it signals improving investor confidence." },
    { q: "What happened with Kenya's 2024 Eurobond?", a: "Kenya successfully repaid the USD 2.0B 2014 bond in June 2024 using proceeds from the new February 2024 issuance (USD 1.5B at 7.875%) plus IMF emergency facility drawdowns and CBK reserve buffers. This was a major test of Kenya's creditworthiness." },
    { q: "What is Kenya's credit rating?", a: "As of early 2025, S&P and Fitch rate Kenya at B (speculative/junk grade), while Moody's rates it Ba3. This reflects fiscal challenges, high debt-to-GDP ratio, and reliance on external financing. However, the successful 2024 bond repayment improved sentiment." },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">

      {/* HEADER */}
      <div className="border-b border-slate-800 px-6 py-16 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/markets" className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">← Markets</Link>
            <span className="text-slate-600">/</span>
            <Link href="/markets/bonds" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Government Bonds</Link>
            <span className="text-slate-600">/</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Eurobonds</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-6">
                <Globe className="w-3.5 h-3.5" /> International Capital Markets · USD Denominated
              </div>
              <h1 className="text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-4 leading-none">
                Kenya<br /><span className="text-indigo-400">Eurobonds</span>
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed font-medium">
                The Republic of Kenya's sovereign international debt. USD-denominated bonds trading on global capital markets. Track yields, spreads vs African peers, USD/KES FX risk, and repayment cliff analysis.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 shrink-0">
              {[
                { label: "Outstanding USD Debt", value: "$3.4B", sub: "Active bonds only", color: "text-white" },
                { label: "Best Active YTM", value: "9.45%", sub: "KE2027 Bond", color: "text-indigo-400" },
                { label: "Credit Rating (S&P)", value: "B", sub: "Speculative Grade", color: "text-amber-400" },
                { label: "Next Maturity", value: "May 2027", sub: "$1.0B Due", color: "text-rose-400" },
              ].map((s, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">{s.label}</p>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] text-slate-500 font-bold mt-1">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>



      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">

        {/* BOND CARD SELECTOR */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EUROBONDS.map(bond => (
            <motion.div key={bond.id} whileHover={{ y: -3 }} onClick={() => setSelectedBond(bond)}
              className={`rounded-2xl p-6 border-2 cursor-pointer transition-all ${
                selectedBond.id === bond.id ? "border-indigo-500 bg-indigo-500/10" : "border-slate-800 bg-slate-900/50 hover:border-slate-600"
              } ${bond.status === "Matured" ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{bond.issuedYear} · {bond.tenor} · {bond.issuedAmount}</p>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">{bond.name}</h3>
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                  bond.status === "Active" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-500/20 text-slate-400"
                }`}>{bond.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Coupon</p>
                  <p className="text-lg font-black text-amber-400">{bond.coupon}%</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">YTM</p>
                  <p className="text-lg font-black" style={{ color: bond.color }}>{bond.status === "Matured" ? "—" : `${bond.ytm}%`}</p>
                </div>
              </div>
              <p className="text-[9px] font-bold text-slate-500 mt-3 leading-relaxed">{bond.rating}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* TAB BAR */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-[64px] lg:top-[108px] z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {([
              { key: "overview", label: "Bonds Overview" },
              { key: "spreads", label: "Spread Analysis" },
              { key: "fx", label: "FX Risk (USD/KES)" },
              { key: "guide", label: "Investor Guide" },
            ] as const).map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${
                  activeTab === t.key ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-400 hover:text-slate-200"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Price/YTM history */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="font-black text-white uppercase tracking-widest text-sm">Price & YTM History — {selectedBond.name}</h3>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Secondary market price (cents on dollar) · Last 12 months</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Current YTM</p>
                  <p className="text-2xl font-black text-indigo-400">{selectedBond.status === "Matured" ? "—" : `${selectedBond.ytm}%`}</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={selectedBond.priceHistory}>
                  <defs>
                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} />
                  <YAxis yAxisId="price" domain={["auto", "auto"]} tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={v => v + "¢"} />
                  <YAxis yAxisId="ytm" orientation="right" domain={["auto", "auto"]} tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={v => v + "%"} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area yAxisId="price" type="monotone" dataKey="price" name="Price (¢ on $)" stroke="#6366f1" fill="url(#priceGrad)" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line yAxisId="ytm" type="monotone" dataKey="ytm" name="YTM %" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bond details card */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                <h3 className="font-black text-white uppercase tracking-widest text-sm mb-6">Bond Specifications</h3>
                <div className="space-y-3">
                  {[
                    { label: "Full Name", value: selectedBond.fullName },
                    { label: "ISIN / Exchange", value: "London Stock Exchange (LSE)" },
                    { label: "Coupon Rate", value: `${selectedBond.coupon}% p.a. (semi-annual)`, hl: true },
                    { label: "Yield to Maturity", value: selectedBond.status === "Matured" ? "Matured" : `${selectedBond.ytm}%`, hl: true },
                    { label: "Currency", value: "USD (US Dollars)" },
                    { label: "Issued Amount", value: selectedBond.issuedAmount },
                    { label: "Maturity Date", value: selectedBond.maturity },
                    { label: "Credit Rating", value: selectedBond.rating },
                    { label: "Use of Proceeds", value: selectedBond.used },
                    { label: "Coupon Frequency", value: "Every 6 months" },
                  ].map((r, i) => (
                    <div key={i} className="flex justify-between items-start gap-4 border-b border-slate-800 pb-3">
                      <span className="text-slate-400 text-sm shrink-0">{r.label}</span>
                      <span className={`text-sm font-bold text-right ${r.hl ? "text-indigo-400" : "text-slate-200"}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Repayment cliff */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                <h3 className="font-black text-white uppercase tracking-widest text-sm mb-2">Eurobond Repayment Cliff</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-6">USD Millions due by year — maturity schedule</p>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={REPAYMENT}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} />
                    <YAxis tickFormatter={v => `$${v}M`} tick={{ fill: "#64748b", fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="amount" name="Repayment (USD M)" fill="#6366f1" radius={[6, 6, 0, 0]}>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <p className="text-[11px] font-bold text-rose-300 leading-relaxed">
                    ⚠️ Kenya faces a USD 1.0B bullet repayment in May 2027 and USD 0.9B in Feb 2028. Combined repayment pressure of $1.9B in 24 months requires proactive refinancing strategy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SPREADS TAB ── */}
        {activeTab === "spreads" && (
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <h3 className="font-black text-white uppercase tracking-widest text-sm mb-2">Credit Spread Comparison — Africa vs US Treasury</h3>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-6">Basis points over US 10-year Treasury · Lower = Better Creditworthiness</p>
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={SPREAD_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} />
                  <YAxis domain={[0, 2500]} tickFormatter={v => `${v}bps`} tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="kenya" name="Kenya" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="nigeria" name="Nigeria" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" />
                  <Line type="monotone" dataKey="ghana" name="Ghana" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" />
                  <Line type="monotone" dataKey="ethiopia" name="Ethiopia" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { country: "Kenya", spread: "780bps", outlook: "Stable", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
                { country: "Nigeria", spread: "720bps", outlook: "Negative Watch", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                { country: "Ghana", spread: "1,380bps", outlook: "Under Restructuring", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
              ].map((c, i) => (
                <div key={i} className={`rounded-2xl p-6 border ${c.bg}`}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{c.country} Sovereign Spread</p>
                  <p className={`text-3xl font-black ${c.color}`}>{c.spread}</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-2">{c.outlook}</p>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <h3 className="font-black text-white text-sm uppercase tracking-widest mb-4">What the Spread Tells Investors</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: "Narrow Spread (&lt; 400bps)", desc: "Lower borrowing cost. Strong investor confidence. Kenya approached this during 2021.", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
                  { title: "Wide Spread (700–900bps)", desc: "Current zone. Investors demand premium for currency & fiscal risks. Still manageable.", color: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
                  { title: "Distressed Spread (&gt; 1500bps)", desc: "Debt distress signal. Ghana crossed this in 2022, triggering IMF restructuring.", color: "bg-rose-500/10 border-rose-500/20 text-rose-400" },
                  { title: "Improving Trend", desc: "Kenya's spread narrowed from ~940bps in Jan 2024 to ~780bps by Dec 2024 — positive trajectory.", color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" },
                ].map((item, i) => (
                  <div key={i} className={`rounded-2xl border p-5 ${item.color}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2">{item.title}</p>
                    <p className="text-sm font-medium text-slate-300 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FX TAB ── */}
        {activeTab === "fx" && (
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <h3 className="font-black text-white text-sm uppercase tracking-widest mb-2">USD/KES Exchange Rate — 2024 Monthly</h3>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-6">KES units per 1 USD — Lower = Stronger shilling</p>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={FX_RISK_DATA}>
                  <defs>
                    <linearGradient id="fxGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} />
                  <YAxis domain={[120, 140]} tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={130} stroke="#6366f1" strokeDasharray="4 4" label={{ value: "130 Mark", fill: "#6366f1", fontSize: 9 }} />
                  <Area type="monotone" dataKey="usdkes" name="USD/KES Rate" stroke="#f59e0b" fill="url(#fxGrad)" strokeWidth={2.5} dot={{ r: 4, fill: "#f59e0b" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "KES Depreciation Risk", desc: "Every 10% KES depreciation increases Kenya's effective Eurobond repayment cost in KES terms by the same proportion. A USD 1B bond costs KES 129B at KES/USD 129, but KES 145B at 145.", icon: TrendingDown, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
                { title: "CBK FX Reserves", desc: "Kenya held ~USD 8.0B in FX reserves as of Dec 2024 (≈4.4 months import cover). This is the primary buffer for Eurobond coupon payments and exchange rate stabilization.", icon: Shield, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                { title: "2024 Shilling Recovery", desc: "The KES strengthened from its 2023 nadir of KES 161/USD back to ~128 by end of 2024 — a 20%+ recovery driven by IMF support, diaspora remittances, and improved trade balance.", icon: TrendingUp, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
              ].map((c, i) => (
                <div key={i} className={`rounded-2xl border p-6 ${c.color}`}>
                  <c.icon className="w-6 h-6 mb-3" />
                  <h4 className="text-sm font-black uppercase tracking-widest mb-2">{c.title}</h4>
                  <p className="text-sm font-medium text-slate-300 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── GUIDE TAB ── */}
        {activeTab === "guide" && (
          <div className="space-y-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <h3 className="font-black text-white text-sm uppercase tracking-widest mb-6">How Kenyan Retail Investors Gain Eurobond Exposure</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { title: "1. Global Bond ETFs", desc: "iShares JP Morgan EM Bond ETF (EMB), Vanguard Emerging Markets Bond. These hold Kenya's Eurobonds as part of a diversified EM portfolio. Accessible via international brokers (IBKR, TD Ameritrade).", tag: "Easiest Route", color: "bg-emerald-500/20 text-emerald-400" },
                  { title: "2. Diaspora USD Accounts", desc: "Open a USD account with a Kenyan bank (Equity, NCBA, ABSA offer dollar accounts). Use to invest in US-listed ETFs holding Kenya sovereign bonds.", tag: "For Diaspora", color: "bg-blue-500/20 text-blue-400" },
                  { title: "3. Secondary Market (Institutional)", desc: "Minimum ticket typically USD 200,000. Available via international investment banks (JP Morgan, Citi). Not practical for retail without an offshore account.", tag: "Institutional Only", color: "bg-amber-500/20 text-amber-400" },
                  { title: "4. Offshore Investment Platform", desc: "Some platforms like Nuvest (Kenya) allow pooled investment in international bonds. Check regulatory status carefully before committing funds.", tag: "Verify Carefully", color: "bg-rose-500/20 text-rose-400" },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-sm font-black text-white">{item.title}</h4>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${item.color}`}>{item.tag}</span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <h3 className="font-black text-white text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" /> Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {FAQS.map((faq, i) => (
                  <div key={i} className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-800/50">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800 transition-colors">
                      <span className="text-sm font-black text-white">{faq.q}</span>
                      {openFaq === i ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                          <p className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-slate-700 pt-4">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
