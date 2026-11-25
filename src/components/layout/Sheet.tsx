import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg";
}

/**
 * Single overlay primitive for the whole app.
 * Mobile: bottom sheet. Desktop: centered modal.
 */
export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  size = "md",
}: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center md:p-6">
          <motion.button
            type="button"
            aria-label="Close panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 w-full h-full bg-black/70 backdrop-blur-sm cursor-default"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title || "Panel"}
            initial={{ opacity: 0, y: 42 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 42 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className={`relative z-10 w-full ${
              size === "lg" ? "md:max-w-2xl" : "md:max-w-lg"
            } max-h-[90dvh] md:max-h-[84dvh] rounded-t-3xl md:rounded-3xl border border-white/10 bg-[#07070f]/95 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.75)] flex flex-col overflow-hidden`}
          >
            <div className="md:hidden pt-3 pb-1 flex justify-center shrink-0">
              <span className="w-10 h-1 rounded-full bg-white/15" />
            </div>

            {(title || icon) && (
              <div className="shrink-0 flex items-start justify-between gap-3 px-5 pt-3 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-3 min-w-0">
                  {icon && (
                    <div className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-cyan-300 shrink-0">
                      {icon}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-display font-semibold text-white truncate">
                      {title}
                    </h3>
                    {subtitle && (
                      <p className="text-[9px] font-mono uppercase tracking-[0.18em] text-slate-500 truncate mt-0.5">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4">
              {children}
            </div>

            {footer && (
              <div className="shrink-0 border-t border-white/[0.06] px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
