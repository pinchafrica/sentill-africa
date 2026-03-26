"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ArrowLeft, ShieldCheck, Activity, Globe, Smartphone, Briefcase, 
  Users, Star, Building2, ExternalLink, Search, Filter, 
  ChevronRight, BadgeCheck, Zap, Laptop, Globe2, BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BROKERS = [
  {
    id: "sib",
    name: "Standard Investment Bank",
    short: "SIB",
    type: "Institutional & Retail",
    desc: "A leading investment bank in Kenya offering comprehensive financial services including corporate finance, stock brokerage, and wealth management (Mansa X).",
    icon: ShieldCheck,
    color: "from-slate-800 to-slate-950",
    accent: "bg-slate-900",
    features: ["Mansa-X Wealth Hub", "Global Markets Access", "Corporate Advisory"],
    minDeposit: "KES 250,000 (Mansa-X)",
    commission: "1.5% - 2.1%",
    platforms: ["Web", "Mobile", "Desktop"],
    usAccess: true,
    rating: 4.9,
    category: "Full Service"
  },
  {
    id: "equity",
    name: "Equity Investment Bank",
    short: "Equity",
    type: "Tier 1 Retail",
    desc: "Backed by Equity Group Holdings, providing robust retail stock brokerage services integrated directly with your Equity Bank accounts.",
    icon: Users,
    color: "from-blue-700 to-blue-900",
    accent: "bg-blue-800",
    features: ["Instant Bank Sync", "Equity Mobile Integration", "Deep Retail Liquidity"],
    minDeposit: "No Minimum",
    commission: "2.1% (Standard)",
    platforms: ["Equity Mobile", "EazzyBiz"],
    usAccess: false,
    rating: 4.7,
    category: "Retail"
  },
  {
    id: "kcb",
    name: "KCB Capital",
    short: "KCB",
    type: "Corporate & Wealth",
    desc: "The investment banking arm of KCB Group, offering vast capital market execution capabilities and deep regional liquidity.",
    icon: Briefcase,
    color: "from-emerald-600 to-emerald-800",
    accent: "bg-emerald-700",
    features: ["Regional EAC Reach", "Sovereign Debt Desk", "Institutional Brokerage"],
    minDeposit: "KES 5,000",
    commission: "2.0%",
    platforms: ["KCB Mobile", "Web"],
    usAccess: false,
    rating: 4.6,
    category: "Institutional"
  },
  {
    id: "ncba",
    name: "NCBA Investment Bank",
    short: "NCBA",
    type: "High Net-Worth",
    desc: "Specialized in delivering premium execution and research for institutional and high net-worth retail clients in East Africa.",
    icon: Star,
    color: "from-purple-600 to-purple-800",
    accent: "bg-purple-700",
    features: ["Premium Gold Desk", "Institutional Research", "Wealth Management"],
    minDeposit: "KES 100,000",
    commission: "1.85%",
    platforms: ["NCBA Now", "Web"],
    usAccess: true,
    rating: 4.8,
    category: "High Net-Worth"
  },
  {
    id: "ziidi",
    name: "Ziidi Trader",
    short: "Ziidi",
    type: "Retail App",
    desc: "A modern, mobile-first stock trading application designed to make purchasing NSE shares accessible to the diaspora and local retail investors.",
    icon: Smartphone,
    color: "from-rose-500 to-rose-700",
    accent: "bg-rose-600",
    features: ["Fractional Thinking", "Diaspora Onboarding", "Real-time NSE Data"],
    minDeposit: "KES 100",
    commission: "2.1%",
    platforms: ["iOS", "Android"],
    usAccess: false,
    rating: 4.5,
    category: "Retail App"
  },
  {
    id: "sterling",
    name: "Sterling Capital",
    short: "Sterling",
    type: "Institutional",
    desc: "A premier investment bank offering cutting-edge execution, research, and corporate advisory services to local and foreign institutions.",
    icon: Activity,
    color: "from-indigo-600 to-indigo-800",
    accent: "bg-indigo-700",
    features: ["Algorithmic Trading", "Foreign Desk", "Market Making"],
    minDeposit: "Institutional",
    commission: "Negotiable",
    platforms: ["Web", "API"],
    usAccess: true,
    rating: 4.8,
    category: "Institutional"
  },
  {
    id: "aib",
    name: "AIB-AXYS Africa",
    short: "AIB",
    type: "Full Range",
    desc: "A dynamic stockbroker offering customized portfolio management and wide market access across multiple asset classes.",
    icon: Globe,
    color: "from-teal-500 to-teal-700",
    accent: "bg-teal-600",
    features: ["Multi-Asset Desk", "AIB Digitrade", "Portfolio Management"],
    minDeposit: "KES 1,000",
    commission: "2.1%",
    platforms: ["Digitrade App", "Web"],
    usAccess: true,
    rating: 4.7,
    category: "Full Service"
  },
  {
    id: "dyer",
    name: "Dyer & Blair",
    short: "D&B",
    type: "Legacy Broker",
    desc: "One of the oldest and most established investment banks in Kenya, renowned for handling major corporate listings and sovereign debt.",
    icon: Building2,
    color: "from-slate-600 to-slate-800",
    accent: "bg-slate-700",
    features: ["Legacy Relationships", "Corporate Action Alpha", "Eurobond Desk"],
    minDeposit: "KES 5,000",
    commission: "2.1%",
    platforms: ["D&B Mobile", "Web"],
    usAccess: false,
    rating: 4.6,
    category: "Institutional"
  }
];

