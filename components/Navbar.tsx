"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Menu, X, Lock, FileText, ChevronRight, User, Phone, LogOut, ArrowRight, Activity, ShieldCheck, Mail, Building2, Landmark, Briefcase, Users, LayoutDashboard, Globe, Zap, Cpu, LineChart, Calculator, MapPin, Database, Server, Smartphone, Layout, ArrowUpRight, Scale, PieChart, TrendingUp, Handshake, BrainCircuit, MessageSquare, Plus, CheckCircle, Flame, Target, Star, ShieldAlert, BadgeCheck, Bell, Sparkles, Rocket, Info, UserPlus, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const menuData = {
  bonds: {
    label: "Treasury Bonds",
    href: "/markets/bonds",
    isMega: true,
    sections: [
      {
        title: "Treasury Bills",
        items: [
          { title: "91-Day T-Bills", desc: "Ultra-Short Sovereign Liquidity", href: "/markets/treasuries", icon: Zap, color: "text-amber-500" },
          { title: "182-Day T-Bills", desc: "Medium Term Government Cash", href: "/markets/treasuries", icon: TrendingUp, color: "text-blue-500" },
          { title: "364-Day T-Bills", desc: "1-Year High-Yield Paper", href: "/markets/treasuries", icon: LineChart, color: "text-emerald-500" },
          { title: "DhowCSD Portal", desc: "CBK Direct Retail Bidding System", href: "https://dhowcsd.centralbank.go.ke", icon: ShieldCheck, color: "text-slate-800" }
        ]
      },
      {
        title: "Government Treasuries & Bonds",
        items: [
          { title: "Infrastructure Bonds (IFBs)", desc: "18.5% Tax-Free — IFB1/2024", href: "/markets/bonds", icon: Landmark, color: "text-emerald-700" },
          { title: "Fixed Coupon Bonds", desc: "Standard Treasury Capital — Long Term", href: "/markets/bonds", icon: ShieldCheck, color: "text-blue-600" },
          { title: "Kenya Eurobonds", desc: "USD Denominated Sovereign Debt", href: "/markets/eurobonds", icon: Globe, color: "text-indigo-600" },
          { title: "NSE Secondary Market", desc: "Retail Bond Trading Platform", href: "/markets/bonds", icon: Activity, color: "text-slate-700" }
        ]
      }
    ]
  },
  corporateDebt: {
    label: "Corporate Debt",
    href: "/markets/corporate-bonds",
    isMega: true,
    sections: [
      {
        title: "Corporate Bonds",
        items: [
          { title: "Listed Corporate Bonds", desc: "NSE-Traded High-Yield Debt", href: "/markets/corporate-bonds", icon: Building2, color: "text-rose-600" },
          { title: "Safaricom Bond", desc: "Telco Infrastructure Debt", href: "/markets/corporate-bonds", icon: Zap, color: "text-blue-600" },
          { title: "KCB Group Bond", desc: "Tier 1 Bank Medium-Term Note", href: "/markets/corporate-bonds", icon: Landmark, color: "text-emerald-700" },
          { title: "NCBA Corporate Paper", desc: "Short-Duration Bank Debt", href: "/markets/corporate-bonds", icon: Briefcase, color: "text-red-600" }
        ]
      },
      {
        title: "Specialist Instruments",
        items: [
          { title: "Commercial Paper", desc: "90–270 Day Corporate Funding", href: "/markets/commercial-paper", icon: Activity, color: "text-indigo-600" },
          { title: "Green Bonds", desc: "Climate & Sustainability Finance", href: "/markets/green-bonds", icon: Leaf, color: "text-emerald-500" },
          { title: "Bond ETFs", desc: "Diversified Debt Index Products", href: "/markets/etfs", icon: PieChart, color: "text-blue-500" },
          { title: "Corporate Bond Screener", desc: "Full Market Directory", href: "/markets/corporate-bonds", icon: LineChart, color: "text-slate-700" }
        ]
      },
      {
        title: "Research & Analysis",
        items: [
          { title: "Credit Ratings", desc: "GCR & Moody's Kenya Ratings", href: "/markets/corporate-bonds", icon: ShieldCheck, color: "text-amber-600" },
          { title: "Yield Spreads", desc: "Corporate vs Sovereign Spreads", href: "/markets/yields", icon: TrendingUp, color: "text-rose-500" },
          { title: "Maturity Calendar", desc: "Upcoming Bond Redemptions", href: "/markets/corporate-bonds", icon: Star, color: "text-purple-600" },
          { title: "New Issuances", desc: "Live Corporate Bond Offers", href: "/markets/corporate-bonds", icon: Rocket, color: "text-blue-600" }
        ]
      }
    ]
  },
  specialFunds: {
    label: "Special Funds",
    href: "/markets/special",
    isMega: true,
    sections: [
      {
        title: "Featured Special Funds",
        viewAllHref: "/markets/special",
        items: [
          { title: "Mansa Capital", desc: "22–28% p.a. · Multi-Strategy Growth", href: "/markets/special/mansa-x", icon: Zap, color: "text-purple-600" },
          { title: "Kuza Momentum Special Fund", desc: "18–22% p.a. · Growth & Income Hybrid", href: "/markets/special/kuza-momentum", icon: TrendingUp, color: "text-blue-600" },
          { title: "Oak Special Fund", desc: "16–20% p.a. · Wealth Preservation", href: "/markets/special/oak", icon: Landmark, color: "text-emerald-700" },
          { title: "Avocap Africa Special Fund", desc: "20–26% p.a. · EA Frontier Markets", href: "/markets/special/avocap", icon: Globe, color: "text-indigo-600" },
          { title: "Etica Special Fund", desc: "25–32% p.a. · Institutional Alpha", href: "/markets/special/etica-special", icon: Star, color: "text-emerald-500" }
        ]
      },
      {
        title: "Alternative & Private",
        items: [
          { title: "Real Estate REITs", desc: "Acorn & Stanlib Income Trusts", href: "/markets/reits", icon: Building2, color: "text-emerald-600" },
          { title: "Private Equity", desc: "Direct Business Capital Stakes", href: "/markets/pe", icon: Briefcase, color: "text-slate-800" },
          { title: "Agri-Business Funds", desc: "Food Security & Commodity Yields", href: "/markets/agri", icon: PieChart, color: "text-green-600" },
          { title: "Venture Capital", desc: "Tech Startup Seed Syndicate", href: "/markets/vc", icon: Rocket, color: "text-purple-600" }
        ]
      },
      {
        title: "Global & Diaspora",
        items: [
          { title: "Diaspora Investment Fund", desc: "High-Yield KES Strategies", href: "/diaspora", icon: Globe, color: "text-blue-600" },
          { title: "US Tech Stocks", desc: "Apple, Tesla, NVIDIA Equities", href: "/markets/us-stocks", icon: TrendingUp, color: "text-rose-600" },
          { title: "Global Vanguard ETFs", desc: "S&P 500 & Index Funds", href: "/markets/global-etfs", icon: PieChart, color: "text-indigo-600" },
          { title: "Sovereign Gold ETFs", desc: "Physical Gold Tracking", href: "/markets/commodities", icon: Star, color: "text-amber-500" }
        ]
      },
      {
        title: "Sharia-Compliant Products",
        items: [
          { title: "Halal MMF", desc: "Shariʻah-Screened Liquidity Fund", href: "/markets/special/halal-mmf", icon: ShieldCheck, color: "text-emerald-600" },
          { title: "Islamic Bond (Sukuk)", desc: "IDB & East Africa Sukuk", href: "/markets/special/sukuk", icon: Landmark, color: "text-teal-600" },
          { title: "Halal Equity Fund", desc: "NSE Sharia-Screened Portfolio", href: "/markets/special/halal-equity", icon: TrendingUp, color: "text-green-600" },
          { title: "Waqf Fund", desc: "Endowment & Charitable Capital", href: "/markets/special/waqf", icon: Users, color: "text-indigo-600" }
        ]
      }
    ]
  },
  mmfs: {
    label: "Money Market Funds",
    isMega: true,
    sections: [
      {
        title: "Legacy Funds",
        viewAllHref: "/markets/mmfs",
        items: [
          { title: "CIC Money Market", desc: "15.90% p.a. · Largest Non-Bank MMF", href: "/markets/mmfs/cic", icon: TrendingUp, color: "text-red-500" },
          { title: "Britam MMF", desc: "14.20% p.a. · Heritage Asset Income", href: "/markets/mmfs/britam", icon: Activity, color: "text-indigo-600" },
          { title: "Old Mutual MMF", desc: "14.00% p.a. · Pan-African Wealth", href: "/markets/mmfs/old-mutual", icon: ShieldCheck, color: "text-emerald-600" },
          { title: "ICEA Lion MMF", desc: "13.60% p.a. · Top-Quartile Yield", href: "/markets/mmfs/icea", icon: LineChart, color: "text-slate-700" },
          { title: "Sanlam Pesa MMF", desc: "14.78% p.a. · Institutional Alpha", href: "/markets/mmfs/sanlam", icon: Globe, color: "text-blue-600" }
        ]
      },
      {
        title: "Newer Funds",
        viewAllHref: "/markets/mmfs",
        items: [
          { title: "Etica Wealth MMF", desc: "17.55% p.a. · 🏆 Highest Yield", href: "/markets/mmfs/etica", icon: Zap, color: "text-emerald-500" },
          { title: "Zidi High Yield MMF", desc: "18.20% p.a. · Institutional Grade", href: "/markets/mmfs/zidi", icon: Activity, color: "text-indigo-500" },
          { title: "Kuza MMF", desc: "16.50% p.a. · Boutique Alpha", href: "/markets/mmfs/kuza", icon: TrendingUp, color: "text-blue-400" },
          { title: "Lofty Corban MMF", desc: "16.80% p.a. · Alternative Credit", href: "/markets/mmfs/lofty", icon: Target, color: "text-rose-500" },
          { title: "GenCap Hela MMF", desc: "16.20% p.a. · Dynamic Allocation", href: "/markets/mmfs/gencap", icon: PieChart, color: "text-purple-600" }
        ]
      },
      {
        title: "Bank-Backed MMFs",
        viewAllHref: "/markets/mmfs",
        items: [
          { title: "NCBA Loop MMF", desc: "12.10% p.a. · T+0 Instant Liquidity", href: "/markets/mmfs/ncba", icon: Landmark, color: "text-red-600" },
          { title: "KCB Wealth MMF", desc: "11.40% p.a. · Tier 1 Bank Backing", href: "/markets/mmfs/kcb", icon: ShieldCheck, color: "text-emerald-700" },
          { title: "Co-op Trust MMF", desc: "13.20% p.a. · Co-op Stability", href: "/markets/mmfs/coop", icon: Building2, color: "text-emerald-600" },
          { title: "Absa Asset Capital", desc: "12.50% p.a. · Global Standards", href: "/markets/mmfs/absa", icon: Globe, color: "text-rose-600" },
          { title: "StanChart Yield Fund", desc: "11.80% p.a. · Premium Preservation", href: "/markets/mmfs/scb", icon: Briefcase, color: "text-blue-600" }
        ]
      }
    ]
  },
  nse: {
    label: "NSE Equities",
    isMega: true,
    sections: [
      {
        title: "Live Market Prices",
        viewAllHref: "/markets/nse",
        items: [
          { title: "NSE 20 Dashboard", desc: "Live Heatmap & Movers", href: "/markets/nse", icon: Activity, color: "text-emerald-500" },
          { title: "Safaricom (SCOM)", desc: "View Live Charts & Yields", href: "/markets/nse/scom", icon: Zap, color: "text-blue-500" },
          { title: "Equity Group (EQTY)", desc: "View Live Charts & Yields", href: "/markets/nse/eqty", icon: TrendingUp, color: "text-amber-500" },
          { title: "KCB Group (KCB)", desc: "View Live Charts & Yields", href: "/markets/nse/kcb", icon: Building2, color: "text-indigo-500" },
          { title: "EABL", desc: "View Live Charts & Yields", href: "/markets/nse/eabl", icon: Briefcase, color: "text-slate-800" }
        ]
      },
      {
        title: "Stock Sectors",
        viewAllHref: "/markets/nse",
        items: [
          { title: "Banking Sector", desc: "Financial Stock Analytics", href: "/markets/nse", icon: Landmark, color: "text-emerald-700" },
          { title: "Telecom & Tech", desc: "Safaricom & Airtel Data", href: "/markets/nse", icon: Cpu, color: "text-indigo-500" },
          { title: "Energy & Utilities", desc: "KenGen & Kenya Power", href: "/markets/nse", icon: Zap, color: "text-yellow-600" },
          { title: "Manufacturing", desc: "Bamburi & EABL Metrics", href: "/markets/nse", icon: Building2, color: "text-rose-600" },
          { title: "All NSE Equities", desc: "Full Market Screener", href: "/markets/nse", icon: LineChart, color: "text-blue-600" }
        ]
      },
      {
        title: "NSE Brokers",
        viewAllHref: "/markets/trading",
        items: [
          { title: "Standard Inv Bank", desc: "Institutional Execution", href: "/markets/trading/sib", icon: ShieldCheck, color: "text-slate-800" },
          { title: "Equity Trading", desc: "Tier 1 Retail Platform", href: "/markets/trading/equity", icon: Users, color: "text-blue-800" },
          { title: "KCB Capital", desc: "Corporate Advisory Hub", href: "/markets/trading/kcb", icon: Briefcase, color: "text-emerald-600" },
          { title: "NCBA Inv Bank", desc: "High Net-Worth Trading", href: "/markets/trading/ncba", icon: Star, color: "text-purple-600" },
          { title: "Ziidi Trader", desc: "Retail Mobile Execution", href: "/markets/trading/ziidi", icon: Rocket, color: "text-rose-600" }
        ]
      }
    ]
  },
  intelligence: {
    label: "Terminal Tools",
    isMega: true,
    sections: [
      {
        title: "Analysis Engines",
        items: [
          { title: "Intelligence Hub", desc: "🏆 Live Market Leaderboards & AI Picks", href: "/dashboard/advisor", icon: Sparkles, color: "text-blue-600" },
          { title: "Comparison Engine", desc: "Side-by-side Institutional Alpha", href: "/tools/compare", icon: Zap, color: "text-amber-400" },
          { title: "Tax Alpha Optimizer", desc: "WHT Efficiency Strategy Tool", href: "/dashboard/analyze", icon: Landmark, color: "text-slate-400" },
          { title: "Portfolio Analyzer", desc: "AI Allocation Benchmarking", href: "/dashboard/analyze", icon: PieChart, color: "text-blue-500" },
          { title: "Yield Forecaster", desc: "10-Year Compounding Models", href: "/dashboard/analyze", icon: LineChart, color: "text-indigo-400" },
        ]
      },
      {
        title: "Specialized Hubs",
        items: [
          { title: "Diaspora Hub", desc: "Zero-fee Remittance Routing", href: "/diaspora", icon: Globe, color: "text-blue-600" },
          { title: "Chama Hub", desc: "Investment Group Management", href: "/dashboard/chamas", icon: Users, color: "text-emerald-500" },
          { title: "Land Parity Hub", desc: "Verified Real Estate Benchmarking", href: "/dashboard/land", icon: MapPin, color: "text-emerald-700" },
          { title: "Crypto Parity", desc: "Stablecoin to KES Yields", href: "/markets/crypto", icon: Zap, color: "text-purple-500" },
          { title: "Startup Angel Hub", desc: "Early-Stage Tech Syndicate", href: "/markets/angel", icon: Rocket, color: "text-rose-500" }
        ]
      },
      {
        title: "Knowledge & Data",
        items: [
           { title: "Sentil Academy", desc: "Master Institutional Investing", href: "/academy", icon: Info, color: "text-blue-500" },
           { title: "Market Reports", desc: "Weekly Macro-Economic Deep Dives", href: "/resources/reports", icon: Activity, color: "text-emerald-600" },
           { title: "API Documentation", desc: "Sentil Oracle Dev Endpoints", href: "/api-docs", icon: Cpu, color: "text-slate-900" },
           { title: "Sacco Federation", desc: "Apex Co-operative Analytics", href: "/markets/sacco-fed", icon: Users, color: "text-amber-600" },
           { title: "The Sanctuary", desc: "Faith-Based Wealth Management", href: "/hubs/stewardship", icon: Building2, color: "text-emerald-700" }
        ]
      },
      {
        title: "Pensions & Retirement",
        viewAllHref: "/markets/pensions",
        items: [
          { title: "Individual Pension Plans", desc: "Personal RBA-Licensed Funds", href: "/markets/pensions", icon: ShieldCheck, color: "text-blue-600" },
          { title: "Umbrella Funds", desc: "Corporate & SME Schemes", href: "/markets/pensions", icon: Building2, color: "text-emerald-700" },
          { title: "Income Drawdown Funds", desc: "Post-Retirement Yields", href: "/markets/pensions", icon: TrendingUp, color: "text-rose-600" },
          { title: "NSSF Tracker", desc: "Tier I & Tier II Statutories", href: "/markets/pensions", icon: Landmark, color: "text-slate-800" },
          { title: "Pension Directory", desc: "Full list of approved managers", href: "/markets/pensions", icon: Globe, color: "text-indigo-600" }
        ]
      }
    ]
  }
};




