"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { motion } from "framer-motion";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("[Sentil Error Boundary]:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[120px] -mt-72 -ml-72 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="max-w-md w-full bg-white border border-slate-200 rounded-[2.5rem] p-10 text-center shadow-xl shadow-slate-200/50 relative z-10"
      >
        <div className="w-20 h-20 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
          <AlertTriangle className="w-10 h-10 text-rose-500" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-3">System Exception</h2>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-10">
          The Sentil neural interface encountered an unexpected anomaly while processing your request.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-[0.98]"
          >
            <RefreshCcw className="w-4 h-4" /> Re-initialize Protocol
          </button>
          <Link href="/" className="w-full flex items-center justify-center gap-2 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
            <Home className="w-4 h-4" /> Return to Hub
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
