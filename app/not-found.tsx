"use client";

import Link from "next/link";
import { MoveLeft, ShieldAlert, Ghost } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -mt-64 -ml-64 animate-pulse" />
      
      <div className="max-w-md w-full text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-slate-900 rounded-[2rem] border border-white/10 flex items-center justify-center mx-auto shadow-2xl">
              <ShieldAlert className="w-12 h-12 text-blue-500" />
            </div>
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -top-4 -right-4"
            >
              <Ghost className="w-8 h-8 text-slate-700" />
            </motion.div>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl font-black text-white tracking-tighter">404.</h1>
            <h2 className="text-xl font-black text-slate-300 uppercase tracking-widest">Intelligence Gap</h2>
            <p className="text-sm font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
              The asset or insight you are looking for has been moved or does not exist in our current matrix.
            </p>
          </div>

          <div className="pt-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
            >
              <MoveLeft className="w-4 h-4" /> Return to Command Center
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <p className="text-[9px] font-black text-slate-800 uppercase tracking-[0.4em]">Sentill Africa • System Error v1.0</p>
      </div>
    </div>
  );
}
