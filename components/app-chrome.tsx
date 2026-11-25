"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Flash } from "./flash";
import { Icon } from "./icon";
import { ThemeToggle } from "./theme-toggle";
import { headerMeta } from "@/lib/headers";
import { roleLabel } from "@/lib/format";
import type { NavItem } from "@/lib/nav";
import type { SessionUser } from "@/lib/auth";

function isActive(item: NavItem, pathname: string): boolean {
  if (item.exact) return pathname === item.href;
  return item.match.some((prefix) => pathname.startsWith(prefix));
}

export function AppChrome({
  items,
  badge,
  user,
  logoutAction,
  children,
}: {
  items: NavItem[];
  badge: number;
  user: SessionUser;
  logoutAction: () => void | Promise<void>;
  children: ReactNode;
}) {
  const [sidebar, setSidebar] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const header = headerMeta(pathname);
  const initial = (user.name ?? "U").charAt(0).toUpperCase();

  return (
    <div className="flex min-h-full">
      {sidebar ? (
        <div
          className="fixed inset-0 z-40 bg-ink/40 md:hidden"
          onClick={() => setSidebar(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[17rem] shrink-0 flex-col border-r border-ink/10 bg-surface-raised transition-transform duration-normal ease-settle md:translate-x-0 ${
          sidebar ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navigasi utama"
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-ink/10 px-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand text-brand-on">
            <Icon name="store" className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold leading-tight text-ink">
              Warung Mama Zaviyar
            </span>
            <span className="block truncate text-[11px] leading-tight text-ink-muted">
              Pesan dan ambil di warung
            </span>
          </span>
          <button
            type="button"
            onClick={() => setSidebar(false)}
            className="-mr-1 inline-flex h-10 w-10 items-center justify-center rounded-md text-ink-muted hover:bg-ink/5 hover:text-ink md:hidden"
            aria-label="Tutup menu navigasi"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        <nav className="scrollbar-quiet flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => {
            const active = isActive(item, pathname);
            const showBadge = item.badge === "orders" && badge > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[2.75rem] items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-quick ease-swift ${
                  active
                    ? "bg-brand-soft text-brand-soft-ink"
                    : "text-ink-muted hover:bg-ink/5 hover:text-ink"
                }`}
              >
                <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {showBadge ? (
                  <span className="tabular shrink-0 rounded bg-brand px-1.5 py-0.5 text-[11px] font-bold text-brand-on">
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-ink/10 px-5 py-4">
          <p className="text-xs leading-relaxed text-ink-subtle">
            Buka setiap hari 07.00 sampai 21.00 WIB.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:pl-[17rem]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-ink/10 bg-surface-raised px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebar(true)}
              className="-ml-1 inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-muted hover:bg-ink/5 hover:text-ink md:hidden"
              aria-label="Buka menu navigasi"
            >
              <Icon name="menu" className="h-6 w-6" />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-ink md:text-lg">{header.title}</h1>
              {header.subtitle ? (
                <p className="truncate text-xs text-ink-muted">{header.subtitle}</p>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeToggle />

            <a
              href="mailto:yudahp363@gmail.com?subject=Bantuan%20Warung%20Mama%20Zaviyar"
              aria-label="Customer service"
              title="Customer service"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-muted hover:bg-ink/5 hover:text-ink"
            >
              <Icon name="mail" className="h-5 w-5" />
            </a>

            <Link
              href="/notifications"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-muted hover:bg-ink/5 hover:text-ink"
              aria-label="Notifikasi"
            >
              <Icon name="bell" className="h-5 w-5" />
            </Link>

            <div className="relative ml-1">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex h-11 items-center gap-2.5 rounded-md pl-1 pr-2 hover:bg-ink/5"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-soft text-xs font-bold text-brand-soft-ink">
                  {initial}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block max-w-[10rem] truncate text-sm font-semibold text-ink">
                    {user.name}
                  </span>
                  <span className="block text-xs text-ink-muted">{roleLabel(user.role)}</span>
                </span>
              </button>

              {menuOpen ? (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 cursor-default"
                    aria-hidden="true"
                    tabIndex={-1}
                    onClick={() => setMenuOpen(false)}
                  />
                  <div
                    className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-ink/10 bg-surface-raised shadow-float"
                    role="menu"
                  >
                    <div className="border-b border-ink/10 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                      <p className="truncate text-xs text-ink-muted">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      role="menuitem"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-muted hover:bg-ink/5 hover:text-ink"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Icon name="user" className="h-4 w-4" />
                      Pengaturan Profil
                    </Link>
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        role="menuitem"
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-status-danger-ink hover:bg-ink/5"
                      >
                        <Icon name="logout" className="h-4 w-4" />
                        Keluar
                      </button>
                    </form>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 md:px-6 md:py-6">
          <Flash />
          {children}
        </main>
      </div>
    </div>
  );
}
