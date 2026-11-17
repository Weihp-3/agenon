import { Icon } from "./icon";

const sizes: Record<string, string> = {
  sm: "text-sm px-2 py-1 tracking-widest",
  md: "text-base px-2.5 py-1.5 tracking-widest",
  lg: "text-2xl px-3.5 py-2 tracking-[0.2em]",
};

/**
 * The pickup code is this shop's signature token: what a student says at the
 * counter and what the cashier reads. It gets the only monospace on the site.
 */
export function PickupCode({
  code,
  label = "Kode ambil",
  size = "md",
  className = "",
}: {
  code: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`.trim()}>
      <span
        className={`font-mono font-semibold uppercase text-ink ${sizes[size]} rounded border border-ink/15 bg-surface-sunken`}
      >
        {code}
      </span>
      {label ? <span className="text-xs text-ink-muted">{label}</span> : null}
    </div>
  );
}
