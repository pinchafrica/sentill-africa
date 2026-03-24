"use client";

import { MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function WhatsAppFloating() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  
  const phoneNumber = "2540706206160";
  const defaultMessage = encodeURIComponent("Hello Sentill Support, I need help with...");

  useEffect(() => {
    // Check premium status
    const checkPremium = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data?.user?.isPremium) {
            setIsPremium(true);
            setTimeout(() => setIsVisible(true), 1500);
          }
        }
      } catch (err) {
        console.error("Failed to fetch premium status for concierge", err);
      }
    };
    
    checkPremium();
  }, []);

  if (!isPremium) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 50 }}
          className="fixed bottom-[110px] right-8 z-[190]"
        >
          <a
            href={`https://wa.me/${phoneNumber}?text=${defaultMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-14 h-14 bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-500/30 hover:bg-emerald-600 transition-all hover:scale-110 group relative"
            aria-label="Chat on WhatsApp"
          >
            <MessageCircle className="w-7 h-7" />
            
            {/* Tooltip */}
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Premium Concierge
              <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-slate-900" />
            </div>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
