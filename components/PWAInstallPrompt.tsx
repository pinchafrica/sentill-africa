"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PWAInstallPromptProps {
  variant?: "banner" | "button"; // banner = floating bottom bar, button = inline button
}

export function PWAInstallPrompt({ variant = "banner" }: PWAInstallPromptProps) {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed in this session
    const wasDismissed = sessionStorage.getItem("pwa-dismissed");
    if (wasDismissed) return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if already installed as PWA
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    // Android: Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Always show the prompt after 4 seconds regardless of browser support
    // This handles cases where manifest SSL error prevents browser auto-prompt
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 4000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Native install prompt available (Android Chrome)
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
        setDismissed(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Desktop or Android without prompt — show instructions modal
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    sessionStorage.setItem("pwa-dismissed", "true");
  };

  if (isStandalone || dismissed) return null;

  // Inline button variant (used in Navbar)
  if (variant === "button") {
    return (
      <>
        <button
          id="pwa-install-btn"
          onClick={handleInstallClick}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black rounded-full uppercase tracking-widest transition-all shadow-sm whitespace-nowrap"
        >
          <Smartphone className="w-3 h-3" />
          Install App
        </button>

        {/* iOS / Manual Instructions Modal */}
        <AnimatePresence>
          {showIOSModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4 pb-4 sm:pb-0"
              onClick={() => setShowIOSModal(false)}
            >
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 60, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-2xl border border-slate-200"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <img src="/icon-192x192.png" alt="Sentill" className="w-12 h-12 rounded-2xl shadow-md" />
                    <div>
                      <h3 className="font-black text-slate-900 text-sm">Install Sentill</h3>
                      <p className="text-[10px] text-slate-400 font-medium">Add to your home screen</p>
                    </div>
                  </div>
                  <button onClick={() => setShowIOSModal(false)} className="p-2 bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {isIOS ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 font-medium">To install on iPhone or iPad:</p>
                    <div className="space-y-2">
                      {[
                        { step: "1", text: "Tap the Share button at the bottom of Safari" },
                        { step: "2", text: 'Scroll down and tap "Add to Home Screen"' },
                        { step: "3", text: 'Tap "Add" in the top right corner' },
                      ].map(({ step, text }) => (
                        <div key={step} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl">
                          <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">{step}</span>
                          <p className="text-[11px] text-slate-700 font-medium leading-relaxed">{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 font-medium">To install on Android or Desktop:</p>
                    <div className="space-y-2">
                      {[
                        { step: "1", text: "Open sentill.africa in Chrome or Edge browser" },
                        { step: "2", text: 'Tap the menu (⋮) or address bar and select "Install App" or "Add to Home Screen"' },
                        { step: "3", text: 'Confirm by tapping "Install"' },
                      ].map(({ step, text }) => (
                        <div key={step} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl">
                          <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">{step}</span>
                          <p className="text-[11px] text-slate-700 font-medium leading-relaxed">{text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowIOSModal(false)}
                  className="w-full mt-5 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
                >
                  Got It
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Banner variant (floating bottom bar) — shown on homepage
  return (
    <>
      <AnimatePresence>
        {showPrompt && (
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
              <button
                onClick={handleInstallClick}
                className="bg-emerald-600 text-white px-3 py-2 rounded-xl hover:bg-emerald-500 transition-colors text-[9px] font-black uppercase tracking-widest flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS / Manual Instructions Modal */}
      <AnimatePresence>
        {showIOSModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm px-4 pb-4 sm:pb-0"
            onClick={() => setShowIOSModal(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <img src="/icon-192x192.png" alt="Sentill" className="w-12 h-12 rounded-2xl shadow-md" />
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Install Sentill</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Add to your home screen</p>
                  </div>
                </div>
                <button onClick={() => setShowIOSModal(false)} className="p-2 bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isIOS ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 font-medium">To install on iPhone or iPad:</p>
                  <div className="space-y-2">
                    {[
                      { step: "1", text: "Tap the Share button at the bottom of Safari" },
                      { step: "2", text: 'Scroll down and tap "Add to Home Screen"' },
                      { step: "3", text: 'Tap "Add" in the top right corner' },
                    ].map(({ step, text }) => (
                      <div key={step} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl">
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">{step}</span>
                        <p className="text-[11px] text-slate-700 font-medium leading-relaxed">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 font-medium">To install on Android or Desktop:</p>
                  <div className="space-y-2">
                    {[
                      { step: "1", text: "Open sentill.africa in Chrome or Edge browser" },
                      { step: "2", text: 'Tap the menu (⋮) or address bar and select "Install App" or "Add to Home Screen"' },
                      { step: "3", text: 'Confirm by tapping "Install"' },
                    ].map(({ step, text }) => (
                      <div key={step} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl">
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">{step}</span>
                        <p className="text-[11px] text-slate-700 font-medium leading-relaxed">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full mt-5 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
              >
                Got It
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
