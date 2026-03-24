"use client";

import { Inter } from "next/font/google";
import { AlertOctagon } from "lucide-react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-slate-950 text-white min-h-screen flex items-center justify-center p-6`}>
        <div className="max-w-md w-full bg-slate-900 border border-rose-900/50 rounded-[2.5rem] p-10 text-center shadow-2xl relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50" />
          
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertOctagon className="w-8 h-8 text-rose-500" />
          </div>
          
          <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Fatal Framework Error</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-8">
            The core engine experienced a catastrophic failure. Please refresh the terminal.
          </p>

          <button
            onClick={() => reset()}
            className="w-full py-4 bg-white hover:bg-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Force Reboot
          </button>
        </div>
      </body>
    </html>
  );
}
