"use client";

import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie
} from "recharts";
import { 
  Building2, MapIcon, TrendingUp, ShieldCheck, ArrowLeft, ChevronRight, 
  Layers, Wallet, Info, CheckCircle, PieChart as LucidePieChart, Activity
} from "lucide-react";
import Link from "next/link";
import AssetModal from "@/components/AssetModal";

const REIT_DATA = [
  {
    id: "fahari-ireit",
    name: "ILAM Fahari I-REIT",
    ticker: "FAHR",
    type: "I-REIT",
    yield: 6.5,
    occupancy: 92,
    aum: 3.5, // Billion KES
    sector: "Retail/Commercial",
    assets: ["Greenspan Mall", "67 Gitanga Place", "Bayers Centre"],
    color: "#6366f1", // indigo-500
    performance: [
      { year: "2020", dividend: 0.75 },
      { year: "2021", dividend: 0.80 },
      { year: "2022", dividend: 0.50 },
      { year: "2023", dividend: 0.65 },
    ]
  },
  {
    id: "laptrust-reit",
    name: "Laptrust Imara I-REIT",
    ticker: "LPT",
    type: "I-REIT",
    yield: 8.0,
    occupancy: 98,
    aum: 6.9, 
    sector: "Diversified",
    assets: ["CPF House", "Metro Park", "Pension Towers"],
    color: "#1d4ed8", // blue-700
    performance: [
      { year: "2020", dividend: 0.00 },
      { year: "2021", dividend: 0.00 },
      { year: "2022", dividend: 0.00 },
      { year: "2023", dividend: 0.80 }, // Newly listed
    ]
  },
  {
    id: "acorn-ireit",
    name: "ASA I-REIT",
    ticker: "ASA-I",
    type: "I-REIT",
    yield: 10.2,
    occupancy: 95,
    aum: 5.2,
    sector: "Student Housing",
    assets: ["Qwetu Jogoo Rd", "Qwetu Ruaraka", "Qwetu WilsonView"],
    color: "#10b981", // emerald-500
    performance: [
      { year: "2020", dividend: 9.0 },
      { year: "2021", dividend: 9.5 },
      { year: "2022", dividend: 10.0 },
      { year: "2023", dividend: 10.2 },
    ]
  },
  {
    id: "acorn-dreit",
    name: "ASA D-REIT",
    ticker: "ASA-D",
    type: "D-REIT",
    yield: 0.0, // Development REITs rarely pay dividends until exit
    occupancy: 85,
    aum: 4.8,
    sector: "Development",
    assets: ["Qejani Hurlingham", "Qwetu Chiromo", "Qwetu Aberdare"],
    color: "#f59e0b", // amber-500
    performance: [
      { year: "2020", dividend: 0 },
      { year: "2021", dividend: 0 },
      { year: "2022", dividend: 0 },
      { year: "2023", dividend: 0 },
    ]
  }
];

