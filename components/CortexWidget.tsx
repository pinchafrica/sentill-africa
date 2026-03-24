"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, X, Send, Sparkles, Terminal, ArrowDownToLine, Loader2 } from "lucide-react";
import { useAIStore } from "@/lib/store";

type Message = {
  id: string;
  role: "user" | "cortex";
  content: string;
};

export default function CortexWidget() {
  const { setPremiumModalOpen } = useAIStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "cortex",
      content: "I am Sentill Cortex, your institutional AI analyst. Ask me to compare yields, run WHT tax calculations, or analyze specific NSE assets."
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // In production, this hits your actual 'Ultra' AI Plan via /api/ai
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage.content }),
      });

      const data = await res.json();

      if (data.error === "upgrade_required") {
         setMessages((prev) => [...prev, { id: Date.now().toString(), role: "cortex", content: "This deep institutional analysis requires Sentill Premium." }]);
         setPremiumModalOpen(true);
         return;
      }

      if (!res.ok) {
        throw new Error(data.details || data.error || "Failed to parse Core Intelligence");
      }

      const cortexMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "cortex",
        content: data.response || "Neural execution completed, but no payload was returned.",
      };

      setMessages((prev) => [...prev, cortexMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Unable to reach the Ultra node.";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "cortex",
          content: `⚠️ Network execution failed. ${errorMessage}`
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* ── FLOATING TRIGGER BUTTON ── */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-16 pl-2 pr-6 bg-slate-950 rounded-full shadow-2xl shadow-blue-600/20 flex items-center gap-3 border border-slate-800 hover:border-blue-600 hover:scale-105 transition-all group overflow-hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-slate-800 group-hover:border-blue-600 transition-colors shrink-0">
          <img src="/cortex-avatar.jpg" alt="Sentill Cortex Avatar" className="w-full h-full object-cover" />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-blue-600 border-2 border-slate-950 rounded-full animate-pulse" />
        </div>

        <div className="flex flex-col items-start relative z-10">
          <span className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
            Sentill Cortex <Sparkles className="w-3 h-3 text-blue-500" />
          </span>
          <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest flex items-center gap-1">
            Institutional AI
          </span>
        </div>
      </motion.button>

      {/* ── CHAT WINDOW ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-24 right-6 z-[60] w-[380px] h-[600px] max-h-[80vh] bg-white rounded-[2rem] shadow-2xl shadow-slate-900/50 flex flex-col overflow-hidden border border-slate-200"
          >
            {/* Header */}
            <div className="relative bg-slate-950 p-5 shrink-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl border border-slate-700 shrink-0 overflow-hidden shadow-inner">
                    <img src="/cortex-avatar.jpg" alt="Sentill Cortex" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                      Sentill Cortex <Sparkles className="w-3 h-3 text-blue-500" />
                    </h3>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.2em] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" /> Online
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed ${msg.role === "user"
                      ? "bg-blue-700 text-white rounded-br-sm"
                      : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm"
                    }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Querying Matrix...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Cortex..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all shadow-inner"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="w-12 shrink-0 bg-slate-950 text-blue-500 rounded-xl flex items-center justify-center hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-800"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
              <div className="mt-3 flex items-center justify-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-300">
                <span className="flex items-center gap-1"><Terminal className="w-3 h-3" /> Ultra Model</span>
                <span className="flex items-center gap-1"><ArrowDownToLine className="w-3 h-3" /> Real-time Data</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
