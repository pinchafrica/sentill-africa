"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface OnboardingModalProps {
  name: string;
  goal: string | null;
  onDismiss: () => void;
}

export default function OnboardingModal({ name, goal, onDismiss }: OnboardingModalProps) {
  const router = useRouter();
  const firstName = name?.split(" ")[0] || "there";

  const goalConfig: Record<string, { emoji: string; headline: string; cta: string; href: string }> = {
    SAVINGS: {
      emoji: "💰",
      headline: "See today's best Money Market Fund rates",
      cta: "View MMF Leaderboard →",
      href: "/markets",
    },
    EQUITIES: {
      emoji: "📈",
      headline: "Get today's AI stock signals for the NSE",
      cta: "View NSE Signals →",
      href: "/markets",
    },
    BONDS: {
      emoji: "🏛️",
      headline: "Compare T-Bills and Infrastructure Bonds",
      cta: "View Bond Rates →",
      href: "/markets",
    },
    CHAMA: {
      emoji: "👥",
      headline: "Set up your Chama group investment tracker",
      cta: "Open Chama Terminal →",
      href: "/chama",
    },
  };

  const config = (goal ? goalConfig[goal] : undefined) ?? {
    emoji: "🚀",
    headline: "Compare every investment option in Kenya",
    cta: "Explore Markets →",
    href: "/markets",
  };

  const handleCTA = () => {
    onDismiss();
    router.push(config.href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onDismiss} />

      {/* Card */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-8 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-500">
        <button
          onClick={onDismiss}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>

        {/* Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full mb-5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Account Active</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">
          Welcome, {firstName}.
        </h2>
        <p className="text-sm text-slate-500 font-medium mb-6">
          Your free account is ready. Here's your first step:
        </p>

        {/* Goal card */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 mb-5">
          <div className="text-3xl mb-3">{config.emoji}</div>
          <p className="text-sm font-bold text-slate-700">{config.headline}</p>
        </div>

        <button
          onClick={handleCTA}
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all active:scale-[0.98] mb-3"
        >
          {config.cta}
        </button>

        <button
          onClick={onDismiss}
          className="w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-700 transition-colors"
        >
          Explore on my own
        </button>
      </div>
    </div>
  );
}
