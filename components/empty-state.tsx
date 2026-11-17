import type { ReactNode } from "react";

import { Icon } from "./icon";

export function EmptyState({
  title,
  description,
  icon = "inbox",
  action,
}: {
  title: string;
  description?: string;
  icon?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink/15 bg-surface-raised px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-md bg-ink/5 text-ink-subtle">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm font-semibold text-ink">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
