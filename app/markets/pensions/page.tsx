"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { ArrowLeft, ShieldCheck, Activity, Globe, Briefcase, Users, Star, Building2, TrendingUp, Landmark, PieChart, ChevronRight, Calculator, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip } from "recharts";
import AssetModal from "@/components/AssetModal";

const PENSION_PROVIDERS = [
  {
    id: "enwealth",
    name: "Enwealth Financial Services",
    type: "Umbrella & IPP",
    desc: "A leading pension administrator offering innovative retirement benefits schemes with consistently high declared yields.",
    icon: Building2,
    color: "#1e40af", // blue-800
    colorClass: "bg-blue-800",
    aum: 85,
    yield5yAvg: 11.4,
    declared2023: 12.1,
    minMonthly: 1000,
    cmaLicensed: true
  },
  {
    id: "octagon",
    name: "Octagon Africa",
    type: "Pan-African Admin",
    desc: "Provides holistic retirement benefits management with a massive footprint across East Africa.",
    icon: Globe,
    color: "#059669", // emerald-600
    colorClass: "bg-emerald-600",
    aum: 110,
    yield5yAvg: 10.8,
    declared2023: 11.5,
    minMonthly: 1000,
    cmaLicensed: true
  },
  {
    id: "zamara",
    name: "Zamara",
    type: "Actuarial & Pension",
    desc: "A powerhouse in pension administration, actuarial services, and retail IPP (Fahari Retirement Plan).",
    icon: ShieldCheck,
    color: "#1e293b", // slate-800
    colorClass: "bg-slate-800",
    aum: 320,
    yield5yAvg: 11.2,
    declared2023: 11.8,
    minMonthly: 500,
    cmaLicensed: true
  },
  {
    id: "nssf",
    name: "NSSF Kenya",
    type: "Statutory Fund",
    desc: "Tier I and Tier II mandatory contributions tracker and voluntary top-up platform.",
    icon: Landmark,
    color: "#be123c", // rose-700
    colorClass: "bg-rose-700",
    aum: 290,
    yield5yAvg: 9.5,
    declared2023: 10.0,
    minMonthly: 200,
    cmaLicensed: true
  },
  {
    id: "icea",
    name: "ICEA Lion Pensions",
    type: "Insurance Backed",
    desc: "Supported by robust balance sheets, offering guaranteed funds and lifetime annuities.",
    icon: Activity,
    color: "#4f46e5", // indigo-600
    colorClass: "bg-indigo-600",
    aum: 145,
    yield5yAvg: 10.5,
    declared2023: 11.0,
    minMonthly: 2000,
    cmaLicensed: true
  },
  {
    id: "sanlam",
    name: "Sanlam Retirements",
    type: "Global Standards",
    desc: "Comprehensive retirement planning tools, post-retirement income drawdown, and group life schemes.",
    icon: Star,
    color: "#2563eb", // blue-600
    colorClass: "bg-blue-600",
    aum: 95,
    yield5yAvg: 10.9,
    declared2023: 11.6,
    minMonthly: 1000,
    cmaLicensed: true
  },
  {
    id: "cpf",
    name: "CPF Financial Services",
    type: "Public & County",
    desc: "Pioneers in pension administration for the public sector, county governments, and Shariah compliant plans.",
    icon: Users,
    color: "#065f46", // emerald-800
    colorClass: "bg-emerald-800",
    aum: 180,
    yield5yAvg: 10.2,
    declared2023: 10.8,
    minMonthly: 1000,
    cmaLicensed: true
  },
  {
    id: "jubilee",
    name: "Jubilee Pensions",
    type: "Annuity Hub",
    desc: "The largest insurer in East Africa, Jubilee offers some of the most competitive immediate and deferred annuity rates.",
    icon: PieChart,
    color: "#dc2626", // red-600
    colorClass: "bg-red-600",
    aum: 210,
    yield5yAvg: 11.0,
    declared2023: 11.7,
    minMonthly: 2500,
    cmaLicensed: true
  }
];

