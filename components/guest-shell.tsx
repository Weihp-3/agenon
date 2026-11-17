import type { ReactNode } from "react";
import Link from "next/link";

import { Icon } from "./icon";
import { ThemeToggle } from "./theme-toggle";

export function GuestShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand text-brand-on">
              <Icon name="store" className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold leading-tight text-ink">
                Warung Mama Zaviyar
              </span>
              <span className="block truncate text-xs leading-tight text-ink-muted">
                Pesan dan ambil di warung
              </span>
            </span>
          </Link>

          <ThemeToggle />
        </div>

        <div className="rounded-xl border border-ink/10 bg-surface-raised p-5 sm:p-6">{children}</div>

        <p className="mt-6 text-center text-xs text-ink-subtle">
          &copy; {new Date().getFullYear()} Warung Mama Zaviyar. Hak cipta dilindungi.
        </p>
      </div>
    </div>
  );
}
