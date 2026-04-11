"use client";

import { useState } from "react";
import { MessageCircle, CheckCircle, AlertTriangle, Send, Clock, RefreshCw, Phone, Eye } from "lucide-react";

interface SendResult {
  success: boolean;
  sentAt: string;
  recipients: number;
  preview: string;
  results: Array<{ ok: boolean; status: number; data: any }>;
  error?: string;
}

export default function WhatsAppAdminPanel() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [result, setResult] = useState<SendResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleSend = async () => {
    setStatus("sending");
    setResult(null);
    try {
      const res = await fetch("/api/cron/whatsapp-daily?secret=sentil-cron-2025", {
        method: "POST",
      });
      const data: SendResult = await res.json();
      setResult(data);
      setStatus(data.success ? "success" : "error");
    } catch (err: any) {
      setStatus("error");
      setResult({ success: false, sentAt: "", recipients: 0, preview: "", error: err.message, results: [] });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">WhatsApp Intelligence Broadcast</h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Daily market digest → +254 706 206 160</p>
        </div>
      </div>

      {/* Schedule Info */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Auto Schedule</span>
          </div>
          <p className="text-sm font-black text-slate-900">Mon–Fri · 7:30 AM EAT</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Recipient</span>
          </div>
          <p className="text-sm font-black text-slate-900">+254 706 206 160</p>
        </div>
      </div>

      {/* What's included */}
      <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl">
        <p className="text-[9px] font-black uppercase tracking-widest text-green-700 mb-3">Message includes daily:</p>
        <div className="space-y-1.5">
          {[
            "Top 3 MMF yields (CIC, Zidi, Lofty)",
            "T-Bill gross & net yields (all 3 tenors)",
            "Best IFB coupon (IFB1/2024 - WHT free)",
            "NSE top movers (SCOM, EQTY, KCB)",
            "Platform stats (premium users, AUM)",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
              <p className="text-[11px] font-bold text-green-800">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleSend}
          disabled={status === "sending"}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-60"
        >
          {status === "sending" ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {status === "sending" ? "Sending..." : "Send Now (Manual)"}
        </button>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-xl p-4 border ${result.success ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
          <div className="flex items-center gap-2 mb-2">
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span className={`text-[10px] font-black uppercase tracking-widest ${result.success ? "text-emerald-700" : "text-rose-700"}`}>
              {result.success ? `Sent to ${result.recipients} recipient${result.recipients !== 1 ? "s" : ""} ✓` : `Failed: ${result.error || "Unknown error"}`}
            </span>
          </div>
          {result.sentAt && (
            <p className="text-[9px] font-bold text-slate-500">{new Date(result.sentAt).toLocaleString("en-KE")}</p>
          )}
        </div>
      )}

      {/* Message Preview */}
      {showPreview && result?.preview && (
        <div className="mt-4 bg-slate-900 rounded-xl p-4 border border-slate-700">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Message Preview</p>
          <pre className="text-[11px] text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">{result.preview}</pre>
        </div>
      )}

      {/* Setup reminder */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-[10px] font-bold text-amber-800 leading-relaxed">
          ⚠️ <strong>Setup required:</strong> Add <code className="bg-amber-100 px-1 rounded">WHATSAPP_PHONE_NUMBER_ID</code> and{" "}
          <code className="bg-amber-100 px-1 rounded">WHATSAPP_ACCESS_TOKEN</code> to <code className="bg-amber-100 px-1 rounded">.env.local</code>{" "}
          from your <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="underline">Meta Developer Console</a>.
        </p>
      </div>
    </div>
  );
}
