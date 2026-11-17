import type { ReactNode } from "react";

import { Icon } from "./icon";

export function Stat({
  label,
  value,
  note,
  tone = "default",
  icon,
}: {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  tone?: "default" | "brand";
  icon?: string;
}) {
  const accent = tone === "brand";

  return (
    <div
      className={`rounded-xl border p-4 transition-colors duration-quick ease-swift ${
        accent ? "border-brand bg-brand text-brand-on" : "border-ink/10 bg-surface-raised"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={`text-xs font-semibold ${accent ? "text-brand-on/80" : "text-ink-muted"}`}>
          {label}
        </p>
        {icon ? (
          <Icon
            name={icon}
            className={`h-4 w-4 shrink-0 ${accent ? "text-brand-on/70" : "text-ink-subtle"}`}
          />
        ) : null}
      </div>

      <div className={`tabular mt-2 text-2xl font-extrabold leading-none ${accent ? "text-brand-on" : "text-ink"}`}>
        {value}
      </div>

      {note ? (
        <p className={`mt-2 text-xs ${accent ? "text-brand-on/75" : "text-ink-muted"}`}>{note}</p>
      ) : null}
    </div>
  );
}
