/* ==========================================================================
   BUILD LEVEL — PWA Install Prompt
   Shows a branded install banner when the browser fires the beforeinstallprompt event
   Also shows iOS-specific "Add to Home Screen" instructions
   ========================================================================== */

import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed or previously dismissed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      localStorage.getItem("pwa-dismissed") === "true"
    ) {
      return;
    }

    // Detect iOS Safari (no beforeinstallprompt support)
    const isIOS =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window.navigator as Navigator & { standalone?: boolean }).standalone;

    if (isIOS) {
      // Show iOS instructions after 4 seconds
      const timer = setTimeout(() => setShowIOS(true), 4000);
      return () => clearTimeout(timer);
    }

    // Android / Chrome: listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 4000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOS(false);
    setDismissed(true);
    localStorage.setItem("pwa-dismissed", "true");
  };

  if (dismissed) return null;

  return (
    <>
      {/* Android / Chrome Install Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed bottom-24 left-4 right-4 z-40 max-w-sm mx-auto"
          >
            <div className="bg-[#1A1A1A] border border-[#FF6B00]/40 shadow-2xl p-4 flex items-center gap-3">
              {/* Icon */}
              <div className="w-12 h-12 bg-[#FF6B00] flex items-center justify-center flex-shrink-0">
                <span className="font-display text-white font-bold text-sm">BL</span>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="font-display text-xs font-bold text-white tracking-widest">
                  INSTALL THE APP
                </p>
                <p className="font-body text-[11px] text-[#888] mt-0.5">
                  Add BUILD LEVEL to your home screen for quick access.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleInstall}
                  className="bg-[#FF6B00] text-white font-display text-[10px] font-bold tracking-wider px-3 py-2 hover:bg-[#e55f00] transition-colors flex items-center gap-1"
                >
                  <Download size={11} />
                  ADD
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-[#555] hover:text-white transition-colors"
                  aria-label="Dismiss"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Safari Instructions */}
      <AnimatePresence>
        {showIOS && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed bottom-24 left-4 right-4 z-40 max-w-sm mx-auto"
          >
            <div className="bg-[#1A1A1A] border border-[#FF6B00]/40 shadow-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Smartphone size={16} className="text-[#FF6B00]" />
                  <p className="font-display text-xs font-bold text-white tracking-widest">
                    INSTALL THE APP
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-[#555] hover:text-white transition-colors"
                  aria-label="Dismiss"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="font-body text-[11px] text-[#888] leading-relaxed">
                Tap the{" "}
                <span className="text-white font-medium">Share button</span>{" "}
                <span className="text-[#FF6B00]">⎙</span> at the bottom of your browser, then tap{" "}
                <span className="text-white font-medium">"Add to Home Screen"</span> to install BUILD LEVEL as an app.
              </p>
              {/* Arrow pointing down */}
              <div className="flex justify-center mt-3">
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#FF6B00]" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
