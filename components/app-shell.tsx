import type { ReactNode } from "react";
import Link from "next/link";

import { Icon } from "./icon";
import { ThemeToggle } from "./theme-toggle";
import { menuFor, pendingCount } from "@/lib/nav";
import { logoutAction } from "@/lib/session-actions";
import type { SessionUser } from "@/lib/auth";

import { AppChrome } from "./app-chrome";

export async function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const items = menuFor(user.role);
  const badge = await pendingCount(user.role, user.id);

  return (
    <AppChrome items={items} badge={badge} user={user} logoutAction={logoutAction}>
      {children}
    </AppChrome>
  );
}
