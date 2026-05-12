/* ==========================================================================
   BUILD LEVEL — Social Proof Notification Component
   Shows rotating pop-ups: recent purchases, low stock alerts, visitor counts
   ========================================================================== */

import { useEffect, useState, useCallback, ReactElement } from "react";
import { ShoppingBag, Flame, Users, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type NotificationType = "purchase" | "stock" | "viewers";

interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  sub: string;
  time: string;
}

const NOTIFICATIONS: Omit<Notification, "id">[] = [
  { type: "purchase", message: "Marcus T. just ordered", sub: "Discipline Hoodie — Black / XL", time: "2 min ago" },
  { type: "stock",    message: "Low stock alert!",       sub: "Execution Tee — White / M — Only 2 left", time: "" },
  { type: "purchase", message: "Jaylen R. just ordered", sub: "Focus Cap — Black", time: "5 min ago" },
  { type: "viewers",  message: "47 people viewing",      sub: "the shop right now", time: "" },
  { type: "purchase", message: "Destiny K. just ordered", sub: "Build Level Hoodie — Grey / S", time: "8 min ago" },
  { type: "stock",    message: "Almost sold out!",        sub: "Discipline Hoodie — Black / S — 1 left", time: "" },
  { type: "purchase", message: "Andre M. just ordered",   sub: "Execution Tee — Black / L", time: "11 min ago" },
  { type: "viewers",  message: "32 people viewing",       sub: "this product right now", time: "" },
  { type: "purchase", message: "Keisha B. just ordered",  sub: "Focus Cap — Olive", time: "14 min ago" },
  { type: "stock",    message: "Low stock alert!",         sub: "Focus Cap — Olive — Only 3 left", time: "" },
];

const ICON_MAP: Record<NotificationType, ReactElement> = {
  purchase: <ShoppingBag size={16} className="text-[#FF6B00]" />,
  stock:    <Flame size={16} className="text-red-400" />,
  viewers:  <Users size={16} className="text-blue-400" />,
};

let notifIndex = 0;

export default function SocialProofNotification() {
  const [current, setCurrent] = useState<Notification | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const showNext = useCallback(() => {
    if (dismissed) return;
    const item = NOTIFICATIONS[notifIndex % NOTIFICATIONS.length];
    notifIndex++;
    setCurrent({ ...item, id: Date.now() });
  }, [dismissed]);

  useEffect(() => {
    // First notification after 4 seconds
    const initial = setTimeout(showNext, 4000);
    return () => clearTimeout(initial);
  }, [showNext]);

  useEffect(() => {
    if (!current) return;
    // Auto-hide after 5 seconds, then show next after 8 seconds
    const hide = setTimeout(() => setCurrent(null), 5000);
    const next = setTimeout(showNext, 13000);
    return () => {
      clearTimeout(hide);
      clearTimeout(next);
    };
  }, [current, showNext]);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-[300px]">
      <AnimatePresence>
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: -40, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="bg-[#1A1A1A] border border-white/10 shadow-2xl p-4 flex items-start gap-3 relative"
          >
            {/* Icon */}
            <div className="flex-shrink-0 w-8 h-8 bg-[#2A2A2A] flex items-center justify-center mt-0.5">
              {ICON_MAP[current.type]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="font-display text-xs font-bold text-white leading-tight">
                {current.message}
              </p>
              <p className="font-body text-[11px] text-[#888] mt-0.5 leading-tight truncate">
                {current.sub}
              </p>
              {current.time && (
                <p className="font-body text-[10px] text-[#555] mt-1">{current.time}</p>
              )}
            </div>

            {/* Close */}
            <button
              onClick={() => { setCurrent(null); setDismissed(true); }}
              className="flex-shrink-0 text-[#555] hover:text-white transition-colors mt-0.5"
              aria-label="Dismiss"
            >
              <X size={12} />
            </button>

            {/* Orange accent bar */}
            <div className="absolute bottom-0 left-0 h-[2px] bg-[#FF6B00] w-full origin-left animate-[shrink_5s_linear_forwards]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
