import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { EmptyState } from "@/components/empty-state";
import { Icon } from "@/components/icon";
import { PickupCode } from "@/components/pickup-code";
import { Flash } from "@/components/flash";
import { rupiah, paymentLabel, formatDateTime } from "@/lib/format";
import { verifyAction, rejectAction } from "@/lib/transaction-admin-actions";

export default async function PendingTransactionsPage() {
  await requireRole("admin");

  const orders = await db.transactions.findMany({
    where: { status: "pending" },
    orderBy: { created_at: "asc" },
    include: {
      users: { select: { name: true, email: true } },
      transaction_items: { include: { products: true } },
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Verifikasi pembayaran</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Transaksi yang menunggu konfirmasi pembayaran.
        </p>
      </div>

      <Flash />

      {orders.length === 0 ? (
        <EmptyState
          title="Tidak ada yang perlu diverifikasi"
          description="Semua pembayaran sudah diproses."
          icon="check-circle"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <section
              key={order.id}
              className="rounded-xl border border-ink/10 bg-surface-raised p-4 md:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-ink">Pesanan #{order.id}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {order.users.name} · {order.users.email}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {formatDateTime(order.created_at)} · {paymentLabel(order.payment_method)}
                  </p>
                </div>
                <div className="text-right">
                  <PickupCode code={order.pickup_code ?? "------"} size="sm" />
                  <p className="tabular mt-2 text-lg font-extrabold text-brand">
                    Rp {rupiah(order.total_price)}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-1.5 rounded-lg bg-surface-sunken p-3">
                {order.transaction_items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-3 text-sm">
                    <span className="text-ink-muted">
                      {item.quantity} × {item.products.name}
                    </span>
                    <span className="tabular font-medium text-ink">{rupiah(item.subtotal)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex gap-2">
                <form action={verifyAction.bind(null, String(order.id))}>
                  <button type="submit" className="btn btn-brand btn-sm">
                    <Icon name="check" className="h-4 w-4" />
                    Verifikasi
                  </button>
                </form>
                <form action={rejectAction.bind(null, String(order.id))}>
                  <button type="submit" className="btn btn-outline btn-sm">
                    <Icon name="x-circle" className="h-4 w-4" />
                    Tolak
                  </button>
                </form>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}