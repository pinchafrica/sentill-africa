"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

export default function AccordionItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass-card rounded-[2rem] overflow-hidden border border-slate-800/50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-8 flex items-center justify-between text-left hover:bg-slate-900/50 transition-colors"
      >
        <span className="text-sm font-black text-white uppercase tracking-wide pr-8">{question}</span>
        <div className={`w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center transition-all ${isOpen ? 'bg-blue-700 border-blue-600 text-white' : 'text-slate-500'}`}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8 text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed border-t border-slate-800/50 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
