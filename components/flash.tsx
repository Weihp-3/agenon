"use client";

import { useEffect, useState } from "react";

import { Icon } from "./icon";

type FlashType = "success" | "error" | "warning" | "info";

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

/**
 * Port of x-flash. The redirect carries ?flash=&msg=; the message is shown
 * once and the query is dropped so a refresh does not bring it back.
 */
export function Flash({ errors }: { errors?: string[] }): React.ReactElement | null {
  const [flash, setFlash] = useState<{ type: FlashType; message: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("flash");
    const message = params.get("msg");

    if (!type || !message) return;
    if (type !== "success" && type !== "error" && type !== "warning" && type !== "info") {
      return;
    }

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

  if (!flash && (!errors || errors.length === 0)) return null;

  const meta = flash ? META[flash.type] : null;

  return (
    <>
      {flash && meta ? (
        <div
          role="status"
          className={`mb-4 flex items-start gap-3 rounded-lg border border-ink/10 px-4 py-3 text-sm ${meta.classes}`}
        >
          <Icon name={meta.icon} className="mt-0.5 h-5 w-5 shrink-0" />
          <span className="min-w-0 flex-1">{flash.message}</span>
          <button
            type="button"
            onClick={() => setFlash(null)}
            className="-mr-1 -mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded hover:bg-black/5"
            aria-label="Tutup pesan"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {errors && errors.length > 0 ? (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-lg border border-status-danger/25 bg-status-danger-soft px-4 py-3 text-sm text-status-danger-ink"
        >
          <Icon name="warning" className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Periksa kembali isian berikut</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
