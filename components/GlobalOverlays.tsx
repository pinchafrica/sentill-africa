"use client";

import { useAIStore } from "@/lib/store";
import AssetModal from "./AssetModal";
import TaxOptimizerModal from "./TaxOptimizerModal";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, MapPin, Send } from "lucide-react";

export default function GlobalOverlays() {
  const { 
    isAssetModalOpen, setAssetModalOpen, prefilledAsset, setPrefilledAsset,
    isTaxOptimizerOpen, setTaxOptimizerOpen,
    isSupportOpen, setSupportOpen
  } = useAIStore();

  return (
    <>
      <AssetModal 
        isOpen={isAssetModalOpen} 
        onClose={() => {
          setAssetModalOpen(false);
          setPrefilledAsset(undefined);
        }} 
        prefilledAsset={prefilledAsset}
      />
      
      <TaxOptimizerModal />

      {/* Global Support Modal */}
      <AnimatePresence>
        {isSupportOpen && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSupportOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
               <div className="bg-slate-950 p-10 text-white flex justify-between items-center">
                  <div className="space-y-1">
                     <h3 className="text-xl font-black uppercase tracking-tighter">Institutional Support</h3>
                     <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Concierge Active</p>
                  </div>
                  <button onClick={() => setSupportOpen(false)} className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all">
                     <X className="w-6 h-6" />
                  </button>
               </div>
               
               <div className="p-10 space-y-8">
                  <div className="grid grid-cols-1 gap-4">
                     <div className="p-6 bg-slate-50 rounded-2xl flex items-center gap-6 border border-slate-100">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                           <Mail className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Channel</p>
                           <p className="text-[13px] font-black text-slate-900">support@sentill.africa</p>
                        </div>
                     </div>
                     <div className="p-6 bg-slate-50 rounded-2xl flex items-center gap-6 border border-slate-100">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                           <Phone className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp Line</p>
                           <p className="text-[13px] font-black text-slate-900">+254 7XX XXX XXX</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-2">Rapid Feedback</label>
                     <div className="relative">
                        <textarea 
                           placeholder="Message the Sentill Concierge..."
                           className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[11px] font-bold text-slate-900 focus:outline-none focus:border-blue-600 min-h-[120px] resize-none"
                        />
                        <button className="absolute bottom-4 right-4 p-3 bg-slate-950 text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                           <Send className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
