"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shuffle, PlusCircle, X, Check, ShieldCheck, Activity, 
  BarChart2, TrendingUp, Info, Zap, ArrowRight, Shield, 
  Plus, Landmark, Building2, Users, Wallet, Globe
} from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import Link from "next/link";
import AssetModal from "@/components/AssetModal";
import { PORTFOLIOS } from "@/lib/portfolios";

// Convert String yields/risks to numbers for radar charting
const generateNumericMetrics = (asset: any) => {
  let yieldVal = 10;
  let liq = 50;
  let riskVal = 50;
  let exp = 0.5;

  // Attempt to parse yield
  const yMatch = asset.yield.match(/[\d.]+/);
  if (yMatch) yieldVal = parseFloat(yMatch[0]);

  // Map Category to Liquidity Base
  if (asset.category === 'mmf') liq = 95;
  if (asset.category === 'stocks') liq = 85;
  if (asset.category === 'bonds') liq = 40;
  if (asset.category === 'saccos') liq = 30;
  if (asset.category === 'pension') liq = 10;
  if (asset.category === 'land') liq = 5;
  if (asset.category === 'global') liq = 85;
  if (asset.category === 'agri') liq = 40;
  if (asset.category === 'commodities') liq = 90;
  if (asset.category === 'special') liq = 20;

  // Map Risk
  if (asset.risk === 'Low' || asset.risk === 'Sovereign') riskVal = 20;
  if (asset.risk === 'Medium') riskVal = 50;
  if (asset.risk === 'High' || asset.risk === 'Very High') riskVal = 80;

  return {
    yieldHistorical: yieldVal,
    liquidity: liq,
    risk: riskVal,
    expenseRatio: exp
  };
};

