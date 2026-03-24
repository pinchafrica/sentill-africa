"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight, BarChart2, Briefcase, ShieldCheck, PieChart, Activity, Zap } from "lucide-react";
import { useParams } from "next/navigation";
import { PORTFOLIOS } from "@/lib/portfolios";

export default function GenericMarketPage() {
  const params = useParams();
  const rawSpans = Array.isArray(params?.slug) ? params.slug : [params?.slug || "market"];
  const assetId = rawSpans[rawSpans.length - 1] as string;
  
  // Try to find the precise portfolio from the database using the raw slug ID
  const provider = PORTFOLIOS.find(p => p.id.toLowerCase() === assetId.toLowerCase() || p.link.includes(assetId.toLowerCase()));
  
  const formattedName = provider ? provider.name : assetId.replace(/-/g, " ").toUpperCase();
  const description = provider ? provider.description : `Detailed provider profiles, historical performance data, and asset allocations for ${formattedName} are currently being aggregated by our AI indexers.`;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-24">
      {/* ── BREADCRUMB ── */}
      <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex items-center gap-2">
        <Link href="/markets" className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 hover:text-slate-700 uppercase tracking-widest transition-colors">
          <ArrowLeft className="w-3 h-3" /> Markets
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-300" />
        <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">{formattedName}</span>
      </div>

      {/* ── HEADER ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 md:px-10 pt-8 pb-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-start justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl bg-blue-600`}>
                {formattedName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">{formattedName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{provider?.manager || "Independent Provider"}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{provider?.category || "Information Hub"}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-400 font-medium max-w-xl mt-4 leading-relaxed">{description}</p>
          </div>
          
          <div className="flex flex-col lg:items-end gap-4">
            <div className="text-right">
              <span className="text-4xl font-black text-white tracking-tighter block mb-1">
                {provider?.yield || "Variable"}
              </span>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Expected Yield</p>
            </div>
          </div>
        </div>

        {/* KPI strip */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          {[
            { label: "Minimum Investment", value: provider?.minInvest || "Varies", icon: Briefcase },
            { label: "Risk Level", value: provider?.risk || "Moderate", icon: ShieldCheck },
            { label: "Asset Class", value: provider?.category || "Multi-Asset", icon: PieChart },
            { label: "Platform Status", value: "Verified Active", icon: Activity },
          ].map(k => (
            <div key={k.label} className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <k.icon className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">{k.label}</span>
                <span className="text-sm font-black text-white">{k.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTENT BODY ── */}
      <div className="px-6 md:px-10 py-12 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <BarChart2 className="w-5 h-5 text-blue-500" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Provider Overview</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium mb-6">
                {formattedName} operates as a verified market provider within the Kenyan financial ecosystem. Access to execution terminals, historical analytics, and peer comparisons for this provider are fully unlocked for all users on Sentill.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Execution Speed</span>
                  <span className="text-sm font-black text-slate-900">T+1 Standard</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Automated Syncing</span>
                  <span className="text-sm font-black text-slate-900">Supported</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-900/20">
              <Zap className="w-8 h-8 text-blue-200 mb-6" />
              <h2 className="text-xl font-black uppercase tracking-tight mb-2">Connect Provider</h2>
              <p className="text-[11px] text-blue-100 font-medium mb-8 leading-relaxed">
                Log your assets from {formattedName} into your Sentill Dashboard to enable AI tracking and real-time alerts.
              </p>
              <Link href={`/dashboard/assets?logAsset=${provider?.id || assetId}`} className="w-full flex justify-center py-4 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-md">
                Add to Portfolio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
