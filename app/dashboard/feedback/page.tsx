"use client";

import { MessageSquare, Send, Zap, Star, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function FeedbackPage() {
  const [loading, setLoading] = useState(false);
  const [area, setArea] = useState("Wealth Terminal (Dashboard)");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a message before submitting.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area, message, rating: rating || null }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Feedback Transmitted", {
        description: "Your insights have been prioritized by the team.",
      });
      setMessage("");
      setRating(0);
    } catch {
      toast.error("Submission failed — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="space-y-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-emerald-600" /> Alpha Feedback
        </h1>
        <p className="text-slate-500 font-medium text-lg leading-relaxed">
          Your insights drive the evolution of Sentill. Share your experience directly with the engineering and strategy teams.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Feature Area</label>
            <select
              value={area}
              onChange={e => setArea(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-black text-slate-900 uppercase tracking-tight focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
            >
              <option>Wealth Terminal (Dashboard)</option>
              <option>Cortex AI Intelligence</option>
              <option>Market Allocation Maps</option>
              <option>SACCO / Chama Audit Tools</option>
              <option>WhatsApp Bot</option>
              <option>Pricing / Subscription</option>
              <option>Other / Future Feature</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Neural Insight (Your Message)</label>
            <textarea
              rows={6}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Describe your suggestion or report a neural anomaly..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UX Rating</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(s)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-5 h-5 ${s <= (hovered || rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-3">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Protocol Sync</p>
              <div className="flex items-center gap-2 text-emerald-700 font-black text-xs uppercase">
                <ShieldCheck className="w-4 h-4" /> Priority Channel
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? "Transmitting..." : "Submit Insight"} <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="p-8 bg-blue-50 border border-blue-100 rounded-3xl flex gap-6 items-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight">Sentill Alpha Program</h4>
          <p className="text-xs font-medium text-blue-700 leading-relaxed mt-1 uppercase tracking-wider">
            High-fidelity feedback is rewarded with early access to <span className="text-blue-900">Neural V2</span> and proprietary yield alerts.
          </p>
        </div>
      </div>
    </div>
  );
}
