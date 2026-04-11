"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Sparkles } from "lucide-react";

const QUICK_MSGS = [
  { emoji: "📊", label: "Investment Options", msg: "Hi Sentill! I'd like to explore investment options in Kenya." },
  { emoji: "💰", label: "MMF Rates", msg: "Hi Sentill! What are the best MMF rates today?" },
  { emoji: "📈", label: "NSE Stocks", msg: "Hi Sentill! I want to learn about NSE stock opportunities." },
  { emoji: "🎓", label: "Get Started", msg: "Hi Sentill! I'm new and want to get started with investing." },
];

export default function WhatsAppFloating() {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const phoneNumber = "254703469525";

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    const tooltipShow = setTimeout(() => setShowTooltip(true), 5000);
    const tooltipHide = setTimeout(() => setShowTooltip(false), 12000);

    return () => {
      clearTimeout(timer);
      clearTimeout(tooltipShow);
      clearTimeout(tooltipHide);
    };
  }, []);

  const openWhatsApp = (message: string) => {
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
    setIsExpanded(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 50 }}
          className="fixed bottom-24 right-5 z-[195] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
        >
          {/* Expanded Quick Actions Panel */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-[1.5rem] shadow-2xl shadow-emerald-900/20 border border-slate-200 overflow-hidden w-[300px]"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-[#075e54] to-[#128c7e] p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-black text-sm">Sentill Africa</p>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                          <span className="text-emerald-200 text-[9px] font-bold uppercase tracking-widest">Online Now</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Chat bubble */}
                <div className="p-4 bg-[#ece5dd]">
                  <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm max-w-[85%] relative">
                    <div className="absolute -top-0 -left-2 w-4 h-4 bg-white" style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }} />
                    <p className="text-slate-800 text-sm font-medium leading-relaxed">
                      👋 Hi there! How can we help you today? Tap a topic below or type your own message.
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 block text-right">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="p-4 space-y-2">
                  {QUICK_MSGS.map((item, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      onClick={() => openWhatsApp(item.msg)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100 transition-all text-left group"
                    >
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">{item.label}</span>
                      <svg className="w-4 h-4 text-emerald-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </motion.button>
                  ))}
                </div>

                {/* Bottom CTA */}
                <div className="px-4 pb-4">
                  <button
                    onClick={() => openWhatsApp("Hello Sentill, I'd like to learn more about investment options in Kenya.")}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-500/20"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Start Custom Chat
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tooltip Label */}
          <AnimatePresence>
            {showTooltip && !isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                className="bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-xl border border-slate-200 whitespace-nowrap flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Chat with Us
              </motion.div>
            )}
          </AnimatePresence>

          {/* WhatsApp FAB */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center w-[60px] h-[60px] bg-gradient-to-br from-[#25D366] to-[#128c7e] text-white rounded-full shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all hover:scale-110 group relative"
            aria-label="Chat on WhatsApp"
            onMouseEnter={() => { if (!isExpanded) setShowTooltip(true); }}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <AnimatePresence mode="wait">
              {isExpanded ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div key="wa" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pulse ring */}
            {!isExpanded && <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />}
            
            {/* Unread badge */}
            {!isExpanded && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-lg">
                1
              </span>
            )}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
