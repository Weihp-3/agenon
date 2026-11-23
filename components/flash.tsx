"use client";

import { useEffect, useRef, useState } from "react";

import { Icon } from "./icon";

type FlashType = "success" | "error" | "warning" | "info";
type Toast = { type: FlashType; message: string };

const META: Record<FlashType, { icon: string; classes: string }> = {
  success: {
    icon: "check-circle",
    classes: "bg-status-ok-soft text-status-ok-ink border-status-ok/25",
  },
  error: {
    icon: "x-circle",
    classes: "bg-status-danger-soft text-status-danger-ink border-status-danger/25",
  },
  warning: {
    icon: "warning",
    classes: "bg-status-warn-soft text-status-warn-ink border-status-warn/25",
  },
  info: {
    icon: "info-circle",
    classes: "bg-status-info-soft text-status-info-ink border-status-info/25",
  },
};

function ToastCard({ toast }: { toast: Toast }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const meta = META[toast.type];

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={`fixed bottom-5 right-5 z-50 flex w-[min(24rem,calc(100vw-2.5rem))] items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${meta.classes}`}
    >
      <Icon name={meta.icon} className="mt-0.5 h-5 w-5 shrink-0" />
      <span className="min-w-0 flex-1 leading-snug">{toast.message}</span>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="-mr-1 -mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded hover:bg-black/5"
        aria-label="Tutup pesan"
      >
        <Icon name="close" className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Port of x-flash. The redirect carries ?flash=&msg=; the message is shown
 * once and the query is dropped so a refresh does not bring it back.
 */
export function Flash({ errors }: { errors?: string[] }): React.ReactElement | null {
  const [flash, setFlash] = useState<Toast | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("flash");
    const message = params.get("msg");

    if (!type || !message) return;
    if (type !== "success" && type !== "error" && type !== "warning" && type !== "info") {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- consume URL flash once.
    setFlash({ type, message });

    params.delete("flash");
    params.delete("msg");
    const rest = params.toString();
    window.history.replaceState(
      {},
      "",
      window.location.pathname + (rest ? `?${rest}` : "") + window.location.hash,
    );
  }, []);

  const toast: Toast | null =
    flash ?? (errors && errors.length > 0 ? { type: "error", message: errors.join(" ") } : null);

  // A new occurrence (including the same message submitted again) must restart
  // the 1.5s timer, so remount the card whenever the toast appears anew.
  const signature = toast ? `${toast.type}:${toast.message}` : "";
  const lastSignature = useRef("");
  const occurrenceRef = useRef(0);
  const [occurrence, setOccurrence] = useState(0);

  useEffect(() => {
    if (signature !== lastSignature.current) {
      lastSignature.current = signature;
      occurrenceRef.current += 1;
      setOccurrence(occurrenceRef.current);
    }
  }, [signature]);

  if (!toast) return null;

  return <ToastCard key={`${signature}:${occurrence}`} toast={toast} />;
}