export default function Navbar() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.authenticated) {
          setIsLoggedIn(true);
          setUser(data.user);
        }
      } catch (err) {
        console.error("Session check failed:", err);
      }
    }
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsLoggedIn(false);
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>

      <nav className="fixed top-[40px] w-full z-[50] px-3 md:px-5 py-3">
        {/* Flexible Hub to prevent pillar collision */}
        <div className="max-w-[1480px] mx-auto bg-white/95 backdrop-blur-md rounded-3xl px-4 md:px-6 xl:px-8 py-3 flex items-center justify-between border border-slate-200 shadow-xl relative min-h-[68px]">
          
          {/* Left Side: Logo & Menu */}
          <div className="flex items-center xl:gap-6 2xl:gap-10">
            {/* Logo */}
            <div className="flex items-center gap-3 pr-2 border-r border-slate-200/60">
              <Link href="/" className="flex items-center group shrink-0">
                <img 
                  src="/images/logo.jpg" 
                  alt="Sentill Logo" 
                  className="h-9 sm:h-11 w-auto object-contain mix-blend-multiply transition-all group-hover:scale-[1.02]" 
                />
              </Link>
            </div>

            {/* Menu Items (now aligned next to logo) */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2 2xl:gap-5 overflow-x-visible">
            {Object.entries(menuData).map(([key, menu]: [string, any]) => (
              <div
                key={key}
                className="relative group py-2"
                onMouseEnter={() => setActiveMenu(key)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link href={menu.href || "#"} className="flex items-center gap-1 text-[9px] lg:text-[9.5px] xl:text-[10px] font-black uppercase tracking-widest text-slate-700 hover:text-blue-700 transition-colors whitespace-nowrap px-1 md:px-2">
                  {menu.label} <ChevronDown className={`w-2.5 h-2.5 transition-transform duration-300 ${activeMenu === key ? 'rotate-180' : ''}`} />
                </Link>

                <AnimatePresence>
                  {activeMenu === key && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={menu.isMega 
                        ? "fixed top-[105px] left-1/2 -translate-x-1/2 w-[98%] max-w-[1480px] z-[100] cursor-default" 
                        : "absolute top-full pt-4 left-1/2 -translate-x-1/2 w-[320px] z-[100] cursor-default"
                      }
                    >
                      <div className={`bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] relative overflow-hidden backdrop-blur-xl max-h-[85vh] overflow-y-auto`}>
                        {menu.isMega && <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-50/50 via-white to-transparent pointer-events-none" />}
                        
                        {!menu.isMega ? (
                          <div className="grid grid-cols-1 gap-2 relative z-10 text-left">
                            {menu.items.map((item: any, i: number) => (
                              <Link key={i} href={item.href} onClick={() => setActiveMenu(null)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all group/item border border-transparent hover:border-slate-100">
                                <item.icon className={`w-5 h-5 ${item.color} transition-transform group-hover/item:-translate-y-0.5`} />
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-black uppercase text-slate-950 tracking-wider font-heading">{item.title}</span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{item.desc}</span>
                                </div>
                                <ChevronRight className="w-3 h-3 text-slate-300 ml-auto opacity-0 group-hover/item:opacity-100 transition-all" />
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 relative z-10 text-left`}>
                            {menu.sections.map((section: any, i: number) => (
                              <div key={i} className="space-y-6">
                                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50/50 px-4 py-2 rounded-lg inline-block">{section.title}</h4>
                                <div className="grid grid-cols-1 gap-2">
                                  {section.items.map((item: any, j: number) => (
                                    <Link key={j} href={item.href} onClick={() => setActiveMenu(null)} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all group/subitem border border-transparent hover:border-blue-100/50">
                                      <div className={`w-10 h-10 rounded-xl ${item.color} bg-white flex items-center justify-center shadow-sm border border-slate-100 transition-all group-hover/subitem:scale-110`}>
                                         <item.icon className="w-5 h-5" />
                                      </div>
                                      <div>
                                         <p className="text-[11px] font-black uppercase text-slate-950 tracking-wide">{item.title}</p>
                                         <p className="text-[10px] text-slate-400 font-bold uppercase">{item.desc}</p>
                                      </div>
                                      <ChevronRight className="w-3 h-3 text-slate-300 ml-auto opacity-0 group-hover/subitem:opacity-100 transition-all" />
                                    </Link>
                                  ))}
                                </div>
                                {section.items.length >= 5 && (
                                  <Link
                                    href={section.viewAllHref || menu.href || "#"}
                                    onClick={() => setActiveMenu(null)}
                                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-blue-100 bg-blue-50/60 hover:bg-blue-100 text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-all group/viewall w-full"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                    View All {section.title}
                                    <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover/viewall:opacity-100 transition-all" />
                                  </Link>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          </div>

          {/* Right Pillar: Action Buttons */}
          <div className="flex items-center justify-end gap-3 text-right">

            {/* Notification Bell */}
            <div className="relative group/bell">
              <button className="hidden sm:flex items-center justify-center w-[38px] h-[38px] rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors relative border border-slate-200 shadow-sm">
                <Bell className="w-4 h-4" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-pulse" />
              </button>
              
              <div className="absolute top-full pt-4 right-0 w-[320px] z-[100] opacity-0 invisible group-hover/bell:opacity-100 group-hover/bell:visible transition-all">
                <div className="bg-white/95 rounded-[2rem] p-5 border border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] relative overflow-hidden backdrop-blur-xl text-left">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                       <Sparkles className="w-3.5 h-3.5 text-blue-500" /> AI Market Alerts
                    </h4>
                    <span className="text-[8px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-100">2 New</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer group/alert">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded">Buy Signal</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">10m ago</span>
                      </div>
                      <p className="text-[10px] font-medium text-slate-700 leading-relaxed">SCOM dropped 2%. AI predicts short-term recovery. Accumulate.</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all cursor-pointer group/alert">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-100/50 px-2 py-0.5 rounded">Yield Update</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">1h ago</span>
                      </div>
                      <p className="text-[10px] font-medium text-slate-700 leading-relaxed">Etica MMF 7-day yield increased from 17.5% to 18.2%.</p>
                    </div>
                  </div>
                  <button className="w-full mt-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                     View All Alerts
                  </button>
                </div>
              </div>
            </div>

            {!isLoggedIn ? (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/auth/register"
                  className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 text-[10px] font-black rounded-full uppercase tracking-widest transition-all shadow-sm whitespace-nowrap"
                >
                  Register
                </Link>
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-[10px] font-black rounded-full uppercase tracking-widest transition-all whitespace-nowrap"
                >
                  <User className="w-3.5 h-3.5" /> Sign In
                </Link>
                <Link 
                  href="/packages" 
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 text-white text-[10px] font-black rounded-full uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl group whitespace-nowrap"
                >
                  <Zap className="w-3.5 h-3.5 text-blue-500 group-hover:text-white transition-colors" /> Go Premium
                </Link>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-[10px] font-black rounded-full uppercase tracking-widest transition-all whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 text-white text-[10px] font-black rounded-full uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl group whitespace-nowrap"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </Link>
              </div>
            )}

            <button
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden fixed top-[100px] left-4 right-4 z-[60] bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
            >
              <div className="p-5 space-y-1 max-h-[80vh] overflow-y-auto">
                {Object.entries(menuData).map(([key, menu]: [string, any]) => (
                  <div key={key}>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 px-3 pt-4 pb-2 block">
                      {menu.label}
                    </p>
                    {menu.items ? menu.items.map((item: any, i: number) => (
                      <Link
                        key={i}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3.5 min-h-[44px] rounded-2xl hover:bg-slate-50 transition-colors"
                      >
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase tracking-wide">{item.title}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                        </div>
                      </Link>
                    )) : menu.sections?.map((section: any) => section.items.map((item: any, k: number) => (
                      <Link
                        key={`${section.title}-${k}`}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-3.5 min-h-[44px] rounded-2xl hover:bg-slate-50 transition-colors"
                      >
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase tracking-wide">{item.title}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                        </div>
                      </Link>
                    )))}
                  </div>
                ))}
                <div className="border-t border-slate-100 pt-4 mt-4 space-y-2">
                  {!isLoggedIn ? (
                    <>
                      <Link
                        href="/auth/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-3 w-full px-3 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl hover:bg-slate-200 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-700" />
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Sign In / Register</span>
                      </Link>
                      <Link
                        href="/packages"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-950 text-blue-500 text-[11px] font-black rounded-2xl uppercase tracking-widest hover:bg-blue-700 hover:text-white transition-all shadow-xl"
                      >
                        <Zap className="w-4 h-4" /> Go Premium
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-blue-700 text-white text-[11px] font-black rounded-2xl uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <button
                        onClick={() => { setMobileMenuOpen(false); setIsLoggedIn(false); }}
                        className="flex items-center justify-center gap-3 w-full px-3 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors text-rose-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Sign Out</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
