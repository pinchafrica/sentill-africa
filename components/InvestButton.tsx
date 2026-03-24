"use client";

import { useInterceptor } from "./InterceptorModal";
import { ArrowRight, DollarSign } from "lucide-react";

export default function InvestButton({ name, paybill }: { name: string, paybill: string }) {
  const { open } = useInterceptor();

  return (
    <button 
      onClick={() => open(name, paybill)}
      className="flex-1 py-5 bg-blue-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 border border-blue-600/50"
    >
      <DollarSign className="w-4 h-4" /> Invest Directly
    </button>
  );
}
