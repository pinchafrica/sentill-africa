"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Landmark } from "lucide-react";

export default function SovereignSeal() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/90 backdrop-blur-3xl pointer-events-none"
        >
          <div className="relative flex flex-col items-center">
            {/* Holographic background glow */}
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-0 bg-blue-600/20 rounded-full blur-[120px] scale-[2]"
            />
            
            <motion.div
              initial={{ scale: 0.8, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "backOut" }}
              className="relative z-10 flex flex-col items-center gap-6"
            >
              <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] border border-white/20 flex items-center justify-center shadow-2xl relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-4px] border border-blue-500/30 rounded-[2.8rem] border-dashed"
                />
                <Landmark className="w-12 h-12 text-blue-500" />
              </div>
              
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-black text-white uppercase tracking-[0.3em]">Institutional Node</h1>
                <div className="flex items-center justify-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-emerald-500" />
                   <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Verified Sovereign License</span>
                </div>
              </div>

              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 1.5, ease: "easeInOut" }}
                className="h-px bg-white/20 relative"
              >
                 <motion.div 
                   animate={{ x: ["0%", "100%", "0%"] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute top-0 left-0 w-8 h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                 />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
