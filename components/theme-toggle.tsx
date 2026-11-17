"use client";

import { Icon } from "./icon";

/**
 * The pre-paint script in the layout sets the class; this only handles later
 * toggles. Visibility is pure CSS (`.dark`), so no state is needed here.
 */
export function ThemeToggle({ className = "h-11 w-11" }: { className?: string }) {
  function toggle() {
    const dark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center justify-center rounded-md text-ink-muted hover:bg-ink/5 hover:text-ink ${className}`.trim()}
      aria-label="Ganti mode terang dan gelap"
    >
      <Icon name="sun" className="hidden h-5 w-5 dark:block" />
      <Icon name="moon" className="h-5 w-5 dark:hidden" />
    </button>
  );
}
