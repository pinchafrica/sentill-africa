"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function PWAInstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if the device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if the app is already installed
    const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) {
      return; // Already installed, don't show prompt
    }

    // Android: Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show custom prompt for iOS after a brief delay if not installed
    if (isIosDevice && !isStandaloneMode) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 z-50 bg-white shadow-2xl rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-4 max-w-sm ml-auto"
      >
        <div className="flex items-center gap-3">
          <img src="/icon-192x192.png" alt="Sentill App" className="w-12 h-12 rounded-xl shadow-sm" />
          <div className="flex-1">
            <h4 className="text-sm font-black text-slate-900 leading-tight">Install Sentill</h4>
            {isIOS ? (
              <p className="text-[10px] text-slate-500 font-medium">
                Tap <span className="inline-block relative top-[1px] font-bold text-slate-700 bg-slate-100 px-1 rounded">Share</span> then <span className="inline-block font-bold text-slate-700">Add to Home Screen</span>
              </p>
            ) : (
              <p className="text-[10px] text-slate-500 font-medium">Add Sentill to your home screen</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isIOS && (
            <button
              onClick={handleInstallClick}
              className="bg-slate-900 text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              aria-label="Install App"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowPrompt(false)}
            className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
