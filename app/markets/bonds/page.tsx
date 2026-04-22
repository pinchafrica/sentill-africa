"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend, ReferenceLine, PieChart, Pie
} from "recharts";
import {
  TrendingUp, Shield, Star, ChevronDown, ChevronUp,
  Calculator, AlertCircle, CheckCircle, ArrowRight,
  Building2, Clock, DollarSign, Percent, Zap, Info,
} from "lucide-react";
import AssetModal from "@/components/AssetModal";

// ── Static Bond Data ────────────────────────────────────────────────────────
const BONDS = [
  {
    id: "ifb1-2024",
    name: "IFB1/2024",
    fullName: "Infrastructure Finance Bond 1/2024",
    type: "IFB",
    coupon: 18.46,
    netYield: 18.46,
    taxRate: 0,
    maturity: "2034-03-15",
    tenor: "10yr",
    faceValue: 100000,
    minInvestment: 100000,
    issuer: "Central Bank of Kenya",
    currency: "KES",
    isin: "KE1000002842",
    status: "Active",
    isIFB: true,
    description:
      "10-year infrastructure bond issued to fund roads, energy & water projects. WHT-exempt under the IFB programme.",
    highlights: ["0% WHT", "Semi-annual coupons", "CBK guaranteed", "Listed on NSE"],
    monthlyData: [
      { month: "Mar 24", price: 100.0, yield: 18.46 },
      { month: "Apr 24", price: 100.4, yield: 18.2 },
      { month: "May 24", price: 101.0, yield: 17.9 },
      { month: "Jun 24", price: 100.8, yield: 18.05 },
      { month: "Jul 24", price: 101.5, yield: 17.7 },
      { month: "Aug 24", price: 102.0, yield: 17.4 },
      { month: "Sep 24", price: 101.8, yield: 17.55 },
      { month: "Oct 24", price: 102.4, yield: 17.2 },
      { month: "Nov 24", price: 103.0, yield: 16.9 },
      { month: "Dec 24", price: 102.7, yield: 17.05 },
      { month: "Jan 25", price: 103.5, yield: 16.7 },
      { month: "Feb 25", price: 104.0, yield: 16.45 },
    ],
  },
  {
    id: "ifb2-2023",
    name: "IFB2/2023",
    fullName: "Infrastructure Finance Bond 2/2023",
    type: "IFB",
    coupon: 17.93,
    netYield: 17.93,
    taxRate: 0,
    maturity: "2033-06-15",
    tenor: "10yr",
    faceValue: 100000,
    minInvestment: 100000,
    issuer: "Central Bank of Kenya",
    currency: "KES",
    isin: "KE1000002719",
    status: "Active",
    isIFB: true,
    description:
      "10-year IFB supporting transport and energy infrastructure. Fully WHT-exempt with semi-annual coupon payments.",
    highlights: ["0% WHT", "Semi-annual coupons", "CBK guaranteed", "High liquidity"],
    monthlyData: [
      { month: "Mar 24", price: 99.2, yield: 17.5 },
      { month: "Apr 24", price: 99.6, yield: 17.35 },
      { month: "May 24", price: 100.1, yield: 17.18 },
      { month: "Jun 24", price: 99.9, yield: 17.26 },
      { month: "Jul 24", price: 100.4, yield: 17.05 },
      { month: "Aug 24", price: 100.9, yield: 16.82 },
      { month: "Sep 24", price: 100.7, yield: 16.9 },
      { month: "Oct 24", price: 101.2, yield: 16.68 },
      { month: "Nov 24", price: 101.8, yield: 16.44 },
      { month: "Dec 24", price: 101.5, yield: 16.56 },
      { month: "Jan 25", price: 102.1, yield: 16.3 },
      { month: "Feb 25", price: 102.6, yield: 16.1 },
    ],
  },
  {
    id: "ifb3-2022",
    name: "IFB3/2022",
    fullName: "Infrastructure Finance Bond 3/2022",
    type: "IFB",
    coupon: 13.94,
    netYield: 13.94,
    taxRate: 0,
    maturity: "2032-09-15",
    tenor: "10yr",
    faceValue: 100000,
    minInvestment: 100000,
    issuer: "Central Bank of Kenya",
    currency: "KES",
    isin: "KE1000002601",
    status: "Active",
    isIFB: true,
    description:
      "Older IFB series from 2022. Lower coupon reflects the rate environment at issuance; still WHT-exempt.",
    highlights: ["0% WHT", "Semi-annual coupons", "CBK guaranteed", "2022 series"],
    monthlyData: [
      { month: "Mar 24", price: 96.5, yield: 14.8 },
      { month: "Apr 24", price: 96.9, yield: 14.62 },
      { month: "May 24", price: 97.4, yield: 14.4 },
      { month: "Jun 24", price: 97.1, yield: 14.52 },
      { month: "Jul 24", price: 97.8, yield: 14.25 },
      { month: "Aug 24", price: 98.2, yield: 14.06 },
      { month: "Sep 24", price: 98.0, yield: 14.14 },
      { month: "Oct 24", price: 98.6, yield: 13.92 },
      { month: "Nov 24", price: 99.1, yield: 13.72 },
      { month: "Dec 24", price: 98.8, yield: 13.83 },
      { month: "Jan 25", price: 99.3, yield: 13.62 },
      { month: "Feb 25", price: 99.8, yield: 13.43 },
    ],
  },
  {
    id: "fxd1-2024",
    name: "FXD1/2024",
    fullName: "Fixed Rate Treasury Bond 1/2024",
    type: "FXD",
    coupon: 16.80,
    netYield: 14.28,
    taxRate: 15,
    maturity: "2026-03-15",
    tenor: "2yr",
    faceValue: 50000,
    minInvestment: 50000,
    issuer: "Government of Kenya",
    currency: "KES",
    isin: "KE1000002854",
    status: "Active",
    isIFB: false,
    description:
      "5-year fixed rate treasury bond. Subject to 15% WHT on coupon income. Suitable for medium-term investors.",
    highlights: ["15% WHT applies", "Semi-annual coupons", "Min KES 50,000", "5-year tenor"],
    monthlyData: [
      { month: "Mar 24", price: 100.0, yield: 16.0 },
      { month: "Apr 24", price: 100.3, yield: 15.84 },
      { month: "May 24", price: 100.7, yield: 15.65 },
      { month: "Jun 24", price: 100.5, yield: 15.74 },
      { month: "Jul 24", price: 101.0, yield: 15.52 },
      { month: "Aug 24", price: 101.4, yield: 15.33 },
      { month: "Sep 24", price: 101.2, yield: 15.42 },
      { month: "Oct 24", price: 101.7, yield: 15.2 },
      { month: "Nov 24", price: 102.1, yield: 15.02 },
      { month: "Dec 24", price: 101.9, yield: 15.11 },
      { month: "Jan 25", price: 102.4, yield: 14.9 },
      { month: "Feb 25", price: 102.8, yield: 14.72 },
    ],
  },
  {
    id: "fxd2-2023",
    name: "FXD2/2023",
    fullName: "Fixed Rate Treasury Bond 2/2023",
    type: "FXD",
    coupon: 15.5,
    netYield: 13.18,
    taxRate: 15,
    maturity: "2030-09-15",
    tenor: "7yr",
    faceValue: 50000,
    minInvestment: 50000,
    issuer: "Government of Kenya",
    currency: "KES",
    isin: "KE1000002733",
    status: "Active",
    isIFB: false,
    description:
      "7-year fixed rate bond from the 2023 series. Semi-annual coupons with 15% WHT on interest income.",
    highlights: ["15% WHT applies", "Semi-annual coupons", "7-year tenor", "2023 series"],
    monthlyData: [
      { month: "Mar 24", price: 98.8, yield: 15.8 },
      { month: "Apr 24", price: 99.1, yield: 15.65 },
      { month: "May 24", price: 99.5, yield: 15.48 },
      { month: "Jun 24", price: 99.3, yield: 15.56 },
      { month: "Jul 24", price: 99.8, yield: 15.36 },
      { month: "Aug 24", price: 100.2, yield: 15.18 },
      { month: "Sep 24", price: 100.0, yield: 15.26 },
      { month: "Oct 24", price: 100.5, yield: 15.06 },
      { month: "Nov 24", price: 100.9, yield: 14.89 },
      { month: "Dec 24", price: 100.7, yield: 14.97 },
      { month: "Jan 25", price: 101.2, yield: 14.78 },
      { month: "Feb 25", price: 101.6, yield: 14.6 },
    ],
  },
  {
    id: "fxd1-2022-15yr",
    name: "FXD1/2022 15yr",
    fullName: "Fixed Rate Treasury Bond 1/2022 (15-Year)",
    type: "FXD",
    coupon: 13.92,
    netYield: 11.83,
    taxRate: 15,
    maturity: "2037-02-15",
    tenor: "15yr",
    faceValue: 50000,
    minInvestment: 50000,
    issuer: "Government of Kenya",
    currency: "KES",
    isin: "KE1000002588",
    status: "Active",
    isIFB: false,
    description:
      "Long-tenor 15-year bond from 2022. Lower coupon reflects the older rate environment. Suitable for long-term portfolio anchoring.",
    highlights: ["15% WHT applies", "15-year tenor", "Long-duration", "Capital gain potential"],
    monthlyData: [
      { month: "Mar 24", price: 93.5, yield: 15.2 },
      { month: "Apr 24", price: 93.9, yield: 15.05 },
      { month: "May 24", price: 94.4, yield: 14.86 },
      { month: "Jun 24", price: 94.1, yield: 14.98 },
      { month: "Jul 24", price: 94.8, yield: 14.72 },
      { month: "Aug 24", price: 95.2, yield: 14.56 },
      { month: "Sep 24", price: 95.0, yield: 14.64 },
      { month: "Oct 24", price: 95.5, yield: 14.46 },
      { month: "Nov 24", price: 96.0, yield: 14.28 },
      { month: "Dec 24", price: 95.7, yield: 14.38 },
      { month: "Jan 25", price: 96.3, yield: 14.18 },
      { month: "Feb 25", price: 96.8, yield: 14.0 },
    ],
  },
];

