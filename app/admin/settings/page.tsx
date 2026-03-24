"use client";

import { useState } from "react";
import { 
  CreditCard, 
  Smartphone, 
  Settings, 
  ShieldCheck, 
  Save, 
  Eye, 
  EyeOff,
  AlertTriangle,
  Globe,
  Lock,
  RefreshCw
} from "lucide-react";

export default function AdminSettingsPage() {
  const [showPaystackSecret, setShowPaystackSecret] = useState(false);
  const [showMpesaSecret, setShowMpesaSecret] = useState(false);
  const [showPaypalSecret, setShowPaypalSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Configuration</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
            Payment Gateways & API Credential Vault
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
                  <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mt-0.5">AES-256 Encryption Active</p>
                </div>
             </div>
           </div>

           <div className="bg-white border border-slate-200 rounded-[2rem] p-4 shadow-sm space-y-2">
             <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 pb-2 border-b border-slate-100">Gateway Categories</h4>
             <button className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 text-slate-900 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors">
                <div className="flex items-center gap-3"><CreditCard className="w-4 h-4 text-blue-600" /> Paystack Africa</div>
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
             </button>
             <button className="w-full flex items-center justify-between px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors">
                <div className="flex items-center gap-3"><Smartphone className="w-4 h-4 text-emerald-600" /> M-Pesa Daraja</div>
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
             </button>
             <button className="w-full flex items-center justify-between px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors">
                <div className="flex items-center gap-3"><Globe className="w-4 h-4 text-blue-500" /> PayPal Global</div>
                <div className="w-2 h-2 rounded-full bg-amber-500" />
             </button>
           </div>
        </div>

        {/* Right Col - Forms */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Paystack Panel */}
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
                      defaultValue="pk_live_8f3a9b2c1d0e4f5a6b7c8d9e0f1a2b3c"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Secret Key</label>
                    <div className="relative border border-slate-200 rounded-xl bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                       <input 
                         type={showPaystackSecret ? "text" : "password"} 
                         defaultValue="sk_live_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5"
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
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                    />
                 </div>
              </div>
           </div>

           {/* M-Pesa Daraja Panel */}
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
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Business Shortcode (Till)</label>
                    <input 
                      type="text" 
                      defaultValue="882900"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
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

           {/* PayPal Panel */}
           <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                       <Globe className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                       <h2 className="text-lg font-black text-slate-900 leading-none">PayPal Global</h2>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Diaspora USD Inflows</p>
                    </div>
                 </div>
                 <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3" /> Sandbox
                 </span>
              </div>
              <div className="p-8 grid gap-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Client ID</label>
                    <input 
                      type="text" 
                      defaultValue="AbtY7Z9xW_vU-qR5sP4nO3m_L2kI1jH0gF_eD-cBx_A"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all font-mono"
                    />
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
