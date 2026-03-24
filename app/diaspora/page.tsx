"use client";

import { useState } from "react";
import { 
  Globe, 
  ArrowRightLeft, 
  ShieldCheck, 
  Building2, 
  Briefcase, 
  TrendingUp, 
  CheckCircle2, 
  Landmark, 
  BadgeDollarSign, 
  FileText,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function DiasporaHub() {
  const [activeTab, setActiveTab] = useState<"remittance" | "bonds" | "realestate" | "tax">("remittance");

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      {/* ═══════════════════════════════════════════════════════════════════════
          HEADER HERO
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-40 pb-32 bg-slate-950 overflow-hidden text-white border-t border-white/10">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] -mr-96 -mt-96 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[100px] -ml-64 -mb-64 pointer-events-none" />
        
        <div className="max-w-[1200px] mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-300 text-[10px] font-black uppercase tracking-[0.3em]">
              <Globe className="w-3 h-3" /> Sentill Global
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-tight drop-shadow-2xl">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Diaspora</span> Wealth Command.
            </h1>
            <p className="text-slate-400 text-lg sm:text-xl font-medium leading-relaxed max-w-xl">
              Zero-friction remittance routing, tax-exempt institutional bonds, and verified asset acquisition across East Africa—all monitored from anywhere in the world.
            </p>
            <div className="flex flex-wrap items-center gap-4">
               <button className="px-8 py-4 bg-white text-slate-950 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors shadow-xl">
                 Access Global Terminal
               </button>
               <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                 Read Diaspora Report
               </button>
            </div>
          </div>
          <div className="hidden lg:block">
             <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 shadow-2xl backdrop-blur-sm relative">
                <div className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Live Data
                </div>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Diaspora Remittance Inflows</h3>
                <div className="space-y-6">
                   <div className="flex items-end justify-between border-b border-white/10 pb-4">
                      <div>
                         <p className="text-3xl font-black text-white">$4.19 Billion</p>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Annual (CBK Data)</p>
                      </div>
                      <div className="text-emerald-400 text-sm font-black flex items-center gap-1"><TrendingUp className="w-4 h-4" /> +4.0%</div>
                   </div>
                   <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                         <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> North America</span>
                         <span>58%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                         <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Europe</span>
                         <span>17%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                         <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /> Asia & Middle East</span>
                         <span>8%</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SENTILL AI DIASPORA ORACLE
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-[1200px] mx-auto px-6 -mt-10 relative z-20 mb-12">
         <div className="bg-slate-900 border border-slate-700/50 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl flex flex-col md:flex-row gap-8 items-center overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 pointer-events-none group-hover:scale-105 transition-transform duration-700" />
            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-800 text-blue-400 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 border border-slate-700 relative z-10">
               <Zap className="w-8 h-8 animate-pulse" />
            </div>
            <div className="flex-1 space-y-2 relative z-10">
               <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Sentill AI Global Matrix</h3>
                  <span className="bg-blue-600/20 text-blue-400 text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest border border-blue-500/30 w-max">Live Market Scan</span>
               </div>
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-2xl">
                 Machine learning identifies a <span className="text-emerald-400">1.2% FX arbitrage</span> opportunity between current USD-KES interbank spreads and the upcoming tax-free IFB coupon structure. 
               </p>
            </div>
            <div className="relative z-10 shrink-0 w-full md:w-auto">
               <button className="w-full md:w-auto px-6 py-4 bg-blue-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 border border-blue-400/50 hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
                  <Zap className="w-3.5 h-3.5" /> Unlock AI Strategy
               </button>
            </div>
         </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          DATA-RICH TABS FOR DIFFERENT ASSET CLASSES
         ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 max-w-[1200px] mx-auto px-6">
         
         <div className="text-center mb-16">
            <h2 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">Intelligence Hub</h2>
            <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Cross-Border Asset Execution.</h3>
         </div>

         {/* Navigation Tabs */}
         <div className="flex flex-wrap items-center justify-center gap-2 mb-16">
            {[
              { id: "remittance", label: "Remittance & FX", icon: ArrowRightLeft },
              { id: "bonds", label: "Infrastructure Bonds", icon: Landmark },
              { id: "realestate", label: "Verified Real Estate", icon: Building2 },
              { id: "tax", label: "Tax & Compliance", icon: FileText }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? "bg-slate-950 text-white shadow-xl" 
                    : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
         </div>

         {/* Content Area */}
         <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden p-8 lg:p-16 min-h-[500px]">
            <AnimatePresence mode="wait">
            
            {activeTab === "remittance" && (
              <motion.div key="rem" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid lg:grid-cols-2 gap-12">
                 <div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                       <ArrowRightLeft className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Zero-Friction FX Routing</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                       Traditional money transfer operators (MTOs) erode wealth through hidden exchange rate markups and transfer fees. Sentill aggregates APIs from licensed institutional brokers to provide inter-bank FX rates for our diaspora users directly funding investment accounts.
                    </p>
                    <ul className="space-y-4">
                       <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          <div>
                             <p className="text-sm font-bold text-slate-900">Direct-to-Broker Funding</p>
                             <p className="text-xs text-slate-500 font-medium">Bypass personal bank accounts to avoid double-taxation triggers.</p>
                          </div>
                       </li>
                       <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          <div>
                             <p className="text-sm font-bold text-slate-900">USD Denominated Local Assets</p>
                             <p className="text-xs text-slate-500 font-medium">Invest in USD unit trusts to hedge against KES depreciation.</p>
                          </div>
                       </li>
                    </ul>
                 </div>
                 <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-200/50 rounded-full blur-3xl -mr-16 -mt-16" />
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Execution Flow</h4>
                    <div className="space-y-4 relative z-10">
                       <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                          <span className="text-xs font-bold text-slate-600">Send From (USD/GBP/EUR)</span>
                          <Globe className="w-4 h-4 text-slate-400" />
                       </div>
                       <div className="w-0.5 h-6 bg-slate-200 mx-auto" />
                       <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-blue-200 shadow-md shadow-blue-500/10">
                          <span className="text-xs font-black text-blue-600">Institutional FX Desk</span>
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded">Inter-bank + 0.1%</span>
                       </div>
                       <div className="w-0.5 h-6 bg-slate-200 mx-auto" />
                       <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800 text-white shadow-xl">
                          <span className="text-xs font-bold">CMA Licensed Asset Manager</span>
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === "bonds" && (
              <motion.div key="bonds" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid lg:grid-cols-2 gap-12">
                 <div>
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6">
                       <Landmark className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Infrastructure Bonds (IFB)</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                       Kenyan Infrastructure Bonds are explicitly designed to attract capital for sovereign projects. For the diaspora, they represent the apex of passive income: highly secure, sovereign-backed, and crucially—100% tax-free.
                    </p>
                    <ul className="space-y-4">
                       <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          <div>
                             <p className="text-sm font-bold text-slate-900">Tax Exemption</p>
                             <p className="text-xs text-slate-500 font-medium">Coupon payments are completely exempt from Withholding Tax (WHT).</p>
                          </div>
                       </li>
                       <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          <div>
                             <p className="text-sm font-bold text-slate-900">High Historical Yields</p>
                             <p className="text-xs text-slate-500 font-medium">Recent issuances have cleared between 16% and 18.5% structurally.</p>
                          </div>
                       </li>
                       <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          <div>
                             <p className="text-sm font-bold text-slate-900">Secondary Market Liquidity</p>
                             <p className="text-xs text-slate-500 font-medium">Can be traded OTC at the NSE before maturity if liquidity is needed.</p>
                          </div>
                       </li>
                    </ul>
                 </div>
                 <div className="bg-slate-950 rounded-[2rem] p-8 border border-slate-800 text-white flex flex-col justify-center">
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6">Sample IFB Calculator</h4>
                    <div className="space-y-6">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Principal</p>
                             <p className="text-lg font-black tracking-tight">KES 1,000,000</p>
                          </div>
                          <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Coupon Rate</p>
                             <p className="text-lg font-black tracking-tight text-emerald-400">18.00%</p>
                          </div>
                       </div>
                       <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-6 rounded-2xl">
                          <div className="flex justify-between items-center mb-4 border-b border-emerald-500/20 pb-4">
                             <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Annual Cashflow</span>
                             <span className="text-2xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">KES 180,000</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                             <span>Taxes Deducted (0%)</span>
                             <span className="text-slate-500">KES 0.00</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === "realestate" && (
              <motion.div key="re" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid lg:grid-cols-2 gap-12">
                 <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                       <Building2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Institutional Real Estate (REITs)</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                       Avoid informal, fraudulent land deals. Sentill tracks publicly traded Real Estate Investment Trusts (I-REITs) and thoroughly audited, tier-1 developer projects. Get exposure to prime commercial and residential properties without physically managing concrete.
                    </p>
                    <ul className="space-y-4">
                       <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          <div>
                             <p className="text-sm font-bold text-slate-900">Capital Protection</p>
                             <p className="text-xs text-slate-500 font-medium">CMA regulated trusts with stringent reporting standards.</p>
                          </div>
                       </li>
                       <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          <div>
                             <p className="text-sm font-bold text-slate-900">Dividend Yields</p>
                             <p className="text-xs text-slate-500 font-medium">Consistent rental income distributed safely as dividends.</p>
                          </div>
                       </li>
                    </ul>
                 </div>
                 <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 flex flex-col justify-center">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">Market Leaders</h4>
                    <div className="space-y-4">
                       <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                          <div>
                             <p className="text-sm font-black text-slate-900">ILAM Fahari I-REIT</p>
                             <p className="text-[10px] font-bold text-slate-500 uppercase">Commercial Property</p>
                          </div>
                          <span className="text-emerald-500 font-black text-sm text-right">~6.8% Yield</span>
                       </div>
                       <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                          <div>
                             <p className="text-sm font-black text-slate-900">Acorn Student Accommodation</p>
                             <p className="text-[10px] font-bold text-slate-500 uppercase">D-REIT / I-REIT</p>
                          </div>
                          <span className="text-emerald-500 font-black text-sm text-right">~9.1% Yield</span>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === "tax" && (
              <motion.div key="tax" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid lg:grid-cols-2 gap-12">
                 <div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
                       <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Non-Resident Tax Matrix</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                       KRA regulations treat non-resident individuals differently depending on the asset class. Sentill provides a structural breakdown so you aren't severely penalized by double taxation issues.
                    </p>
                    <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg">
                       Download Tax Framework PDF
                    </button>
                 </div>
                 <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="border-b border-slate-100">
                             <th className="py-3 px-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Asset Category</th>
                             <th className="py-3 px-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Withholding Tax (WHT)</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          <tr><td className="py-4 px-2 text-xs font-bold text-slate-700">Money Market Funds</td><td className="py-4 px-2 text-xs font-black text-slate-900 text-right">15%</td></tr>
                          <tr><td className="py-4 px-2 text-xs font-bold text-slate-700">Infrastructure Bonds</td><td className="py-4 px-2 text-xs font-black text-emerald-600 text-right">0% (Exempt)</td></tr>
                          <tr><td className="py-4 px-2 text-xs font-bold text-slate-700">T-Bills & Normal Bonds</td><td className="py-4 px-2 text-xs font-black text-slate-900 text-right">15%</td></tr>
                          <tr><td className="py-4 px-2 text-xs font-bold text-slate-700">Dividends (Stocks)</td><td className="py-4 px-2 text-xs font-black text-slate-900 text-right">15% (Non-Resident)</td></tr>
                       </tbody>
                    </table>
                 </div>
              </motion.div>
            )}

            </AnimatePresence>
         </div>
      </section>
      
    </div>
  );
}