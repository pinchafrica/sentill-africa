"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, Plus, Zap, LifeBuoy, X, 
  ChevronUp, MessageSquare, ShieldCheck, HeartPulse, TrendingUp, Fingerprint
} from "lucide-react";
import { useAIStore } from "@/lib/store";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FloatingActionHub() {
  const { 
    toggleChat, isChatOpen
  } = useAIStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const actions = [
    { 
      id: "safety", 
      icon: LifeBuoy, 
      label: "Safety", 
      color: "bg-amber-600", 
      onClick: () => { router.push("/dashboard/analyze?tab=safety"); setIsExpanded(false); }
    },
    { 
      id: "tax", 
      icon: Fingerprint, 
      label: "Tax Alpha", 
      color: "bg-indigo-600", 
      onClick: () => { router.push("/dashboard/analyze?tab=tax"); setIsExpanded(false); }
    },
    { 
      id: "forecast", 
      icon: TrendingUp, 
      label: "Forecast", 
      color: "bg-blue-600", 
      onClick: () => { router.push("/dashboard/analyze?tab=forecast"); setIsExpanded(false); }
    },
    { 
      id: "health", 
      icon: HeartPulse, 
      label: "Health", 
      color: "bg-emerald-600", 
      onClick: () => { router.push("/dashboard/analyze?tab=health"); setIsExpanded(false); }
    },
  ];

  return (
    <div className="fixed bottom-8 left-8 z-[201] flex flex-col items-center gap-4">
      {/* Sub-Actions Stack */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="flex flex-col items-center gap-3 mb-2"
          >
            {actions.map((action, i) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={action.onClick}
                className={`group relative flex items-center gap-3 p-3.5 rounded-2xl ${action.color} text-white shadow-xl shadow-black/20 border-t border-white/20`}
              >
                <span className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/10">
                  {action.label}
                </span>
                <action.icon className="w-5 h-5" />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Pulse / AI Toggle */}
      <div className="relative group">
         {/* Utility Expand Toggle */}
         <button
           onClick={() => setIsExpanded(!isExpanded)}
           className={`absolute -top-12 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
             isExpanded ? "bg-slate-200 text-slate-950 rotate-180" : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
           } backdrop-blur-md border border-white/10`}
         >
            <ChevronUp className="w-4 h-4" />
         </button>

         <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              toggleChat();
              setIsExpanded(false);
            }}
            className={`w-16 h-16 flex items-center justify-center rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.3)] border-t-2 border-white/20 transition-all duration-500 overflow-hidden relative ${
              isChatOpen ? "bg-blue-600 rotate-90" : "bg-slate-950"
            }`}
          >
            <div className={`absolute inset-0 bg-blue-500 opacity-0 transition-opacity duration-500 ${isChatOpen ? "opacity-20" : "group-hover:opacity-10"}`} />
            {isChatOpen ? <X className="w-7 h-7 text-white" /> : <Bot className="w-7 h-7 text-white" />}
            
            {/* Pulsing Alert if not open */}
            {!isChatOpen && (
              <span className="absolute top-4 right-4 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
            )}
          </motion.button>
      </div>
    </div>
  );
}
