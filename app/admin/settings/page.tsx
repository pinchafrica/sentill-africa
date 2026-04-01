"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  CreditCard, 
  Smartphone, 
  ShieldCheck, 
  Save, 
  Eye, 
  EyeOff,
  AlertTriangle,
  Globe,
  Lock,
  RefreshCw,
  Zap,
  CheckCircle2,
  Loader2,
  Key,
  Brain,
  MessageSquare
} from "lucide-react";

interface ApiKeyEntry {
  id: string;
  service: string;
  label: string;
  maskedKey: string;
  isActive: boolean;
  lastRotated: string;
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const [showPaystackSecret, setShowPaystackSecret] = useState(false);
  const [showMpesaSecret, setShowMpesaSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // API Key management state
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [geminiKey, setGeminiKey] = useState("");
  const [whatsappToken, setWhatsappToken] = useState("");
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showWhatsappToken, setShowWhatsappToken] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/api-keys");
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data.keys || []);
      }
    } catch {
      // silent
    } finally {
      setLoadingKeys(false);
    }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleSaveKey = async (service: string, label: string, apiKey: string) => {
    if (!apiKey || apiKey.length < 10) {
      showToast("Please enter a valid API key", "error");
      return;
    }
    setSavingKey(service);
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, label, apiKey }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✅ ${service} key encrypted & stored securely!`);
        fetchKeys();
        // Clear the input
        if (service === "GEMINI") setGeminiKey("");
        if (service === "WHATSAPP_TOKEN") setWhatsappToken("");
      } else {
        showToast(data.error || "Failed to save", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setSavingKey(null);
    }
  };

  const getKeyInfo = (service: string) => apiKeys.find(k => k.service === service);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-2xl text-sm font-bold shadow-xl ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Configuration</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            API Keys • Payment Gateways • AI Intelligence Vault
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleSave}
             disabled={isSaving}
             className="px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-70"
           >
             {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             {isSaving ? "Syncing..." : "Save Master Config"}
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Col - Navigation/Status */}
        <div className="space-y-6">
           <div className="bg-slate-950 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full -mr-10 -mt-10" />
             <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                   <Lock className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest">Vault Secured</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-0.5">AES-256-GCM Encryption Active</p>
                </div>
             </div>
           </div>

           <div className="bg-white border border-slate-200 rounded-[2rem] p-4 shadow-sm space-y-2">
             <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 pb-2 border-b border-slate-100">Service Categories</h4>
             <button className="w-full flex items-center justify-between px-4 py-3 bg-indigo-50 text-indigo-900 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors">
                <div className="flex items-center gap-3"><Brain className="w-4 h-4 text-indigo-600" /> Gemini AI (24/7)</div>
                <div className={`w-2 h-2 rounded-full ${getKeyInfo("GEMINI") ? "bg-emerald-500" : "bg-amber-500"}`} />
             </button>
             <button className="w-full flex items-center justify-between px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors">
                <div className="flex items-center gap-3"><MessageSquare className="w-4 h-4 text-green-600" /> WhatsApp Cloud</div>
                <div className={`w-2 h-2 rounded-full ${getKeyInfo("WHATSAPP_TOKEN") ? "bg-emerald-500" : "bg-amber-500"}`} />
             </button>
             <button className="w-full flex items-center justify-between px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors">
                <div className="flex items-center gap-3"><CreditCard className="w-4 h-4 text-blue-600" /> Paystack Africa</div>
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
             </button>
             <button className="w-full flex items-center justify-between px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors">
                <div className="flex items-center gap-3"><Smartphone className="w-4 h-4 text-emerald-600" /> M-Pesa Daraja</div>
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
             </button>
           </div>

           {/* Encrypted Keys Summary */}
           <div className="bg-white border border-slate-200 rounded-[2rem] p-5 shadow-sm">
             <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pb-3 border-b border-slate-100">Encrypted Keys in Vault</h4>
             {loadingKeys ? (
               <div className="py-4 flex justify-center">
                 <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
               </div>
             ) : apiKeys.length === 0 ? (
               <p className="text-xs text-slate-400 py-4 text-center">No keys stored yet. Add your first key below.</p>
             ) : (
               <div className="space-y-3 mt-3">
                 {apiKeys.map((k) => (
                   <div key={k.id} className="flex items-center justify-between">
                     <div>
                       <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider">{k.label}</p>
                       <p className="text-[10px] font-mono text-slate-400">{k.maskedKey}</p>
                     </div>
                     <div className="flex items-center gap-2">
                       {k.isActive ? (
                         <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase">
                           <CheckCircle2 className="w-3 h-3" /> Active
                         </span>
                       ) : (
                         <span className="flex items-center gap-1 text-[9px] font-black text-amber-600 uppercase">
                           <AlertTriangle className="w-3 h-3" /> Inactive
                         </span>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>

        {/* Right Col - Forms */}
        <div className="lg:col-span-2 space-y-8">

           {/* ═══ GEMINI AI PANEL ═══ */}
           <div className="bg-white border-2 border-indigo-200 rounded-[2rem] shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 blur-[60px] rounded-full" />
              <div className="p-6 border-b border-indigo-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 to-violet-50/80">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                       <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                       <h2 className="text-lg font-black text-slate-900 leading-none">Gemini AI Engine</h2>
                       <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">24/7 WhatsApp Intelligence • Gemini 2.0 Flash</p>
                    </div>
                 </div>
                 <span className={`px-3 py-1 border rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                   getKeyInfo("GEMINI") 
                     ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                     : "bg-amber-50 text-amber-600 border-amber-100"
                 }`}>
                    {getKeyInfo("GEMINI") ? <><ShieldCheck className="w-3 h-3" /> Encrypted & Active</> : <><AlertTriangle className="w-3 h-3" /> Not Configured</>}
                 </span>
              </div>
              <div className="p-8 space-y-6 relative z-10">
                 {getKeyInfo("GEMINI") && (
                   <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                     <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                     <div>
                       <p className="text-xs font-black text-emerald-900">Key Stored Securely (AES-256-GCM)</p>
                       <p className="text-[10px] text-emerald-700 mt-0.5">
                         Current: <code className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded">{getKeyInfo("GEMINI")?.maskedKey}</code>
                       </p>
                       <p className="text-[10px] text-emerald-600 mt-1">
                         Last rotated: {new Date(getKeyInfo("GEMINI")!.lastRotated).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                       </p>
                     </div>
                   </div>
                 )}
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      <Key className="w-3 h-3 inline mr-1" />
                      Gemini API Key <span className="text-indigo-500">(from Google AI Studio)</span>
                    </label>
                    <div className="relative border border-slate-200 rounded-xl bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                       <input 
                         type={showGeminiKey ? "text" : "password"} 
                         value={geminiKey}
                         onChange={(e) => setGeminiKey(e.target.value)}
                         placeholder={getKeyInfo("GEMINI") ? "Enter new key to rotate..." : "AIzaSy..."}
                         className="w-full px-4 py-3 bg-transparent text-xs font-mono font-bold text-slate-900 focus:outline-none pr-20"
                       />
                       <button 
                         onClick={() => setShowGeminiKey(!showGeminiKey)}
                         className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
                       >
                         {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       </button>
                       <button 
                         onClick={() => handleSaveKey("GEMINI", "Gemini AI (24/7 Bot)", geminiKey)}
                         disabled={!geminiKey || savingKey === "GEMINI"}
                         className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-indigo-600 hover:text-indigo-800 transition-colors disabled:opacity-30"
                       >
                         {savingKey === "GEMINI" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                       </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                      Get your key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-500 underline">Google AI Studio</a>. 
                      Key is encrypted with AES-256-GCM before storage.
                    </p>
                 </div>
                 <button
                   onClick={() => handleSaveKey("GEMINI", "Gemini AI (24/7 Bot)", geminiKey)}
                   disabled={!geminiKey || savingKey === "GEMINI"}
                   className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
                 >
                   {savingKey === "GEMINI" ? (
                     <><Loader2 className="w-4 h-4 animate-spin" /> Encrypting & Saving...</>
                   ) : (
                     <><Lock className="w-4 h-4" /> {getKeyInfo("GEMINI") ? "Rotate & Encrypt Key" : "Encrypt & Store Key"}</>
                   )}
                 </button>
              </div>
           </div>

           {/* ═══ WHATSAPP CLOUD API PANEL ═══ */}
           <div className="bg-white border border-green-200 rounded-[2rem] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-green-100 flex items-center justify-between bg-green-50/50">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                       <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                       <h2 className="text-lg font-black text-slate-900 leading-none">WhatsApp Cloud API</h2>
                       <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-1">Meta Business • Phone ID: 981253711747258</p>
                    </div>
                 </div>
                 <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" /> Live
                 </span>
              </div>
              <div className="p-8 space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Access Token</label>
                    <div className="relative border border-slate-200 rounded-xl bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-500 transition-all">
                       <input 
                         type={showWhatsappToken ? "text" : "password"} 
                         value={whatsappToken}
                         onChange={(e) => setWhatsappToken(e.target.value)}
                         placeholder={getKeyInfo("WHATSAPP_TOKEN") ? "Enter new token to rotate..." : "EAAdBvRlQt5kB..."}
                         className="w-full px-4 py-3 bg-transparent text-xs font-mono font-bold text-slate-900 focus:outline-none pr-20"
                       />
                       <button 
                         onClick={() => setShowWhatsappToken(!showWhatsappToken)}
                         className="absolute right-12 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
                       >
                         {showWhatsappToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       </button>
                       <button 
                         onClick={() => handleSaveKey("WHATSAPP_TOKEN", "WhatsApp Cloud API Token", whatsappToken)}
                         disabled={!whatsappToken || savingKey === "WHATSAPP_TOKEN"}
                         className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-green-600 hover:text-green-800 transition-colors disabled:opacity-30"
                       >
                         {savingKey === "WHATSAPP_TOKEN" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                       </button>
                    </div>
                 </div>
                 <button
                   onClick={() => handleSaveKey("WHATSAPP_TOKEN", "WhatsApp Cloud API Token", whatsappToken)}
                   disabled={!whatsappToken || savingKey === "WHATSAPP_TOKEN"}
                   className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all disabled:opacity-50"
                 >
                   {savingKey === "WHATSAPP_TOKEN" ? (
                     <><Loader2 className="w-4 h-4 animate-spin" /> Encrypting...</>
                   ) : (
                     <><Lock className="w-4 h-4" /> Encrypt & Store Token</>
                   )}
                 </button>
              </div>
           </div>

           {/* ═══ PAYSTACK PANEL ═══ */}
           <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                       <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                       <h2 className="text-lg font-black text-slate-900 leading-none">Paystack Configuration</h2>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Card Processing & Webhooks</p>
                    </div>
                 </div>
                 <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" /> Live Mode
                 </span>
              </div>
              <div className="p-8 grid gap-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Public Key</label>
                    <input 
                      type="text" 
                      defaultValue="pk_live_bcc9ec0d0e289f403ac44e1cbfddc728a157b5c9"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Secret Key</label>
                    <div className="relative border border-slate-200 rounded-xl bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                       <input 
                         type={showPaystackSecret ? "text" : "password"} 
                         defaultValue="sk_live_2556e89c8307a374a20aa29a17e9b7acfba3bb1e"
                         className="w-full px-4 py-3 bg-transparent text-xs font-mono font-bold text-slate-900 focus:outline-none"
                       />
                       <button 
                         onClick={() => setShowPaystackSecret(!showPaystackSecret)}
                         className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
                       >
                         {showPaystackSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       </button>
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Webhook URL <span className="text-red-500">*</span></label>
                    <input 
                      type="url" 
                      defaultValue="https://sentill.africa/api/webhooks/paystack"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                 </div>
              </div>
           </div>

           {/* ═══ M-PESA PANEL ═══ */}
           <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                       <Smartphone className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                       <h2 className="text-lg font-black text-slate-900 leading-none">M-Pesa Daraja API</h2>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Safaricom Integrations (B2C, C2B)</p>
                    </div>
                 </div>
                 <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" /> Live Mode
                 </span>
              </div>
              <div className="p-8 grid gap-6 md:grid-cols-2">
                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Consumer Key</label>
                    <input 
                      type="text" 
                      defaultValue="Jk9L8mN7pQ6rS5tU4vW3xY2zA1bC0d"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Business Shortcode (Till)</label>
                    <input 
                      type="text" 
                      defaultValue="882900"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Passkey</label>
                    <div className="relative border border-slate-200 rounded-xl bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                       <input 
                         type={showMpesaSecret ? "text" : "password"} 
                         defaultValue="bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
                         className="w-full px-4 py-3 bg-transparent text-xs font-mono font-bold text-slate-900 focus:outline-none"
                       />
                       <button 
                         onClick={() => setShowMpesaSecret(!showMpesaSecret)}
                         className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
                       >
                         {showMpesaSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       </button>
                    </div>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
