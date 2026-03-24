"use client";

import { Activity, Flame, Gauge, Info, MessageCircle, Signal, TrendingUp } from "lucide-react";

interface SocialSentimentPulseProps {
  score?: number; // 0-100
  mentions?: number;
}

export default function SocialSentimentPulse({ score = 78, mentions = 1240 }: SocialSentimentPulseProps) {
  const getStatus = () => {
    if (score > 80) return { label: "EXUBERANT", color: "text-emerald-600", bg: "bg-emerald-50" };
    if (score > 50) return { label: "BULLISH", color: "text-blue-600", bg: "bg-blue-50" };
    if (score > 20) return { label: "NEUTRAL", color: "text-slate-500", bg: "bg-slate-50" };
    return { label: "FEARFUL", color: "text-rose-600", bg: "bg-rose-50" };
  };

  const status = getStatus();

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Social Pulse</h4>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Sentiment Intelligence Engine</p>
          </div>
        </div>
        <div className={`px-3 py-1 ${status.bg} rounded-full text-[10px] font-black ${status.color} uppercase tracking-widest border border-current/20`}>
          {status.label}
        </div>
      </div>

      <div className="space-y-8">
         <div className="flex items-end justify-between">
            <div className="space-y-1">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sentiment Score</span>
               <h3 className="text-5xl font-black text-slate-900 font-heading tracking-tighter">{score}<span className="text-slate-300">/100</span></h3>
            </div>
            <div className="text-right">
               <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-black mb-1">
                  <TrendingUp className="w-3 h-3" /> +12.4%
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last 24h</span>
            </div>
         </div>

         {/* Sentiment Bar */}
         <div className="grid grid-cols-5 gap-1 h-3">
            {[1, 2, 3, 4, 5].map((i) => (
               <div 
                 key={i} 
                 className={`rounded-full transition-all duration-700 ${
                   (score / 20) >= i ? 'bg-slate-950' : 'bg-slate-100'
                 }`} 
               />
            ))}
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <MessageCircle className="w-2.5 h-2.5" /> Mentions
               </span>
               <p className="text-sm font-black text-slate-900 uppercase">{(mentions/1000).toFixed(1)}K Vol</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5" /> Social Heat
               </span>
               <p className="text-sm font-black text-slate-900 uppercase">High Intensity</p>
            </div>
         </div>
      </div>

      <div className="mt-8 pt-8 border-t border-slate-100 flex items-start gap-3">
         <Signal className="w-4 h-4 text-blue-600 mt-0.5" />
         <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">
            Our Social Heatmap aggregates data from X, Reddit, and Telegram investment groups to detect institutional signals before they hit the tape.
         </p>
      </div>
    </div>
  );
}
