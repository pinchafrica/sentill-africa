"use client";
import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";
import {
  TrendingUp, Shield, Star, Calculator, Clock, CheckCircle, ArrowRight,
  ServerCog, Info, Zap, AlertTriangle, ChevronDown, ChevronUp, TrendingDown,
  BarChart3, FileText, DollarSign, Calendar
} from "lucide-react";
import Link from "next/link";
import { useAIStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

/* ── DATA ── */
const TBILLS = [
  {
    id: "tbill-91",
    name: "91-Day T-Bill",
    tenor: "91 Days",
    auctionYield: 15.82,
    netYield: 13.44,
    duration: 3,
    minInvestment: 100000,
    wht: 15,
    risk: "Very Low",
    riskScore: 8,
    liquidity: "Weekly",
    cbkCode: "T91/2025",
    features: ["Highest Liquidity", "Weekly rollover strategy", "Short-term cash parking", "WHT 15% applies"],
    ratesHistory: [
      { month: "Sep", yield: 16.05, net: 13.64 }, { month: "Oct", yield: 15.98, net: 13.58 },
      { month: "Nov", yield: 15.90, net: 13.52 }, { month: "Dec", yield: 15.85, net: 13.47 },
      { month: "Jan", yield: 15.80, net: 13.43 }, { month: "Feb", yield: 15.82, net: 13.44 }
    ],
    bidStats: [
      { auction: "Wk 1 Feb", offered: 24, received: 31.2, accepted: 24 },
      { auction: "Wk 2 Feb", offered: 24, received: 28.5, accepted: 24 },
      { auction: "Wk 3 Feb", offered: 24, received: 35.1, accepted: 24 },
      { auction: "Wk 4 Feb", offered: 24, received: 29.8, accepted: 24 },
    ],
    description: "The most liquid sovereign instrument in Kenya. Auctioned every Thursday at the CBK, with maturity in 91 calendar days. Purchased at a discount to face value. Ideal for short-term cash management and as an emergency liquidity buffer within a portfolio.",
    useCases: ["Emergency fund returns", "Monthly salary parking", "Bridging capital pre-bond-auction", "Low-risk anchor in aggressive portfolios"],
    risks: ["Reinvestment risk at maturity", "WHT deducted at source", "Rates move with CBR policy changes"],
  },
  {
    id: "tbill-182",
    name: "182-Day T-Bill",
    tenor: "182 Days",
    auctionYield: 16.10,
    netYield: 13.68,
    duration: 6,
    minInvestment: 100000,
    wht: 15,
    risk: "Very Low",
    riskScore: 8,
    liquidity: "Weekly",
    cbkCode: "T182/2025",
    features: ["6-month yield lock", "Predictable rollover schedule", "Higher yield than 91-day", "WHT 15% applies"],
    ratesHistory: [
      { month: "Sep", yield: 16.30, net: 13.86 }, { month: "Oct", yield: 16.25, net: 13.81 },
      { month: "Nov", yield: 16.15, net: 13.73 }, { month: "Dec", yield: 16.10, net: 13.69 },
      { month: "Jan", yield: 16.05, net: 13.64 }, { month: "Feb", yield: 16.10, net: 13.69 }
    ],
    bidStats: [
      { auction: "Wk 1 Feb", offered: 10, received: 14.5, accepted: 10 },
      { auction: "Wk 2 Feb", offered: 10, received: 13.2, accepted: 10 },
      { auction: "Wk 3 Feb", offered: 10, received: 16.8, accepted: 10 },
      { auction: "Wk 4 Feb", offered: 10, received: 12.4, accepted: 10 },
    ],
    description: "Semi-annual treasury bill offering a balance between liquidity and yield. Priced weekly alongside the 91-day T-bill at CBK auctions. Useful for investors seeking 6-month visibility without locking into a multi-year bond.",
    useCases: ["Quarterly dividend income strategy", "Semi-annual working capital cycle", "Tax provision parking", "Sacco reserve fund allocation"],
    risks: ["Moderate reinvestment risk", "Susceptible to mid-term policy rate shifts", "WHT reduces headline yield by ~2.4%"],
  },
  {
    id: "tbill-364",
    name: "364-Day T-Bill",
    tenor: "364 Days",
    auctionYield: 16.45,
    netYield: 13.98,
    duration: 12,
    minInvestment: 100000,
    wht: 15,
    risk: "Low",
    riskScore: 9,
    liquidity: "Weekly",
    cbkCode: "T364/2025",
    features: ["Highest T-Bill yield", "Annual certainty", "Benchmark rate instrument", "WHT 15% applies"],
    ratesHistory: [
      { month: "Sep", yield: 16.70, net: 14.20 }, { month: "Oct", yield: 16.65, net: 14.15 },
      { month: "Nov", yield: 16.55, net: 14.07 }, { month: "Dec", yield: 16.50, net: 14.03 },
      { month: "Jan", yield: 16.40, net: 13.94 }, { month: "Feb", yield: 16.45, net: 13.98 }
    ],
    bidStats: [
      { auction: "Wk 1 Feb", offered: 10, received: 18.6, accepted: 10 },
      { auction: "Wk 2 Feb", offered: 10, received: 15.9, accepted: 10 },
      { auction: "Wk 3 Feb", offered: 10, received: 22.1, accepted: 10 },
      { auction: "Wk 4 Feb", offered: 10, received: 17.4, accepted: 10 },
    ],
    description: "The longest-tenor treasury bill at 364 days offers the highest T-Bill yield and serves as a near-substitute for short-term bonds. Auctioned weekly. Preferred by pension funds and SACCOs for its predictable 12-month return profile.",
    useCases: ["Annual income planning", "SACCO & Chama fixed reserve", "Short-term bond substitute", "Capital preservation with stable return"],
    risks: ["12-month rate lock-in risk", "Opportunity cost if rates rise mid-year", "WHT deducted quarterly on equivalent basis"],
  }
];

const YIELD_CURVE = [
  { tenor: "91d", yield: 15.82, net: 13.44 },
  { tenor: "182d", yield: 16.10, net: 13.69 },
  { tenor: "364d", yield: 16.45, net: 13.98 },
  { tenor: "2yr Bond", yield: 15.80, net: 13.43 },
  { tenor: "5yr FXD", yield: 16.00, net: 13.60 },
  { tenor: "10yr IFB", yield: 18.46, net: 18.46 },
];

const HISTORICAL_CBR = [
  { date: "Jul 24", cbr: 13.0, t91: 15.42, t182: 15.85, t364: 16.20 },
  { date: "Aug 24", cbr: 13.0, t91: 15.30, t182: 15.70, t364: 16.10 },
  { date: "Sep 24", cbr: 12.75, t91: 15.60, t182: 16.00, t364: 16.38 },
  { date: "Oct 24", cbr: 12.75, t91: 15.50, t182: 15.95, t364: 16.30 },
  { date: "Nov 24", cbr: 12.0, t91: 15.40, t182: 15.88, t364: 16.22 },
  { date: "Dec 24", cbr: 11.25, t91: 15.20, t182: 15.70, t364: 16.05 },
  { date: "Jan 25", cbr: 11.25, t91: 15.45, t182: 15.88, t364: 16.25 },
  { date: "Feb 25", cbr: 10.75, t91: 15.82, t182: 16.10, t364: 16.45 },
];

const RADAR_DATA = [
  { metric: "Yield", t91: 72, t182: 78, t364: 82 },
  { metric: "Liquidity", t91: 98, t182: 88, t364: 75 },
  { metric: "Safety", t91: 99, t182: 99, t364: 97 },
  { metric: "Predictability", t91: 85, t182: 90, t364: 95 },
  { metric: "Entry Ease", t91: 92, t182: 92, t364: 92 },
  { metric: "Tax Efficiency", t91: 40, t182: 40, t364: 40 },
];

const UPCOMING_AUCTIONS = [
  { date: "Mar 27, 2025", day: "Thursday", t91: "KES 24B", t182: "KES 10B", t364: "KES 10B", status: "Open" },
  { date: "Apr 03, 2025", day: "Thursday", t91: "KES 24B", t182: "KES 10B", t364: "KES 10B", status: "Upcoming" },
  { date: "Apr 10, 2025", day: "Thursday", t91: "KES 24B", t182: "KES 10B", t364: "KES 10B", status: "Upcoming" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl text-white">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-black" style={{ color: p.color }}>
            {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) + "%" : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function TreasuriesPage() {
  const [selectedBill, setSelectedBill] = useState(TBILLS[2]);
  const [principal, setPrincipal] = useState(500000);
  const [activeTab, setActiveTab] = useState<"overview" | "calculator" | "auctions" | "compare">("calculator");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { setAssetModalOpen, setPrefilledAsset, setChatOpen } = useAIStore();

  const calc = useMemo(() => {
    const safeP = Math.max(principal || 0, 0);
    const annualReturn = safeP * (selectedBill.auctionYield / 100);
    const grossReturn = annualReturn * (selectedBill.duration / 12);
    const tax = grossReturn * 0.15;
    const netReturn = grossReturn - tax;
    const purchasePrice = safeP - grossReturn;
    const effectiveRate = purchasePrice > 0 ? (netReturn / purchasePrice) * (12 / selectedBill.duration) * 100 : 0;
    const compoundYears = Array.from({ length: 5 }, (_, i) => {
      const yr = i + 1;
      const gross = safeP * Math.pow(1 + selectedBill.auctionYield / 100, yr) - safeP;
      const net = safeP * Math.pow(1 + selectedBill.netYield / 100, yr) - safeP;
      return { year: `Yr ${yr}`, gross: Math.round(gross), net: Math.round(net) };
    });
    return { grossReturn, tax, netReturn, purchasePrice, effectiveRate, compoundYears };
  }, [principal, selectedBill]);

  const FAQS = [
    { q: "Can I sell T-Bills before maturity?", a: "Yes. Treasury Bills can be sold in the secondary market on the Nairobi Securities Exchange (NSE) Fixed Income Segment. However, the price you receive depends on prevailing market yields — if rates have risen since you bought, you may receive less than face value." },
    { q: "How does the T-Bill discount mechanism work?", a: "T-Bills are zero-coupon instruments. You bid at a discount (i.e., pay less than face value) and receive the full face value at maturity. The difference is your return. For example, a KES 100,000 face-value 91-day T-Bill at 15.82% yield means you pay roughly KES 96,124 today and receive KES 100,000 in 91 days." },
    { q: "What is the 15% Withholding Tax on T-Bills?", a: "The Kenya Revenue Authority charges 15% WHT on the interest (discount) income earned on T-Bills for Kenyan residents. This is deducted at source by CBK before you receive your proceeds. For IFBs (infrastructure bonds) the WHT is 0%." },
    { q: "What is a non-competitive bid?", a: "A non-competitive bid allows you to participate in the auction without specifying a yield rate. You accept the weighted average yield determined by the CBK from competitive bids. This is the recommended approach for retail investors — you're guaranteed allocation up to the offered amount, and you get market rates." },
    { q: "Who can invest in Kenya T-Bills?", a: "Any individual or institution — Kenyan citizens, registered companies, pension funds, SACCOs, charities, and even diaspora investors — can invest. You need a DhowCSD account (Central Bank's platform) or can access through a licensed commercial bank or stockbroker." },
    { q: "Are T-Bills safe during CBK rate changes?", a: "Yes. Unlike bonds, T-Bills have very short tenors, so interest rate risk is minimal. If rates rise, you simply reinvest at the new higher rate at maturity. The sovereign guarantee means there is virtually zero default risk." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">

      {/* ── HEADER ── */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-900 px-6 py-16 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/markets" className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-white transition-colors">← Markets</Link>
            <span className="text-slate-600">/</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Treasury Bills</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-12">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-6">
                <CheckCircle className="w-3.5 h-3.5" /> CBK Sovereign-Backed · Weekly Auctions
              </div>
              <h1 className="text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-4 leading-none">
                Kenya<br /><span className="text-emerald-400">Treasury Bills</span>
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed font-medium">
                The gold standard for capital preservation. Short-term sovereign debt instruments backed by the Republic of Kenya. Zero default risk, weekly liquidity windows, and predictable after-tax returns.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: "Best Yield", value: "16.45%", sub: "364-Day T-Bill", color: "text-emerald-400" },
                { label: "Net of WHT", value: "13.98%", sub: "After 15% Tax", color: "text-white" },
                { label: "Auction Freq.", value: "Weekly", sub: "Every Thursday", color: "text-amber-400" },
                { label: "Min. Entry", value: "KES 100K", sub: "Face Value", color: "text-indigo-300" },
              ].map((s, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">{s.label}</p>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] text-slate-400 font-bold mt-1">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div className="bg-white border-b border-slate-200 sticky top-[176px] lg:top-[108px] z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-0 overflow-x-auto scrollbar-none">
            {([
              { key: "calculator", label: "🧮 Calculator" },
              { key: "overview",   label: "📊 Charts" },
              { key: "auctions",   label: "📅 Auctions" },
              { key: "compare",    label: "⚖️ Compare" },
            ] as const).map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`px-4 sm:px-6 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                  activeTab === t.key
                    ? "border-emerald-500 text-emerald-600 bg-emerald-50/60"
                    : "border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">

        {/* ── BILL SELECTOR ── */}
        <div className="grid sm:grid-cols-3 gap-5">
          {TBILLS.map(bill => (
            <motion.div
              key={bill.id}
              whileHover={{ y: -3 }}
              onClick={() => setSelectedBill(bill)}
              className={`bg-white rounded-[2rem] p-7 border-2 cursor-pointer transition-all shadow-sm ${selectedBill.id === bill.id ? "border-emerald-500 shadow-xl ring-4 ring-emerald-50" : "border-slate-100 hover:border-emerald-200"}`}
            >
              <div className="flex items-center justify-between mb-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedBill.id === bill.id ? "bg-emerald-500" : "bg-slate-100"}`}>
                  <Clock className={`w-5 h-5 ${selectedBill.id === bill.id ? "text-white" : "text-slate-500"}`} />
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{bill.cbkCode}</span>
              </div>
              <h3 className="font-black text-slate-900 text-xl uppercase tracking-tight mb-1">{bill.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">Min. KES 100K · WHT 15%</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Gross Yield</p>
                  <p className="text-xl font-black text-emerald-600">{bill.auctionYield}%</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Net Yield</p>
                  <p className="text-xl font-black text-emerald-700">{bill.netYield}%</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── SELECTED BILL DETAIL ── */}
        <AnimatePresence mode="wait">
          <motion.div key={selectedBill.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-950 to-slate-900 p-8 text-white">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">{selectedBill.tenor} Sovereign Treasury Instrument</p>
                  <h2 className="text-3xl font-black uppercase tracking-tight">{selectedBill.name}</h2>
                  <p className="text-slate-300 text-sm mt-2 max-w-xl leading-relaxed">{selectedBill.description}</p>
                </div>
                <div className="flex gap-4 shrink-0">
                  <div className="bg-white/10 rounded-2xl p-5 border border-white/20 text-center">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">Gross Auction Yield</p>
                    <p className="text-4xl font-black text-emerald-400">{selectedBill.auctionYield}%</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-5 border border-white/20 text-center">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-2">Net After 15% WHT</p>
                    <p className="text-4xl font-black text-white">{selectedBill.netYield}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 grid md:grid-cols-3 gap-6">
              {/* Use Cases */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" />Best For</h4>
                {selectedBill.useCases.map((u, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                    <p className="text-[11px] font-bold text-slate-700 leading-relaxed">{u}</p>
                  </div>
                ))}
              </div>
              {/* Risks */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 text-amber-500" />Key Risks</h4>
                {selectedBill.risks.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                    <p className="text-[11px] font-bold text-slate-700 leading-relaxed">{r}</p>
                  </div>
                ))}
              </div>
              {/* Features */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-indigo-500" />Key Features</h4>
                {selectedBill.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <CheckCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <p className="text-[11px] font-bold text-slate-700">{f}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="space-y-10">

            {/* Rate History Chart */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">6-Month Rate History — {selectedBill.name}</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gross Auction Yield vs Net After WHT · Last 6 Auctions</p>
                </div>
                <BarChart3 className="w-5 h-5 text-slate-300" />
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={selectedBill.ratesHistory}>
                  <defs>
                    <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} tickFormatter={v => v.toFixed(1) + "%"} tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="yield" name="Gross Yield" stroke="#10b981" fill="url(#grossGrad)" strokeWidth={2.5} dot={{ r: 4, fill: "#10b981" }} />
                  <Area type="monotone" dataKey="net" name="Net Yield" stroke="#6366f1" fill="url(#netGrad)" strokeWidth={2} dot={{ r: 3, fill: "#6366f1" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Full Yield Curve */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Kenya Full Yield Curve</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">T-Bills · FXD Bonds · IFBs — Gross vs Net Yield</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={YIELD_CURVE}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="tenor" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
                  <YAxis domain={[12, 20]} tickFormatter={v => `${v}%`} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={10.75} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "CBR 10.75%", fill: "#f59e0b", fontSize: 9, fontWeight: 700 }} />
                  <Legend />
                  <Line type="monotone" dataKey="yield" name="Gross Yield" stroke="#10b981" strokeWidth={2.5} dot={{ r: 5, fill: "#10b981" }} />
                  <Line type="monotone" dataKey="net" name="Net Yield" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: "#6366f1" }} strokeDasharray="5 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* CBR vs T-Bill Correlation */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">CBR vs T-Bill Rate Correlation</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">How CBK monetary policy drives auction yields · 8-Month view</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={HISTORICAL_CBR}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
                  <YAxis domain={[10, 18]} tickFormatter={v => `${v}%`} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="cbr" name="CBR Policy Rate" stroke="#ef4444" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="t91" name="91-Day" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="t182" name="182-Day" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="t364" name="364-Day" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Auction Bid Stats */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">February Bid Coverage — {selectedBill.name}</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Offered vs Received vs Accepted · KES Billions</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={selectedBill.bidStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="auction" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
                  <YAxis tickFormatter={v => `${v}B`} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="offered" name="Offered (B)" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="received" name="Bids Received (B)" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.8} />
                  <Bar dataKey="accepted" name="Accepted (B)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Step Guide */}
            <div className="bg-slate-900 text-white rounded-[2rem] p-10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 blur-[80px] rounded-full" />
              <h3 className="font-black text-emerald-400 uppercase tracking-widest mb-8 flex items-center gap-2 text-sm">
                <ServerCog className="w-5 h-5" /> How to Invest via DhowCSD — Step by Step
              </h3>
              <div className="grid md:grid-cols-2 gap-x-10 gap-y-6 relative z-10">
                {[
                  { step: "1", title: "Create DhowCSD Account", desc: "Go to dhowcsd.centralbank.go.ke or download the mobile app. Register with your National ID, KRA PIN, and bank details. Approval takes 1–3 business days." },
                  { step: "2", title: "Fund via RTGS or Pesalink", desc: "Transfer KES 100,000 minimum from your commercial bank to CBK. Use RTGS for same-day transfers above KES 1M, or Pesalink for smaller amounts." },
                  { step: "3", title: "Select T-Bill Type", desc: "Navigate to 'Primary Market' → Select 'Treasury Bills'. Choose your tenor: 91, 182, or 364-day. Note the face value (what you'll receive at maturity)." },
                  { step: "4", title: "Submit Non-Competitive Bid", desc: "Select 'Non-Competitive' bid type. Enter your face value amount. You'll automatically receive the weighted average yield set by CBK — no guesswork." },
                  { step: "5", title: "Auction Results (Monday)", desc: "Results are announced the following Monday. If accepted, your account is debited and the T-Bill credited to your portfolio. Non-competitive bids are almost always fully allocated." },
                  { step: "6", title: "Rollover at Maturity", desc: "On maturity date, your net proceeds (face value minus 15% WHT on discount) are credited to your account. Choose to rollover into the next auction or withdraw." },
                ].map((s, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 bg-emerald-500 text-slate-900 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.4)]">{s.step}</div>
                    <div>
                      <p className="font-black text-white text-sm">{s.title}</p>
                      <p className="text-slate-400 text-sm mt-0.5 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                <a href="https://dhowcsd.centralbank.go.ke" target="_blank" rel="noreferrer"
                  className="flex-1 bg-emerald-500 text-slate-900 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest text-center hover:bg-emerald-400 transition-all flex items-center justify-center gap-2">
                  Launch DhowCSD Web <ArrowRight className="w-4 h-4" />
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.dhowcsd.app" target="_blank" rel="noreferrer"
                  className="flex-1 border border-slate-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest text-center hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                  Download Android App
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── CALCULATOR TAB ── */}
        {activeTab === "calculator" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-1">T-Bill Return Calculator</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Based on {selectedBill.name} at {selectedBill.auctionYield}%</p>
              </div>
              <div>
                <label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block mb-2">Face Value (KES)</label>
                <input type="number" value={principal} onChange={e => setPrincipal(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-black text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <input type="range" min={100000} max={10000000} step={100000} value={principal}
                  onChange={e => setPrincipal(Number(e.target.value))}
                  className="w-full mt-3 accent-emerald-500" />
                <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1">
                  <span>100K</span><span>10M</span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Gross Discount Earned", value: `KES ${Math.round(calc.grossReturn).toLocaleString()}`, color: "text-slate-900" },
                  { label: "15% WHT Deducted", value: `− KES ${Math.round(calc.tax).toLocaleString()}`, color: "text-rose-600" },
                  { label: "Price You Pay Today", value: `KES ${Math.round(calc.purchasePrice).toLocaleString()}`, color: "text-blue-600" },
                  { label: "Net Return at Maturity", value: `KES ${Math.round(calc.netReturn).toLocaleString()}`, color: "text-emerald-700", bold: true },
                  { label: "Effective Annual Rate", value: `${calc.effectiveRate.toFixed(2)}% p.a.`, color: "text-emerald-600", bold: true },
                ].map((row, i) => (
                  <div key={i} className={`flex justify-between items-center p-4 rounded-xl ${row.bold ? "bg-emerald-50 border border-emerald-200" : "bg-slate-50 border border-slate-100"}`}>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{row.label}</span>
                    <span className={`text-sm font-black ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => { setPrefilledAsset(selectedBill.id); setAssetModalOpen(true); }}
                  className="w-full bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-xl hover:bg-emerald-600 transition-colors">
                  Add to Portfolio Sandbox
                </button>
                <button onClick={() => setChatOpen(true)}
                  className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-black text-[10px] uppercase tracking-widest py-4 rounded-xl hover:bg-emerald-100 transition-colors">
                  Ask AI — Compare T-Bills vs MMFs
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-5">5-Year Compound Reinvestment Growth</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={calc.compoundYears}>
                    <defs>
                      <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
                    <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}K`} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="gross" name="Gross Income" stroke="#f59e0b" fill="none" strokeWidth={2} dot={{ r: 4 }} />
                    <Area type="monotone" dataKey="net" name="Net Income" stroke="#10b981" fill="url(#cg)" strokeWidth={2.5} dot={{ r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-5">Instrument Radar — {selectedBill.name}</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={RADAR_DATA} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 8 }} />
                    <Radar name={selectedBill.name}
                      dataKey={selectedBill.id === "tbill-91" ? "t91" : selectedBill.id === "tbill-182" ? "t182" : "t364"}
                      stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ── AUCTIONS TAB ── */}
        {activeTab === "auctions" && (
          <div className="space-y-8">
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Upcoming T-Bill Auction Schedule</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">CBK Weekly Auctions — Thursdays 2:00 PM EAT</p>
                </div>
              </div>
              <div className="space-y-4">
                {UPCOMING_AUCTIONS.map((a, i) => (
                  <div key={i} className={`p-6 rounded-2xl border ${a.status === "Open" ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[11px] ${a.status === "Open" ? "bg-emerald-500 text-white" : "bg-slate-300 text-slate-600"}`}>
                          {a.status === "Open" ? "LIVE" : `Wk${i + 2}`}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{a.day}, {a.date}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{a.status === "Open" ? "Bids close 2:00 PM EAT today" : "Pending"}</p>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        {[["91-Day", a.t91], ["182-Day", a.t182], ["364-Day", a.t364]].map(([label, val]) => (
                          <div key={label} className="text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                            <p className="text-sm font-black text-slate-900">{val}</p>
                          </div>
                        ))}
                      </div>
                      {a.status === "Open" && (
                        <a href="https://dhowcsd.centralbank.go.ke" target="_blank" rel="noreferrer"
                          className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-400 transition-all text-center">
                          Bid Now →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[11px] font-bold text-amber-800 leading-relaxed">
                  Results are announced the following Monday. Non-competitive bids at the weighted average yield are generally fully allocated. Funds are settled on the same Monday.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── COMPARE TAB ── */}
        {activeTab === "compare" && (
          <div className="space-y-8">
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-6 pb-4 border-b border-slate-100">All 3 T-Bills vs CBR — Gross Yield Comparison</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={[
                  { name: "CBR Rate", rate: 10.75 },
                  { name: "91-Day T-Bill", rate: 15.82, net: 13.44 },
                  { name: "182-Day T-Bill", rate: 16.10, net: 13.69 },
                  { name: "364-Day T-Bill", rate: 16.45, net: 13.98 },
                  { name: "Best MMF (Etica)", rate: 17.5, net: 14.88 },
                  { name: "IFB (10yr)", rate: 18.46, net: 18.46 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
                  <YAxis domain={[0, 20]} tickFormatter={v => `${v}%`} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="rate" name="Gross Yield" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="net" name="Net Yield" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm">
              <div className="p-8 border-b border-slate-100">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Detailed Instrument Comparison Table</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["Feature", "91-Day T-Bill", "182-Day T-Bill", "364-Day T-Bill"].map(h => (
                        <th key={h} className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      ["Gross Yield", "15.82%", "16.10%", "16.45%"],
                      ["Net Yield (WHT 15%)", "13.44%", "13.69%", "13.98%"],
                      ["Tenor", "91 Days", "182 Days", "364 Days"],
                      ["Min. Investment", "KES 100,000", "KES 100,000", "KES 100,000"],
                      ["WHT Rate", "15%", "15%", "15%"],
                      ["Liquidity", "Very High (weekly)", "High (weekly)", "Moderate (annual)"],
                      ["Auction Frequency", "Every Thursday", "Every Thursday", "Every Thursday"],
                      ["Best For", "Short-term cash", "6-month lock", "Annual income"],
                      ["Rate Risk", "Very Low", "Low", "Moderate"],
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">{row[0]}</td>
                        {row.slice(1).map((val, j) => (
                          <td key={j} className={`px-6 py-4 text-sm font-black ${j === 2 ? "text-emerald-600" : "text-slate-800"}`}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── FAQ ── */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm mb-8 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-500" /> Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-black text-slate-900">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
