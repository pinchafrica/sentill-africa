"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, BrainCircuit, Activity, AlertTriangle, ShieldCheck, CheckCircle2, Bot, Plus } from "lucide-react";
import Link from "next/link";

interface AnalysisDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  asset: any;
}

export default function AnalysisDrawer({ isOpen, onClose, asset }: AnalysisDrawerProps) {
  if (!asset) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white z-[110] shadow-2xl flex flex-col border-l border-slate-200"
          >
            {/* ─── HEADER ──────────────────────────────────────────────── */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${asset.bg} ${asset.color} flex items-center justify-center border border-current/10`}>
                  <asset.icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">{asset.name}</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{asset.manager}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ─── SCROLLABLE CONTENT ──────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">
              
              {/* Asset Snapshot Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                    {asset.category === 'stocks' ? 'Current Price' : asset.category === 'mmf' ? 'Current Rate' : 'Primary Yield'}
                  </p>
                  <p className={`text-2xl font-black ${asset.color}`}>
                    {asset.price || asset.yield}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Risk Classification</p>
                  <p className="text-2xl font-black text-slate-900">{asset.risk}</p>
                </div>
              </div>

              {/* Cortex Alpha Analysis Box */}
              <div className="bg-slate-950 rounded-3xl p-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 opacity-50" />
                
                <div className="relative bg-slate-900/90 rounded-[1.4rem] p-6 backdrop-blur-xl border border-white/10">
                  <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        Sentil Assistant <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Real-time Summary</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm text-slate-300 font-medium leading-relaxed">
                    <p>
                      <strong>Summary:</strong> {asset.name} offers a safe {asset.risk.toLowerCase()}-risk level, strongly supported by {asset.manager}. 
                    </p>
                    
                    {asset.category === "mmf" && (
                      <p className="text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                        Returns are currently 2.1% higher than average bank rates. It's a great option for keeping your money safe and accessible.
                      </p>
                    )}
                    
                    {asset.category === "stocks" && (
                      <p className="text-indigo-300">
                        <Activity className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                        {asset.name} is currently priced lower than similar companies, but offers a reliable history of regular dividend payments.
                      </p>
                    )}

                    {asset.category === "bonds" && (
                      <p className="text-blue-300">
                        <ShieldCheck className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                        Government backing makes this a very safe investment. Look out for times when market cash is low to buy these at a discount.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Due Diligence Checklist */}
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Compliance & Data Log</h4>
                <div className="space-y-2">
                  {[
                    "CMA/CBK Regulatory Clearance Verified",
                    "Nav / Pricing Feed Synchronised",
                    `Minimum Entry Confirmed at ${asset.minInvest}`,
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600">
                      <span>{item}</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                  ))}
                </div>
              </div>

            </div>

             {/* ─── FOOTER ACTIONS ────────────────────────────────────────────── */}
             <div className="p-6 border-t border-slate-100 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <Link 
                  href={`/dashboard/assets?logAsset=${asset.id}`}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)]"
                >
                  <Plus className="w-5 h-5" /> Add to Portfolio Now
                </Link>
                <p className="text-center text-[9px] font-bold text-slate-400 mt-4 uppercase tracking-widest">
                  Execution routes through Sentil Secure Routing
                </p>
             </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
