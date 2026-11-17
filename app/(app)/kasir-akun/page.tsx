import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { EmptyState } from "@/components/empty-state";
import { Icon } from "@/components/icon";
import { Flash } from "@/components/flash";
import { formatDateOnly } from "@/lib/format";
import { destroyKasir } from "@/lib/admin-kasir-actions";

export default async function KasirAkunPage() {
  await requireRole("admin");

  const kasirs = await db.users.findMany({
    where: { role: "kasir" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      created_at: true,
      shifts: {
        where: { closed_at: null },
        select: { id: true, opened_at: true },
        orderBy: { opened_at: "desc" },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Manajemen Kasir</h2>
          <p className="mt-1 text-sm text-ink-muted">Kelola data kasir dan pantau shift mereka.</p>
        </div>
        <Link href="/kasir-akun/create" className="btn btn-brand shrink-0">
          <Icon name="plus" className="h-4 w-4" />
          Tambah kasir
        </Link>
      </div>

      <Flash />

      {kasirs.length === 0 ? (
        <EmptyState
          title="Belum ada akun kasir"
          description="Tambahkan kasir untuk mulai melayani pelanggan."
          icon="users"
          action={
            <Link href="/kasir-akun/create" className="btn btn-brand btn-sm">
              <Icon name="plus" className="h-4 w-4" />
              Tambah kasir
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {kasirs.map((kasir) => {
            const active = kasir.shifts[0];
            return (
              <section
                key={kasir.id}
                className="flex flex-col rounded-xl border border-ink/10 bg-surface-raised p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink">{kasir.name}</p>
                    <p className="truncate text-xs text-ink-muted">{kasir.email}</p>
                  </div>
                  <form action={destroyKasir.bind(null, String(kasir.id))}>
                    <button
                      type="submit"
                      className="text-ink-subtle hover:text-status-danger-ink"
                      aria-label={`Hapus kasir ${kasir.name}`}
                    >
                      <Icon name="trash" className="h-4 w-4" />
                    </button>
                  </form>
                </div>

                <div className="mt-4 rounded-lg bg-surface-sunken p-3 text-xs">
                  {active ? (
                    <p className="flex items-center gap-1.5 font-semibold text-status-ok-ink">
                      <span className="h-2 w-2 rounded-full bg-status-ok" />
                      Shift aktif sejak {formatDateOnly(active.opened_at)}
                    </p>
                  ) : (
                    <p className="text-ink-muted">Tidak ada shift aktif.</p>
                  )}
                </div>

                <p className="mt-3 text-xs text-ink-subtle">
                  Bergabung {formatDateOnly(kasir.created_at)}
                </p>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}