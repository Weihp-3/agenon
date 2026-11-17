"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Icon } from "./icon";

const widths: Record<string, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
};

const FOCUSABLE =
  "a, button, input:not([type='hidden']), textarea, select, details, [tabindex]:not([tabindex='-1'])";

/**
 * Port of x-modal: backdrop, Escape to close, focus trapped while open, body
 * scroll locked. Motion replaces the Alpine transitions.
 */
export function Modal({
  open,
  onClose,
  maxWidth = "2xl",
  children,
}: {
  open: boolean;
  onClose: () => void;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    document.body.classList.add("overflow-y-hidden");

    const panel = panelRef.current;
    const focusables = panel
      ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => !el.hasAttribute("disabled"),
        )
      : [];

    const timer = setTimeout(() => focusables[0]?.focus(), 100);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab" || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.classList.remove("overflow-y-hidden");
      clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 overflow-y-auto px-4 py-6 sm:px-0">
          <motion.div
            className="fixed inset-0 transform transition-all"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          >
            <div className="absolute inset-0 bg-ink/60" />
          </motion.div>

          <motion.div
            ref={panelRef}
            className={`mb-6 transform overflow-hidden rounded-lg bg-surface-raised shadow-float transition-all sm:mx-auto sm:w-full ${widths[maxWidth]}`}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export function ModalClose({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink-muted hover:bg-ink/5 hover:text-ink"
      aria-label="Tutup"
    >
      <Icon name="close" className="h-5 w-5" />
    </button>
  );
}
