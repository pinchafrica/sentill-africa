"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LineChart, Line, Legend, PieChart, Pie
} from "recharts";
import {
  TrendingUp, Shield, Zap, ChevronRight, CheckCircle,
  Building2, Percent, Users, Landmark, AlertCircle, ArrowUpRight, BarChart2, Plus, Info, Globe, ShieldCheck,
  Calculator, Home, Car, Briefcase, GraduationCap, Plane, Heart,
  Clock, DollarSign, Phone, Mail, MapPin, CreditCard, Wallet, Star,
  ChevronDown, ChevronUp, ArrowRight, Target, Crown, Banknote
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─── WANANDEGE SACCO DATA ────────────────────────────────────────────────────

const SACCO_INFO = {
  name: "Wanandege SACCO",
  slogan: "Your Partner in Financial Growth",
  founded: 1977,
  members: "15,000+",
  totalAssets: "KES 12.5 Billion",
  shareCapital: "KES 8.2 Billion",
  loanBook: "KES 10.8 Billion",
  branches: ["Nairobi (Head Office)", "Mombasa (MIA Terminal 2)"],
  sasraRegulated: true,
  ussdCode: "*882#",
  website: "https://wanandegesacco.com",
  email: "info@wanandegesacco.com",
  phone: ["+254 722 208557", "+254 780 208557", "+254 111 044900"],
  headOffice: "Wanandege Plaza, Off Old Airport North Road, Opposite Embakasi Police Station, Nairobi",
  eligibility: "Employees of Kenya Airways, JKIA, KAA, and aviation sector professionals",
};

const FINANCIAL_HIGHLIGHTS = [
  { year: "2020", assets: 8.2, deposits: 5.1, loans: 6.8, dividend: 13.0, depositInterest: 8.5 },
  { year: "2021", assets: 9.4, deposits: 5.9, loans: 7.6, dividend: 14.0, depositInterest: 9.0 },
  { year: "2022", assets: 10.5, deposits: 6.7, loans: 8.9, dividend: 14.5, depositInterest: 9.5 },
  { year: "2023", assets: 11.6, deposits: 7.5, loans: 9.8, dividend: 15.0, depositInterest: 10.0 },
  { year: "2024", assets: 12.5, deposits: 8.2, loans: 10.8, dividend: 15.0, depositInterest: 10.5 },
];

const ASSET_ALLOCATION = [
  { name: "Loans to Members", value: 68, color: "#10b981" },
  { name: "Government Securities", value: 15, color: "#0ea5e9" },
  { name: "Fixed Deposits", value: 8, color: "#6366f1" },
  { name: "Real Estate", value: 5, color: "#ec4899" },
  { name: "Other Investments", value: 4, color: "#f59e0b" },
];

interface LoanProduct {
  id: string;
  name: string;
  icon: any;
  maxAmount: string;
  interestRate: string;
  rateType: string;
  maxPeriod: string;
  security: string;
  features: string[];
  color: string;
  gradient: string;
}

const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: "super-loan",
    name: "Super Loan",
    icon: Crown,
    maxAmount: "KES 7,000,000",
    interestRate: "12%",
    rateType: "p.a. Reducing Balance",
    maxPeriod: "72 months",
    security: "3× Deposits Guarantee",
    features: ["Up to 3× deposits", "Flexible repayment", "Top-up available after 6 months", "Insurance cover included"],
    color: "text-emerald-600",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    id: "development-loan",
    name: "Development Loan",
    icon: Home,
    maxAmount: "KES 5,000,000",
    interestRate: "12%",
    rateType: "p.a. Reducing Balance",
    maxPeriod: "60 months",
    security: "2× Deposits + Collateral",
    features: ["Home improvement", "Property development", "Flexible security options", "Quick disbursement"],
    color: "text-blue-600",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "star-loan",
    name: "Star Loan",
    icon: Star,
    maxAmount: "KES 10,000,000",
    interestRate: "14%",
    rateType: "p.a. Reducing Balance",
    maxPeriod: "84 months",
    security: "Collateral-Based (Title Deed/Logbook)",
    features: ["High-value financing", "Collateral-based", "Extended repayment", "Competitive rates for secured loans"],
    color: "text-purple-600",
    gradient: "from-purple-500 to-violet-600",
  },
  {
    id: "business-loan",
    name: "Business Loan",
    icon: Briefcase,
    maxAmount: "KES 3,000,000",
    interestRate: "14.5%",
    rateType: "p.a. Reducing Balance",
    maxPeriod: "48 months",
    security: "Business Plan + Deposits",
    features: ["SME financing", "Working capital", "Business expansion", "Supplier financing"],
    color: "text-orange-600",
    gradient: "from-orange-500 to-amber-600",
  },
  {
    id: "makao-mortgage",
    name: "Wanandege Makao",
    icon: Home,
    maxAmount: "KES 10,000,000",
    interestRate: "9.5%",
    rateType: "p.a. Reducing Balance",
    maxPeriod: "180 months (15 yrs)",
    security: "Property Title + Insurance",
    features: ["Residential property purchase", "Lowest rate at 9.5%", "Up to 15-year repayment", "Title deed as security"],
    color: "text-rose-600",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    id: "salary-advance",
    name: "Salary Advance",
    icon: Banknote,
    maxAmount: "KES 200,000",
    interestRate: "10%",
    rateType: "reducing balance p.m.",
    maxPeriod: "1 month",
    security: "Salary Check-Off",
    features: ["Instant via *882#", "Same-day disbursement", "Auto-deducted from salary", "No guarantors required"],
    color: "text-teal-600",
    gradient: "from-teal-500 to-cyan-600",
  },
  {
    id: "airlift-loan",
    name: "Airlift Loan",
    icon: Plane,
    maxAmount: "KES 500,000",
    interestRate: "14%",
    rateType: "p.a. Reducing Balance",
    maxPeriod: "12 months",
    security: "Salary Check-Off",
    features: ["Emergency financing", "Quick processing", "No collateral needed", "Flexible repayment"],
    color: "text-sky-600",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    id: "school-fees",
    name: "School Fees Loan",
    icon: GraduationCap,
    maxAmount: "KES 1,000,000",
    interestRate: "12%",
    rateType: "p.a. Reducing Balance",
    maxPeriod: "12 months",
    security: "Deposits Guarantee",
    features: ["Education financing", "Paid directly to institution", "Covers all education levels", "Annual renewable"],
    color: "text-indigo-600",
    gradient: "from-indigo-500 to-blue-700",
  },
];

