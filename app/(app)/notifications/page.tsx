import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { EmptyState } from "@/components/empty-state";
import { Icon } from "@/components/icon";
import {
  notificationTypeLabel,
  relativeTime,
  formatDateTime,
} from "@/lib/format";

export default async function NotificationsPage() {
  const user = await requireUser();

  const notifications = await db.notifications.findMany({
    where: { user_id: BigInt(user.id) },
    orderBy: [{ is_pinned: "desc" }, { created_at: "desc" }],
    take: 100,
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Notifikasi</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Pemberitahuan pesanan, stok, dan shift warung.
        </p>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="Belum ada notifikasi"
          description="Pemberitahuan tentang pesananmu akan muncul di sini."
          icon="bell"
        />
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => {
            const tone =
              n.type === "error"
                ? "danger"
                : n.type === "warning"
                  ? "warn"
                  : n.type === "success"
                    ? "ok"
                    : "info";
            return (
              <li
                key={n.id}
                className={`flex gap-3 rounded-xl border p-4 ${
                  n.read_at
                    ? "border-ink/10 bg-surface-raised"
                    : "border-brand/20 bg-brand-soft"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                    tone === "danger"
                      ? "bg-status-danger-soft text-status-danger-ink"
                      : tone === "warn"
                        ? "bg-status-warn-soft text-status-warn-ink"
                        : tone === "ok"
                          ? "bg-status-ok-soft text-status-ok-ink"
                          : "bg-status-info-soft text-status-info-ink"
                  }`}
                >
                  <Icon
                    name={
                      n.type === "success"
                        ? "check-circle"
                        : n.type === "error"
                          ? "x-circle"
                          : n.type === "warning"
                            ? "warning"
                            : "info-circle"
                    }
                    className="h-5 w-5"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-ink">{n.title}</p>
                    <span className="text-xs text-ink-muted">
                      {relativeTime(n.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{n.message}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-ink-subtle">
                    <span>{notificationTypeLabel(n.type)}</span>
                    <span>{formatDateTime(n.created_at)}</span>
                    {n.is_pinned ? (
                      <span className="flex items-center gap-1">
                        <Icon name="pin" className="h-3 w-3" />
                        Dipasang
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}