export default function BrokersDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Retail", "Institutional", "High Net-Worth", "Full Service"];

  const filteredBrokers = useMemo(() => {
    return BROKERS.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.short.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || b.category === activeCategory || (activeCategory === "Retail" && b.category === "Retail App");
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-24">
      {/* ── BREADCRUMB ── */}
      <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex items-center gap-2 sticky top-[40px] z-30 shadow-sm">
        <Link href="/markets" className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 hover:text-slate-700 uppercase tracking-widest transition-colors">
          <ArrowLeft className="w-3 h-3" /> Markets
        </Link>
        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">/</span>
        <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Licensed NSE Stockbrokers</span>
      </div>

      {/* ── HERO ── */}
      <div className="relative overflow-hidden bg-slate-900 py-20 px-6 md:px-10">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-12">
          <div className="max-w-2xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">
                <BadgeCheck className="w-3 h-3" /> CMA Licensed · NSE Authorized
             </div>
             <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                Execution <br /><span className="text-blue-500">Excellence.</span>
             </h1>
             <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed mb-8">
                Connect with Kenya's premier investment banks and licensed stockbrokers. Gain direct execution access to the Nairobi Securities Exchange (NSE) with institutional-grade data and liquidity.
             </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             {[
                { label: "Tracked Brokers", val: BROBS_LEN, icon: Building2 },
                { label: "Market Access", val: "NSE + Global", icon: Globe2 },
                { label: "Trading Speed", val: "< 50ms", icon: Zap },
                { label: "Mobile Apps", val: "Licensed Only", icon: Smartphone },
             ].map((stat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl">
                   <stat.icon className="w-5 h-5 text-blue-400 mb-3" />
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                   <p className="text-lg font-black text-white tracking-tight">{stat.val}</p>
                </div>
             ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
        {/* ── FILTERS ── */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <div className="relative w-full md:w-96 flex-shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                 type="text" 
                 placeholder="Search by broker name or ticker..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
              />
           </div>
           
           <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none pb-2 md:pb-0">
              {categories.map(cat => (
                 <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                       activeCategory === cat 
                          ? "bg-slate-950 text-white border-slate-950 shadow-lg shadow-slate-900/10" 
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                 >
                    {cat}
                 </button>
              ))}
           </div>
        </div>

        {/* ── GRID ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredBrokers.map((broker, idx) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.03 }}
                key={broker.id} 
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all group flex flex-col relative overflow-hidden"
              >
                {/* Visual Top Bar */}
                <div className={`h-2 bg-gradient-to-r ${broker.color}`} />
                
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-8">
                    <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${broker.color} text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform`}>
                      <broker.icon className="w-7 h-7" />
                    </div>
                    <div className="text-right">
                       <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-100 block mb-2">
                         {broker.type}
                       </span>
                       <div className="flex items-center justify-end gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-black text-slate-900">{broker.rating}</span>
                       </div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2 group-hover:text-blue-700 transition-colors">
                    {broker.name}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{broker.category}</p>
                  
                  <p className="text-sm text-slate-500 leading-relaxed font-medium mb-8 line-clamp-3">
                    {broker.desc}
                  </p>

                  <div className="space-y-4 mb-8">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Min Deposit</p>
                           <p className="text-[11px] font-black text-slate-900">{broker.minDeposit}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Commission</p>
                           <p className="text-[11px] font-black text-slate-900">{broker.commission}</p>
                        </div>
                     </div>
                     <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Platforms</span>
                        <div className="flex gap-2">
                           {broker.platforms.map(p => (
                              <span key={p} className="text-[8px] font-black bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-slate-600 uppercase">{p}</span>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2 mb-10 px-2">
                    {broker.features.map(f => (
                      <div key={f} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <Link 
                      href={broker.id === 'ziidi' ? 'https://ziidi.com' : (broker.id === 'sib' ? 'https://sib.co.ke' : 'https://www.nse.co.ke')}
                      target="_blank"
                      className="py-4 rounded-2xl bg-slate-900 text-center text-[10px] font-black text-white uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                    >
                      Visit <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Link 
                      href={`/markets/nse?analyse=true&broker=${broker.short}`}
                      className="py-4 rounded-2xl border-2 border-slate-100 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      Trade NSE <BarChart3 className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredBrokers.length === 0 && (
           <div className="py-32 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Search className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">No Brokers Found</h3>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Try adjusting your search query or segments</p>
           </div>
        )}
      </div>

      {/* ── FAQ / FOOTER INFO ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 pb-20">
         <div className="bg-white border border-slate-100 rounded-[3rem] p-8 md:p-12 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-8">Broker Selection Alpha</h2>
            <div className="grid md:grid-cols-3 gap-8">
               <div className="space-y-4">
                  <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                     <ShieldCheck className="w-4 h-4" /> Regulation
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                     Every broker listed on Sentill is licensed by the Capital Markets Authority (CMA) and is an authorized trading participant of the Nairobi Securities Exchange.
                  </p>
               </div>
               <div className="space-y-4">
                  <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                     <Laptop className="w-4 h-4" /> Technology
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                     Modern brokers like Ziidi and AIB focus on retail apps, while institutional giants like Sterling and NCBA provide API execution for algo traders.
                  </p>
               </div>
               <div className="space-y-4">
                  <h3 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                     <Briefcase className="w-4 h-4" /> Custody
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                     Your shares are held at the Central Depository & Settlement Corporation (CDSC). Brokers act as agents to execute your trade instructions.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

const BROBS_LEN = BROKERS.length;
