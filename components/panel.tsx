import type { ReactNode } from "react";

export function Panel({
  title,
  description,
  padded = true,
  actions,
  children,
}: {
  title?: string;
  description?: string;
  padded?: boolean;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-ink/10 bg-surface-raised">
      {title || actions ? (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/10 px-4 py-3.5 md:px-5">
          <div className="min-w-0">
            {title ? <h3 className="text-sm font-bold text-ink">{title}</h3> : null}
            {description ? (
              <p className="mt-0.5 text-xs text-ink-muted">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}

      <div className={padded ? "p-4 md:p-5" : ""}>{children}</div>
    </section>
  );
}
