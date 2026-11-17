import type { ReactNode } from "react";

import { Icon } from "./icon";

const tones: Record<string, string> = {
  ok: "bg-status-ok-soft text-status-ok-ink",
  warn: "bg-status-warn-soft text-status-warn-ink",
  danger: "bg-status-danger-soft text-status-danger-ink",
  info: "bg-status-info-soft text-status-info-ink",
  brand: "bg-brand-soft text-brand-soft-ink",
  neutral: "bg-ink/5 text-ink-muted",
};

export function Chip({
  tone = "neutral",
  icon,
  children,
}: {
  tone?: string;
  icon?: string;
  children: ReactNode;
}) {
  return (
    <span className={`chip ${tones[tone] ?? tones.neutral}`}>
      {icon ? <Icon name={icon} className="h-3.5 w-3.5" /> : null}
      {children}
    </span>
  );
}