const HISTORICAL_RETURNS = [
  { year: "2019", Enwealth: 11.5, Zamara: 11.0, Octagon: 10.2, ICEA: 10.0 },
  { year: "2020", Enwealth: 10.8, Zamara: 10.5, Octagon: 9.8, ICEA: 9.5 },
  { year: "2021", Enwealth: 11.2, Zamara: 11.0, Octagon: 10.5, ICEA: 10.2 },
  { year: "2022", Enwealth: 11.8, Zamara: 11.5, Octagon: 11.0, ICEA: 10.8 },
  { year: "2023", Enwealth: 12.1, Zamara: 11.8, Octagon: 11.5, ICEA: 11.0 },
];

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-xl min-w-[160px]">
      {label && <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
            <span className="text-[9px] text-slate-400 font-bold uppercase">{p.name}</span>
          </div>
          <span className="text-[10px] font-black text-white">{typeof p.value === "number" ? p.value.toFixed(1) + "%" : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function PensionsDirectoryPage() {
  const [selectedProvider, setSelectedProvider] = useState<typeof PENSION_PROVIDERS[0]>(PENSION_PROVIDERS[0]);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [prefilledAsset, setPrefilledAsset] = useState<string | undefined>(undefined);

  const handleOpenAssetModal = (assetId?: string) => {
    setPrefilledAsset(assetId);
    setIsAssetModalOpen(true);
  };

  const ALLOCATION_DATA = [
    { name: "Fixed Income", value: 72, color: "#4f46e5" },
    { name: "Equities", value: 18, color: "#818cf8" },
    { name: "Real Estate", value: 7, color: "#c7d2fe" },
    { name: "Cash", value: 3, color: "#e0e7ff" },
  ];
  
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 px-6 md:px-10 pt-24 pb-16">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/markets" className="flex items-center gap-1.5 text-[9px] font-black text-indigo-300 hover:text-white uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-3 h-3" /> Markets
          </Link>
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">/</span>
          <span className="text-[9px] font-black text-white uppercase tracking-widest">Pensions & Annuities</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10 max-w-7xl mx-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[9px] font-black uppercase tracking-[0.3em] mb-6">
              <ShieldCheck className="w-3.5 h-3.5" /> Approved RBA Schemes
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none mb-3">
              Retirement<br />Intelligence
            </h1>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] max-w-lg">
              Analyze historic declared yields, administrative fees, and AUM scale for Kenya's top Tier II & Tier III guaranteed and segregated funds.
            </p>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total AUM Tracked", value: "KES 1.4T", icon: Briefcase },
              { label: "Top Declared Yield", value: "12.1%", icon: TrendingUp },
              { label: "RBA Regulated", value: "100%", icon: ShieldCheck },
              { label: "Avg 5Y Compounding", value: "10.8%", icon: Activity },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 backdrop-blur rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                </div>
                <p className="text-xl font-black text-white tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── BAR CHART: AUM vs 2023 Declared Return ── */}
        <div className="max-w-7xl mx-auto bg-white/5 backdrop-blur rounded-[2rem] border border-white/10 p-6">
          <div className="mb-6">
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Declared Returns vs AUM</h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">2023 Audited Declared Yields sorted by Performance</p>
          </div>
          <ResponsiveContainer minWidth={1} width="100%" height={240}>
            <BarChart data={[...PENSION_PROVIDERS].sort((a,b) => b.declared2023 - a.declared2023)} margin={{ left: -10, right: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} tickFormatter={(val) => val.split(' ')[0]} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 9, fontWeight: 700 }} tickFormatter={v => v + "%"} />
              <Tooltip content={<DarkTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              <Bar dataKey="declared2023" name="2023 Declared Yield" fill="#818cf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="yield5yAvg" name="5-Year Average" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="px-6 md:px-10 py-12 max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        
        {/* ── PROVIDER REGISTRY (LEFT 2 COLS) ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Administrator Registry</h2>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-3 py-1 rounded-full font-black tracking-widest">{PENSION_PROVIDERS.length} RBA Licensed</span>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {PENSION_PROVIDERS.map((provider) => (
              <div 
                key={provider.id} 
                onClick={() => setSelectedProvider(provider)}
                className={`bg-white rounded-[2rem] p-6 border-2 transition-all cursor-pointer group flex flex-col ${
                  selectedProvider.id === provider.id 
                    ? "border-indigo-600 shadow-md ring-4 ring-indigo-50" 
                    : "border-slate-100 hover:border-indigo-200 hover:shadow-sm"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl text-white flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`} style={{ backgroundColor: provider.color }}>
                    <provider.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest line-clamp-1">{provider.name}</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{provider.type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">2023 Yield</span>
                    <span className="block text-sm font-black text-indigo-600">{provider.declared2023}%</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">AUM Scale</span>
                    <span className="block text-sm font-black text-slate-700">KES {provider.aum}B</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm mt-8">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">Historical Compounding (Top 4)</h2>
            <ResponsiveContainer minWidth={1} width="100%" height={260}>
              <LineChart data={HISTORICAL_RETURNS} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
                <YAxis domain={[9, 13]} tickFormatter={v => v + "%"} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
                <Tooltip content={<DarkTooltip />} />
                <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="Enwealth" stroke="#1e40af" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Zamara" stroke="#1e293b" strokeWidth={2} />
                <Line type="monotone" dataKey="Octagon" stroke="#059669" strokeWidth={2} />
                <Line type="monotone" dataKey="ICEA" stroke="#4f46e5" strokeWidth={2} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── SELECTED PROVIDER DEEP DIVE (RIGHT COL) ── */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedProvider.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-[2.5rem] p-8 text-white sticky top-24 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl mb-6 shadow-lg" style={{ backgroundColor: selectedProvider.color }}>
                <selectedProvider.icon className="w-8 h-8" />
              </div>
              
              <h2 className="text-2xl font-black uppercase tracking-tight leading-none mb-2">{selectedProvider.name}</h2>
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Verified Institutional Grade</span>
              </div>
              
              <p className="text-sm font-medium text-slate-400 leading-relaxed mb-8">
                {selectedProvider.desc}
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Structure</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{selectedProvider.type}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min. Contribution</span>
                  <span className="text-xs font-bold text-white">KES {selectedProvider.minMonthly.toLocaleString()} / mo</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guaranteed Yield</span>
                  <span className="text-xs font-bold text-indigo-400">Variable (Avg {selectedProvider.yield5yAvg}%)</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Exemption</span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider block text-right">Up to 20K/mo<br/><span className="text-[8px] text-emerald-400">KRA Allowable</span></span>
                </div>
              </div>

              <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-2xl p-5 text-center">
                <Calculator className="w-5 h-5 text-indigo-400 mx-auto mb-3" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1">Tax Alpha Opportunity</h4>
                <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                  Contributions up to KES 20,000 monthly are tax-deductible in Kenya. Routing capital through {selectedProvider.name} provides immediate income-tax alpha before compounding even begins.
                </p>
                <button 
                  onClick={() => handleOpenAssetModal(selectedProvider.id)}
                  className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all drop-shadow-md flex items-center justify-center gap-2"
                >
                  Add to Portfolio <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 text-center">Portfolio Mix (Industry Avg)</h4>
                <div className="h-[120px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={ALLOCATION_DATA}
                        innerRadius={40}
                        outerRadius={55}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {ALLOCATION_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<DarkTooltip />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                   {ALLOCATION_DATA.map(item => (
                     <div key={item.name} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{item.name}</span>
                     </div>
                   ))}
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