// Yield Curve Data (T-Bills + Bonds)
const YIELD_CURVE = [
  { tenor: "91d", yield: 15.82, type: "T-Bill" },
  { tenor: "182d", yield: 16.1, type: "T-Bill" },
  { tenor: "364d", yield: 16.45, type: "T-Bill" },
  { tenor: "2yr", yield: 15.8, type: "FXD" },
  { tenor: "5yr", yield: 16.0, type: "FXD" },
  { tenor: "7yr", yield: 15.5, type: "FXD" },
  { tenor: "10yr IFB", yield: 18.46, type: "IFB" },
  { tenor: "10yr FXD", yield: 14.5, type: "FXD" },
  { tenor: "15yr", yield: 13.92, type: "FXD" },
];

const MATURITY_SCHEDULE = [
  { year: "2025", amount: 280, label: "T-Bills" },
  { year: "2026", amount: 420, label: "FXD" },
  { year: "2027", amount: 310, label: "FXD" },
  { year: "2028", amount: 560, label: "FXD" },
  { year: "2029", amount: 380, label: "FXD/IFB" },
  { year: "2030", amount: 290, label: "FXD" },
  { year: "2031", amount: 210, label: "IFB" },
  { year: "2032", amount: 350, label: "IFB" },
  { year: "2033", amount: 480, label: "IFB" },
  { year: "2034", amount: 520, label: "IFB" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs shadow-2xl">
        <p className="text-slate-400 mb-1 font-semibold">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-bold">
            {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
            {p.name?.toLowerCase().includes("yield") || p.name?.toLowerCase().includes("price") ? "" : ""}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function BondsPage() {
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [prefilledAsset, setPrefilledAsset] = useState<string | undefined>(undefined);

  const handleOpenAssetModal = (assetId?: string) => {
    setPrefilledAsset(assetId);
    setIsAssetModalOpen(true);
  };

  const [activeTab, setActiveTab] = useState<"overview" | "calculator" | "howto" | "faq">("overview");
  const [calcPrincipal, setCalcPrincipal] = useState(500000);
  const [calcYears, setCalcYears] = useState(5);
  const [filter, setFilter] = useState<"All" | "IFB" | "FXD">("All");
  const [sortBy, setSortBy] = useState<"netYield" | "coupon" | "maturity">("netYield");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedBond, setSelectedBond] = useState(BONDS[0]);

  useEffect(() => {
    const live = BONDS.find(b => b.id === selectedBond.id);
    if (live) setSelectedBond(live);
  }, [selectedBond.id]); 

  const filtered = useMemo(() => {
    let list = filter === "All" ? BONDS : BONDS.filter((b) => b.type === filter);
    list = [...list].sort((a, b) => {
      if (sortBy === "netYield") return sortDir === "desc" ? b.netYield - a.netYield : a.netYield - b.netYield;
      if (sortBy === "coupon") return sortDir === "desc" ? b.coupon - a.coupon : a.coupon - b.coupon;
      if (sortBy === "maturity") {
        return sortDir === "desc"
          ? new Date(b.maturity).getTime() - new Date(a.maturity).getTime()
          : new Date(a.maturity).getTime() - new Date(b.maturity).getTime();
      }
      return 0;
    });
    return list;
  }, [filter, sortBy, sortDir]);

  const yieldCompare = BONDS.map((b) => ({
    name: b.name,
    gross: b.coupon,
    net: b.netYield,
    type: b.type,
  })).sort((a, b) => b.net - a.net);

  // Calculator
  const grossIncome = calcPrincipal * (selectedBond.coupon / 100);
  const whtAmount = grossIncome * (selectedBond.taxRate / 100);
  const netIncome = grossIncome - whtAmount;
  const compoundData = Array.from({ length: calcYears }, (_, i) => {
    const yr = i + 1;
    const gross = calcPrincipal * Math.pow(1 + selectedBond.coupon / 100, yr) - calcPrincipal;
    const net = calcPrincipal * Math.pow(1 + selectedBond.netYield / 100, yr) - calcPrincipal;
    return { year: `Year ${yr}`, gross: +gross.toFixed(0), net: +net.toFixed(0) };
  });

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortBy(col); setSortDir("desc"); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/40 via-slate-900 to-slate-950 border-b border-slate-800 px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/markets" className="text-slate-400 hover:text-white text-sm flex items-center gap-1">
              ← Markets
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-amber-400 text-sm font-semibold uppercase tracking-widest">Bonds & IFBs</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-2">
            Kenya Government Bonds
          </h1>
          <p className="text-slate-400 max-w-2xl">
            Fixed Rate Bonds (FXD) &amp; Infrastructure Finance Bonds (IFB) issued by the Central Bank of Kenya.
            Real-time yield data, maturity schedules, and after-tax return analysis.
          </p>
          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {[
              { label: "Best Net Yield", value: "18.46%", sub: "IFB1/2024 (WHT-free)", color: "text-emerald-400" },
              { label: "Active Bonds", value: "6", sub: "3 IFB · 3 FXD", color: "text-amber-400" },
              { label: "Min Investment", value: "KES 50K", sub: "FXD via CBK DhowCSD", color: "text-indigo-400" },
              { label: "IFB Tax Rate", value: "0%", sub: "WHT exempt by law", color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label} className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800">
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">{s.label}</p>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-slate-500 text-xs mt-1">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">

        {/* Yield Curve */}
        <section>
          <h2 className="text-xl font-black uppercase tracking-widest mb-6 text-amber-400">
            Kenya Yield Curve
          </h2>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <ResponsiveContainer minWidth={1} width="100%" height={260}>
              <LineChart data={YIELD_CURVE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="tenor" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis domain={[12, 20]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={10.00} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "CBR 10.00%", fill: "#f59e0b", fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="yield"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    return (
                      <circle
                        key={payload.tenor}
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill={payload.type === "IFB" ? "#10b981" : payload.type === "T-Bill" ? "#6366f1" : "#f59e0b"}
                        stroke="#0f172a"
                        strokeWidth={2}
                      />
                    );
                  }}
                  name="Yield"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-3 justify-center text-xs">
              {[["#6366f1", "T-Bill"], ["#f59e0b", "FXD Bond"], ["#10b981", "IFB (WHT-free)"]].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ background: c }} />
                  <span className="text-slate-400">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gross vs Net Yield Comparison */}
        <section>
          <h2 className="text-xl font-black uppercase tracking-widest mb-6 text-amber-400">
            Gross vs Net Yield — After WHT
          </h2>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <ResponsiveContainer minWidth={1} width="100%" height={240}>
              <BarChart data={yieldCompare} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" domain={[0, 22]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} width={110} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
                <Bar dataKey="gross" name="Gross Yield" fill="#f59e0b" radius={[0, 4, 4, 0]} opacity={0.6} />
                <Bar dataKey="net" name="Net Yield" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-slate-500 text-xs mt-3 text-center">
              IFB bonds (0% WHT) have identical gross &amp; net yields. FXD bonds lose 15% of coupon to WHT.
            </p>
          </div>
        </section>

        {/* Bond Registry Table */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-black uppercase tracking-widest text-amber-400">Bond Registry</h2>
            <div className="flex gap-2">
              {(["All", "IFB", "FXD"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                    filter === f
                      ? "bg-amber-500 text-black"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {[
                    { label: "Bond", key: null },
                    { label: "Type", key: null },
                    { label: "Coupon", key: "coupon" },
                    { label: "Net Yield", key: "netYield" },
                    { label: "WHT", key: null },
                    { label: "Tenor", key: null },
                    { label: "Maturity", key: "maturity" },
                    { label: "Min. Investment", key: null },
                    { label: "Action", key: null },
                  ].map((col) => (
                    <th
                      key={col.label}
                      onClick={() => col.key && toggleSort(col.key as any)}
                      className={`text-left px-4 py-3 text-slate-400 text-xs uppercase tracking-widest font-semibold ${
                        col.key ? "cursor-pointer hover:text-white" : ""
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {col.key === sortBy && (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((bond) => (
                  <tr
                    key={bond.id}
                    onClick={() => setSelectedBond(bond)}
                    className={`border-b border-slate-800/50 cursor-pointer transition-colors ${
                      selectedBond.id === bond.id ? "bg-amber-500/10" : "hover:bg-slate-800/50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{bond.name}</div>
                      <div className="text-slate-500 text-xs">{bond.isin}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        bond.isIFB ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {bond.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-amber-300">{bond.coupon.toFixed(2)}%</td>
                    <td className="px-4 py-3">
                      <span className="font-black text-emerald-400 font-mono">{bond.netYield.toFixed(2)}%</span>
                    </td>
                    <td className="px-4 py-3">
                      {bond.isIFB ? (
                        <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> 0%
                        </span>
                      ) : (
                        <span className="text-rose-400 text-xs">15%</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{bond.tenor}</td>
                    <td className="px-4 py-3 text-slate-300">{bond.maturity}</td>
                    <td className="px-4 py-3 text-slate-300">
                      KES {bond.minInvestment.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedBond(bond); }}
                        className="bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-black px-3 py-1 rounded-lg text-xs font-bold transition-all"
                      >
                        Analyse
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Selected Bond Deep Dive */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-black uppercase tracking-widest text-amber-400">
              Bond Deep Dive
            </h2>
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full text-sm font-bold">
              {selectedBond.name}
            </span>
            {selectedBond.isIFB && (
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Shield className="w-3 h-3" /> WHT-Free
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-slate-800 pb-2">
            {(["overview", "calculator", "howto", "faq"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-t-lg text-sm font-bold uppercase tracking-wide transition-all ${
                  activeTab === t
                    ? "bg-amber-500 text-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t === "howto" ? "How to Invest" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Price/Yield Chart */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
                  12-Month Price History
                </h3>
                <ResponsiveContainer minWidth={1} width="100%" height={220}>
                  <AreaChart data={selectedBond.monthlyData}>
                    <defs>
                      <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <YAxis domain={["auto", "auto"]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="price" stroke="#f59e0b" fill="url(#priceGrad)" strokeWidth={2} name="Price" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Yield Chart */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">
                  12-Month Yield Trend
                </h3>
                <ResponsiveContainer minWidth={1} width="100%" height={220}>
                  <LineChart data={selectedBond.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <YAxis domain={["auto", "auto"]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={2} dot={false} name="Yield %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Bond Metrics */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Bond Metrics</h3>
                <div className="space-y-3">
                  {[
                    { label: "Full Name", value: selectedBond.fullName },
                    { label: "ISIN", value: selectedBond.isin },
                    { label: "Issuer", value: selectedBond.issuer },
                    { label: "Coupon Rate", value: `${selectedBond.coupon}% p.a.`, hl: true },
                    { label: "Net Yield (after WHT)", value: `${selectedBond.netYield}% p.a.`, hl: true },
                    { label: "WHT Rate", value: selectedBond.isIFB ? "0% (Exempt)" : "15%", green: selectedBond.isIFB },
                    { label: "Tenor", value: selectedBond.tenor },
                    { label: "Maturity Date", value: selectedBond.maturity },
                    { label: "Coupon Frequency", value: "Semi-annual" },
                    { label: "Minimum Investment", value: `KES ${selectedBond.minInvestment.toLocaleString()}` },
                    { label: "Currency", value: selectedBond.currency },
                  ].map((m) => (
                    <div key={m.label} className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-slate-400 text-sm">{m.label}</span>
                      <span className={`text-sm font-semibold ${m.hl ? "text-amber-400 font-black" : m.green ? "text-emerald-400" : "text-white"}`}>
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Highlights</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">{selectedBond.description}</p>
                <div className="space-y-2 mb-6">
                  {selectedBond.highlights.map((h) => (
                    <div key={h} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-300">{h}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => handleOpenAssetModal(selectedBond.id)}
                    className="bg-amber-500 text-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-amber-400 transition-colors"
                  >
                    Invest Now
                  </button>
                  <button className="bg-slate-800 text-slate-300 border border-slate-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors">
                    Set Alert
                  </button>
                  <button className="bg-slate-800 text-slate-300 border border-slate-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" /> Watchlist
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "calculator" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6">
                <h3 className="font-bold uppercase tracking-widest text-slate-300">Return Calculator</h3>
                <div>
                  <label className="text-slate-400 text-xs uppercase tracking-widest block mb-2">
                    Principal (KES)
                  </label>
                  <input
                    type="number"
                    value={calcPrincipal}
                    onChange={(e) => setCalcPrincipal(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-lg focus:border-amber-500 outline-none"
                  />
                  <input
                    type="range"
                    min={50000}
                    max={10000000}
                    step={50000}
                    value={calcPrincipal}
                    onChange={(e) => setCalcPrincipal(Number(e.target.value))}
                    className="w-full mt-2 accent-amber-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>50K</span><span>10M</span>
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-xs uppercase tracking-widest block mb-2">
                    Investment Period (Years)
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    step={1}
                    value={calcYears}
                    onChange={(e) => setCalcYears(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <p className="text-amber-400 font-black text-2xl mt-1">{calcYears} yr{calcYears > 1 ? "s" : ""}</p>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-4 space-y-3 border border-slate-700">
                  {[
                    { label: "Principal", value: `KES ${calcPrincipal.toLocaleString()}` },
                    { label: "Annual Gross Income", value: `KES ${grossIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
                    { label: `WHT (${selectedBond.taxRate}%)`, value: `KES ${whtAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
                    { label: "Annual Net Income", value: `KES ${netIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, bold: true },
                    { label: `${calcYears}-Year Net Returns`, value: `KES ${compoundData[calcYears - 1]?.net.toLocaleString()}`, bold: true },
                  ].map((r) => (
                    <div key={r.label} className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">{r.label}</span>
                      <span className={`font-mono ${r.bold ? "text-emerald-400 font-black text-lg" : "text-slate-200"}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <h3 className="font-bold uppercase tracking-widest text-slate-300 mb-4">Compound Growth</h3>
                <ResponsiveContainer minWidth={1} width="100%" height={300}>
                  <AreaChart data={compoundData}>
                    <defs>
                      <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
                    <Area type="monotone" dataKey="gross" stroke="#f59e0b" fill="url(#grossGrad)" strokeWidth={2} name="Gross Returns" />
                    <Area type="monotone" dataKey="net" stroke="#10b981" fill="url(#netGrad)" strokeWidth={2} name="Net Returns" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === "howto" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <h3 className="font-bold uppercase tracking-widest text-amber-400 mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5" /> How to Invest via DhowCSD
                </h3>
                <div className="space-y-6">
                  {[
                    { step: "1", title: "Download DhowCSD App", desc: "Available on Google Play & App Store, or via web at dhowcsd.centralbank.go.ke. Register your investor profile." },
                    { step: "2", title: "Fund Your Account", desc: "Transfer a minimum of KES 50,000 for FXD bonds or KES 100,000 for IFBs from your commercial bank to your CBK account via RTGS/Pesalink." },
                    { step: "3", title: "Monitor Auction Calendar", desc: "CBK releases a monthly bond auction calendar. Submit competitive or non-competitive bids on auction day directly on the DhowCSD App." },
                    { step: "4", title: "Submit Your Bid", desc: "Navigate to 'Primary Market' on DhowCSD. Non-competitive bids accept the weighted average yield. Competitive bids specify your desired yield." },
                    { step: "5", title: "Allocation & Settlement", desc: "Results announced within 2 business days. If successful, your funds will be debited and the bond credited to your DhowCSD portfolio." },
                    { step: "6", title: "Receive Coupons", desc: "Semi-annual coupon payments are deposited automatically to your linked commercial bank account." },
                  ].map((s) => (
                    <div key={s.step} className="flex gap-4">
                      <div className="w-8 h-8 bg-emerald-500 text-slate-900 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                        {s.step}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{s.title}</p>
                        <p className="text-slate-400 text-sm mt-0.5">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-slate-800 flex gap-3">
                     <a href="https://dhowcsd.centralbank.go.ke" target="_blank" rel="noreferrer" className="flex-1 bg-amber-500 text-black px-4 py-3 rounded-xl font-black uppercase text-xs tracking-widest text-center hover:bg-amber-400 transition-all flex items-center justify-center gap-2">
                       Launch DhowCSD Web <ArrowRight className="w-4 h-4" />
                     </a>
                     <a className="flex-1 bg-slate-800 text-white px-4 py-3 rounded-xl font-bold text-xs tracking-widest text-center hover:bg-slate-700 transition-all flex items-center justify-center" href="https://play.google.com/store/apps/details?id=com.dhowcsd.app" target="_blank" rel="noreferrer">
                       Get Android App
                     </a>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-emerald-900/30 rounded-2xl border border-emerald-700/50 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-emerald-300 text-sm uppercase tracking-widest">IFB Tax Advantage</h3>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Infrastructure Finance Bonds (IFBs) are <strong className="text-emerald-400">fully exempt from Withholding Tax</strong> under
                    the Income Tax Act. A 18.46% gross yield on IFB1/2024 is also your net yield — you keep every shilling.
                  </p>
                  <div className="mt-3 bg-slate-900/60 rounded-xl p-3 text-xs font-mono">
                    <p className="text-slate-400">FXD1/2024 @ 16% gross</p>
                    <p className="text-rose-400">- WHT (15%): 2.4%</p>
                    <p className="text-emerald-400">= Net: 13.6%</p>
                    <p className="mt-2 text-slate-400">IFB1/2024 @ 18.46% gross</p>
                    <p className="text-emerald-400">- WHT (0%): 0%</p>
                    <p className="text-emerald-400 font-black">= Net: 18.46% ✓</p>
                  </div>
                </div>
                <div className="bg-indigo-900/30 rounded-2xl border border-indigo-700/50 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-indigo-300 text-sm uppercase tracking-widest">Where to Buy</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    {[
                      "CBK DhowCSD Portal (direct)",
                      "Commercial banks (KCB, Equity, Co-op)",
                      "Licensed stockbrokers (NSE members)",
                      "Investment banks & fund managers",
                      "Mobile platforms (e.g., M-Akiba)",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-slate-300">
                        <ArrowRight className="w-3 h-3 text-indigo-400" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "faq" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  q: "What is the minimum investment for government bonds?",
                  a: "KES 50,000 for Fixed Rate Treasury Bonds (FXD) and KES 100,000 for Infrastructure Finance Bonds (IFBs) via the CBK DhowCSD platform.",
                },
                {
                  q: "Are IFBs really WHT-exempt?",
                  a: "Yes. Under the Finance Act, IFBs are exempt from the 15% Withholding Tax on interest income, making them the highest net-yield instrument in Kenya's fixed income market.",
                },
                {
                  q: "How often are coupons paid?",
                  a: "Semi-annually (every 6 months). Coupons are credited directly to your registered bank account. The first coupon is paid 6 months after the bond issue date.",
                },
                {
                  q: "Can I sell my bond before maturity?",
                  a: "Yes. Government bonds are listed on the Nairobi Securities Exchange secondary market. You can sell via a licensed stockbroker, though prices may be above or below par value.",
                },
                {
                  q: "What happens if I hold to maturity?",
                  a: "At maturity, the full face value (principal) is returned to your account. You receive the last coupon payment simultaneously with the principal repayment.",
                },
                {
                  q: "How do competitive vs non-competitive bids work?",
                  a: "Non-competitive bids accept whatever yield the market sets (weighted average). Competitive bids specify a yield — bids priced too low are rejected by CBK.",
                },
                {
                  q: "Is my investment guaranteed?",
                  a: "Government of Kenya bonds carry sovereign credit risk — the GoK has never defaulted on domestic bonds. CBK directly administers payments, making default risk extremely low.",
                },
                {
                  q: "How do IFBs compare to MMFs?",
                  a: "IFBs offer higher net yields (18.46% vs ~17% for top MMFs) with 0% WHT, but require longer lock-in (10yr). MMFs offer daily liquidity. Optimal strategy: hold both.",
                },
              ].map((f) => (
                <div key={f.q} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                  <div className="flex items-start gap-2 mb-2">
                    <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-white text-sm font-bold">{f.q}</p>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed pl-6">{f.a}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Maturity Schedule */}
        <section>
          <h2 className="text-xl font-black uppercase tracking-widest mb-6 text-amber-400">
            Government Bond Maturity Schedule (KES Bn)
          </h2>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <ResponsiveContainer minWidth={1} width="100%" height={240}>
              <BarChart data={MATURITY_SCHEDULE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" name="Maturities (KES Bn)" fill="#f59e0b" radius={[4, 4, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-slate-500 text-xs mt-3 text-center">
              Source: CBK Debt Management. Figures represent total domestic bond maturities per year.
            </p>
          </div>
        </section>

        {/* AI Insights */}
        <section>
          <h2 className="text-xl font-black uppercase tracking-widest mb-6 text-amber-400">
            AI Market Insights
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: TrendingUp,
                color: "emerald",
                title: "IFB Yield Premium",
                insight:
                  "IFBs currently yield 4.86% more than equivalent FXD bonds on a net basis. This premium is structurally driven by WHT exemption and is likely to persist.",
              },
              {
                icon: Zap,
                color: "amber",
                title: "Rate Trajectory",
                insight:
                  "With CBR at 10.00%, bond yields remain elevated. Locking in today's 18.46% IFB rates while the cycle holds may prove advantageous before the next MPC cut.",
              },
              {
                icon: Shield,
                color: "indigo",
                title: "Portfolio Strategy",
                insight:
                  "A barbell approach (IFBs for yield + short T-Bills for liquidity) maximises risk-adjusted return. Avoid mid-tenor FXDs at current spread compression.",
              },
              {
                icon: AlertCircle,
                color: "rose",
                title: "Reinvestment Risk",
                insight:
                  "Long-tenor bonds (15yr) face reinvestment risk if rates fall. Semi-annual coupons reinvested at lower rates reduce effective yield vs stated coupon.",
              },
            ].map((c) => {
              const Icon = c.icon;
              const colorMap: Record<string, string> = {
                emerald: "border-emerald-700/50 bg-emerald-900/20",
                amber: "border-amber-700/50 bg-amber-900/20",
                indigo: "border-indigo-700/50 bg-indigo-900/20",
                rose: "border-rose-700/50 bg-rose-900/20",
              };
              const iconMap: Record<string, string> = {
                emerald: "text-emerald-400",
                amber: "text-amber-400",
                indigo: "text-indigo-400",
                rose: "text-rose-400",
              };
              return (
                <div key={c.title} className={`rounded-2xl border p-5 ${colorMap[c.color]}`}>
                  <Icon className={`w-5 h-5 mb-3 ${iconMap[c.color]}`} />
                  <p className={`text-sm font-bold mb-2 ${iconMap[c.color]}`}>{c.title}</p>
                  <p className="text-slate-300 text-xs leading-relaxed">{c.insight}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* WHT Reference Guide */}
        <section>
          <h2 className="text-xl font-black uppercase tracking-widest mb-6 text-amber-400">
            Withholding Tax Reference Guide
          </h2>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-700">
                  <th className="text-left px-5 py-3 text-slate-400 text-xs uppercase tracking-widest">Instrument</th>
                  <th className="text-left px-5 py-3 text-slate-400 text-xs uppercase tracking-widest">WHT Rate</th>
                  <th className="text-left px-5 py-3 text-slate-400 text-xs uppercase tracking-widest">Gross→Net (16%)</th>
                  <th className="text-left px-5 py-3 text-slate-400 text-xs uppercase tracking-widest">Key Note</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { inst: "IFB (Infrastructure Bond)", wht: "0%", net: "16.00%", note: "Fully WHT-exempt by statute", green: true },
                  { inst: "T-Bills (91/182/364d)", wht: "15%", net: "13.60%", note: "Discount treated as interest" },
                  { inst: "FXD Treasury Bonds", wht: "15%", net: "13.60%", note: "WHT deducted at coupon payment" },
                  { inst: "Money Market Funds", wht: "15%", net: "13.60%", note: "WHT on interest distributed" },
                  { inst: "Fixed Deposits", wht: "15%", net: "13.60%", note: "Bank deducts at interest payment" },
                  { inst: "NSE Dividends", wht: "5%", net: "15.20%", note: "Lower WHT for equity dividends" },
                ].map((r) => (
                  <tr key={r.inst} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3 text-white font-medium">{r.inst}</td>
                    <td className="px-5 py-3">
                      <span className={`font-bold ${r.green ? "text-emerald-400" : "text-rose-400"}`}>{r.wht}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`font-mono font-bold ${r.green ? "text-emerald-400" : "text-slate-300"}`}>{r.net}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-amber-900/40 to-slate-900 rounded-2xl border border-amber-700/40 p-8 text-center">
          <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-3">
            Ready to Invest in Kenya Government Bonds?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-6">
            Open your Sentil account and access IFBs, FXD bonds and the full fixed-income market in minutes.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/auth/register"
              className="bg-amber-500 text-black px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-amber-400 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/tools/compare"
              className="bg-slate-800 text-white border border-slate-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors"
            >
              Compare All Instruments
            </Link>
          </div>
        </section>

      </div>
      <AssetModal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} prefilledAsset={prefilledAsset} />
    </div>
  );
}