const SAVINGS_PRODUCTS = [
  {
    name: "Share Capital",
    minDeposit: "KES 5,000",
    returnRate: "15% Dividend (2024)",
    description: "Core ownership shares. Members must maintain minimum shares to remain in good standing and access loan products.",
    features: ["15% dividend on shares (2024)", "Voting rights at AGM", "Foundation for loan eligibility", "Non-withdrawable while active member"],
    color: "emerald",
  },
  {
    name: "Member Deposits",
    minDeposit: "KES 1,000",
    returnRate: "10.5% Interest (2024)",
    description: "Regular savings account earning competitive interest on weighted average basis, paid annually less withholding tax.",
    features: ["10.5% interest on deposits (2024)", "Weighted average calculation", "Partial withdrawals allowed", "Enhances loan eligibility (multiplier)"],
    color: "blue",
  },
  {
    name: "Holiday Savings",
    minDeposit: "KES 500",
    returnRate: "Locked until December",
    description: "Dedicated holiday savings plan locked until year-end for disciplined festive season planning.",
    features: ["Annual lock-in savings", "Released in December", "Builds holiday fund discipline", "Earns deposit interest"],
    color: "purple",
  },
  {
    name: "Junior Account",
    minDeposit: "KES 200",
    returnRate: "Interest bearing",
    description: "Savings account for children of Wanandege SACCO members, building financial literacy from a young age.",
    features: ["Children's savings", "Member-sponsored", "Builds savings habit", "Competitive interest rates"],
    color: "orange",
  },
];

// ─── CALCULATOR LOGIC ────────────────────────────────────────────────────────

