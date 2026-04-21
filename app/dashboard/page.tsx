"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Wallet, ShieldCheck, PlusCircle, Sparkles, Building2,
  PieChart, BrainCircuit, Activity, Info, Zap, ArrowRight,
  TrendingUp, Landmark, Star, Search, ShieldAlert, Settings, Target
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAIStore } from "@/lib/store";
import QuickLogAsset from "@/components/QuickLogAsset";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

ChartJS.register(ArcElement, Tooltip, Legend);

function DashboardInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { setAssetModalOpen, setPrefilledAsset, watchlist } = useAIStore();
  const [checkoutIframeUrl, setCheckoutIframeUrl] = useState<string | null>(null);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [quickLogAssetId, setQuickLogAssetId] = useState<string | null>(null);

  const [assets, setAssets] = useState<any[]>([]);
  const [userData, setUserData] = useState<{ name: string; role: string; isPremium?: boolean; premiumExpiresAt?: string | null } | null>(null);
  
  const currentNetWorth = useMemo(() => {
    return assets.reduce((acc, curr) => acc + curr.principal, 0) || 0;
  }, [assets]);

  const avgYield = useMemo(() => {
    if (assets.length === 0) return 0.165;
    const totalYield = assets.reduce((acc, curr) => acc + (curr.projectedYield || 0), 0);
    return totalYield / currentNetWorth;
  }, [assets, currentNetWorth]);

  const fetchData = async () => {
    try {
      const [resAuth, resAssets] = await Promise.all([
        fetch("/api/auth/session"),
        fetch("/api/portfolio/assets")
      ]);
      if (resAuth.ok) {
        const data = await resAuth.json();
        if (data.user) setUserData({ ...data.user, isPremium: data.user.isPremium ?? false, premiumExpiresAt: data.user.premiumExpiresAt ?? null });
      }
      if (resAssets.ok) {
        const data = await resAssets.json();
        setAssets(data);
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
    if (searchParams?.get("logAsset")) {
      setPrefilledAsset(searchParams.get("logAsset")!);
      setAssetModalOpen(true);
    }
    if (searchParams?.get("registered") === "true") {
      setTimeout(() => toast.success("Welcome to Sentill! 🚀", { duration: 6000 }), 800);
      router.replace("/dashboard");
    }
    if (searchParams?.get("payment") === "success") {
      setTimeout(() => toast.success("🏆 Premium Active!", { duration: 8000 }), 500);
      router.replace("/dashboard");
    }
  }, [searchParams]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PAYSTACK_PAYMENT_SUCCESS") {
        setCheckoutIframeUrl(null);
        toast.success("🏆 Premium Active!", { duration: 8000 });
        fetchData();
      } else if (event.data?.type === "PAYSTACK_PAYMENT_FAILED") {
        setCheckoutIframeUrl(null);
        toast.error("Payment Failed");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleUpgradeClick = async () => {
    if (isInitializingPayment) return;
    setIsInitializingPayment(true);
    try {
      const resSession = await fetch("/api/auth/session");
      const d = await resSession.json();
      if (!d?.user?.id) { toast.error("Please log in."); return; }
      
      const res = await fetch("/api/payment/mpesa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: d.user.id, amount: 490, mpesaCode: "254703469525", plan: "MONTHLY_30_DAYS", email: d.user.email || "user@sentill.africa" })
      });
      const data = await res.json();
      if (data.authorization_url) {
        setCheckoutIframeUrl(data.authorization_url);
        setTimeout(() => document.getElementById("paystack-checkout-section")?.scrollIntoView({ behavior: "smooth" }), 300);
      } else {
        toast.error("Payment init failed.");
      }
    } catch (e) {
      toast.error("Network error.");
    } finally {
      setIsInitializingPayment(false);
    }
  };

  if (!mounted) return <div className="animate-pulse flex-1 h-[600px] bg-slate-50 rounded-3xl" />;

  const doughnutData = {
    labels: ['Money Markets', 'Bonds', 'Stocks'],
    datasets: [{
      data: assets.length ? [60, 30, 10] : [1, 1, 1], // In real app, calculate true splits
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
      borderWidth: 0,
    }]
  };

  const performanceData = [
    { month: "Sep", value: currentNetWorth * 0.90 },
    { month: "Oct", value: currentNetWorth * 0.93 },
    { month: "Nov", value: currentNetWorth * 0.95 },
    { month: "Dec", value: currentNetWorth * 0.98 },
    { month: "Jan", value: currentNetWorth },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-xl">
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Total Wealth</p>
          <p className="text-xs font-black text-white">KES {payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-20 max-w-lg mx-auto md:max-w-4xl">
      
      {/* ─── HEADER (Mobile Friendly) ─────────────────────────── */}
      <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black text-lg">
            {userData?.name?.charAt(0) || "U"}
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-wide">Hello, {userData?.name?.split(" ")[0] || "User"}</h2>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mt-0.5">
              {userData?.isPremium ? (
                <span className="text-emerald-600 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Premium</span>
              ) : (
                <button onClick={handleUpgradeClick} disabled={isInitializingPayment} className="text-blue-600 flex items-center gap-1">
                  <Zap className="w-3 h-3"/> Upgrade to Pro
                </button>
              )}
            </div>
          </div>
        </div>
        <Link href="/dashboard/settings" className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors">
           <Settings className="w-5 h-5 text-slate-700" />
        </Link>
      </div>

      {checkoutIframeUrl && (
        <div id="paystack-checkout-section" className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
           <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white">
              <span className="text-xs font-black uppercase">Secure Checkout</span>
              <button onClick={() => setCheckoutIframeUrl(null)} className="text-xs font-bold text-slate-400 hover:text-white">Cancel</button>
           </div>
           <iframe src={checkoutIframeUrl} className="w-full h-[600px] border-0" />
        </div>
      )}

      {/* ─── BIG WEALTH CARD ──────────────────────────────────── */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
         
         <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Total Wealth</p>
         <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
           <span className="text-slate-500 text-2xl md:text-3xl mr-2">KES</span>
           {currentNetWorth === 0 ? "0.00" : currentNetWorth.toLocaleString()}
         </h1>

         <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/5 backdrop-blur-sm">
               <TrendingUp className="w-4 h-4 text-emerald-400" />
               <span className="text-xs font-bold tracking-widest">Est. {((avgYield)*100).toFixed(1)}% Annual Growth</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/5 backdrop-blur-sm">
               <PieChart className="w-4 h-4 text-blue-400" />
               <span className="text-xs font-bold tracking-widest">{assets.length} Active Assets Tracked</span>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => {
                setPrefilledAsset(undefined);
                setAssetModalOpen(true);
              }}
              className="py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg flex flex-col items-center justify-center gap-2 transition-all"
            >
               <PlusCircle className="w-5 h-5" /> Log Asset
            </button>
            <Link 
               href="/dashboard/analyze"
               className="py-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg flex flex-col items-center justify-center gap-2 transition-all"
            >
               <BrainCircuit className="w-5 h-5 text-blue-600" /> Ask AI
            </Link>
         </div>

         {/* Portfolio IQ Segment */}
         <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-3 gap-4">
            <div>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Diversification</p>
               <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-emerald-400">82/100</span>
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 w-[82%]" />
                  </div>
               </div>
            </div>
            <div>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Liquidity Index</p>
               <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-blue-400">High</span>
               </div>
            </div>
            <div>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Portfolio IQ</p>
               <div className="flex items-center gap-2">
                   <span className="text-sm font-black text-purple-400">Advanced</span>
               </div>
            </div>
         </div>
      </div>

      {/* ─── CHARTS (Performance & Allocation) ───────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">
         {/* Performance Area Chart */}
         <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
            <div>
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Wealth Growth</h3>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6">Last 5 Months Track Record</p>
            </div>
            
            {assets.length === 0 ? (
               <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50 text-center p-4">
                  <Activity className="w-6 h-6 text-slate-300 mb-2" />
                  <span className="text-[10px] font-black uppercase text-slate-400">Terminal Empty</span>
                  <p className="text-[9px] text-slate-400 mt-1 max-w-[200px]">Add your first asset to unlock wealth trajectory charting.</p>
               </div>
            ) : (
               <div className="h-40 w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={performanceData}>
                     <defs>
                       <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                     <RechartsTooltip content={<CustomTooltip />} />
                     <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
            )}
         </div>

         {/* Allocation Doughnut */}
         <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col h-full">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Asset Allocation</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6">{assets.length} Active Positions Tracked</p>
            
            {assets.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50 text-center p-4 min-h-[160px]">
                  <PieChart className="w-6 h-6 text-slate-300 mb-2" />
                  <span className="text-[10px] font-black uppercase text-slate-400">No Allocation Data</span>
                  <button onClick={() => setAssetModalOpen(true)} className="mt-3 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase hover:bg-blue-100 transition-colors">Log Asset Now</button>
               </div>
            ) : (
               <div className="flex-1 flex items-center gap-6">
                  <div className="w-24 h-24 shrink-0">
                     <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '75%' }} />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                       Highest Return:<br/>
                       <span className="text-sm font-black text-emerald-600">18.4% APY</span>
                     </p>
                  </div>
               </div>
            )}
         </div>
      </div>

      {/* ─── GOAL TRACKER ─────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-indigo-950 rounded-[2.5rem] p-6 md:p-8 flex items-center justify-between shadow-lg relative overflow-hidden">
         <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
         <div className="flex-1 relative z-10">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shadow-inner">
                 <Target className="w-5 h-5 text-blue-300" />
               </div>
               <div>
                 <h4 className="text-xs font-black uppercase text-white tracking-widest">KES 1M Milestone</h4>
                 <p className="text-[9px] font-black uppercase tracking-widest text-blue-200 opacity-80 mt-0.5">Emergency Fund Goal</p>
               </div>
            </div>
            
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner mb-2 relative">
               <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-300 transition-all duration-1000 w-[45%]" />
            </div>
            
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">45% Completed</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-white">KES 450,000 / 1M</span>
            </div>
         </div>
      </div>

      {/* ─── AI INSIGHT NUGGET ──────────────────────────────── */}
      <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-6 shadow-sm relative overflow-hidden group">
         <Sparkles className="absolute top-4 right-4 w-5 h-5 text-blue-300 group-hover:animate-pulse" />
         <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-800">Sentill Sentill Africa Oracle</span>
         </div>
         <p className="text-xs font-bold text-slate-700 leading-relaxed mb-4">
           {assets.length === 0 
              ? "\"Your portfolio is empty. Log your first asset (like an MMF or Bank Balance) and I'll build a custom tax-saving strategy for you.\"" 
              : "\"Moving KES 50k to Government Bonds could save you 15% in taxes. I've prepared a projection report for you.\""}
         </p>
         <Link href="/dashboard/analyze" className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-1 hover:text-blue-800 transition-colors w-max py-2 px-4 bg-white border border-blue-100 rounded-xl shadow-sm">
            Launch Analysis <ArrowRight className="w-3 h-3" />
         </Link>
      </div>

      {/* ─── AI CLONE STRATEGIES ──────────────────────────────── */}
      <div>
         <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2 flex items-center gap-2">
            <Target className="w-4 h-4" /> AI Portfolio Cloning
         </h4>
         <div className="space-y-4">
            {[
               { id: 'sov_shield', name: "Sovereign Shield", details: "Bonds + MMF", risk: "Low", return: "17.8%", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50", riskColor: "text-emerald-600", riskBg: "bg-emerald-100/50" },
               { id: 'eq_growth', name: "Equity Growth", details: "Blue-Chip NSE", risk: "High", return: "24.2%", icon: TrendingUp, color: "text-rose-500", bg: "bg-rose-50", riskColor: "text-rose-600", riskBg: "bg-rose-100/50" },
               { id: 'bal_wealth', name: "Balanced Wealth", details: "Mixed Assets", risk: "Med", return: "19.5%", icon: PieChart, color: "text-blue-500", bg: "bg-blue-50", riskColor: "text-amber-600", riskBg: "bg-amber-100/50" },
               { id: 'div_income', name: "Dividend Income", details: "REITs + Saccos", risk: "Med", return: "15.0%", icon: Landmark, color: "text-amber-500", bg: "bg-amber-50", riskColor: "text-amber-600", riskBg: "bg-amber-100/50" }
            ].map(item => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-[2rem] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all group">
                 <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center shrink-0`}>
                       <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <div>
                       <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest">{item.name}</h5>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{item.details}</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-6 justify-between md:justify-end border-t border-slate-100 md:border-none pt-4 md:pt-0">
                    <div className="text-center">
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Risk</p>
                       <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${item.riskBg} ${item.riskColor}`}>{item.risk}</span>
                    </div>
                    <div className="text-center border-l border-slate-100 pl-6">
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Est. Return</p>
                       <span className="text-sm font-black text-slate-900">{item.return}</span>
                    </div>
                    <button 
                       onClick={async () => {
                         toast.loading(`Cloning "${item.name}" parameters...`, { id: "clone" });
                         try {
                            const allocs: {id: string, amt: string}[] = [];
                            if (item.id === 'sov_shield') allocs.push({id: "ifb1_2024", amt: "600000"}, {id: "etica", amt: "400000"});
                            if (item.id === 'eq_growth') allocs.push({id: "scom", amt: "700000"}, {id: "eqty", amt: "300000"});
                            if (item.id === 'bal_wealth') allocs.push({id: "ifb1_2024", amt: "400000"}, {id: "etica", amt: "400000"}, {id: "scom", amt: "200000"});
                            if (item.id === 'div_income') allocs.push({id: "acorn_reit", amt: "500000"}, {id: "stima_sacco", amt: "500000"});

                            for (const a of allocs) {
                               await fetch("/api/portfolio/assets", {
                                 method: "POST", headers: { "Content-Type": "application/json" },
                                 body: JSON.stringify({ assetId: a.id, amount: a.amt })
                               });
                            }
                            await fetchData();
                            toast.success(`Sandbox Strategy Cloned!`, { id: "clone" });
                         } catch (err) {
                            toast.error("Clone Failed", { id: "clone" });
                         }
                       }}
                       className="ml-2 px-6 py-3 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-lg active:scale-95"
                    >
                       Clone Strategy
                    </button>
                 </div>
              </div>
            ))}
         </div>
      </div>

    </div>
  );
}

export default function DashboardOverview() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Initializing Terminal Parameters...</div>}>
      <DashboardInner />
    </Suspense>
  );
}