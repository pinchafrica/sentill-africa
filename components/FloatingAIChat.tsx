"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, BrainCircuit } from "lucide-react";

import { useAIStore } from "@/lib/store";

export default function FloatingAIChat() {
  const { setPremiumModalOpen } = useAIStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai", text: string }[]>([
    { role: "ai", text: "I am Sentill AI. Ask me to analyze an asset, calculate yields, or optimize your tax strategy." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage })
      });
      
      const data = await res.json();

      if (data.error === "upgrade_required") {
         setMessages(prev => [...prev, { role: "ai", text: "This feature requires Sentill Premium." }]);
         setPremiumModalOpen(true);
         return;
      }

      const reply = data.response || "Sentill AI is upgrading capabilities. Try again later.";
      
      setMessages(prev => [...prev, { role: "ai", text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", text: "Network error. AI system offline." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-indigo-600/30 transition-all hover:scale-105 z-50 group border border-indigo-400/30"
        >
          <div className="absolute inset-0 bg-indigo-400 rounded-full blur-xl opacity-20 group-hover:opacity-40 animate-pulse transition-opacity" />
          <MessageSquare className="w-6 h-6 relative z-10" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-50 rounded-full" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[360px] h-[500px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-200 z-[100] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 flex items-center justify-between border-b border-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-2xl rounded-full -mt-10 -mr-10 pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-1">
                  Sentill AI <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                </h3>
                <p className="text-[9px] text-indigo-200 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl transition-colors relative z-10"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-medium leading-relaxed ${
                  m.role === "user" 
                    ? "bg-indigo-600 text-white rounded-tr-sm" 
                    : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask Sentill AI..."
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none rounded-xl px-4 py-3 text-xs font-medium text-slate-700 placeholder:text-slate-400 transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-11 h-11 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:bg-slate-300 text-white rounded-xl transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
