"use client";

import Navbar from "@/components/Navbar";
import { Construction, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PlaceholderPage({ title = "Coming Soon" }: { title?: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-6 mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-[3rem] p-12 max-w-lg w-full text-center shadow-2xl shadow-slate-200/50"
        >
          <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-blue-100">
             <Construction className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-4">{title}</h1>
          <p className="text-sm font-medium text-slate-500 mb-10 leading-relaxed uppercase tracking-widest">
            Our institutional quant team is finalizing the data feeds for this market segment.
          </p>
          <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl w-full active:scale-95">
             <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