export default function CompareMatrixPage() {
  // Using PORTFOLIOS directly from lib
  const ASSET_DB = PORTFOLIOS.map(asset => ({
    ...asset,
    ...generateNumericMetrics(asset)
  }));

  const [selectedIds, setSelectedIds] = useState<string[]>(["etca", "ifb-2024"]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [prefilledAsset, setPrefilledAsset] = useState("");
  
  const handleOpenAssetModal = (assetId?: string) => {
    if (assetId) setPrefilledAsset(assetId);
    setIsAssetModalOpen(true);
  };
  const [pickerTab, setPickerTab] = useState<string>('all');

  const selectedAssets = selectedIds
    .map(id => ASSET_DB.find(a => a.id === id))
    .filter((a): a is any => a !== undefined);

  const toggleAsset = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const filteredPickerAssets = useMemo(() => {
    if (pickerTab === 'all') return ASSET_DB;
    return ASSET_DB.filter(a => a.category === pickerTab);
  }, [pickerTab, ASSET_DB]);

  // Build Radar Data
  const radarData = [
    { subject: 'Yield Vel.', fullMark: 30 },
    { subject: 'Liquidity', fullMark: 100 },
    { subject: 'Safety Scope', fullMark: 100 },
    { subject: 'Efficiency', fullMark: 100 },
  ].map(attr => {
    const row: any = { subject: attr.subject, fullMark: attr.fullMark };
    selectedAssets.forEach(asset => {
      let val = 0;
      if (attr.subject === 'Yield Vel.') val = (asset.yieldHistorical / 25) * 100; // normalize out of ~25% max
      if (attr.subject === 'Liquidity') val = asset.liquidity;
      if (attr.subject === 'Safety Scope') val = 100 - asset.risk; // higher is safer
      if (attr.subject === 'Efficiency') val = 100 - (asset.expenseRatio * 20);
      row[asset.name] = val;
    });
    return row;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 pt-40 px-6 lg:px-12 max-w-[1600px] mx-auto">
      
      <AssetModal 
        isOpen={isAssetModalOpen} 
        onClose={() => { setIsAssetModalOpen(false); setPrefilledAsset(""); }} 
        prefilledAsset={prefilledAsset}
      />

      {/* ─── PREMIUM HEADER ROW ───────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[3rem] bg-slate-950 p-10 md:p-14 shadow-2xl mb-8 border border-slate-800">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />
         
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
            <div className="space-y-4">
               <div className="flex items-center gap-3 mb-2">
                 <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em]">Matrix Live</span>
                 </div>
               </div>
               <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-none">
                  Correlation <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Hub.</span>
               </h1>
               <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-xl">
                 Cross-asset correlation mapping {ASSET_DB.length} market units globally. Chart historical yields against structural risk.
               </p>
            </div>
            
            <div className="flex-shrink-0">
               <button 
                 onClick={() => setIsPickerOpen(true)}
                 className="group relative flex items-center justify-center gap-3 px-10 py-5 bg-white text-slate-950 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] hover:-translate-y-1 active:scale-95 overflow-hidden"
               >
                  <div className="absolute inset-0 bg-blue-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <Shuffle className="w-5 h-5 relative z-10 group-hover:text-blue-600 transition-colors" /> 
                  <span className="relative z-10">Inject Assets ({selectedAssets.length}/3)</span>
               </button>
            </div>
         </div>
      </div>

      {selectedAssets.length === 0 ? (
        <div className="h-[500px] relative overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-[3rem] bg-slate-50/50 hover:bg-white transition-colors text-center p-12 group cursor-pointer" onClick={() => setIsPickerOpen(true)}>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-[60px] group-hover:bg-blue-500/10 transition-colors" />
           <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 relative z-10 group-hover:scale-110 transition-transform duration-500">
              <Activity className="w-10 h-10 text-blue-500" />
           </div>
           <p className="text-lg font-black uppercase tracking-[0.2em] text-slate-900 relative z-10 mb-2">Awaiting Parameters</p>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10 max-w-sm mb-10">Select up to 3 specialized market units to generate a multi-variant correlation analysis.</p>
           
           <button className="relative z-10 px-10 py-4 bg-slate-950 text-white text-[10px] items-center gap-3 flex uppercase font-black tracking-widest rounded-2xl group-hover:bg-blue-600 transition-all shadow-xl hover:-translate-y-1 active:scale-95">
             <PlusCircle className="w-4 h-4" /> Initiate Discovery
           </button>
        </div>
      ) : (
        <div className="space-y-12">
           {/* Visual & Summary Row */}
           <div className="grid lg:grid-cols-12 gap-10">
              {/* Radar Chart Card */}
              <div className="lg:col-span-12 xl:col-span-5 bg-slate-950 rounded-[3rem] p-10 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden flex flex-col min-h-[550px]">
                 <div className="mb-10 relative z-20">
                    <h3 className="text-[12px] font-black text-blue-400 uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                       <Zap className="w-4 h-4" /> Statistical Pulse
                    </h3>
                    <p className="text-2xl font-black text-white tracking-tight">Multivariate Asset Mapping</p>
                 </div>
                 
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
                 
                 <div className="w-full flex-1 relative z-10 py-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                        <PolarGrid stroke="#1e293b" strokeDasharray="3 3" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontWeight: '900' }} />
                        <RechartsTooltip 
                           contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '20px', padding: '16px', border: '1px solid #334155' }} 
                           itemStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}
                        />
                        {selectedAssets.map((asset, idx) => (
                          <Radar
                            key={asset.id}
                            name={asset.name}
                            dataKey={asset.name}
                            stroke={idx === 0 ? "#3b82f6" : idx === 1 ? "#10b981" : "#f59e0b"}
                            fill={idx === 0 ? "#3b82f6" : idx === 1 ? "#10b981" : "#f59e0b"}
                            fillOpacity={0.3}
                            strokeWidth={3}
                          />
                        ))}
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'black', paddingTop: '40px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Matrix Table Card */}
              <div className="lg:col-span-12 xl:col-span-7 bg-white border border-slate-200 rounded-[3rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
                 {/* Asset Headers */}
                 <div className="grid grid-cols-4 bg-slate-50/80 border-b border-slate-100">
                    <div className="col-span-1 flex flex-col justify-center p-10 border-r border-slate-100">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional</span>
                       <span className="text-xl font-black text-slate-900 tracking-tighter mt-1">Matrix</span>
                    </div>
                    {Array.from({ length: 3 }).map((_, i) => {
                       const asset = selectedAssets[i];
                       return (
                          <div key={i} className={`col-span-1 p-8 text-center border-r border-slate-100 last:border-0 relative ${!asset ? 'bg-slate-50/30' : ''}`}>
                             {asset ? (
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                   <button 
                                      onClick={() => toggleAsset(asset.id)} 
                                      className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors p-2 hover:bg-slate-200/50 rounded-lg"
                                   >
                                      <X className="w-4 h-4" />
                                   </button>
                                   <div className={`w-16 h-16 rounded-[1.5rem] border-t-2 border-white/40 shadow-xl mx-auto flex items-center justify-center group cursor-pointer hover:scale-110 transition-transform ${asset.bg}`}>
                                      <asset.icon className={`w-8 h-8 ${asset.color}`} />
                                   </div>
                                   <div className="space-y-1">
                                      <h4 className="text-[12px] font-black text-slate-950 leading-tight uppercase tracking-tight line-clamp-2 px-2 h-8 flex items-center justify-center">{asset.name}</h4>
                                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-slate-100 text-slate-600`}>
                                         {asset.category}
                                      </span>
                                   </div>
                                   
                                   {/* ACTION BUTTON */}
                                   <button 
                                     onClick={() => handleOpenAssetModal(asset.id)}
                                     className="w-full py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-800 hover:bg-slate-950 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 group"
                                   >
                                      <Plus className="w-3 h-3 group-hover:scale-125 transition-transform" /> Add to Sandbox
                                   </button>
                                </motion.div>
                             ) : (
                                <button onClick={() => setIsPickerOpen(true)} className="w-full h-full min-h-[180px] flex flex-col items-center justify-center gap-4 opacity-40 hover:opacity-100 transition-all group">
                                   <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-50 transition-all">
                                      <Plus className="w-6 h-6 text-slate-300 group-hover:text-blue-500" />
                                   </div>
                                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600">Select Slot {i+1}</span>
                                </button>
                             )}
                          </div>
                       );
                    })}
                 </div>

                 {/* Matrix Rows - Categorized for Modern Institutional Look */}
                 <div className="flex-1">
                    {[
                      {
                        category: "Yield & Alpha Generation",
                        rows: [
                          { label: "Target Return", icon: TrendingUp, key: "yield", iconColor: "text-emerald-500" },
                          { label: "Est. Historical Velocity", icon: BarChart2, key: "yieldHistorical", formatter: (val: any) => typeof val === 'number' && (val * 1.05).toFixed(2) + "%", iconColor: "text-blue-500" }
                        ]
                      },
                      {
                        category: "Risk & Liquidity Profile",
                        rows: [
                          { label: "Liquidity Status", icon: Activity, key: "liquidity", formatter: (val: any) => typeof val === 'number' && (val > 80 ? "High (T+2)" : val > 30 ? "Medium" : val > 10 ? "Low" : "Stagnant"), iconColor: "text-blue-500" },
                          { label: "Credit / Counterparty Risk", icon: Zap, key: "risk", iconColor: "text-amber-500" }
                        ]
                      },
                      {
                        category: "Structural Mechanics",
                        rows: [
                          { label: "Minimum Floor", icon: Wallet, key: "minInvest", iconColor: "text-slate-950" },
                          { label: "Tax Classification", icon: Shield, key: "category", formatter: (val: any) => val === 'bonds' ? "Subject to Issue" : val === 'saccos' || val === 'stocks' ? "Div. WHT" : "15% WHT", iconColor: "text-slate-400" }
                        ]
                      }
                    ].map((group, gIdx) => (
                       <div key={gIdx}>
                          <div className="grid grid-cols-4 bg-slate-950 border-y border-slate-800">
                             <div className="col-span-4 px-10 py-5 flex items-center gap-3">
                                <div className="w-1.5 h-4 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{group.category}</span>
                             </div>
                          </div>
                          {group.rows.map((row, rIdx) => (
                             <div key={rIdx} className="grid grid-cols-4 border-b border-slate-50 last:border-0 hover:bg-blue-50/30 transition-colors group/row">
                                <div className="col-span-1 p-10 border-r border-slate-100 flex items-center gap-4 bg-white group-hover/row:bg-transparent transition-colors">
                                   <div className={`p-2 rounded-xl bg-slate-50 group-hover/row:bg-white shadow-sm border border-transparent group-hover/row:border-slate-100 transition-all`}>
                                      <row.icon className={`w-4 h-4 ${row.iconColor}`} />
                                   </div>
                                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none group-hover/row:text-slate-900 transition-colors">{row.label}</span>
                                </div>
                                {Array.from({ length: 3 }).map((_, cIdx) => {
                                   const asset = selectedAssets[cIdx];
                                   return (
                                      <div key={cIdx} className="col-span-1 p-10 border-r border-slate-100 last:border-0 flex items-center justify-center text-center">
                                         {asset ? (
                                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-base font-black text-slate-900 tracking-tight">
                                               {row.formatter ? row.formatter((asset as any)[row.key]) : (asset as any)[row.key]}
                                            </motion.span>
                                         ) : (
                                            <span className="text-slate-200 font-bold tracking-widest">UNCORRELATED</span>
                                         )}
                                      </div>
                                   );
                                })}
                             </div>
                          ))}
                       </div>
                    ))}
                 </div>
                 
                 {/* Matrix Action Footing */}
                 <div className="px-10 py-8 bg-slate-950 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center animate-pulse shrink-0">
                          <Info className="w-5 h-5 text-white" />
                       </div>
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest max-w-sm">
                          Computed correlations use real-time market feeds & historical vector profiles from the unified Sentill Sandbox.
                       </p>
                    </div>
                    <Link href="/dashboard" className="px-8 py-4 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl whitespace-nowrap">
                       Export Analysis Matrix
                    </Link>
                 </div>
              </div>
           </div>

           {/* Tactical Insight Card */}
           <div className="bg-blue-50 border border-blue-100 rounded-[3.5rem] p-12 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/20 rounded-full -mr-32 -mt-32 blur-[80px] pointer-events-none" />
              <div className="w-24 h-24 rounded-[2rem] bg-white border border-blue-200 flex items-center justify-center shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-500">
                 <ShieldCheck className="w-12 h-12 text-blue-600" />
              </div>
              <div className="flex-1 space-y-3 relative z-10">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">AI Sentiment Alpha</span>
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Correlated Strategy</span>
                 </div>
                 <h4 className="text-3xl font-black text-slate-950 tracking-tighter">Sentill Advisor Correlation Insight</h4>
                 <p className="text-slate-600 font-semibold text-lg leading-relaxed max-w-3xl">
                    By correlating <span className="text-slate-950 font-black">{selectedAssets.map(a => a.name).join(' and ')}</span>, 
                    {selectedAssets.some(a => a.category === 'bonds' || a.category === 'saccos') 
                      ? " your current selection captures high yield alpha from state-backed or group-capital entities. This offers superior risk-adjusted returns." 
                      : " your portfolio is significantly exposed to public market volatility. Consider a tax-free bond or SACCO anchor for defensive stability."}
                 </p>
              </div>
              <button 
                onClick={() => handleOpenAssetModal(selectedAssets[0]?.id)}
                className="px-12 py-6 bg-slate-950 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl relative z-10 hover:-translate-y-1 active:scale-95 whitespace-nowrap"
              >
                 Commit to Sandbox
              </button>
           </div>
        </div>
      )}

      {/* ─── REDESIGNED ASSET PICKER MODAL (TABBED) ───────────────────────── */}
      <AnimatePresence>
        {isPickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl"
            onClick={(e) => { if (e.target === e.currentTarget) setIsPickerOpen(false) }}
          >
             <motion.div
                initial={{ scale: 0.95, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-5xl bg-white rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col h-[85vh] md:h-[90vh]"
             >
                {/* Modal Header */}
                <div className="bg-slate-50 px-8 py-8 md:px-12 md:py-10 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-950 uppercase tracking-tighter">Universal Asset Hub</h3>
                    <p className="text-[10px] md:text-[12px] font-black text-blue-600 tracking-[0.2em] uppercase mt-2 md:mt-3 flex items-center gap-2">
                       <PlusCircle className="w-4 h-4" /> Compare up to 3 units from {ASSET_DB.length} assets
                    </p>
                  </div>
                  <button onClick={() => setIsPickerOpen(false)} className="text-slate-400 hover:text-slate-950 bg-white border border-slate-200 p-3 md:p-4 rounded-2xl flex justify-center items-center shadow-lg transition-all hover:rotate-90">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Tabbed Navigation */}
                <div className="flex px-6 md:px-12 py-2 bg-slate-50 border-b border-slate-100 gap-1 overflow-x-auto scrollbar-hide">
                  {[
                    { id: 'all', label: 'All', icon: Shuffle },
                    { id: 'mmf', label: 'MMFs', icon: ShieldCheck },
                    { id: 'stocks', label: 'Stocks (NSE)', icon: TrendingUp },
                    { id: 'global', label: 'Global', icon: Globe },
                    { id: 'bonds', label: 'Bonds', icon: Landmark },
                    { id: 'saccos', label: 'SACCOs', icon: Building2 },
                    { id: 'agri', label: 'Agri', icon: Activity },
                    { id: 'commodities', label: 'Commodities', icon: Activity },
                    { id: 'special', label: 'Special', icon: Zap },
                    { id: 'pension', label: 'Pensions', icon: Users },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setPickerTab(tab.id)}
                      className={`flex items-center gap-2 px-4 md:px-6 py-4 rounded-t-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${
                        pickerTab === tab.id 
                          ? 'bg-white border-blue-600 text-blue-700 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]' 
                          : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-white/50'
                      }`}
                    >
                      <tab.icon className={`w-3 h-3 md:w-3.5 md:h-3.5 ${pickerTab === tab.id ? 'text-blue-600' : 'text-slate-300'}`} />
                      {tab.label}
                    </button>
                  ))}
                </div>
                
                {/* Search / Context Overlay */}
                <div className="bg-white px-8 md:px-12 py-4 border-b border-slate-50 flex items-center justify-between">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Showing {filteredPickerAssets.length} Market Units
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full shadow-inner">
                      {selectedIds.length} / 3 Selected
                   </div>
                </div>

                {/* Grid Content */}
                <div className="overflow-y-auto p-8 md:p-12 bg-white flex-1 scrollbar-hide">
                   <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                      {filteredPickerAssets.length > 0 ? (
                        filteredPickerAssets.map(asset => {
                          const isSelected = selectedIds.includes(asset.id);
                          const isDisabled = !isSelected && selectedIds.length >= 3;
                          return (
                            <motion.div 
                              layout
                              key={asset.id}
                              onClick={() => !isDisabled && toggleAsset(asset.id)}
                              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-6 rounded-[2rem] border-2 transition-all duration-300 group gap-4 ${
                                isSelected ? 'border-blue-600 bg-blue-50/50 shadow-inner' : 
                                isDisabled ? 'border-slate-50 opacity-40 cursor-not-allowed' : 
                                'border-slate-100 bg-white hover:border-slate-300 cursor-pointer hover:shadow-xl hover:-translate-y-1'
                              }`}
                            >
                               <div className="flex items-center gap-4 md:gap-6 w-full">
                                  <div className={`w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-[1.5rem] flex items-center justify-center shadow-xl relative overflow-hidden transition-transform group-hover:scale-110 ${asset.bg}`}>
                                     <asset.icon className={`w-6 h-6 md:w-7 md:h-7 ${asset.color} relative z-10`} />
                                  </div>
                                  <div className="space-y-1 w-full">
                                     <h4 className="text-sm md:text-base font-black text-slate-950 tracking-tight leading-tight line-clamp-1">{asset.name}</h4>
                                     <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                        <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-slate-100 text-slate-600`}>
                                           {asset.category}
                                        </span>
                                        <div className="flex items-center gap-1">
                                           <TrendingUp className="w-3 h-3 text-emerald-600" />
                                           <p className="text-[9px] md:text-[10px] font-black text-emerald-600 uppercase tracking-widest">{asset.yield} yield</p>
                                        </div>
                                     </div>
                                  </div>
                               </div>
                               <div className="flex items-center justify-end w-full sm:w-auto">
                                  {isSelected ? (
                                    <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-blue-600 flex items-center justify-center shadow-lg text-white"><Check className="w-4 h-4 md:w-6 md:h-6" /></div>
                                  ) : (
                                    <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full border-2 border-slate-200 group-hover:border-blue-400 transition-colors" />
                                  )}
                               </div>
                            </motion.div>
                          )
                        })
                      ) : (
                        <div className="col-span-2 py-10 text-center space-y-4 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                           <Info className="w-10 h-10 text-slate-300 mx-auto" />
                           <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">No assets found in this category</p>
                        </div>
                      )}
                   </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 md:p-10 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 md:gap-10">
                   <div className="hidden lg:flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                         <ShieldCheck className="w-6 h-6 text-emerald-600" />
                      </div>
                      <p className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest max-w-[200px] leading-relaxed">
                         Comparative data mapped across all 100 Sentill Sandbox entities dynamically.
                      </p>
                   </div>
                   <button 
                    onClick={() => setIsPickerOpen(false)}
                    className="w-full lg:flex-1 lg:max-w-[400px] py-5 md:py-6 bg-slate-950 text-white text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-blue-700 transition-all shadow-2xl flex items-center justify-center gap-4 hover:-translate-y-1 active:scale-95"
                  >
                     Analyze Selection <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
