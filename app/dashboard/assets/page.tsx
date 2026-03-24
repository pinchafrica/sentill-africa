export const dynamic = 'force-dynamic';

import { getDashboardData, getProviders } from "@/app/actions";
import Link from "next/link";
import { ShieldCheck, Plus, Clock, Percent, AlertCircle, PieChart, TrendingUp, DollarSign, DownloadCloud, Activity, Sparkles, Landmark, ChevronRight, Zap } from "lucide-react";
import AssetModalWrapper from "@/components/AssetModalWrapper";
import { Suspense } from "react";

export default async function MyAssetsPage() {
  const data = await getDashboardData();
  const portfolio = data?.portfolio || [];
  const providers = await getProviders();

  // Calculations for Portfolio UX & Tax Alpha
  const totalPrincipal = portfolio.reduce((sum: number, item: any) => sum + item.principal, 0);
  
  // Tax Alpha Logic: If asset is an IFB (Infrastructure Bond), it's tax-free. Otherwise, subject to 15% WHT.
  let taxFreeAmount = 0;
  let taxableAmount = 0;
  let totalGrossYield = 0;

  portfolio.forEach((item: any) => {
    const isTaxFree = item.provider.type === "IFB" || item.provider.taxCategory === "WHT_0";
    if (isTaxFree) {
      taxFreeAmount += item.principal;
    } else {
      taxableAmount += item.principal;
    }
    totalGrossYield += (item.principal * item.provider.currentYield) / 100;
  });

  const taxEfficiencyScore = totalPrincipal > 0 
    ? Math.round((taxFreeAmount / totalPrincipal) * 100) 
    : 0;

  return (
    <div className="text-slate-900 space-y-8 animate-in fade-in duration-500">
      
      {/* ─── HEADER ROW ───────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Asset Register</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Sentill Institutional Research Hub • {portfolio.length} active allocation{portfolio.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-sm">
            <DownloadCloud className="w-4 h-4" /> Export CSV
          </button>
          <Link href="?logAsset=true" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-blue-600/20">
            <Plus className="w-4 h-4" /> Log New Asset
          </Link>
        </div>
      </div>

      {/* ─── MODAL WRAPPER ────────────────────────────────────────────── */}
      <Suspense fallback={null}>
         <AssetModalWrapper />
      </Suspense>

      {/* ─── TOP METRICS ──────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total AUM", value: `KES ${totalPrincipal.toLocaleString()}`, sub: "Verified Assets", icon: DollarSign, color: "text-blue-600" },
          { label: "Est. Gross Yield", value: `KES ${Math.floor(totalGrossYield).toLocaleString()}`, sub: "Annual Pre-tax", icon: Percent, color: "text-emerald-600" },
          { label: "Tax Alpha", value: `${taxEfficiencyScore}/100`, sub: taxEfficiencyScore < 50 ? "Sub-optimal WHT" : "Highly Optimized", icon: ShieldCheck, color: "text-indigo-600" },
          { label: "Portfolio Health", value: portfolio.length > 0 ? "Active" : "Empty", sub: "Live Monitoring", icon: Activity, color: "text-slate-900" },
        ].map((m, i) => (
          <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
              <m.icon className={`w-4 h-4 ${m.color}`} />
            </div>
            <div className={`text-2xl font-black tracking-tighter ${m.color}`}>{m.value}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* ─── ASSET TABLE ──────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-slate-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Logged Instruments</h2>
          </div>
        </div>
        
        {portfolio.length === 0 ? (
          <div className="relative overflow-hidden border-t border-slate-100 bg-gradient-to-b from-slate-50 to-white px-6 py-24 text-center group">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none" />
             <div className="relative z-10 max-w-sm mx-auto space-y-6">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-100 border border-blue-50 group-hover:scale-110 transition-transform duration-500 ring-4 ring-blue-50/50">
                   <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Sentill Discovery Matrix</h3>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-[0.2em] max-w-xs mx-auto">
                    Your institutional dashboard is currently at zero latency. The AI Oracle recommends the following high-alpha instruments to initiate your capital stack.
                  </p>
                </div>
                
                <div className="grid gap-3 pt-6">
                   <Link href="?logAsset=ifb1_2024" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all text-left group/item relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl -mr-12 -mt-12" />
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                           <Landmark className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">IFB1/2024/006</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Govt Infrastructure Bond</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end relative z-10">
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">18.4% Tax-Free</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase mt-1">Tier 1 Safety</span>
                      </div>
                   </Link>

                   <Link href="?logAsset=etica" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all text-left group/item relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl -mr-12 -mt-12" />
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                           <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Etica Wealth MMF</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Liquid Money Market</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end relative z-10">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">17.5% Annual</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase mt-1">Daily Liquidity</span>
                      </div>
                   </Link>
                </div>

                <div className="pt-8 text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                   <Zap className="w-3 h-3 text-amber-500" /> AI Optimization Directives Active
                </div>
             </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black tracking-widest text-slate-500">
                <tr>
                  <th className="p-4 pl-6">Instrument</th>
                  <th className="p-4">Asset Class</th>
                  <th className="p-4 text-right">Principal (KES)</th>
                  <th className="p-4 text-center">Gross Yield</th>
                  <th className="p-4 text-center">WHT Status</th>
                  <th className="p-4 pr-6 text-right">Logged At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium">
                {portfolio.map((item: any) => {
                  const isTaxFree = item.provider.type === "IFB" || item.provider.taxCategory === "WHT_0";

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-4 pl-6">
                        <span className="font-bold text-slate-900">{item.provider.name}</span>
                      </td>
                      <td className="p-4 text-slate-600 text-xs">
                        {item.provider.type}
                      </td>
                      <td className="p-4 text-right font-black text-slate-900">
                        {item.principal.toLocaleString("en-KE")}
                      </td>
                      <td className="p-4 text-center text-emerald-600 font-bold">
                        {item.provider.currentYield}%
                      </td>
                      <td className="p-4 text-center">
                        {isTaxFree ? (
                          <span className="text-[9px] text-indigo-600 font-bold uppercase bg-indigo-50 px-2 py-0.5 rounded">Tax-Free (0%)</span>
                        ) : (
                          <span className="text-[9px] text-rose-500 font-bold uppercase border border-rose-100 px-2 py-0.5 rounded">Standard (15%)</span>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-right text-xs text-slate-500 font-bold">
                        {item.loggedAt ? new Date(item.loggedAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
