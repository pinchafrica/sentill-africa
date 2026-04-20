"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bird, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Greetings. I am the Sentill Oracle. How can I assist your wealth journey today?" }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Mock AI Response
    setTimeout(() => {
      const aiMsg = { 
        role: "ai", 
        text: "Analyzing market data... Under currently regulated CMA protocols, Etica MMF (Zidi) shows an 18.20% gross yield — Kenya's highest. Would you like to view the full factsheet?"
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-[380px] h-[500px] mb-6 rounded-[2.5rem] flex flex-col overflow-hidden border border-slate-200 shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Bird className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">Sentill Oracle</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-700 rounded-full animate-pulse" />
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Active Intelligence</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-[12px] font-medium leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-slate-900 text-white rounded-br-none shadow-lg' 
                      : 'bg-slate-50 text-slate-700 rounded-bl-none border border-slate-100'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask the Oracle..."
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-blue-600 transition-all outline-none"
                />
                <button 
                  onClick={handleSend}
                  className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-blue-700 text-white rounded-[2rem] shadow-2xl shadow-blue-600/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8 group-hover:rotate-12 transition-transform" />}
      </button>
    </div>
  );
}
