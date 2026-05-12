/* ==========================================================================
   BUILD LEVEL — Announcement Banner Component
   Dismissible top banner for drops, sales, free shipping, etc.
   ========================================================================== */

import { useState, useEffect } from "react";
import { X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AnnouncementBannerProps {
  message?: string;
  link?: string;
  linkLabel?: string;
  storageKey?: string; // unique key so dismissal persists per announcement
}

export default function AnnouncementBanner({
  message = "🔥 NEW DROP LIVE — FREE SHIPPING ON ORDERS OVER $100",
  link = "/shop",
  linkLabel = "SHOP NOW",
  storageKey = "announcement-v1",
}: AnnouncementBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(storageKey);
    if (!dismissed) setVisible(true);
  }, [storageKey]);

  const dismiss = () => {
    sessionStorage.setItem(storageKey, "true");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#FF6B00] overflow-hidden"
        >
          <div className="max-w-[1280px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
            <div className="flex-1" />
            <div className="flex items-center gap-2 text-center">
              <Zap size={13} className="text-white flex-shrink-0" />
              <p className="font-display text-[11px] tracking-[0.15em] text-white font-bold">
                {message}
              </p>
              {link && linkLabel && (
                <a
                  href={link}
                  className="font-display text-[11px] tracking-widest text-white underline underline-offset-2 hover:no-underline whitespace-nowrap ml-2"
                >
                  {linkLabel} →
                </a>
              )}
            </div>
            <div className="flex-1 flex justify-end">
              <button
                onClick={dismiss}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Dismiss announcement"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
