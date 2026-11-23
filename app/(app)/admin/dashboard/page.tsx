import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Stat } from "@/components/stat";
import { Panel } from "@/components/panel";
import { Chip } from "@/components/chip";
import { EmptyState } from "@/components/empty-state";
import { Icon } from "@/components/icon";
import { rupiah, formatDateTime, statusLabel } from "@/lib/format";
import { Flash } from "@/components/flash";

export default async function AdminDashboardPage() {
  await requireRole("admin");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todaySales, todayCount, pending, lowStock, recent] = await Promise.all([
    db.orm.public.transactions
      .where({ status: "selesai" })
      .where((t) => t.created_at.gte(today))
      .aggregate((agg) => ({ total: agg.sum("total_price") })),
    db.orm.public.transactions
      .where({ status: "selesai" })
      .where((t) => t.created_at.gte(today))
      .aggregate((agg) => ({ total: agg.count() }))
      .then((r) => r.total),
    db.orm.public.transactions
      .where({ status: "menunggu" })
      .aggregate((agg) => ({ total: agg.count() }))
      .then((r) => r.total),
    db.orm.public.products
      .where({ deleted_at: null })
      .where((p) => p.stock.lte(10))
      .aggregate((agg) => ({ total: agg.count() }))
      .then((r) => r.total),
    db.orm.public.transactions
      .orderBy((t) => t.created_at.desc())
      .limit(6)
      .include("users", (u) => u.select("name"))
      .all(),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Dashboard Admin</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Ringkasan penjualan, pesanan, dan stok warung.
        </p>
      </div>

      <Flash />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Penjualan hari ini"
          value={`Rp ${rupiah(todaySales.total ?? 0)}`}
          note={`${todayCount} transaksi selesai`}
          tone="brand"
          icon="chart"
        />
        <Stat label="Perlu verifikasi" value={pending} note="Menunggu konfirmasi" icon="orders" />
        <Stat label="Stok menipis" value={lowStock} note="Produk ≤ 10" icon="stock" />
        <Stat label="Pesanan hari ini" value={todayCount} note="Sudah selesai" icon="receipt" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title="Transaksi terbaru"
          description="Aktivitas pesanan terakhir di warung."
          actions={
            <a href="/laporan" className="text-xs font-semibold text-brand hover:underline">
              Lihat laporan
            </a>
          }
        >
          {recent.length === 0 ? (
            <EmptyState title="Belum ada transaksi" icon="receipt" />
          ) : (
            <ul className="divide-y divide-ink/5">
              {recent.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      #{order.id} · {order.users?.name ?? "-"}
                    </p>
                    <p className="text-xs text-ink-muted">{formatDateTime(order.created_at)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Chip
                      tone={
                        order.status === "selesai"
                          ? "ok"
                          : order.status === "menunggu"
                            ? "warn"
                            : "neutral"
                      }
                    >
                      {statusLabel(order.status)}
                    </Chip>
                    <span className="tabular text-sm font-semibold text-ink">
                      {rupiah(order.total_price)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Akses cepat" description="Bagian yang paling sering dipakai admin.">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { href: "/transactions/pending", label: "Verifikasi bayar", desc: "Cek pembayaran masuk", icon: "orders" },
              { href: "/products", label: "Kelola produk", desc: "Harga, stok, gambar", icon: "box" },
              { href: "/inventory/dashboard", label: "Dashboard stok", desc: "Pantau stok kritis", icon: "stock" },
              { href: "/kasir-akun", label: "Akun kasir", desc: "Kelola operator", icon: "users" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg border border-ink/10 px-4 py-3 transition-colors hover:bg-ink/5"
              >
                <Icon name={item.icon} className="h-5 w-5 shrink-0 text-brand" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">{item.label}</span>
                  <span className="block text-xs text-ink-muted">{item.desc}</span>
                </span>
              </a>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}