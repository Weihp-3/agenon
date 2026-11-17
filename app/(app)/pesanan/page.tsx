import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { EmptyState } from "@/components/empty-state";
import { PickupCode } from "@/components/pickup-code";
import { Chip } from "@/components/chip";
import { Icon } from "@/components/icon";
import { rupiah, statusLabel, paymentLabel, formatDateTime } from "@/lib/format";
import { Flash } from "@/components/flash";

export default async function PesananPage() {
  const user = await requireRole("user");

  const orders = await db.transactions.findMany({
    where: {
      user_id: BigInt(user.id),
      status: { in: ["menunggu", "siap"] },
    },
    orderBy: { created_at: "desc" },
    include: { transaction_items: { include: { products: true } } },
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-ink">Pesanan saya</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Lacak pesanan yang menunggu disiapkan dan yang siap diambil.
        </p>
      </div>

      <Flash />

      {orders.length === 0 ? (
        <EmptyState
          title="Belum ada pesanan aktif"
          description="Pesanan yang sedang diproses akan muncul di sini. Yuk, mulai belanja."
          icon="orders"
          action={
            <a href="/pembelian" className="btn btn-brand btn-sm">
              <Icon name="cart" className="h-4 w-4" />
              Belanja produk
            </a>
          }
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
                  <p className="text-xs text-ink-muted">Pesanan #{order.id}</p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {formatDateTime(order.created_at)}
                  </p>
                </div>
                <Chip
                  tone={
                    order.status === "siap"
                      ? "ok"
                      : order.status === "menunggu"
                        ? "warn"
                        : "neutral"
                  }
                  icon={order.status === "siap" ? "check-circle" : "clock"}
                >
                  {statusLabel(order.status)}
                </Chip>
              </div>

              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-surface-sunken p-4">
                <PickupCode code={order.pickup_code ?? "------"} size="lg" />
                <div className="sm:text-right">
                  <p className="text-xs text-ink-muted">
                    {order.status === "siap" ? "Sudah bisa diambil di kasir" : "Masih disiapkan kasir"}
                  </p>
                  <p className="tabular mt-0.5 text-lg font-extrabold text-brand">
                    Rp {rupiah(order.total_price)}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-2">
                {order.transaction_items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-ink-muted">
                      {item.quantity} × {item.products.name}
                    </span>
                    <span className="tabular font-semibold text-ink">
                      {rupiah(item.subtotal)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center gap-4 border-t border-ink/10 pt-3 text-xs text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <Icon name="card" className="h-4 w-4" />
                  {paymentLabel(order.payment_method)}
                </span>
                {order.customer_name ? (
                  <span className="flex items-center gap-1.5">
                    <Icon name="user" className="h-4 w-4" />
                    {order.customer_name}
                  </span>
                ) : null}
                {order.ready_at ? (
                  <span className="flex items-center gap-1.5">
                    <Icon name="check" className="h-4 w-4" />
                    Siap {formatDateTime(order.ready_at)}
                  </span>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}