function useLoanCalculator() {
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(12);
  const [tenure, setTenure] = useState(36);

  const result = useMemo(() => {
    const monthlyRate = rate / 12 / 100;
    const n = tenure;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, n) / (Math.pow(1 + monthlyRate, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - principal;
    return { emi: Math.round(emi), totalPayment: Math.round(totalPayment), totalInterest: Math.round(totalInterest) };
  }, [principal, rate, tenure]);

  return { principal, setPrincipal, rate, setRate, tenure, setTenure, ...result };
}

function useSavingsCalculator() {
  const [monthlyContrib, setMonthlyContrib] = useState(5000);
  const [dividendRate, setDividendRate] = useState(15);
  const [depositRate, setDepositRate] = useState(10.5);
  const [years, setYears] = useState(5);

  const result = useMemo(() => {
    let shareBalance = 0;
    let depositBalance = 0;
    let totalDividends = 0;
    let totalDepositInterest = 0;
    const yearlyData: { year: number; shares: number; deposits: number; dividends: number; total: number }[] = [];

    for (let y = 1; y <= years; y++) {
      shareBalance += monthlyContrib * 12 * 0.5;
      depositBalance += monthlyContrib * 12 * 0.5;
      const yearDividend = shareBalance * (dividendRate / 100);
      const yearDepInt = depositBalance * (depositRate / 100) * 0.85; // after 15% WHT
      totalDividends += yearDividend;
      totalDepositInterest += yearDepInt;
      shareBalance += yearDividend;
      depositBalance += yearDepInt;
      yearlyData.push({
        year: y,
        shares: Math.round(shareBalance),
        deposits: Math.round(depositBalance),
        dividends: Math.round(totalDividends + totalDepositInterest),
        total: Math.round(shareBalance + depositBalance),
      });
    }

    return {
      totalContributions: monthlyContrib * 12 * years,
      shareBalance: Math.round(shareBalance),
      depositBalance: Math.round(depositBalance),
      totalDividends: Math.round(totalDividends),
      totalDepositInterest: Math.round(totalDepositInterest),
      totalWealth: Math.round(shareBalance + depositBalance),
      yearlyData,
    };
  }, [monthlyContrib, dividendRate, depositRate, years]);

  return { monthlyContrib, setMonthlyContrib, dividendRate, setDividendRate, depositRate, setDepositRate, years, setYears, ...result };
}

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl text-[10px]">
      <p className="font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-800 pb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-6 py-1">
          <span className="font-bold text-slate-300">{p.name}</span>
          <span className="font-black text-white" style={{ color: p.color }}>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function WanandegeSaccoPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "loans" | "savings" | "calculators">("overview");
  const [expandedLoan, setExpandedLoan] = useState<string | null>(null);
  const loan = useLoanCalculator();
  const savings = useSavingsCalculator();
  const [selectedLoanProduct, setSelectedLoanProduct] = useState("super-loan");

  const activeLoan = LOAN_PRODUCTS.find(l => l.id === selectedLoanProduct) ?? LOAN_PRODUCTS[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-40">

      {/* ── PREMIUM HERO ── */}
      <div className="px-6 md:px-12 max-w-[1600px] mx-auto mb-12">
        <div className="relative overflow-hidden rounded-[3.5rem] bg-slate-950 p-12 md:p-20 shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />
          <div className="absolute top-8 right-8 w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Plane className="w-12 h-12 text-emerald-400" />
          </div>

          <div className="relative z-10 space-y-6 max-w-3xl">
            <div className="flex items-center gap-3 flex-wrap">
              <Link href="/markets/saccos" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                ← Back to SACCOs
              </Link>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">
                <Shield className="w-4 h-4" /> SASRA Regulated
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">
                <CheckCircle className="w-4 h-4" /> Est. {SACCO_INFO.founded}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9]">
              Wanandege <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">SACCO.</span>
            </h1>
            <p className="text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em] max-w-xl leading-relaxed">
              {SACCO_INFO.slogan} — Serving Kenya&apos;s aviation professionals since {SACCO_INFO.founded}. {SACCO_INFO.members} members strong.
            </p>
          </div>

          {/* Hero Stats */}
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              { label: "Dividend Rate", value: "15%", sub: "FY 2024", icon: Percent },
              { label: "Deposit Interest", value: "10.5%", sub: "p.a. weighted", icon: TrendingUp },
              { label: "Total Assets", value: "KES 12.5B", sub: "Dec 2024", icon: Landmark },
              { label: "Members", value: "15K+", sub: "Aviation sector", icon: Users },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl"
              >
                <stat.icon className="w-5 h-5 text-emerald-400 mb-3" />
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-xl font-black text-white tracking-tight">{stat.value}</p>
                <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 max-w-[1600px] mx-auto space-y-12">

        {/* ── TAB NAVIGATION ── */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit mx-auto">
          {([
            { key: "overview",     label: "Overview",          icon: BarChart2 },
            { key: "loans",        label: "Loan Products",     icon: CreditCard },
            { key: "savings",      label: "Savings & Deposits", icon: Wallet },
            { key: "calculators",  label: "Calculators",       icon: Calculator },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.key
                  ? "bg-slate-900 text-white shadow-lg"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════ TAB: OVERVIEW ══════════ */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">

            {/* Financial Performance Chart */}
            <div className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 flex flex-col min-h-[500px]">
                <div className="flex items-start justify-between mb-10">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">5-Year Financial Performance</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total assets, deposits & loan book in KES Billions</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    <TrendingUp className="w-4 h-4" /> +52% Growth
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={FINANCIAL_HIGHLIGHTS} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 900 }} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={v => `${v}B`} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 900 }} />
                      <RechartsTooltip content={<DarkTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", paddingTop: '20px', letterSpacing: '0.1em' }} />
                      <Bar dataKey="assets" name="Total Assets" fill="#10b981" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="loans" name="Loan Book" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="deposits" name="Deposits" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Asset Allocation Pie */}
              <div className="lg:col-span-4 bg-slate-950 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
                <div className="mb-6">
                  <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Portfolio Allocation
                  </h3>
                  <p className="text-2xl font-black text-white tracking-tight">Asset Mix</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">As a % of total asset base</p>
                </div>
                <div className="flex-1 w-full relative z-10">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={ASSET_ALLOCATION} innerRadius={60} outerRadius={85} paddingAngle={6} dataKey="value">
                        {ASSET_ALLOCATION.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '15px' }}
                        itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {ASSET_ALLOCATION.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{entry.name}</span>
                      </div>
                      <span className="text-[10px] font-black text-white">{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dividend vs Deposit Interest History */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Returns to Members</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Dividend on share capital vs interest on member deposits</p>
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={FINANCIAL_HIGHLIGHTS}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 900 }} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={v => v + "%"} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 900 }} domain={[6, 18]} />
                    <RechartsTooltip content={<DarkTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10, fontWeight: 900, textTransform: "uppercase", paddingTop: '20px', letterSpacing: '0.1em' }} />
                    <Line type="monotone" dataKey="dividend" name="Share Dividend %" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} />
                    <Line type="monotone" dataKey="depositInterest" name="Deposit Interest %" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Contact & Eligibility */}
            <div className="grid md:grid-cols-2 gap-10">
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-6">Contact & Branches</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                    <MapPin className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase">Head Office</p>
                      <p className="text-[11px] text-slate-600 mt-1">{SACCO_INFO.headOffice}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                    <Phone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase">Phone</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {SACCO_INFO.phone.map((p, i) => (
                          <span key={i} className="text-[11px] text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-100">{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl">
                    <Mail className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-black text-slate-900 uppercase">Email</p>
                      <p className="text-[11px] text-slate-600 mt-1">{SACCO_INFO.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <Zap className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-black text-emerald-800 uppercase">USSD Banking</p>
                      <p className="text-lg font-black text-emerald-600 mt-1">{SACCO_INFO.ussdCode}</p>
                      <p className="text-[10px] text-emerald-600 mt-1">Instant loans, balance checks, deposits</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-10 shadow-2xl text-white">
                <h3 className="text-lg font-black uppercase tracking-tighter mb-6">Why Wanandege?</h3>
                <div className="space-y-4">
                  {[
                    { icon: Percent, title: "15% Dividend Yield", desc: "Consistently higher than bank savings rates, paid annually on share capital" },
                    { icon: Shield, title: "SASRA Regulated", desc: "Fully compliant with Kenya's SACCO regulatory authority — deposits protected" },
                    { icon: Home, title: "9.5% Mortgage Rate", desc: "Lowest mortgage rate in the cooperative sector via Wanandege Makao product" },
                    { icon: Zap, title: "Instant via *882#", desc: "Access salary advances, check balances, and apply for loans from your phone" },
                    { icon: Users, title: "48-Year Track Record", desc: "Founded 1977, serving 15,000+ members across Kenya's aviation industry" },
                    { icon: Star, title: "10.5% on Deposits", desc: "Earn competitive interest on member deposits, paid on weighted average basis" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <item.icon className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black text-white uppercase">{item.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════ TAB: LOAN PRODUCTS ══════════ */}
        {activeTab === "loans" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center mb-4">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Loan Product Suite</h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2">{LOAN_PRODUCTS.length} products · rates from 9.5% to 14.5% p.a.</p>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              {LOAN_PRODUCTS.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className={`h-2 bg-gradient-to-r ${product.gradient}`} />
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center ${product.color}`}>
                        <product.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{product.interestRate} {product.rateType.includes("p.m") ? "p.m." : "p.a."}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{product.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">Up to {product.maxAmount}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400 font-bold">Max Period</span>
                        <span className="text-slate-900 font-black">{product.maxPeriod}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400 font-bold">Security</span>
                        <span className="text-slate-900 font-black text-right max-w-[160px]">{product.security}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedLoan(expandedLoan === product.id ? null : product.id)}
                      className="w-full flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 py-2 border-t border-slate-100 transition-colors"
                    >
                      {expandedLoan === product.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {expandedLoan === product.id ? "Hide Details" : "View Features"}
                    </button>
                    <AnimatePresence>
                      {expandedLoan === product.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-2 overflow-hidden"
                        >
                          {product.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-[10px] text-slate-600">
                              <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════ TAB: SAVINGS & DEPOSITS ══════════ */}
        {activeTab === "savings" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center mb-4">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Savings & Deposit Products</h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2">Build wealth through SACCO cooperative savings</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {SAVINGS_PRODUCTS.map((product, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                      product.color === "emerald" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                      product.color === "blue" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                      product.color === "purple" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                      "bg-orange-50 text-orange-700 border border-orange-100"
                    }`}>
                      {product.returnRate}
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Min: {product.minDeposit}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-3">{product.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6">{product.description}</p>
                  <div className="space-y-3">
                    {product.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-3 text-[11px] text-slate-700">
                        <CheckCircle className={`w-4 h-4 flex-shrink-0 ${
                          product.color === "emerald" ? "text-emerald-500" :
                          product.color === "blue" ? "text-blue-500" :
                          product.color === "purple" ? "text-purple-500" : "text-orange-500"
                        }`} />
                        <span className="font-semibold">{f}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════ TAB: CALCULATORS ══════════ */}
        {activeTab === "calculators" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">

            {/* LOAN CALCULATOR */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                    <Calculator className="w-6 h-6 text-emerald-600" />
                    Loan Repayment Calculator
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Estimate your monthly EMI and total cost</p>
                </div>
                <select
                  value={selectedLoanProduct}
                  onChange={(e) => {
                    setSelectedLoanProduct(e.target.value);
                    const p = LOAN_PRODUCTS.find(l => l.id === e.target.value);
                    if (p) loan.setRate(parseFloat(p.interestRate));
                  }}
                  className="text-[10px] font-black uppercase tracking-widest px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {LOAN_PRODUCTS.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.interestRate} {p.rateType.includes("p.m") ? "p.m." : "p.a."})</option>
                  ))}
                </select>
              </div>

              <div className="grid lg:grid-cols-2 gap-0">
                {/* Inputs */}
                <div className="p-10 space-y-8 border-r border-slate-100">
                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Loan Amount</label>
                      <span className="text-sm font-black text-slate-900">KES {loan.principal.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={50000}
                      max={10000000}
                      step={50000}
                      value={loan.principal}
                      onChange={(e) => loan.setPrincipal(parseInt(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1">
                      <span>KES 50K</span><span>KES 10M</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Interest Rate</label>
                      <span className="text-sm font-black text-emerald-600">{loan.rate}% p.a.</span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={18}
                      step={0.5}
                      value={loan.rate}
                      onChange={(e) => loan.setRate(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1">
                      <span>8%</span><span>18%</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Repayment Period</label>
                      <span className="text-sm font-black text-slate-900">{loan.tenure} months ({(loan.tenure / 12).toFixed(1)} yrs)</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={180}
                      step={1}
                      value={loan.tenure}
                      onChange={(e) => loan.setTenure(parseInt(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1">
                      <span>1 month</span><span>180 months</span>
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className="p-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-6">
                  <div className="text-center space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly Repayment (EMI)</p>
                    <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">
                      KES {loan.emi.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold">{activeLoan.name} · {activeLoan.interestRate} {activeLoan.rateType}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Payable</p>
                      <p className="text-lg font-black">KES {loan.totalPayment.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Interest</p>
                      <p className="text-lg font-black text-amber-400">KES {loan.totalInterest.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400 font-bold">Principal</span>
                      <span className="text-white font-black">KES {loan.principal.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full" style={{ width: `${(loan.principal / loan.totalPayment) * 100}%` }} />
                    </div>
                    <div className="flex justify-between text-[9px]">
                      <span className="text-emerald-400 font-bold">Principal: {((loan.principal / loan.totalPayment) * 100).toFixed(0)}%</span>
                      <span className="text-amber-400 font-bold">Interest: {((loan.totalInterest / loan.totalPayment) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SAVINGS / WEALTH CALCULATOR */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  Wealth Growth Projector
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Project your SACCO savings wealth with dividends and deposit interest compounding</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-0">
                {/* Inputs */}
                <div className="p-10 space-y-8 border-r border-slate-100">
                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Monthly Contribution</label>
                      <span className="text-sm font-black text-slate-900">KES {savings.monthlyContrib.toLocaleString()}</span>
                    </div>
                    <input type="range" min={1000} max={100000} step={1000} value={savings.monthlyContrib} onChange={(e) => savings.setMonthlyContrib(parseInt(e.target.value))} className="w-full accent-purple-600" />
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1"><span>KES 1K</span><span>KES 100K</span></div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Dividend Rate (Shares)</label>
                      <span className="text-sm font-black text-emerald-600">{savings.dividendRate}%</span>
                    </div>
                    <input type="range" min={5} max={25} step={0.5} value={savings.dividendRate} onChange={(e) => savings.setDividendRate(parseFloat(e.target.value))} className="w-full accent-emerald-600" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Deposit Interest Rate</label>
                      <span className="text-sm font-black text-blue-600">{savings.depositRate}%</span>
                    </div>
                    <input type="range" min={3} max={15} step={0.5} value={savings.depositRate} onChange={(e) => savings.setDepositRate(parseFloat(e.target.value))} className="w-full accent-blue-600" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Investment Period</label>
                      <span className="text-sm font-black text-slate-900">{savings.years} years</span>
                    </div>
                    <input type="range" min={1} max={30} step={1} value={savings.years} onChange={(e) => savings.setYears(parseInt(e.target.value))} className="w-full accent-purple-600" />
                    <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1"><span>1 year</span><span>30 years</span></div>
                  </div>
                </div>

                {/* Results */}
                <div className="p-10 bg-gradient-to-br from-purple-900 to-indigo-900 text-white space-y-6">
                  <div className="text-center space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-300">Projected Wealth in {savings.years} Years</p>
                    <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                      KES {savings.totalWealth.toLocaleString()}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                      <p className="text-[9px] font-black text-purple-300 uppercase tracking-widest mb-1">Your Contributions</p>
                      <p className="text-sm font-black">KES {savings.totalContributions.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                      <p className="text-[9px] font-black text-emerald-300 uppercase tracking-widest mb-1">Total Earned</p>
                      <p className="text-sm font-black text-emerald-400">KES {(savings.totalDividends + savings.totalDepositInterest).toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                      <p className="text-[9px] font-black text-purple-300 uppercase tracking-widest mb-1">Share Balance</p>
                      <p className="text-sm font-black">KES {savings.shareBalance.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                      <p className="text-[9px] font-black text-purple-300 uppercase tracking-widest mb-1">Deposit Balance</p>
                      <p className="text-sm font-black">KES {savings.depositBalance.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Growth Chart */}
                  <div className="h-[200px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={savings.yearlyData}>
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: "#a78bfa", fontSize: 10, fontWeight: 900 }} tickFormatter={v => `Y${v}`} />
                        <YAxis hide />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: '#1e1b4b', borderColor: '#312e81', borderRadius: '15px' }}
                          itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                          formatter={(v: number) => `KES ${v.toLocaleString()}`}
                        />
                        <Bar dataKey="shares" name="Shares" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="deposits" name="Deposits" stackId="a" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
