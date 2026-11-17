import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { EmptyState } from "@/components/empty-state";
import { Chip } from "@/components/chip";
import { Icon } from "@/components/icon";
import { rupiah, statusLabel, paymentLabel, formatDateTime } from "@/lib/format";

export default async function RiwayatPage() {
  const user = await requireRole("user");

  const orders = await db.transactions.findMany({
    where: {
      user_id: BigInt(user.id),
      status: { in: ["selesai", "batal"] },
    },
    orderBy: { created_at: "desc" },
    include: { transaction_items: { include: { products: true } } },
  });

  const totalSelesai = orders
    .filter((o) => o.status === "selesai")
    .reduce((sum, o) => sum + o.total_price, 0);
  const countSelesai = orders.filter((o) => o.status === "selesai").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Riwayat belanja</h2>
          <p className="mt-1 text-sm text-ink-muted">Semua transaksi kamu yang sudah selesai atau dibatalkan.</p>
        </div>
        {countSelesai > 0 ? (
          <div className="rounded-lg border border-ink/10 bg-surface-raised px-4 py-2.5">
            <p className="text-xs text-ink-muted">{countSelesai} transaksi selesai</p>
            <p className="tabular text-base font-extrabold text-brand">Rp {rupiah(totalSelesai)}</p>
          </div>
        ) : null}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="Belum ada riwayat"
          description="Transaksi yang sudah selesai akan tersimpan di sini."
          icon="receipt"
          action={
            <a href="/pembelian" className="btn btn-brand btn-sm">
              <Icon name="cart" className="h-4 w-4" />
              Mulai belanja
            </a>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-ink/10 bg-surface-raised">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="table-head border-b border-ink/10 bg-surface-sunken">
                <tr>
                  <th className="px-4 py-3">Pesanan</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Bayar</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-ink/[0.02]">
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink">#{order.id}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                      {formatDateTime(order.created_at)}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {order.transaction_items.length} produk
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                      {paymentLabel(order.payment_method)}
                    </td>
                    <td className="px-4 py-3">
                      <Chip tone={order.status === "selesai" ? "ok" : "danger"}>
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