const MARKET_STATS = [
  { label: "Total REIT Market Cap", value: "KES 21.4B", icon: Building2 },
  { label: "Avg. Dividend Yield", value: "8.2%", icon: TrendingUp },
  { label: "Tracked Assets", value: "48+", icon: Layers },
  { label: "Average Occupancy", value: "93%", icon: Activity },
];

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-xl min-w-[140px]">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="text-[10px] text-slate-300 font-bold uppercase">{p.name || p.dataKey}</span>
          <span className="text-[10px] font-black text-white">{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

export default function ReitsPage() {
  const [selectedReit, setSelectedReit] = useState(REIT_DATA[2]);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [prefilledAsset, setPrefilledAsset] = useState<string | undefined>(undefined);

  const handleOpenAssetModal = (assetId?: string) => {
    setPrefilledAsset(assetId);
    setIsAssetModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* ── HEADER ── */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 px-6 py-16 text-white text-center md:text-left overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-8">
            <Link href="/markets" className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">
              ← Markets
            </Link>
            <span className="text-slate-600 font-black">/</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-white">REITs Hub</span>
          </div>

          <div className="flex flex-col md:flex-row justify-between md:items-end gap-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-300 mb-6 mx-auto md:mx-0">
                <LucidePieChart className="w-3.5 h-3.5" /> Institutional Real Estate
              </div>
              <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-tight mb-6">Real Estate<br/>Investment Trusts</h1>
              <p className="text-slate-400 max-w-xl text-sm leading-relaxed font-bold uppercase tracking-wider mx-auto md:mx-0">
                Direct exposure to yield-generating property portfolios in Kenya. Benefit from monthly rental distributions without the hassle of property management.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              {MARKET_STATS.map((stat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm rounded-[2rem] p-6 border border-white/10 text-center md:text-left">
                  <stat.icon className="w-5 h-5 text-indigo-400 mb-2 mx-auto md:mx-0" />
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-xl font-black text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* ── LEFT: CHARTING ── */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col gap-8">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Dividend Yield Comparison</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Comparing 2023 Declared Yields vs Sector Benchmarks</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full border border-indigo-100 text-[9px] font-black text-indigo-600 uppercase tracking-widest">
                    Live Rates
                  </div>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={REIT_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="ticker" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={v => v + '%'} />
                  <RechartsTooltip content={<DarkTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <Bar dataKey="yield" name="Dividend Yield" radius={[8, 8, 0, 0]}>
                    {REIT_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
               {REIT_DATA.map((reit) => (
                 <div 
                   key={reit.id}
                   onClick={() => setSelectedReit(reit)}
                   className={`bg-white rounded-[2rem] p-6 border-2 transition-all cursor-pointer group px-8 py-8 ${
                     selectedReit.id === reit.id 
                       ? "border-indigo-600 shadow-xl ring-4 ring-indigo-50" 
                       : "border-slate-100 hover:border-indigo-200"
                   }`}
                 >
                   <div className="flex justify-between items-start mb-6">
                     <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: reit.color }}>
                       <Building2 className="w-6 h-6" />
                     </div>
                     <span className="bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">{reit.ticker}</span>
                   </div>
                   
                   <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-1 leading-tight">{reit.name}</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{reit.sector}</p>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Yield</p>
                       <p className={`text-lg font-black ${reit.yield > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>{reit.yield > 0 ? reit.yield + '%' : 'Growth'}</p>
                     </div>
                     <div>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Occupancy</p>
                       <p className="text-lg font-black text-slate-900">{reit.occupancy}%</p>
                     </div>
                   </div>
                 </div>
               ))}
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full" />
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10 text-center md:text-left">
                  <div className="flex-1">
                     <h3 className="text-lg font-black uppercase tracking-tight text-indigo-400 mb-2">How to Invest in REITs</h3>
                     <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">Listed REITs (Fahari, Laptrust) are traded on the NSE via your CDS account. Development REITs (Acorn) are targeted at HNW/Institutional investors via private placement.</p>
                     <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <Link href="/markets/nse" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Go to Stock Market</Link>
                        <button onClick={() => handleOpenAssetModal()} className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Request Pro Access</button>
                     </div>
                  </div>
                  <div className="w-1 bg-white/10 h-32 hidden md:block" />
                  <div className="flex-1">
                     <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                        <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">CMA Regulated</span>
                     </div>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-relaxed">All REITs listed and private are regulated under the Kenyan Capital Markets Authority Collective Investment Schemes guidelines.</p>
                  </div>
               </div>
            </div>
          </div>

          {/* ── RIGHT: DEEP DIVE ── */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl sticky top-24">
               <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Portfolio Matrix</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Underlying Assets</h4>
                  <div className="space-y-3">
                     {selectedReit.assets.map((asset, i) => (
                        <div key={i} className="flex items-center gap-3">
                           <MapIcon className="w-3.5 h-3.5 text-indigo-400" />
                           <span className="text-xs font-bold text-slate-600">{asset}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between px-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AUM Scale</span>
                     <span className="text-sm font-black text-slate-900">KES {selectedReit.aum}B</span>
                  </div>
                  <div className="flex items-center justify-between px-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trust Type</span>
                     <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${selectedReit.type === 'I-REIT' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{selectedReit.type}</span>
                  </div>
                  <div className="flex items-center justify-between px-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Risk</span>
                     <span className="text-[10px] font-black text-rose-500 uppercase">Medium Risk</span>
                  </div>
               </div>

               <button 
                  onClick={() => handleOpenAssetModal(selectedReit.id)}
                  className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black text-[11px] uppercase tracking-widest py-5 rounded-[1.5rem] transition-all flex items-center justify-center gap-2 shadow-lg hover:-translate-y-1"
               >
                  <Wallet className="w-4 h-4" /> Log Asset to Sandbox
               </button>

               <p className="text-center mt-6 text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                  <Info className="w-3.5 h-3.5" /> 80% Min Dividend Payout Rule
               </p>
            </div>

            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Historical Dividend Growth</h4>
               <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={selectedReit.performance}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                     <RechartsTooltip content={<DarkTooltip />} />
                     <Line type="monotone" dataKey="dividend" stroke="#6366f1" strokeWidth={3} dot={{r: 4, fill: '#6366f1'}} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      <AssetModal 
        isOpen={isAssetModalOpen} 
        onClose={() => setIsAssetModalOpen(false)} 
        prefilledAsset={prefilledAsset} 
      />
    </div>
  );
}
