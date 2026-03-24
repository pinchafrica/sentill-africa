"use client";

import { motion } from "framer-motion";
import { 
  Landmark, Globe, Smartphone, ShieldCheck, 
  ArrowRight, ExternalLink, ShieldAlert, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DhowCSDHub() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-blue-500/30">
      <Navbar />

      <div className="pt-40 max-w-[1400px] mx-auto px-6 lg:px-12 pb-32">
        {/* ─── TITLE / HERO ──────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
           <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-lg border border-emerald-200">
              <Landmark className="w-10 h-10" />
           </div>
           
           <h1 className="text-5xl md:text-6xl font-black text-slate-950 tracking-tighter uppercase leading-none">
              Dhow<span className="text-emerald-600">CSD</span> Portal.
           </h1>
           <p className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
              Direct market access to Central Bank of Kenya Government Securities.
           </p>
        </div>

        {/* ─── PLATFORMS LINKS GRID ──────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20 relative">
           
           {/* Web Portal Link */}
           <a 
             href="https://dhowcsd.centralbank.go.ke" 
             target="_blank" 
             rel="noreferrer"
             className="bg-white border border-slate-200 rounded-[3rem] p-10 hover:shadow-2xl transition-all group hover:-translate-y-2 relative overflow-hidden flex flex-col items-center text-center"
           >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Globe className="w-32 h-32 text-slate-900" />
              </div>
              <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-6 border border-slate-200 group-hover:bg-slate-950 group-hover:text-white transition-colors">
                 <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Web Portal</h3>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed mb-8 flex-1">
                 Access your CDS account directly from your desktop browser. Best for complex portfolio reviews.
              </p>
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors">
                 Launch Web App <ExternalLink className="w-4 h-4" />
              </span>
           </a>

           {/* iOS App Store */}
           <a 
             href="https://apps.apple.com/ke/app/dhowcsd/id6444807489" 
             target="_blank" 
             rel="noreferrer"
             className="bg-slate-950 border border-slate-800 rounded-[3rem] p-10 hover:shadow-2xl transition-all group hover:-translate-y-2 relative overflow-hidden flex flex-col items-center text-center shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]"
           >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <svg className="w-32 h-32 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M14.28 2.65c.67-.84 1.13-2.02.99-3.23-1.02.04-2.28.69-2.98 1.55-.63.76-1.18 1.98-1.01 3.16 1.14.09 2.33-.64 3-1.48zm2.49 13.56c-.02-2.19 1.83-3.26 1.92-3.32-1.03-1.48-2.64-1.68-3.21-1.72-1.37-.14-2.67.81-3.38.81-.71 0-1.78-.79-2.91-.77-1.47.02-2.83.84-3.59 2.14-1.54 2.62-.39 6.51 1.09 8.65.73 1.05 1.58 2.22 2.7 2.18 1.08-.04 1.5-.69 2.81-.69 1.3 0 1.69.69 2.83.67 1.15-.02 1.88-1.07 2.59-2.12.83-1.18 1.18-2.33 1.19-2.38-.02-.01-2.02-.76-2.04-3.45z"/></svg>
              </div>
              <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 border border-white/20 group-hover:bg-white group-hover:text-black transition-colors z-10">
                 <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M14.28 2.65c.67-.84 1.13-2.02.99-3.23-1.02.04-2.28.69-2.98 1.55-.63.76-1.18 1.98-1.01 3.16 1.14.09 2.33-.64 3-1.48zm2.49 13.56c-.02-2.19 1.83-3.26 1.92-3.32-1.03-1.48-2.64-1.68-3.21-1.72-1.37-.14-2.67.81-3.38.81-.71 0-1.78-.79-2.91-.77-1.47.02-2.83.84-3.59 2.14-1.54 2.62-.39 6.51 1.09 8.65.73 1.05 1.58 2.22 2.7 2.18 1.08-.04 1.5-.69 2.81-.69 1.3 0 1.69.69 2.83.67 1.15-.02 1.88-1.07 2.59-2.12.83-1.18 1.18-2.33 1.19-2.38-.02-.01-2.02-.76-2.04-3.45z"/></svg>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight mb-3 z-10">App Store</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-8 flex-1 z-10">
                 Download the official iOS application for your iPhone or iPad. Enjoy secure bio-metric login.
              </p>
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors z-10">
                 Download for iOS <ExternalLink className="w-4 h-4" />
              </span>
           </a>

           {/* Google Play Store */}
           <a 
             href="https://play.google.com/store/apps/details?id=com.cbk.dhowcsd" 
             target="_blank" 
             rel="noreferrer"
             className="bg-emerald-50 border border-emerald-100 rounded-[3rem] p-10 hover:shadow-2xl transition-all group hover:-translate-y-2 relative overflow-hidden flex flex-col items-center text-center"
           >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Smartphone className="w-32 h-32 text-emerald-900" />
              </div>
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition-colors z-10">
                 <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M3.23 21.031c-.135-.145-.23-.33-.23-.556V3.526c0-.226.095-.41.23-.556L12.42 12 3.23 21.031zM4.09 2.506c.264-.132.576-.145.854-.01l12.457 7.072-3.868 3.868L4.09 2.506zm14.172 8.046L21.49 12l-3.228 1.448-1.503-1.503 1.503-1.393zM4.09 21.494l9.444-10.93 3.868 3.869-12.457 7.072c-.278.135-.59.122-.854-.01z"/></svg>
              </div>
              <h3 className="text-2xl font-black text-emerald-950 tracking-tight mb-3 z-10">Google Play</h3>
              <p className="text-[11px] font-bold text-emerald-800/60 uppercase tracking-widest leading-relaxed mb-8 flex-1 z-10">
                 Download the official Android application. Trade infrastructure bonds and T-bills natively.
              </p>
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600/50 group-hover:text-emerald-700 transition-colors z-10">
                 Download for Android <ExternalLink className="w-4 h-4" />
              </span>
           </a>

        </div>

        {/* ─── INFO SECTION ──────────────────────────── */}
        <div className="border border-slate-200 bg-white rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center gap-10 shadow-sm">
           <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center border border-rose-100 flex-shrink-0 animate-pulse">
              <ShieldAlert className="w-10 h-10 text-rose-500" />
           </div>
           <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Important Notice</h3>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-600 leading-relaxed mb-6 max-w-2xl">
                 DhowCSD is managed solely by the Central Bank of Kenya. Sentill provides these links for convenience and does not directly execute CSD portal trades. Never share your DhowCSD PIN or credentials with anyone.
              </p>
              <ul className="grid sm:grid-cols-2 gap-4">
                 <li className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> CBK Regulated Link
                 </li>
                 <li className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero Intermediary Fees
                 </li>
              </ul>
           </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
