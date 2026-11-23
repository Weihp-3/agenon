import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { EmptyState } from "@/components/empty-state";
import { Chip } from "@/components/chip";
import { rupiah, statusLabel, paymentLabel, formatDateTime } from "@/lib/format";

export default async function KasirRiwayatPage() {
  const user = await requireRole("kasir");

  const orders = await db.orm.public.transactions
    .where({ user_id: BigInt(user.id) })
    .orderBy((t) => t.created_at.desc())
    .limit(100)
    .include("transaction_items")
    .all();

  const total = orders
    .filter((o) => o.status === "selesai")
    .reduce((sum, o) => sum + o.total_price, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Riwayat transaksi</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Transaksi yang kamu proses sebagai kasir.
          </p>
        </div>
        <div className="rounded-lg border border-ink/10 bg-surface-raised px-4 py-2.5">
          <p className="text-xs text-ink-muted">Total penjualan</p>
          <p className="tabular text-base font-extrabold text-brand">Rp {rupiah(total)}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="Belum ada transaksi"
          description="Transaksi yang kamu proses akan muncul di sini."
          icon="receipt"
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink/10 bg-surface-raised">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="table-head border-b border-ink/10 bg-surface-sunken">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-4 py-3">Pelanggan</th>
                  <th className="px-4 py-3">Bayar</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-ink/[0.02]">
                    <td className="px-4 py-3 font-semibold text-ink">#{order.id}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                      {formatDateTime(order.created_at)}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{order.customer_name ?? "-"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                      {paymentLabel(order.payment_method)}
                    </td>
                    <td className="px-4 py-3">
                      <Chip tone={order.status === "selesai" ? "ok" : order.status === "batal" ? "danger" : "warn"}>
                        {statusLabel(order.status)}
                      </Chip>
                    </td>
                    <td className="tabular whitespace-nowrap px-4 py-3 text-right font-semibold text-ink">
                      {rupiah(order.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}